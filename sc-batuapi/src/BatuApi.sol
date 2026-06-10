// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {APICoin} from "./APICoin.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Batu Api — Element Battle on Celo
/// @notice Deposit CELO to mint API Coin, battle the system with elements,
///         win/lose API against a reward pool, and withdraw API back to CELO.
/// @dev Economic invariant: totalSupply(API) == address(this).balance * RATE.
///      Tokens are only minted against deposited/funded CELO and burned on
///      withdrawal, so every API is always redeemable 1000 API -> 1 CELO.
///
///      ADMINLESS BY DESIGN. There is no owner of this contract. The reward pool
///      is permissionless: anyone may seed it via {fundPool} (or the payable
///      constructor), and CELO that lands here unbacked can be folded into the
///      pool by anyone via {syncExcessCelo}. No address can withdraw pool funds —
///      they only flow back out to players who win. `minBet` is immutable.
///
///      Reward scheme: Reward Pool (README Opsi 3) with a small house edge. A win
///      pays WIN_NUM/WIN_DEN x the bet from the pool; a loss leaves the bet in the
///      pool; a draw returns the bet. With the fair element rules below, this gives
///      the pool a slight positive drift so it self-sustains after the initial seed.
///      Battles never change totalSupply or CELO, so the backing invariant holds.
///
///      Solvency: `reservedPayout` reserves, for every committed-but-unrevealed
///      battle, its full potential payout, so the pool can always pay every
///      pending win (enforced at commit; proven to hold across reveal/forfeit).
///
///      Fairness: battles use a COMMIT–REVEAL scheme bound to a FUTURE block hash
///      and a player-supplied secret (see {commitBattle} / {revealBattle}). The
///      system element cannot be predicted by the player (future blockhash is
///      unknown at commit) nor steered by a validator (the element and secret are
///      hidden in the commit), which fixes the predictable single-transaction
///      randomness used by earlier MVP builds.
contract BatuApi is ReentrancyGuard {
    /// @notice Conversion rate: 1 CELO (1e18 wei) = 1000 API (1000e18 base units).
    uint256 public constant RATE = 1000;

    /// @notice Win payout multiplier as a fraction WIN_NUM/WIN_DEN (1.95x).
    ///         The <2x gap is the house edge that keeps the pool sustainable.
    uint256 public constant WIN_NUM = 195;
    uint256 public constant WIN_DEN = 100;

    /// @notice Blocks after the target block during which its blockhash stays
    ///         available on-chain (EVM keeps the last 256 block hashes).
    uint256 public constant REVEAL_WINDOW = 256;

    /// @notice The API Coin token. BatuApi is its owner (sole mint/burn authority).
    APICoin public immutable apiCoin;

    /// @notice Minimum API bet allowed per battle. Immutable; set at deploy.
    uint256 public immutable minBet;

    /// @notice Sum of the full potential payouts of all committed-but-unrevealed
    ///         battles. The pool API balance is kept >= this so every pending win
    ///         is always payable.
    uint256 public reservedPayout;

    /// @notice The four playable elements (README: Batu, Api, Air, Daun).
    enum Element {
        Batu, // 0 — Rock
        Api,  // 1 — Fire
        Air,  // 2 — Water
        Daun  // 3 — Leaf
    }

    /// @notice Battle outcome from the player's perspective.
    enum Outcome {
        Lose, // 0
        Win,  // 1
        Draw  // 2
    }

    /// @notice A committed-but-unrevealed battle. One active battle per player.
    /// @dev The chosen element is NOT stored — it is hidden inside `commitHash`
    ///      and only revealed in {revealBattle}, so a validator cannot target the
    ///      outcome even if the player's secret were to leak.
    struct PendingBattle {
        uint256 bet;
        uint64 commitBlock;
        bool active;
        bytes32 commitHash; // keccak256(abi.encode(player, element, secret))
    }

    /// @notice Active commitment per player.
    mapping(address => PendingBattle) public pendingBattle;

    event Deposited(address indexed user, uint256 celoIn, uint256 apiOut);
    event Withdrawn(address indexed user, uint256 apiIn, uint256 celoOut);
    event PoolFunded(address indexed funder, uint256 celoIn, uint256 apiMinted);
    event BattleCommitted(address indexed player, uint256 bet, uint256 commitBlock);
    event BattleRevealed(
        address indexed player,
        uint256 bet,
        Element playerElement,
        Element systemElement,
        Outcome outcome,
        uint256 payout
    );
    event BattleForfeited(address indexed player, uint256 bet);

    error ZeroAmount();
    error BetBelowMinimum(uint256 bet, uint256 minBet);
    error InsufficientPool(uint256 required, uint256 available);
    error CeloTransferFailed();
    error NothingToWithdraw();
    error ActiveBattleExists();
    error NoActiveBattle();
    error InvalidReveal();
    error RevealTooEarly(uint256 currentBlock, uint256 targetBlock);
    error RevealExpired();
    error NotYetExpired();
    error NoExcessCelo();
    error InvalidMinBet();

    /// @param minBet_ Immutable minimum bet (> 0). Any CELO sent on deploy seeds
    ///        the reward pool (matching API minted to the contract).
    constructor(uint256 minBet_) payable {
        if (minBet_ == 0) revert InvalidMinBet();
        minBet = minBet_;

        // BatuApi deploys and solely owns the API Coin token.
        apiCoin = new APICoin(address(this));

        if (msg.value > 0) {
            uint256 apiMinted = msg.value * RATE;
            apiCoin.mint(address(this), apiMinted);
            emit PoolFunded(msg.sender, msg.value, apiMinted);
        }
    }

    // ---------------------------------------------------------------------
    // Deposit / Withdraw
    // ---------------------------------------------------------------------

    /// @notice Deposit CELO and receive API Coin at 1 CELO = 1000 API.
    function deposit() external payable nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        uint256 apiOut = msg.value * RATE;
        apiCoin.mint(msg.sender, apiOut);
        emit Deposited(msg.sender, msg.value, apiOut);
    }

    /// @notice Burn API Coin and receive CELO at 1000 API = 1 CELO.
    /// @param apiAmount Amount of API (base units) to redeem. Must be at least
    ///        RATE; any sub-RATE dust would map to 0 CELO and is rejected.
    function withdraw(uint256 apiAmount) external nonReentrant {
        if (apiAmount == 0) revert ZeroAmount();
        uint256 celoOut = apiAmount / RATE;
        if (celoOut == 0) revert NothingToWithdraw();

        // Burn exactly the CELO-equivalent API to keep the backing invariant exact.
        uint256 apiBurned = celoOut * RATE;
        apiCoin.burn(msg.sender, apiBurned);

        emit Withdrawn(msg.sender, apiBurned, celoOut);

        (bool ok, ) = msg.sender.call{value: celoOut}("");
        if (!ok) revert CeloTransferFailed();
    }

    // ---------------------------------------------------------------------
    // Battle (commit–reveal)
    // ---------------------------------------------------------------------

    /// @notice Step 1 — commit to a battle. Locks the bet into the pool and
    ///         records a hidden commitment to BOTH the chosen element and a secret.
    ///         The system element is bound to a future block hash at reveal time.
    /// @dev The player must have approved this contract for at least `bet` API.
    ///      `commitHash` MUST equal
    ///      `keccak256(abi.encode(msg.sender, element, secret))`, where `secret`
    ///      is a FRESH, cryptographically-random 32-byte value. Helper: {hashCommit}.
    ///
    ///      SECURITY: use a unique `secret` per battle, never reused — a reused
    ///      secret becomes public once revealed. Hiding the element keeps the
    ///      attack infeasible even on accidental reuse, but fresh secrets remove
    ///      the risk entirely.
    /// @param bet Amount of API to wager.
    /// @param commitHash Commitment to (player, element, secret).
    function commitBattle(uint256 bet, bytes32 commitHash) external nonReentrant {
        if (pendingBattle[msg.sender].active) revert ActiveBattleExists();
        if (bet < minBet) revert BetBelowMinimum(bet, minBet);

        // Solvency: the pool must, after pulling this bet, still cover the full
        // payout of every pending win including this one. The house's marginal
        // liability for this battle is (payout - bet); free house must cover it.
        uint256 pay = _payout(bet);
        uint256 freeHouse = _freeHouse();
        uint256 liability = pay - bet; // pay >= bet since WIN_NUM/WIN_DEN > 1
        if (freeHouse < liability) revert InsufficientPool(liability, freeHouse);

        // Pull the bet into the pool (reverts on insufficient balance/allowance).
        require(
            apiCoin.transferFrom(msg.sender, address(this), bet),
            "API transferFrom failed"
        );
        reservedPayout += pay;

        pendingBattle[msg.sender] = PendingBattle({
            bet: bet,
            commitBlock: uint64(block.number),
            active: true,
            commitHash: commitHash
        });

        emit BattleCommitted(msg.sender, bet, block.number);
    }

    /// @notice Step 2 — reveal element + secret to resolve the battle. Must be
    ///         called after the commit block and within REVEAL_WINDOW blocks of
    ///         the target block, so the target block's hash is still available.
    /// @param element The element committed to in {commitBattle}.
    /// @param secret The 32-byte value committed to in {commitBattle}.
    /// @return outcome The battle result from the player's perspective.
    /// @return systemElement The element the system played.
    function revealBattle(Element element, bytes32 secret)
        external
        nonReentrant
        returns (Outcome outcome, Element systemElement)
    {
        PendingBattle memory p = pendingBattle[msg.sender];
        if (!p.active) revert NoActiveBattle();
        if (keccak256(abi.encode(msg.sender, element, secret)) != p.commitHash) {
            revert InvalidReveal();
        }

        uint256 targetBlock = uint256(p.commitBlock) + 1;
        if (block.number <= targetBlock) revert RevealTooEarly(block.number, targetBlock);
        if (block.number > targetBlock + REVEAL_WINDOW) revert RevealExpired();

        bytes32 bh = blockhash(targetBlock);
        require(bh != bytes32(0), "blockhash unavailable");

        systemElement = Element(
            uint256(keccak256(abi.encode(bh, secret, msg.sender))) % 4
        );
        outcome = _resolve(element, systemElement);

        // Effects before interactions (CEI). Release this battle's reservation.
        delete pendingBattle[msg.sender];
        reservedPayout -= _payout(p.bet);

        uint256 payout;
        if (outcome == Outcome.Win) {
            payout = _payout(p.bet); // WIN_NUM/WIN_DEN x bet, paid from the pool
            require(apiCoin.transfer(msg.sender, payout), "API payout failed");
        } else if (outcome == Outcome.Draw) {
            payout = p.bet; // bet returned untouched
            require(apiCoin.transfer(msg.sender, payout), "API refund failed");
        }
        // Lose: payout stays 0, bet remains in the pool.

        emit BattleRevealed(msg.sender, p.bet, element, systemElement, outcome, payout);
    }

    /// @notice Settle an expired (never-revealed) commitment as a loss: the bet
    ///         stays in the pool and the player is freed to play again.
    /// @dev Callable by anyone once the reveal window has fully elapsed. Treating
    ///      a missed reveal as a loss removes any incentive to selectively skip
    ///      reveals after seeing the block hash.
    /// @param player The player whose expired commitment should be settled.
    function forfeitExpired(address player) external nonReentrant {
        PendingBattle memory p = pendingBattle[player];
        if (!p.active) revert NoActiveBattle();

        uint256 targetBlock = uint256(p.commitBlock) + 1;
        if (block.number <= targetBlock + REVEAL_WINDOW) revert NotYetExpired();

        delete pendingBattle[player];
        reservedPayout -= _payout(p.bet);

        emit BattleForfeited(player, p.bet);
    }

    /// @notice Fair element resolver.
    /// @dev Counter cycle (README): Air>Api>Daun>Batu>Air. The two cross pairs
    ///      (Air<->Daun, Api<->Batu) are DRAWS, so every element wins 1, loses 1,
    ///      and draws 2 — symmetric and fair (25% win / 25% lose / 50% draw vs a
    ///      uniform-random system).
    function _resolve(Element player, Element system) internal pure returns (Outcome) {
        if (player == system) return Outcome.Draw;

        // Wins along the cycle.
        if (
            (player == Element.Air && system == Element.Api) ||
            (player == Element.Api && system == Element.Daun) ||
            (player == Element.Daun && system == Element.Batu) ||
            (player == Element.Batu && system == Element.Air)
        ) {
            return Outcome.Win;
        }

        // Cross pairs neutralize -> draw.
        if (
            (player == Element.Air && system == Element.Daun) ||
            (player == Element.Daun && system == Element.Air) ||
            (player == Element.Api && system == Element.Batu) ||
            (player == Element.Batu && system == Element.Api)
        ) {
            return Outcome.Draw;
        }

        // Remaining: the reverse cycle edges -> player loses.
        return Outcome.Lose;
    }

    /// @dev Full payout for a winning `bet`: bet * WIN_NUM / WIN_DEN (floored,
    ///      which favors the pool and can never over-pay).
    function _payout(uint256 bet) internal pure returns (uint256) {
        return bet * WIN_NUM / WIN_DEN;
    }

    // ---------------------------------------------------------------------
    // Pool funding (permissionless, adminless)
    // ---------------------------------------------------------------------

    /// @notice Seed the reward pool. Anyone may add liquidity: the sent CELO is
    ///         retained and matching API is minted to the contract, keeping the
    ///         pool fully backed. Funds are not withdrawable — they only pay winners.
    function fundPool() external payable nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        uint256 apiMinted = msg.value * RATE;
        apiCoin.mint(address(this), apiMinted);
        emit PoolFunded(msg.sender, msg.value, apiMinted);
    }

    /// @notice Fold any CELO that entered the contract without minting API (e.g.
    ///         force-sent via selfdestruct or a block reward) into the reward pool,
    ///         restoring the exact backing equality. Permissionless.
    function syncExcessCelo() external nonReentrant {
        uint256 backedCelo = apiCoin.totalSupply() / RATE;
        uint256 bal = address(this).balance;
        if (bal <= backedCelo) revert NoExcessCelo();

        uint256 excess = bal - backedCelo;
        uint256 apiMinted = excess * RATE;
        apiCoin.mint(address(this), apiMinted);
        emit PoolFunded(msg.sender, excess, apiMinted);
    }

    // ---------------------------------------------------------------------
    // Views / helpers
    // ---------------------------------------------------------------------

    /// @notice Total API held by the contract (pending bets + free house funds).
    function poolBalance() external view returns (uint256) {
        return apiCoin.balanceOf(address(this));
    }

    /// @notice Free house API available to back a new bet, i.e. contract API
    ///         balance minus the payout reservation for pending battles.
    function availablePool() external view returns (uint256) {
        return _freeHouse();
    }

    /// @dev Free (unreserved) house API: balance - reservedPayout, floored at 0.
    function _freeHouse() internal view returns (uint256) {
        uint256 balance = apiCoin.balanceOf(address(this));
        return balance > reservedPayout ? balance - reservedPayout : 0;
    }

    /// @notice Compute the commitment for a player, element and secret.
    /// @dev OFF-CHAIN USE ONLY. Call this via `eth_call` (it is `pure`) or compute
    ///      `keccak256(abi.encode(player, element, secret))` locally. NEVER send it
    ///      as a transaction: doing so publishes `element` and `secret` in the
    ///      mempool/calldata before {commitBattle} lands, letting a validator grind
    ///      `blockhash(commitBlock+1)` to force a loss.
    function hashCommit(address player, Element element, bytes32 secret)
        external
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(player, element, secret));
    }

    /// @notice Preview the battle result for a given element matchup.
    function previewOutcome(Element player, Element system) external pure returns (Outcome) {
        return _resolve(player, system);
    }
}

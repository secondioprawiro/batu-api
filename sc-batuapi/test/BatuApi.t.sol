// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {BatuApi} from "../src/BatuApi.sol";
import {APICoin} from "../src/APICoin.sol";

contract BatuApiTest is Test {
    BatuApi internal game;
    APICoin internal api;

    address internal house = address(0x5EED); // seeds the pool (no privilege)
    address internal alice = address(0xA);
    address internal bob = address(0xB);

    uint256 internal constant RATE = 1000;

    function setUp() public {
        game = new BatuApi(1); // minBet = 1 wei-API (effectively no floor)
        api = game.apiCoin();

        vm.deal(house, 100 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);

        // Default block.number in forge is 1; ensure a sane non-zero start.
        vm.roll(10);
    }

    // ----------------------------- Deposit -----------------------------

    function test_Deposit_MintsAtRate() public {
        vm.prank(alice);
        game.deposit{value: 1 ether}();
        assertEq(api.balanceOf(alice), 1 ether * RATE);
        assertEq(address(game).balance, 1 ether);
    }

    function test_Deposit_ZeroReverts() public {
        vm.prank(alice);
        vm.expectRevert(BatuApi.ZeroAmount.selector);
        game.deposit{value: 0}();
    }

    // ----------------------------- Withdraw ----------------------------

    function test_Withdraw_BurnsAndReturnsCelo() public {
        vm.prank(alice);
        game.deposit{value: 2 ether}();

        uint256 balBefore = alice.balance;
        vm.prank(alice);
        game.withdraw(2 ether * RATE);

        assertEq(api.balanceOf(alice), 0);
        assertEq(alice.balance, balBefore + 2 ether);
        assertEq(address(game).balance, 0);
    }

    function test_Withdraw_ZeroReverts() public {
        vm.prank(alice);
        vm.expectRevert(BatuApi.ZeroAmount.selector);
        game.withdraw(0);
    }

    function test_Withdraw_DustBelowRateReverts() public {
        vm.prank(alice);
        game.deposit{value: 1 ether}();
        vm.prank(alice);
        vm.expectRevert(BatuApi.NothingToWithdraw.selector);
        game.withdraw(RATE - 1); // < 1000 base units => celoOut == 0
    }

    // --------------------------- Backing invariant ---------------------

    function test_BackingInvariant_AfterDepositWithdraw() public {
        vm.prank(alice);
        game.deposit{value: 3 ether}();
        vm.prank(bob);
        game.deposit{value: 5 ether}();
        _assertBacking();

        vm.prank(alice);
        game.withdraw(1 ether * RATE);
        _assertBacking();
    }

    // ----------------------------- Pool / adminless --------------------

    function test_Constructor_SeedsPoolFromValue() public {
        BatuApi seeded = new BatuApi{value: 2 ether}(1);
        assertEq(seeded.poolBalance(), 2 ether * RATE);
        assertEq(seeded.availablePool(), 2 ether * RATE);
        assertEq(address(seeded).balance, 2 ether);
        assertEq(seeded.apiCoin().totalSupply(), address(seeded).balance * RATE);
    }

    function test_Constructor_ZeroMinBetReverts() public {
        vm.expectRevert(BatuApi.InvalidMinBet.selector);
        new BatuApi(0);
    }

    function test_FundPool_Permissionless() public {
        // Anyone (here: alice) can seed — no owner.
        vm.prank(alice);
        game.fundPool{value: 1 ether}();
        assertEq(game.poolBalance(), 1 ether * RATE);
        assertEq(game.availablePool(), 1 ether * RATE);
        _assertBacking();
    }

    function test_NoAdminSelectors() public {
        // The contract is not Ownable and exposes no privileged controls. Calling
        // any removed admin selector hits no function and (no fallback) reverts.
        (bool s1, ) = address(game).call(abi.encodeWithSignature("owner()"));
        (bool s2, ) = address(game).call(abi.encodeWithSignature("setMinBet(uint256)", uint256(5)));
        (bool s3, ) = address(game).call(abi.encodeWithSignature("withdrawHouse(uint256)", uint256(1)));
        (bool s4, ) = address(game).call(abi.encodeWithSignature("transferOwnership(address)", address(1)));
        (bool s5, ) = address(game).call(abi.encodeWithSignature("renounceOwnership()"));
        assertFalse(s1, "owner() must not exist");
        assertFalse(s2, "setMinBet must not exist");
        assertFalse(s3, "withdrawHouse must not exist");
        assertFalse(s4, "transferOwnership must not exist");
        assertFalse(s5, "renounceOwnership must not exist");

        // Plain CELO transfer is rejected (no receive/fallback) — funds only enter
        // via deposit()/fundPool()/constructor. Fund this contract so the failure
        // is due to the missing receive(), not insufficient balance.
        vm.deal(address(this), 1 ether);
        (bool s6, ) = address(game).call{value: 1 ether}("");
        assertFalse(s6, "no receive(): bare CELO transfer must revert");

        assertEq(game.minBet(), 1); // immutable, set at deploy
    }

    // --------------------------- Sync stray CELO -----------------------

    function test_SyncExcessCelo_FoldsIntoPool() public {
        vm.prank(house);
        game.fundPool{value: 1 ether}(); // backed: 1000 API, 1 CELO

        // Simulate a force-sent (unbacked) 2 CELO.
        vm.deal(address(game), address(game).balance + 2 ether);

        game.syncExcessCelo(); // anyone can call

        assertEq(game.poolBalance(), 3 ether * RATE); // 3000 API now in pool
        assertEq(address(game).balance, 3 ether);
        _assertBacking();
    }

    function test_SyncExcessCelo_NoExcessReverts() public {
        vm.prank(house);
        game.fundPool{value: 1 ether}();
        vm.expectRevert(BatuApi.NoExcessCelo.selector);
        game.syncExcessCelo();
    }

    // ----------------------------- Commit ------------------------------

    function _prepBattler(address who, uint256 celo) internal returns (uint256 apiBal) {
        vm.prank(who);
        game.deposit{value: celo}();
        apiBal = api.balanceOf(who);
        vm.prank(who);
        api.approve(address(game), type(uint256).max);
    }

    /// @dev Commit with a precomputed hash (avoids the prank being consumed by an
    ///      inline hashCommit() call evaluated as an argument).
    function _commit(address who, BatuApi.Element element, uint256 bet, bytes32 secret) internal {
        bytes32 h = game.hashCommit(who, element, secret);
        vm.prank(who);
        game.commitBattle(bet, h);
    }

    function test_Commit_LocksReservationAndStores() public {
        vm.prank(house);
        game.fundPool{value: 10 ether}();
        _prepBattler(alice, 1 ether);

        uint256 bet = 100 ether;
        _commit(alice, BatuApi.Element.Air, bet, keccak256("s"));

        (uint256 b,, bool active,) = game.pendingBattle(alice);
        assertEq(b, bet);
        assertTrue(active);
        assertEq(game.reservedPayout(), bet * 195 / 100); // 195 API reserved
        assertEq(api.balanceOf(alice), 1000 ether - bet);
    }

    function test_Commit_DoubleReverts() public {
        vm.prank(house);
        game.fundPool{value: 10 ether}();
        _prepBattler(alice, 1 ether);

        _commit(alice, BatuApi.Element.Air, 100 ether, keccak256("s"));
        bytes32 h2 = game.hashCommit(alice, BatuApi.Element.Api, keccak256("s2"));
        vm.prank(alice);
        vm.expectRevert(BatuApi.ActiveBattleExists.selector);
        game.commitBattle(100 ether, h2);
    }

    function test_Commit_BelowMinBetReverts() public {
        // Fresh contract with a high immutable minBet; minBet check precedes any
        // pool/allowance work, so no funding is needed to trigger it.
        BatuApi g = new BatuApi(10 ether);
        bytes32 h = g.hashCommit(alice, BatuApi.Element.Air, keccak256("s"));
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(BatuApi.BetBelowMinimum.selector, 1 ether, 10 ether)
        );
        g.commitBattle(1 ether, h);
    }

    function test_Commit_InsufficientPoolReverts() public {
        // No pool seeded => free house 0; liability for a 100-API bet is 95 API.
        _prepBattler(alice, 1 ether);
        bytes32 h = game.hashCommit(alice, BatuApi.Element.Air, keccak256("s"));
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(BatuApi.InsufficientPool.selector, 95 ether, 0)
        );
        game.commitBattle(100 ether, h);
    }

    // ----------------------------- Reveal ------------------------------

    function test_Reveal_TooEarlyReverts() public {
        vm.prank(house);
        game.fundPool{value: 10 ether}();
        _prepBattler(alice, 1 ether);

        bytes32 secret = keccak256("s");
        uint256 commitBlock = block.number;
        _commit(alice, BatuApi.Element.Air, 100 ether, secret);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(BatuApi.RevealTooEarly.selector, commitBlock, commitBlock + 1)
        );
        game.revealBattle(BatuApi.Element.Air, secret);
    }

    function test_Reveal_WrongSecretReverts() public {
        vm.prank(house);
        game.fundPool{value: 10 ether}();
        _prepBattler(alice, 1 ether);

        _commit(alice, BatuApi.Element.Air, 100 ether, keccak256("right"));
        vm.roll(block.number + 2);

        vm.prank(alice);
        vm.expectRevert(BatuApi.InvalidReveal.selector);
        game.revealBattle(BatuApi.Element.Air, keccak256("wrong"));
    }

    function test_Reveal_WrongElementReverts() public {
        vm.prank(house);
        game.fundPool{value: 10 ether}();
        _prepBattler(alice, 1 ether);

        _commit(alice, BatuApi.Element.Air, 100 ether, keccak256("s"));
        vm.roll(block.number + 2);

        vm.prank(alice);
        vm.expectRevert(BatuApi.InvalidReveal.selector);
        game.revealBattle(BatuApi.Element.Api, keccak256("s"));
    }

    function test_Reveal_NoActiveReverts() public {
        vm.prank(alice);
        vm.expectRevert(BatuApi.NoActiveBattle.selector);
        game.revealBattle(BatuApi.Element.Air, keccak256("s"));
    }

    function test_Reveal_ExpiredReverts() public {
        vm.prank(house);
        game.fundPool{value: 10 ether}();
        _prepBattler(alice, 1 ether);

        bytes32 secret = keccak256("s");
        _commit(alice, BatuApi.Element.Air, 100 ether, secret);

        vm.roll(block.number + 2 + game.REVEAL_WINDOW()); // past the window
        vm.prank(alice);
        vm.expectRevert(BatuApi.RevealExpired.selector);
        game.revealBattle(BatuApi.Element.Air, secret);
    }

    // --------------------------- Forfeit -------------------------------

    function test_ForfeitExpired_SettlesAsLoss() public {
        vm.prank(house);
        game.fundPool{value: 10 ether}();
        uint256 startApi = _prepBattler(alice, 1 ether);

        uint256 bet = 100 ether;
        _commit(alice, BatuApi.Element.Air, bet, keccak256("s"));

        uint256 poolAfterCommit = game.poolBalance();

        vm.roll(block.number + 2 + game.REVEAL_WINDOW());
        game.forfeitExpired(alice); // anyone can call

        (, , bool active, ) = game.pendingBattle(alice);
        assertFalse(active);
        assertEq(game.reservedPayout(), 0);
        assertEq(api.balanceOf(alice), startApi - bet); // bet lost
        assertEq(game.poolBalance(), poolAfterCommit);  // bet stays in pool
        _assertBacking();
    }

    function test_ForfeitExpired_NotYetReverts() public {
        vm.prank(house);
        game.fundPool{value: 10 ether}();
        _prepBattler(alice, 1 ether);

        _commit(alice, BatuApi.Element.Air, 100 ether, keccak256("s"));
        vm.roll(block.number + 2); // within window
        vm.expectRevert(BatuApi.NotYetExpired.selector);
        game.forfeitExpired(alice);
    }

    // ---------------------- Full commit-reveal outcomes ----------------

    function test_Battle_Win_Pays195x() public {
        vm.prank(house);
        game.fundPool{value: 10 ether}();
        uint256 startApi = _prepBattler(alice, 1 ether);
        uint256 bet = 100 ether;
        uint256 poolBefore = game.poolBalance();

        BatuApi.Outcome got = _battle(alice, bet, BatuApi.Outcome.Win);
        assertEq(uint8(got), uint8(BatuApi.Outcome.Win));

        uint256 net = bet * 195 / 100 - bet; // +95 API
        assertEq(api.balanceOf(alice), startApi + net);
        assertEq(game.poolBalance(), poolBefore - net);
        assertEq(game.reservedPayout(), 0);
        _assertBacking();
    }

    function test_Battle_Lose_BetToPool() public {
        vm.prank(house);
        game.fundPool{value: 10 ether}();
        uint256 startApi = _prepBattler(alice, 1 ether);
        uint256 bet = 100 ether;
        uint256 poolBefore = game.poolBalance();

        BatuApi.Outcome got = _battle(alice, bet, BatuApi.Outcome.Lose);
        assertEq(uint8(got), uint8(BatuApi.Outcome.Lose));

        assertEq(api.balanceOf(alice), startApi - bet);
        assertEq(game.poolBalance(), poolBefore + bet);
        assertEq(game.reservedPayout(), 0);
        _assertBacking();
    }

    function test_Battle_Draw_ReturnsBet() public {
        vm.prank(house);
        game.fundPool{value: 10 ether}();
        uint256 startApi = _prepBattler(alice, 1 ether);
        uint256 bet = 100 ether;
        uint256 poolBefore = game.poolBalance();

        BatuApi.Outcome got = _battle(alice, bet, BatuApi.Outcome.Draw);
        assertEq(uint8(got), uint8(BatuApi.Outcome.Draw));

        assertEq(api.balanceOf(alice), startApi); // unchanged
        assertEq(game.poolBalance(), poolBefore); // unchanged
        assertEq(game.reservedPayout(), 0);
        _assertBacking();
    }

    // --------------------------- Solvency ------------------------------

    function test_Solvency_ReservesForConcurrentWins() public {
        // Free house must cover each bet's house liability (bet*95/100 = 95 API).
        // Seed exactly 190 API so two 100-API bets fit and a third does not.
        vm.prank(house);
        game.fundPool{value: 0.19 ether}(); // 190 API house
        _prepBattler(alice, 1 ether);
        _prepBattler(bob, 1 ether);

        uint256 bet = 100 ether;

        _commit(alice, BatuApi.Element.Air, bet, keccak256("a"));
        _commit(bob, BatuApi.Element.Api, bet, keccak256("b"));

        assertEq(game.reservedPayout(), 2 * (bet * 195 / 100)); // 390 API
        assertEq(game.availablePool(), 0); // fully reserved

        address carol = address(0xC);
        vm.deal(carol, 100 ether);
        _prepBattler(carol, 1 ether);
        bytes32 hc = game.hashCommit(carol, BatuApi.Element.Air, keccak256("c"));
        vm.prank(carol);
        vm.expectRevert(
            abi.encodeWithSelector(BatuApi.InsufficientPool.selector, 95 ether, 0)
        );
        game.commitBattle(bet, hc);
    }

    // --------------------------- Element rules -------------------------

    function test_Resolve_AllMatchups() public view {
        BatuApi.Element B = BatuApi.Element.Batu;
        BatuApi.Element A = BatuApi.Element.Api;
        BatuApi.Element W = BatuApi.Element.Air;
        BatuApi.Element D = BatuApi.Element.Daun;

        // Cycle wins.
        assertEq(uint8(game.previewOutcome(W, A)), uint8(BatuApi.Outcome.Win)); // Air > Api
        assertEq(uint8(game.previewOutcome(A, D)), uint8(BatuApi.Outcome.Win)); // Api > Daun
        assertEq(uint8(game.previewOutcome(D, B)), uint8(BatuApi.Outcome.Win)); // Daun > Batu
        assertEq(uint8(game.previewOutcome(B, W)), uint8(BatuApi.Outcome.Win)); // Batu > Air

        // Reverse cycle = losses.
        assertEq(uint8(game.previewOutcome(A, W)), uint8(BatuApi.Outcome.Lose));
        assertEq(uint8(game.previewOutcome(D, A)), uint8(BatuApi.Outcome.Lose));
        assertEq(uint8(game.previewOutcome(B, D)), uint8(BatuApi.Outcome.Lose));
        assertEq(uint8(game.previewOutcome(W, B)), uint8(BatuApi.Outcome.Lose));

        // Same element = draw.
        assertEq(uint8(game.previewOutcome(B, B)), uint8(BatuApi.Outcome.Draw));
        assertEq(uint8(game.previewOutcome(A, A)), uint8(BatuApi.Outcome.Draw));
        assertEq(uint8(game.previewOutcome(W, W)), uint8(BatuApi.Outcome.Draw));
        assertEq(uint8(game.previewOutcome(D, D)), uint8(BatuApi.Outcome.Draw));

        // Cross pairs neutralize = draw (the fairness fix).
        assertEq(uint8(game.previewOutcome(W, D)), uint8(BatuApi.Outcome.Draw)); // Air <-> Daun
        assertEq(uint8(game.previewOutcome(D, W)), uint8(BatuApi.Outcome.Draw));
        assertEq(uint8(game.previewOutcome(A, B)), uint8(BatuApi.Outcome.Draw)); // Api <-> Batu
        assertEq(uint8(game.previewOutcome(B, A)), uint8(BatuApi.Outcome.Draw));
    }

    /// @dev Every element must win exactly 1, lose exactly 1, draw exactly 2 of
    ///      the four possible system picks — the symmetry that makes it fair.
    function test_Resolve_FairSymmetry() public view {
        for (uint8 p = 0; p < 4; p++) {
            uint256 wins;
            uint256 losses;
            uint256 draws;
            for (uint8 s = 0; s < 4; s++) {
                BatuApi.Outcome o = game.previewOutcome(BatuApi.Element(p), BatuApi.Element(s));
                if (o == BatuApi.Outcome.Win) wins++;
                else if (o == BatuApi.Outcome.Lose) losses++;
                else draws++;
            }
            assertEq(wins, 1, "each element wins exactly 1");
            assertEq(losses, 1, "each element loses exactly 1");
            assertEq(draws, 2, "each element draws exactly 2");
        }
    }

    // ------------------------------ Helpers ----------------------------

    /// @dev Backing invariant: every API in existence is backed by CELO at RATE.
    function _assertBacking() internal view {
        assertEq(api.totalSupply(), address(game).balance * RATE, "backing broken");
    }

    /// @dev Run a full commit->reveal cycle that deterministically yields `want`.
    ///      In the Foundry EVM the future blockhash is a pure function of block
    ///      number, so we can predict it, choose the player element accordingly,
    ///      then commit & reveal. On a real chain the blockhash is unknowable at
    ///      commit time, which is exactly what makes the scheme fair.
    function _battle(address who, uint256 bet, BatuApi.Outcome want)
        internal
        returns (BatuApi.Outcome got)
    {
        uint256 commitBlock = block.number;
        uint256 targetBlock = commitBlock + 1;
        bytes32 secret = keccak256(abi.encode("secret", who, commitBlock));

        bytes32 bh = _predictBlockhash(targetBlock); // restores block.number
        BatuApi.Element system = _systemFor(bh, secret, who);
        BatuApi.Element player = _elementFor(system, want);

        _commit(who, player, bet, secret);

        vm.roll(targetBlock + 1);
        vm.prank(who);
        (got, ) = game.revealBattle(player, secret);
    }

    /// @dev Read the (deterministic) blockhash of a future block, then restore.
    function _predictBlockhash(uint256 targetBlock) internal returns (bytes32 bh) {
        uint256 cur = block.number;
        vm.roll(targetBlock + 1);
        bh = blockhash(targetBlock);
        vm.roll(cur);
    }

    /// @dev Mirror of BatuApi's system-element derivation.
    function _systemFor(bytes32 bh, bytes32 secret, address who)
        internal
        pure
        returns (BatuApi.Element)
    {
        return BatuApi.Element(uint256(keccak256(abi.encode(bh, secret, who))) % 4);
    }

    /// @dev Pick the player element that yields `want` against `system`.
    function _elementFor(BatuApi.Element system, BatuApi.Outcome want)
        internal
        pure
        returns (BatuApi.Element)
    {
        if (want == BatuApi.Outcome.Draw) return system;
        if (want == BatuApi.Outcome.Win) return _winnerOver(system);
        return _loserTo(system);
    }

    /// @dev Element that BEATS `system` (Air>Api, Api>Daun, Daun>Batu, Batu>Air).
    function _winnerOver(BatuApi.Element system) internal pure returns (BatuApi.Element) {
        if (system == BatuApi.Element.Api) return BatuApi.Element.Air;
        if (system == BatuApi.Element.Daun) return BatuApi.Element.Api;
        if (system == BatuApi.Element.Batu) return BatuApi.Element.Daun;
        return BatuApi.Element.Batu; // system == Air
    }

    /// @dev Element that LOSES to `system` (the one `system` beats).
    function _loserTo(BatuApi.Element system) internal pure returns (BatuApi.Element) {
        if (system == BatuApi.Element.Air) return BatuApi.Element.Api;
        if (system == BatuApi.Element.Api) return BatuApi.Element.Daun;
        if (system == BatuApi.Element.Daun) return BatuApi.Element.Batu;
        return BatuApi.Element.Air; // system == Batu
    }
}

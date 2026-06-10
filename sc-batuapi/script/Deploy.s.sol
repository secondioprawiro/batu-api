// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {BatuApi} from "../src/BatuApi.sol";

/// @notice Deploys BatuApi (which deploys & owns APICoin). The contract is
///         adminless; any CELO passed at construction seeds the (permissionless,
///         non-withdrawable) reward pool.
///
/// Env vars:
///   PRIVATE_KEY     deployer key
///   MIN_BET         immutable minimum bet in API base units (default 1e18 = 1 API)
///   POOL_SEED_CELO  optional CELO (wei) to seed the reward pool at deploy (default 0)
///
/// Example (Celo Alfajores testnet):
///   MIN_BET=1000000000000000000 POOL_SEED_CELO=100000000000000000 \
///   forge script script/Deploy.s.sol:Deploy --rpc-url celo_alfajores --broadcast
contract Deploy is Script {
    function run() external returns (BatuApi game) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        uint256 minBet = vm.envOr("MIN_BET", uint256(1 ether));
        uint256 poolSeed = vm.envOr("POOL_SEED_CELO", uint256(0));

        vm.startBroadcast(pk);
        game = new BatuApi{value: poolSeed}(minBet);
        vm.stopBroadcast();

        console2.log("BatuApi deployed at:", address(game));
        console2.log("APICoin deployed at:", address(game.apiCoin()));
        console2.log("minBet (API base units):", minBet);
        console2.log("Pool seeded (wei CELO):", poolSeed);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title API Coin
/// @notice In-game token for Batu Api. 1 CELO = 1000 API.
/// @dev Mint/burn rights are held exclusively by the owner, which is meant to
///      be the BatuApi game contract. Every API in circulation is backed 1:1000
///      by CELO held inside the game contract, because tokens are only minted on
///      CELO deposit (or owner pool funding) and burned on CELO withdrawal.
contract APICoin is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("API Coin", "API")
        Ownable(initialOwner)
    {}

    /// @notice Mint `amount` API tokens to `to`. Owner-only (BatuApi game contract).
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn `amount` API tokens from `from`. Owner-only (BatuApi game contract).
    /// @dev No allowance is required: the owning game contract is trusted and only
    ///      burns tokens it has already pulled in (deposit/withdraw/battle flows).
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

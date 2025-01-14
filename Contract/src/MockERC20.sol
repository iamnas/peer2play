// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(address _addr) ERC20("MockERC20", "MTK") {
        _mint(_addr, 1e9 * 10 ** decimals());
    }
}

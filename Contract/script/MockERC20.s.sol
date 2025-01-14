// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {Mock2ERC20} from "../src/Mock2ERC20.sol";

contract CounterScript is Script {
    MockERC20 public mockERC20;
    Mock2ERC20 public mock2ERC20;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        mockERC20 = new MockERC20();
        mock2ERC20 = new Mock2ERC20();

        vm.stopBroadcast();
    }
}

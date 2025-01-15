// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PoolFactory} from "../src/PoolFactory.sol";
import {PoolRouter} from "../src/PoolRouter.sol";

contract PoolScript is Script {
    PoolFactory public factory;
    PoolRouter public router;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        factory = new PoolFactory();
        router = new PoolRouter(address(factory));

        vm.stopBroadcast();
    }
}

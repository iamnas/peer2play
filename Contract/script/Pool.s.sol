// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PoolFactory} from "../src/PoolFactory.sol";
import {PoolRouter} from "../src/PoolRouter.sol";

contract PoolScript is Script {
    // PoolFactory public factory;
    PoolRouter public router;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // factory = new PoolFactory();
        address fac = address(0x9f38A0283aE61aCb94DE5Ee5De3E4Ae02d9c3dC1);
        router = new PoolRouter(fac);

        vm.stopBroadcast();
    }
}

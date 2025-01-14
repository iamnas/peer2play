 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract MyTokenTest is Test {
    MockERC20 public token;

    function setUp() public {

        token = new MockERC20();
    }

     function testTotalSupply() public view { 
        
        assertEq(1e9*10**token.decimals(), token.totalSupply());
        assertEq(18,token.decimals());
    }


    function testOwnerBalance() public view {
        assertEq(token.balanceOf(address(this)), token.totalSupply());
    }
}

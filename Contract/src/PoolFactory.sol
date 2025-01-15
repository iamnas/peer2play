// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IFactory} from "./interfaces/IFactory.sol";
import {IPair} from "./interfaces/IPair.sol";
import {Pair} from "./Pair.sol";

contract PoolFactory is IFactory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    function createPair(address tokenA, address tokenB) external override returns (address pair) {
        require(tokenA != tokenB, "Factory: IDENTICAL_ADDRESSES");
        require(getPair[tokenA][tokenB] == address(0), "Factory: PAIR_EXISTS");

        bytes memory bytecode = type(Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(tokenA, tokenB));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IPair(pair).initialize(tokenA, tokenB);

        getPair[tokenA][tokenB] = pair;
        getPair[tokenB][tokenA] = pair; // Populate reverse mapping
        allPairs.push(pair);

        emit PairCreated(tokenA, tokenB, pair, allPairs.length);
    }
}

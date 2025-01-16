// hooks/useRemoveLiquidity.ts
import { useState, useCallback } from 'react';
// import {
//     useWriteContract,
//     // useReadContract,
//     // useSimulateContract,
//     //   Address, 
//     //   erc20Abi 
// } from 'wagmi';
// import { POOL_ROUTER_ADDRESS, ROUTER_ABI, FACTORY_ADDRESS, FACTORY_ABI } from '../utils/contracts';
// import { Address, erc20Abi } from 'viem';

type Status = 'idle' | 'approving' | 'removing';

export function useRemoveLiquidity() {
    const [status, setStatus] = useState<Status>('idle');

    // const { writeContractAsync: writeRouter } = useWriteContract();
    // const { writeContractAsync: writeToken } = useWriteContract();

    // Get pair address from factory
    // const getPairAddress = async () => {
    //     // const { refetch: readFactoryContract } = useReadContract({
    //     //     address: FACTORY_ADDRESS as Address,
    //     //     abi: FACTORY_ABI,
    //     //     functionName: 'getPair',
    //     //     args: [tokenA, tokenB],
    //     // });
    //     return 'data' as Address;
    // };

    // const readFactoryContract = await readFactoryContract();

    // Get LP token balance
    const getLPBalance = async () => {
        try {
            // const pairAddress = await getPairAddress(tokenA, tokenB);
            // const balance = await useReadContract({
            //     address: pairAddress,
            //     abi: erc20Abi,
            //     functionName: 'balanceOf',
            //     args: [tokenA],
            // });

            // return "0" as bigint;
        } catch (error) {
            console.error('Error getting LP balance:', error);
            return BigInt(0);
        }
    };

    // Get preview amounts
    const getLiquidityPreview = async (
        // tokenA: Address,
        // tokenB: Address,
        // lpAmount: bigint
    ) => {
        try {
            // const pairAddress = await getPairAddress(tokenA, tokenB);

            // Get reserves
            // const { reserve0, reserve1 } = await useReadContract({
            //     address: pairAddress,
            //     abi: PAIR_ABI,
            //     functionName: 'getReserves',
            // });

            // // Get total supply
            // const totalSupply = await useReadContract({
            //     address: pairAddress,
            //     abi: PAIR_ABI,
            //     functionName: 'totalSupply',
            // });

            // Calculate amounts
            // const amount0 = (lpAmount * reserve0) / totalSupply;
            // const amount1 = (lpAmount * reserve1) / totalSupply;

            // return [amount0, amount1] as [bigint, bigint];
        } catch (error) {
            console.error('Error getting liquidity preview:', error);
            return [BigInt(0), BigInt(0)];
        }
    };

    // Approve LP tokens
    // const approveLPTokens = async (
    //     // pairAddress: Address,
    //     // amount: bigint
    // ) => {
    //     try {
    //         setStatus('approving');

    //         // // Check current allowance
    //         // const allowance = await useReadContract({
    //         //     address: pairAddress,
    //         //     abi: erc20Abi,
    //         //     functionName: 'allowance',
    //         //     args: [pairAddress, POOL_ROUTER_ADDRESS],
    //         // });

    //         // if (allowance >= amount) {
    //         //     return;
    //         // }

    //         // // Approve if needed
    //         // await writeToken({
    //         //     address: pairAddress,
    //         //     abi: erc20Abi,
    //         //     functionName: 'approve',
    //         //     args: [POOL_ROUTER_ADDRESS, amount],
    //         // });

    //     } catch (error) {
    //         setStatus('idle');
    //         throw error;
    //     }
    // };

    // Remove liquidity
    const removeLiquidity = useCallback(async (
        // tokenA: Address,
        // tokenB: Address,
        // lpAmount: bigint,
        // minAmountA: bigint,
        // minAmountB: bigint,
        // deadline: bigint = BigInt(Math.floor(Date.now() / 1000) + 1200), // 20 min deadline
    ) => {
        try {
            // const pairAddress = await getPairAddress(tokenA, tokenB);

            // Approve LP tokens first
            // await approveLPTokens(pairAddress, lpAmount);

            setStatus('removing');

            // Simulate the transaction first
            // const { request } = await useSimulateContract({
            //     address: POOL_ROUTER_ADDRESS,
            //     abi: ROUTER_ABI,
            //     functionName: 'removeLiquidity',
            //     args: [
            //         tokenA,
            //         tokenB,
            //         lpAmount,
            //         minAmountA,
            //         minAmountB,
            //         window.ethereum.selectedAddress as Address,
            //         deadline,
            //     ],
            // });

            // Execute the transaction
            // const hash = await writeRouter(request);

            // setStatus('idle');
            // return hash;

        } catch (error) {
            setStatus('idle');
            throw error;
        }
    }, []);

    // Return values we want to expose
    return {
        removeLiquidity,
        getLPBalance,
        getLiquidityPreview,
        status,
    };
}
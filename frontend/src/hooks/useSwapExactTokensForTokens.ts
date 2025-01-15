// import { useWriteContract } from 'wagmi';
// import { POOL_ROUTER_ADDRESS, POOL_ROUTER_ABI } from '../utils/contracts';
// import { Address } from 'viem';
// import { useTokenApproval } from './useApproval';
// import { useState } from 'react';

// export const useSwapExactTokensForTokens = (tokenAddress: Address, // The address of the token to swap
//     spenderAddress: string) => {
//     const { writeContractAsync: swapExactTokensForTokens } = useWriteContract();
//     const { allowance, approve, isApproving } = useTokenApproval(tokenAddress, spenderAddress);

//     const [isSwapping, setIsSwapping] = useState(false);

//     const swap = async (
//         amountIn: string,
//         amountOutMin: string,
//         path: Address[],
//         to: Address
//     ) => {
//         try {

//             if (!allowance || allowance < amountIn) {
//                 console.log('Allowance insufficient. Calling approve...');
//                 await approve(BigInt(amountIn));
//             } else {
//                 console.log('Allowance sufficient. Proceeding with swap...');
//             }

//             setIsSwapping(true);
//             const result = await swapExactTokensForTokens({
//                 address: POOL_ROUTER_ADDRESS,
//                 abi: POOL_ROUTER_ABI,
//                 functionName: 'swapExactTokensForTokens',
//                 args: [BigInt(amountIn), BigInt(amountOutMin), path, to],
//             });

//             return result; // Return transaction details if needed
//         } catch (error) {
//             console.error('Error during swapExactTokensForTokens:', error);
//             throw error; // Propagate the error for the caller to handle
//         } finally {
//             setIsSwapping(false);
//         }
//     };

//     return {
//         swap,
//         isSwapping,
//         isApproving
//     };
// };



import { useWriteContract } from 'wagmi';
import { POOL_ROUTER_ADDRESS, POOL_ROUTER_ABI } from '../utils/contracts';
import { Address } from 'viem';
import { useTokenApproval } from './useApproval';
import { useState } from 'react';

export enum SwapStatus {
  IDLE = 'IDLE',
  APPROVING = 'APPROVING',
  APPROVED = 'APPROVED',
  SWAPPING = 'SWAPPING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

interface SwapError {
  step: 'APPROVAL' | 'SWAP';
  message: string;
}

export const useSwapExactTokensForTokens = (
  tokenAddress: Address,
  spenderAddress: string
) => {
  const { writeContractAsync: swapExactTokensForTokens } = useWriteContract();
  const { allowance, approve, } = useTokenApproval(tokenAddress, spenderAddress);
  
  const [status, setStatus] = useState<SwapStatus>(SwapStatus.IDLE);
  const [error, setError] = useState<SwapError | null>(null);

  const resetState = () => {
    setStatus(SwapStatus.IDLE);
    setError(null);
  };

  const checkAndApprove = async (amountIn: string): Promise<boolean> => {
    try {
      if (!allowance || allowance < amountIn) {
        setStatus(SwapStatus.APPROVING);
        console.log('Initiating token approval...');
        
         await approve(BigInt(amountIn));
        // await approvalTx.wait(); // Wait for approval transaction to be mined
        
        setStatus(SwapStatus.APPROVED);
        console.log('Token approval confirmed');
        return true;
      }
      
      console.log('Sufficient allowance exists');
      setStatus(SwapStatus.APPROVED);
      return true;
    } catch (error) {
      console.error('Approval failed:', error);
      setError({
        step: 'APPROVAL',
        message: 'Failed to approve token'
      });
      setStatus(SwapStatus.ERROR);
      return false;
    }
  };

  const executeSwap = async (
    amountIn: string,
    amountOutMin: string,
    path: Address[],
    to: Address
  ) => {
    try {
      console.log('Initiating swap transaction...');
      setStatus(SwapStatus.SWAPPING);

      const swapTx =       await swapExactTokensForTokens({
        address: POOL_ROUTER_ADDRESS,
        abi: POOL_ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [BigInt(amountIn), BigInt(amountOutMin), path, to],
      });

    //   await swapTx.wait(); // Wait for swap transaction to be mined
      
      setStatus(SwapStatus.COMPLETED);
      console.log('Swap completed successfully');
      return swapTx;
    } catch (error) {
      console.error('Swap failed:', error);
      setError({
        step: 'SWAP',
        message: 'Failed to execute swap'
      });
      setStatus(SwapStatus.ERROR);
      throw error;
    }
  };

  const swap = async (
    amountIn: string,
    amountOutMin: string,
    path: Address[],
    to: Address
  ) => {
    try {
      resetState();

      // Step 1: Check and handle approval
      const isApproved = await checkAndApprove(amountIn);
      if (!isApproved) {
        throw new Error('Token approval failed');
      }

      // Step 2: Execute swap only if approval is successful
      return await executeSwap(amountIn, amountOutMin, path, to);

    } catch (error) {
      console.error('Transaction sequence failed:', error);
      throw error;
    }
  };

  const isProcessing = status === SwapStatus.APPROVING || status === SwapStatus.SWAPPING;

  return {
    swap,
    status,
    error,
    isProcessing,
    resetState
  };
};
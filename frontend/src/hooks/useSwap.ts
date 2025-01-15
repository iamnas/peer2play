// // hooks/useSwap.ts
// import { useReadContract, useWriteContract } from 'wagmi'
// import { POOL_ROUTER_ADDRESS, POOL_ROUTER_ABI } from '../utils/contracts'
// import { parseUnits, formatUnits, erc20Abi, Address } from 'viem'
// import { useState } from 'react'


// export const useSwap = () => {
//   const [loading, setLoading] = useState(false)
  
//   // For getting amount out
//   const {  refetch } = useReadContract({
//     address: POOL_ROUTER_ADDRESS,
//     abi: POOL_ROUTER_ABI,
//     functionName: 'getAmountOut'
//   })

//   // For approving tokens
//   const { writeContractAsync: writeApproval } = useWriteContract()

//   // For executing swap
//   const { writeContractAsync: writeSwap } = useWriteContract()

//   const calculateAmountOut = async (amountIn: string, tokenIn: string, tokenOut: string) => {
//     try {
//     //   const parsedAmount = parseUnits(amountIn, 18)
//       const result = await refetch({
//         // args: [parsedAmount, tokenIn, tokenOut],
//       })
//       return formatUnits(result.data as bigint, 18)
//     } catch (err) {
//       console.error('Calculate amount error:', err)
//       return '0'
//     }
//   }

//   const approveToken = async (tokenAddress: string, amount: string) => {
//     try {
//       setLoading(true)
//       const parsedAmount = parseUnits(amount, 18)
//       await writeApproval({
//         address: tokenAddress as Address,
//         abi: erc20Abi,
//         functionName: 'approve',
//         args: [POOL_ROUTER_ADDRESS, parsedAmount],
//       })
//     } catch (err) {
//       console.error('Approval error:', err)
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }

//   const executeSwap = async (
//     amountIn: string,
//     amountOutMin: string,
//     tokenIn: string,
//     tokenOut: string,
//     userAddress: string
//   ) => {
//     try {
//       setLoading(true)
//       const parsedAmountIn = parseUnits(amountIn, 18)
//       const parsedAmountOutMin = parseUnits(amountOutMin, 18)
//       const path = [tokenIn, tokenOut]

//       await writeSwap({
//         address: POOL_ROUTER_ADDRESS,
//         abi: POOL_ROUTER_ABI,
//         functionName: 'swapExactTokensForTokens',
//         args: [parsedAmountIn, parsedAmountOutMin, path as Address[], userAddress as Address],
//       })
//     } catch (err) {
//       console.error('Swap error:', err)
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }

//   return {
//     calculateAmountOut,
//     approveToken,
//     executeSwap,
//     loading
//   }
// }
import { useReadContract } from 'wagmi';
import { POOL_ROUTER_ADDRESS, POOL_ROUTER_ABI } from '../utils/contracts';
import { Address } from 'viem';

export const useGetAmountOut = (amountIn: bigint, tokenIn: Address, tokenOut: Address) => {
  const { data, isLoading, error } = useReadContract({
    address: POOL_ROUTER_ADDRESS,
    abi: POOL_ROUTER_ABI,
    functionName: 'getAmountOut',
    args: [amountIn, tokenIn, tokenOut],
    
    // enabled: Boolean(amountIn && tokenIn && tokenOut),
    // watch: true,
  });

  return { amountOut: data, isLoading, error };
};

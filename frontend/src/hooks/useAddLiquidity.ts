import { useState } from 'react';
import { type Address } from 'viem'

import { 
  useWriteContract, 
  useReadContract,
  useAccount,
//   Address 
} from 'wagmi';

import { 
  POOL_ROUTER_ADDRESS, 
  POOL_ROUTER_ABI, 
  ERC20_ABI 
} from '../utils/contracts';

export const useAddLiquidity = () => {
  const { address } = useAccount();
  const [status, setStatus] = useState<'idle' | 'approving-a' | 'approving-b' | 'adding'>('idle');

  const { writeContractAsync: writeApproval } = useWriteContract();
  const { writeContractAsync: writeAddLiquidity } = useWriteContract();

  const {  refetch: refetchAllowanceA } = useReadContract({
    address: "" as Address, // Will be set dynamically
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as Address, POOL_ROUTER_ADDRESS],
    // enabled: false,
  });

  const { refetch: refetchAllowanceB } = useReadContract({
    address: "" as Address, // Will be set dynamically
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as Address, POOL_ROUTER_ADDRESS],
    // enabled: false,
  });

  const addLiquidity = async (
    tokenA: Address,
    tokenB: Address,
    amountADesired: bigint,
    amountBDesired: bigint,
    amountAMin: bigint,
    amountBMin: bigint
  ) => {
    try {
      if (!address) throw new Error('Wallet not connected');

      // Check allowances
      const allowanceAData = await refetchAllowanceA();
      const allowanceBData = await refetchAllowanceB();

      // Approve Token A if needed
      if (!allowanceAData.data || allowanceAData.data < amountADesired) {
        setStatus('approving-a');
        await writeApproval({
          address: tokenA,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [POOL_ROUTER_ADDRESS, amountADesired]
        });
      }

      // Approve Token B if needed
      if (!allowanceBData.data || allowanceBData.data < amountBDesired) {
        setStatus('approving-b');
        await writeApproval({
          address: tokenB,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [POOL_ROUTER_ADDRESS, amountBDesired]
        });
      }

      // Add liquidity
      setStatus('adding');
      await writeAddLiquidity({
        address: POOL_ROUTER_ADDRESS,
        abi: POOL_ROUTER_ABI,
        functionName: 'addLiquidity',
        args: [
          tokenA,
          tokenB,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          address
        ]
      });

      setStatus('idle');
      return true;
    } catch (error) {
      console.error('Add liquidity failed:', error);
      setStatus('idle');
      throw error;
    }
  };

  return {
    addLiquidity,
    status,
  };
};
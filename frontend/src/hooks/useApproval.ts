import { useState } from "react";
import { Address } from "viem";
import { useReadContract, useWriteContract } from "wagmi";


export const useTokenApproval = (tokenAddress: Address, spenderAddress: string) => {
    const { writeContract } = useWriteContract();
    const [isApproving, setIsApproving] = useState(false);
  
    const { data: allowance } = useReadContract({
      address: tokenAddress,
      abi: [
        {
          constant: true,
          inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
          ],
          name: 'allowance',
          outputs: [{ name: '', type: 'uint256' }],
          type: 'function',
        },
      ],
      functionName: 'allowance',
      args: [window.ethereum?.selectedAddress, spenderAddress],
    });
  
    const approve = async (amount: bigint) => {
      try {
        setIsApproving(true);
        await writeContract({
          address: tokenAddress,
          abi: [
            {
              constant: false,
              inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' },
              ],
              name: 'approve',
              outputs: [{ name: '', type: 'bool' }],
              type: 'function',
            },
          ],
          functionName: 'approve',
          args: [spenderAddress, amount],
        });
      } finally {
        setIsApproving(false);
      }
    };
  
    return {
      allowance,
      approve,
      isApproving,
    };
  };
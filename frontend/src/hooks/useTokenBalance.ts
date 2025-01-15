import { useReadContract } from 'wagmi'
import { Address, erc20Abi, formatUnits } from 'viem'

export const useTokenBalance = (tokenAddress: Address, userAddress?: Address) => {
  const { data: balance, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [userAddress as Address],
    // enabled: Boolean(tokenAddress && userAddress),
  })

  return {
    balance: balance ? formatUnits(balance as bigint, 18) : '0',
    refetchBalance: refetch
  }
}

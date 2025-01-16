// components/LiquidityForm.tsx
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Loader2, Plus } from 'lucide-react';
import { useAddLiquidity } from '../hooks/useAddLiquidity';
import { useRemoveLiquidity } from '../hooks/useRemoveLiquidity';
import { Address } from 'viem';
import { TOKENS } from '../utils/tokens';

interface LiquidityFormProps {
  isConnected: boolean;
  type: 'add' | 'remove';
  tokenAAddress: string;
  tokenBAddress: string;
  tokenAAmount: string;
  tokenBAmount: string;
  setTokenAAddress: (address: string) => void;
  setTokenBAddress: (address: string) => void;
  setTokenAAmount: (amount: string) => void;
  setTokenBAmount: (amount: string) => void;
}

export const LiquidityForm: React.FC<LiquidityFormProps> = ({
  isConnected,
  type,
  tokenAAddress,
  tokenBAddress,
  tokenAAmount,
  tokenBAmount,
  setTokenAAddress,
  setTokenBAddress,
  setTokenAAmount,
  setTokenBAmount,
}) => {
  const { address } = useAccount();
  const { addLiquidity, status: addStatus } = useAddLiquidity();
  const {  status: removeStatus} = useRemoveLiquidity();
  const [error, setError] = useState<string | null>(null);
  // const [lpBalance, setLPBalance] = useState<bigint>(BigInt(0));
  const [percentageToRemove, setPercentageToRemove] = useState<number>(0);

  // Fetch LP balance when addresses change
  // useEffect(() => {
  //   const fetchLPBalance = async () => {
  //     if (isConnected && address && tokenAAddress && tokenBAddress && type === 'remove') {
  //       try {
  //         const balance = await getLPBalance(tokenAAddress as Address, tokenBAddress as Address);
  //         setLPBalance(balance);
  //       } catch (err) {
  //         console.error('Error fetching LP balance:', err);
  //       }
  //     }
  //   };
  //   fetchLPBalance();
  // }, [address, tokenAAddress, tokenBAddress, isConnected, type]);

  // Update preview amounts when percentage changes
  // useEffect(() => {
  //   const updatePreview = async () => {
  //     if (type === 'remove' && percentageToRemove > 0 && lpBalance > BigInt(0)) {
  //       try {
  //         // const lpTokenAmount = (lpBalance * BigInt(percentageToRemove)) / BigInt(100);
  //         // const [amountA, amountB] = await getLiquidityPreview(
  //         //   tokenAAddress as Address,
  //         //   tokenBAddress as Address,
  //         //   lpTokenAmount
  //         // );
          
  //         // setTokenAAmount(((Number(amountA) / 10 ** TOKENS.TOKEN_A.decimals)).toString());
  //         // setTokenBAmount(((Number(amountB) / 10 ** TOKENS.TOKEN_B.decimals)).toString());
  //       } catch (err) {
  //         console.error('Error updating preview:', err);
  //       }
  //     }
  //   };
  //   updatePreview();
  // }, [percentageToRemove, lpBalance, type]);

  const getStatusMessage = () => {
    if (type === 'add') {
      switch (addStatus) {
        case 'approving-a':
          return 'Approving Token A...';
        case 'approving-b':
          return 'Approving Token B...';
        case 'adding':
          return 'Adding Liquidity...';
        default:
          return '';
      }
    } else {
      switch (removeStatus) {
        case 'approving':
          return 'Approving LP Tokens...';
        case 'removing':
          return 'Removing Liquidity...';
        default:
          return '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) return;

    try {
      setError(null);

      if (type === 'add') {
        await addLiquidity(
          tokenAAddress as Address,
          tokenBAddress as Address,
          BigInt(Number(tokenAAmount) * 10 ** TOKENS.TOKEN_A.decimals),
          BigInt(Number(tokenBAmount) * 10 ** TOKENS.TOKEN_B.decimals),
          BigInt(0),
          BigInt(0),
        );
      } else {
        // const lpTokenAmount = (lpBalance * BigInt(percentageToRemove)) / BigInt(100);
        // await removeLiquidity(
        //   tokenAAddress as Address,
        //   tokenBAddress as Address,
        //   lpTokenAmount,
        //   BigInt(0),
        //   BigInt(0),
        // );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${type} liquidity`);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    setPercentageToRemove(percentage);
  };

  const status = type === 'add' ? addStatus : removeStatus;
  const isIdle = status === 'idle';

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {type === 'add' ? 'Add' : 'Remove'} Liquidity
        </h1>
      </div>

      {type === 'remove' && (
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <label className="text-white/80 text-sm block mb-2">Amount to Remove</label>
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                type="button"
                onClick={() => handlePercentageClick(percentage)}
                className={`p-2 rounded-lg text-sm font-medium transition-all
                  ${percentageToRemove === percentage 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/5 text-white/80 hover:bg-white/10'}`}
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Token A Input/Preview */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <div className="mb-4">
          <label className="text-white/80 text-sm block mb-2">Token A</label>
          <input
            type="text"
            value={tokenAAddress}
            onChange={type === 'add' ? (e) => setTokenAAddress(e.target.value) : undefined}
            readOnly={type === 'remove'}
            placeholder="Enter token address"
            className="w-full bg-white/5 rounded-lg p-3 text-white placeholder-white/50 outline-none"
          />
        </div>
        <div>
          <label className="text-white/80 text-sm block mb-2">
            {type === 'add' ? 'Amount' : 'You Will Receive'}
          </label>
          <input
            type="number"
            value={tokenAAmount}
            onChange={type === 'add' ? (e) => setTokenAAmount(e.target.value) : undefined}
            readOnly={type === 'remove'}
            placeholder="0.0"
            className="w-full bg-white/5 rounded-lg p-3 text-white placeholder-white/50 outline-none"
          />
        </div>
      </div>

      {type === 'add' && (
        <div className="flex justify-center -my-2">
          <div className="bg-white/10 rounded-full p-2">
            <Plus className="w-6 h-6 text-white/60" />
          </div>
        </div>
      )}

      {/* Token B Input/Preview */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <div className="mb-4">
          <label className="text-white/80 text-sm block mb-2">Token B</label>
          <input
            type="text"
            value={tokenBAddress}
            onChange={type === 'add' ? (e) => setTokenBAddress(e.target.value) : undefined}
            readOnly={type === 'remove'}
            placeholder="Enter token address"
            className="w-full bg-white/5 rounded-lg p-3 text-white placeholder-white/50 outline-none"
          />
        </div>
        <div>
          <label className="text-white/80 text-sm block mb-2">
            {type === 'add' ? 'Amount' : 'You Will Receive'}
          </label>
          <input
            type="number"
            value={tokenBAmount}
            onChange={type === 'add' ? (e) => setTokenBAmount(e.target.value) : undefined}
            readOnly={type === 'remove'}
            placeholder="0.0"
            className="w-full bg-white/5 rounded-lg p-3 text-white placeholder-white/50 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!isConnected || !isIdle || (type === 'remove' && percentageToRemove === 0)}
        className={`w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2
          ${(!isConnected || !isIdle || (type === 'remove' && percentageToRemove === 0)) 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:from-blue-600 hover:to-purple-600'}`}
      >
        {!isIdle && <Loader2 className="w-5 h-5 animate-spin" />}
        {!isConnected 
          ? 'Connect Wallet' 
          : !isIdle 
          ? getStatusMessage() 
          : `${type === 'add' ? 'Add' : 'Remove'} Liquidity`}
      </button>
    </form>
  );
};
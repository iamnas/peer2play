// components/LiquidityForm.tsx
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Loader2 } from 'lucide-react';
import { useAddLiquidity } from '../hooks/useAddLiquidity';
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
  const { addLiquidity, status } = useAddLiquidity();
  const [error, setError] = useState<string | null>(null);

  const getStatusMessage = () => {
    switch (status) {
      case 'approving-a':
        return 'Approving Token A...';
      case 'approving-b':
        return 'Approving Token B...';
      case 'adding':
        return 'Adding Liquidity...';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) return;

    try {
      setError(null);

      await addLiquidity(
        tokenAAddress as Address,
        tokenBAddress as Address,
        BigInt(Number(tokenAAmount) * 10 ** TOKENS.TOKEN_A.decimals),
        BigInt(Number(tokenBAmount) * 10 ** TOKENS.TOKEN_B.decimals),
        BigInt(0),
        BigInt(0),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add liquidity');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Add Liquidity</h1>
      </div>

      {/* Token A Input */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <div className="mb-4">
          <label className="text-white/80 text-sm block mb-2">Token A Address</label>
          <input
            type="text"
            value={tokenAAddress}
            onChange={(e) => setTokenAAddress(e.target.value)}
            placeholder="Enter token address"
            className="w-full bg-white/5 rounded-lg p-3 text-white placeholder-white/50 outline-none"
          />
        </div>
        <div>
          <label className="text-white/80 text-sm block mb-2">Amount</label>
          <input
            type="number"
            value={tokenAAmount}
            onChange={(e) => setTokenAAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-white/5 rounded-lg p-3 text-white placeholder-white/50 outline-none"
          />
        </div>
      </div>

      {/* Token B Input */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <div className="mb-4">
          <label className="text-white/80 text-sm block mb-2">Token B Address</label>
          <input
            type="text"
            value={tokenBAddress}
            onChange={(e) => setTokenBAddress(e.target.value)}
            placeholder="Enter token address"
            className="w-full bg-white/5 rounded-lg p-3 text-white placeholder-white/50 outline-none"
          />
        </div>
        <div>
          <label className="text-white/80 text-sm block mb-2">Amount</label>
          <input
            type="number"
            value={tokenBAmount}
            onChange={(e) => setTokenBAmount(e.target.value)}
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
        disabled={!isConnected || status !== 'idle'}
        className={`w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2
          ${(!isConnected || status !== 'idle') ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-purple-600'}`}
      >
        {status !== 'idle' && <Loader2 className="w-5 h-5 animate-spin" />}
        {!isConnected ? 'Connect Wallet' : status !== 'idle' ? getStatusMessage() : 'Add Liquidity'}
      </button>
    </form>
  );
};
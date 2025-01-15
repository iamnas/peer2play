import React, { useState, useEffect } from 'react';
import { Settings, ArrowDownUp } from 'lucide-react';
import { useAccount } from 'wagmi';
import { TOKENS } from '../utils/tokens';
import { useGetAmountOut } from '../hooks/useGetAmountOut';
import { SwapStatus, useSwapExactTokensForTokens } from '../hooks/useSwapExactTokensForTokens';
import { POOL_ROUTER_ADDRESS } from '../utils/contracts';

export const SwapForm: React.FC = () => {
    const [tokenAAmount, setTokenAAmount] = useState('');
    const [tokenBAmount, setTokenBAmount] = useState('');
    const [tokenAAddress, setTokenAAddress] = useState(TOKENS.TOKEN_A.address); // Add default Token A address
    const [tokenBAddress, setTokenBAddress] = useState(TOKENS.TOKEN_B.address); // Add default Token B address


    const { isConnected, address } = useAccount()

    // Fetching the estimated output
    const { amountOut } = useGetAmountOut(
        BigInt(tokenAAmount),
        tokenAAddress,
        tokenBAddress
    );

    // Update Token B amount whenever `amountOut` changes
    useEffect(() => {
        if (amountOut) setTokenBAmount(amountOut.toString());
    }, [amountOut]);

    // Preparing to execute the swap
    const { swap, status } = useSwapExactTokensForTokens(tokenAAddress, POOL_ROUTER_ADDRESS);


    const handleSwap = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isConnected && address) {
                const result = await swap(tokenAAmount, tokenBAmount, [tokenAAddress, tokenBAddress], address);
                console.log('Swap successful:', result);

            }
        } catch (err) {
            console.error('Error during swap:', err);
        }
    };


    return (
        <form onSubmit={handleSwap}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Token Swap</h1>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Settings className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Token A Input */}
            <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm">From</label>
                    <span className="text-white/80 text-sm">Balance: 0.0</span>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        value={tokenAAmount}
                        onChange={(e) => setTokenAAmount(e.target.value)}
                        placeholder="0.0"
                        className="bg-transparent text-2xl text-white placeholder-white/50 outline-none w-full"
                    />
                    <button type="button" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2 text-white font-semibold">
                        <img
                            src="https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=64&h=64&fit=crop"
                            alt="Token A"
                            className="w-6 h-6 rounded-full"
                        />
                        TokenA
                    </button>
                </div>
            </div>

            {/* Swap Direction */}
            <div className="flex justify-center -my-2 relative z-10">
                <button
                    type="button"
                    onClick={() => {
                        const temp = tokenAAddress;
                        setTokenAAddress(tokenBAddress);
                        setTokenBAddress(temp);
                    }}
                    className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                    <ArrowDownUp className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Token B Output */}
            <div className="bg-white/5 rounded-xl p-4 mt-4">
                <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm">To</label>
                    <span className="text-white/80 text-sm">Balance: 0.0</span>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        value={tokenBAmount}
                        disabled
                        placeholder="0.0"
                        className="bg-transparent text-2xl text-white placeholder-white/50 outline-none w-full"
                    />
                    <button type="button" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2 text-white font-semibold">
                        <img
                            src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=64&h=64&fit=crop"
                            alt="Token B"
                            className="w-6 h-6 rounded-full"
                        />
                        TokenB
                    </button>
                </div>
            </div>

            {/* Swap Button */}
            <button
                type="submit"
                disabled={!isConnected}
                className={`w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-purple-600'}`}
            >
                {status === SwapStatus.APPROVING ? 'Approving...' : status === SwapStatus.SWAPPING ? "Swapping..." : isConnected ? 'Swap Tokens' : 'Connect Wallet to Swap'}
            </button>

        </form>
    );
};


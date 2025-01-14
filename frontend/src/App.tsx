import React, { useState } from 'react';
import { ArrowDownUp, Settings, Info, Plus, Minus, Wallet } from 'lucide-react';

type Page = 'swap' | 'addLiquidity' | 'removeLiquidity';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('swap');
  const [tokenAAmount, setTokenAAmount] = useState<string>('');
  const [tokenBAmount, setTokenBAmount] = useState<string>('');
  const [tokenAAddress, setTokenAAddress] = useState<string>('');
  const [tokenBAddress, setTokenBAddress] = useState<string>('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleConnectWallet = () => {
    setIsWalletConnected(!isWalletConnected);
    console.log('Connecting wallet...');
  };

  const handleSwapDirection = () => {
    const tempAmount = tokenAAmount;
    setTokenAAmount(tokenBAmount);
    setTokenBAmount(tempAmount);
  };

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Swapping tokens:', { tokenAAmount, tokenBAmount });
  };

  const handleAddLiquidity = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding liquidity:', { tokenAAddress, tokenAAmount, tokenBAddress, tokenBAmount });
  };

  const handleRemoveLiquidity = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Removing liquidity:', { tokenAAddress, tokenAAmount, tokenBAddress, tokenBAmount });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 flex flex-col items-center p-4">
      {/* Header with Connect Wallet */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 flex gap-2">
          <button
            onClick={() => setCurrentPage('swap')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'swap'
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <ArrowDownUp className="w-4 h-4 inline mr-2" />
            Swap
          </button>
          <button
            onClick={() => setCurrentPage('addLiquidity')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'addLiquidity'
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Liquidity
          </button>
          <button
            onClick={() => setCurrentPage('removeLiquidity')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'removeLiquidity'
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Minus className="w-4 h-4 inline mr-2" />
            Remove Liquidity
          </button>
        </div>
        
        <button
          onClick={handleConnectWallet}
          className={`px-6 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
            isWalletConnected
              ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Wallet className="w-5 h-5" />
          {isWalletConnected ? '0x1234...5678' : 'Connect Wallet'}
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-xl">
        {currentPage === 'swap' && (
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

            {/* Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                type="button"
                onClick={handleSwapDirection}
                className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowDownUp className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Token B Input */}
            <div className="bg-white/5 rounded-xl p-4 mt-4">
              <div className="flex justify-between mb-2">
                <label className="text-white/80 text-sm">To</label>
                <span className="text-white/80 text-sm">Balance: 0.0</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={tokenBAmount}
                  onChange={(e) => setTokenBAmount(e.target.value)}
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

            {/* Exchange Rate */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Info className="w-4 h-4" />
                <span>1 TokenA = 0.5 TokenB</span>
              </div>
            </div>

            {/* Swap Button */}
            <button
              type="submit"
              disabled={!isWalletConnected}
              className={`w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                !isWalletConnected ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-purple-600'
              }`}
            >
              {isWalletConnected ? 'Swap Tokens' : 'Connect Wallet to Swap'}
            </button>
          </form>
        )}

        {(currentPage === 'addLiquidity' || currentPage === 'removeLiquidity') && (
          <form onSubmit={currentPage === 'addLiquidity' ? handleAddLiquidity : handleRemoveLiquidity}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white">
                {currentPage === 'addLiquidity' ? 'Add Liquidity' : 'Remove Liquidity'}
              </h1>
            </div>

            {/* Token A */}
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

            {/* Token B */}
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

            <button
              type="submit"
              disabled={!isWalletConnected}
              className={`w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                !isWalletConnected ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-purple-600'
              }`}
            >
              {!isWalletConnected 
                ? 'Connect Wallet' 
                : currentPage === 'addLiquidity' 
                  ? 'Add Liquidity' 
                  : 'Remove Liquidity'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
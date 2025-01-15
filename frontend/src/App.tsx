

// App.tsx
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Header } from './components/Header';
import { SwapForm } from './components/SwapForm';
import { LiquidityForm } from './components/LiquidityForm';
import { Page } from './utils/types';

function App() {
    const { isConnected } = useAccount();
    const [currentPage, setCurrentPage] = useState<Page>('swap');
    const [tokenAAmount, setTokenAAmount] = useState<string>('');
    const [tokenBAmount, setTokenBAmount] = useState<string>('');
    const [tokenAAddress, setTokenAAddress] = useState<string>('0x1b534eD99500c2Cf49f6C2574B2ADAff497aef7c');
    const [tokenBAddress, setTokenBAddress] = useState<string>('0xDB68629086f858E119e4e4d61745780d50Bc1368');


    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 flex flex-col items-center p-4">
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-xl">
                {currentPage === 'swap' && (
                    <SwapForm/>
                )}

                {(currentPage === 'addLiquidity' || currentPage === 'removeLiquidity') && (
                    <LiquidityForm
                        isConnected={isConnected}
                        type={currentPage === 'addLiquidity' ? 'add' : 'remove'}
                        tokenAAddress={tokenAAddress}
                        tokenBAddress={tokenBAddress}
                        tokenAAmount={tokenAAmount}
                        tokenBAmount={tokenBAmount}
                        setTokenAAddress={setTokenAAddress}
                        setTokenBAddress={setTokenBAddress}
                        setTokenAAmount={setTokenAAmount}
                        setTokenBAmount={setTokenBAmount}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
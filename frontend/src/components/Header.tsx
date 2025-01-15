
// components/Header.tsx
import React from 'react';
import { ConnectKitButton } from 'connectkit';
import { ArrowDownUp, Plus, Minus, Wallet } from 'lucide-react';
import { Page } from '../utils/types';


interface HeaderProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
    return (
        <div className="w-full max-w-4xl flex justify-between items-center mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 flex gap-2">
                <button
                    onClick={() => setCurrentPage('swap')}
                    className={`px-4 py-2 rounded-lg transition-colors ${currentPage === 'swap'
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                >
                    <ArrowDownUp className="w-4 h-4 inline mr-2" />
                    Swap
                </button>
                <button
                    onClick={() => setCurrentPage('addLiquidity')}
                    className={`px-4 py-2 rounded-lg transition-colors ${currentPage === 'addLiquidity'
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Liquidity
                </button>
                <button
                    onClick={() => setCurrentPage('removeLiquidity')}
                    className={`px-4 py-2 rounded-lg transition-colors ${currentPage === 'removeLiquidity'
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                >
                    <Minus className="w-4 h-4 inline mr-2" />
                    Remove Liquidity
                </button>
            </div>

            <div>
                <ConnectKitButton.Custom>
                    {({ isConnected, address, show }) => (
                        <button
                            onClick={show}
                            className={`px-6 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${isConnected
                                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            <Wallet className="w-5 h-5" />
                            {isConnected
                                ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                                : 'Connect Wallet'}
                        </button>
                    )}
                </ConnectKitButton.Custom>
            </div>
        </div>
    );
};
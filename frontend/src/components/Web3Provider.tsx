import { WagmiProvider, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";


const config = createConfig(
    getDefaultConfig({
        chains: [sepolia],
        walletConnectProjectId: import.meta.env.VITE_PROJECT_ID || '',
        appName: "Pool",
        appDescription: "Pool",
        appUrl: "https://family.co",
        appIcon: "https://family.co/logo.png",
    }),
);


const queryClient = new QueryClient();

export const Web3Provider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider>
                    
                    {children}
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
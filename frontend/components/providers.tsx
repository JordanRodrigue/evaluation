"use client";

import { MetaMaskProvider } from "../fhevm/hooks/metamask/useMetaMaskProvider";
import { MetaMaskEthersSignerProvider } from "../fhevm/hooks/metamask/useMetaMaskEthersSigner";
import { InMemoryStorageProvider } from "../fhevm/hooks/useInMemoryStorage";

export function FhevmProvider({ children }: { children: React.ReactNode }) {
  const mockChains = process.env.NEXT_PUBLIC_USE_LOCAL_MOCK === "1" ? { 31337: "http://localhost:8545" } : {};
  return (
    <MetaMaskProvider>
      <MetaMaskEthersSignerProvider initialMockChains={mockChains}>
        <InMemoryStorageProvider>
          {children}
        </InMemoryStorageProvider>
      </MetaMaskEthersSignerProvider>
    </MetaMaskProvider>
  );
}



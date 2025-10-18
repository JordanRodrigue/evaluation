import { ethers } from "ethers";
import type { FhevmInstance } from "../../fhevmTypes";

type RelayerMetadata = {
  ACLAddress: `0x${string}`;
  InputVerifierAddress: `0x${string}`;
  KMSVerifierAddress: `0x${string}`;
  chainId?: number;
  gatewayChainId?: number;
};

export async function fhevmMockCreateInstance(parameters: { rpcUrl: string; chainId: number; metadata: RelayerMetadata; walletProvider?: ethers.Eip1193Provider }): Promise<FhevmInstance> {
  const { rpcUrl, chainId, metadata, walletProvider } = parameters;

  const readonlyProvider = new ethers.JsonRpcProvider(rpcUrl);

  const eip1193LikeProvider: ethers.Eip1193Provider = walletProvider ?? ({
    // @ts-ignore - minimal request shim backed by JsonRpcProvider.send
    request: async ({ method, params }: { method: string; params?: unknown[] }) => {
      return readonlyProvider.send(method, Array.isArray(params) ? params : []);
    },
  } as any);

  const { MockFhevmInstance } = await import("@fhevm/mock-utils/_esm/fhevm/MockFhevmInstance.js");

  const instance = await MockFhevmInstance.create(
    eip1193LikeProvider,
    readonlyProvider,
    {
      verifyingContractAddressDecryption: metadata.KMSVerifierAddress,
      verifyingContractAddressInputVerification: metadata.InputVerifierAddress,
      kmsContractAddress: metadata.KMSVerifierAddress,
      inputVerifierContractAddress: metadata.InputVerifierAddress,
      aclContractAddress: metadata.ACLAddress,
      chainId: metadata.chainId ?? chainId,
      gatewayChainId: metadata.gatewayChainId ?? chainId,
    }
  );

  return instance as unknown as FhevmInstance;
}



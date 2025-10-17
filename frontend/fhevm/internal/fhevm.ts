import { isAddress, Eip1193Provider, JsonRpcProvider } from "ethers";
import type { FhevmInitSDKOptions, FhevmLoadSDKType, FhevmWindowType } from "./fhevmTypes";
import { isFhevmWindowType, RelayerSDKLoader } from "./RelayerSDKLoader";
import { FhevmInstance, FhevmInstanceConfig } from "../fhevmTypes";

class FhevmReactError extends Error { code: string; constructor(code: string, message?: string, options?: ErrorOptions) { super(message, options); this.code = code; this.name = "FhevmReactError"; } }
const throwFhevmError = (code: string, message?: string, cause?: unknown): never => { throw new FhevmReactError(code, message, cause ? { cause } : undefined); };

const isFhevmInitialized = (): boolean => {
  if (!isFhevmWindowType(window, console.log)) return false;
  // @ts-ignore
  return window.relayerSDK.__initialized__ === true;
};

const fhevmLoadSDK: FhevmLoadSDKType = () => { const loader = new RelayerSDKLoader({ trace: console.log }); return loader.load(); };
const fhevmInitSDK = async (options?: FhevmInitSDKOptions) => {
  if (!isFhevmWindowType(window, console.log)) throw new Error("window.relayerSDK is not available");
  // @ts-ignore
  const result = await window.relayerSDK.initSDK(options);
  // @ts-ignore
  window.relayerSDK.__initialized__ = result;
  if (!result) throw new Error("window.relayerSDK.initSDK failed.");
  return true;
};

async function getChainId(providerOrUrl: Eip1193Provider | string): Promise<number> {
  if (typeof providerOrUrl === "string") { const provider = new JsonRpcProvider(providerOrUrl); return Number((await provider.getNetwork()).chainId); }
  const chainId = await providerOrUrl.request({ method: "eth_chainId" });
  return Number.parseInt(chainId as string, 16);
}

async function getWeb3Client(rpcUrl: string) { const rpc = new JsonRpcProvider(rpcUrl); try { const version = await rpc.send("web3_clientVersion", []); return version; } catch (e) { throwFhevmError("WEB3_CLIENTVERSION_ERROR", `The URL ${rpcUrl} is not a Web3 node or is not reachable. Please check the endpoint.`, e); } finally { rpc.destroy(); } }

async function getFHEVMRelayerMetadata(rpcUrl: string) { const rpc = new JsonRpcProvider(rpcUrl); try { const version = await rpc.send("fhevm_relayer_metadata", []); return version; } catch (e) { throwFhevmError("FHEVM_RELAYER_METADATA_ERROR", `The URL ${rpcUrl} is not a FHEVM Hardhat node or is not reachable. Please check the endpoint.`, e); } finally { rpc.destroy(); } }

async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl: string) {
  const version = await getWeb3Client(rpcUrl);
  if (typeof version !== "string" || !version.toLowerCase().includes("hardhat")) return undefined;
  try {
    const metadata = await getFHEVMRelayerMetadata(rpcUrl);
    if (!metadata || typeof metadata !== "object") return undefined;
    if (!("ACLAddress" in metadata && typeof metadata.ACLAddress === "string" && metadata.ACLAddress.startsWith("0x"))) return undefined;
    if (!("InputVerifierAddress" in metadata && typeof metadata.InputVerifierAddress === "string" && metadata.InputVerifierAddress.startsWith("0x"))) return undefined;
    if (!("KMSVerifierAddress" in metadata && typeof metadata.KMSVerifierAddress === "string" && metadata.KMSVerifierAddress.startsWith("0x"))) return undefined;
    const chainId: number | undefined = typeof (metadata as any).chainId === "number" ? (metadata as any).chainId : undefined;
    const gatewayChainId: number | undefined = typeof (metadata as any).gatewayChainId === "number" ? (metadata as any).gatewayChainId : undefined;
    return metadata as { ACLAddress: `0x${string}`; InputVerifierAddress: `0x${string}`; KMSVerifierAddress: `0x${string}`; chainId?: number; gatewayChainId?: number };
  } catch { return undefined; }
}

type MockResolveResult = { isMock: true; chainId: number; rpcUrl: string };
type GenericResolveResult = { isMock: false; chainId: number; rpcUrl?: string };
type ResolveResult = MockResolveResult | GenericResolveResult;

async function resolve(providerOrUrl: Eip1193Provider | string, mockChains?: Record<number, string>): Promise<ResolveResult> {
  const chainId = await getChainId(providerOrUrl);
  let rpcUrl = typeof providerOrUrl === "string" ? providerOrUrl : undefined;
  const _mockChains: Record<number, string> = { ...(mockChains ?? {}) };
  if (Object.hasOwn(_mockChains, chainId)) { if (!rpcUrl) { rpcUrl = _mockChains[chainId]; } return { isMock: true, chainId, rpcUrl }; }
  return { isMock: false, chainId, rpcUrl };
}

export const createFhevmInstance = async (parameters: { provider: Eip1193Provider | string; mockChains?: Record<number, string>; signal: AbortSignal; onStatusChange?: (status: "sdk-loading" | "sdk-loaded" | "sdk-initializing" | "sdk-initialized" | "creating") => void; }): Promise<FhevmInstance> => {
  const { signal, onStatusChange, provider: providerOrUrl, mockChains } = parameters;
  const throwIfAborted = () => { if (signal.aborted) throw new Error("FHEVM operation was cancelled"); };
  const notify = (s: any) => { onStatusChange?.(s); };

  const { isMock, rpcUrl, chainId } = await resolve(providerOrUrl, mockChains);
  if (isMock) {
    const meta = await tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl!);
    if (meta) {
      notify("creating");
      const mock = await import("./mock/fhevmMock");
      // Prefer passing through the original EIP-1193 provider (MetaMask) when available for account/signing support
      const eip1193Provider = typeof providerOrUrl === "string" ? undefined : providerOrUrl;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const mockInstance = await mock.fhevmMockCreateInstance({ rpcUrl: rpcUrl!, chainId, metadata: meta, walletProvider: eip1193Provider });
      throwIfAborted();
      return mockInstance;
    }
  }

  throwIfAborted();

  if (!isFhevmWindowType(window, console.log)) {
    notify("sdk-loading");
    await fhevmLoadSDK();
    throwIfAborted();
    notify("sdk-loaded");
  }

  if (!isFhevmInitialized()) {
    notify("sdk-initializing");
    await fhevmInitSDK();
    throwIfAborted();
    notify("sdk-initialized");
  }

  const relayerSDK = (window as unknown as FhevmWindowType).relayerSDK;
  const aclAddress = relayerSDK.SepoliaConfig.aclContractAddress;
  if (typeof aclAddress !== "string" || !isAddress(aclAddress)) { throw new Error(`Invalid address: ${aclAddress}`); }
  throwIfAborted();
  // Avoid SDK defaulting to http://localhost:8545 when provider is an EIP-1193 object
  let networkParam: Eip1193Provider | string = providerOrUrl;
  try {
    const detectedChainId = await getChainId(providerOrUrl);
    if (typeof providerOrUrl !== "string") {
      if (detectedChainId === 11155111 && typeof process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL === "string" && process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL.length > 0) {
        networkParam = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL as string;
      }
    }
  } catch {
    // fallback to original providerOrUrl
  }
  const config: FhevmInstanceConfig = { ...relayerSDK.SepoliaConfig, network: networkParam };
  notify("creating");
  const instance = await relayerSDK.createInstance(config);
  throwIfAborted();
  return instance;
};



import type { FhevmWindowType } from "./fhevmTypes";

export class RelayerSDKLoader {
  #trace?: (msg: string) => void;
  constructor(parameters?: { trace?: (msg: string) => void }) {
    this.#trace = parameters?.trace;
  }
  async load() {
    const w = window as unknown as FhevmWindowType;
    if (w.relayerSDK) return true;
    this.#trace?.("dynamic import @zama-fhe/relayer-sdk/web");
    const sdk = await import("@zama-fhe/relayer-sdk/web");
    (window as any).relayerSDK = sdk;
    return true;
  }
}

export function isFhevmWindowType(w: any, log?: (m: string) => void): w is FhevmWindowType {
  const ok = Boolean(w && w.relayerSDK);
  if (!ok) log?.("window.relayerSDK not present");
  return ok;
}



"use client";

import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FhevmInstance } from "../fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "../fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "../fhevm/GenericStringStorage";
import { EncryptEvaluationABI } from "../abi/EncryptEvaluationABI";
import { EncryptEvaluationAddresses } from "../abi/EncryptEvaluationAddresses";

type ClearValueType = { handle: string; clear: string | bigint | boolean };

type DappInfoType = {
  abi: typeof EncryptEvaluationABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

function getDappByChainId(chainId: number | undefined): DappInfoType {
  if (!chainId) return { abi: EncryptEvaluationABI.abi };
  const entry = (EncryptEvaluationAddresses as any)?.[chainId.toString()];
  if (!entry || typeof entry !== "object" || typeof entry.address !== "string" || entry.address === ethers.ZeroAddress) {
    return { abi: EncryptEvaluationABI.abi, chainId };
  }
  return { address: entry.address as `0x${string}` | undefined, chainId: entry.chainId ?? chainId, chainName: entry.chainName, abi: EncryptEvaluationABI.abi };
}

export const useEncryptEvaluation = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.Provider | undefined;
  sameChain: React.RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: React.RefObject<(ethersSigner: ethers.JsonRpcSigner | undefined) => boolean>;
}) => {
  const { instance, fhevmDecryptionSignatureStorage, chainId, ethersSigner, ethersReadonlyProvider, sameChain, sameSigner } = parameters;

  const [myRecordHandle, setMyRecordHandle] = useState<{ score?: string; contribution?: string; grade?: string; passed?: string } | undefined>(undefined);
  const [clearMyRecord, setClearMyRecord] = useState<{ score?: ClearValueType; contribution?: ClearValueType; grade?: ClearValueType; passed?: ClearValueType } | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [eligibilityResult, setEligibilityResult] = useState<{ handle?: string; clear?: boolean } | undefined>(undefined);
  const [avgResult, setAvgResult] = useState<{ handle?: string; clear?: boolean } | undefined>(undefined);

  const ref = useRef<DappInfoType | undefined>(undefined);
  const isRefreshingRef = useRef<boolean>(isRefreshing);
  const isDecryptingRef = useRef<boolean>(isDecrypting);
  const isSubmittingRef = useRef<boolean>(isSubmitting);

  const dapp = useMemo(() => {
    const c = getDappByChainId(chainId);
    ref.current = c;
    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!dapp) return undefined;
    return Boolean(dapp.address) && dapp.address !== ethers.ZeroAddress;
  }, [dapp]);

  const canRefresh = useMemo(() => Boolean(dapp.address && ethersReadonlyProvider && !isRefreshing), [dapp.address, ethersReadonlyProvider, isRefreshing]);
  const canDecrypt = useMemo(() => Boolean(dapp.address && instance && ethersSigner && !isRefreshing && !isDecrypting && myRecordHandle), [dapp.address, instance, ethersSigner, isRefreshing, isDecrypting, myRecordHandle]);
  const canSubmit = useMemo(() => Boolean(dapp.address && instance && ethersSigner && !isSubmitting), [dapp.address, instance, ethersSigner, isSubmitting]);
  const canDecryptChecks = useMemo(() => Boolean(dapp.address && instance && ethersSigner && ((eligibilityResult?.handle) || (avgResult?.handle))), [dapp.address, instance, ethersSigner, eligibilityResult?.handle, avgResult?.handle]);

  const refreshMyRecord = useCallback(() => {
    if (isRefreshingRef.current) return;
    if (!ref.current || !ref.current?.chainId || !ref.current?.address || !ethersReadonlyProvider) {
      setMyRecordHandle(undefined);
      return;
    }
    if (!ethersSigner) { setMyRecordHandle(undefined); return; }
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    const thisChainId = ref.current.chainId;
    const addr = ref.current.address!;
    const roContract = new ethers.Contract(addr, ref.current.abi, ethersReadonlyProvider);
    const rwContract = new ethers.Contract(addr, ref.current.abi, ethersSigner);
    const filter = roContract.filters.RecordUploaded?.(ethersSigner.address) ?? { address: addr, topics: [] };
    // Pre-check with limited block range to satisfy public RPC max range (e.g., 50k)
    ethersReadonlyProvider.getBlockNumber()
      .then((latest: number) => {
        const from = Math.max(0, latest - 49000);
        return roContract.queryFilter(filter as any, from, latest);
      })
      .then((events: any[]) => {
        if (!sameChain.current(thisChainId) || addr !== ref.current?.address) { throw new Error("stale"); }
        if (!events || events.length === 0) {
          setMyRecordHandle(undefined);
          setMessage("no record");
          // ensure refreshing flags are reset when there is no record
          isRefreshingRef.current = false;
          setIsRefreshing(false);
          return null;
        }
        return rwContract.getMyRecord();
      })
      .then((tuple: [string, string, string, string]) => {
        if (!tuple) { // already handled empty-state
          // double-safety: make sure flags are down even if upstream returned null
          isRefreshingRef.current = false;
          setIsRefreshing(false);
          return;
        }
        if (sameChain.current(thisChainId) && addr === ref.current?.address) {
          setMyRecordHandle({ score: tuple[0], contribution: tuple[1], grade: tuple[2], passed: tuple[3] });
        }
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      })
      .catch((e: any) => {
        const msg = String(e ?? "");
        if (msg.toLowerCase().includes("no record")) {
          // Treat as empty state (no on-chain record yet)
          setMyRecordHandle(undefined);
          setMessage("no record");
        } else {
          setMessage("getMyRecord() failed: " + msg);
        }
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [ethersReadonlyProvider, ethersSigner, sameChain]);

  useEffect(() => { refreshMyRecord(); }, [refreshMyRecord]);

  const decryptMyRecord = useCallback(() => {
    if (isRefreshingRef.current || isDecryptingRef.current) return;
    if (!dapp.address || !instance || !ethersSigner || !myRecordHandle) return;
    const thisChainId = chainId;
    const addr = dapp.address;
    const thisEthersSigner = ethersSigner;
    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Start decrypt");
    const run = async () => {
      const isStale = () => addr !== ref.current?.address || !sameChain.current(thisChainId) || !sameSigner.current(thisEthersSigner);
      try {
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [addr as `0x${string}`],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );
        if (!sig) { setMessage("Unable to build FHEVM decryption signature"); return; }
        if (isStale()) { setMessage("Ignore FHEVM decryption"); return; }
        const handles: { handle: string; contractAddress: `0x${string}` }[] = [];
        for (const k of ["score","contribution","grade","passed"] as const) {
          const h = (myRecordHandle as any)[k];
          if (h && h !== ethers.ZeroHash) handles.push({ handle: h, contractAddress: addr as `0x${string}` });
        }
        if (handles.length === 0) { setMessage("No encrypted handles to decrypt"); return; }
        const res = await instance.userDecrypt(
          handles,
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );
        if (isStale()) { setMessage("Ignore FHEVM decryption"); return; }
        const out: any = {};
        for (const h of handles) { out[h.handle] = res[h.handle]; }
        setClearMyRecord({
          score: myRecordHandle.score ? { handle: myRecordHandle.score, clear: out[myRecordHandle.score] } : undefined,
          contribution: myRecordHandle.contribution ? { handle: myRecordHandle.contribution, clear: out[myRecordHandle.contribution] } : undefined,
          grade: myRecordHandle.grade ? { handle: myRecordHandle.grade, clear: out[myRecordHandle.grade] } : undefined,
          passed: myRecordHandle.passed ? { handle: myRecordHandle.passed, clear: out[myRecordHandle.passed] } : undefined,
        });
        setMessage("Decryption completed");
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };
    run();
  }, [fhevmDecryptionSignatureStorage, ethersSigner, dapp.address, instance, myRecordHandle, chainId, sameChain, sameSigner]);

  function normalizeBoolValue(v: any): boolean | undefined {
    if (typeof v === "boolean") return v;
    if (typeof v === "bigint") return v !== BigInt(0);
    if (typeof v === "number") return v !== 0;
    if (typeof v === "string") {
      const s = v.toLowerCase();
      if (s === "true") return true;
      if (s === "false") return false;
      if (s === "1" || s === "0x1" || s === "0x01") return true;
      if (s === "0" || s === "0x0" || s === "0x00") return false;
      if (s.startsWith("0x")) {
        try { const bn = BigInt(s); return bn !== BigInt(0); } catch {}
      }
    }
    return undefined;
  }

  const submitRecord = useCallback((params: { score: number; contribution: number; grade: number; passed: boolean; cid?: string }) => {
    if (isRefreshingRef.current || isSubmittingRef.current) return;
    if (!dapp.address || !instance || !ethersSigner) return;
    const thisChainId = chainId;
    const addr = dapp.address;
    const thisEthersSigner = ethersSigner;
    const contract = new ethers.Contract(addr!, dapp.abi, thisEthersSigner);
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setMessage("Start encrypt+submit");
    const run = async () => {
      const isStale = () => addr !== ref.current?.address || !sameChain.current(thisChainId) || !sameSigner.current(thisEthersSigner);
      try {
        await new Promise((r) => setTimeout(r, 100));
        const input = instance.createEncryptedInput(addr!, thisEthersSigner.address);
        input.add32(params.score);
        input.add32(params.contribution);
        input.add16(params.grade);
        input.addBool(params.passed);
        const enc = await input.encrypt();
        if (isStale()) { setMessage("Ignore submit"); return; }
        const tx: ethers.TransactionResponse = await contract.upload(
          enc.handles[0],
          enc.handles[1],
          enc.handles[2],
          enc.handles[3],
          enc.inputProof,
          params.cid ?? ""
        );
        const receipt = await tx.wait();
        setMessage(`upload() status=${receipt?.status}`);
        refreshMyRecord();
      } catch (e: any) {
        setMessage("upload failed: " + String(e));
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    };
    run();
  }, [dapp.address, dapp.abi, instance, ethersSigner, chainId, sameChain, sameSigner, refreshMyRecord]);

  const checkEligibility = useCallback((p: { scoreThreshold: number; contribThreshold: number }) => {
    if (isSubmittingRef.current) return;
    if (!dapp.address || !instance || !ethersSigner) return;
    const addr = dapp.address;
    const contract = new ethers.Contract(addr!, dapp.abi, ethersSigner);
    setIsSubmitting(true);
    setMessage("Start check eligibility");
    const run = async () => {
      try {
        await new Promise((r) => setTimeout(r, 100));
        const input = instance.createEncryptedInput(addr!, ethersSigner.address);
        input.add32(p.scoreThreshold);
        input.add32(p.contribThreshold);
        const enc = await input.encrypt();
        // 先通过静态调用拿到返回句柄（不进行自动解密）
        let returnedHandle: string | undefined;
        try {
          returnedHandle = await (contract as any).isEligible.staticCall(
            enc.handles[0], enc.handles[1], enc.inputProof
          );
          if (returnedHandle && typeof returnedHandle === "string") {
            setEligibilityResult({ handle: returnedHandle });
            setMessage("Encrypted handle received. Use 'Decrypt Check Results' to decrypt.");
          }
        } catch {
          // ignore static call errors; 继续走交易路径
        }
        const tx: ethers.TransactionResponse = await contract.isEligible(
          enc.handles[0], enc.handles[1], enc.inputProof
        );
        await tx.wait();
        if (!returnedHandle) {
          setMessage("isEligible() mined; retrieve handle and decrypt manually.");
        }
      } catch (e: any) {
        setMessage("check failed: " + String(e));
      } finally {
        setIsSubmitting(false);
      }
    };
    run();
  }, [dapp.address, dapp.abi, instance, ethersSigner, fhevmDecryptionSignatureStorage]);

  const checkAvg = useCallback((p: { threshold: number }) => {
    if (isSubmittingRef.current) return;
    if (!dapp.address || !instance || !ethersSigner) return;
    const addr = dapp.address;
    const contract = new ethers.Contract(addr!, dapp.abi, ethersSigner);
    setIsSubmitting(true);
    setMessage("Start check avg");
    const run = async () => {
      try {
        await new Promise((r) => setTimeout(r, 100));
        const input = instance.createEncryptedInput(addr!, ethersSigner.address);
        input.add32(p.threshold);
        const enc = await input.encrypt();
        // 先静态调用获取返回句柄（不进行自动解密）
        let returnedHandle: string | undefined;
        try {
          returnedHandle = await (contract as any).isAvgScoreAtLeast.staticCall(
            enc.handles[0], enc.inputProof
          );
          if (returnedHandle && typeof returnedHandle === "string") {
            setAvgResult({ handle: returnedHandle });
            setMessage("Encrypted handle received. Use 'Decrypt Check Results' to decrypt.");
          }
        } catch {
          // ignore static call errors; 继续走交易路径
        }
        const tx: ethers.TransactionResponse = await contract.isAvgScoreAtLeast(
          enc.handles[0], enc.inputProof
        );
        await tx.wait();
        if (!returnedHandle) {
          setMessage("isAvgScoreAtLeast() mined; retrieve handle and decrypt manually.");
        }
      } catch (e: any) {
        setMessage("check failed: " + String(e));
      } finally {
        setIsSubmitting(false);
      }
    };
    run();
  }, [dapp.address, dapp.abi, instance, ethersSigner, fhevmDecryptionSignatureStorage]);

  const decryptCheckResults = useCallback(() => {
    if (!dapp.address || !instance || !ethersSigner) return;
    const addr = dapp.address as `0x${string}`;
    const handles: { handle: string; contractAddress: `0x${string}` }[] = [];
    if (eligibilityResult?.handle) handles.push({ handle: eligibilityResult.handle, contractAddress: addr });
    if (avgResult?.handle) handles.push({ handle: avgResult.handle, contractAddress: addr });
    if (handles.length === 0) { setMessage("No handles to decrypt"); return; }
    setMessage("Start decrypt checks");
    const run = async () => {
      try {
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [addr],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );
        if (!sig) { setMessage("Unable to build FHEVM decryption signature"); return; }
        const res = await instance.userDecrypt(
          handles,
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );
        if (eligibilityResult?.handle) {
          const raw = res[eligibilityResult.handle];
          const clearVal = normalizeBoolValue(raw);
          if (clearVal !== undefined) setEligibilityResult({ handle: eligibilityResult.handle, clear: clearVal });
        }
        if (avgResult?.handle) {
          const raw = res[avgResult.handle];
          const clearVal = normalizeBoolValue(raw);
          if (clearVal !== undefined) setAvgResult({ handle: avgResult.handle, clear: clearVal });
        }
        setMessage("Decrypt checks completed");
      } catch (e: any) {
        setMessage("decrypt checks failed: " + String(e));
      }
    };
    run();
  }, [dapp.address, instance, ethersSigner, fhevmDecryptionSignatureStorage, eligibilityResult?.handle, avgResult?.handle]);

  return {
    contractAddress: dapp.address,
    isDeployed,
    canRefresh,
    canDecrypt,
    canSubmit,
    refreshMyRecord,
    decryptMyRecord,
    submitRecord,
    checkEligibility,
    checkAvg,
    canDecryptChecks,
    decryptCheckResults,
    eligibilityResult,
    avgResult,
    myRecordHandle,
    clearMyRecord,
    isRefreshing,
    isDecrypting,
    isSubmitting,
    message,
  };
};



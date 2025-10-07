"use client";

import React from "react";
import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../fhevm/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../fhevm/hooks/metamask/useMetaMaskEthersSigner";
import { useEncryptEvaluation } from "../hooks/useEncryptEvaluation";
import { Guide } from "./Guide";

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
  },
  header: {
    background: "linear-gradient(135deg, #8b0000 0%, #a00000 100%)",
    color: "#ffffff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(139, 0, 0, 0.3)",
    marginBottom: "30px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "10px",
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: "16px",
    opacity: 0.9,
    textAlign: "center" as const,
  },
  connectContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh",
    gap: "24px",
  },
  connectCard: {
    background: "#ffffff",
    padding: "48px",
    borderRadius: "20px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
    textAlign: "center" as const,
    maxWidth: "480px",
  },
  connectTitle: {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#2c2c2c",
  },
  connectDescription: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "32px",
  },
  button: {
    background: "linear-gradient(135deg, #006400 0%, #0a5000 100%)",
    color: "#ffffff",
    border: "none",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0, 100, 0, 0.3)",
    transition: "all 0.3s ease",
  },
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(0, 100, 0, 0.4)",
  },
  buttonDisabled: {
    background: "#cccccc",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  buttonSecondary: {
    background: "linear-gradient(135deg, #8b0000 0%, #a00000 100%)",
    boxShadow: "0 4px 12px rgba(139, 0, 0, 0.3)",
  },
  statusBar: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    marginBottom: "30px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  statusItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  statusLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  statusValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#2c2c2c",
    wordBreak: "break-all" as const,
  },
  tabContainer: {
    marginBottom: "30px",
  },
  tabList: {
    display: "flex",
    gap: "12px",
    borderBottom: "2px solid rgba(0, 0, 0, 0.1)",
    marginBottom: "30px",
    flexWrap: "wrap" as const,
  },
  tab: {
    background: "transparent",
    border: "none",
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#666",
    cursor: "pointer",
    borderBottom: "3px solid transparent",
    transition: "all 0.3s ease",
  },
  tabActive: {
    color: "#006400",
    borderBottom: "3px solid #006400",
  },
  card: {
    background: "#ffffff",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "24px",
    color: "#2c2c2c",
    borderBottom: "3px solid #006400",
    paddingBottom: "12px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c2c2c",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #ddd",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.3s ease",
    background: "#fafafa",
    color: "#2c2c2c",
  },
  inputFocus: {
    borderColor: "#006400",
    background: "#ffffff",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "15px",
    color: "#2c2c2c",
    cursor: "pointer",
  },
  dataGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  dataItem: {
    padding: "16px",
    background: "#f8f8f8",
    borderRadius: "10px",
    border: "2px solid #e8e8e8",
  },
  dataLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#666",
    marginBottom: "6px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  dataValue: {
    fontSize: "14px",
    color: "#2c2c2c",
    fontWeight: "500",
    wordBreak: "break-all" as const,
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap" as const,
  },
  message: {
    background: "#ffffff",
    padding: "16px 24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    marginTop: "24px",
    borderLeft: "4px solid #006400",
    fontSize: "15px",
    color: "#2c2c2c",
  },
};

export function App() {
  const [activeTab, setActiveTab] = React.useState<"guide" | "record" | "submit" | "checks">("guide");
  const { storage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const { instance, status, error } = useFhevm({ provider, chainId, initialMockChains, enabled: true });

  const dapp = useEncryptEvaluation({
    instance,
    fhevmDecryptionSignatureStorage: storage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  if (!isConnected) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Encrypted Evaluation System</h1>
          <p style={styles.subtitle}>FHEVM-based Secure Assessment Platform</p>
        </div>
        <div style={styles.connectContainer}>
          <div style={styles.connectCard}>
            <h2 style={styles.connectTitle}>Welcome</h2>
            <p style={styles.connectDescription}>
              Connect your MetaMask wallet to access the encrypted evaluation system and manage your secure assessment records.
            </p>
            <button style={styles.button} onClick={connect}>
              Connect MetaMask
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Encrypted Evaluation System</h1>
        <p style={styles.subtitle}>Secure Assessment Management with FHEVM Technology</p>
      </div>

      <div style={styles.statusBar}>
        <div style={styles.statusItem}>
          <div style={styles.statusLabel}>FHEVM Status</div>
          <div style={styles.statusValue}>{status}</div>
        </div>
        <div style={styles.statusItem}>
          <div style={styles.statusLabel}>Chain ID</div>
          <div style={styles.statusValue}>{String(chainId)}</div>
        </div>
        <div style={styles.statusItem}>
          <div style={styles.statusLabel}>Account</div>
          <div style={styles.statusValue}>{accounts?.[0] ? `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` : "-"}</div>
        </div>
        <div style={styles.statusItem}>
          <div style={styles.statusLabel}>Contract</div>
          <div style={styles.statusValue}>{dapp.contractAddress ? `${dapp.contractAddress.slice(0, 6)}...${dapp.contractAddress.slice(-4)}` : "Not deployed"}</div>
        </div>
        {error && (
          <div style={styles.statusItem}>
            <div style={styles.statusLabel}>Error</div>
            <div style={{...styles.statusValue, color: "#a00000"}}>{error.message}</div>
          </div>
        )}
      </div>

      <div style={styles.tabContainer}>
        <div style={styles.tabList}>
          <button
            style={{...styles.tab, ...(activeTab === "guide" ? styles.tabActive : {})}}
            onClick={() => setActiveTab("guide")}
          >
            📖 User Guide
          </button>
          <button
            style={{...styles.tab, ...(activeTab === "record" ? styles.tabActive : {})}}
            onClick={() => setActiveTab("record")}
          >
            🔒 My Record
          </button>
          <button
            style={{...styles.tab, ...(activeTab === "submit" ? styles.tabActive : {})}}
            onClick={() => setActiveTab("submit")}
          >
            📝 Submit/Update
          </button>
          <button
            style={{...styles.tab, ...(activeTab === "checks" ? styles.tabActive : {})}}
            onClick={() => setActiveTab("checks")}
          >
            ✅ Encrypted Checks
          </button>
        </div>

        {activeTab === "guide" && <Guide />}

        {activeTab === "record" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>My Encrypted Record</h2>
            
            <h3 style={{fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#8b0000"}}>
              Encrypted Handles
            </h3>
            <div style={styles.dataGrid}>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Score Handle</div>
                <div style={styles.dataValue}>{dapp.myRecordHandle?.score ?? "-"}</div>
              </div>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Contribution Handle</div>
                <div style={styles.dataValue}>{dapp.myRecordHandle?.contribution ?? "-"}</div>
              </div>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Grade Handle</div>
                <div style={styles.dataValue}>{dapp.myRecordHandle?.grade ?? "-"}</div>
              </div>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Passed Handle</div>
                <div style={styles.dataValue}>{dapp.myRecordHandle?.passed ?? "-"}</div>
              </div>
            </div>

            <h3 style={{fontSize: "18px", fontWeight: "600", margin: "24px 0 16px", color: "#006400"}}>
              Decrypted Values
            </h3>
            <div style={styles.dataGrid}>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Clear Score</div>
                <div style={styles.dataValue}>
                  {dapp.clearMyRecord?.score ? String(dapp.clearMyRecord.score.clear) : "-"}
                </div>
              </div>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Clear Contribution</div>
                <div style={styles.dataValue}>
                  {dapp.clearMyRecord?.contribution ? String(dapp.clearMyRecord.contribution.clear) : "-"}
                </div>
              </div>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Clear Grade</div>
                <div style={styles.dataValue}>
                  {dapp.clearMyRecord?.grade ? String(dapp.clearMyRecord.grade.clear) : "-"}
                </div>
              </div>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Clear Passed</div>
                <div style={styles.dataValue}>
                  {dapp.clearMyRecord?.passed ? String(dapp.clearMyRecord.passed.clear) : "-"}
                </div>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                style={{...styles.button, ...(dapp.canRefresh ? {} : styles.buttonDisabled)}}
                onClick={dapp.refreshMyRecord}
                disabled={!dapp.canRefresh}
              >
                🔄 Refresh Record
              </button>
              <button
                style={{...styles.button, ...styles.buttonSecondary, ...(dapp.canDecrypt ? {} : styles.buttonDisabled)}}
                onClick={dapp.decryptMyRecord}
                disabled={!dapp.canDecrypt}
              >
                🔓 Decrypt Record
              </button>
            </div>
          </div>
        )}

        {activeTab === "submit" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Submit or Update Record</h2>
            <p style={{marginBottom: "24px", color: "#666", fontSize: "15px"}}>
              Enter your evaluation data below. All values will be encrypted before submission to ensure privacy.
            </p>
            <SubmitForm onSubmit={dapp.submitRecord} disabled={!dapp.canSubmit} />
          </div>
        )}

        {activeTab === "checks" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Encrypted Verification Checks</h2>
            <CheckForm onEligible={dapp.checkEligibility} onAvg={dapp.checkAvg} disabled={!dapp.canSubmit} />
            
            <h3 style={{fontSize: "18px", fontWeight: "600", margin: "32px 0 16px", color: "#8b0000"}}>
              Check Results
            </h3>
            <div style={styles.dataGrid}>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Eligibility Handle</div>
                <div style={styles.dataValue}>{dapp.eligibilityResult?.handle ?? "-"}</div>
              </div>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Eligibility Result</div>
                <div style={styles.dataValue}>
                  {dapp.eligibilityResult?.clear !== undefined ? String(dapp.eligibilityResult.clear) : "-"}
                </div>
              </div>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Average Check Handle</div>
                <div style={styles.dataValue}>{dapp.avgResult?.handle ?? "-"}</div>
              </div>
              <div style={styles.dataItem}>
                <div style={styles.dataLabel}>Average Check Result</div>
                <div style={styles.dataValue}>
                  {dapp.avgResult?.clear !== undefined ? String(dapp.avgResult.clear) : "-"}
                </div>
              </div>
            </div>

            <div style={{marginTop: "24px"}}>
              <button
                style={{...styles.button, ...styles.buttonSecondary, ...(dapp.canDecryptChecks ? {} : styles.buttonDisabled)}}
                onClick={dapp.decryptCheckResults}
                disabled={!dapp.canDecryptChecks}
              >
                🔓 Decrypt Check Results
              </button>
            </div>
          </div>
        )}
      </div>

      {dapp.message && (
        <div style={styles.message}>
          <strong>Status:</strong> {dapp.message}
        </div>
      )}
    </div>
  );
}

function SubmitForm({ onSubmit, disabled }: { onSubmit: (p: { score: number; contribution: number; grade: number; passed: boolean; cid?: string }) => void; disabled: boolean }) {
  const [score, setScore] = React.useState(80);
  const [contrib, setContrib] = React.useState(50);
  const [grade, setGrade] = React.useState(1);
  const [passed, setPassed] = React.useState(true);
  const [cid, setCid] = React.useState("");

  return (
    <div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Score (0-100)</label>
        <input
          style={styles.input}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          placeholder="Enter score"
          type="number"
          min="0"
          max="100"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Contribution (0-100)</label>
        <input
          style={styles.input}
          value={contrib}
          onChange={(e) => setContrib(Number(e.target.value))}
          placeholder="Enter contribution score"
          type="number"
          min="0"
          max="100"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Grade Level</label>
        <input
          style={styles.input}
          value={grade}
          onChange={(e) => setGrade(Number(e.target.value))}
          placeholder="Enter grade"
          type="number"
          min="1"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.checkboxLabel}>
          <input
            checked={passed}
            onChange={(e) => setPassed(e.target.checked)}
            type="checkbox"
            style={{width: "18px", height: "18px", cursor: "pointer"}}
          />
          <span>Passed Assessment</span>
        </label>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Content ID (Optional)</label>
        <input
          style={styles.input}
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          placeholder="Enter IPFS CID or other identifier"
        />
      </div>

      <button
        style={{...styles.button, width: "100%", ...(disabled ? styles.buttonDisabled : {})}}
        onClick={() => onSubmit({ score, contribution: contrib, grade, passed, cid })}
        disabled={disabled}
      >
        🔐 Encrypt and Submit Record
      </button>
    </div>
  );
}

function CheckForm({ onEligible, onAvg, disabled }: { onEligible: (p: { scoreThreshold: number; contribThreshold: number }) => void; onAvg: (p: { threshold: number }) => void; disabled: boolean }) {
  const [s, setS] = React.useState(60);
  const [c, setC] = React.useState(40);
  const [a, setA] = React.useState(70);

  return (
    <div>
      <div style={{marginBottom: "32px", padding: "24px", background: "#f8f8f8", borderRadius: "12px", border: "2px solid #e8e8e8"}}>
        <h3 style={{fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#006400"}}>
          Eligibility Check
        </h3>
        <p style={{marginBottom: "16px", color: "#666", fontSize: "14px"}}>
          Verify if your record meets the minimum requirements for score and contribution.
        </p>
        
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px"}}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Minimum Score</label>
            <input
              style={styles.input}
              value={s}
              onChange={(e) => setS(Number(e.target.value))}
              placeholder="Score threshold"
              type="number"
              min="0"
              max="100"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Minimum Contribution</label>
            <input
              style={styles.input}
              value={c}
              onChange={(e) => setC(Number(e.target.value))}
              placeholder="Contribution threshold"
              type="number"
              min="0"
              max="100"
            />
          </div>
        </div>

        <button
          style={{...styles.button, width: "100%", ...(disabled ? styles.buttonDisabled : {})}}
          onClick={() => onEligible({ scoreThreshold: s, contribThreshold: c })}
          disabled={disabled}
        >
          ✅ Check Eligibility
        </button>
      </div>

      <div style={{padding: "24px", background: "#f8f8f8", borderRadius: "12px", border: "2px solid #e8e8e8"}}>
        <h3 style={{fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#8b0000"}}>
          Average Score Check
        </h3>
        <p style={{marginBottom: "16px", color: "#666", fontSize: "14px"}}>
          Verify if the average score across all records meets the specified threshold.
        </p>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Average Score Threshold</label>
          <input
            style={styles.input}
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            placeholder="Average threshold"
            type="number"
            min="0"
            max="100"
          />
        </div>

        <button
          style={{...styles.button, ...styles.buttonSecondary, width: "100%", ...(disabled ? styles.buttonDisabled : {})}}
          onClick={() => onAvg({ threshold: a })}
          disabled={disabled}
        >
          📊 Check Average Score
        </button>
      </div>
    </div>
  );
}



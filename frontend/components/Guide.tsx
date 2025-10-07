"use client";

import React from "react";

const guideStyles = {
  container: {
    background: "#ffffff",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#2c2c2c",
    borderBottom: "3px solid #006400",
    paddingBottom: "12px",
  },
  intro: {
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#555",
    marginBottom: "28px",
    padding: "16px",
    background: "#f8f8f8",
    borderRadius: "10px",
    borderLeft: "4px solid #006400",
  },
  section: {
    marginBottom: "28px",
  },
  sectionTitle: {
    fontSize: "19px",
    fontWeight: "600",
    color: "#8b0000",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  subsectionTitle: {
    fontSize: "17px",
    fontWeight: "600",
    color: "#006400",
    marginBottom: "12px",
    marginTop: "20px",
  },
  list: {
    marginLeft: "24px",
    marginBottom: "16px",
  },
  listItem: {
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#444",
    marginBottom: "10px",
  },
  orderedList: {
    marginLeft: "24px",
    marginBottom: "16px",
    counterReset: "item",
    listStyle: "none",
  },
  orderedListItem: {
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#444",
    marginBottom: "12px",
    paddingLeft: "8px",
    position: "relative" as const,
  },
  highlight: {
    background: "linear-gradient(120deg, rgba(0, 100, 0, 0.1) 0%, rgba(0, 100, 0, 0.05) 100%)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "600",
    color: "#006400",
  },
  note: {
    background: "#fff9e6",
    padding: "16px 20px",
    borderRadius: "10px",
    border: "2px solid #ffe066",
    borderLeft: "4px solid #8b0000",
    fontSize: "14px",
    lineHeight: "1.7",
    color: "#444",
    marginTop: "20px",
  },
  emoji: {
    fontSize: "22px",
  },
};

export function Guide() {
  return (
    <div style={guideStyles.container}>
      <h2 style={guideStyles.title}>User Guide - Encrypted Evaluation System</h2>
      
      <div style={guideStyles.intro}>
        <strong>Welcome!</strong> This guide explains how to securely upload your encrypted evaluation records and perform queries on both personal and collective results without revealing plaintext data on-chain. All sensitive information is protected using FHEVM (Fully Homomorphic Encryption Virtual Machine) technology.
      </div>

      <div style={guideStyles.section}>
        <h3 style={guideStyles.sectionTitle}>
          <span style={guideStyles.emoji}>🔑</span>
          Prerequisites
        </h3>
        <ul style={guideStyles.list}>
          <li style={guideStyles.listItem}>
            <strong>Connect MetaMask:</strong> Ensure your wallet is connected and you've switched to a supported network (Sepolia testnet or local Hardhat network).
          </li>
          <li style={guideStyles.listItem}>
            <strong>Wait for FHEVM:</strong> Check the status bar at the top. The FHEVM status should display <span style={guideStyles.highlight}>"ready"</span> before you can proceed with encrypted operations.
          </li>
          <li style={guideStyles.listItem}>
            <strong>Contract Deployment:</strong> Verify that the contract address is displayed in the status bar (not "Not deployed").
          </li>
        </ul>
      </div>

      <div style={guideStyles.section}>
        <h3 style={guideStyles.sectionTitle}>
          <span style={guideStyles.emoji}>📝</span>
          Step 1: Upload or Update Your Record
        </h3>
        <ol style={guideStyles.orderedList}>
          <li style={guideStyles.orderedListItem}>
            Navigate to the <span style={guideStyles.highlight}>"Submit/Update"</span> tab from the main menu.
          </li>
          <li style={guideStyles.orderedListItem}>
            Fill in your evaluation data:
            <ul style={{...guideStyles.list, marginTop: "8px"}}>
              <li style={guideStyles.listItem}><strong>Score:</strong> Enter a numeric value (0-100 recommended)</li>
              <li style={guideStyles.listItem}><strong>Contribution:</strong> Enter your contribution score (0-100)</li>
              <li style={guideStyles.listItem}><strong>Grade Level:</strong> Specify your grade level (numeric value)</li>
              <li style={guideStyles.listItem}><strong>Passed Assessment:</strong> Check or uncheck this box</li>
              <li style={guideStyles.listItem}><strong>Content ID (Optional):</strong> Enter an IPFS CID or other identifier if needed</li>
            </ul>
          </li>
          <li style={guideStyles.orderedListItem}>
            Click the <span style={guideStyles.highlight}>"Encrypt and Submit Record"</span> button. The application will encrypt your inputs locally using your wallet, then send the encrypted handles to the smart contract.
          </li>
          <li style={guideStyles.orderedListItem}>
            Wait for the transaction to be confirmed on the blockchain. This may take a few seconds to a minute depending on network conditions.
          </li>
          <li style={guideStyles.orderedListItem}>
            Navigate to the <span style={guideStyles.highlight}>"My Record"</span> tab and click <span style={guideStyles.highlight}>"Refresh Record"</span> to see your encrypted handles displayed.
          </li>
          <li style={guideStyles.orderedListItem}>
            If you want to view the decrypted plaintext values locally, click <span style={guideStyles.highlight}>"Decrypt Record"</span>. This operation is performed locally and does not cost gas.
          </li>
        </ol>
      </div>

      <div style={guideStyles.section}>
        <h3 style={guideStyles.sectionTitle}>
          <span style={guideStyles.emoji}>✅</span>
          Step 2: Personal Eligibility Check
        </h3>
        <p style={{...guideStyles.listItem, marginBottom: "14px"}}>
          Verify whether your encrypted record meets specific minimum requirements without revealing your actual scores.
        </p>
        <ol style={guideStyles.orderedList}>
          <li style={guideStyles.orderedListItem}>
            Go to the <span style={guideStyles.highlight}>"Encrypted Checks"</span> tab.
          </li>
          <li style={guideStyles.orderedListItem}>
            In the <strong>Eligibility Check</strong> section, enter the threshold values:
            <ul style={{...guideStyles.list, marginTop: "8px"}}>
              <li style={guideStyles.listItem}>Minimum Score (e.g., 60)</li>
              <li style={guideStyles.listItem}>Minimum Contribution (e.g., 40)</li>
            </ul>
          </li>
          <li style={guideStyles.orderedListItem}>
            Click <span style={guideStyles.highlight}>"Check Eligibility"</span>. Your thresholds will be encrypted locally and sent to the smart contract.
          </li>
          <li style={guideStyles.orderedListItem}>
            The function returns an <strong>encrypted boolean handle</strong> (not plaintext). The UI will not decrypt automatically.
          </li>
          <li style={guideStyles.orderedListItem}>
            Click <span style={guideStyles.highlight}>"Decrypt Check Results"</span> to manually decrypt the encrypted handle and view the plaintext result.
          </li>
        </ol>
      </div>

      <div style={guideStyles.section}>
        <h3 style={guideStyles.sectionTitle}>
          <span style={guideStyles.emoji}>📊</span>
          Step 3: Collective Average Score Check
        </h3>
        <p style={{...guideStyles.listItem, marginBottom: "14px"}}>
          Check whether the average score across all users in the system meets a specified threshold, all while maintaining encryption.
        </p>
        <ol style={guideStyles.orderedList}>
          <li style={guideStyles.orderedListItem}>
            In the <span style={guideStyles.highlight}>"Encrypted Checks"</span> tab, locate the <strong>Average Score Check</strong> section.
          </li>
          <li style={guideStyles.orderedListItem}>
            Enter your threshold value (e.g., 70) in the <strong>Average Score Threshold</strong> field.
          </li>
          <li style={guideStyles.orderedListItem}>
            Click <span style={guideStyles.highlight}>"Check Average Score"</span>. The contract will aggregate encrypted scores from all users and compute the result without decrypting individual values.
          </li>
          <li style={guideStyles.orderedListItem}>
            The contract returns an <strong>encrypted boolean handle</strong>. The UI will not decrypt automatically.
          </li>
          <li style={guideStyles.orderedListItem}>
            Use <span style={guideStyles.highlight}>"Decrypt Check Results"</span> to manually retrieve and display the plaintext result.
          </li>
        </ol>
      </div>

      <div style={guideStyles.note}>
        <h4 style={{fontSize: "16px", fontWeight: "700", marginBottom: "10px", color: "#2c2c2c"}}>
          ⚠️ Important Notes
        </h4>
        <ul style={{...guideStyles.list, marginBottom: 0}}>
          <li style={{...guideStyles.listItem, marginBottom: "8px"}}>
            <strong>Record Overwriting:</strong> Each new upload will overwrite your previous on-chain record. There is no version history maintained in the contract.
          </li>
          <li style={{...guideStyles.listItem, marginBottom: "8px"}}>
            <strong>Local Decryption:</strong> All decryption operations are performed locally using a wallet-signed session. These operations do not require gas fees.
          </li>
          <li style={{...guideStyles.listItem, marginBottom: "8px"}}>
            <strong>No Record Messages:</strong> If you see messages like "no record" or "no data", ensure that you (or at least one user) has uploaded evaluation records to the contract first.
          </li>
          <li style={{...guideStyles.listItem, marginBottom: 0}}>
            <strong>Privacy Guarantee:</strong> Your actual scores and data never appear in plaintext on the blockchain. All computations are performed on encrypted values using FHEVM technology.
          </li>
        </ul>
      </div>
    </div>
  );
}



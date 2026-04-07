"use client";

import { ethers } from "ethers";
import { getChainConfig, getRegistryAddress, getRegistryABI } from "./blockchain";

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export async function connectWallet(): Promise<string | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    alert("Please install MetaMask to use blockchain features!");
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    }) as string[];
    return accounts[0] || null;
  } catch {
    console.error("Wallet connection failed");
    return null;
  }
}

export async function switchToL3Network(): Promise<boolean> {
  if (!window.ethereum) return false;
  const config = getChainConfig();

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${config.chainId.toString(16)}` }],
    });
    return true;
  } catch (switchError: unknown) {
    // Chain not added yet - add it
    const err = switchError as { code?: number };
    if (err.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${config.chainId.toString(16)}`,
              chainName: config.chainName,
              rpcUrls: [config.rpcUrl],
              blockExplorerUrls: [config.blockExplorer],
            },
          ],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export async function registerPredictionOnChain(
  storyHash: string,
  predictionHash: string,
  confidence: number
): Promise<string | null> {
  if (!window.ethereum) return null;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      getRegistryAddress(),
      getRegistryABI(),
      signer
    );

    const tx = await contract.registerPrediction(
      storyHash,
      predictionHash,
      confidence
    );
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error("On-chain registration failed:", error);
    return null;
  }
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

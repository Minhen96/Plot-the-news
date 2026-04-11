import { ethers } from 'ethers'

// ── Chain config ──────────────────────────────────────────────────────────────

export const CHAIN_CONFIG = {
  chainId: 18441,
  chainName: 'DCAI L3 Testnet',
  rpcUrl: process.env.NEXT_PUBLIC_L3_RPC_URL ?? 'http://139.180.140.143/rpc/',
  blockExplorer: process.env.NEXT_PUBLIC_L3_EXPLORER ?? 'http://139.180.140.143/',
  nativeCurrency: { name: 'tDCAI', symbol: 'tDCAI', decimals: 18 },
} as const

export const REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ?? ''

// ── ABI (minimal — only what the frontend needs) ─────────────────────────────

export const REGISTRY_ABI = [
  'function registerPrediction(bytes32 storyHash, bytes32 predictionHash, uint8 confidence) external',
  'function getPrediction(address user, bytes32 storyHash) external view returns (bytes32, uint8, uint256)',
  'function getOutcome(bytes32 storyHash) external view returns (bytes32, uint256)',
  'function getUserScore(address user) external view returns (uint256, uint256, uint256)',
  'function hasBadge(address user, uint8 badgeId) external view returns (bool)',
  'event PredictionRegistered(address indexed user, bytes32 indexed storyHash, bytes32 predictionHash, uint8 confidence, uint256 timestamp)',
] as const

// ── Hashing ───────────────────────────────────────────────────────────────────
// Uses keccak256(utf8 bytes) so any string (including non-hex demo addresses)
// is valid input. Consistent between client and server.

export function hashPrediction(
  storyId: string,
  optionId: string,
  userAddress: string,
  timestamp: number
): string {
  return ethers.keccak256(
    ethers.toUtf8Bytes(`${storyId}:${optionId}:${userAddress}:${timestamp}`)
  )
}

export function hashStory(storyId: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(storyId))
}

export function hashOutcome(storyId: string, outcomeId: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(`${storyId}:${outcomeId}`))
}

// ── Explorer URL helper ───────────────────────────────────────────────────────

export function txExplorerUrl(txHash: string): string {
  return `${CHAIN_CONFIG.blockExplorer}tx/${txHash}`
}

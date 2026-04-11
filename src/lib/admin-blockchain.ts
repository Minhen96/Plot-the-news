/**
 * admin-blockchain.ts — SERVER SIDE ONLY
 *
 * Uses the admin wallet (ADMIN_PRIVATE_KEY) to call owner-only contract methods:
 *   - recordOutcome()
 *   - updateReputation()
 *   - mintBadge()
 *
 * Never import this file in client components.
 */

import { ethers } from 'ethers'
import { REGISTRY_ABI, REGISTRY_ADDRESS, CHAIN_CONFIG } from './blockchain'

// Full ABI including owner-only functions (extends the minimal client ABI)
const ADMIN_ABI = [
  ...REGISTRY_ABI,
  'function recordOutcome(bytes32 storyHash, bytes32 outcomeHash) external',
  'function updateReputation(address user, uint256 points) external',
  'function mintBadge(address user, uint8 badgeId) external',
]

function getAdminContract() {
  // Priority: explicit server RPC → direct no-auth RPC → public RPC
  const rpcUrl =
    process.env.L3_RPC_URL ??
    process.env.L3_RPC_URL_DIRECT ??
    CHAIN_CONFIG.rpcUrl
  const privateKey = process.env.ADMIN_PRIVATE_KEY

  if (!privateKey) throw new Error('ADMIN_PRIVATE_KEY not set')
  if (!REGISTRY_ADDRESS) throw new Error('NEXT_PUBLIC_REGISTRY_ADDRESS not set')

  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  return new ethers.Contract(REGISTRY_ADDRESS, ADMIN_ABI, wallet)
}

export async function recordOutcomeOnChain(
  storyHash: string,
  outcomeHash: string
): Promise<string> {
  const contract = getAdminContract()
  const tx = await contract.recordOutcome(storyHash, outcomeHash)
  const receipt = await tx.wait()
  return receipt.hash as string
}

export async function updateReputationOnChain(
  userAddress: string,
  points: number
): Promise<string> {
  const contract = getAdminContract()
  const tx = await contract.updateReputation(userAddress, BigInt(points))
  const receipt = await tx.wait()
  return receipt.hash as string
}

export async function mintBadgeOnChain(
  userAddress: string,
  badgeId: number
): Promise<string> {
  const contract = getAdminContract()
  const tx = await contract.mintBadge(userAddress, badgeId)
  const receipt = await tx.wait()
  return receipt.hash as string
}

// Badge IDs matching the contract
export const BADGE_IDS = {
  analyst: 1,
  strategist: 2,
  oracle: 3,
} as const

'use client'

import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { REGISTRY_ABI, REGISTRY_ADDRESS, CHAIN_CONFIG } from './blockchain'

export interface RegisterPredictionArgs {
  storyHash: string      // bytes32 hex
  predictionHash: string // bytes32 hex
  confidence: number     // 1-100
}

export interface ChainTxResult {
  txHash: string
  blockNumber: number
}

/**
 * Returns a function that signs and submits registerPrediction() on DCAI L3
 * using the user's Privy-connected wallet.
 *
 * Usage:
 *   const registerOnChain = useRegisterPrediction()
 *   const result = await registerOnChain({ storyHash, predictionHash, confidence })
 */
export function useRegisterPrediction() {
  const { wallets } = useWallets()

  return async function registerOnChain(
    args: RegisterPredictionArgs
  ): Promise<ChainTxResult> {
    const wallet = wallets[0]
    if (!wallet) throw new Error('No wallet connected')

    // Switch to DCAI L3 if needed
    await wallet.switchChain(CHAIN_CONFIG.chainId)

    const eip1193 = await wallet.getEthereumProvider()
    const provider = new ethers.BrowserProvider(eip1193)
    const signer = await provider.getSigner()

    if (!REGISTRY_ADDRESS) throw new Error('REGISTRY_ADDRESS not configured')

    const contract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer)

    const tx = await contract.registerPrediction(
      args.storyHash,
      args.predictionHash,
      args.confidence
    )

    const receipt = await tx.wait()

    return {
      txHash: receipt.hash as string,
      blockNumber: receipt.blockNumber as number,
    }
  }
}

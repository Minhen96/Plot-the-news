/**
 * deploy-registry.mjs
 *
 * Compiles contracts/FutureLensRegistry.sol and deploys it to DCAI L3.
 * Reads ADMIN_PRIVATE_KEY and L3_RPC_URL_DIRECT from .env.local automatically.
 *
 * Run:  node scripts/deploy-registry.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { ethers } from 'ethers'
import solc from 'solc'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = resolve(__dir, '..')

// ── Load .env.local ───────────────────────────────────────────────────────
const envLines = readFileSync(resolve(root, '.env.local'), 'utf8').split('\n')
const env = {}
for (const line of envLines) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx).trim()
  const val = trimmed.slice(idx + 1).trim().replace(/^"|"$/g, '')
  env[key] = val
}

const PRIVATE_KEY = env['ADMIN_PRIVATE_KEY']
const RPC_URL     = env['L3_RPC_URL_DIRECT'] ?? env['NEXT_PUBLIC_L3_RPC_URL'] ?? 'http://139.180.188.61:8545'

if (!PRIVATE_KEY || PRIVATE_KEY === '0x_your_deployer_wallet_private_key') {
  console.error('❌  ADMIN_PRIVATE_KEY not set in .env.local')
  process.exit(1)
}

const cleanKey = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY.slice(2) : PRIVATE_KEY
if (cleanKey.length !== 64) {
  console.error(`❌  ADMIN_PRIVATE_KEY is ${cleanKey.length} hex chars — must be exactly 64.`)
  console.error('    Re-export from MetaMask: Account Details → Show private key')
  process.exit(1)
}

// ── Load Solidity source ──────────────────────────────────────────────────
const SOURCE = readFileSync(resolve(root, 'contracts/FutureLensRegistry.sol'), 'utf8')

// ── Compile ───────────────────────────────────────────────────────────────
console.log('⚙  Compiling contracts/FutureLensRegistry.sol...')

const input = {
  language: 'Solidity',
  sources: { 'FutureLensRegistry.sol': { content: SOURCE } },
  settings: {
    evmVersion: 'paris',   // avoids PUSH0 opcode — compatible with DCAI L3
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
  },
}

const output = JSON.parse(solc.compile(JSON.stringify(input)))

if (output.errors?.some(e => e.severity === 'error')) {
  console.error('❌  Compilation errors:')
  output.errors.filter(e => e.severity === 'error').forEach(e => console.error(e.formattedMessage))
  process.exit(1)
}

const contract = output.contracts['FutureLensRegistry.sol']['FutureLensRegistry']
const abi      = contract.abi
const bytecode = '0x' + contract.evm.bytecode.object
console.log('✅  Compiled successfully')

// ── Connect ───────────────────────────────────────────────────────────────
console.log(`\n🌐  Connecting to RPC: ${RPC_URL}`)

const provider = new ethers.JsonRpcProvider(RPC_URL)
let network
try {
  network = await provider.getNetwork()
  console.log(`    Chain ID: ${network.chainId}`)
  if (network.chainId !== 18441n) {
    console.warn(`⚠   Expected chain 18441, got ${network.chainId}`)
  }
} catch {
  console.error('❌  Could not connect to RPC.')
  console.error(`    URL: ${RPC_URL}`)
  process.exit(1)
}

const wallet  = new ethers.Wallet(PRIVATE_KEY, provider)
const balance = await provider.getBalance(wallet.address)
console.log(`\n💳  Deployer : ${wallet.address}`)
console.log(`    Balance  : ${ethers.formatEther(balance)} tDCAI`)

if (balance === 0n) {
  console.error('\n❌  Wallet has 0 tDCAI — claim gas tokens first:')
  console.error(`    curl -X POST http://139.180.140.143/faucet/request \\`)
  console.error(`      -H 'Content-Type: application/json' \\`)
  console.error(`      -d '{"address":"${wallet.address}"}'`)
  process.exit(1)
}

// ── Deploy ────────────────────────────────────────────────────────────────
console.log('\n🚀  Deploying FutureLensRegistry...')
const factory  = new ethers.ContractFactory(abi, bytecode, wallet)
const deployed = await factory.deploy()
console.log(`    Tx hash: ${deployed.deploymentTransaction()?.hash}`)
console.log('    Waiting for confirmation...')

await deployed.waitForDeployment()
const address = await deployed.getAddress()

console.log(`\n✅  DEPLOYED!`)
console.log(`    Contract address : ${address}`)
console.log(`    Explorer         : http://139.180.140.143/address/${address}`)
console.log(`\n📋  Add this to your .env.local:`)
console.log(`    NEXT_PUBLIC_REGISTRY_ADDRESS=${address}`)

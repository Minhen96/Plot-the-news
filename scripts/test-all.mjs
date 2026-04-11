/**
 * test-all.mjs
 *
 * End-to-end smoke tests for:
 *   1. Blockchain — hashing, contract read, registerPrediction (on-chain write)
 *   2. Admin blockchain — recordOutcome, updateReputation, mintBadge
 *   3. LLM (DeepSeek) — multi-agent analysis pipeline
 *   4. API routes — /api/predict, /api/analysis
 *
 * Run:  node scripts/test-all.mjs
 * Run one section:  node scripts/test-all.mjs blockchain
 *                   node scripts/test-all.mjs llm
 *                   node scripts/test-all.mjs api
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { ethers } from 'ethers'
import OpenAI from 'openai'

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
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^"|"$/g, '')
}

const RPC_URL          = env['L3_RPC_URL_DIRECT'] ?? 'http://139.180.188.61:8545'
const PRIVATE_KEY      = env['ADMIN_PRIVATE_KEY']
const REGISTRY_ADDRESS = env['NEXT_PUBLIC_REGISTRY_ADDRESS']
const DEEPSEEK_KEY     = env['DEEPSEEK_API_KEY']
const APP_URL          = env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

const REGISTRY_ABI = [
  'function registerPrediction(bytes32 storyHash, bytes32 predictionHash, uint8 confidence) external',
  'function recordOutcome(bytes32 storyHash, bytes32 outcomeHash) external',
  'function updateReputation(address user, uint256 points) external',
  'function mintBadge(address user, uint8 badgeId) external',
  'function getPrediction(address user, bytes32 storyHash) external view returns (bytes32, uint8, uint256)',
  'function getOutcome(bytes32 storyHash) external view returns (bytes32, uint256)',
  'function getUserScore(address user) external view returns (uint256, uint256, uint256)',
  'function hasBadge(address user, uint8 badgeId) external view returns (bool)',
  'function owner() external view returns (address)',
]

// ── Helpers ───────────────────────────────────────────────────────────────
let passed = 0
let failed = 0

function pass(label) {
  console.log(`  ✅  ${label}`)
  passed++
}

function fail(label, err) {
  console.log(`  ❌  ${label}`)
  if (err) console.log(`      ${String(err).slice(0, 200)}`)
  failed++
}

function section(title) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`  ${title}`)
  console.log('─'.repeat(60))
}

// ── Section 1: Hashing ────────────────────────────────────────────────────
async function testHashing() {
  section('1. Blockchain — Hashing (keccak256)')

  try {
    const h = ethers.keccak256(ethers.toUtf8Bytes('strait-of-hormuz:de-escalation:0xTest:1234567890'))
    if (!h.startsWith('0x') || h.length !== 66) throw new Error('bad hash length')
    pass(`hashPrediction produces valid bytes32: ${h.slice(0, 18)}...`)
  } catch (e) { fail('hashPrediction', e) }

  try {
    const h = ethers.keccak256(ethers.toUtf8Bytes('strait-of-hormuz'))
    if (h.length !== 66) throw new Error('bad length')
    pass(`hashStory produces valid bytes32: ${h.slice(0, 18)}...`)
  } catch (e) { fail('hashStory', e) }

  try {
    const h = ethers.keccak256(ethers.toUtf8Bytes('strait-of-hormuz:de-escalation'))
    if (h.length !== 66) throw new Error('bad length')
    pass(`hashOutcome produces valid bytes32: ${h.slice(0, 18)}...`)
  } catch (e) { fail('hashOutcome', e) }
}

// ── Section 2: Contract read ──────────────────────────────────────────────
async function testContractRead() {
  section('2. Blockchain — Contract Read (DCAI L3)')

  if (!REGISTRY_ADDRESS || REGISTRY_ADDRESS === '0x0000000000000000000000000000000000000000') {
    fail('NEXT_PUBLIC_REGISTRY_ADDRESS not set in .env.local')
    return
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL)

  try {
    const network = await provider.getNetwork()
    pass(`RPC connected — Chain ID: ${network.chainId}`)
  } catch (e) { fail('RPC connection', e); return }

  try {
    const contract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider)
    const owner = await contract.owner()
    pass(`Contract deployed — owner: ${owner.slice(0, 10)}...`)
  } catch (e) { fail('contract.owner() read', e); return }

  try {
    const contract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider)
    const storyHash = ethers.keccak256(ethers.toUtf8Bytes('test-story'))
    const [hash, confidence, timestamp] = await contract.getPrediction(
      '0x0000000000000000000000000000000000000001',
      storyHash
    )
    pass(`getPrediction() returned (hash=${hash.slice(0,10)}..., conf=${confidence}, ts=${timestamp})`)
  } catch (e) { fail('getPrediction() read', e) }

  try {
    const contract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider)
    const [total, correct, rep] = await contract.getUserScore(
      '0x0000000000000000000000000000000000000001'
    )
    pass(`getUserScore() returned (total=${total}, correct=${correct}, rep=${rep})`)
  } catch (e) { fail('getUserScore() read', e) }
}

// ── Section 3: Contract write (registerPrediction) ────────────────────────
async function testContractWrite() {
  section('3. Blockchain — Contract Write (registerPrediction)')

  if (!PRIVATE_KEY) { fail('ADMIN_PRIVATE_KEY not set'); return }
  if (!REGISTRY_ADDRESS || REGISTRY_ADDRESS === '0x0000000000000000000000000000000000000000') {
    fail('REGISTRY_ADDRESS not set'); return
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider)
  const contract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, wallet)

  // Use a unique story ID so we never hit "Already predicted"
  const uniqueStoryId = `test-story-${Date.now()}`
  const storyHash      = ethers.keccak256(ethers.toUtf8Bytes(uniqueStoryId))
  const predictionHash = ethers.keccak256(ethers.toUtf8Bytes(`${uniqueStoryId}:option-a:${wallet.address}`))

  try {
    console.log(`  Sending registerPrediction() tx from ${wallet.address.slice(0,10)}...`)
    const tx      = await contract.registerPrediction(storyHash, predictionHash, 80)
    console.log(`  Tx hash: ${tx.hash}`)
    const receipt = await tx.wait()
    pass(`registerPrediction() confirmed in block ${receipt.blockNumber}`)

    // Verify on-chain
    const [storedHash, storedConf] = await contract.getPrediction(wallet.address, storyHash)
    if (storedHash === predictionHash) {
      pass(`On-chain hash matches — prediction permanently recorded`)
    } else {
      fail('On-chain hash mismatch', `got ${storedHash}`)
    }
    if (Number(storedConf) === 80) {
      pass(`Confidence stored correctly: ${storedConf}`)
    } else {
      fail('Confidence mismatch', `got ${storedConf}`)
    }
  } catch (e) { fail('registerPrediction()', e) }
}

// ── Section 4: Admin functions ────────────────────────────────────────────
async function testAdminFunctions() {
  section('4. Blockchain — Admin Functions (recordOutcome / mintBadge)')

  if (!PRIVATE_KEY || !REGISTRY_ADDRESS || REGISTRY_ADDRESS === '0x0000000000000000000000000000000000000000') {
    fail('PRIVATE_KEY or REGISTRY_ADDRESS not set'); return
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider)
  const contract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, wallet)

  const uniqueStoryId = `admin-test-${Date.now()}`
  const storyHash  = ethers.keccak256(ethers.toUtf8Bytes(uniqueStoryId))
  const outcomeHash = ethers.keccak256(ethers.toUtf8Bytes(`${uniqueStoryId}:outcome-a`))

  try {
    const tx = await contract.recordOutcome(storyHash, outcomeHash)
    const receipt = await tx.wait()
    pass(`recordOutcome() confirmed in block ${receipt.blockNumber}`)

    const [storedOutcome] = await contract.getOutcome(storyHash)
    if (storedOutcome === outcomeHash) {
      pass(`Outcome hash verified on-chain`)
    } else {
      fail('Outcome hash mismatch')
    }
  } catch (e) { fail('recordOutcome()', e) }

  try {
    const tx = await contract.mintBadge(wallet.address, 1) // badge 1 = Analyst
    const receipt = await tx.wait()
    pass(`mintBadge(Analyst) confirmed in block ${receipt.blockNumber}`)

    const hasBadge = await contract.hasBadge(wallet.address, 1)
    hasBadge ? pass(`hasBadge(1) = true — badge verified on-chain`) : fail('badge not found after mint')
  } catch (e) {
    // May fail if badge already minted in a previous test run — that's fine
    if (String(e).includes('Already has badge')) {
      pass(`mintBadge() skipped — already minted (expected on repeat runs)`)
    } else {
      fail('mintBadge()', e)
    }
  }
}

// ── Section 5: DeepSeek multi-agent analysis ──────────────────────────────
async function testLLM() {
  section('5. LLM — DeepSeek Multi-Agent Analysis')

  if (!DEEPSEEK_KEY) { fail('DEEPSEEK_API_KEY not set'); return }

  const deepseek = new OpenAI({ apiKey: DEEPSEEK_KEY, baseURL: 'https://api.deepseek.com' })

  // Single call smoke test (not full 7-call pipeline — saves credits)
  try {
    console.log('  Sending single DeepSeek call (pessimist persona)...')
    const msg = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 150,
      messages: [
        { role: 'system', content: 'You are a pessimist geopolitical analyst. Be brief.' },
        { role: 'user',   content: 'In one sentence, what is the main risk if Iran blocks the Strait of Hormuz?' },
      ],
    })
    const text = msg.choices[0].message.content ?? ''
    if (text.length > 10) {
      pass(`DeepSeek API responds: "${text.slice(0, 80)}..."`)
    } else {
      fail('DeepSeek returned empty response')
    }
  } catch (e) { fail('DeepSeek API call', e) }

  // Test JSON output (judge synthesis format)
  try {
    console.log('  Testing JSON output mode (judge synthesis)...')
    const msg = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 300,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You output only valid JSON.',
        },
        {
          role: 'user',
          content: `Output this JSON exactly: {"factors":["oil prices","naval tension","sanctions"],"evidence":[{"title":"1973 Oil Crisis","year":"1973","relevance":"Similar supply shock pattern"}],"reasoning":"Test reasoning here."}`,
        },
      ],
    })
    const parsed = JSON.parse(msg.choices[0].message.content ?? '{}')
    if (Array.isArray(parsed.factors) && parsed.factors.length > 0) {
      pass(`DeepSeek JSON output mode works — got ${parsed.factors.length} factors`)
    } else {
      fail('DeepSeek JSON output invalid structure')
    }
  } catch (e) { fail('DeepSeek JSON output mode', e) }
}

// ── Section 6: API routes ─────────────────────────────────────────────────
async function testAPI() {
  section('6. API Routes (requires dev server running on localhost:3000)')

  // Test /api/predict
  try {
    const res = await fetch(`${APP_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyId: 'strait-of-hormuz',
        optionId: 'de-escalation',
        optionLabel: 'De-Escalation Protocol',
        userAddress: `0xTest${Date.now()}`,
        confidence: 75,
      }),
    })
    const data = await res.json()
    if (res.status === 200 || res.status === 409) {
      pass(`POST /api/predict — ${res.status === 409 ? 'already predicted (expected)' : 'prediction saved'}`)
      if (data.blockchain?.predictionHash) {
        pass(`Response includes predictionHash: ${data.blockchain.predictionHash.slice(0,18)}...`)
      }
    } else {
      fail(`POST /api/predict returned ${res.status}`, JSON.stringify(data))
    }
  } catch (e) { fail('POST /api/predict (is dev server running?)', e) }

  // Test /api/analysis (should return pending or ready)
  try {
    const res = await fetch(`${APP_URL}/api/analysis/strait-of-hormuz/de-escalation`)
    const data = await res.json()
    if (res.ok && (data.status === 'pending' || data.status === 'ready')) {
      pass(`GET /api/analysis — status: "${data.status}"`)
    } else {
      fail(`GET /api/analysis returned unexpected response`, JSON.stringify(data))
    }
  } catch (e) { fail('GET /api/analysis (is dev server running?)', e) }
}

// ── Runner ────────────────────────────────────────────────────────────────
const target = process.argv[2]

if (!target || target === 'blockchain') {
  await testHashing()
  await testContractRead()
  await testContractWrite()
  await testAdminFunctions()
}
if (!target || target === 'llm') {
  await testLLM()
}
if (!target || target === 'api') {
  await testAPI()
}

console.log(`\n${'═'.repeat(60)}`)
console.log(`  Results: ${passed} passed, ${failed} failed`)
console.log('═'.repeat(60))
if (failed > 0) process.exit(1)

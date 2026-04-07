import { ethers } from "ethers";

// DCAI L3 on Base configuration
// These can be updated with actual DCAI L3 values
const CHAIN_CONFIG = {
  chainId: 12553, // DCAI L3 chain ID (update if different)
  chainName: "DCAI L3 on Base",
  rpcUrl: process.env.NEXT_PUBLIC_L3_RPC_URL || "https://rpc.dcai-l3.skybutter.com",
  blockExplorer: process.env.NEXT_PUBLIC_L3_EXPLORER || "https://explorer.dcai-l3.skybutter.com",
};

// Prediction Registry ABI (simplified for hackathon)
const PREDICTION_REGISTRY_ABI = [
  "function registerPrediction(bytes32 storyHash, bytes32 predictionHash, uint8 confidence) external",
  "function recordOutcome(bytes32 storyHash, bytes32 outcomeHash) external",
  "function getPrediction(address user, bytes32 storyHash) external view returns (bytes32 predictionHash, uint8 confidence, uint256 timestamp)",
  "function getOutcome(bytes32 storyHash) external view returns (bytes32 outcomeHash, uint256 timestamp)",
  "function getUserScore(address user) external view returns (uint256 total, uint256 correct, uint256 reputation)",
  "event PredictionRegistered(address indexed user, bytes32 indexed storyHash, bytes32 predictionHash, uint8 confidence, uint256 timestamp)",
  "event OutcomeRecorded(bytes32 indexed storyHash, bytes32 outcomeHash, uint256 timestamp)",
];

// Contract address (deploy during hackathon)
const REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

export function getChainConfig() {
  return CHAIN_CONFIG;
}

export function getRegistryAddress() {
  return REGISTRY_ADDRESS;
}

export function getRegistryABI() {
  return PREDICTION_REGISTRY_ABI;
}

// Hash helpers
export function hashPrediction(
  storyId: string,
  optionId: string,
  userAddress: string,
  timestamp: number
): string {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "string", "address", "uint256"],
      [storyId, optionId, userAddress, timestamp]
    )
  );
}

export function hashStory(storyId: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(storyId));
}

export function hashOutcome(storyId: string, outcomeId: string): string {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "string"],
      [storyId, outcomeId]
    )
  );
}

// Smart contract Solidity source (for deployment reference)
export const SOLIDITY_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChronicleChainRegistry {
    struct Prediction {
        bytes32 predictionHash;
        uint8 confidence;
        uint256 timestamp;
        bool exists;
    }

    struct Outcome {
        bytes32 outcomeHash;
        uint256 timestamp;
        bool exists;
    }

    struct UserScore {
        uint256 totalPredictions;
        uint256 correctPredictions;
        uint256 reputationScore;
    }

    mapping(address => mapping(bytes32 => Prediction)) public predictions;
    mapping(bytes32 => Outcome) public outcomes;
    mapping(address => UserScore) public userScores;

    address public owner;

    event PredictionRegistered(
        address indexed user,
        bytes32 indexed storyHash,
        bytes32 predictionHash,
        uint8 confidence,
        uint256 timestamp
    );

    event OutcomeRecorded(
        bytes32 indexed storyHash,
        bytes32 outcomeHash,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    function registerPrediction(
        bytes32 storyHash,
        bytes32 predictionHash,
        uint8 confidence
    ) external {
        require(!predictions[msg.sender][storyHash].exists, "Already predicted");
        require(confidence >= 1 && confidence <= 5, "Confidence 1-5");
        require(!outcomes[storyHash].exists, "Story already resolved");

        predictions[msg.sender][storyHash] = Prediction({
            predictionHash: predictionHash,
            confidence: confidence,
            timestamp: block.timestamp,
            exists: true
        });

        userScores[msg.sender].totalPredictions++;

        emit PredictionRegistered(
            msg.sender,
            storyHash,
            predictionHash,
            confidence,
            block.timestamp
        );
    }

    function recordOutcome(
        bytes32 storyHash,
        bytes32 outcomeHash
    ) external {
        require(msg.sender == owner, "Only owner");
        require(!outcomes[storyHash].exists, "Already resolved");

        outcomes[storyHash] = Outcome({
            outcomeHash: outcomeHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit OutcomeRecorded(storyHash, outcomeHash, block.timestamp);
    }

    function getPrediction(
        address user,
        bytes32 storyHash
    ) external view returns (bytes32, uint8, uint256) {
        Prediction memory p = predictions[user][storyHash];
        return (p.predictionHash, p.confidence, p.timestamp);
    }

    function getOutcome(
        bytes32 storyHash
    ) external view returns (bytes32, uint256) {
        Outcome memory o = outcomes[storyHash];
        return (o.outcomeHash, o.timestamp);
    }

    function getUserScore(
        address user
    ) external view returns (uint256, uint256, uint256) {
        UserScore memory s = userScores[user];
        return (s.totalPredictions, s.correctPredictions, s.reputationScore);
    }
}
`;

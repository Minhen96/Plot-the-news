// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FutureLensRegistry {

    // ── Structs ──────────────────────────────────────────────
    struct Prediction {
        bytes32 predictionHash;
        uint8   confidence;      // 1-100
        uint256 timestamp;
        bool    exists;
    }

    struct Outcome {
        bytes32 outcomeHash;
        uint256 timestamp;
        bool    exists;
    }

    struct UserScore {
        uint256 totalPredictions;
        uint256 correctPredictions;
        uint256 reputationScore;
    }

    // ── Storage ──────────────────────────────────────────────
    address public owner;

    // user → storyHash → Prediction
    mapping(address => mapping(bytes32 => Prediction)) public predictions;

    // storyHash → Outcome
    mapping(bytes32 => Outcome) public outcomes;

    // user → UserScore
    mapping(address => UserScore) public scores;

    // user → badgeId → earned
    mapping(address => mapping(uint8 => bool)) public badges;

    // ── Events ───────────────────────────────────────────────
    event PredictionRegistered(
        address indexed user,
        bytes32 indexed storyHash,
        bytes32 predictionHash,
        uint8   confidence,
        uint256 timestamp
    );
    event OutcomeRecorded(bytes32 indexed storyHash, bytes32 outcomeHash, uint256 timestamp);
    event ReputationUpdated(address indexed user, uint256 newScore);
    event BadgeMinted(address indexed user, uint8 badgeId);

    // ── Modifiers ────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ── User-callable ────────────────────────────────────────

    /// Called by user's wallet when they lock a prediction
    function registerPrediction(
        bytes32 storyHash,
        bytes32 predictionHash,
        uint8   confidence
    ) external {
        require(!predictions[msg.sender][storyHash].exists, "Already predicted");
        require(confidence >= 1 && confidence <= 100, "Confidence must be 1-100");
        require(!outcomes[storyHash].exists, "Story already resolved");

        predictions[msg.sender][storyHash] = Prediction({
            predictionHash: predictionHash,
            confidence:     confidence,
            timestamp:      block.timestamp,
            exists:         true
        });

        scores[msg.sender].totalPredictions++;

        emit PredictionRegistered(msg.sender, storyHash, predictionHash, confidence, block.timestamp);
    }

    // ── Owner-callable (backend admin wallet) ────────────────

    /// Called by backend after story resolves — locks the outcome on-chain
    function recordOutcome(bytes32 storyHash, bytes32 outcomeHash) external onlyOwner {
        require(!outcomes[storyHash].exists, "Already resolved");
        outcomes[storyHash] = Outcome({ outcomeHash: outcomeHash, timestamp: block.timestamp, exists: true });
        emit OutcomeRecorded(storyHash, outcomeHash, block.timestamp);
    }

    /// Called by backend after verifying a user's prediction was correct
    function updateReputation(address user, uint256 points) external onlyOwner {
        scores[user].reputationScore += points;
        scores[user].correctPredictions++;
        emit ReputationUpdated(user, scores[user].reputationScore);
    }

    /// Mint a non-transferable badge (SBT pattern — no transfer function)
    function mintBadge(address user, uint8 badgeId) external onlyOwner {
        require(!badges[user][badgeId], "Already has badge");
        badges[user][badgeId] = true;
        emit BadgeMinted(user, badgeId);
    }

    // ── View functions ───────────────────────────────────────

    function getPrediction(address user, bytes32 storyHash)
        external view returns (bytes32, uint8, uint256)
    {
        Prediction memory p = predictions[user][storyHash];
        return (p.predictionHash, p.confidence, p.timestamp);
    }

    function getOutcome(bytes32 storyHash)
        external view returns (bytes32, uint256)
    {
        Outcome memory o = outcomes[storyHash];
        return (o.outcomeHash, o.timestamp);
    }

    function getUserScore(address user)
        external view returns (uint256 total, uint256 correct, uint256 reputation)
    {
        UserScore memory s = scores[user];
        return (s.totalPredictions, s.correctPredictions, s.reputationScore);
    }

    function hasBadge(address user, uint8 badgeId) external view returns (bool) {
        return badges[user][badgeId];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint16, euint32, ebool, externalEuint8, externalEuint16, externalEuint32, externalEbool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Evaluation — FHEVM-based encrypted assessment and performance system
/// @notice Stores encrypted evaluation metrics and performs encrypted comparisons for eligibility and rewards.
/// @dev Mirrors Zama template patterns: FHE.fromExternal, FHE.add/sub/mul/gt/lt, FHE.select, and ACL via FHE.allowThis/allow.
contract EncryptEvaluation is SepoliaConfig {
    struct EncryptedRecord {
        euint32 score;      // e.g., exam score or performance score (0..100 or more)
        euint32 contribution;// contribution points
        euint16 grade;      // optional grade bucket
        ebool  passed;      // optional encrypted boolean
        bool exists;        // plaintext existence flag
    }

    mapping(address => EncryptedRecord) private _records;
    mapping(address => string) private _userCid;
    address[] private _users;

    // Paid query fee; part redistributed to data owners (demo purpose)
    uint256 public queryFeeWei;
    address public immutable owner;
    uint256 public protocolFees;
    mapping(address => uint256) public pendingRewards;

    event RecordUploaded(address indexed user, string cid);
    event CidUpdated(address indexed user, string cid);
    event RewardsAdded(uint256 total, uint256 perUser, uint256 usersCount);
    event RewardsWithdrawn(address indexed user, uint256 amount);
    event QueryFeeUpdated(uint256 newFee);

    constructor(uint256 _queryFeeWei) {
        owner = msg.sender;
        queryFeeWei = _queryFeeWei;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function setQueryFeeWei(uint256 _fee) external onlyOwner {
        queryFeeWei = _fee;
        emit QueryFeeUpdated(_fee);
    }

    /// @notice Upload or update caller's encrypted evaluation metrics
    /// @param scoreEnc encrypted score input
    /// @param contributionEnc encrypted contribution input
    /// @param gradeEnc encrypted grade input
    /// @param passedEnc encrypted boolean pass flag (optional, can be derived)
    /// @param inputProof relayer input proof
    /// @param cid optional off-chain encrypted metadata pointer (IPFS/Arweave)
    function upload(
        externalEuint32 scoreEnc,
        externalEuint32 contributionEnc,
        externalEuint16 gradeEnc,
        externalEbool passedEnc,
        bytes calldata inputProof,
        string calldata cid
    ) external {
        euint32 score = FHE.fromExternal(scoreEnc, inputProof);
        euint32 contribution = FHE.fromExternal(contributionEnc, inputProof);
        euint16 grade = FHE.fromExternal(gradeEnc, inputProof);
        ebool passed = FHE.fromExternal(passedEnc, inputProof);

        EncryptedRecord storage r = _records[msg.sender];
        if (!r.exists) {
            _users.push(msg.sender);
            r.exists = true;
        }

        r.score = score;
        r.contribution = contribution;
        r.grade = grade;
        r.passed = passed;

        // ACL: allow contract for computations; allow user for decryption
        FHE.allowThis(r.score);
        FHE.allowThis(r.contribution);
        FHE.allowThis(r.grade);
        FHE.allowThis(r.passed);

        FHE.allow(r.score, msg.sender);
        FHE.allow(r.contribution, msg.sender);
        FHE.allow(r.grade, msg.sender);
        FHE.allow(r.passed, msg.sender);

        if (bytes(cid).length > 0) {
            _userCid[msg.sender] = cid;
            emit CidUpdated(msg.sender, cid);
        }

        emit RecordUploaded(msg.sender, _userCid[msg.sender]);
    }

    /// @notice Grant decryption to a third party for current fields
    function grantAccess(address grantee) external {
        require(_records[msg.sender].exists, "no record");
        EncryptedRecord storage r = _records[msg.sender];
        FHE.allow(r.score, grantee);
        FHE.allow(r.contribution, grantee);
        FHE.allow(r.grade, grantee);
        FHE.allow(r.passed, grantee);
    }

    /// @notice Returns caller's encrypted record handles
    function getMyRecord()
        external
        view
        returns (euint32 score, euint32 contribution, euint16 grade, ebool passed)
    {
        EncryptedRecord storage r = _records[msg.sender];
        require(r.exists, "no record");
        return (r.score, r.contribution, r.grade, r.passed);
    }

    /// @notice Returns an account's encrypted record handles
    function getUserRecord(address user)
        external
        view
        returns (euint32 score, euint32 contribution, euint16 grade, ebool passed)
    {
        EncryptedRecord storage r = _records[user];
        require(r.exists, "no record");
        return (r.score, r.contribution, r.grade, r.passed);
    }

    function getUserCid(address user) external view returns (string memory) {
        return _userCid[user];
    }

    function usersCount() external view returns (uint256) {
        return _users.length;
    }

    /// @notice Encrypted threshold check: is score >= threshold and/or contribution >= threshold?
    /// @dev Returns encrypted boolean; ACL granted to caller.
    function isEligible(
        externalEuint32 scoreThresholdEnc,
        externalEuint32 contributionThresholdEnc,
        bytes calldata inputProof
    ) external returns (ebool) {
        require(_records[msg.sender].exists, "no record");

        euint32 sThresh = FHE.fromExternal(scoreThresholdEnc, inputProof);
        euint32 cThresh = FHE.fromExternal(contributionThresholdEnc, inputProof);

        EncryptedRecord storage r = _records[msg.sender];

        ebool scoreOk = FHE.ge(r.score, sThresh);
        ebool contribOk = FHE.ge(r.contribution, cThresh);
        ebool ok = FHE.and(scoreOk, contribOk);

        FHE.allowThis(ok);
        FHE.allow(ok, msg.sender);
        return ok;
    }

    /// @notice Paid encrypted stats over score with encrypted threshold; returns (matchedCount, sumScore)
    function queryScoreStats(
        externalEuint32 thresholdEnc,
        bytes calldata inputProof
    ) external payable returns (euint32 matchedCount, euint32 sumScore) {
        require(_users.length > 0, "no data");
        if (queryFeeWei > 0) {
            require(msg.value >= queryFeeWei, "fee");
            uint256 usersLen = _users.length;
            uint256 perUser = msg.value / (usersLen == 0 ? 1 : usersLen);
            for (uint256 i = 0; i < usersLen; i++) {
                pendingRewards[_users[i]] += perUser;
            }
            uint256 distributed = perUser * usersLen;
            protocolFees += (msg.value - distributed);
            emit RewardsAdded(msg.value, perUser, usersLen);
        }

        euint32 threshold = FHE.fromExternal(thresholdEnc, inputProof);
        euint32 sum = FHE.asEuint32(0);
        euint32 count = FHE.asEuint32(0);

        for (uint256 i = 0; i < _users.length; i++) {
            EncryptedRecord storage r = _records[_users[i]];
            if (!r.exists) continue;
            ebool cond = FHE.ge(r.score, threshold);
            sum = FHE.add(sum, FHE.select(cond, r.score, FHE.asEuint32(0)));
            count = FHE.add(count, FHE.select(cond, FHE.asEuint32(1), FHE.asEuint32(0)));
        }

        FHE.allowThis(sum);
        FHE.allowThis(count);
        FHE.allow(sum, msg.sender);
        FHE.allow(count, msg.sender);

        return (count, sum);
    }

    /// @notice Encrypted predicate: average score >= encrypted threshold?
    function isAvgScoreAtLeast(
        externalEuint32 thresholdEnc,
        bytes calldata inputProof
    ) external returns (ebool) {
        require(_users.length > 0, "no data");

        euint32 threshold = FHE.fromExternal(thresholdEnc, inputProof);
        euint32 sum = FHE.asEuint32(0);
        euint32 count = FHE.asEuint32(0);

        for (uint256 i = 0; i < _users.length; i++) {
            EncryptedRecord storage r = _records[_users[i]];
            if (!r.exists) continue;
            sum = FHE.add(sum, r.score);
            count = FHE.add(count, FHE.asEuint32(1));
        }

        euint32 rhs = FHE.mul(count, threshold);
        ebool res = FHE.ge(sum, rhs);
        FHE.allowThis(res);
        FHE.allow(res, msg.sender);
        return res;
    }

    /// @notice Withdraw accumulated rewards for data owners
    function withdrawRewards() external {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "no rewards");
        pendingRewards[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
        emit RewardsWithdrawn(msg.sender, amount);
    }

    /// @notice Owner withdraws accumulated protocol fees
    function withdrawProtocolFees(address payable to, uint256 amount) external onlyOwner {
        require(amount <= protocolFees, "exceeds");
        protocolFees -= amount;
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "transfer failed");
    }
}



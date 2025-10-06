import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * 与模板一致：提供基于本地节点的 FHEVM 交互任务
 * - task:address
 * - task:get-my-record
 * - task:submit-record --score 88 --contribution 20 --grade 5 --passed true [--cid Qm...]
 * - task:eligibility --score 80 --contrib 10
 * - task:avg --threshold 75
 */

task("task:address", "Prints the EncryptEvaluation address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;
  const deployed = await deployments.get("EncryptEvaluation");
  console.log("EncryptEvaluation address is " + deployed.address);
});

task("task:get-my-record", "Calls getMyRecord() and decrypt values if present")
  .setAction(async function (_taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployed = await deployments.get("EncryptEvaluation");
    console.log(`EncryptEvaluation: ${deployed.address}`);

    const signers = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptEvaluation", deployed.address);

    const tuple = await contract.getMyRecord();
    const [scoreH, contribH, gradeH, passedH] = tuple as [string, string, string, string];
    console.log(`Handles: score=${scoreH}, contribution=${contribH}, grade=${gradeH}, passed=${passedH}`);

    if (scoreH !== ethers.ZeroHash) {
      const clearScore = await fhevm.userDecryptEuint(FhevmType.euint32, scoreH, deployed.address, signers[0]);
      console.log(`Clear score        : ${clearScore}`);
    }
    if (contribH !== ethers.ZeroHash) {
      const clearContrib = await fhevm.userDecryptEuint(FhevmType.euint32, contribH, deployed.address, signers[0]);
      console.log(`Clear contribution : ${clearContrib}`);
    }
    if (gradeH !== ethers.ZeroHash) {
      const clearGrade = await fhevm.userDecryptEuint(FhevmType.euint16, gradeH, deployed.address, signers[0]);
      console.log(`Clear grade        : ${clearGrade}`);
    }
    if (passedH !== ethers.ZeroHash) {
      const clearPassed = await fhevm.userDecryptEbool(passedH, deployed.address, signers[0]);
      console.log(`Clear passed       : ${clearPassed}`);
    }
  });

task("task:submit-record", "Encrypts inputs and calls upload()")
  .addParam("score", "score (uint32)")
  .addParam("contribution", "contribution (uint32)")
  .addParam("grade", "grade (uint16)")
  .addParam("passed", "passed (boolean)")
  .addOptionalParam("cid", "optional cid string")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployed = await deployments.get("EncryptEvaluation");
    console.log(`EncryptEvaluation: ${deployed.address}`);

    const signers = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptEvaluation", deployed.address);

    const s = parseInt(taskArguments["score"]);
    const c = parseInt(taskArguments["contribution"]);
    const g = parseInt(taskArguments["grade"]);
    const p = String(taskArguments["passed"]).toLowerCase() === "true";
    if (!Number.isInteger(s) || !Number.isInteger(c) || !Number.isInteger(g)) {
      throw new Error("score/contribution/grade must be integers");
    }

    const enc = await fhevm
      .createEncryptedInput(deployed.address, signers[0].address)
      .add32(s)
      .add32(c)
      .add16(g)
      .addBool(p)
      .encrypt();

    const tx = await contract
      .connect(signers[0])
      .upload(enc.handles[0], enc.handles[1], enc.handles[2], enc.handles[3], enc.inputProof, taskArguments["cid"] ?? "");
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });

task("task:eligibility", "Encrypts thresholds and calls isEligible()")
  .addParam("score", "score threshold (uint32)")
  .addParam("contrib", "contribution threshold (uint32)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployed = await deployments.get("EncryptEvaluation");
    console.log(`EncryptEvaluation: ${deployed.address}`);

    const signers = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptEvaluation", deployed.address);

    const s = parseInt(taskArguments["score"]);
    const c = parseInt(taskArguments["contrib"]);
    if (!Number.isInteger(s) || !Number.isInteger(c)) {
      throw new Error("score/contrib must be integers");
    }

    const enc = await fhevm
      .createEncryptedInput(deployed.address, signers[0].address)
      .add32(s)
      .add32(c)
      .encrypt();

    const tx = await contract.connect(signers[0]).isEligible(enc.handles[0], enc.handles[1], enc.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });

task("task:avg", "Encrypts threshold and calls isAvgScoreAtLeast()")
  .addParam("threshold", "average score threshold (uint32)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployed = await deployments.get("EncryptEvaluation");
    console.log(`EncryptEvaluation: ${deployed.address}`);

    const signers = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptEvaluation", deployed.address);

    const t = parseInt(taskArguments["threshold"]);
    if (!Number.isInteger(t)) {
      throw new Error("threshold must be integer");
    }

    const enc = await fhevm
      .createEncryptedInput(deployed.address, signers[0].address)
      .add32(t)
      .encrypt();

    const tx = await contract.connect(signers[0]).isAvgScoreAtLeast(enc.handles[0], enc.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });



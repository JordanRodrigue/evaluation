import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const fee = hre.network.name === "sepolia" ? hre.ethers.parseEther("0.001") : hre.ethers.parseEther("0.0");

  const deployed = await deploy("EncryptEvaluation", {
    from: deployer,
    log: true,
    args: [fee],
  });

  console.log(`EncryptEvaluation contract: `, deployed.address);
};
export default func;
func.id = "deploy_encrypt_evaluation"; // prevent reexecution
func.tags = ["EncryptEvaluation"];



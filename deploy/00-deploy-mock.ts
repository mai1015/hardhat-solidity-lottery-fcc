
import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { devNetwork, networkConfig } from "../helper-hardhat.config"

const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;

const deployFundMe: DeployFunction = async function(
    hre: HardhatRuntimeEnvironment
) {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const args = [BASE_FEE, GAS_PRICE_LINK];
    if (devNetwork.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
          contract: "VRFCoordinatorV2Mock",
          from: deployer,
          log: true,
          args
        })
        log("Mocks Deployed!")
        log("----------------------------------")
        log(
          "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
          "Please run `yarn hardhat console` to interact with the deployed smart contracts!"
        )
        log("----------------------------------")
    }
}

export default deployFundMe
deployFundMe.tags = ["all", "mocks"]
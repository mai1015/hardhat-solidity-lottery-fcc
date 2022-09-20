import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { devNetwork, networkConfig } from "../helper-hardhat.config"
import { verify } from "../utils"
import { int } from "hardhat/internal/core/params/argumentTypes"

const FUND_AMOUNT = "1000000000000000000000"

const deployFundMe: DeployFunction = async function(
    hre: HardhatRuntimeEnvironment
) {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    let coordinatorAddr, subscriptionId
    if (devNetwork.includes(network.name)) {
      const vrfCoordinator = await ethers.getContract("VRFCoordinatorV2Mock")
      coordinatorAddr = vrfCoordinator.address
      const transactionReq = await vrfCoordinator.createSubscription()
      const transactionReceipt = await transactionReq.wait()
      subscriptionId = transactionReceipt.events[0].args.subId
      await vrfCoordinator.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
      coordinatorAddr = networkConfig[network.name].vrfCoordinator || ""
      subscriptionId = "1887"
    }

    const entranceFee = networkConfig[network.name].entranceFee
    const gasLane = networkConfig[network.name].gasLane;
    const callbackGasLimit = networkConfig[network.name].callbackGasLimit;
    const interval = networkConfig[network.name].interval;

    const args = [coordinatorAddr, entranceFee, gasLane, subscriptionId, callbackGasLimit, interval]

    log("----------------------------------------------------")
    const raffle = await deploy("Raffle", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1
    });

    if (
      !devNetwork.includes(network.name) &&
      process.env.ETHERSCAN_API_KEY
    ) {
      log("Verifying...")
      await verify(raffle.address, args)
    }
    log("----------------------------------------------------")
}

export default deployFundMe
deployFundMe.tags = ["all", "raffle"]

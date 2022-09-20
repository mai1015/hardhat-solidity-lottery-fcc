import {ethers} from "hardhat";

export interface networkConfigItem {
    blockConfirmations?: number
    vrfCoordinator?: string
    gasLane?: string
    callbackGasLimit: string
    entranceFee: any
    interval: string
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    "hardhat": {
        blockConfirmations: 1,
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        entranceFee: ethers.utils.parseEther("0.01"),
        callbackGasLimit: "500000",
        interval: "30",
    },
    "goerli": {
        blockConfirmations: 6,
        vrfCoordinator: "0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        entranceFee: ethers.utils.parseEther("0.01"),
        callbackGasLimit: "500000",
        interval: "30",
    },
    "polygon": {
        blockConfirmations: 6,
        entranceFee: ethers.utils.parseEther("0.01"),
        callbackGasLimit: "500000",
        interval: "30",
    },
    "mumbai": {
        blockConfirmations: 6,
        entranceFee: ethers.utils.parseEther("0.01"),
        callbackGasLimit: "500000",
        interval: "30",
    },
}

export const devNetwork = ["hardhat"];
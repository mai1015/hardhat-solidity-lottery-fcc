// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

error Raffle__RaffleNotOpen();
error Raffle__SendMoreToEnterRaffle();
error Raffle__TransferFailed();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    uint256 private immutable i_entranceFee;
    address payable[] private s_players;

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subId;
    uint32 private immutable i_callbackGasLimit;
    uint256 private immutable i_interval;

    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    address private s_recentWinner;
    RaffleState private s_state;
    uint256 private s_lastTimeStamp;

    event RequestRaffleWinner(uint256 indexed requestId);
    event RaffleEnter(address indexed player);
    event WinnerPicked(address indexed player);

    constructor(
        address vrfCoordinatorV2,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) 
    {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subId = subId;
        i_callbackGasLimit = callbackGasLimit;
        i_interval = interval;
        s_state = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {revert Raffle__SendMoreToEnterRaffle();}
        if (s_state != RaffleState.OPEN) {revert Raffle__RaffleNotOpen();}
        
        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function checkUpkeep(bytes memory /*checkData*/)
     public view override returns (bool upkeepNeeded, bytes memory /*performData*/) {
        upkeepNeeded = (RaffleState.OPEN == s_state) &&        // is open
         ((block.timestamp - s_lastTimeStamp) > i_interval) && // has time stamp
         s_players.length > 0 &&                               // has player
         address(this).balance > 0;                            // has amount
        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(bytes calldata /*performData*/) external override {
        (bool needed, ) = checkUpkeep("");
        if (!needed) {revert Raffle__UpkeepNotNeeded(address(this).balance, s_players.length, uint256(s_state));}
        s_state = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, i_subId, REQUEST_CONFIRMATIONS, i_callbackGasLimit, NUM_WORDS
        );
        emit RequestRaffleWinner(requestId);
    }

    function fulfillRandomWords(uint256 /*requestId*/, uint256[] memory randomWords) internal override {
        address payable winner = s_players[randomWords[0] % s_players.length];
        s_recentWinner = winner;

        (bool success, ) = winner.call{value: address(this).balance}("");
        if (!success) {revert Raffle__TransferFailed();}

        s_players = new address payable[](0);
        s_state = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;

        emit WinnerPicked(winner);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getNumPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }
    
    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getState() public view returns (RaffleState) {
        return s_state;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
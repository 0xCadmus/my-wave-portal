// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;        
    uint256 private seed;
        
    // Create event for a new wave
    event NewWave(address indexed from, uint256 timestamp, string message);
    
    // Create struct for Wave data
    struct Wave {
        address waver; // Address of the user that waved
        string message; // Message the user sent
        uint256 timestamp; // Timestamp when the user waved
    }

    // Store Wave structs in waves array
    Wave[] waves;

    /*
     * This is an address => uint mapping, meaning I can associated an address with a number!
     * In this case, I'll be storing the address with the last time the user waved at us.
     */
    mapping(address => uint256) public lastWavedAt;

    constructor() payable {
        console.log("First Smart Contract!!");
    }

    function wave(string memory _message) public {
        /*
         * We need to make sure the current timestamp is at least 15-minutes bigger than the last timestamp we stored. This is to prevent spam on the contract.
         */
        require(
            lastWavedAt[msg.sender] + 15 minutes < block.timestamp,
            "Wait 15m"
        );

        /*
         * Update the current timestamp we have for the user
         */
        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        console.log("%s has waved!", msg.sender);

        // Store data in waves array
        waves.push(Wave(msg.sender, _message, block.timestamp));

        // emit event upon new wave
        emit NewWave(msg.sender, block.timestamp, _message);

        /*
         * Generate a Psuedo random number between 0 and 100
         */
        uint256 randomNumber = (block.difficulty + block.timestamp + seed) % 100;
        console.log("Random # generated: %s", randomNumber);

        /*
         * Set the generated, random number as the seed for the next wave
         */
        seed = randomNumber;

        /*
         * Give a 50% chance that the user wins the prize.
         */
        if (randomNumber < 50) {
            console.log("%s won!", msg.sender);

            /*
             * The same code we had before to send the prize.
             */
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than they contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        return totalWaves;
    }
}
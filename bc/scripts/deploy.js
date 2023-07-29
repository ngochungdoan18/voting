const { ethers } = require("hardhat");
require("dotenv").config();

const votingOptions = Array.from(new Set(process.env.VOTING_OPTIONS.split(",")));

async function main() {
  const deployerAddr = "0x84940cD5c5dbdCD7a285bD05b18393221259c273";
  const deployer = await ethers.getSigner(deployerAddr);

  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(
    `Account balance: ${(
      await ethers.provider.getBalance(deployerAddr)
    ).toString()}`
  );

  const vt = await ethers.getContractFactory("Voting");
  const vtContract = await vt.deploy();

  await vtContract.setOptions(votingOptions, {
    gasLimit: 3000000
  });

  console.log(
    `Congratulations! You have just successfully deployed your voting contract.`
  );
  console.log(
    `vt contract address is ${await vtContract.getAddress()} You can verify on https://baobab.scope.klaytn.com/account/${await vtContract.getAddress()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

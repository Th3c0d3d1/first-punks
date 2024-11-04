// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // Declare Vars
  const NAME = 'First Punks'
  const SYMBOL = 'FPKS'
  const COST = ethers.utils.parseUnits('10', 'ether')
  const MAX_SUPPLY = '25'
  const NFT_MINT_DATE = (Date.now() + 60000).toString().slice(0, 10)
  const IPFS_METADATA_URI = 'https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/'

  // Deploy NFT
  const NFT = await hre.ethers.getContractFactory('NFT')
  let nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, NFT_MINT_DATE, IPFS_METADATA_URI)

  // Log NFT address
  await nft.deployed()
  console.log(`NFT deployed to: ${nft.address}\n`)

  // Deploy Whitelist
  const Whitelist = await hre.ethers.getContractFactory('Whitelist')
  let whitelist = await Whitelist.deploy()

  // Log Whitelist address
  await whitelist.deployed()
  console.log(`Whitelist deployed to: ${whitelist.address}\n`)
}

// Handle errors
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

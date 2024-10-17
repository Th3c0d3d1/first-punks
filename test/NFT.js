const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('NFT', () => {
  // declare global variables
  const NAME = 'First Punk'
  const SYMBOL = 'FPNK'
  const COST = ether(10)
  const MAX_SUPPLY = 25
  
  let nft

  describe('Deployment', () => {
    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY)
    })

    it('has correct name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })

    it('has correct symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })

    it('returns mint cost', async () => {
      expect(await nft.cost()).to.equal(COST)
    })

    it('returns max total supply', async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY)
    })
  })
})

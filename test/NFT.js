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
  
  let nft

  beforeEach(async () => {
    const NFT = await ethers.getContractFactory('NFT')
    nft = await NFT.deploy('First Punk', 'FPNK')
  })

  describe('Deployment', () => {
    it('has correct name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })

    it('has correct symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })
  })
})

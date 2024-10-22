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
  // ??? would this hash be an env var ???
  const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'
  
  let nft,
    deployer,
    minter

  beforeEach(async () => {
    let accounts = await ethers.getSigners()

    deployer = accounts[0]
    minter = accounts[1]
  })

  describe('Deployment', () => {
    // 2min from now in EPOCH time
    const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10)

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
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

    it('returns the allowed minting time', async () => {
      expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON)
    })

    it('returns the base URI', async () => {
      expect(await nft.baseURI()).to.equal(BASE_URI)
    })

    it('returns the owner', async () => {
      expect(await nft.owner()).to.equal(deployer.address)
    })
  })

  describe('Minting', () => {
    let transaction, result

    describe('Success', () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(1, {value: COST})
        result = await transaction.wait()
      })

      // ownerOf & balanceOf functions inheritted from ERC721.sol contract
      it('returns the address of the minter', async () => {
        expect (await nft.ownerOf(1)).to.eq(minter.address)
      })

      it('returns the total number of tokens minter owns', async () => {
        expect (await nft.balanceOf(minter.address)).to.eq(1)
      })

      it('returns IPFS URI', async () => {
        // console.log(await nft.tokenURI(1))
        expect(await nft.tokenURI(1)).to.eq(`${BASE_URI}1.json`)
      })

      it('updates the total supply', async () => {
        expect(await nft.totalSupply()).to.eq(1)
      })

      it('updates the contract ether balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.eq(COST)
      })

      it('emits Mint event', async () => {
        await expect(transaction).to.emit(nft, 'Mint')
        .withArgs(1, minter.address)
      })
    })

    describe('Failure', async () => {
      it('rejects insufficient payment', async () => {
        // Now
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(1, {value: ether(1)})).to.be.reverted
      })

      it('requires at least 1 nft to be minted', async () => {
        // Now
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(0, {value: COST})).to.be.reverted
      })

      it('rejects minting before allowed time', async () => {
        // Setting mint date into future
        const ALLOW_MINTING_ON = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(1, {value: COST})).to.be.reverted
      })

      it('restricts allowable minting qty to max amount', async () => {
        // Now
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(26, {value: COST})).to.be.reverted
      })

      it('does not return URI for invalid tokens', async () => {
        // Now
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        nft.connect(minter).mint(1, {value: COST})

        await expect(nft.tokenURI('99')).to.be.reverted
      })

    })
  })

  describe('Displaying NFTs', () => {
    let transaction, result
    const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

      // Minting 3 NFTs
      transaction = await nft.connect(minter).mint(3, {value: ether(30)})
      result = await transaction.wait()
    })

    it('returns all NFTs for a given owner', async () => {
      let tokenIds = await nft.walletOfOwner(minter.address)
      // console.log("owner wallet", tokenIds)
      expect(tokenIds.length).to.eq(3)
      expect(tokenIds[0].toString()).to.eq('1')
      expect(tokenIds[1].toString()).to.eq('2')
      expect(tokenIds[2].toString()).to.eq('3')
    })
  })

  describe('Withdrawing Funds', () => {
    describe('Success', () => {
      let transaction, result, balanceBefore

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(1, {value: COST})
        result = await transaction.wait()

        balanceBefore = await ethers.provider.getBalance(deployer.address)

        transaction = await nft.connect(deployer).withdraw()
        result = await transaction.wait()
      })

      it('deducts the contract balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.eq(0)
      })

      it('sends funds to the owner', async () => {
        expect(await ethers.provider.getBalance(deployer.address)).to.be.greaterThan(balanceBefore)
      })
      
      it('changes the mint cost', async ()=> {

      })

      it('emits a withdraw event', async () => {
        await expect(transaction).to.emit(nft, 'Withdraw')
        .withArgs(COST, deployer.address)
      })
    })

    describe('Failure', async () => {
      it('prevents non-owner from withdrawing', async () => {
        // Now
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        nft.connect(minter).mint(1, {value: COST})

        await expect(nft.connect(minter).withdraw()).to.be.reverted
      })
    })
  })
})

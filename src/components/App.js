import { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Countdown from 'react-countdown';
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Data from './Data';
import Mint from './Mint';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
import NFT_ABI from '../abis/Nft.json';

// Config: Import your network config here
import config from '../config.json';

// Import Preview Img
import preview from '../preview.png';

function App() {
  const [provider, setProvider] = useState(null)
  const [nft, setNft] = useState(null)
  const [nfts, setNfts] = useState([])

  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(0)

  const [revealTime, setRevealTime] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [cost, setCost] = useState(0)

  

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    // Initiate the contract
    const nft = new ethers.Contract(config[31337].nft.address, NFT_ABI, provider)
    setNft(nft)

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    // Fetch NFTs owned by the minter
    const walletOfOwner = await nft.walletOfOwner(account);
    const nftData = await Promise.all(walletOfOwner.map(async (tokenId) => {
      const tokenURI = await nft.tokenURI(tokenId);
      const response = await fetch(tokenURI);
      const metadata = await response.json();
      return {
        tokenId,
        image: metadata.image,
        name: metadata.name
      };
    }));
    setNfts(nftData);

    // Fetch Countdown
    const allowMintingOn = await nft.allowMintingOn()
    // setting reveal time to milliseconds (+ '000')
    setRevealTime(allowMintingOn.toString() + '000')

    // Fetch max supply
    setMaxSupply(await nft.maxSupply())
    // Fetch total supply
    setTotalSupply(await nft.totalSupply())
    // Fetch cost
    setCost(await nft.cost())
    // Fetch account balance
    setBalance(await nft.balanceOf(account))

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  return(
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>First Punks</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Row>
            <Col>
              {balance > 0 ? (
                <div className='text-center'>
                  <img
                    // --->>> Pull nfts from wallet <<<---
                    // ??? where did he get the hash from ???
                    // not QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg
                    src = {`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${balance.toString()}.png`}
                    alt = 'Open First Punks'
                    width = '400px'
                    height = '400px'
                  />
                </div>
              ) : (
                <img src={preview} alt='' />
              )}
            </Col>
            <Col>
              <div className='my-4 text-center'>
                <Countdown date={parseInt(revealTime)} className='h2' />
              </div>

              <Data
                maxSupply={maxSupply}
                totalSupply={totalSupply}
                cost={cost}
                balance={balance}
              />

              <Mint
                provider={provider}
                nft={nft}
                cost={cost}
                setIsLoading={setIsLoading}
              />
            </Col>
          </Row>
          <Row>
            {nfts.map((nft, index) => (
              <Col key={index} md={4} className='mb-4'>
                <div className='card'>
                  <img src={nft.image} alt={nft.name} className='card-img-top' />
                  <div className='card-body'>
                    <h5 className='card-title'>{nft.name}</h5>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  )
}

export default App;

import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
import NFT_ABI from '../abis/Nft.json';

// Config: Import your network config here
import config from '../config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [nft, setNft] = useState(null)

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

    // Fetch Countdown
    const allowMintingOn = await nft.allowMintingOn()
    // setting reveal time to milliseconds (+ '000')
    setRevealTime(allowMintingOn.toString() + '000')

    // Fetch max supply
    await nft.maxSupply()
    // Fetch total supply
    await nft.totalSupply()
    // Fetch cost
    await nft.cost()
    // Fetch account balance
    await nft.balanceOf(account)

    // Fetch account balance
    let balance = await provider.getBalance(account)
    balance = ethers.utils.formatUnits(balance, 18)
    setBalance(balance)

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

      <h1 className='my-4 text-center'>React Hardhat Template</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <p className='text-center'><strong>Your ETH Balance:</strong> {balance} ETH</p>
          <p className='text-center'>Edit App.js to add your code here.</p>
        </>
      )}
    </Container>
  )
}

export default App;

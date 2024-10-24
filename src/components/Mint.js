import { Form, Button } from "react-bootstrap";
import { ethers } from "ethers";

// provider - signs tx
// nft - call mint function
// cost - verify payment amount
// setIsLoading - refresh page
const Mint = ({provider, nft, cost, setIsLoading}) => {

    const mintHandler = async(e) => {
        e.preventDefault()
        // Verify button onSubmit functionality in console 
        // console.log('minting...')

        try{
            // Get signer
            const signer = await provider.getSigner()

            // Mint nft to signer
            const transaction = await nft.connect(signer).mint(1, {value: cost})
            await transaction.wait()
        } catch {
            window.alert('User rejected or transaction reverted')
        }
        
    }

    return(
        <Form onSubmit={mintHandler} style={{maxWidth: '450px', margin: '50px auto'}}>
            <Form.Group>
                <Button variant="primary" type="submit" style={{width: '100%'}}>
                    Mint
                </Button>
            </Form.Group>
        </Form>
    )
}

export default Mint;
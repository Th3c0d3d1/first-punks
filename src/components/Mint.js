import { useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { ethers } from "ethers";

// provider - signs tx
// nft - call mint function
// cost - verify payment amount
// setIsLoading - refresh page
const Mint = ({provider, nft, cost, setIsLoading}) => {
    const [isWaiting, setIsWaiting] = useState(false)

    const mintHandler = async(e) => {
        e.preventDefault()
        // Verify button onSubmit functionality in console 
        // console.log('minting...')
        setIsWaiting(true)

        try{
            // Get signer
            const signer = await provider.getSigner()

            // Mint nft to signer
            const transaction = await nft.connect(signer).mint(1, {value: cost})
            await transaction.wait()
        } catch {
            window.alert('User rejected or transaction reverted')
        }
        setIsLoading(true)
    }

    return(
        <Form onSubmit={mintHandler} style={{maxWidth: '450px', margin: '50px auto'}}>
            {isWaiting ? (
                <Spinner animation="border" style={{display: 'block', margin: '0 auto'}} />
            ) : (
                <Form.Group>
                    <Button variant="primary" type="submit" style={{width: '100%'}}>
                        Mint
                    </Button>
                </Form.Group>
            )}
        </Form>
    )
}

export default Mint;
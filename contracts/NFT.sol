// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// from openzepplin --> import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./ERC721Enumerable.sol";
import "./Ownable.sol";

contract NFT is ERC721Enumerable, Ownable {
    // Set global variables
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public allowMintingOn;
    string public baseURI;


    // Inheritted ERC721 constructor params from ERC721Enumerable called as constructor arg
    // Passes constructor param variables from NFT contract into constructor params from ERC721 contract
    // ERC721 is parent
    // State variables
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _allowMintingOn,
        string memory _baseURI

    // ERC721 doesnt need the cost arg
    ) ERC721(_name, _symbol) {
        cost = _cost;
        maxSupply = _maxSupply;
        allowMintingOn = _allowMintingOn;
        baseURI = _baseURI;
    }

    // _mintAmount allows multiple to be minted at once
    function mint(uint256 _mintAmount) public payable {
        // Create a token(nft)
        // ERC721Enummerable will tell you collection qty(not free in ERC721.sol)
        uint256 supply = totalSupply();

        for(uint256 i = 1; i <= _mintAmount; i++){
            // token id has to iterate
            _safeMint(msg.sender, supply + i);
        }
    }
}

// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// from openzepplin --> import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./ERC721Enumerable.sol";
import "./Ownable.sol";

contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    // Set global variables
    string public baseURI;
    string public baseExtension = ".json";
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public allowMintingOn;

    event Mint(uint256 amount, address minter);
    event Withdraw(uint256 amount, address owner);

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
        // Allow minting after specified time
        // block.timestamp is now
        require(block.timestamp >= allowMintingOn);
        
        // Must mint at least 1 token
        require(_mintAmount > 0);

        // Require adequate minter balance
        // cost * mintAmount is cost of x qty to be minted
        require(msg.value >= cost * _mintAmount);

        // Create a token(nft)
        // ??? ERC721Enummerable will tell you collection qty(not free in ERC721.sol) ???
        uint256 supply = totalSupply();

        // Limit minting to token qty
        require(supply + _mintAmount <= maxSupply);

        // looping token id for uniqueness
        for(uint256 i = 1; i <= _mintAmount; i++){
            // token id has to iterate
            _safeMint(msg.sender, supply + i);
        }

        emit Mint(_mintAmount, msg.sender);
    }

    // Return metadata IPFS url
    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns(string memory)
    {
        require(_exists(_tokenId), 'token does not exist');

        return(
            string(
                abi.encodePacked(
                    baseURI,
                    _tokenId.toString(),
                    baseExtension
                )
            )
        );
    }

    function walletOfOwner(address _owner) public view returns(uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for(uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success);

        emit Withdraw(balance, msg.sender);
    }

    function setCost(uint256 _newCost) public onlyOwner() {
        cost = _newCost;
    }
}

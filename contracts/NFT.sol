// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// from openzepplin --> import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./ERC721Enumerable.sol";
import "./Ownable.sol";
import "./Whitelist.sol";

contract NFT is ERC721Enumerable, Ownable, Whitelist{
    using Strings for uint256;

    // ??? Set global/local variables ???
    string public baseURI;
    string public baseExtension = ".json";
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public allowMintingOn;
    // State variable to track if minting is paused
    bool public paused = false;

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

    // Mapping to track minted tokens
    mapping(address => uint256) public mintedTokens;

    // function to buy tokens by direct contract interaction
    // no user/website interaction
    // required to receive ETH
    // sets the cost required to buy nfts
    receive() external payable{
        // Verify user is whitelisted
        require(isWhitelisted(msg.sender), 'user must be whitelisted');
        
        // Ensure minting is not paused
        require(!paused, "Minting is paused");

        // Calculate the number of NFTs to mint
        uint256 amount = msg.value / cost;
        require(amount > 0, "Insufficient funds to mint NFTs");

        // Enforce max minting limit per account
        require(mintedTokens[msg.sender] + amount <= 3, "Max minting limit per account is 3");

        // Mint the tokens
        mint(amount);

        // Emit an event for the purchase
        emit Mint(amount, msg.sender);
    }

    // _mintAmount allows multiple to be minted at once
    function mint(uint256 _mintAmount) public payable {
        // Check if minting is paused
        require(!paused, "Minting is paused");

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

        // // ??? Limit minting to token qty ???
        // require(supply + _mintAmount <= maxSupply);

        // Enforce max minting limit per account
        require(mintedTokens[msg.sender] + _mintAmount <= 3, "Max minting limit per account is 3");

        // looping token id for uniqueness
        for(uint256 i = 1; i <= _mintAmount; i++){
            // token id has to iterate
            _safeMint(msg.sender, supply + i);
            // Update the minted tokens count
            mintedTokens[msg.sender] += 1;
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

        // ??? How can it also be made implicit ???
        emit Withdraw(balance, msg.sender);
    }

    function setCost(uint256 _newCost) public onlyOwner() {
        cost = _newCost;
    }

    function pauseMinting() public onlyOwner() {
        paused = true;
    }

    function unpauseMinting() public onlyOwner() {
        paused = false;
    }
}

// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// from openzepplin --> import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./ERC721Enumerable.sol";

contract NFT is ERC721Enumerable {
    // Set global variables
    uint256 public cost;
    uint256 public maxSupply;


    // Inheritted ERC721 constructor params from ERC721Enumerable called as constructor arg
    // Passes constructor param variables from NFT contract into constructor params from ERC721 contract
    // ERC721 is parent
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply
    // ERC721 doesnt need the cost arg
    ) ERC721(_name, _symbol) {
        cost = _cost;
        maxSupply = _maxSupply;
    }
}

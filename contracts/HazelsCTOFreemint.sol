// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {HazelsRenderer} from "./HazelsRenderer.sol";
import {ArtManifest} from "./ArtManifest.sol";
interface ICreatorToken {
    event TransferValidatorUpdated(address oldValidator, address newValidator);
    function getTransferValidator() external view returns (address);
    function getTransferValidationFunction() external pure returns (bytes4, bool);
    function setTransferValidator(address validator) external;
}
interface ITransferValidator {
    function validateTransfer(address caller, address from, address to, uint256 tokenId) external view;
}
/// @notice Free primary mint. ERC2981 + Creator Token transfer validation.
/// No admin mint bypass, upgrade, artwork setter or supply setter exists.
contract HazelsCTOFreemint is ERC721, ERC2981, Ownable2Step, ReentrancyGuard, ICreatorToken {
    uint256 public constant MAX_SUPPLY = 5555;
    uint256 public constant WALLET_LIMIT = 2;
    address public constant TREASURY = 0x9d4B1bDF276a2B30F9FA95DB3beC0b40477c2941;
    uint96 public constant ROYALTY_BPS = 500;
    HazelsRenderer public immutable renderer;
    uint256 public totalSupply;
    bool public mintOpen;
    mapping(address => uint256) public mintedBy;
    address private _validator;
    error MintClosed();
    error InvalidQuantity();
    error SoldOut();
    error WalletLimit();
    error InvalidRenderer();
    error InvalidValidator();
    event MintStatusChanged(bool open);
    event Minted(address indexed wallet, uint256 indexed firstTokenId, uint256 quantity);
    constructor(address renderer_) ERC721("Hazels CTO Freemint", "HAZELS") Ownable(TREASURY) {
        if (renderer_.code.length == 0 || HazelsRenderer(renderer_).ART_MANIFEST() != ArtManifest.MANIFEST) revert InvalidRenderer();
        renderer = HazelsRenderer(renderer_);
        _setDefaultRoyalty(TREASURY, ROYALTY_BPS);
    }
    function mint(uint256 quantity) external nonReentrant {
        if (!mintOpen) revert MintClosed();
        if (quantity == 0) revert InvalidQuantity();
        uint256 start = totalSupply;
        if (quantity > MAX_SUPPLY - start) revert SoldOut();
        if (msg.sender != TREASURY && mintedBy[msg.sender] + quantity > WALLET_LIMIT) revert WalletLimit();
        mintedBy[msg.sender] += quantity;
        totalSupply = start + quantity;
        for (uint256 id = start + 1; id <= start + quantity; ++id) _safeMint(msg.sender, id);
        emit Minted(msg.sender, start + 1, quantity);
    }
    function mintAllowance(address wallet) external view returns (uint256) {
        uint256 remaining = MAX_SUPPLY - totalSupply;
        uint256 allowance = wallet == TREASURY ? remaining : WALLET_LIMIT - mintedBy[wallet];
        return allowance < remaining ? allowance : remaining;
    }
    function setMintOpen(bool open) external onlyOwner {
        mintOpen = open;
        emit MintStatusChanged(open);
    }
    function getTransferValidator() external view returns (address) { return _validator; }
    function getTransferValidationFunction() external pure returns (bytes4, bool) {
        return (ITransferValidator.validateTransfer.selector, true);
    }
    /// @dev Owner must select the correct OpenSea-supported validator for the chain
    /// and configure its policy in OpenSea Studio. Zero disables validation.
    function setTransferValidator(address validator) external onlyOwner {
        if (validator != address(0) && validator.code.length == 0) revert InvalidValidator();
        emit TransferValidatorUpdated(_validator, validator);
        _validator = validator;
    }
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0) && _validator != address(0)) {
            ITransferValidator(_validator).validateTransfer(msg.sender, from, to, tokenId);
        }
        return super._update(to, tokenId, auth);
    }
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return renderer.tokenURI(tokenId);
    }
    function supportsInterface(bytes4 id) public view override(ERC721, ERC2981) returns (bool) {
        return id == type(ICreatorToken).interfaceId || super.supportsInterface(id);
    }
}

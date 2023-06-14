// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./NFTdutchauctiontoken.sol";
import "./ERC20Token.sol";

contract NFTDutchAuction_ERC20BidsSol is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
//start

NFTDutchAuctionToken public nftContractToken;
    ERC20Token public eRCToken;
    address payable public seller;
    address public ownerOfToken;
    address public erc20TokenAddress;
    address public erc721TokenAddress;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public startBlock;
    uint256 public endBlock;
    uint256 public currentPrice;
    uint256 public nftTokenId;
    bool public auctionEnded;
    uint256 public bidTransfered;

    //Seller Placed A bid

     function initialize(
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement,
        uint256 _nftTokenId,
        address _erc721TokenAddress,
        address _erc20TokenAddress
    ) external initializer {
        __UUPSUpgradeable_init();
        seller = payable(msg.sender);
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        nftTokenId = _nftTokenId;
        erc721TokenAddress = _erc721TokenAddress;
        erc20TokenAddress = _erc20TokenAddress;
        startBlock = block.number;
        endBlock = startBlock + numBlocksAuctionOpen;
        ownerOfToken = IERC721(_erc721TokenAddress).ownerOf(_nftTokenId);

        auctionEnded = false;
        //check if the the deployer is the owner of the token.
        require(seller == ownerOfToken, "Sender is not the owner of token");
    }

    //function for bidders to place bid and proccess the bid
    function getCurrentPrice() public returns (uint256) {
        currentPrice =
            reservePrice +
            (endBlock - block.number) *
            offerPriceDecrement;
        return (currentPrice);
    }

    function placeBid(uint256 _bidAmount) external payable {
        getCurrentPrice();
        bidTransfered = IERC20(erc20TokenAddress).balanceOf(address(this));
        if (_bidAmount >= currentPrice && _bidAmount == bidTransfered) {
            auctionEnded = true;
            IERC721(erc721TokenAddress).safeTransferFrom(
                seller,
                msg.sender,
                nftTokenId
            ); //Transfer ERC721 Token to Bidder
            IERC20(erc20TokenAddress).transfer(
                seller,
                _bidAmount
            );
        } else {
            
            IERC20(erc20TokenAddress).transfer(msg.sender, _bidAmount); //Transfer bid to sender
        }
    }

//end
    function initialize() initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}
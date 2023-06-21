import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { ERC20Token__factory } from "../typechain-types";


describe("NFTDutchAuction_ERC20Bids", () => {
    let contract: Contract;
    let owner;
    let bidder1;
    let bidder2;
    let accounts;
    let eRCToken;
    let nftContractToken;
    const reservePrice = 100;
    const numBlocksAuctionOpen = 10;
    const offerPriceDecrement = 10;
    const nftTokenId = 0;
    const hre = require("hardhat");
    



    beforeEach(async () => {
        // Deploy the NFTDutchAuctionToken and ERC20Token contracts
        const NFTDutchAuctionToken = await ethers.getContractFactory("NFTDutchAuctionToken");
        const ERC20Token = await ethers.getContractFactory("ERC20Token");

        // Get the contract factory for NFTDutchAuction_ERC20Bids
        const Contract = await ethers.getContractFactory("NFTDutchAuction_ERC20Bids");

        // Get the owner and bidders signers
        accounts = await ethers.getSigners();
        owner = accounts[0];
        bidder1 = accounts[1];
        bidder2 = accounts[2];

        // Deploy the NFTDutchAuctionToken contract
        const nftContractToken = await NFTDutchAuctionToken.deploy();
        await nftContractToken.deployed();



        // Deploy the ERC20Token contract
        const eRCToken = await ERC20Token.connect(bidder1).deploy();
        await eRCToken.deployed();

        const erc721TokenAddress = nftContractToken.address;
        const erc20TokenAddress = eRCToken.address;

        const proxyContract = await hre.upgrades.deployProxy(NFTDutchAuction_ERC20Bids, [reservePrice, numBlocksAuctionOpen, offerPriceDecrement, nftTokenId, erc20TokenAddress, erc721TokenAddress], { kind: 'uups' });
        await proxyContract.deployed();

       // let proxyContract = await hre.upgrades.deployProxy(contract.address, {
       //     kind: "uups",

        // Deploy the NFTDutchAuction_ERC20Bids contract
       // contract = await Contract.deploy(
       //     reservePrice,
       //     numBlocksAuctionOpen,
       //     offerPriceDecrement,
      //      nftTokenId,
      //      erc721TokenAddress,
       //     erc20TokenAddress
       // );

        //await contract.deployed();

        //deploy proxy
        //const UpgradeableNFTDutchAuctionFactory = await ethers.getContractFactory("NFTDutchAuction_ERC20BidsUpgradeable");
       // const nftDutchAuction = await hre.upgrades.deployProxy(UpgradeableNFTDutchAuctionFactory, [erc20TokenAddress, erc721TokenAddress, 1, 100, 10, 10], { kind: 'uups' });


       // let proxyContract = await hre.upgrades.deployProxy(contract.address, {
       //     kind: "uups",
       // });

                let bidAmount = 1;
        //Minting ERC20 with non-owner
        try {
            await eRCToken.connect(bidder2).mint(bidder1.address, 1000000);
        } catch (e: any) {
            // expect(e.message).to.be.equal("");
            console.log(e.message);
        }
        //mint ERC20token to the bidder1
        await eRCToken.connect(bidder1).mint(bidder1.address, 1000000);
        console.log("bidder1 balance ", await eRCToken.connect(bidder1).balanceOf(bidder1.address));
        await eRCToken.connect(bidder1).transfer(proxyContract.address, bidAmount);
        console.log("contrats balance ", await eRCToken.connect(bidder1).balanceOf(proxyContract.address));
        //Aprove for the Dutchaction contract to move ERC721 token
        await nftContractToken.approve(proxyContract.address, nftTokenId);
        it("should initialize with the correct values", async function () {
            expect(await proxyContract.reservePrice()).to.equal(reservePrice);
            expect(await proxyContract.numBlocksAuctionOpen()).to.equal(numBlocksAuctionOpen);
            expect(await proxyContract.offerPriceDecrement()).to.equal(offerPriceDecrement);
            expect(await proxyContract.nftTokenId()).to.equal(nftTokenId);
            expect(await proxyContract.auctionEnded()).to.be.false;
        });
    });


})
    
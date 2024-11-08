const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("ODIM", function () {
  async function deployODIM() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const ODIM = await ethers.getContractFactory("ODIM");
    const odim = await ODIM.deploy();

    return { odim, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("identities mapping should be empty", async function () {
      const { odim, owner } = await loadFixture(deployODIM);

      expect(await odim.getNextIdentity(owner.address)).to.equal("");
    });

    it("Should set the right owner", async function () {
    });

    it("Should receive and store the funds to lock", async function () {
    });
  });

  describe("Adding identities", function () {
    it("adding one DID to decentralized identity", async function () {
      const { odim, owner, otherAccount } = await loadFixture(deployODIM);

      const tx = await odim.addIdentity("did:example:123");
      const receipt = await tx.wait();

      console.log("addedIdentity transaction", tx)
      console.log("receipt", receipt);

      const event = receipt.events?.find(event => event.event === "IdentityAdded");
      if (event) {
          const { sender, newIdentity } = event.args;
          console.log("Sender:", sender);
          console.log("New Identity:", newIdentity);
      }
      expect(await odim.getNextIdentity(owner.address.toString(16))).to.equal("did:example:123");
    });

    it("adding one ETH address to decentralized identity", async function () {

    }); 

    it("adding DID and ETH address to decentralized identity", async function () {

    }); 
  });
});

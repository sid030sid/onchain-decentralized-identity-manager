const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
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
  });

  describe("Adding identities", function () {
    it("add one identity to decentralized identity of owner", async function () {
      const { odim, owner } = await loadFixture(deployODIM);

      // Call the addIdentity function
      const tx = await odim.addIdentity("did:example:123");

      // Wait for the transaction to be mined and get the receipt
      const receipt = await tx.wait();

      // Check if the IdentityAdded event is emitted
      const event = receipt.logs?.find(log => log.fragment.name === "IdentityAdded");
      
      if (event) {
        const { addedBy, newIdentity } = event.args;

        // Verify that the event's arguments are correct
        expect(addedBy).to.equal(owner.address.toString().toLowerCase()); // addedBy should be the owner's address
        expect(newIdentity).to.equal("did:example:123"); // newIdentity should match the added identity
      } else {
        throw new Error("IdentityAdded event not found");
      }

      // Verify that the identity was added and that circular linked lsit of identities is intact
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal("did:example:123");
      expect(await odim.getNextIdentity("did:example:123")).to.equal(owner.address.toString().toLowerCase());
    });
  });

  describe("Removing identities", function () {

    it("remove one identity that is not part of the circular linked list", async function () {
      //this should not be possible
    });

    it("add one identity and remove it", async function () {
      const { odim, owner } = await loadFixture(deployODIM);

      // Call the addIdentity function
      const tx = await odim.addIdentity("did:example:123");

      // Verify that the identity was added and that circular linked lsit of identities is intact
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal("did:example:123");
      expect(await odim.getNextIdentity("did:example:123")).to.equal(owner.address.toString().toLowerCase());

      // Remove the identity
      await odim.removeIdentity("did:example:123");

      // Verify that the identity was removed
      expect(await odim.getNextIdentity("did:example:123")).to.equal("");

      // Verify that the circular linked list of identities is intact
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal(owner.address.toString().toLowerCase());
    });

    it("remove one identity that is part of the circular linked list of another user", async function () {
      const { odim, owner, otherAccount } = await loadFixture(deployODIM);

      // Call the addIdentity function
      const tx = await odim.addIdentity("did:example:123");

      // Verify that the identity was added and that circular linked lsit of identities is intact
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal("did:example:123");
      expect(await odim.getNextIdentity("did:example:123")).to.equal(owner.address.toString().toLowerCase());

      // connect as otherAccount and attempt to remove the identity, which should be reverted by ODIM with message:
      // "toBeRemovedIdentity is not part of the same circular linked list as msg.sender"
      await odim.connect(otherAccount).removeIdentity("did:example:123"); // TODO

      
    });
  });
});
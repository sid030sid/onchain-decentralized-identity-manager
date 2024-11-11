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

    /*NOTE: this case cannot be tested but will surely not be possible due to adding of identities will always be part of the msg.sender's circular linked list of identities
    it("attempt to add an identity to another user's circular linked list of identities", async function () {
      const { odim, owner } = await loadFixture(deployODIM);

    });
    */

    it("attempt to add an identity that is already listed in ODIM's identity registry", async function () {
      const { odim, otherAccount } = await loadFixture(deployODIM);

      // add an identity
      await odim.addIdentity("did:example:123");

      // attempt to add the same identity again by the same user
      await expect(odim.addIdentity("did:example:123")).to.be.revertedWith("newIdentity is already part of registered identities");

      // attempt to add the same identity again by the same user
      await expect(odim.connect(otherAccount).addIdentity("did:example:123")).to.be.revertedWith("newIdentity is already part of registered identities");
    });
  });

  describe("Removing identities", function () {

    it("remove one identity that is not part of the circular linked list", async function () {
      //this should not be possible
    });

    it("add one identity and remove it", async function () {
      const { odim, owner } = await loadFixture(deployODIM);

      // Call the addIdentity function
      await odim.addIdentity("did:example:123");

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

    it("attempt to remove one identity altough sender is not registered", async function () {
      const { odim, owner, otherAccount } = await loadFixture(deployODIM);

      // Call the addIdentity function
      await odim.addIdentity("did:example:123");

      // Verify that the identity was added and that circular linked list of identities is intact
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal("did:example:123");
      expect(await odim.getNextIdentity("did:example:123")).to.equal(owner.address.toString().toLowerCase());

      // connect as otherAccount and attempt to remove the identity, which should be reverted by ODIM due to msg.sender not being part of ODIM's identity registry
      await expect(odim.connect(otherAccount).removeIdentity("did:example:123")).to.be.revertedWith("msg.sender is not part of registered identities");
    });

    it("attempt to remove one identity that is part of the circular linked list of another user", async function () {
      const { odim, owner, otherAccount } = await loadFixture(deployODIM);

      // Call the addIdentity function
      await odim.addIdentity("did:example:123");

      // Verify that the identity was added and that circular linked list of identities is intact
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal("did:example:123");
      expect(await odim.getNextIdentity("did:example:123")).to.equal(owner.address.toString().toLowerCase());

      // Call the addIdentity function as another user
      await odim.connect(otherAccount).addIdentity("did:example:456");

      // Verify that the identity was added and that circular linked list of identities is intact
      expect(await odim.getNextIdentity(otherAccount.address.toString().toLowerCase())).to.equal("did:example:456");
      expect(await odim.getNextIdentity("did:example:456")).to.equal(otherAccount.address.toString().toLowerCase());

      // connect as otherAccount and attempt to remove the identity, which should be reverted by ODIM with message:
      await expect(odim.connect(otherAccount).removeIdentity("did:example:123")).to.be.revertedWith("toBeRemovedIdentity is not part of msg.sender's circular linked list of identities");
    });

    it("attempt to remove one identity that is not part of ODIM's identity registry", async function () {
      const {odim} = await loadFixture(deployODIM);

      // attempt to remove an identity that is not part of ODIM's identity registry
      await expect(odim.removeIdentity("did:example:123")).to.be.revertedWith("toBeRemovedIdentity is not part of registered identities");
    });
  });
});
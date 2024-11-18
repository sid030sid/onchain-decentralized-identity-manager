const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const getDecentralizedIdentityFromOdim = async (identifier, odim) => {
  try{
    let nextIdentity = await odim.getNextIdentity(identifier);
    let decentralizedIdentity = identifier;
    while(nextIdentity !== identifier){
      decentralizedIdentity = decentralizedIdentity + " -> " + nextIdentity;
      nextIdentity = await odim.getNextIdentity(nextIdentity);
    }
    return decentralizedIdentity;
  }catch(error){
    return "Error: " + error;
  }
}

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

    // ZKP attained by running main.zok in remix IDE with Zokrates plugin for babyjubjub based public keys of identity
    const proof = [["0x23d120fb2b8d7f810da6c2227c12d484e638f638afe7c223c0c3179df03775b0","0x27c84be6b813c817774dfd4fbfb9a14cfb7a6a854558d318123605e6a2c2b564"],[["0x1decd236d26865ca024cbb8afe07be335ebce586434e4aa004f6ef8ada508d11","0x02a5c581fec1bb8ad2ca85e33e052c44e6e630fd9b2696e93d832e953032ce3a"],["0x2dc4807df77ab81c96d27ab688e879bca228254674f1268f5c87fcb8a8cf13e9","0x2cc1a707f0b7c6035550c5bed90f38fbd307487bd99d195eb06206e1b92c6595"]],["0x0871eabdf1ca4a8e52cdf5a09c9bd07fe2dfbf6ebbb1262b9bbebf15979496d1","0x004454c753c9eaae1cde537c00b0f2eba2173b5ac36b833a98e3f360285c0957"]]
    const inputs = ["0x0cb5dbe89aae1fc863fbe6697cb902d4bb9e3987ad44a194640cca0a5852bea0","0x272446c799ec688204f91aabca7d4a4bca69deeafbb41aad4cd831a14de445b5","0x0cb5dbe89aae1fc863fbe6697cb902d4bb9e3987ad44a194640cca0a5852bea0","0x272446c799ec688204f91aabca7d4a4bca69deeafbb41aad4cd831a14de445b5"]
    
    it("add one identity to decentralized identity of owner", async function () {
      const { odim, owner } = await loadFixture(deployODIM);

      // Call the addIdentity function
      const tx = await odim.addIdentity("did:example:123", proof, inputs);

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

      // Verify that the public key of the newly added identity is stored correctly
      const publicKeyOfDidExample = await odim.getPublicKey("did:example:123")
      expect(publicKeyOfDidExample[0]).to.equal(BigInt(inputs[0]));
      expect(publicKeyOfDidExample[1]).to.equal(BigInt(inputs[1]));
    });

    /* NOTE: this case cannot be tested since the proof verification as part of the ZKP verification is done by the Zokrates library and not by ODIM so the revert message cannot be triggered as this case causes a Zokrates based error
    it("attempt to add one identity with invalid proof for ZKP verification", async function () {
      const { odim, owner } = await loadFixture(deployODIM);

      // invalid ZKP since first character of the proof was changed from 2 to 1
      const invalidProof = [["0x13d120fb2b8d7f810da6c2227c12d484e638f638afe7c223c0c3179df03775b0","0x27c84be6b813c817774dfd4fbfb9a14cfb7a6a854558d318123605e6a2c2b564"],[["0x1decd236d26865ca024cbb8afe07be335ebce586434e4aa004f6ef8ada508d11","0x02a5c581fec1bb8ad2ca85e33e052c44e6e630fd9b2696e93d832e953032ce3a"],["0x2dc4807df77ab81c96d27ab688e879bca228254674f1268f5c87fcb8a8cf13e9","0x2cc1a707f0b7c6035550c5bed90f38fbd307487bd99d195eb06206e1b92c6595"]],["0x0871eabdf1ca4a8e52cdf5a09c9bd07fe2dfbf6ebbb1262b9bbebf15979496d1","0x004454c753c9eaae1cde537c00b0f2eba2173b5ac36b833a98e3f360285c0957"]]

      // Call the addIdentity function
      await expect(odim.addIdentity("did:example:123", invalidProof, inputs)).to.be.revertedWith("proving ownership of newIdentity failed");

      // Verify that the identity was not added
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal("");
      expect(await odim.getNextIdentity("did:example:123")).to.equal("");

      // Verify no public key was added
      const publicKeyOfDidExample = await odim.getPublicKey("did:example:123")
      expect(publicKeyOfDidExample[0]).to.equal(BigInt(0));
      expect(publicKeyOfDidExample[1]).to.equal(BigInt(0));
    });
    */

    it("attempt to add one identity with invalid inputs for ZKP verification", async function () {
      const { odim, owner } = await loadFixture(deployODIM);

      // invalid ZKP since first character of the proof was changed from 0 to 1
      const invalidInputs = ["0x1cb5dbe89aae1fc863fbe6697cb902d4bb9e3987ad44a194640cca0a5852bea0","0x272446c799ec688204f91aabca7d4a4bca69deeafbb41aad4cd831a14de445b5","0x0cb5dbe89aae1fc863fbe6697cb902d4bb9e3987ad44a194640cca0a5852bea0","0x272446c799ec688204f91aabca7d4a4bca69deeafbb41aad4cd831a14de445b5"]

      // Call the addIdentity function
      await expect(odim.addIdentity("did:example:123", proof, invalidInputs)).to.be.revertedWith("proving ownership of newIdentity failed");

      // Verify that the identity was not added
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal("");
      expect(await odim.getNextIdentity("did:example:123")).to.equal("");

      // Verify no public key was added
      const publicKeyOfDidExample = await odim.getPublicKey("did:example:123")
      expect(publicKeyOfDidExample[0]).to.equal(BigInt(0));
      expect(publicKeyOfDidExample[1]).to.equal(BigInt(0));
    });

    /*NOTE: this case cannot be tested but will surely not be possible due to adding of identities will always be part of the msg.sender's circular linked list of identities
    it("attempt to add an identity to another user's circular linked list of identities", async function () {
      const { odim, owner } = await loadFixture(deployODIM);

    });
    */

    it("attempt to add an identity that is already listed in ODIM's identity registry", async function () {
      const { odim, otherAccount } = await loadFixture(deployODIM);

      // add an identity
      await odim.addIdentity("did:example:123", proof, inputs);

      // attempt to add the same identity again by the same user
      await expect(odim.addIdentity("did:example:123", proof, inputs)).to.be.revertedWith("newIdentity is already part of registered identities");

      // attempt to add the same identity again by the same user
      await expect(odim.connect(otherAccount).addIdentity("did:example:123", proof, inputs)).to.be.revertedWith("newIdentity is already part of registered identities");
    });
  });

  describe("Removing identities", function () {

    // ZKP attained by running main.zok in remix IDE with Zokrates plugin for babyjubjub based public keys of identity
    const proof = [["0x23d120fb2b8d7f810da6c2227c12d484e638f638afe7c223c0c3179df03775b0","0x27c84be6b813c817774dfd4fbfb9a14cfb7a6a854558d318123605e6a2c2b564"],[["0x1decd236d26865ca024cbb8afe07be335ebce586434e4aa004f6ef8ada508d11","0x02a5c581fec1bb8ad2ca85e33e052c44e6e630fd9b2696e93d832e953032ce3a"],["0x2dc4807df77ab81c96d27ab688e879bca228254674f1268f5c87fcb8a8cf13e9","0x2cc1a707f0b7c6035550c5bed90f38fbd307487bd99d195eb06206e1b92c6595"]],["0x0871eabdf1ca4a8e52cdf5a09c9bd07fe2dfbf6ebbb1262b9bbebf15979496d1","0x004454c753c9eaae1cde537c00b0f2eba2173b5ac36b833a98e3f360285c0957"]]
    const inputs = ["0x0cb5dbe89aae1fc863fbe6697cb902d4bb9e3987ad44a194640cca0a5852bea0","0x272446c799ec688204f91aabca7d4a4bca69deeafbb41aad4cd831a14de445b5","0x0cb5dbe89aae1fc863fbe6697cb902d4bb9e3987ad44a194640cca0a5852bea0","0x272446c799ec688204f91aabca7d4a4bca69deeafbb41aad4cd831a14de445b5"]

    it("remove one identity that is not part of the circular linked list", async function () {
      //this should not be possible
    });

    it("add one identity and remove it", async function () {
      const { odim, owner } = await loadFixture(deployODIM);

      // Call the addIdentity function
      await odim.addIdentity("did:example:123", proof, inputs);

      // Verify that the identity was added and that circular linked lsit of identities is intact
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal("did:example:123");
      expect(await odim.getNextIdentity("did:example:123")).to.equal(owner.address.toString().toLowerCase());

      let publicKeyOfDidExample = await odim.getPublicKey("did:example:123")
      expect(publicKeyOfDidExample[0]).to.equal(BigInt(inputs[0]));
      expect(publicKeyOfDidExample[1]).to.equal(BigInt(inputs[1]));

      // Remove the identity
      await odim.removeIdentity("did:example:123");

      // Verify that the identity was removed
      expect(await odim.getNextIdentity("did:example:123")).to.equal("");

      // Verify that the circular linked list of identities is intact
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal(owner.address.toString().toLowerCase());

      // Verify that the public key of the newly removed identity is removed too
      publicKeyOfDidExample = await odim.getPublicKey("did:example:123")
      expect(publicKeyOfDidExample[0]).to.equal(BigInt(0));
      expect(publicKeyOfDidExample[1]).to.equal(BigInt(0));
    });

    it("attempt to remove one identity altough sender is not registered", async function () {
      const { odim, owner, otherAccount } = await loadFixture(deployODIM);

      // Call the addIdentity function
      await odim.addIdentity("did:example:123", proof, inputs);

      // Verify that the identity was added and that circular linked list of identities is intact
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal("did:example:123");
      expect(await odim.getNextIdentity("did:example:123")).to.equal(owner.address.toString().toLowerCase());

      // connect as otherAccount and attempt to remove the identity, which should be reverted by ODIM due to msg.sender not being part of ODIM's identity registry
      await expect(odim.connect(otherAccount).removeIdentity("did:example:123")).to.be.revertedWith("msg.sender is not part of registered identities");
    });

    it("attempt to remove one identity that is part of the circular linked list of another user", async function () {
      const { odim, owner, otherAccount } = await loadFixture(deployODIM);

      // Call the addIdentity function
      await odim.addIdentity("did:example:123", proof, inputs);

      // Verify that the identity was added and that circular linked list of identities is intact
      expect(await odim.getNextIdentity(owner.address.toString().toLowerCase())).to.equal("did:example:123");
      expect(await odim.getNextIdentity("did:example:123")).to.equal(owner.address.toString().toLowerCase());

      // Call the addIdentity function as another user
      await odim.connect(otherAccount).addIdentity("did:example:456", proof, inputs);

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

  describe("Querying identities", function () {

    // ZKP attained by running main.zok in remix IDE with Zokrates plugin for babyjubjub based public keys of identity
    const proof = [["0x23d120fb2b8d7f810da6c2227c12d484e638f638afe7c223c0c3179df03775b0","0x27c84be6b813c817774dfd4fbfb9a14cfb7a6a854558d318123605e6a2c2b564"],[["0x1decd236d26865ca024cbb8afe07be335ebce586434e4aa004f6ef8ada508d11","0x02a5c581fec1bb8ad2ca85e33e052c44e6e630fd9b2696e93d832e953032ce3a"],["0x2dc4807df77ab81c96d27ab688e879bca228254674f1268f5c87fcb8a8cf13e9","0x2cc1a707f0b7c6035550c5bed90f38fbd307487bd99d195eb06206e1b92c6595"]],["0x0871eabdf1ca4a8e52cdf5a09c9bd07fe2dfbf6ebbb1262b9bbebf15979496d1","0x004454c753c9eaae1cde537c00b0f2eba2173b5ac36b833a98e3f360285c0957"]]
    const inputs = ["0x0cb5dbe89aae1fc863fbe6697cb902d4bb9e3987ad44a194640cca0a5852bea0","0x272446c799ec688204f91aabca7d4a4bca69deeafbb41aad4cd831a14de445b5","0x0cb5dbe89aae1fc863fbe6697cb902d4bb9e3987ad44a194640cca0a5852bea0","0x272446c799ec688204f91aabca7d4a4bca69deeafbb41aad4cd831a14de445b5"]
    
    it("get identity based on one user's identifier", async function () {
      const { odim, owner, otherAccount } = await loadFixture(deployODIM);

      // add identities of owner
      await odim.addIdentity("did:example:123", proof, inputs);
      await odim.addIdentity("did:example:456", proof, inputs);
      await odim.addIdentity("did:example:789", proof, inputs);
      await odim.addIdentity("did:example:101", proof, inputs);

      // add identities of otherAccount
      await odim.connect(otherAccount).addIdentity("did:example:111", proof, inputs);
      await odim.connect(otherAccount).addIdentity("did:example:222", proof, inputs);
      await odim.connect(otherAccount).addIdentity("did:example:333", proof, inputs);
      await odim.connect(otherAccount).addIdentity("did:example:444", proof, inputs);
      await odim.connect(otherAccount).addIdentity("did:example:555", proof, inputs);

      // get the decentralized identity of owner
      const ownerIdentity = await getDecentralizedIdentityFromOdim(owner.address.toString().toLowerCase(), odim);
      expect(ownerIdentity).to.equal(owner.address.toString().toLowerCase()+" -> did:example:101 -> did:example:789 -> did:example:456 -> did:example:123");

      const otherAccountIdentity = await getDecentralizedIdentityFromOdim(otherAccount.address.toString().toLowerCase(), odim);
      expect(otherAccountIdentity).to.equal(otherAccount.address.toString().toLowerCase()+" -> did:example:555 -> did:example:444 -> did:example:333 -> did:example:222 -> did:example:111");
    });
  });
});
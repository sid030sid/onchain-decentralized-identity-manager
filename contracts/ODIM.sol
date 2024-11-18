// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() pure internal returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() pure internal returns (G2Point memory) {
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
    }
    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) pure internal returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
    }


    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

// On-chain Decentralized Identity Manager (ODIM)
contract ODIM {

    mapping(string => string) private identities; //stores each user's circular linked list of identifiers such as DIDs or wallet addresses (note: the circluar linked list of identifiers builds the decentralized identity of the user)
    mapping(string => uint256[2]) private publicKeys; //stores the hex encoeded babyjubjub based public key of identifier listed in the circular linked list of each user's identifiers

    event IdentityAdded(string addedBy, string newIdentity);
    event IdentityRemoved(string removedBy, string removedIdentity);

    /**
     * @dev Adds a new identity to the circular linked list of the sender's decentralized identity.
     * @param newIdentity The new identity to be added (format: the relative DID URL used to reference the babyjubjub based verification method, more info here: https://www.w3.org/TR/did-core/#relative-did-urls).
     * @param proof The ZK proof of ownership of the new identity.
     * @param input The input for the ZK proof of ownership of the new identity (format: [publicKeyX, publicKeyY, message, signature]).
     */
    function addIdentity(string memory newIdentity, Proof memory proof, uint[4] memory input) public {
        //check if newIdentity is already part of identities
        if(bytes(identities[newIdentity]).length != 0){
            revert("newIdentity is already part of registered identities");
        }

        //check ZK proof of ownership of newIdentity
        require(verifyTx(proof, input), "proving ownership of newIdentity failed");

        //connect newIdentity to its public key
        publicKeys[newIdentity] = [input[0], input[1]]; //note: input[0] and input[1] are the x and y coordinates of the babyjubjub based public key in hex format

        //convert sender to string
        string memory sender = addressToString(msg.sender);

        //get first next identity
        string memory firstIdentity = identities[sender];

        //overwrite first next identity with new identity
        identities[sender] = newIdentity;

        //if newIdentity is the first identity of msg.sender's circular linked list of its decentralized identity
        if(bytes(firstIdentity).length == 0){
            //close the circular linked list
            identities[newIdentity] = sender;
        }else{
            //push down original first next identity in circular linked list
            identities[newIdentity] = firstIdentity;
        }
        
        emit IdentityAdded(sender, newIdentity);
    }

    /**
     * @dev Removes an identity from the circular linked list of the sender's decentralized identity.
     * @param toBeRemovedIdentity The identity (e.g. DID, wallet address etc.) to be removed.
     */
    function removeIdentity(string memory toBeRemovedIdentity) public {
        //check if toBeRemovedIdentity is part of identities
        if(bytes(identities[toBeRemovedIdentity]).length == 0){
            revert("toBeRemovedIdentity is not part of registered identities");
        }

        //convert sender to string
        string memory sender = addressToString(msg.sender);

        //convert toBeRemovedItentity and sender into comparable format
        bytes32 comparableToBeRemovedIdentity = keccak256(abi.encodePacked((toBeRemovedIdentity)));
        bytes32 comparableSender = keccak256(abi.encodePacked((sender)));

        //check if sender is part of the same circular linked list as toBeRemovedIdentity
        string memory currentIdentity = sender; //helping variable for removal process
        string memory nextFirstIdentity = identities[sender];
        if(bytes(nextFirstIdentity).length == 0){ //check if sender is generally part of circular linked list of identities
            revert("msg.sender is not part of registered identities");
        }
        bytes32 comparableNextFirstidentity = keccak256(abi.encodePacked((nextFirstIdentity)));
        while(comparableToBeRemovedIdentity != comparableNextFirstidentity){
            if(comparableNextFirstidentity == comparableSender){
                revert("toBeRemovedIdentity is not part of msg.sender's circular linked list of identities");
            }
            currentIdentity = nextFirstIdentity; //update to be able to remoe toBeRemovedIdentity
            nextFirstIdentity = identities[nextFirstIdentity];
            comparableNextFirstidentity = keccak256(abi.encodePacked((nextFirstIdentity)));
        }

        //TODO in future: more secure and flexible identity removal pre-condition:
            // Option 1: check proof of ownership of toBeRemovedIdentity
            // Option 2: proof of ownership of all identities in the circular linked list of the user must be presented (in the case of ownerhsip over toBeRemovedIdentity was lost)
            // Option 3: ???
        
        //perform identity removal
        identities[currentIdentity] = identities[toBeRemovedIdentity];
        identities[toBeRemovedIdentity] = "";

        //remove public key of toBeRemovedIdentity
        delete publicKeys[toBeRemovedIdentity];

        emit IdentityRemoved(sender, toBeRemovedIdentity);
    }

    /**
     * @dev Gets the next identity in the circular linked list of the sender's decentralized identity.
     * @param key The identity (e.g. DID, wallet address etc.) to get the next identity for.
     * @return The next identity in the circular linked list of the sender's decentralized identity.
     * Note: by continue calling this function till one gets the identity that is equal to the inputted identity from the first function call,
     * one can get all items form the circular linked list
     */
    function getNextIdentity(string memory key) public view returns (string memory) {
        return identities[key];
    }

    /**
     * @dev Retrieves the public key associated with a specific identity.
     * @param identity The identifier for which the associated public key is being requested.
     * @return array containing the babyjubjub based public key components [x, y] of the specified identity in decimal BigInt format.
     */
    function getPublicKey(string memory identity) public view returns (uint256[2] memory) {
        return publicKeys[identity];
    }

    /**
     * @dev Converts an address to a string.
     * @param _address The address to be converted.
     * @return The address as a string.
     * TODO in future: find a way so that this function becomes obsolete!
     */
    function addressToString(address _address) internal pure returns (string memory) {
         bytes memory addressBytes = abi.encodePacked(_address);
        bytes memory hexChars = "0123456789abcdef";
        bytes memory str = new bytes(2 + addressBytes.length * 2);
        
        str[0] = '0';
        str[1] = 'x';
        
        for (uint i = 0; i < addressBytes.length; i++) {
            str[2 + i * 2] = hexChars[uint8(addressBytes[i] >> 4)];
            str[3 + i * 2] = hexChars[uint8(addressBytes[i] & 0x0f)];
        }
        
        return string(str);
    }

    // Zokrates based Verifier
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }
    struct Proof {
        Pairing.G1Point a;
        Pairing.G2Point b;
        Pairing.G1Point c;
    }
    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x2f5e6af506b96774e2925365c3321345ab256e893511ffa46ecd791a2b287b60), uint256(0x05a0204a91ba0d8e72ecafd94fc63edcd0a2cca50e7549d0d83bb0b0b000942a));
        vk.beta = Pairing.G2Point([uint256(0x0fc4d876c4b0000d6d623ccedefe8ea74e434f530b1dbc983368bf04934235ed), uint256(0x1fdd473eb14c6bdf4bd5657cc16142d3202f5e3bdc4154643552718d7e94010c)], [uint256(0x28ea5438112033a6f687d6cc45889e190ac48e6d8531961dc40978ffb8d9d190), uint256(0x158e624699f5391e0dc3a137f641ab56ba79d2e716606da48f7b836a5931e810)]);
        vk.gamma = Pairing.G2Point([uint256(0x0b53988a08178909f759edcd1a77ea41715ad14c7caf6157acd583dc41a9b310), uint256(0x14791244c423d2beb727a55784b31fcb5d92f0a7e192f2e3f9b7752633d56cbf)], [uint256(0x1b624abd12a5810d8d16ee53cc9cfba66de28fddc0674b60b6944970c4719094), uint256(0x09df1760dd611dee6de8572575ab0b8142e7557be61334c05b63d30df9d08b42)]);
        vk.delta = Pairing.G2Point([uint256(0x1f74b0713025db4df4578d294f8b8f621810939fac569cc7d79ad49180853776), uint256(0x16f23c3152a8e86756a5d93344b1ce5cdee88178d2508ad22522d1dd373260ed)], [uint256(0x1034505b233386f7d899b1578ca346bc2dc0b5b000713ec6300761c70bf716b3), uint256(0x19e53e7bd2b633e93403afbd9a03ffd158fc363d8af40ed1cb7df23b339a21d5)]);
        vk.gamma_abc = new Pairing.G1Point[](5);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x25bd36b30a82e6f6ac8621d99e20a8af6ca97da2d7b5fe880901d61e60ae1ca1), uint256(0x20eaaa7f9fae79f789f96dff742170c6e5fd18c96c284d75489cd66f659e63ba));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x2b8507accbf4846476aafb36dad3c7f9694b317cf4951b1444de897a27bb3a41), uint256(0x154be64c8b3b929a656048310f46ea999c243fa3931ef5febd675542f4b1bed2));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x298e5732c627eed58eb7f7a58df2ac1699fe27953e3ac249a27d24ad2a2c3f4d), uint256(0x059cc84bfd7b0fb48297cbfbd56a05248ed2819265bb9fc0079ce4f21d4e70ed));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x0838c912682118e141da1ec9eb259c180f860f28646729f361d94c94a8aa727f), uint256(0x01809de65884e45c1229794a15468011dfc04b37afcc2ed1fba1fb508457e9ac));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x0462ce76cc1ed5d937aeb12932b1caff41052f0940e8527aafda3d080b677ba6), uint256(0x15b1f680bde4e1a42ec7a624ccc1083270aecf263137602f54ef7db91440a0dd));
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }
    function verifyTx(
            Proof memory proof, uint[4] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](4);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
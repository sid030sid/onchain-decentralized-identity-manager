// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// On-chain Decentralized Identity Manager (ODIM)
contract ODIM {

    mapping(string => string) public identities; //stores the circular linked list of each user (note: each circluar linked list of identifiers such as DIDs makes the decentralized identity of the user)

    event IdentityAdded(string addedBy, string newIdentity);

    function addIdentity(string memory newIdentity) public {
        //TODO check ZK proof of ownership of newIdentity

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

    function removeIdentity(string memory toBeRemovedIdentity) public {
        //convert sender to string
        string memory sender = addressToString(msg.sender);

        //convert toBeRemovedItentity and sender into comparable format
        bytes32 comparableToBeRemovedIdentity = keccak256(abi.encodePacked((toBeRemovedIdentity)));
        bytes32 comparableSender = keccak256(abi.encodePacked((sender)));

        //check if sender is part of the same circular linked list as toBeRemovedIdentity
        string memory currentIdentity = sender; //helping variable for removal process
        string memory nextFirstIdentity = identities[sender];
        bytes32 comparableNextFirstidentity = keccak256(abi.encodePacked((nextFirstIdentity)));
        while(comparableToBeRemovedIdentity != comparableNextFirstidentity){
            if(comparableNextFirstidentity == comparableSender){
                revert("toBeRemovedIdentity is not part of the same circular linked list as msg.sender");
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
    }

    // by continue calling this function till one gets the identity that is equal to the inputted identity from the first function call, one can get all items form the circular linked list
    function getNextIdentity(string memory key) public view returns (string memory) {
        return identities[key];
    }

    //TODO in future: find a way so that this function becomes obsolete
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
}
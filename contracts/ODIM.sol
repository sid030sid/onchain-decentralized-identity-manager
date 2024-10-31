// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// On-chain Decentralized Identity Manager (ODIM)
contract ODIM {
    mapping(string => string) public identities;

    function addIdentity(string memory newIdentity) public {

        //TODO
    }

    function removeIdentity(string memory key) public {
        delete identities[key];
    }

    function getIdentity(string memory key) public view returns (string memory) {
        return identities[key];
    }

    function _getOldestIdentity(string memory sender, string memory startingIdentity) private view returns (string memory) {
        if (bytes(identities[sender]).length == 0) {
            return sender;
        }else{
            return this._getOldestIdentity(identities[sender]);
        }
    }
}
# ODIM: On-chain Decentralized Identity Manager
ODIM allows users to manage the identifiers that they have created to use Decentralized Applications (DApps). Such identifiers, e. g. wallet addresses or Decentralized Identifiers (DIDs), form the unique decentralized identity of users. Therefore, ODIM is world's first **O**n-chain **D**ecentralized **I**dentity **M**anager, enabling users to manage their decentralized identity efficiently while DApps can rely on ODIM's decentralized identity registry for interoperability of decentralized processes, such as the issuance and verification of verifiable credentials (see more for [why using ODIM](#why-using-odim)).

## How to...
1. set up ODIM: open terminal and run `npm install` while in root folder (**NOTE**: nodeJS version 20.8.1 was used to build this repo!)
2. test ODIM: open terminal and run `npx hardhat test` while in root folder (run `REPORT_GAS=true npx hardhat test` if gas report should be printed out)
3. deploy ODIM: open terminal and run `npx hardhat ignition deploy ./ignition/modules/Lock.js` while in root folder
4. use ODIM to manage my decentralized identity:
    - Option 1 - via Etherscan interface: Demo video TBA
    - Option 2 - via script: TBA
    - Create ZKP: TBA
5. use ODIM to query its decentralized identity registry:
    - Check if a specific identifier is part of ODIM's identity registry: TBA 
    - Get decentralized identity, i. e. get all identifiers of one user: TBA

## Why using ODIM?
1. Revocery
2. Interoperability
3. Regulations
4. TBC

# ODIM: **O**n-chain **D**ecentralized **I**dentity **M**anager
ODIM allows users to manage the identifiers that they have created to use Decentralized Applications (DApps). Such identifiers, e. g. wallet addresses or Decentralized Identifiers (DIDs), form the unique decentralized identity of users. Therefore, ODIM is world's first **O**n-chain **D**ecentralized **I**dentity **M**anager, enabling users to manage their decentralized identity efficiently while DApps can rely on ODIM's decentralized identity registry for interoperability of decentralized processes, such as the issuance and verification of verifiable credentials (see more for [why using ODIM](#why-using-odim)).

## How to...
- set up ODIM: 
  1. open terminal and run `npm install` while in root folder (**NOTE**: nodeJS version 20.8.1 was used to build this repo!)
  2. generate babyjubjub based key pair which must be added as new verification method of the DID that should be added to decentralized identity managable through ODIM:
    - set up [zokrates-pycrypto](https://github.com/Zokrates/pycrypto) following its [installation description](https://github.com/Zokrates/pycrypto/tree/master?tab=readme-ov-file#install) which includes:
      - clonning `zokrates-pycrypto` 
      - creating virtual environment, named ``venv``, by running ``py -m venv venv``
      - activating virtual environment by running ``venv\Scripts\activate.bat`` in cmd terminal
      - running `pip install -r requirements.txt` in active virtual env to install dependencies
      - running `pip install py-multibase cbor2` as additional dependencies
    - add files of folder `zokrates-pycrypto-code` into the cloned repo of zokrate's `pycrypto`
    - run `python createBabyJubJubKeyPair.py` in active virtual environment, which outputs babyjubjub based key pair in `babyJubJubKeyPair.txt`
- test ODIM: open terminal and run `npx hardhat test` while in root folder (run `REPORT_GAS=true npx hardhat test` if gas report should be printed out)
- use ODIM locally:
  1. copy the `main.zok` in ``zokrates-circuits`` folder and paste the file into [Remix IDE](https://remix.ethereum.org/) with [zokrates plugin](https://zokrates.github.io/gettingstarted.html) installed
  2. using zokrates plugin...
    - compile ``main.zok`` in Remix
    - compute wittness by inputting...
      1. the babyjubjub based public key coordinates for variable `pk`, starting with ``x`` and then ``y``
      2. the private key of the babyjubjub based public key for variable `sk`
      3. click on `Compute`
    - Run Setup
    - generate proof of wittness and copy the output which is the proof and the input needed by ODIM to verify the ownership of the babyjubjub based key pair 
  3. copy `ODIM.sol` in folder `contracts` and paste it into Remix IDE inside folder `contracts`
  4. verify ``ODIM.sol`` contract in Remix
  5. Deploy ``ODIM.sol`` contract while having selected `Dev - Hardhat Provider` as environment (Note: this requires runnning `npx hardhat node` inside the terminal while in root folder of the ODIM repo)
  6. Under ``deployed contracts``, Remix now provides a simple user interface for interacting with ODIM. Here a quick overview about ODIM's funtions:
    - `addIdentity`: Adds a new identity to the circular linked list of the sender's decentralized identity (Note: this function requires the Zokrates based ZKP of control over the to be added identity which is inserted as inputs: `proof` and `ìnput`)
    - `removeIdentity`: Removes an identity from the circular linked list of the sender's decentralized identity.
    - `getNextIdentity`:Gets the next identity in the circular linked list of the sender's decentralized identity.
    - `verifyTx`: Verifies the Zokrates based ZKP of control over a babyjubjub based keypair (Note: this function is called by the function `addIdentity` and is available so that one can test the verification of the ZKP before inserting it in `addIdentity` function.)

## Why using ODIM?
1. Revocery
2. Interoperability
3. Regulations
4. TBC
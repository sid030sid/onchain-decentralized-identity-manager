# ODIM: **O**n-chain **D**ecentralized **I**dentity **M**anager
ODIM allows users to manage the identifiers that they have created to use Decentralized Applications (DApps). Such identifiers, e. g. wallet addresses or Decentralized Identifiers (DIDs), form the unique decentralized identity of users. Therefore, ODIM is world's first **O**n-chain **D**ecentralized **I**dentity **M**anager, enabling users to manage their decentralized identity efficiently while DApps can rely on ODIM's decentralized identity registry for interoperability of decentralized processes, such as the issuance and verification of verifiable credentials (see more for [why using ODIM](#why-using-odim)).

## How to...
1. set up ODIM: 
    1. open terminal and run `npm install` while in root folder (**NOTE**: nodeJS version 20.8.1 was used to build this repo!)
    2. generate key pair underlying identifier of decentralized identity (e.g. DID):
        - run `node keyPairGenerator.js curve=cruveType` while in root folder and ``curveType`` being set to `ed25519`, `p-256`, or `secp256kv1`
    3. set up pycrypto and transform previously generated key pair for zokrates: 
        - create python virtual env in folder `pycrypto-helper` with the name `venv`, e.g. by running ``py -m venv venv`` in folder `pycrypto-helper` 
        - activate python virtual environment, e.g. by running ``venv\Scripts\activate.bat`` while in folder `pycrypto-helper` with cmd terminal (**NOTE**: leave this cmd terminal open for later usage)
        - run `pip install -r requirements.txt` in active virtual env to install dependencies
        - run `python transformKeyPairForZokrates.py privateKey` in active virtual env while `privateKey` being set to the private key of the previously generated key pair (**Example ed25519 private key**: 79340758399813660106305464615835886567798495571483990055077550004444527965420 can be used instead if desired.)
        - open file `transformedKeyPair.txt` to view the just transformed key pair
2. test ODIM: open terminal and run `npx hardhat test` while in root folder (run `REPORT_GAS=true npx hardhat test` if gas report should be printed out)
  1. copy and paste the `main.zok` in ``zokrates-circuts`` folder in remix IDE with zokrates plguin installed
  2. compile main.zok in remix
  3. compute proof
  4. generate witness of proof
  5. insert the witness into ODIM while adding new identity to decentralized identity
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

## Comparison Key Pair Types:
**NOTE**: Only the numbers of the BabyJubJub curve where examined regarding their correctness (See [here](https://docs.zkbob.com/implementation/elliptic-curve-cryptography) for source).
Public and private key pairs differ based on their underlying cruve. **BabyJubJub**, **secp256k1**, **prime256v1 (P-256)**, and **Ed25519** are the curves compared in the following:

### 1. **Curve Equation**

- **BabyJubJub**:
  - The BabyJubJub curve is a **twisted Edwards curve** with the equation:
    \[
    a \cdot x^2 + y^2 = 1 + d \cdot x^2 \cdot y^2
    \]
    - It is designed for efficiency in **zero-knowledge proofs** (zk-SNARKs) and uses the **ALT_BN128** pairing-friendly field.

- **secp256k1**:
  - secp256k1 is a **Weierstrass curve** with the equation:
    \[
    y^2 = x^3 + 7
    \]
    - It is particularly optimized for blockchain applications like **Bitcoin** and **Ethereum**, offering very fast operations.

- **prime256v1 (P-256)**:
  - P-256 is another **Weierstrass curve** defined by the equation:
    \[
    y^2 = x^3 - 3x + b
    \]
    - This curve is used widely in **TLS** (Transport Layer Security) and for **X.509 certificates**.

- **Ed25519**:
  - Ed25519 is an **Edwards curve**, specifically designed for **EdDSA** (Edwards-curve Digital Signature Algorithm) with the equation:
    \[
    -x^2 + y^2 = 1 - \frac{1}{d} x^2 y^2
    \]
    - It is widely used in **cryptographic signatures** due to its fast, secure, and simple structure.

### 2. **Modulus (Finite Field)**

- **BabyJubJub**:
  - Modulus: 
    \[
    21888242871839275222246405745257275088548364400416034343698204186575808495617
    \]
  - It uses a 256-bit field, ensuring security against quantum attacks and optimized for zk-SNARKs.

- **secp256k1**:
  - Modulus:
    \[
    0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
    \]
  - This 256-bit prime field is used in **blockchain systems**, including Bitcoin.

- **prime256v1 (P-256)**:
  - Modulus:
    \[
    0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff
    \]
  - This is a **256-bit** prime modulus used in many **cryptographic protocols** such as TLS.

- **Ed25519**:
  - Modulus:
    \[
    2^{255} - 19
    \]
  - Ed25519 operates over a **255-bit** prime field, offering a higher level of security compared to 256-bit primes (as it’s harder to break).

### 3. **Curve Order**

- **BabyJubJub**:
  - Order:
    \[
    21888242871839275222246405745257275088614511777268538073601725287587578984328
    \]
  - The curve order is a large prime, offering high cryptographic security, with an emphasis on zero-knowledge proofs.

- **secp256k1**:
  - Order:
    \[
    0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
    \]
  - The order of secp256k1 is prime and ensures a strong cryptographic group for **digital signatures** in blockchain protocols.

- **prime256v1 (P-256)**:
  - Order:
    \[
    0xffffffff00000001000000000000000000000000fffffffffffffffffffffffe
    \]
  - P-256 has a prime order of 256 bits, providing strong cryptographic security for **public-key infrastructure**.

- **Ed25519**:
  - Order:
    \[
    2^{252} + 277423177773723535358519377994722421153388713030662548748632335973
    \]
  - Ed25519's order is a large prime, ensuring that cryptographic operations are secure and resistant to attacks.

### 4. **Cofactor**

- **BabyJubJub**:
  - Cofactor: **8**
  - The cofactor indicates how many points lie outside the cryptographic subgroup. A cofactor of 8 means it’s easier to generate a valid point for cryptographic purposes.

- **secp256k1**:
  - Cofactor: **1**
  - secp256k1 has a cofactor of 1, making it highly efficient because every point on the curve belongs to the cryptographic subgroup used for operations.

- **prime256v1 (P-256)**:
  - Cofactor: **1**
  - Similar to secp256k1, P-256 has a cofactor of 1, which makes all points valid for cryptographic operations.

- **Ed25519**:
  - Cofactor: **8**
  - Ed25519 also has a cofactor of 8, but since it’s a **Edwards curve**, its group structure is inherently more efficient for signatures and key generation.

### 5. **Generator Point**

- **BabyJubJub**:
  - Generator point coordinates: 
    \[
    (x, y) = (15432774951723927157031250336277790668279068029556328898354949310072202318295, 1094793399012674419577823790376044935246658671901627841542961578327961423020)
    \]
  - This generator is used to generate public keys and perform elliptic curve operations.

- **secp256k1**:
  - Generator point coordinates:
    \[
    (x, y) = (0x79BE667EF9DCBBAC55A62ED6FBF8F6F8B8BEF9D5369F559F73E92D1F7E7F99A0F2, 0x7CFD8D2C6D5EE6BC83C20F80539A5A68A41A78F9072C5B7E2B706AB4CC44D45F2)
    \]
  - These are the standard generator point coordinates used in Bitcoin and Ethereum.

- **prime256v1 (P-256)**:
  - Generator point coordinates:
    \[
    (x, y) = (0x6B17D1F2E12C4247F8BCE6E22C6C03B5D86F04B8E4A5F164A37A3E4D1D5B7F5C8, 0x4FE342E2FE1A7F9B8B80C8E7EB49E1D6D91E94E1C79E0F0A6F34D16FB9A4C1C6F)
    \]
  - The generator used in P-256 for public-key generation and **ECDSA** signatures.

- **Ed25519**:
  - Generator point coordinates:
    \[
    (x, y) = (0x216936D3CD6A8A5F6E4B498907A38E90890A2BE48C8103B55A9F2F32C33D6D8, 0x666666666666666666666666666666666666666666666666666666666666666)
    \]
  - Ed25519 uses a different point for public key generation and **EdDSA** signature verification.

### 6. **Security Level**

- **BabyJubJub**:
  - Offers **128-bit security**, making it strong enough for cryptographic proofs and zero-knowledge applications.
  - It’s widely used in **zk-SNARK** applications, such as **Zcash**.

- **secp256k1**:
  - secp256k1 provides **128-bit security**, making it suitable for digital signature schemes like those used in **Bitcoin** and **Ethereum**.

- **prime256v1 (P-256)**:
  - Provides **128-bit security** as well, which is widely trusted for **TLS** and **X.509 certificates**.

- **Ed25519**:
  - Ed25519 offers **128-bit security** but with higher efficiency in terms of key generation and signing operations. It’s used in modern **cryptographic applications** like **OpenSSH**, **TLS**, and **signal protocols**.
const { generateKeyPairSync } = require('crypto');

const createP256KeyPair = async () => {
    // Generate an ECDSA key pair (P-256)
    const { publicKey, privateKey } = generateKeyPairSync('ec', {
        namedCurve: 'prime256v1', // P-256 curve
        publicKeyEncoding: {
            type: 'spki',
            format: 'der'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'der'
        }
    });

    // Split private key into two parts
    const publicKey1 = publicKey.slice(0, publicKey.length / 2);
    const publicKey2 = publicKey.slice(publicKey.length / 2);

    // Convert each segment to BigInt compatible with ZoKrates
    const publicKey1Field = BigInt('0x' + publicKey1.toString('hex'));
    const publicKey2Field = BigInt('0x' + publicKey2.toString('hex'));
    const privateKeyField = BigInt('0x' + privateKey.toString('hex'));

    console.log("Private Key as field:", privateKeyField.toString());
    console.log("Public Key part 1 as field:", publicKey1Field.toString());
    console.log("Public Key part 2 as field:", publicKey2Field.toString());
};

createP256KeyPair();

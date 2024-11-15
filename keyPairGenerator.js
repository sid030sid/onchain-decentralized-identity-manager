const crypto = require('crypto');
const { argv } = require('node:process');
const args = process.argv.slice(2);

const generateKeyPair = () => {
    const curve = args.find(arg => arg.startsWith('curve')).split('=')[1] || 'p-256';	

    let keyPair = {
        publicKey: '',
        privateKey: '',
        privateKeyAsBigInt: 0,
        curve: curve
    }

    if (curve === 'p-256') {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
            namedCurve: 'prime256v1',
            publicKeyEncoding: {
                type: 'spki',
                format: 'der'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'der'
            }
        });

        keyPair.publicKey = publicKey.toString("base64");
        keyPair.privateKey = privateKey.toString("base64");
        keyPair.privateKeyAsBigInt = BigInt('0x' + privateKey.toString('hex'));
    } else if (curve === 'ed25519') {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
            publicKeyEncoding: {
                type: 'spki',
                format: 'der'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'der'
            }
        });

        keyPair.publicKey = publicKey.toString("base64");
        keyPair.privateKey = privateKey.toString("base64");
        keyPair.privateKeyAsBigInt = BigInt('0x' + privateKey.toString('hex'));
    }else if (curve === 'secp256k1'){
        const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
            namedCurve: 'secp256k1',
            publicKeyEncoding: {
                type: 'spki',
                format: 'der'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'der'
            }
        });

        keyPair.publicKey = publicKey.toString("base64");
        keyPair.privateKey = privateKey.toString("base64");
        keyPair.privateKeyAsBigInt = BigInt('0x' + privateKey.toString('hex'));
    }else{
        throw('Invalid curve. Please use p-256, ed25519 or secp256k1 for key pair generation.')
    }

    return keyPair
}

console.log(generateKeyPair());
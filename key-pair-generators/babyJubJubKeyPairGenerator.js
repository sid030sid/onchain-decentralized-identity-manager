const circomlib = require('circomlibjs');
const crypto = require('crypto');

async function generateBabyJubjubKeyPair() {
    // Generate a random private key (32 bytes)
    const skBytes = crypto.randomBytes(32);
    const sk = BigInt('0x' + skBytes.toString('hex'));

    // Build the Baby Jubjub context
    const babyJub = await circomlib.buildBabyjub();

    // Ensure the private key is reduced within the Baby Jubjub field
    const skField = sk % babyJub.subOrder;

    // Perform scalar multiplication to get the public key point on the curve
    const G = babyJub.Generator;
    const pubKeyPoint = babyJub.mulPointEscalar(G, skField);

    return {
        privateKey: sk.toString(16), // Private key as hex
        publicKey: {
            x: pubKeyPoint[0].toString(),
            y: pubKeyPoint[1].toString()
        }
    };
}

// Generate and log the key pair
generateBabyJubjubKeyPair().then(keyPair => {
    console.log("Private Key:", keyPair.privateKey);
    console.log("Public Key (x, y):", keyPair.publicKey);
}).catch(console.error);

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

    // Convert the BigInt values of X and Y to plain strings
    const pkFieldX = pubKeyPoint[0].toString(); // Public key X component (no commas)
    const pkFieldY = pubKeyPoint[1].toString(); // Public key Y component (no commas)

    // Return public and private keys as strings
    return {
        privateKey: skField.toString(), // Private key as a string (field element)
        publicKeyX: pkFieldX.toString().replaceAll(",", ""),           //TODO chance since this cannot be right
        publicKeyY: pkFieldY.toString().replaceAll(",", "")
    };
}

// Generate and log the key pair
generateBabyJubjubKeyPair().then(keyPair => {
    console.log("Private Key (field):", keyPair.privateKey);
    console.log("Public Key X (field):", keyPair.publicKeyX);
    console.log("Public Key Y (field):", keyPair.publicKeyY);
}).catch(console.error);

from zokrates_pycrypto.eddsa import PublicKey, PrivateKey
import multibase

def createBjjKeyPair():


    # create random private key based on babyjubjub curve
    sk = PrivateKey.from_rand()

    # derieve public key based on randomly generated babyjubjub private key
    pk = PublicKey.from_private(sk)

    return sk.fe, pk.p.x, pk.p.y

# transform key pair so that it can be inputted into zokrates circuts
private_key, public_key_x, public_key_y = createBjjKeyPair()

public_key_jwk = {
    "kty": "EC",
    "crv": "BabyJubJub",
    "x": public_key_x,
    "y": public_key_y
}

verificationMethodEntry = {
    "id": "TODO",
    "type": "JsonWebKey2020",
    "controller": "TODO",
    "publicKeyJwk": public_key_jwk
}

# create did:key based on the generated babyjubjub key pair
x_bytes = int(public_key_x).to_bytes(32, byteorder='big') #Convert x and y to 32-byte representations (BabyJubJub uses 32-byte keys)
y_bytes = int(public_key_y).to_bytes(32, byteorder='big')

raw_public_key = x_bytes + y_bytes # Concatenate x and y to form the raw public key

multibase_encoded_key = multibase.encode('base58btc', raw_public_key).decode() # Encode the raw public key into Base58btc format (prefix z)

# create DID document of the did:key identifier
did_doc = {
    "@context": [
        "https://www.w3.org/ns/did/v1"
    ],
    "id": "did:key:" + multibase_encoded_key,
    "verificationMethod": [{
    "id": "did:key:" + multibase_encoded_key + "#" + multibase_encoded_key,
    "type": "JsonWebKey2020",
    "controller": "did:key:" + multibase_encoded_key,
    "publicKeyJwk": public_key_jwk
    }],
    "authentication": [
        "did:key:" + multibase_encoded_key + "#" + multibase_encoded_key
    ]
}


# store transformed key pair in file
f = open("babyJubJubKeyPair.txt", "w")
f.write("private key: "+str(private_key)+"\n")
f.write("public key x: "+str(public_key_x)+"\n")
f.write("public key y: "+str(public_key_y)+"\n")
f.write("public key as JWK: "+str(public_key_jwk)+"\n")
f.write("potential verificationMethod entry for DID: "+str(verificationMethodEntry)+"\n")
f.write("potential did:key did document: "+str(did_doc)+"\n")
f.close()

# print to console
print("Private Key:", private_key, "\n")
print("Public Key as JWK:", public_key_jwk, "\n")
print("Potential verificationMethod entry for DID:", verificationMethodEntry, "\n")
print("Potential did:key DID document:", did_doc)
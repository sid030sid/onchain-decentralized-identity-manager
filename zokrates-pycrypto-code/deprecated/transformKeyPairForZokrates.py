from zokrates_pycrypto.eddsa import PublicKey, PrivateKey
from zokrates_pycrypto.field import FQ
import sys

def transformKeyPair():
    # example private key given by zokrates creators: 1997011358982923168928344992199991480689546837621580239342656433234255379025
    # ed25519 private key example: 79340758399813660106305464615835886567798495571483990055077550004444527965420 
    # p256 private key example: 41178489177195200794780305924761950101929730984874151135769537932948018620251383214995783271715582689367528802432557313202382509522410790170280379719292312244786996816661857697980916649088436863567083461080158834954419585053151186724739175941770142570357829576483743765629812653973382005738843498736696096913629901348736064901857125
    # programatically create example private key based on babyjubjub curve: random.randint(1, field_modulus - 1)
    private_key = int(sys.argv[1]) 

    # format private key as zokrates field type
    key = FQ(
        private_key
    ) 

    # create private key object which transforms private key from any curve type to babyjubjub curve
    sk = PrivateKey(key)

    # create public key based on babyjubjub based private key
    pk = PublicKey.from_private(sk)

    return sk.fe, pk.p.x, pk.p.y

# transform key pair so that it can be inputted into zokrates circuts
private_key, public_key_x, public_key_y = transformKeyPair()

# store transformed key pair in file
f = open("transformedKeyPair.txt", "w")
f.write("private key: "+str(private_key)+"\n")
f.write("public key x: "+str(public_key_x)+"\n")
f.write("public key y: "+str(public_key_y)+"\n")
f.close()

# print to console
print("Private Key:", private_key)
print("Public Key x:", public_key_x)
print("Public Key y:", public_key_y)
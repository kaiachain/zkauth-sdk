export const testJwt = {
    iss: "http://server.example.com",
    sub: "248289761001",
    aud: "s6BhdRkqt3",
    nonce: "0x8d9abb9b140bd3c63db2ce7ee3171ab1c2284fd905ad13156df1069a1918b2b38d9abb9b140bd3c63db2ce7ee3171ab1c2284fd905ad13156df1069a1918b2b3",
    iat: 1311281970,
    exp: 1726640433,
    name: "Jane Doe",
    given_name: "Jane",
    family_name: "Doe",
    gender: "female",
};

export const testJwk = {
    kty: "RSA",
    kid: "85e55107466b7e29836199c58c7581f5b923be44",
    e: "AQAB",
    use: "sig",
    n: "4tVDrq5RbeDtlJ2Xh2dikE840LWflr89Cm3cGI9mQGlskTigV0anoViOH92Z1sqWAp5e1aRkLlCm-KAWc69uvOW_X70jEhzDJVREeB3h-RAnzxYrbUgDEgltiUaM8Zxtt8hiVh_GDAudRmSP9kDxXL5xnJETF1gnwAHa0j7cM4STLKbtwKi73CEmTjTLqGAES8XVnXp8VWGb6IuQzdmBIJkfcFog4Inq93F4Cj_SXsSjECG3j56VxgwnloPCHTXVn_xS1s3OjoBCOvOVSJfg2nSTWNi93JGR9pWZevh7Sq8Clw8H2lvIAPV_HYdxvsucWg8sJuTa6ZZSxT1WmBkW6Q",
    alg: "RS256",
};

export const confUrl = "https://accounts.google.com/.well-known/openid-configuration";
export const jwkUrl = "https://www.googleapis.com/oauth2/v3/certs";

export enum Networks {
    BAOBAB = 1001,
    CYPRESS = 8217,
}

interface Addresses {
    entryPointAddr: string;
    oidcRecoveryFactoryV02Addr?: string;
    zkVerifierV02Addr?: string;
    manualJwksProviderAddr?: string;
    oraklJwksProviderAddr?: string;
    googleGuardianV02Addr?: string;
    kakaoGuardianV02Addr?: string;
    twitchGuardianV02Addr?: string;
    appleGuardianV02Addr?: string;
    lineGuardianV02Addr?: string;
    counterAddr?: string;
}

const CYPRESS: Addresses = {
    entryPointAddr: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    oidcRecoveryFactoryV02Addr: undefined,
    zkVerifierV02Addr: undefined,
    manualJwksProviderAddr: undefined,
    oraklJwksProviderAddr: undefined,
    googleGuardianV02Addr: undefined,
    kakaoGuardianV02Addr: undefined,
    twitchGuardianV02Addr: undefined,
    appleGuardianV02Addr: undefined,
    lineGuardianV02Addr: undefined,
    counterAddr: undefined,
};

const BAOBAB: Addresses = {
    entryPointAddr: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    oidcRecoveryFactoryV02Addr: "0x5A454a213BeD09052c6b84a4344a8eD3A69D559c",
    zkVerifierV02Addr: "0xC7B94E3827FD4D2c638EEae2e9219Da063b5BB55",
    manualJwksProviderAddr: "0xF871E80Ac5F679f9137Db4091841F0657dFD2B04",
    oraklJwksProviderAddr: "0x993BcF72A45c834A12a04d095B7961472325B6A2",
    googleGuardianV02Addr: "0x18B64ff66D993f8875AdA004dD3e11Da61576B35",
    kakaoGuardianV02Addr: "0x7D3f210ae1E50E40902515D7CDFb7d7Af9dF8323",
    twitchGuardianV02Addr: "0xaE99480B3FaaB2A79083513b4d8EaD3c04cC6353",
    appleGuardianV02Addr: undefined,
    lineGuardianV02Addr: undefined,
    counterAddr: "0x3F2201Db69c7bD8427FD816ca4d38CC17B448d90",
};

export const Addresses: { [key: number]: Addresses } = {
    [Networks.CYPRESS]: CYPRESS,
    [Networks.BAOBAB]: BAOBAB,
};

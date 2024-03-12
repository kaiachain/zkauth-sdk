export enum Networks {
    BAOBAB = 1001,
    CYPRESS = 8217,
}

interface Addresses {
    CounterAddr?: string;
    EntryPointAddr: string;
    RecoveryFactoryAddr?: string;
    ManualJwksProviderAddr?: string;
    OraklJwksProviderAddr?: string;
    GoogleGuardianAddr?: string;
    KakaoGuardianAddr?: string;
    TwitchGuardianAddr?: string;
    AppleGuardianAddr?: string;
    LineGuardianAddr?: string;
}

const CYPRESS: Addresses = {
    CounterAddr: undefined,
    EntryPointAddr: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    RecoveryFactoryAddr: undefined,
    ManualJwksProviderAddr: undefined,
    OraklJwksProviderAddr: undefined,
    GoogleGuardianAddr: undefined,
    KakaoGuardianAddr: undefined,
    TwitchGuardianAddr: undefined,
    AppleGuardianAddr: undefined,
    LineGuardianAddr: undefined,
};

const BAOBAB: Addresses = {
    CounterAddr: "0x3F2201Db69c7bD8427FD816ca4d38CC17B448d90",
    EntryPointAddr: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    RecoveryFactoryAddr: "0x280fd135dD72D5bcC060e3b280fa13CF543073FA",
    ManualJwksProviderAddr: "0x20e8d77CBFAD3d08FD5fa1e118D844a012f4c2bC",
    OraklJwksProviderAddr: "0xcb10b0FF081797A96258b3aEB45a43E382dA0481",
    GoogleGuardianAddr: "0x605BD3E7546172Ad730585b2c0caAb2524B4F4e8",
    KakaoGuardianAddr: "0xd909993fADC292F2Aa5728133b8aFf2db8aeB208",
    TwitchGuardianAddr: "0x8829CACE02d18f89d2c137F9328309652DeF9Ada",
    AppleGuardianAddr: undefined,
    LineGuardianAddr: undefined,
};

export const Addresses: { [key: number]: Addresses } = {
    [Networks.CYPRESS]: CYPRESS,
    [Networks.BAOBAB]: BAOBAB,
};

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
    GoogleGuardianAddr: "0xa1930Df14A842b8DfA47BECf5347Bf8A1d8B4E75",
    KakaoGuardianAddr: "0x364669A6040585A1117979399E454A9a3FabeD03",
    TwitchGuardianAddr: "0x7897e273EE938cb88A9E6C3DdB36f7e5050D2891",
    AppleGuardianAddr: undefined,
    LineGuardianAddr: undefined,
};

export const Addresses: { [key: number]: Addresses } = {
    [Networks.CYPRESS]: CYPRESS,
    [Networks.BAOBAB]: BAOBAB,
};

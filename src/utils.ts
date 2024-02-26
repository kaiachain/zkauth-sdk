import { Addresses, Networks } from "./constants/Address";

export const providerNameToIss: { [key: string]: string } = {
    google: "https://accounts.google.com",
    kakao: "https://kauth.kakao.com",
    apple: "https://appleid.apple.com",
    line: "https://access.line.me",
    twitch: "https://id.twitch.tv/oauth2",
};

export const issToProviderName: { [key: string]: string } = {};
for (const [key, value] of Object.entries(providerNameToIss)) {
    issToProviderName[value] = key;
}

export const getGuardianFromIssOrName = (issOrName: string, chainId: Networks) => {
    if (issOrName === "https://accounts.google.com" || issOrName === "google") {
        return Addresses[chainId].googleGuardianV02Addr;
    } else if (issOrName === "https://kauth.kakao.com" || issOrName === "kakao") {
        return Addresses[chainId].kakaoGuardianV02Addr;
    } else if (issOrName === "https://appleid.apple.com" || issOrName === "apple") {
        return Addresses[chainId].appleGuardianV02Addr;
    } else if (issOrName === "https://access.line.me" || issOrName === "line") {
        return Addresses[chainId].lineGuardianV02Addr;
    } else if (issOrName === "https://id.twitch.tv/oauth2" || issOrName === "twitch") {
        return Addresses[chainId].twitchGuardianV02Addr;
    } else {
        return "";
    }
};

export const getProviderNameFromIss = (iss: string) => {
    if (iss === "https://accounts.google.com") {
        return "google";
    } else if (iss === "https://kauth.kakao.com") {
        return "kakao";
    } else if (iss === "https://appleid.apple.com") {
        return "apple";
    } else if (iss === "https://access.line.me") {
        return "line";
    } else if (iss === "https://id.twitch.tv/oauth2") {
        return "twitch";
    } else {
        return "";
    }
};

export const getIssFromProviderName = (provider: string) => {
    if (provider === "google") {
        return "https://accounts.google.com";
    } else if (provider === "kakao") {
        return "https://kauth.kakao.com";
    } else if (provider === "apple") {
        return "https://appleid.apple.com";
    } else if (provider === "line") {
        return "https://access.line.me";
    } else if (provider === "twitch") {
        return "https://id.twitch.tv/oauth2";
    } else {
        return "";
    }
};

export const formatProvider = (providers: string[]) => {
    const formattedProviders: string[] = [];
    const providerCount: { [key: string]: number } = {};
    for (const p of providers) {
        if (providerCount[p]) {
            providerCount[p] += 1;
            formattedProviders.push(`${p}#${providerCount[p]}`);
        } else {
            providerCount[p] = 1;
            formattedProviders.push(p);
        }
    }
    return formattedProviders;
};

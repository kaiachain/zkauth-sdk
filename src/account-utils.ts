import { ethers } from "ethers";

import { OIDCRecoveryAccountV02, OIDCGuardianV02 } from ".";

export const isPhantom = async (cfAddress: string, rpcUrl: string) => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const senderAddressCode = await provider.getCode(cfAddress);
    if (senderAddressCode.length > 2) {
        return false;
    }
    return true;
};

export const getThreshold = async (cfAddress: string, rpcUrl: string) => {
    if (await isPhantom(cfAddress, rpcUrl)) {
        return 0;
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const oidcRecoveryAccount = new ethers.Contract(cfAddress, OIDCRecoveryAccountV02, provider);
    return Number(await oidcRecoveryAccount.threshold());
};

export const getIss = async (cfAddress: string, rpcUrl: string) => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const oidcIss: string[] = [];
    let guardianAddress;
    try {
        guardianAddress = await getGuardians(cfAddress, rpcUrl);
    } catch (err) {
        console.error(err);
        return [];
    }

    for (const address of guardianAddress) {
        const guardian = new ethers.Contract(address, OIDCGuardianV02, provider);
        const iss = await guardian.iss();
        oidcIss.push(iss);
    }
    return oidcIss;
};

export const getGuardians = async (cfAddress: string, rpcUrl: string) => {
    if (await isPhantom(cfAddress, rpcUrl)) {
        return [];
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const oidcRecoveryAccount = new ethers.Contract(cfAddress, OIDCRecoveryAccountV02, provider);
    const guardians = await oidcRecoveryAccount.getGuardiansInfo();
    const guardianAddress = guardians.map((guardian: any) => guardian[1]);
    return guardianAddress;
};

export const getInitialOwnerAddress = async (cfAddress: string, rpcUrl: string) => {
    if (await isPhantom(cfAddress, rpcUrl)) {
        return undefined;
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const oidcRecoveryAccount = new ethers.Contract(cfAddress, OIDCRecoveryAccountV02, provider);

    return await oidcRecoveryAccount.initialOwner();
};

export const getInitialGuardianAddress = async (cfAddress: string, rpcUrl: string) => {
    if (await isPhantom(cfAddress, rpcUrl)) {
        return undefined;
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const oidcRecoveryAccount = new ethers.Contract(cfAddress, OIDCRecoveryAccountV02, provider);

    return await oidcRecoveryAccount.initialGuardian();
};

export const getOwnerAddress = async (cfAddress: string, rpcUrl: string) => {
    if (await isPhantom(cfAddress, rpcUrl)) {
        return undefined;
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const oidcRecoveryAccount = new ethers.Contract(cfAddress, OIDCRecoveryAccountV02, provider);

    return await oidcRecoveryAccount.owner();
};

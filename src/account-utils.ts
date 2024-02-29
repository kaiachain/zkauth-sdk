import { ethers } from "ethers";

import { RecoveryAccount, Guardian } from ".";

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
    const recoveryAccount = new ethers.Contract(cfAddress, RecoveryAccount, provider);
    return Number(await recoveryAccount.threshold());
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
        const guardian = new ethers.Contract(address, Guardian, provider);
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
    const recoveryAccount = new ethers.Contract(cfAddress, RecoveryAccount, provider);
    const guardians = await recoveryAccount.getGuardiansInfo();
    const guardianAddress = guardians.map((guardian: any) => guardian[1]);
    return guardianAddress;
};

export const getInitialOwnerAddress = async (cfAddress: string, rpcUrl: string) => {
    if (await isPhantom(cfAddress, rpcUrl)) {
        return undefined;
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const recoveryAccount = new ethers.Contract(cfAddress, RecoveryAccount, provider);

    return await recoveryAccount.initialOwner();
};

export const getInitialGuardianAddress = async (cfAddress: string, rpcUrl: string) => {
    if (await isPhantom(cfAddress, rpcUrl)) {
        return undefined;
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const recoveryAccount = new ethers.Contract(cfAddress, RecoveryAccount, provider);

    return await recoveryAccount.initialGuardian();
};

export const getOwnerAddress = async (cfAddress: string, rpcUrl: string) => {
    if (await isPhantom(cfAddress, rpcUrl)) {
        return undefined;
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const recoveryAccount = new ethers.Contract(cfAddress, RecoveryAccount, provider);

    return await recoveryAccount.owner();
};

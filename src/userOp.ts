import { HttpRpcClient } from "@account-abstraction/sdk";
import { TransactionDetailsForUserOp } from "@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp";
import { ethers } from "ethers";

import { RecoveryAccountAPI } from "./account";
import { Addresses, Networks } from "./constants/Address";

type PollFunc<T> = (() => T | null) | (() => Promise<T | null>);

export async function poll<T>(func: PollFunc<T>): Promise<T> {
    let timeout = 1;

    /* eslint-disable no-constant-condition */
    while (true) {
        try {
            const result = await func();
            if (result !== null) {
                return result;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            if (e.code && e.reason) {
                // ethers makeError
                console.log(`poll error: code: ${e.code}, reason: ${e.reason}`);
            } else {
                console.log(`poll error: ${e}`);
            }
        }
        await new Promise((r) => {
            setTimeout(r, timeout * 1000);
        });
        if (timeout < 10) {
            timeout += 1;
        }
    }
}

async function createAdjustedSignedUserOp(smartWallet: RecoveryAccountAPI, tx: TransactionDetailsForUserOp) {
    const uo = await smartWallet.createUnsignedUserOp(tx);
    // Recommend adding 10% of preVerificationGas
    uo.preVerificationGas = Math.floor(Number(await uo.preVerificationGas) * 1.1);
    const signedUo = await smartWallet.signUserOp(uo);
    return signedUo;
}

export async function createAndSendUserOp(
    smartWallet: RecoveryAccountAPI,
    bundlerUrl: string,
    chainId: Networks,
    tx: TransactionDetailsForUserOp
) {
    const signedUo = await createAdjustedSignedUserOp(smartWallet, tx);
    const rpc = new HttpRpcClient(bundlerUrl, Addresses[chainId].EntryPointAddr, chainId);
    const uoHash = await rpc.sendUserOpToBundler(signedUo);
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });

    const bundlerProvider = new ethers.providers.JsonRpcProvider(bundlerUrl);

    const uorc = await poll(async () => {
        return await bundlerProvider.send("eth_getUserOperationReceipt", [uoHash]);
    });
    return uorc;
}

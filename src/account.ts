import { BaseAccountAPI, BaseApiParams } from "@account-abstraction/sdk/dist/src/BaseAccountAPI";
import { ethers } from "ethers";
import { arrayify, hexConcat, Interface } from "ethers/lib/utils";

import { AuthData } from "./authBuilder";
import { OIDCRecoveryAccountFactoryV02, OIDCRecoveryAccountV02 } from "./constants/abi";

/**
 * Needed if user's account is not yet deployed
 * @Note initial owner might be different from the current owner of the account
 */
export interface InitCodeParams {
    subHash: ethers.BytesLike;
    initialGuardianAddress: string;
    initialOwnerAddress: string;
    index?: ethers.BigNumberish;
    chainIdOrZero: number;
}

/**
 * Use this if the account has already been deployed
 * since all InitCodeParams can be retrieved from the account contract
 */
export interface ScaAddrParams {
    scaAddr: string;
}

export type RecoveryAccountApiParams = (InitCodeParams | ScaAddrParams) & BaseApiParams;

export class RecoveryAccountAPI extends BaseAccountAPI {
    initCodeParams?: InitCodeParams;
    scaAddr?: string;
    accountContract?: ethers.Contract;
    factory?: ethers.Contract;
    factoryAddress?: string;

    signer: ethers.Wallet;

    constructor(signer: ethers.Wallet, params: RecoveryAccountApiParams, factoryAddress?: string) {
        super({ ...params, overheads: { nonZeroByte: 100, zeroByte: 100 } });
        if ("scaAddr" in params) {
            this.scaAddr = params.scaAddr;
        } else {
            this.initCodeParams = params;
        }
        this.factoryAddress = factoryAddress;
        this.signer = signer;
    }

    async _getOIDCRecoveryAccountV02(): Promise<ethers.Contract> {
        const accountContract = new ethers.Contract(
            await this.getAccountAddress(),
            OIDCRecoveryAccountV02,
            this.signer
        );

        return accountContract;
    }

    async _getOIDCRecoveryAccountFactoryV02(): Promise<ethers.Contract> {
        if (this.factoryAddress == null) {
            throw new Error("no factory address");
        }
        const accountContract = new ethers.Contract(this.factoryAddress, OIDCRecoveryAccountFactoryV02, this.signer);
        return accountContract;
    }

    async _getAccountContract(): Promise<ethers.Contract> {
        if (this.accountContract == null) {
            this.accountContract = await this._getOIDCRecoveryAccountV02();
        }
        return this.accountContract;
    }

    async getAccountAddress() {
        if (this.scaAddr != null) {
            return this.scaAddr;
        }
        return super.getAccountAddress();
    }

    async _getFactoryContract(): Promise<ethers.Contract> {
        if (this.factory == null) {
            if (this.factoryAddress?.length !== 0) {
                this.factory = await this._getOIDCRecoveryAccountFactoryV02();
            } else {
                throw new Error("no factory to get initCode");
            }
        }
        return this.factory;
    }

    async getAccountInitCode(): Promise<string> {
        const factory = await this._getFactoryContract();
        if (this.initCodeParams == null) {
            const sca = await this._getAccountContract();
            this.initCodeParams = await ethers.utils.resolveProperties({
                initialGuardianAddress: sca.initialGuardian(),
                subHash: sca.initialSubHash(),
                initialOwnerAddress: sca.initialOwner(),
                index: sca.idx() ?? 0,
                chainIdOrZero: sca.chainIdOrZero(),
            });
        }

        return hexConcat([
            factory.address,
            factory.interface.encodeFunctionData("createAccount", [
                this.initCodeParams.subHash,
                this.initCodeParams.initialGuardianAddress,
                this.initCodeParams.initialOwnerAddress,
                this.initCodeParams.index ?? 0,
                this.initCodeParams.chainIdOrZero,
            ]),
        ]);
    }

    async getNonce(): Promise<ethers.BigNumber> {
        if (await this.checkAccountPhantom()) {
            return ethers.BigNumber.from(0);
        }
        const accountContract = await this._getAccountContract();
        return await accountContract.getNonce();
    }

    async getOwner(): Promise<string> {
        if (await this.checkAccountPhantom()) {
            return await this.signer.getAddress();
        }
        const accountContract = await this._getAccountContract();
        return await accountContract.owner();
    }

    async getPendingOwner(): Promise<string> {
        if (await this.checkAccountPhantom()) {
            return ethers.constants.AddressZero;
        }
        const accountContract = await this._getAccountContract();
        return await accountContract.pendingOwner();
    }

    async getSubHash(guardian: string): Promise<string> {
        if (await this.checkAccountPhantom()) {
            return ethers.constants.HashZero;
        }
        const accountContract = await this._getAccountContract();
        return await accountContract.subHash(guardian);
    }

    async requestRecover(newOwner: string, auth: AuthData, subSigner?: ethers.Wallet) {
        // TODO: Make separate API for subSigner.
        const sca = subSigner
            ? new ethers.Contract(await this.getAccountAddress(), OIDCRecoveryAccountV02, subSigner)
            : await this._getAccountContract();
        const tx = await sca.requestRecover(newOwner, auth);
        await tx.wait();
    }

    async signUserOpHash(userOpHash: string): Promise<string> {
        if ((await this.getOwner()) != (await this.signer.getAddress())) {
            throw new Error("owner is different; did you run the initial recover()?");
        }
        return await this.signer.signMessage(arrayify(userOpHash));
    }

    async encodeExecute(target: string, value: ethers.BigNumberish, data: string): Promise<string> {
        const accountContract = await this._getAccountContract();
        return accountContract.interface.encodeFunctionData("execute", [target, value, data]);
    }

    encodeAddGuardian(guardian: string, subHash: string, newThreshold: number) {
        const iface = new Interface(OIDCRecoveryAccountV02);
        const data = iface.encodeFunctionData("addGuardian", [guardian, subHash, newThreshold]);
        return data;
    }

    encodeRemoveGuardian(guardian: string, subHash: string, newThreshold: number) {
        const iface = new Interface(OIDCRecoveryAccountV02);
        const data = iface.encodeFunctionData("removeGuardian", [guardian, subHash, newThreshold]);
        return data;
    }

    encodeUpdateThreshold(newThreshold: number) {
        const iface = new Interface(OIDCRecoveryAccountV02);
        const data = iface.encodeFunctionData("updateThreshold", [newThreshold]);
        return data;
    }
}

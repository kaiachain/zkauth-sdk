# Account Abstraction SDK for zkAuth

## 1. Introduction

This is a SDK for zkAuth. It allows applications to interact with zkAuth smart contracts, which can create & manage AA wallet based on zkAuth protocol.

## 2. Installation

TBA

## 3. Usage

Some input/output values need to be stored in the DB or on the user side (localStorage, Cloud backup). The storage format doesn't matter, as long as it's structured in a way that makes it easy to retrieve user data.

### Create a new AA wallet

Users can create their zkAuth wallet based on their OAuth2 idToken.

1. Prepare a JWT token from the OIDC provider for the initial owner (Note: Nonce isn't important)

2. Create and Save Wallet

    - Input
        - `ownerKey`: Generated private key of the initial owner
        - `sub`: JWT token's `sub` field after OAuth2 login
        - `initialGuardian`: Initial guardian address based on the OAuth2 provider
        - `chainId`: Chain ID
    - Output
        - `cfAddress`: Calculated AA wallet address
        - `salt`: Salt to generate subHash. The saltSeed is `sub`
    - Save
        - `ownerKey`: Save to user side (can't be saved to DB since it's non-custodial wallet)
        - `cfAddress`: Save to DB or user side
        - `saltSeed`: Save to DB or user side
        - `sub`: Optionally save to DB or user side to reuse it in the future without re-login (e.g. to remove guardian)

    ```js
    const signer = new ethers.Wallet(ownerKey, JsonRpcProvider);
    const salt = await calcSalt(sub);
    const subHash = calcSubHash(sub, salt);

    const params: InitCodeParams & BaseApiParams = {
        initialGuardianAddress: initialGuardian,
        initialOwnerAddress: signer.address,
        chainIdOrZero: 0,
        subHash: subHash,
        provider: JsonRpcProvider,
        entryPointAddress: Addresses[chainId].entryPointAddr,
    };

    const scw = new RecoveryAccountAPI(signer, params, Addresses[chainId].oidcRecoveryFactoryV02Addr);
    const cfAddress = await scw.getAccountAddress();
    // Save wallet as your own
    ```

    This stage makes `phantom` account, which means it's not been actually deployed on the chain. It will be deployed when user sends its first userOp transaction with the wallet. But we strongly recommend to deploy the account right after creating it since it won't be recoverable if user loses its private key before deploying it.

3. Deploy Wallet (Strongly recommended)

    The AA wallet can be deployed by i) `Factory.createAccount` or ii) First `UserOp` with `initCode` in the transaction data. Since the owner address needs to be funded with KLAY for first method, it's recommended to use second method, which is more user-friendly.

    ```js
    const signer = new ethers.Wallet(ownerKey, JsonRpcProvider);
    const scw = new RecoveryAccountAPI(signer, params, Addresses.oidcRecoveryFactoryV02Addr);
    const target = cfAddress;

    // You can use any UserOp, so use entryPoint() as an example
    const data = ethers.utils.keccak256(Buffer.from("entryPoint()")).slice(0, 10);

    const tx: TransactionDetailsForUserOp = {
        target: target,
        data: data,
        value: 0,
    };

    // With UserOp, the account will be deployed
    const uorc = await createAndSendUserOp(scw, bundlerUrl, chainId, tx);
    ```

### Send a UserOp transaction

Users can send transaction called `UserOp` with their zkAuth wallet. It requires `ownerKey` to sign the transaction. If the wallet is `phantom` wallet, `UserOp` will contain the deployment process by `initCode`.

1. Prepare a RecoveryAccountAPI with appropriate signer and parameters

    ```js
    // If the account hasn't been deployed yet, you need to manually set all the parameters
    if (isPhantomWallet) {
        param = {
            subHash: subHash,
            initialGuardianAddress: initGuardian,
            initialOwnerAddress: initOwner,
            chainIdOrZero: 0,
            provider: getProvider(network.chainId),
            entryPointAddress: Addresses.entryPointAddr,
        };
    } else {
        param = {
            scaAddr: cfAddress,
            provider: getProvider(network.chainId),
            entryPointAddress: Addresses.entryPointAddr,
        };
    }
    const scw = new RecoveryAccountAPI(signer, param, Addresses.oidcRecoveryFactoryV02Addr);
    ```

2. Prepare transaction data

    ```js
    const tx: TransactionDetailsForUserOp = {
        target: targetAddress,
        data: txData,
        value: value,
    };
    ```

3. Send the userOp

    ```js
    const uorc = await createAndSendUserOp(scw, bundlerUrl, chainId, tx);
    ```

### Add a new Guardian

Users can add a new guardian to their zkAuth wallet. It allows same provider but different account to be a guardian. (e.g., different Google account)

1. Prepare a JWT token from the target OIDC provider for the new Guardian (Note: Nonce isn't important)

2. Add the new Guardian

    - Input
        - `newSub`: JWT token's `sub` field taken from the previous step
        - `newSalt`: Salt to generate subHash. The saltSeed is `newSub`
        - `newGuardian`: New guardian address based on the provider
        - `newThreshold`: New threshold after adding the guardian
    - Save
        - `newSaltSeed`: Save to DB or user side
        - `newSub`: Optionally save to DB or user side to reuse it in the future without re-login (e.g. to remove guardian)

    ```js
    const newSalt = await calcSalt(newSub);
    const newSubHash = ethers.utils.keccak256(Buffer.from(newSalt + newSub));
    const signer = new ethers.Wallet(ownerKey, JsonRpcProvider);
    const param: RecoveryAccountApiParams = {
        scaAddr: cfAddress,
        provider: JsonRpcProvider,
        entryPointAddress: Addresses[chainId].entryPointAddr,
    };
    const scw = new RecoveryAccountAPI(signer, param, Addresses[chainId].oidcRecoveryFactoryV02Addr);
    const data = scw.encodeAddGuardian(newGuardian, newSubHash, newThreshold);
    const tx: TransactionDetailsForUserOp = {
        target: cfAddress,
        data: data,
        value: 0,
    };
    const uorc = await createAndSendUserOp(scw, bundlerUrl, chainId, tx);
    ...
    ```

### Remove a Guardian

Users can remove a guardian from their zkAuth wallet.

1. Prepare `sub` and `guardian` to remove

    - If `sub` isn't stored in DB or user side, you need to get user's JWT token.

2. Remove the Guardian

    - Input
        - `targetSub`: JWT token's `sub` field taken from the previous step
        - `targetGuardian`: Guardian address to remove
        - `newThreshold`: New threshold after removing the guardian
    - Delete
        - Delete saved guardian's `sub` and `saltSeed` from DB or user side

    ```js
    const newSalt = await calcSalt(targetSub);
    const newSubHash = ethers.utils.keccak256(Buffer.from(newSalt + targetSub));
    const signer = new ethers.Wallet(ownerKey, JsonRpcProvider);
    const param: RecoveryAccountApiParams = {
        scaAddr: cfAddress,
        provider: JsonRpcProvider,
        entryPointAddress: Addresses[chainId].entryPointAddr,
    };
    const scw = new RecoveryAccountAPI(signer, param, Addresses[chainId].oidcRecoveryFactoryV02Addr);
    const data = scw.encodeRemoveGuardian(targetGuardian, newSubHash, newThreshold);
    const tx: TransactionDetailsForUserOp = {
        target: cfAddress,
        data: data,
        value: 0,
    };
    const uorc = await createAndSendUserOp(scw, bundlerUrl, chainId, tx);
    ...
    ```

### Recover an AA wallet

If user wallet is `ghost` wallet, user can't recover it, so delete it and create a new one.

1. Prepare user's recovery JWT tokens above a `threshold` based on registered guardians

    - Input
        - `newOwnerAddress`: New owner's address
        - `guardians`: Guardian addresses
        - `cfAddress`: AA wallet address
        - `chainId`: Chain ID

    ```js
    const args: typeDataArgs = {
        verifyingContract: guardian,
        sca: cfAddress,
        newOwner: newOwnerAddress,
        name: aud,
        chainId: chainId,
    };
    const nonce = calcNonce(args);
    // get JWT token from server with nonce
    ```

2. Recover it

    - Input
        - `recoverTokens`: JWT tokens of registered guardians taken from the previous step
        - `rawRecoverTokens`: Base64 encoded JWT tokens of recoverTokens (include header, payload, and signature)
        - `newOwnerKey`: New owner's private key (private key of `newOwnerAddress`)
    - Save
        - `newOwnerKey`: Save to user side (can't be saved to DB since it's non-custodial wallet)
    - Delete
        - Delete previous owner's private key from user side

    ```js
    const iss: string[] = [];
    const sub: string[] = [];
    const salts: string[] = [];
    const confUrls: string[] = [];
    const jwkUrls: string[] = [];
    const jwks: RsaJsonWebKey[] = [];
    const proofAndPubSigs: any[] = [];

    // recoverTokens are JWT tokens of registered guardians
    for (const recoverToken of recoverTokens) {
      const { iss: issTemp, sub: subTemp } = JSON.parse(recoverToken);
      const rawRecoverToken = rawRecoverTokens[idx];
      const header = jwtDecode(rawRecoverToken, { header: true });
      iss.push(issTemp);
      sub.push(subTemp);
      salts.push(await calcSalt(subTemp));
      const provider = getProviderNameFromIss(issTemp);
      confUrls.push(OIDCProviders.find(p => p.name === provider.toLowerCase())?.confUrl as string);
      jwkUrls.push(OIDCProviders.find(p => p.name === provider.toLowerCase())?.jwkUrl as string);
      jwks.push((await getJWKs(provider, header.kid)) as RsaJsonWebKey);

      // Prepare zk proof
      const processedInput = ZkauthJwtV02.process_input(rawRecoverToken, jwks[idx].n, salts[idx]);
      const params = {
        circuit: "zkauth_jwt_v02",
        input: processedInput,
      };
      // getProofAndPubSig function requests zk proof to the zkp server with the given input
      proofAndPubSigs.push(await getProofAndPubSig(params));
    }

    const signer = new ethers.Wallet(newOwnerKey, JsonRpcProvider);
    const params: RecoveryAccountApiParams = {
      scaAddr: cfAddress,
      provider: JsonRpcProvider,
      entryPointAddress: Addresses[chainId].entryPointAddr,
    };
    const scw = new RecoveryAccountAPI(signer, params, Addresses[chainId].oidcRecoveryFactoryV02Addr);

    for (const [idx] of recoverTokens.entries()) {
      const proof = proofAndPubSigs[idx].proof;
      const auth: AuthData = {
        subHash: calcSubHash(sub[idx], salts[idx]),
        guardian: guardians[idx],
        proof: generateProof(jwks[idx].kid, proof.pi_a, proof.pi_b, proof.pi_c, proofAndPubSigs[idx].pubSignals),
      };
      await scw.requestRecover(newOwnerAddress, auth, subSigner);
    }
    ...
    ```

    Or directly use private key of current owner if user knows it.

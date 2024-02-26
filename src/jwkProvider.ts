import axios from "axios";

import { OIDCProviders } from "./constants/OIDCProviders";

export interface RsaJsonWebKey extends JsonWebKey {
    kid: string;
    n: string;
    e: string;
}

export const getJWKs = async (oidcProvider: string, kid?: string, idx?: number) => {
    const jwkUrl = OIDCProviders.find((p) => p.name === oidcProvider.toLowerCase())?.jwkUrl;
    if (!jwkUrl) {
        return null;
    }

    let res;
    try {
        res = await axios.get(jwkUrl);
    } catch (e) {
        console.error(e);
        return null;
    }

    if (kid) {
        const jwk = res.data.keys.find((k: { kid: string }) => k.kid === kid);
        if (!jwk) {
            return null;
        }
        return jwk as RsaJsonWebKey;
    } else {
        const jwk = res.data.keys[idx ?? 0];
        if (!jwk) {
            return null;
        }
        return jwk as RsaJsonWebKey;
    }
};

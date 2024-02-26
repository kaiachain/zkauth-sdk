import { Buffer } from "buffer";

import { utils } from "ethers";
import { JwtHeader } from "jwt-decode";

export interface JwtPayload {
    [key: string]: string | number | string[];
    iss: string;
    sub: string;
    aud: string | string[];
    exp: number;
    iat: number;
}

export interface JwtPayloadWithNonce extends JwtPayload {
    iss: string;
    sub: string;
    aud: string | string[];
    exp: number;
    iat: number;
    nonce: string;
}

export interface JwtHeaderWithKid extends JwtHeader {
    typ: string;
    kid: string;
}

export interface Jwt {
    header: JwtHeader;
    payload: JwtPayload;
    signature: string;
}

export interface JwtWithNonce extends Jwt {
    header: JwtHeaderWithKid;
    payload: JwtPayloadWithNonce;
}

export function decodeJwtOnlyPayload(jwtToken: string) {
    const payload = JSON.parse(jwtToken) as JwtPayloadWithNonce;
    const jwt: JwtWithNonce = {
        header: { typ: "JWT", alg: "RS256", kid: "" },
        payload,
        signature: "",
    };

    return jwt;
}

export function parseJwt(rawJwt: string) {
    const [header, payload, signature] = rawJwt.split(".");
    const idTokenStr = atob(payload);
    const idToken = JSON.parse(idTokenStr) as JwtPayload;
    const jwtHash = utils.sha256(Buffer.from(header + "." + payload));
    const sig = "0x" + Buffer.from(signature, "base64").toString("hex");
    return { header, payload, idTokenStr, idToken, jwtHash, sig };
}

export function calcSubHash(sub: string, salt: string) {
    sub = '"' + sub + '"';
    return utils.sha256(Buffer.concat([Buffer.from(salt, "hex"), Buffer.from(sub, "ascii")]));
}

export const whiteList = ["iat", "exp", "aud", "iss", "nonce"];

export const maskJWT = (jwt: JwtWithNonce, whiteList: string[]) => {
    const payload = jwt.payload;
    const maskedPayload = jwt.payload;
    for (const key in payload) {
        if (!whiteList.includes(key)) {
            maskedPayload[key] = "*".repeat(maskedPayload[key].toString().length);
        }
    }

    if (payload.nonce) {
        if (payload.nonce.length !== 130) {
            throw new Error("Invalid nonce length");
        }
        const nonce = payload.nonce as string;
        maskedPayload.nonce = nonce.slice(0, 66) + "*".repeat(64);
    }
    return { ...jwt, payload: maskedPayload };
};

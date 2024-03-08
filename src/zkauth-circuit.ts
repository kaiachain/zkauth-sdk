import { Buffer } from "buffer";

import base64url from "base64url";

import * as helper from "./circuit-helpers";

export const ZkauthJwtV02 = {
    maxSaltedSubLen: 341, // 31 * 11
    maxClaimLen: 279, // 31 * 9, minimum 31*x that is larger than 256
    maxPubLen: 279, // 31 * 9, minimum 31*x that is larger than 256
    maxSigLen: 279,

    // @param pub  base64url-encoded RSA-2048 public key
    process_input: function (signedJwt: string, pub: string, salt: string) {
        const maxLen = 1023; // 31 * 33
        const maxSaltedSubLen = 341; // 31 * 11
        const maxPubLen = 279; // 31 * 9, minimum 31*x that is larger than 256
        const maxSigLen = maxPubLen;

        const [header, payload, signature] = signedJwt.split(".");

        // JWT
        const jwt = header + "." + payload;
        const jwtLen = jwt.length;

        const payOff = header.length + 1; // position in base64-encoded JWT
        const payLen = payload.length;
        // toString('ascii') may result in some unicode characters to be misinterpreted
        const pay = base64url.toBuffer(payload).toString("ascii");
        const payObject = JSON.parse(base64url.decode(payload));
        console.assert(signedJwt.substring(payOff, payOff + payLen) == payload, "payOff");

        const jwtUints = helper.toUints(helper.sha256Pad(jwt), maxLen);
        const jwtBlocks = helper.sha256BlockLen(jwt);

        // Claims
        function claimPos(jwt: string, name: string): number[] {
            const regex = new RegExp(`\\s*("${name}")\\s*:\\s*("?[^",]*"?)\\s*([,\\}])`);

            const match = jwt.match(regex);
            if (!(match && match.index)) {
                throw new Error("Claim not found: " + name);
            }

            const claimValue = match[2];

            const claimValueHasQuotes = match[0].includes(`"${claimValue}"`);

            const claimOffset = match.index;
            const colonIndex = match[0].indexOf(":");
            const claimValueIndex = match[0].indexOf(claimValue, colonIndex + 1) - (claimValueHasQuotes ? 1 : 0);
            const claimValueLength = claimValue.length + (claimValueHasQuotes ? 2 : 0); // Add 2 for the quotes if they exist
            const pos = [claimOffset, match[0].length, colonIndex, claimValueIndex, claimValueLength];

            return pos;
        }

        const issPos = claimPos(pay, "iss");
        const audPos = claimPos(pay, "aud");
        const iatPos = claimPos(pay, "iat");
        const expPos = claimPos(pay, "exp");
        const noncePos = claimPos(pay, "nonce");
        const subPos = claimPos(pay, "sub");

        // SaltedSub
        const sub = '"' + payObject["sub"] + '"';
        // salt is hex string and sub is ASCII string
        const saltedSub = Buffer.concat([Buffer.from(salt, "hex"), Buffer.from(sub, "ascii")]);
        const saltedSubUints = helper.toUints(helper.sha256Pad(saltedSub), maxSaltedSubLen);
        const saltedSubBlocks = helper.sha256BlockLen(saltedSub);

        // Signature
        const sigUints = helper.toUints(helper.fromBase64(signature), maxSigLen);
        const pubUints = helper.toUints(helper.fromBase64(pub), maxPubLen);

        return {
            jwtUints,
            jwtLen,
            jwtBlocks,
            payOff,
            payLen,
            issPos,
            audPos,
            iatPos,
            expPos,
            noncePos,
            subPos,
            saltedSubUints,
            saltedSubBlocks,
            sigUints,
            pubUints,
        };
    },
    process_output: function (pubsig: string[]) {
        const iss = helper.toASCII(helper.fromUints(pubsig.slice(0, 9)));
        const issLen = pubsig[9];
        const aud = helper.toASCII(helper.fromUints(pubsig.slice(10, 19)));
        const audLen = pubsig[19];
        const iat = helper.toASCII(helper.fromUints(pubsig.slice(20, 29)));
        const iatLen = pubsig[29];
        const exp = helper.toASCII(helper.fromUints(pubsig.slice(30, 39)));
        const expLen = pubsig[39];
        const nonce = helper.toASCII(helper.fromUints(pubsig.slice(40, 49)));
        const nonceLen = pubsig[49];
        const hSub = "0x" + helper.toHex(helper.fromUints(pubsig.slice(50, 52)).subarray(0, 32));
        const pub = helper.toBase64(helper.fromUints(pubsig.slice(52, 61)).subarray(0, 256));

        console.log("iss =", iss, ", issLen =", issLen);
        console.log("aud =", aud, ", audLen =", audLen);
        console.log("iat =", iat, ", iatLen =", iatLen);
        console.log("exp =", exp, ", expLen =", expLen);
        console.log("nonce =", nonce, ", nonceLen =", nonceLen);
        console.log("hSub =", hSub);
        console.log("pub =", pub);
    },
};

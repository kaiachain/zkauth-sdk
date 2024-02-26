import { assert } from "chai";
import { describe, it } from "mocha";

import { decodeJwtOnlyPayload, maskJWT, JwtProvider } from "../src";

import { testJwk, testJwt, confUrl, jwkUrl } from "./constants";

describe("jwt and jwtProvider", () => {
    describe("jwt", () => {
        it("decode jwt", () => {
            const jwt = decodeJwtOnlyPayload(JSON.stringify(testJwt));
            assert.equal(jwt.payload.sub, testJwt.sub);
            assert.equal(jwt.payload.aud, testJwt.aud);
            assert.equal(jwt.payload.nonce, testJwt.nonce);
        });
        it("mask jwt", () => {
            const jwt = decodeJwtOnlyPayload(JSON.stringify(testJwt));
            const whilteList = ["iat", "exp", "aud", "iss", "nonce"];
            const maskedJwt = maskJWT(jwt, whilteList);
            for (const key in jwt.payload) {
                if (!whilteList.includes(key)) {
                    assert.equal(maskedJwt.payload[key], "*".repeat(String(jwt.payload[key]).length));
                }
            }
        });
    });

    describe("jwtProvider", () => {
        it("check jwtProvider", () => {
            const jwt = decodeJwtOnlyPayload(JSON.stringify(testJwt));
            const jwtProvider = new JwtProvider(confUrl, jwkUrl, jwt, testJwk);
            assert.equal(jwtProvider.iss, testJwt.iss);
            assert.equal(jwtProvider.aud, testJwt.aud);
            assert.equal(jwtProvider.jwtWithNonce.payload.nonce, testJwt.nonce);
        });
    });
});

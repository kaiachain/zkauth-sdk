import { assert } from "chai";
import { describe, it } from "mocha";

import { getJWKs } from "../src";

describe("jwk", () => {
    it("getJWKs", async () => {
        const jwk = await getJWKs("google");
        assert.isNotNull(jwk);
        assert.isNotNull(jwk!.e);
        assert.isNotNull(jwk!.n);
        assert.isNotNull(jwk!.kid);
    });
});

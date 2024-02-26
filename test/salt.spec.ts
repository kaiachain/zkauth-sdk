import { assert } from "chai";
import { describe, it } from "mocha";

import { calcSalt } from "../src";

describe("salt", () => {
    const tcs = [
        {
            password: "1234",
            salt: "salt",
            iterations: 1e5,
            expected: "75ff064daa1fe105ae6e533281eb461ce4524c04a6e707aad1f0d342c5c72377",
        },
        {
            password: "5678",
            salt: "salt",
            iterations: 1e5,
            expected: "ab1feb2b1ea43d46867fb2f55c3eb889bdd1e86630091cd9627495e64d8849b6",
        },
        {
            password: "abcd",
            salt: "salt",
            iterations: 1e5,
            expected: "69bb7893ba6e54a382d0a622fd6caf66cc66653b2d55de6f41a7066213f1a4f3",
        },
    ];
    it("calc salt", () => {
        for (const tc of tcs) {
            calcSalt(tc.password, tc.salt, tc.iterations).then((salt) => {
                assert.equal(salt, tc.expected);
            });
        }
    });
});

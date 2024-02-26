export const typeDataRecovery = {
    types: {
        EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
        ],
        VerifyRecover: [
            { name: "sca", type: "address" },
            { name: "newOwner", type: "address" },
        ],
    },
    primaryType: "VerifyRecover",
    domain: {
        chainId: 0, // Need to fill in
        name: "", // Need to fill in
        version: "0.2",
        verifyingContract: "", // Need to fill in
    },
    message: {
        sca: "", // Need to fill in
        newOwner: "", // Need to fill in
    },
};

import { Buffer } from "buffer";

import _ from "lodash";

function bufferToUints(buffer: Buffer, chunkLen: number): string[] {
    const result: string[] = [];
    _.map(_.chunk(buffer, chunkLen), (slice: Buffer) => {
        result.push(BigInt("0x" + Buffer.from(slice).toString("hex")).toString());
    });
    return result;
}

function stretch(buf: Buffer, len: number): Buffer {
    if (buf.length < len) {
        return Buffer.concat([buf, Buffer.alloc(len - buf.length, 0)]);
    }
    return buf;
}

export function string2Uints(str: string | Buffer, maxLen: number): string[] {
    const numBits = 248;
    const numBytes = numBits / 8;

    let paddedStr = Buffer.from(str);

    // Pad the string to the max length
    paddedStr = stretch(paddedStr, maxLen);

    return bufferToUints(paddedStr, numBytes);
}

export function uints2String(arr: string[]): string {
    return arr.map((x) => Buffer.from(BigInt(x).toString(16), "hex").toString("ascii")).join("");
}

export function uints2Buffer(arr: string[]): Buffer {
    return Buffer.concat(arr.map((x) => Buffer.from(BigInt(x).toString(16), "hex")));
}

export function string2Qwords(str: string): string[] {
    const bi = str.startsWith("0x") ? BigInt(str) : BigInt("0x" + str);
    return _.times(32, (i: any) => ((bi >> BigInt(i * 64)) & (2n ** 64n - 1n)).toString(10));
}

export function qwords2String(arr: string[]): string {
    return Buffer.from(
        _.reverse(_.map(arr, (x: any) => BigInt(x).toString(16).padStart(16, "0"))).join(""),
        "hex"
    ).toString("base64");
}

export function string2UintsSha256Padded(str: string | Buffer, maxLen: number): string[] {
    const numBits = 248;
    const numBytes = numBits / 8;

    // Add the SHA256 padding
    let paddedStr = Buffer.from(str);
    const blockSize = 64; // Block size in bytes

    paddedStr = Buffer.concat([paddedStr, Buffer.from([0x80])]); // Append a single '1' bit

    const zeroBits = Buffer.alloc(
        (paddedStr.length + 8) % blockSize == 0 ? 0 : blockSize - ((paddedStr.length + 8) % blockSize)
    );
    paddedStr = Buffer.concat([paddedStr, zeroBits]); // Append the '0' bits

    const lengthBits = Buffer.alloc(8);
    lengthBits.writeBigInt64BE(BigInt(str.length * 8), 0);
    paddedStr = Buffer.concat([paddedStr, lengthBits]); // Append the length

    // Pad the string to the max length
    paddedStr = stretch(paddedStr, maxLen);

    return bufferToUints(paddedStr, numBytes);
}

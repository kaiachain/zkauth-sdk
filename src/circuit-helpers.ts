import { Buffer } from "buffer";

import base64url from "base64url";
import _ from "lodash";

const numBits = 248;
const numBytes = numBits / 8;

// fromXXX: convert from XXX type to buffer
// toXXX: convert from buffer to XXX type

export function fromASCII(str: string): Buffer {
    return Buffer.from(str, "ascii");
}

export function fromBase64(str: string): Buffer {
    return base64url.toBuffer(str);
}

export function fromHex(str: string): Buffer {
    return Buffer.from(str, "hex");
}

export function fromUints(arr: string[]): Buffer {
    return Buffer.concat(arr.map((x) => Buffer.from(BigInt(x).toString(16), "hex")));
}

export function fromQwords(arr: string[]): Buffer {
    return Buffer.from(_.reverse(_.map(arr, (x: any) => BigInt(x).toString(16).padStart(16, "0"))).join(""), "hex");
}

export function toASCII(buffer: Buffer): string {
    return buffer.toString("ascii");
}

export function toBase64(buffer: Buffer): string {
    return base64url(buffer);
}

export function toHex(buffer: Buffer): string {
    return buffer.toString("hex");
}

function bufferToUints(buffer: Buffer, chunkLen: number): string[] {
    const result: string[] = [];
    _.map(_.chunk(buffer, chunkLen), (slice: Buffer) => {
        result.push(BigInt("0x" + Buffer.from(slice).toString("hex")).toString());
    });
    return result;
}

export function toUints(buffer: Buffer, maxLen: number): string[] {
    const stretched = stretch(buffer, maxLen);
    const result: string[] = [];
    _.map(_.chunk(stretched, numBytes), (slice: Buffer) => {
        result.push(BigInt("0x" + Buffer.from(slice).toString("hex")).toString());
    });
    return result;
}

export function toQwords(buf: string | Buffer): string[] {
    const bi = BigInt("0x" + Buffer.from(buf).toString("hex"));
    return _.times(32, (i: any) => ((bi >> BigInt(i * 64)) & (2n ** 64n - 1n)).toString(10));
}

// Misc helpers

// stretch: pad the buffer to the given length
function stretch(buf: Buffer, len: number): Buffer {
    if (buf.length < len) {
        return Buffer.concat([buf, Buffer.alloc(len - buf.length, 0)]);
    }
    return buf;
}

// sha256Pad: add SHA256 padding
// [ string ][ 80 ][ 00..00 ][ len ]
export function sha256Pad(str: string | Buffer): Buffer {
    let padded = Buffer.from(str);
    const blockSize = 64; // Block size in bytes

    padded = Buffer.concat([padded, Buffer.from([0x80])]); // Append a single '1' bit

    const zeroBits = Buffer.alloc(
        (padded.length + 8) % blockSize == 0 ? 0 : blockSize - ((padded.length + 8) % blockSize)
    );
    padded = Buffer.concat([padded, zeroBits]); // Append the '0' bits

    const lengthBits = Buffer.alloc(8);
    lengthBits.writeBigInt64BE(BigInt(str.length * 8), 0);
    padded = Buffer.concat([padded, lengthBits]); // Append the length

    return padded;
}

// sha256BlockLen: calculate the number of SHA256b blocks for given buffer
export function sha256BlockLen(buf: string | Buffer): number {
    // 1 is for 0x80, 8 is for length bits (64 bits)
    return Math.ceil((buf.length + 1 + 8) / 64);
}

export function string2Uints(str: string | Buffer, maxLen: number): string[] {
    const numBits = 248;
    const numBytes = numBits / 8;

    let paddedStr = Buffer.from(str);

    // Pad the string to the max length
    paddedStr = stretch(paddedStr, maxLen);

    return bufferToUints(paddedStr, numBytes);
}

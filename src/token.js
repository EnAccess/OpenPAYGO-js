'use strict'

const bigintConversion = require('bigint-conversion')
const siphash24 = require('../lib/siphash')
const Buffer = require('buffer/').Buffer

class OpenPAYGOTokenShared {
    // token configuration
    static MAX_BASE = 999
    static MAX_ACTIVATION_VALUE = 995
    static PAYG_DISABLE_VALUE = 998
    static COUNTER_SYNC_VALUE = 999
    static TOKEN_VALUE_OFFSET = 1000

    constructor() {}

    static getTokenBase(code) {
        return code % this.TOKEN_VALUE_OFFSET
    }

    static putBaseInToken(token, tokenBase) {
        if (tokenBase > this.MAX_BASE) {
            throw new Error('Invalid token base value')
        }
        return token - this.getTokenBase(token) + tokenBase
    }

    static genNextToken(prev_token, key) {
        const conformedToken = Buffer.alloc(4) // Allocate buffer of 4 bytes
        conformedToken.writeUInt32BE(prev_token, 0) // Write the integer value into buffer as big-endian

        // Duplicate the buffer by concatenating it with itself
        const duplicatedToken = Buffer.concat([conformedToken, conformedToken])
        let hash = this.genHash({
            key: key,
            msg: duplicatedToken,
            asByte: true,
        })

        return this.convertHash2Token(hash)
    }

    static convertHash2Token(hash) {
        // convert hash from hex

        const hashBuffer = bigintConversion.hexToBuf(hash)

        const dView = new DataView(
            hashBuffer.buffer,
            hashBuffer.byteOffset,
            hashBuffer.byteLength
        )

        // take first 4 btypes
        const hash_msb = dView.getUint32(0) // as big endian
        // take last 4 bytes
        const hash_lsb = dView.getUint32(4) // as big endian

        const hashUnit = (hash_msb ^ hash_lsb) >>> 0
        const token = this.convertTo29_5_bits(hashUnit)
        return token
    }

    static convertTo29_5_bits(hash_uint) {
        // port from original lib
        const mask = ((1 << (32 - 2 + 1)) - 1) << 2
        let temp = (hash_uint & mask) >>> 2
        if (temp > 999999999) temp = temp - 73741825
        return temp
    }

    static convertFrom4digitToken(token) {
        // 4 - digit token value
        let bitArray = []
        for (let digit of token.toString()) {
            digit = Number(digit) - 1
            const tempArr = bitArrayFromInt(digit, 2)
            bitArray = bitArray.concat(tempArr)
        }
        return bitArrayToInt(bitArray)
    }

    static genStartingCode(key) {
        const hash = this.genHash({ key: key, msg: key })
        return this.convertHash2Token(hash)
    }

    static convertToNdigitToken(token, digit = 4) {
        // token should be a number data type
        let restrictedDigitToken = ''
        let bitArray = bitArrayFromInt(token, digit * 2)

        for (let i = 0; i < digit; i++) {
            restrictedDigitToken += bitArrayToInt(
                bitArray.slice(i * 2, i * 2 + 2)
            ).toString()
        }
        return Number(restrictedDigitToken)
    }

    static genHash({ key, msg }) {
        let buf
        if (typeof key === 'object') {
            buf = key
        } else {
            buf = bigintConversion.hexToBuf(key)
        }
        const arrayBuffer = buf.buffer.slice(
            buf.byteOffset,
            buf.byteOffset + buf.byteLength
        )
        const uint32Array = new Uint32Array(arrayBuffer)
        const hash = siphash24.hash_hex(uint32Array, msg)

        return hash
    }
}

function bitArrayFromInt(number, bitLength) {
    let bitArray = []
    for (let i = 0; i < bitLength; i++) {
        bitArray.push(number & (1 << (bitLength - 1 - i)))
    }
    return bitArray
}

function bitArrayToInt(bit_array) {
    let num = 0
    for (let bit of bit_array) {
        num = (num << 1) | bit
    }
    return num
}

module.exports = {
    OpenPAYGOTokenShared: OpenPAYGOTokenShared,
}

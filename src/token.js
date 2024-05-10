'use strict'

const TokenTypes = require('./constants')
const siphash24 = require('siphash24')
const Buffer = require('buffer/').Buffer

class OpenPAYGOTokenShared {
    // token configuration
    MAX_BASE = 999
    MAX_ACTIVATION_VALUE = 995
    PAYG_DISABLE_VALUE = 998
    COUNTER_SYNC_VALUE = 999
    TOKEN_VALUE_OFFSET = 1000

    constructor() {}

    static getTokenBase(code) {
        return code % this.TOKEN_VALUE_OFFSET
    }

    static putBaseInToken(token, tokenBase) {
        if (tokenBase > this.prototype.MAX_BASE) {
            throw new Error('Invalid token base value')
        }
        return token - this.getTokenBase(token) + tokenBase
    }

    static genNextToken(prev_code, key) {
        // TODO
    }

    static convertHash2Token(hashBuffer) {
        const hash_msb = this.bytesToUint32(hashBuffer, 0)
        const hash_lsb = this.bytesToUint32(hashBuffer, 4)
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
        
    }

    static genStartingCode(key) {
        const hash = this.genHash({ key: key, msg: key })
        return this.convertHash2Token(hash)
    }

    static convertTo4dToken(src) {}

    convert4dTokenFromStr(src) {
        // TODO
    }

    static genHash({ key, msg }) {
        return siphash24(Buffer.from(msg), Buffer.from(key))
    }

    static bytesToUint32(bytes, offset) {
        return (
            (bytes[offset] << 24) |
            (bytes[offset + 1] << 16) |
            (bytes[offset + 2] << 8) |
            bytes[offset + 3]
        )
    }
}

module.exports = {
    OpenPAYGOTokenShared: OpenPAYGOTokenShared,
}

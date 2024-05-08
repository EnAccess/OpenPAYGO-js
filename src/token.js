const TokenTypes = require('./constants');
const siphash = require('../lib/siphash');


class OpenPAYGOTokenShared {    

    // token configuration
    MAX_BASE = 999
    MAX_ACTIVATION_VALUE = 995
    PAYG_DISABLE_VALUE = 998
    COUNTER_SYNC_VALUE = 999
    TOKEN_VALUE_OFFSET = 1000

    constructor(){

    }

    getTokenBase(code) {
        return code % this.TOKEN_VALUE_OFFSET
    }

    genNextToken({ prev_code, key}) {
        // TODO
    }

    static convertHash2Token(hashObj) {
        const hash_msb = hashObj.h;
        const hash_lsb = hashObj.l;
        const hashUnit = ((hash_msb ^ hash_lsb) >>> 0)
        const token = this.convertTo29_5_bits(hashUnit)
        return token
    }

    static convertTo29_5_bits(hash_uint){
        // port from original lib 
        const mask = ((1 << (32 - 2 + 1)) - 1) << 2
        let temp = (hash_uint & mask) >>> 2
        if (temp > 999999999)
            temp = temp - 73741825
        return temp
    }

    static genStartingCode(key) {
        const hash = this.genHash({ key: key, message: key})
        return convertHash2Token(hash)
    }

    convertTo4dToken(src) {
        // TODO
    }


    convert4dTokenFromStr(src) {
        // TODO
    }

    static genHash({ key, msg }) {
        key = siphash.string16_to_key(key)
        return siphash.hash(key, msg)
    }


    static loadSecretKeyFromHex(secretKeyHex) {
        
    }
}

module.exports = { 
    genHash: OpenPAYGOTokenShared.genHash,
    convertHash2Token: OpenPAYGOTokenShared.convertHash2Token,
    convertTo29_5_bits: OpenPAYGOTokenShared.convertTo29_5_bits
}

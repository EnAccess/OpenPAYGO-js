"use strict"

const bigintConversion = require("bigint-conversion")
const siphash24 = require("../lib/siphash")
const Buffer = require("buffer/").Buffer

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
      throw new Error("Invalid token base value")
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
    })

    return this.convertHash2Token(hash)
  }

  static convertHash2Token(hash) {
    // convert hash from hex

    const hashBuffer = bigintConversion.hexToBuf(hash, true)

    const dView = new DataView(hashBuffer)

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
    return convertFrom4digitToken(token)
  }

  static genStartingCode(key) {
    const hash = this.genHash({ key: key, msg: key })
    return this.convertHash2Token(hash)
  }

  static convertToNdigitToken(token, digit = 15) {
    return convertToNdigitToken(token, digit)
  }

  static genHash({ key, msg }) {
    let buf
    if (typeof key === "object") {
      buf = key.buffer
    } else {
      buf = bigintConversion.hexToBuf(key, true)
    }

    const uint32View = new Uint32Array(buf)

    const arrayBuffer = buf.slice(0, uint32View.byteLength)
    const uint32Array = new Uint32Array(arrayBuffer)
    const hash = siphash24.hash_hex(uint32Array, msg)

    return hash
  }
}

class OpenPAYGOTokenSharedExtended {
  static MAX_BASE_EXTENDED = 999999
  static MAX_ACTIVATION_VALUE_EXTENDED = 999999n
  static TOKEN_VALUE_OFFSET_EXTENDED = 1000000n

  constructor() {}

  static getTokenBase(code) {
    return BigInt(code) % this.TOKEN_VALUE_OFFSET_EXTENDED
  }

  static putBaseInToken(token, tokenBase) {
    token = BigInt(token)
    tokenBase = BigInt(tokenBase)
    if (tokenBase > this.MAX_BASE_EXTENDED) {
      throw new Error("Invalid token base value")
    }
    return token - this.getTokenBase(token) + tokenBase
  }

  static genNextToken(prev_token, key) {
    prev_token = BigInt(prev_token)
    const conformedToken = Buffer.alloc(8) // Allocate buffer of 8 bytes
    conformedToken.writeBigUInt64BE(prev_token, 0) // Write the integer value into buffer as big-endian

    let hash = this.genHash({
      key: key,
      msg: conformedToken,
    })

    return this.convertHash2Token(hash)
  }

  static convertHash2Token(hash) {
    const hashUint = bigintConversion.hexToBigint(hash)
    const token = this.convertTo_40_bits(hashUint)
    return token
  }

  static convertTo_40_bits(hash_uint) {
    // port from original lib
    // const mask = ((1 << (64 - 24 + 1)) - 1) << 24
    const mask = 36893488147402326016n
    let temp = (hash_uint & mask) >> 24n
    if (temp > 999999999999n) temp = temp - 99511627777n
    return temp
  }

  static convertFrom4digitToken(token) {
    return convertFrom4digitToken(token)
  }

  static convertToNdigitToken(token, digit = 20) {
    return convertToNdigitToken(token, digit)
  }

  static genHash({ key, msg }) {
    let buf
    if (typeof key === "object") {
      buf = key.buffer
    } else {
      buf = bigintConversion.hexToBuf(key, true)
    }
    const uint32View = new Uint32Array(buf)

    const arrayBuffer = buf.slice(0, uint32View.byteLength)
    const uint32Array = new Uint32Array(arrayBuffer)
    const hash = siphash24.hash_hex(uint32Array, msg)

    return hash
  }
}

function bitArrayFromInt(number, bitLength) {
  let bitArray = []
  for (let i = 0; i < bitLength; i++) {
    bitArray.push((number & (1 << (bitLength - 1 - i))) !== 0)
  }
  return bitArray
}

function bitArrayFromBigInt(number, bitLength) {
  let bitArray = []
  for (let i = 0; i < bitLength; i++) {
    bitArray.push((number & (1n << BigInt(bitLength - 1 - i))) !== 0n)
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

function convertFrom4digitToken(token) {
  // 4 - digit token value
  let bitArray = []
  for (let digit of token.toString()) {
    digit = Number(digit) - 1
    const tempArr = bitArrayFromInt(digit, 2)
    bitArray = bitArray.concat(tempArr)
  }
  return bitArrayToInt(bitArray)
}

function convertToNdigitToken(token, digit = 4) {
  // token should be a number data type
  let restrictedDigitToken = ""
  let bitArray
  if (typeof token === "bigint") {
    bitArray = bitArrayFromBigInt(token, digit * 2)
  } else {
    bitArray = bitArrayFromInt(token, digit * 2)
  }

  for (let i = 0; i < digit; i++) {
    restrictedDigitToken += (
      bitArrayToInt(bitArray.slice(i * 2, i * 2 + 2)) + 1
    ).toString()
  }

  return restrictedDigitToken
}

module.exports = {
  OpenPAYGOTokenShared: OpenPAYGOTokenShared,
  OpenPAYGOTokenSharedExtended: OpenPAYGOTokenSharedExtended,
}

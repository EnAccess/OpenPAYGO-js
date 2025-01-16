const siphash = require("../lib/siphash")
const Buffer = require("buffer/").Buffer

class AuthMethod {
  static SIMPLE_AUTH = "sa"
  static TIMESTAMP_AUTH = "ta"
  static COUNTER_AUTH = "ca"
  static DATA_AUTH = "da"
  static RECURSIVE_DATA_AUTH = "ra"
}

class OpenPAYGOMetricsShared {
    
  static CONDENSED_KEY_NAMES = {
    // Request
    serial_number: "sn",
    timestamp: "ts",
    auth: "a",
    request_count: "rc",
    data_collection_timestamp: "dtc",
    data_format_id: "df",
    data_format: "dfo",
    data: "d",
    historical_data: "hd",
    accessories: "acc",
    // Response
    token_list: "tkl",
    active_until_timestamp: "auts",
    active_seconds_left: "asl",
    settings: "st",
    extra_data: "ed",
    // Data
    token_count: "tc",
    active_until_timestamp_requested: "autsr",
    active_seconds_left_requested: "aslr",
  }

  static convertObjectKeysToCondensed(simpleObject) {
    return this.convertObjectKeys(simpleObject, this.CONDENSED_KEY_NAMES)
  }

  static convertObjectKeysToSimple(condensedObject) {
    const revertKeys = Object.fromEntries(
      Object.entries(this.CONDENSED_KEY_NAMES).map(([key, value]) => [
        value,
        key,
      ])
    )
    return this.convertObjectKeys(condensedObject, revertKeys)
  }

  static convertObjectKeys(originObject, keyMap) {
    const condensedObject = {}
    for (const key in originObject) {
      condensedObject[keyMap[key] || key] = originObject[key]
    }
    return condensedObject
  }

  static removeTrailingEmptyElements(listWithEmpty) {
    while (
      listWithEmpty.length > 0 &&
      listWithEmpty[listWithEmpty.length - 1] == null
    ) {
      listWithEmpty.pop()
    }
    return listWithEmpty
  }

  static convertToMetricsJson(data) {
    return JSON.stringify(data)
  }

  static generateResponseSignatureFromData(
    data,
    secretKey,
    serialNumber,
    timestamp = null,
    requestCount = null
  ) {
    let payload = serialNumber
    if (timestamp) payload += String(timestamp)
    if (requestCount) payload += String(requestCount)
    if (data.active_until_timestamp)
      payload += String(data.active_until_timestamp)
    if (data.active_seconds_left) payload += String(data.active_seconds_left)
    if (data.token_list) payload += this.convertToMetricsJson(data.token_list)
    if (data.settings) payload += this.convertToMetricsJson(data.settings)
    if (data.extra_data) payload += this.convertToMetricsJson(data.extra_data)

    return (
      AuthMethod.DATA_AUTH +
      this.generateHashString({ msg: payload, key: secretKey })
    )
  }

  static generateRequestSignatureFromData(data, authMethod, secretKey) {
    let signature

    switch (authMethod) {
      case AuthMethod.SIMPLE_AUTH:
        signature = this.generateHashString({
          msg: data.serial_number,
          key: secretKey,
        })
        break
      case AuthMethod.TIMESTAMP_AUTH:
        if (!data.timestamp)
          throw new Error("Timestamp is required for Timestamp Auth")
        signature = this.generateHashString({
          msg: data.serial_number + String(data.timestamp),
          key: secretKey,
        })
        break
      case AuthMethod.COUNTER_AUTH:
        if (!data.request_count)
          throw new Error("Request Count is required for Counter Auth")
        signature = this.generateHashString({
          msg: data.serial_number + String(data.request_count),
          key: secretKey,
        })
        break
      case AuthMethod.DATA_AUTH:
        let payload = data.serial_number
        if (data.timestamp) payload += String(data.timestamp)
        if (data.request_count) payload += String(data.request_count)
        if (data.data) payload += this.convertToMetricsJson(data.data)
        if (data.historical_data)
          payload += this.convertToMetricsJson(data.historical_data)
        signature = this.generateHashString({ msg: payload, key: secretKey })
        break
      case AuthMethod.RECURSIVE_DATA_AUTH:
        let recursivePayload = this.generateHashString({
          msg: data.serial_number,
          key: secretKey,
        })
        if (data.timestamp)
          recursivePayload = this.generateHashString({
            msg: recursivePayload + String(data.timestamp),
            key: secretKey,
          })
        if (data.request_count)
          recursivePayload = this.generateHashString({
            msg: recursivePayload + String(data.request_count),
            key: secretKey,
          })
        recursivePayload = this.generateHashString({
          msg: recursivePayload + this.convertToMetricsJson(data.data || []),
          key: secretKey,
        })
        for (const timeStepData of data.historical_data || []) {
          recursivePayload = this.generateHashString({
            msg: recursivePayload + this.convertToMetricsJson(timeStepData),
            key: secretKey,
          })
        }
        signature = recursivePayload
        break
      default:
        throw new Error("Invalid Authentication Method")
    }

    return authMethod + signature
  }

  static generateHashString({ key, msg }) {
    let buf
    if (typeof key === "object") {
      buf = key.buffer
    } else {
      buf = bigintConversion.hexToBuf(key, true)
    }
    const uint32View = new Uint32Array(buf)

    const arrayBuffer = buf.slice(0, uint32View.byteLength)
    const uint32Array = new Uint32Array(arrayBuffer)
    const hash = siphash.hash_hex(uint32Array, msg)

    return hash
  }

  static loadSecretKeyFromHex(secretKey) {
    if (!/^[0-9a-fA-F]{32}$/.test(secretKey)) {
      throw new Error(
        "The secret key provided is not correctly formatted; it should be 32 hexadecimal characters."
      )
    }
    return Buffer.from(secretKey, "hex")
  }
}

module.exports = { AuthMethod, OpenPAYGOMetricsShared }

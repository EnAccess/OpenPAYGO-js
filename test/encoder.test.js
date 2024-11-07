const sample = require("./sample_tokens.json")
const Encoder = require("../src/encoder").OpenPAYGOTokenEncoder
const shared = require("../src/token").OpenPAYGOTokenShared

function convertTokenTypeToNumber(token_str) {
  if (token_str === "ADD_TIME") {
    return 1
  } else if (token_str === "SET_TIME") {
    return 2
  } else if (token_str === "DISABLE_PAYG") {
    return 3
  } else if (token_str === "COUNTER_SYNC") {
    return 4
  } else if (token_str === "INVALID") {
    return 10
  } else if (token_str === "ALREADY_USED") {
    return 11
  }
}

describe("OpenPAYGOTokenEncoder test", () => {
  test("generateToken", () => {
    const encoder = new Encoder()
    sample.forEach((s) => {
      const data = s
      try {
        const { finalToken } = encoder.generateToken({
          tokenType: convertTokenTypeToNumber(data.token_type),
          secretKeyHex: data.key,
          count: data.count,
          startingCode: data.starting_code,
          restrictDigitSet: data.restricted_digit_set,
          value: data.value_raw,
          extendToken: data.extended_token,
        })
        expect(finalToken).toBe(data.token)
      } catch (err) {
        if (data.value_raw === null || data.value_raw === undefined) {
          console.log(`value for token (${data.token}) is null`)
          return
        }
        expect(data.extended_token).toBe(false)
        expect(data.value_raw > shared.MAX_ACTIVATION_VALUE).toBe(true)
      }
    })
  })
})

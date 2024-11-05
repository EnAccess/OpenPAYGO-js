const sample = require("./sample_tokens.json")
const Encoder = require("../src/encoder").OpenPAYGOTokenEncoder
const shared = require("../src/token").OpenPAYGOTokenShared

describe("OpenPAYGOTokenEncoder test", () => {
  test("generateToken", () => {
    const encoder = new Encoder()
    sample.forEach((s) => {
      const data = s
      try {
        const { finalToken } = encoder.generateToken({
          tokenType: data.token_type,
          secretKeyHex: data.key,
          count: data.token_count,
          startingCode: data.starting_code,
          restrictDigitSet: data.restricted_digit_set,
          value: data.value_raw,
          extendToken: data.extended_token,
        })
        expect(finalToken).toBe(data.token)
      } catch (err) {
        expect(data.extended_token).toBe(false)
        expect(data.value_raw > shared.MAX_ACTIVATION_VALUE).toBe(true)
      }
    })
  })
})

const sample = require("./sample_tokens.json")
const Encoder = require("../src/encoder").OpenPAYGOTokenEncoder
const shared = require("../src/token").OpenPAYGOTokenShared
const token = require('openpaygo')
describe("OpenPAYGOTokenEncoder test", () => {
  test("generateToken", () => {
    const encoder = new Encoder()

    sample.forEach((s) => {
      const data = s
      const useExtended = data.value_raw > shared.MAX_ACTIVATION_VALUE
      const { finalToken } = encoder.generateToken({
        tokenType: data.token_type,
        secretKeyHex: data.key,
        count: data.token_count,
        startingCode: data.starting_code,
        restrictDigitSet: data.restricted_digit_set,
        value: data.value_raw,
        extendToken: useExtended,
      })

      expect(finalToken).toBe(data.token)
    })
  })
})

const sample = require("./sample_tokens.json")
const Encoder = require("../src/encoder").OpenPAYGOTokenEncoder

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
          extendToken: false,
        })

        expect(finalToken).toBe(data.token)
      } catch (err) {
        if (!err.message.includes("The value provided is too high.")) {
          throw err
        }
      }
    })
  })
})

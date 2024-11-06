const sample = require("./sample_tokens.json")
const TokenTypes = require("../src/constants").TokenTypes
const Decorder = require("../src/decoder").OpenPAYGOTokenDecoder

describe("OpenPAYGOTokenDecoder test", () => {
  test("decodeToken", () => {
    const data = sample[0]

    const { value, tokenType, count, updatedCounts } =
      new Decorder().decodeToken({
        token: data.token,
        secretKeyHex: data.key,
        count: data.count,
        usedCounts: [],
        startingCode: data.starting_code,
        restrictedDigitSet: data.restricted_digit_set,
      })

    expect(value).toBeDefined()
    expect(count).toBeUndefined()
    expect(updatedCounts).toBeDefined()
    expect(tokenType).toEqual(TokenTypes.ADD_TIME)
  })
})

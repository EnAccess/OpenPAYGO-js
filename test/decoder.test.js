const sample = require("./sample_tokens.json")
const TokenTypes = require("../src/token").TokenTypes
const Encoder = require("../src/token").OpenPAYGOTokenEncoder
const Decoder = require("../src/token").OpenPAYGOTokenDecoder

const KEY = "c5b18e72fa9d4603e82d1c5a3b76e9f4"

describe("OpenPAYGOTokenDecoder test", () => {
  // Preserve original sample-data test (assertion corrected for Bug #5 fix)
  test("decodeToken from sample data", () => {
    const data = sample[0]

    const { value, tokenType, count, updatedCounts } =
      new Decoder().decodeToken({
        token: data.token,
        secretKeyHex: data.key,
        count: data.count,
        usedCounts: [],
        startingCode: data.starting_code,
        restrictedDigitSet: data.restricted_digit_set,
      })

    expect(value).toBeDefined()
    expect(count).toBeDefined() // Bug #5 fix: count is now returned correctly
    expect(updatedCounts).toBeDefined()
    expect(tokenType).toEqual(TokenTypes.ADD_TIME)
  })

  test("decodes ADD_TIME token with correct value and count", () => {
    const encoder = new Encoder()
    const decoder = new Decoder()
    const gen = encoder.generateToken({
      secretKeyHex: KEY,
      count: 1,
      value: 30,
      tokenType: TokenTypes.ADD_TIME,
    })
    const d = decoder.decodeToken({
      token: String(gen.finalToken),
      secretKeyHex: KEY,
      count: 1,
      usedCounts: [],
    })
    expect(d.value).toBe(30)
    expect(d.tokenType).toBe(TokenTypes.ADD_TIME)
    expect(d.count).toBe(gen.newCount) // Bug #5: was undefined
    expect(d.updatedCounts).toEqual([gen.newCount])
  })

  test("rejects replayed ADD_TIME token (ALREADY_USED)", () => {
    const encoder = new Encoder()
    const decoder = new Decoder()
    const gen = encoder.generateToken({
      secretKeyHex: KEY,
      count: 1,
      value: 30,
      tokenType: TokenTypes.ADD_TIME,
    })

    // First decode — should succeed
    const d1 = decoder.decodeToken({
      token: String(gen.finalToken),
      secretKeyHex: KEY,
      count: 1,
      usedCounts: [],
    })
    expect(d1.tokenType).toBe(TokenTypes.ADD_TIME)

    // Second decode (replay) — should return ALREADY_USED
    const d2 = decoder.decodeToken({
      token: String(gen.finalToken),
      secretKeyHex: KEY,
      count: d1.count,
      usedCounts: d1.updatedCounts,
    })
    // Bugs #1, #2, #3: previously crashed or accepted the replay
    expect(d2.tokenType).toBe(TokenTypes.ALREADY_USED)
    expect(d2.value).toBeUndefined()
  })

  test("decodes DISABLE_PAYG token with correct tokenType", () => {
    const encoder = new Encoder()
    const decoder = new Decoder()
    const gen = encoder.generateToken({
      secretKeyHex: KEY,
      count: 1,
      tokenType: TokenTypes.DISABLE_PAYG,
    })
    const d = decoder.decodeToken({
      token: String(gen.finalToken),
      secretKeyHex: KEY,
      count: 1,
      usedCounts: [],
    })
    expect(d.tokenType).toBe(TokenTypes.DISABLE_PAYG) // Bug #4: was undefined
    expect(d.value).toBe(998) // PAYG_DISABLE_VALUE
  })

  test("decodes SET_TIME token correctly", () => {
    const encoder = new Encoder()
    const decoder = new Decoder()
    const gen = encoder.generateToken({
      secretKeyHex: KEY,
      count: 1,
      value: 60,
      tokenType: TokenTypes.SET_TIME,
    })
    const d = decoder.decodeToken({
      token: String(gen.finalToken),
      secretKeyHex: KEY,
      count: 1,
      usedCounts: [],
    })
    expect(d.tokenType).toBe(TokenTypes.SET_TIME)
    expect(d.value).toBe(60)
    expect(d.count).toBeDefined()
  })

  test("decodes COUNTER_SYNC token correctly", () => {
    const encoder = new Encoder()
    const decoder = new Decoder()
    const gen = encoder.generateToken({
      secretKeyHex: KEY,
      count: 1,
      tokenType: TokenTypes.COUNTER_SYNC,
    })
    const d = decoder.decodeToken({
      token: String(gen.finalToken),
      secretKeyHex: KEY,
      count: 1,
      usedCounts: [],
    })
    expect(d.tokenType).toBe(TokenTypes.COUNTER_SYNC)
    expect(d.value).toBe(999) // COUNTER_SYNC_VALUE
  })

  test("rejects invalid token", () => {
    const decoder = new Decoder()
    const d = decoder.decodeToken({
      token: "000000000",
      secretKeyHex: KEY,
      count: 1,
      usedCounts: [],
    })
    expect(d.tokenType).toBe(TokenTypes.INVALID)
    expect(d.value).toBeUndefined()
  })

  test("updatedCounts accumulates across multiple tokens", () => {
    const encoder = new Encoder()
    const decoder = new Decoder()

    const g1 = encoder.generateToken({
      secretKeyHex: KEY,
      count: 1,
      value: 10,
      tokenType: TokenTypes.ADD_TIME,
    })
    const d1 = decoder.decodeToken({
      token: String(g1.finalToken),
      secretKeyHex: KEY,
      count: 1,
      usedCounts: [],
    })

    const g2 = encoder.generateToken({
      secretKeyHex: KEY,
      count: g1.newCount,
      value: 20,
      tokenType: TokenTypes.ADD_TIME,
    })
    const d2 = decoder.decodeToken({
      token: String(g2.finalToken),
      secretKeyHex: KEY,
      count: d1.count,
      usedCounts: d1.updatedCounts,
    })

    // Bug #3: updatedCounts was undefined after second decode
    expect(d2.updatedCounts).toBeDefined()
    expect(Array.isArray(d2.updatedCounts)).toBe(true)
    expect(d2.updatedCounts.length).toBeGreaterThan(0)
  })
})

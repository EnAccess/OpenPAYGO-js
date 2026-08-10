const sample = require("./sample_tokens.json")
const TokenTypes = require("../src/token").TokenTypes
const Encoder = require("../src/token").OpenPAYGOTokenEncoder
const Decoder = require("../src/token").OpenPAYGOTokenDecoder

describe("OpenPAYGOTokenDecoder test", () => {
  // Decode token from sample data
  test("decodeToken", () => {
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
    expect(count).toBeDefined()
    expect(updatedCounts).toBeDefined()
    expect(tokenType).toEqual(TokenTypes.ADD_TIME)
  })

  test("decodes ADD_TIME token", () => {
    const data = sample.find(
      (s) =>
        s.token_type === "ADD_TIME" &&
        !s.restricted_digit_set &&
        !s.extended_token
    )
    const decoder = new Decoder()
    const d = decoder.decodeToken({
      token: data.token,
      secretKeyHex: data.key,
      count: data.count,
      usedCounts: [],
      startingCode: data.starting_code,
    })
    expect(d.value).toBe(data.value_raw)
    expect(d.tokenType).toBe(TokenTypes.ADD_TIME)
    expect(d.count).toBe(data.new_count)
    expect(d.updatedCounts).toEqual([data.new_count])
  })

  test("rejects replayed ADD_TIME token", () => {
    const data = sample.find(
      (s) =>
        s.token_type === "ADD_TIME" &&
        !s.restricted_digit_set &&
        !s.extended_token
    )
    const decoder = new Decoder()

    // First decode — should succeed
    const d1 = decoder.decodeToken({
      token: data.token,
      secretKeyHex: data.key,
      count: data.count,
      usedCounts: [],
      startingCode: data.starting_code,
    })
    expect(d1.tokenType).toBe(TokenTypes.ADD_TIME)

    // Second decode (replay) — should return ALREADY_USED
    const d2 = decoder.decodeToken({
      token: data.token,
      secretKeyHex: data.key,
      count: d1.count,
      usedCounts: d1.updatedCounts,
      startingCode: data.starting_code,
    })
    expect(d2.tokenType).toBe(TokenTypes.ALREADY_USED)
    expect(d2.value).toBeUndefined()
  })

  test("decodes DISABLE_PAYG token with correct tokenType", () => {
    const data = sample.find(
      (s) =>
        s.token_type === "DISABLE_PAYG" &&
        !s.restricted_digit_set &&
        !s.extended_token
    )
    const decoder = new Decoder()
    const d = decoder.decodeToken({
      token: data.token,
      secretKeyHex: data.key,
      count: data.count,
      usedCounts: [],
      startingCode: data.starting_code,
    })
    expect(d.tokenType).toBe(TokenTypes.DISABLE_PAYG)
    expect(d.value).toBe(998)
  })

  test("decodes SET_TIME token correctly", () => {
    const data = sample.find(
      (s) =>
        s.token_type === "SET_TIME" &&
        !s.restricted_digit_set &&
        !s.extended_token
    )
    const decoder = new Decoder()
    const d = decoder.decodeToken({
      token: data.token,
      secretKeyHex: data.key,
      count: data.count,
      usedCounts: [],
      startingCode: data.starting_code,
    })
    expect(d.tokenType).toBe(TokenTypes.SET_TIME)
    expect(d.value).toBe(data.value_raw)
    expect(d.count).toBe(data.new_count)
  })

  test("decodes COUNTER_SYNC token correctly", () => {
    const data = sample.find(
      (s) =>
        s.token_type === "COUNTER_SYNC" &&
        !s.restricted_digit_set &&
        !s.extended_token
    )
    const decoder = new Decoder()
    const d = decoder.decodeToken({
      token: data.token,
      secretKeyHex: data.key,
      count: data.count,
      usedCounts: [],
      startingCode: data.starting_code,
    })
    expect(d.tokenType).toBe(TokenTypes.COUNTER_SYNC)
    expect(d.value).toBe(999)
  })

  test("rejects invalid token", () => {
    const data = sample[0]
    const decoder = new Decoder()
    const d = decoder.decodeToken({
      token: "000000000",
      secretKeyHex: data.key,
      count: data.count,
      usedCounts: [],
      startingCode: data.starting_code,
    })
    expect(d.tokenType).toBe(TokenTypes.INVALID)
    expect(d.value).toBeUndefined()
  })

  test("updatedCounts accumulates across multiple tokens", () => {
    const sampleData = sample[0]
    const encoder = new Encoder()
    const decoder = new Decoder()

    const g1 = encoder.generateToken({
      secretKeyHex: sampleData.key,
      startingCode: sampleData.starting_code,
      count: 1,
      value: 10,
      tokenType: TokenTypes.ADD_TIME,
    })
    const d1 = decoder.decodeToken({
      token: String(g1.finalToken),
      secretKeyHex: sampleData.key,
      startingCode: sampleData.starting_code,
      count: 1,
      usedCounts: [],
    })

    const g2 = encoder.generateToken({
      secretKeyHex: sampleData.key,
      startingCode: sampleData.starting_code,
      count: g1.newCount,
      value: 20,
      tokenType: TokenTypes.ADD_TIME,
    })
    const d2 = decoder.decodeToken({
      token: String(g2.finalToken),
      secretKeyHex: sampleData.key,
      startingCode: sampleData.starting_code,
      count: d1.count,
      usedCounts: d1.updatedCounts,
    })

    expect(d2.updatedCounts).toBeDefined()
    expect(Array.isArray(d2.updatedCounts)).toBe(true)
    expect(d2.updatedCounts.length).toBeGreaterThan(0)
  })
})

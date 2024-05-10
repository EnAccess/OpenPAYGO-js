const sample = require('./sample_tokens.json')
const Encoder = require('../src/encoder').OpenPAYGOTokenEncoder

describe('OpenPAYGOTokenEncoder test', () => {
    test('generateToken', () => {
        const data = sample[0]
        const encoder = new Encoder()

        const { finalToken } = encoder.generateToken({
            tokenType: data.token_type,
            secretKeyHex: data.key,
            count: data.token_count,
            startingCode: data.starting_code,
            restrictDigitSet: data.restricted_digit_set,
            value: data.value_raw,
        })

        expect(finalToken).toBe(data.token)
    })
})

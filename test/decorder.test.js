const sample = require('./sample_tokens.json')
const TokenTypes = require('../src/constants').TokenTypes
const Decorder = require('../src/decoder').OpenPAYGOTokenDecoder

describe('OpenPAYGOTokenDecoder test', () => {
    test('decodeToken', () => {
        const data = sample[0]

        const { value, tokenType, count, updatedCounts } = Decorder.decodeToken(
            {
                token: data.token,
                secretKeyHex: data.key,
                count: data.token_count,
                usedCounts: [],
                startingCode: data.starting_code,
                restrictedDigitSet: data.restricted_digit_set,
            }
        )
        console.log('value: ', value)
        console.log('tokenType: ', tokenType)
        console.log('count: ', count)
        console.log('updatedCounts: ', updatedCounts)
        expect(tokenType).toEqual(TokenTypes.ADD_TIME)
    })
})

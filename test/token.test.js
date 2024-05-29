const tokenLib = require('../src/token').OpenPAYGOTokenShared
const bigintConversion = require('bigint-conversion')

describe('OpenPAYGOTokenShared test', () => {
    test('OpenPAYGOTokenShared genHash', () => {
        const hash = tokenLib.genHash({
            key: Buffer.from('0123456789ABCDEF'),
            msg: '',
        })

        expect(bigintConversion.hexToBigint(hash)).toBe(3627314469837380007n)
    })

    test('OpenPAYGOTokenShared convertHash2Token', () => {
        const hash = tokenLib.genHash({
            key: 'bc41ec9530f6dac86b1a29ab82edc5fb',
            msg: 'hello world',
        })
        const token = tokenLib.convertHash2Token(hash)
        expect(token).toBe(184900559)
    })

    test('OpenPAYGOTokenShared genNextToken', () => {
        const startingCode = 516959010
        const newToken = tokenLib.genNextToken(
            startingCode,
            'bc41ec9530f6dac86b1a29ab82edc5fb'
        )
        expect(newToken).toBe(117642353)
    })
})

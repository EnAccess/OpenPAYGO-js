'use strict'

const TokenTypes = require('./constants').TokenTypes
const shared = require('./token').OpenPAYGOTokenShared

class OpenPAYGOTokenEncoder {
    constructor() {}

    generateToken({
        secretKeyHex,
        count,
        value = undefined,
        tokenType = TokenTypes.SET_TIME,
        startingCode = undefined,
        valueDivider = 1,
        restrictDigitSet = false,
        extendToken = false,
    }) {
        if (startingCode === undefined) {
            // generate starting code here
            startingCode = shared.genStartingCode(secretKeyHex)
        }

        if (
            tokenType === TokenTypes.ADD_TIME ||
            tokenType === TokenTypes.SET_TIME
        ) {
            if (value === undefined) {
                throw new Error("'value' argument is undefined.")
            }
            value = Math.round(value * valueDivider)
            if (value > shared.prototype.MAX_ACTIVATION_VALUE) {
                throw new Error('The value provided is too high.')
            }
        } else if (value !== undefined) {
            throw new Error('A value is not allowed for this token type.')
        } else {
            if (tokenType === TokenTypes.DISABLE_PAYG) {
                value = shared.prototype.PAYG_DISABLE_VALUE
            } else if (tokenType === TokenTypes.COUNTER_SYNC) {
                value = shared.prototype.COUNTER_SYNC_VALUE
            } else {
                throw new Error('The token type provided is not supported.')
            }
        }

        return this.generateStandardToken({
            startingCode: startingCode,
            key: secretKeyHex,
            count: count,
            value: value,
            mode: tokenType,
            restrictDigitSet: restrictDigitSet,
        })
    }

    generateStandardToken({
        startingCode = undefined,
        key = undefined,
        value = undefined,
        count = undefined,
        mode = TokenTypes.ADD_TIME,
        restrictDigitSet = false,
    }) {
        const startingBaseCode = shared.getTokenBase(startingCode)
        const tokenBase = this.encodeBase(startingBaseCode, value)
        let currentToken = shared.putBaseInToken(startingCode, tokenBase)
        const newCount = this.getNewCount(count, mode)

        for (let i = 0; i < newCount; i++) {
            currentToken = shared.genNextToken(currentToken, key)
        }
        let finalToken = shared.putBaseInToken(currentToken, tokenBase)

        if (restrictDigitSet) {
            finalToken = shared.convertTo4dToken(finalToken)
            finalToken = String(finalToken).padStart(15, '0')
        } else {
            finalToken = String(finalToken).padStart(9, '0')
        }
        return {
            newCount,
            finalToken,
        }
    }

    encodeBase(baseCode, value) {
        if (value + baseCode > 999) {
            return value + baseCode - 1000
        }
        return value + baseCode
    }

    getNewCount(count, mode) {
        let newCount
        const currCountOdd = count % 2
        if (
            mode === TokenTypes.SET_TIME ||
            mode === TokenTypes.DISABLE_PAYG ||
            mode === TokenTypes.COUNTER_SYNC
        ) {
            if (currCountOdd) {
                newCount = count + 2
            } else {
                newCount = count + 1
            }
        } else {
            if (currCountOdd) {
                newCount = count + 1
            } else {
                newCount = count + 2
            }
        }
        return newCount
    }
}

module.exports = {
    OpenPAYGOTokenEncoder,
}

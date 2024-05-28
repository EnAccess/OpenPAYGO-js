'use strict'

const TokenTypes = require('./constants').TokenTypes
const shared = require('./token').OpenPAYGOTokenShared

class OpenPAYGOTokenDecoder {
    static MAX_TOKEN_JUMP = 64
    static MAX_TOKEN_JUMP_COUNTER_SYNC = 100
    static MAX_UNUSED_OLDER_TOKENS = 8 * 2

    static decodeToken({
        token = '',
        secretKeyHex,
        count,
        usedCounts = undefined,
        startingCode = undefined,
        valueDivider = 1,
        restrictedDigitSet = false,
    }) {
        if (startingCode === undefined) {
            // generate starting code here
            startingCode = shared.genStartingCode(secretKeyHex)
        }

        let extendedToken = false

        if (!restrictedDigitSet) {
            if (token.length <= 9) {
                extendedToken = false
            } else if (token.length <= 12) {
                extendedToken = true
            } else {
                throw new Error('Token is too long')
            }
        } else if (restrictedDigitSet) {
            if (token.length <= 15) {
                extendedToken = false
            } else if (token.length <= 20) {
                extendedToken = true
            } else {
                throw new Error('Token is too long')
            }
        }

        token = Number(token)

        // if (!extendedToken) {
        //     var { value, tokenType, count, updatedCounts } =
        //         this.getActivationValueCountAndTypefromToken({
        //             token,
        //             startingCode,
        //             secretKeyHex,
        //             count,
        //             restrictedDigitSet,
        //             usedCounts,
        //         })
        // } else {
        //     var { value, tokenType, count, updatedCounts } =
        //         this.getActivationValueCountAndTypefromExtendedToken({
        //             token,
        //             startingCode,
        //             secretKeyHex,
        //             count,
        //             restrictedDigitSet,
        //             usedCounts,
        //         })
        // }

        var { value, tokenType, count, updatedCounts } =
            this.getActivationValueCountAndTypefromToken({
                token,
                startingCode,
                keyHex: secretKeyHex,
                count,
                restrictedDigitSet,
                usedCounts,
            })

        if (value !== undefined && valueDivider) {
            value = value / valueDivider
        }

        return {
            value: value,
            tokenType: tokenType,
            count: count,
            updatedCounts: updatedCounts,
        }
    }

    static getActivationValueCountAndTypefromToken({
        token,
        startingCode,
        keyHex,
        count,
        restrictedDigitSet = false,
        usedCounts = undefined,
    }) {
        if (restrictedDigitSet) {
            token = shared.convertFrom4digitToken(token)
        }
        let validOldToken = false
        // obtain base of token
        const tokenBase = shared.getTokenBase(token)
        // put base into the starting code
        let currentCode = shared.putBaseInToken(startingCode, tokenBase)
        // obtain base of starting code
        const startCodeBase = shared.getTokenBase(startingCode)

        let value = this.decodeBase(startCodeBase, tokenBase)
        let maxCountTry
        if (value === TokenTypes.COUNTER_SYNC) {
            maxCountTry = count + this.MAX_TOKEN_JUMP_COUNTER_SYNC + 1
        } else {
            maxCountTry = count + this.MAX_TOKEN_JUMP + 1
        }

        for (let cnt = 0; cnt < maxCountTry; cnt++) {
            const maskedToken = shared.putBaseInToken(currentCode, tokenBase)
            let tokenType
            if (cnt % 2 !== 0) {
                if (value === shared.COUNTER_SYNC_VALUE) {
                    tokenType = TokenTypes.COUNTER_SYNC
                } else if (value === shared.PAYG_DISABLE_VALUE) {
                    tokenType = TokenTypes.PAYG_DISABLE_VALUE
                } else {
                    tokenType = TokenTypes.SET_TIME
                }
            } else {
                tokenType = TokenTypes.ADD_TIME
            }

            if (maskedToken === token) {
                if (
                    this.countIsValid(cnt, count, value, tokenType, usedCounts)
                ) {
                    const updatedCounts = this.updateUsedCounts(
                        usedCounts,
                        value,
                        cnt,
                        tokenType
                    )
                    return {
                        value: value,
                        tokenType: tokenType,
                        count: cnt,
                        updatedCounts,
                    }
                } else {
                    validOldToken = true
                }
            }
            currentCode = shared.genNextToken(currentCode, keyHex)
        }
        if (validOldToken) {
            return {
                value: undefined,
                tokenType: TokenTypes.ALREADY_USED,
                count: undefined,
                updatedCounts: undefined,
            }
        }
        return {
            value: undefined,
            tokenType: TokenTypes.INVALID,
            count: undefined,
            updatedCounts: undefined,
        }
    }

    static countIsValid(count, lastCount, value, type, usedCounts) {
        if (value === shared.COUNTER_SYNC_VALUE) {
            if (count > lastCount - this.MAX_TOKEN_JUMP) {
                return true
            }
        } else if (count > lastCount) {
            return true
        } else if (this.MAX_UNUSED_OLDER_TOKENS > 0) {
            if (count > lastCount - this.MAX_UNUSED_OLDER_TOKENS) {
                if (
                    usedCounts.includes(count) &&
                    type === TokenTypes.ADD_TIME
                ) {
                    return True
                }
            }
        }
        return false
    }

    static updateUsedCounts(pastUsedCounts, value, newCount, type) {
        if (pastUsedCounts.length) {
            return undefined
        }
        let highestCount = pastUsedCounts.length ? Math.max(pastUsedCounts) : 0
        highestCount = newCount > highestCount ? newCount : highestCount
        const bottomRange = highestCount - this.MAX_UNUSED_OLDER_TOKENS
        const usedCounts = []

        if (
            type !== TokenTypes.ADD_TIME ||
            value === shared.COUNTER_SYNC_VALUE ||
            value === shared.PAYG_DISABLE_VALUE
        ) {
            // If it is not an Add-Time token, we mark all the past tokens as used in the
            // range
            for (let cnt = bottomRange; cnt <= highestCount; cnt++) {
                usedCounts.push(cnt)
            }
        } else {
            // If it is an Add-Time token, we just mark the tokens actually used in the
            // range
            for (let cnt = bottomRange; cnt <= highestCount; cnt++) {
                if (cnt === newCount || pastUsedCounts.includes(cnt)) {
                    usedCounts.push(cnt)
                }
            }
        }
        return usedCounts
    }

    static decodeBase(startCodeBase, tokenBase) {
        const decodedValue = tokenBase - startCodeBase
        return decodedValue < 0 ? decodedValue + 1000 : decodedValue
    }
}

module.exports = {
    OpenPAYGOTokenDecoder: OpenPAYGOTokenDecoder,
}

import { expectType } from "tsd"
import { Encoder, Decoder, TokenTypes } from "openpaygo"

const encoder = new Encoder()
expectType<Encoder>(encoder)
expectType<
  (params: {
    secretKeyHex: string
    count: number
    value?: number
    tokenType?: TokenTypes
    startingCode?: number
    valueDivider?: number
    restrictDigitSet?: boolean
    extendToken?: boolean
  }) => { newCount: number; finalToken: string }
>(encoder.generateToken)

const decoder = new Decoder()
expectType<
  (params: {
    token: string
    secretKeyHex: string
    count: number
    usedCounts?: number[]
    startingCode?: number
    valueDivider?: number
    restrictedDigitSet?: boolean
  }) => {
    value: number | undefined
    tokenType: TokenTypes
    count: number | undefined
    updatedCounts: number[] | undefined
  }
>(decoder.decodeToken)

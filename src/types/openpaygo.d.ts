declare module "openpaygo-token" {
  import { TokenTypes } from "./constants"

  /**
   * Encoder class for generating OpenPAYGO tokens based on various configurations.
   */
  export class OpenPAYGOTokenEncoder {
    constructor()

    /**
     * Generates a new token with the specified configuration parameters.
     * @param params - The configuration object for generating the token.
     * @param params.secretKeyHex - The hexadecimal secret key used for token generation.
     * @param params.count - The usage count for the token.
     * @param params.value - The value associated with the token (if applicable).
     * @param params.tokenType - The type of token (e.g., ADD_TIME, SET_TIME, etc.).
     * @param params.startingCode - The initial code to start token generation (optional).
     * @param params.valueDivider - The divider applied to the value (default is 1).
     * @param params.restrictDigitSet - Boolean to restrict the token to specific digits.
     * @param params.extendToken - Boolean to determine if the token is extended.
     * @returns An object with the new count and final token as a string.
     */
    generateToken(params: {
      secretKeyHex: string
      count: number
      value?: number
      tokenType?: TokenTypes
      startingCode?: number
      valueDivider?: number
      restrictDigitSet?: boolean
      extendToken?: boolean
    }): {
      newCount: number
      finalToken: string
    }
  }

  /**
   * Decoder class for interpreting OpenPAYGO tokens based on various configurations.
   */
  export class OpenPAYGOTokenDecoder {
    static MAX_TOKEN_JUMP: number // Maximum allowed token jump
    static MAX_TOKEN_JUMP_COUNTER_SYNC: number // Max jump for counter sync tokens
    static MAX_UNUSED_OLDER_TOKENS: number // Max unused older tokens count

    constructor()
    /**
     * Decodes a token with the specified configuration parameters.
     * @param params - The configuration object for decoding the token.
     * @param params.token - The token to decode.
     * @param params.secretKeyHex - The hexadecimal secret key for token decoding.
     * @param params.count - The usage count for the token.
     * @param params.usedCounts - Optional array of previously used counts.
     * @param params.startingCode - Optional initial code for token decoding.
     * @param params.valueDivider - Divider applied to the value (default is 1).
     * @param params.restrictedDigitSet - Boolean to indicate restricted digits.
     * @returns Object containing value, tokenType, count, and updatedCounts.
     */
    static decodeToken(params: {
      token: string
      secretKeyHex: string
      count: number
      usedCounts?: number[]
      startingCode?: number
      valueDivider?: number
      restrictedDigitSet?: boolean
    }): {
      value: number | undefined
      tokenType: TokenTypes
      count: number | undefined
      updatedCounts: number[] | undefined
    }
  }
}

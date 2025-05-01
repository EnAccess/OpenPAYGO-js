declare module "openpaygo" {
  // available token types
  export enum TokenTypes {
    ADD_TIME = 1,
    SET_TIME = 2,
    DISABLE_PAYG = 3,
    COUNTER_SYNC = 4,
    INVALID = 10,
    ALREADY_USED = 11,
    PAYG_DISABLE_VALUE = 998,
  }

  // metrics auth methods
  export enum AuthMethod {
    SIMPLE_AUTH = "sa",
    TIMESTAMP_AUTH = "ta",
    COUNTER_AUTH = "ca",
    DATA_AUTH = "da",
    RECURSIVE_DATA_AUTH = "ra",
  }

  /**
   * Encoder class for generating OpenPAYGO tokens based on various configurations.
   */
  export class Encoder {
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
  export class Decoder {
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
    decodeToken(params: {
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

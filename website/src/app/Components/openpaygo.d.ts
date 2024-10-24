declare module "openpaygo" {
  export class Encoder {
    generateToken(options: {
      tokenType: number
      secretKeyHex: string
      count: number
      startingCode: number
      restrictDigitSet: boolean
      value: number
      extendToken: boolean
    }): { finalToken: string; newCount: number }
  }
}

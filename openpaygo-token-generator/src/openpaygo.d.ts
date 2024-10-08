
declare module 'openpaygo' {
    export class OpenPAYGOTokenEncoder {
        constructor();
        generateToken(params: {
            secretKeyHex: string;
            count: number;
            value?: number;
            tokenType?: number;
            startingCode?: number;
            valueDivider?: number;
            restrictDigitSet?: boolean;
            extendToken?: boolean;
        }): Promise<{ newCount: number; finalToken: string }>;
    }
}
const tokenLib = require('../src/token').OpenPAYGOTokenShared


describe('OpenPAYGOTokenShared test', () => {
    test('OpenPAYGOTokenShared genHash', () => {
        const hashBuffer =  tokenLib.genHash({ key: "0123456789ABCDEF", msg: "hello world"})
        expect(hashBuffer.length).toBe(8)
    })
    
    test('OpenPAYGOTokenShared convertHash2Token', () => {
        const hashBuffer =  tokenLib.genHash({ key: "bc41ec9530f6dac86b1a29ab82edc5fb", msg: "hello world"})
        const token =  tokenLib.convertHash2Token(hashBuffer)
        expect(token).toBe(180923337)
    })
})
 
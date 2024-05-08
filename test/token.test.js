const tokenLib = require('../src/token')


describe('OpenPAYGOTokenShared test', () => {
    test('OpenPAYGOTokenShared genHash', () => {
        const hashObj =  tokenLib.genHash({ key: "0123456789ABCDEF", msg: "hello world"})
        expect(hashObj).toEqual({ h: 828098790, l: 3595015261})
    })
    
    test('OpenPAYGOTokenShared convertHash2Token', () => {
        const hashObj =  tokenLib.genHash({ key: "0123456789ABCDEF", msg: "hello world"})
        const token =  tokenLib.convertHash2Token(hashObj)
        expect(token).toBe(969348910)
    })
})
 
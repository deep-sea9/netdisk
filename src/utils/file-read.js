export const getFileSHA = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.onload = (e) => {

            let wordArray = CryptoJS.lib.WordArray.create(e.target.result)
            resolve(CryptoJS.SHA256(wordArray).toString())
            // crypto.subtle.digest('SHA-256', e.target.result).then(res => {
            //     resolve(hex(res))
            // })
        }

        fileReader.readAsArrayBuffer(file)
    })
}

export const hex = (buffer) => {
    let code = []
    let view = new DataView(buffer)
    for(let i = 0;i < view.byteLength; i += 4) {
        let stringValue = view.getUint32(i).toString(16)

        let padding = '00000000'
        let padValue = (padding + stringValue).slice(-padding.length)
        code.push(padValue)
    }
    return code.join('')
}

export const str2ArrayBuffer = str => {
    if(!str) throw new Error('str is empty')
    console.log(str.length);

    let buf = new ArrayBuffer(str.length)
    let bufferView = new Uint8Array(buf)
    for(let i = 0, len = str.length; i < len ; i++) {
        bufferView[i] = str.charCodeAt(i)
    }
    return buf
}

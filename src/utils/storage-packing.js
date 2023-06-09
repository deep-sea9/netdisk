export default class LStorage {
    static usedKeyList = []
    prefix = ''

    constructor(options) {
        this.prefix = options.prefix || '_'
    }

    getItem = key => localStorage.getItem(`${this.prefix}-${key}`)

    setItem = (key, value, force = false) => {
        const isUsed = LStorage.usedKeyList.findIndex(used => used === `${this.prefix}-${key}`) > -1

        if(force) {
            localStorage.setItem(`${this.prefix}-${key}`, value)
            if(!isUsed) LStorage.usedKeyList.push(`${this.prefix}-${key}`)
            return
        }

        if(!isUsed) {
            localStorage.setItem(`${this.prefix}-${key}`, value)
            LStorage.usedKeyList.push(`${this.prefix}-${key}`)
        }else {
            throw new Error(`current key: [${key}] has been used in namespace of [${this.prefix}]!if you want to cover it, set third param to true please!`)
        }
    }

    removeItem = key => {
        const usedIndex = LStorage.usedKeyList.findIndex(used => used === `${this.prefix}-${key}`)
        if(usedIndex > -1) {
            LStorage.usedKeyList.splice(usedIndex, 1)
            localStorage.removeItem(`${this.prefix}-${key}`)
        }
    }
}

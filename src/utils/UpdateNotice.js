export default class UpdateNotice {
    oldScript = []
    newScript = []
    dispatch = {}
    timer = null

    constructor(options) {
        this.oldScript = []
        this.newScript = []
        this.dispatch = {}
        this.init()
        this.timing(options?.timer) // 轮询
    }

    async init() {
        const html = await this.getHtml()
        this.oldScript = this.parserScript(html)
    }

    async getHtml() {
        const html = await fetch('/').then(res => res.text()) // 读取index html
        return html
    }

    parserScript(html) {
        const reg = new RegExp(/<script(?:\s+[^>]*)?>(.*?)<\/script\s*>/ig) // script正则
        return html.match(reg)
    }

    on(key, fn) {
        (this.dispatch[key] || (this.dispatch[key] = [])).push(fn)
        return this
    }
    off(key, cb) {
        this.dispatch[key].length > 0 && (this.dispatch[key] = [])
        typeof cb === 'function' && cb()
    }
    compare(oldArr, newArr) {
        const base = oldArr.length
        const arr = Array.from(new Set(oldArr.concat(newArr)))
        if(arr.length === base) {
            this.dispatch['no-update'].forEach(fn => {
                fn()
            })
        }else {
            this.dispatch['update'].forEach(fn => fn())
        }
    }

    timing(time = 100000) {
        this.timer = setInterval(async () => {
            const newHtml = await this.getHtml()
            this.newScript = this.parserScript(newHtml)
            this.compare(this.oldScript, this.newScript)
        }, time)
    }
}

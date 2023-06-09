import {THEME_OPTIONS} from "@/utils/constants";

export const b2M = (b) => b/1024/1024
export const b2G = (b) => b/1024/1024/1024

export const getFormatFileSize = (fileSize) => {
    let size = fileSize? (fileSize / 1024).toFixed(2) : '-'
    if(size === '-') {
        return size
    }
    if(size > 1024) {
        size = (size/1024).toFixed(2)
    }else {
        if(fileSize != 0 && size < 0.01) {
            return '0.01KB'
        }
        return size + 'KB'
    }
    if(size > 1024) {
        size = (size/1024).toFixed(2)
    }else {
        return size + 'MB'
    }
    return size + 'GB'
}

export function findFirstHasChildName(arr) {
    for(let i = 0; i< arr.length; i++) {
        if(arr[i].children.length !== 0) {
            return arr[i].children[0].name
        }
    }
}
export function findFirstHasChildObj(arr) {
    for(let i = 0; i< arr.length; i++) {
        if(arr[i].children.length !== 0) {
            return arr[i]
        }
    }
}

export function computeRestDays(beginTime, endTime) {
    const deltaTime = new Date(endTime).getTime() - new Date(beginTime).getTime()
    const oneDayTime = 1000 * 60 * 60 *24

    if(deltaTime > 0) {
        return Math.ceil(deltaTime / oneDayTime)
    }else {
        return 0
    }
}

export function getCaptureCode(length = 4) {
    let captureStr = ''

    const code = [
        0, 1, 2 , 3 , 4, 5, 6, 7, 8, 9,
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    ]

    for(let i = 0; i< length; i ++) {
        let index = Math.round(Math.random() * (code.length - 1))
        captureStr += code[index]
    }

    return captureStr
}

export function throttle(fn, delay = 300) {
    let timer = null, prevTime = null;

    return function () {
        const now = new Date().getTime()

        const remain = delay - (now - prevTime)
        const args = arguments

        clearTimeout(timer)
        if(remain <= 0) {
            fn.apply(this, arguments)
            prevTime = now
        }else {
            timer = setTimeout(() => {
                fn.apply(this, args)
            }, delay)
        }
    }
}

export function dataURL2File(dataurl, filename = 'file') {
    let arr = dataurl.split(',')
    let mime = arr[0].match(/:(.*?);/)[1]
    let suffix = mime.split('/')[1]
    let bstr = atob(arr[1])
    let n = bstr.length
    let uint8Array = new Uint8Array(n)
    while(n--){
        uint8Array[n] = bstr.charCodeAt(n)
    }
    return new File([uint8Array], `${filename}.${suffix}`, {type: mime})
}


export function setRandomId(num) {
    let len = num || 32
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
    let maxPos = chars.length
    let strId = ""
    for (let i = 0; i < len; i++) {
        strId += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return strId
}

export function getCurrentTime(format, time) {
    let now = time ? new Date(time) : new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1 >= 10 ? now.getMonth() + 1 : '0' +(now.getMonth() + 1);
    let day = now.getDate() >= 10 ? now.getDate() : '0' + now.getDate();
    let hour = now.getHours()
    let minute = now.getMinutes()
    let second = now.getSeconds()

    if((format && format === 'yyyyMMddHHmmss') || !format) {
        return "" + year + month + day + hour + minute + second
    } else if(format === 'yyyy-MM-dd HH:mm:ss'){
        return year + '-' + month + '-' + day + ' ' + hour + ":" + minute + ":" + second
    } else if(format === 'yyyy.MM.dd HH:mm:ss') {
        return year + '.' + month + '.' + day + ' ' + hour + ":" + minute + ":" + second
    } else if(format === 'yyyy-MM-dd'){
        return year + '-' + month + '-' + day
    } else if(format === 'HH:mm:ss'){
        return hour + ":" + minute + ":" + second
    }

}

export function groupBy(array, prop) {
    return array.reduce((result, item) => {
        let key = item[prop]
        if(!result[key]) {
            result[key] = []
        }
        result[key].push(item)
        return result
    }, {})
}

export function updateThemeForStyle(themeName) {
    const selectedTheme = THEME_OPTIONS.find(t => t.name.toLowerCase() === themeName.toLowerCase()) || {}

    const html = document.getElementsByTagName('html')[0]
    Object.keys(selectedTheme).forEach((prop, i) => {
        if(prop === 'name') return;

        html.style.setProperty(prop, selectedTheme[prop])
    })
}

export function notNull(val) {
    return val !== undefined && val !== null;
}

/**
 * 返回数据原始类型
 * @param value
 * @return { string } type
 */
export function getRawType(value) {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

// 取消响应式
export function unObserver(val) {
    if (getRawType(val) === "object" || getRawType(val) === "array") {
        val.__v_skip = true;
        return val;
    }
    return val;
}

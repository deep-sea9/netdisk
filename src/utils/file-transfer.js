const ExcelJS = require('exceljs')

export const exportExcel = (luckySheet, value, cb = () => {}) => {
    // 参数为luckysheet.getluckysheetfile()获取的对象

    // 创建工作簿
    const workbook = new ExcelJS.Workbook()
    // 创建表格，第二个参数可以配置创建什么样的工作表
    if(Object.prototype.toString.call(luckySheet) === '[object Object]') {
        luckySheet = [luckySheet]
    }
    luckySheet.forEach(table => {
        if(table.data.length === 0) return true

        const worksheet = workbook.addWorksheet(table.name)
        const merge = (table.config && table.config.merge) || {}
        const borderInfo = (table.config && table.config.borderInfo) || {}

        //设置单元格合并，设置单元格边框，设置单元格样式，设置值
        setStyleAndValue(table.data, worksheet)
        setMerge(merge, worksheet)
        setBorder(borderInfo, worksheet)
        return true
    })

    // 写入buffer
    const buffer =  workbook.xlsx.writeBuffer().then(data => {
        const blob =  new Blob([data], {
            type: 'application/vnd.ms-excel;charset=utf-8'
        })
        console.log(value);
        cb(blob, value)
        return blob
        // FileSave.saveAs(blob, `${value}.xlsx`)
    })

    return buffer
}

const setMerge = (luckyMerge, worksheet) => {
    const mergeArr = Object.values(luckyMerge)

    mergeArr.forEach(ele => {
        // ele格式 {r: 0, c: 0, rs: 1, cs: 2}
        // 按开始行，开始列，结束行，结束列合并（相当于 K10:M12）
        worksheet.mergeCells(ele.r + 1, ele.c + 1, ele.r + ele.rs, ele.c + ele.cs)
    })
}

const setBorder = (luckyBorderInfo, worksheet) => {
    if(!Array.isArray(luckyBorderInfo)) return

    luckyBorderInfo.forEach(ele => {
        // 现在只兼容到borderType为range的情况
        if(ele.rangeType === 'range') {
            let border = borderConvert(ele.borderType, ele.style, ele.color)
            let range = ele.range[0]
            let row = range.row
            let column = range.column
            for(let i = row[0] + 1; i < row[1] + 2; i++) {
                for(let y = column[0] + 1; y < column[1] + 2; y++) {
                    worksheet.getCell(i, y).border = border
                }
            }
        }

        if(ele.rangeType === 'cell') {
            const { col_index, row_index } = ele.value
            const borderData = Object.assign({}, ele.value)
            delete borderData.col_index
            delete borderData.row_index
            let border = addBorderToCell(borderData, row_index, col_index)
            worksheet.getCell(row_index + 1, col_index + 1).border = border
        }
    })
}

const setStyleAndValue = (cellArr, worksheet) => {
    if(!Array.isArray(cellArr)) return

    cellArr.forEach((row, rowId) => {

        // 使用every默认该行没有内容的格子后几列均没有内容
        row.every((cell, columnId) => {
        // row.forEach((cell, columnId) => {
            if(!cell) return
            let fill = fillConvert(cell.bg)

            let font = fontConvert(cell.ff, cell.fc, cell.bl, cell.it, cell.fs, cell.cl, cell.ul)
            let alignment = alignmentConvert(cell.vt, cell.ht, cell.tb, cell.tr)
            let value = ''

            if(cell.f) {
                value = { formula: cell.f, result: cell.v }
            }else if(!cell.v && cell.ct && cell.ct.s) {
                // xls转为xlsx后，内部存在不同格式，都会进到富文本里，即值不存在与cell.v，而是存在于cell.ct.s之后
                cell.ct.s.forEach(arr => {
                    value += arr.v
                })
            }else {
                value = cell.v
            }

            //style填入到_value中可以实现填充色

            let letter = createCellPos(columnId)
            let target = worksheet.getCell(letter + (rowId + 1))

            for(const key in fill) {
                target.fill = fill
                break
            }
            target.font = font
            target.alignment = alignment
            target.value = value

            return true
        })
    })
}

const fillConvert = (bg) => {
    if(!bg) {
        return {}
    }
    return {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {argb: bg.replace('#', '')}
    }
}

const fontConvert = (ff = 0, fc = '#000000', bl = 0, it = 0, fs = 10, cl = 0, ul = 0) => {
    //luckysheet： ff(样式), fc(颜色), bl(粗体), it(斜体), fs(大小), cl(删除线), ul(下划线)

    const luckyToExcel = {
        0: '微软雅黑',
        1: '宋体（Song）',
        2: '黑体（ST HeiTi）',
        3: '楷体（ST KaiTi）',
        4: '仿宋（ST FangSong）',
        5: '新宋体（ST Song）',
        6: '华文新魏',
        7: '华文行楷',
        8: '华文隶书',
        9: 'Arial',
        10: 'Times New Roman',
        11: 'Tahoma',
        12: 'Verdana',
        num2bl: function (num) {
            return num !== 0
        }
    }

    //出现bug，导入的时候ff为luckyToExcel 的val

    let font = {
        name: typeof ff === 'number'? luckyToExcel[ff]: ff,
        family: 1,
        size: fs,
        color: {argb: fc.replace('@', '')},
        bold: luckyToExcel.num2bl(bl),
        italic: luckyToExcel.num2bl(it),
        underline: luckyToExcel.num2bl(ul),
        strike: luckyToExcel.num2bl(cl)
    }
    return font
}

const alignmentConvert = (vt = 'default', ht = 'default', tb = 'default', tr = 'default') => {
    // luckysheet: vt(垂直), ht(水平), tb(换行), tr(旋转)

    const luckyToExcel = {
        vertical: {
            0: 'middle',
            1: 'top',
            2: 'bottom',
            default: 'top'
        },
        horizontal: {
            0: 'center',
            1: 'left',
            2: 'right',
            default: 'left'
        },
        wrapText: {
            0: false,
            1: false,
            2: true,
            default: false
        },
        textRotation: {
            0: 0,
            1: 45,
            2: -45,
            3: 'vertical',
            4: 90,
            5: -90,
            default: 0
        }
    }

    let alignment = {
        vertical: luckyToExcel.vertical[vt],
        horizontal: luckyToExcel.horizontal[ht],
        wrapText: luckyToExcel.wrapText[tb],
        textRotation: luckyToExcel.textRotation[tr]
    }
    return alignment
}

const borderConvert = (borderType, style = 1, color = '#000') => {
    // 对应luckysheet 的config中borderinfo的参数
    if(!borderType) {
        return {}
    }

    const luckyToExcel = {
        type: {
            'border-all': 'all',
            'border-top': 'top',
            'border-right': 'right',
            'border-bottom': 'bottom',
            'border-left': 'left'
        },
        style: {
            0: 'none',
            1: 'thin',
            2: 'hair',
            3: 'dotted',
            4: 'dashDot', // Dashed
            5: 'dashDot',
            6: 'dashDotDot',
            7: 'double',
            8: 'medium',
            9: 'mediumDashed',
            10: 'mediumDashDot',
            11: 'mediumDashDotDot',
            12: 'slantDashDot',
            13: 'thick',
        }
    }

    let template = {
        style: luckyToExcel.style[style],
        color: { argb: color.replace('#', '') }
    }

    let border = {}
    if(luckyToExcel.type[borderType] === 'all') {
        border['top'] = template
        border['right'] = template
        border['bottom'] = template
        border['left'] = template
    }else {
        border[luckyToExcel.type[borderType]] = template
    }

    return border
}

const addBorderToCell = (borders, row_index, col_index) => {
    let border = {}

    const luckyExcel = {
        type: {
            l: 'left',
            r: 'right',
            b: 'bottom',
            t: 'top'
        },
        style: {
            0: 'none',
            1: 'thin',
            2: 'hair',
            3: 'dotted',
            4: 'dashDot', // Dashed
            5: 'dashDot',
            6: 'dashDotDot',
            7: 'double',
            8: 'medium',
            9: 'mediumDashed',
            10: 'mediumDashDot',
            11: 'mediumDashDotDot',
            12: 'slantDashDot',
            13: 'thick',
        }
    }

    for(const bor in borders) {
        if(borders[bor].color.indexOf('rgb') === -1) {
            border[luckyExcel.type[bor]] = {
                style: luckyExcel.style[borders[bor].style],
                color: { argb: borders[bor].color.replace('#', '') }
            }
        }else {
            border[luckyExcel.type[bor]] = {
                style: luckyExcel.style[borders[bor].style],
                color: { argb: borders[bor].color }
            }
        }
    }

    return border
}

const createCellPos = (n) => {
    let ordA = 'A'.charCodeAt(0)

    let ordZ = 'Z'.charCodeAt(0)
    let len = ordZ - ordA + 1
    let s = ''

    while (n >= 0) {
        s = String.fromCharCode((n % len) + ordA) + s

        n = Math.floor(n / len) - 1
    }

    return s
}

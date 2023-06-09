export default function DrawBoard(params) {
    this.element = document.getElementById(params.element)
    this.element.width = params.width || this.element.clientWidth
    this.element.height = params.height || this.element.clientHeight

    this.context = this.element.getContext('2d')
    this.data = []
    this.toolState = {
        color: params.color || '#920997',
        lineWidth: params.lineWidth || 5,
        typeIndex: 0,
        eraserCount: 0
    }

    this.usePenTool()
}

DrawBoard.prototype.setColor = function (color) {
    this.toolState.color = color
}

DrawBoard.prototype.setLineWidth = function (width) {
    this.toolState.lineWidth = width
}

DrawBoard.prototype.clearAll = function () {
    this.data = []
    this.context.clearRect(0, 0, this.element.width, this.element.height)
}

DrawBoard.prototype.usePenTool = function () {
    var that = this

    that.element.onmousedown = function (e) {

        var startX = e.clientX
        var startY = e.clientY - 100 // -100 是因为布局元素占据100高度，导致错位偏差
        that.toolState.typeIndex++;
        var onOff = true;

        that.element.onmousemove = function (ev) {
            if(!onOff) {
                return;
            }
            onOff = false;

            var timerId = setTimeout(function () {
                onOff = true
                clearTimeout(timerId)
            }, 15)

            var index = that.data.length

            that.data[index] = {
                type: 'point-line',
                typeIndex: that.toolState.typeIndex,
                startX,
                startY,
                endX: ev.clientX,
                endY: ev.clientY - 100,
                color: that.toolState.color,
                lineWidth: that.toolState.lineWidth
            }

            that.context.beginPath()
            that.context.moveTo(startX, startY)
            that.context.lineTo(ev.clientX, ev.clientY - 100)
            that.context.closePath()
            that.context.strokeStyle = that.toolState.color
            that.context.lineJoin = 'round'
            that.context.lineCap = 'round'
            that.context.lineWidth = that.toolState.lineWidth
            that.context.stroke()

            startX = ev.clientX
            startY = ev.clientY - 100

        }

        that.element.onmouseup = function () {
            that.element.onmousemove = null
        }

        return false;
    }
}

DrawBoard.prototype.useLineTool = function () {
    var that = this

    that.element.onmousedown = function (e) {

        var startX = e.clientX
        var startY = e.clientY - 100
        var index = that.data.length

        that.element.onmousemove = function (ev) {

            that.data[index] = {
                type: 'line',
                startX,
                startY,
                endX: ev.clientX,
                endY: ev.clientY - 100,
                color: that.toolState.color,
                lineWidth: that.toolState.lineWidth
            }

            that.render()
        }

        that.element.onmouseup = function () {
            that.element.onmousemove = null
        }

        return false;
    }
}

DrawBoard.prototype.useCircleTool = function() {
    var that = this

    that.element.onmousedown = function (e) {
        var startX = e.clientX
        var startY = e.clientY - 100
        var index = that.data.length

        that.element.onmousemove = function (ev) {
            var centerX = ev.clientX - startX
            var centerY = ev.clientY - 100 - startY

            that.data[index] = {
                type: 'circle',
                centerX: centerX / 2 + startX,
                centerY: centerY / 2 + startY,
                radius: Math.sqrt(centerX * centerX + centerY * centerY) / 2,
                color: that.toolState.color,
                lineWidth: that.toolState.lineWidth
            }

            that.render()
        }

        that.element.onmouseup = function () {
            that.element.onmousemove = null
        }

        return false;
    }
}

DrawBoard.prototype.useRectTool = function() {
    var that = this

    that.element.onmousedown = function (e) {
        var startX = e.clientX
        var startY = e.clientY - 100
        var index = that.data.length

        that.element.onmousemove = function (ev) {

            that.data[index] = {
                type: 'rect',
                startX,
                startY,
                width: ev.clientX - startX,
                height: ev.clientY - 100 - startY,
                color: that.toolState.color,
                lineWidth: that.toolState.lineWidth
            }

            that.render()
        }

        that.element.onmouseup = function () {
            that.element.onmousemove = null
        }

        return false;
    }
}

DrawBoard.prototype.useEraser = function() {
    var that = this

    ++that.toolState.typeIndex;

    that.element.onmousedown = function () {

        that.element.onmousemove = function (ev) {
            var index = that.data.length

            that.data[index] = {
                type: 'clear-rect',
                typeIndex: that.toolState.typeIndex,
                startX: ev.clientX - 15,
                startY: ev.clientY - 15 - 100,
                width: 30,
                height: 30,
                color: '#fff'
            }

            that.render()

            // that.context.fillStyle = '#fff'
            // that.context.beginPath()
            // that.context.fillRect(ev.clientX - 15, ev.clientY - 15, 30, 30)
            // that.context.closePath();
            // that.context.fill()
        }

        that.element.onmouseup = function () {
            that.element.onmousemove = null
        }

        return false;
    }
}

DrawBoard.prototype.backspace = function() {
    if(this.data.length === 0) {
        console.warn('当前画板没有数据');
        return
    }

    var type = this.data[this.data.length - 1].type

    switch (type) {
        case 'line':
        case 'circle':
        case 'rect':
            this.data.pop()
            break
        case 'point-line':
        case 'clear-rect':
            var typeIndex = this.data[this.data.length - 1].typeIndex
            for(var i = this.data.length - 1; i >= 0; i --) {
                if(type === this.data[i].type && typeIndex === this.data[i].typeIndex) {
                    this.data.pop()
                }else {
                    break
                }
            }
            break

    }

    this.render()
    return true
}

DrawBoard.prototype.download = function(fileName) {
    var imgURL = this.element.toDataURL('image/png')
    var aElement = document.createElement('a')
    aElement.download = fileName || 'image'
    aElement.href = imgURL
    aElement.dataset.downloadUrl = ['image/png', fileName, imgURL].join(':')
    document.body.appendChild(aElement)
    aElement.click()
    document.body.removeChild(aElement)
}

DrawBoard.prototype.getDataURL = function() {
    return this.element.toDataURL('image/png')
}

DrawBoard.prototype.render = function () {
    this.context.clearRect(0, 0, this.element.width, this.element.height)

    for(var i = 0;i < this.data.length ;i++) {
        switch (this.data[i].type) {
            case 'clear-rect':
            case 'rect':
                this.context.strokeStyle = this.data[i].color
                this.context.lineWidth = this.data[i].lineWidth
                this.context.beginPath()
                this.context.strokeRect(this.data[i].startX, this.data[i].startY, this.data[i].width, this.data[i].height)
                this.context.closePath()
                this.context.stroke()
                break;
            case 'circle':
                this.context.beginPath()
                this.context.arc(this.data[i].centerX, this.data[i].centerY, this.data[i].radius, 0, 2 * Math.PI, false)
                this.context.closePath()
                this.context.strokeStyle = this.data[i].color
                this.context.lineWidth = this.data[i].lineWidth
                this.context.stroke()
                break;
            case 'point-line':
            case 'line':
                this.context.beginPath();
                this.context.moveTo(this.data[i].startX, this.data[i].startY)
                this.context.lineTo(this.data[i].endX, this.data[i].endY)
                this.context.closePath()
                this.context.lineJoin = 'round'
                this.context.lineCap = 'round'
                this.context.strokeStyle = this.data[i].color
                this.context.lineWidth = this.data[i].lineWidth
                this.context.stroke()
                break
        }
    }
}

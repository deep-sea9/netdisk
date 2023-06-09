export function onlineNetiler(file, that) {
    const baseURL = process.env["VUE_APP_BASE_URL"]
    console.log("open use Netiler dll");
    try {
        init("wps", "100%", "100%");
    } catch (e) {

    }
    that.$message.info("正在启动Office/WPS软件，请稍后...")

    let wordObj = document.getElementById('word');
    wordObj.PreCloseWordCallback = function (changed, objJson) { /*文档是否已变更*/

        if (changed) {
            that.$message.success("保存成功")
            // that.handleOpen()
            that.visible = false
        }
    }

    wordObj.FinishLoadFile = function () {
        console.log("FinishLoadFile");
    }

    //打开WORD文档
    let id = file.id;
    var protocol = window.location.protocol;
    var host = window.location.host;
    var domain = protocol+'//'+host;

    let downloadurl = domain + baseURL + `/email/download?fileId=` + id + "&userId=" + that.$store.getters.userId
    let uploadurl = domain + baseURL + `/snap/upload?fileId=` + id + "&userId=" + that.$store.getters.userId
    let filename = file.fileName + '.' + file.fileType;

    let param = [];
    param.push('"uploadurl":"'+uploadurl+'"');
    param.push('"alertMsg":"即将返回办公系统，是否要将最新的更改保存到办公系统中？\\n\\n如果点击【取消】将取消关闭，继续编辑文档。"');

    let pstr = "{" + param + "}";
    wordObj.OpenWord(filename, downloadurl, uploadurl, pstr);
}

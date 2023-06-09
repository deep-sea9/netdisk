import {getCurrentTime, getFormatFileSize, setRandomId} from "@/utils";
import {batchDownloadFiles, downloadFiles} from "@/api/common";

import { groupBy } from "@/utils";

const previewURL = process.env.VUE_APP_BASE_URL

export default {
    computed: {
        aboutShare() {
            return this.$route.name.indexOf('share') > -1
        }
    },
    methods: {
        setTableBtn(list, fileId, showMsg, status) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].fileId === fileId) {
                    list[i].progress = showMsg
                    list[i].status = status
                }
            }
        },
        handleLinkDownload(file) {
            let a = document.createElement("a");
            a.href = `${previewURL}/files/download?fileId=${file.fileId || file.id}&shareId=${this.aboutShare? file.id: undefined}`
            if(file.fileType) {
                a.download = file.fileName + '.' + file.fileType;
            } else {
                a.download = file.folderName + '.zip';
            }

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        handleBatchLinkDownload(fileIds) {
            let fileName = setRandomId()
            let a = document.createElement("a");
            a.href = `${previewURL}/files/batchDownload?fileIds=${fileIds}`
            a.download = fileName + '.zip';

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        handleShareBatchLinkDownload(selection) {
            const groupedShareMap = groupBy(selection, 'id')
            Object.keys(groupedShareMap).forEach(id => {
                let fileName = getCurrentTime()
                let a = document.createElement("a");
                let fileIds = groupedShareMap[id].map(file => file.fileId)
                a.href = `${previewURL}/files/batchDownload?fileIds=${fileIds}&shareId=${id}`
                a.download = fileName + '.zip';

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            })
        },
        downloadFile(file, downloadingList = []) {
            let id = file.fileId || file.id
            downloadingList.push({
                fileId: id,
                fileName: file.fileName || file.folderName,
                fileSize : 0,
                fileType: file.fileType || '.zip',
                progress: '等待下载',
                status: 'waiting',
                uid: id + new Date().getTime()
            })
            this.$message.success('已添加至下载队列')
            downloadFiles({fileId: id, shareId: this.aboutShare? file.id: undefined}, (e) => {
                this.handleDownloadProgress(e, downloadingList, id, e.total)
            }).then(res => {
                let blob = new Blob([res.data], {
                    type: "application/vnd.ms-excel",
                });

                let objectUrl = URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = objectUrl;
                if(file.fileType) {
                    a.download = file.fileName + '.' + file.fileType;
                } else {
                    a.download = file.folderName + '.zip';
                }

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                this.setTableBtn(downloadingList, id, '下载完成', 'success')
                this.$store.dispatch('translate/setDownloadingList', downloadingList)
                this.percentage = 0
            }).catch(() => {
                this.setTableBtn(downloadingList, id, '下载失败', 'error')
                this.$store.dispatch('translate/setDownloadingList', downloadingList)
            })
        },
        handleDownload() {
            let downloadingList = this.downloadingList || []

            // 单个文件
            if(this.selection.length === 1) {
                if(!this.selection[0].fileType || this.selection[0].fileSize >= 1024 * 1024 * 100) {
                    const h = this.$createElement
                    this.$msgbox({
                        title: '提示',
                        message: h('p', null, [
                            h('span', null, '该文件大小超过100MB，为避免下载过程中应用程序崩溃，将采用浏览器默认下载方式，或'),
                            h('a', {attrs: {target: '_blank', href: 'leadal://open.netdisk'}, style: {'color': '#409eff'}}, '打开网络云盘客户端下载'),
                            h('span', null, '，如要继续选择应用内下载方式下载，请点击应用内下载，如要取消下载请点击右上角X'),
                        ]),
                        showCancelButton: true,
                        cancelButtonText: '应用内下载',
                        confirmButtonText: '浏览器下载',
                        distinguishCancelAndClose: true
                    }).then(action => {
                        console.log(action);
                        this.handleLinkDownload(this.selection[0])
                    }).catch(action => {
                        console.log(action);
                        if(action === 'cancel') {
                            this.downloadFile(this.selection[0], downloadingList)
                        }
                    })
                }else {
                    this.downloadFile(this.selection[0], downloadingList)
                }

            } else {
                let fileIds = this.selection.map(file => file.fileId || file.id).join(",")

                const h = this.$createElement
                this.$msgbox({
                    title: '提示',
                    message: h('p', null, [
                        h('span', null, '多文件下载任务为避免下载过程中应用程序崩溃，将采用浏览器默认下载方式，或'),
                        h('a', {attrs: {target: '_blank', href: 'leadal://open.netdisk'}, style: {'color': '#409eff'}}, '打开网络云盘客户端下载'),
                        h('span', null, '，如要继续选择应用内下载方式下载，请点击应用内下载，如要取消下载请点击右上角X'),
                    ]),
                    showCancelButton: true,
                    cancelButtonText: '应用内下载',
                    confirmButtonText: '浏览器下载',
                    distinguishCancelAndClose: true
                }).then(() => {
                    if(this.aboutShare) {
                        this.handleShareBatchLinkDownload(this.selection)
                    }else {
                        this.handleBatchLinkDownload(fileIds)
                    }
                }).catch((action) => {
                    if(action === 'cancel') {
                        if(this.aboutShare) {
                            this.handleShareDownload(this.selection, downloadingList)
                        }else {
                            this.handleCommonDownload(this.selection, downloadingList)
                        }
                    }
                })
            }
        },
        handleShareDownload(selection, downloadingList) {
            const groupedShareMap = groupBy(selection, 'id')
            Object.keys(groupedShareMap).forEach(id => {
                this.handleCommonDownload(groupedShareMap[id], downloadingList, id)
            })
        },
        handleCommonDownload(selection, downloadingList, shareId) {
            let fileIds = selection.map(file => file.fileId || file.id).join(",")
            this.$message.success('已添加至下载队列')
            let id = setRandomId()
            let fileName = setRandomId()
            downloadingList.push({
                fileId: id,
                fileName: fileName,
                fileSize : 0,
                fileType: 'zip',
                progress: '等待下载',
                status: 'waiting',
                uid: id + new Date().getTime()
            })
            // todo 未返回一个total
            batchDownloadFiles({fileIds: fileIds, shareId}, (e) => {
                let size = selection.reduce((sum, item) => sum + Number(item.fileSize), 0)
                console.log(size);
                this.handleDownloadProgress(e, downloadingList, id, e.total)
            }).then(res => {
                let blob = new Blob([res.data], {
                    type: "application/vnd.ms-excel",
                });
                let objectUrl = URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = objectUrl;
                a.download = fileName + '.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                this.setTableBtn(downloadingList, id, '下载完成', 'success')
                this.$store.dispatch('translate/setDownloadingList', downloadingList)
                this.percentage = 0
            }).catch(() => {
                this.setTableBtn(downloadingList, id, '下载失败', 'error')
                this.$store.dispatch('translate/setDownloadingList', downloadingList)
            })
        },
        handleDownloadProgress(e, list, fileId, size) {
            if(size) {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].fileId === fileId) {
                        list[i].fileSize = getFormatFileSize(size)
                    }
                }
            } else {
                size = e.total
            }
            this.setTableBtn(list, fileId, Math.floor((e.loaded / size) * 100) + '%', 'pending')
            this.$store.dispatch('translate/setDownloadingList', list)
        },
    }
}

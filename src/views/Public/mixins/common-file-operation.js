import {cancelFav} from "@/api/personal/fav";
import {secondFile} from "@/api/common";
import { PERSON_DISK_ID } from '@/utils/constants'

export default {
    methods: {
        handleUnFav() {
            const ids = this.selection.map(file => file.id).join()
            const loading = this.$loading({ lock: true, text: '正在取消，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
            cancelFav({ ids }).then(res => {
                this.$message.success(res.message || '取消成功')
                loading.close()
                this.fetchFiles()
            }).catch(() => {
                loading.close()
            })
        },
        handleSyncFile(folders, diskType) {
            const folder = folders[0]
            let files
            if(this.type === 'all') {
                files = this.selection.filter(f => f.fileName && f.downNum !== 0)
            }else {
                files = this.selection.filter(f => f.downNum !== 0)
            }

            if(files.length < 1) {
                if(this.selection.length > 0) {
                    this.$message.warning('暂不支持同步文件夹或该文件下载次数为0，请选择一个有效文件同步！')
                }else {
                    this.$message.warning('请选择一个文件同步！')
                }
                return
            }
            Promise.allSettled(files.map(f => secondFile({
                diskId: diskType === PERSON_DISK_ID? undefined : (folder.diskAuth? folder.id: folder.diskId),
                fileName: f.fileName + '.' + f.fileType,
                folderId: folder.diskAuth? undefined: (folder.id === '0'? undefined : folder.id),
                resourceId: f.resourceId
            }))).then(res => {
                let failedIndex = []
                res.forEach((p, index) => {
                    if(p.status !== 'fulfilled') {
                        failedIndex.push(index)
                    }
                })
                if(failedIndex.length > 0) {
                    let failedFileName = ''
                    failedIndex.forEach(i => {
                        failedFileName += files[i].fileName + '，'
                    })
                    this.$message.warning(failedFileName + '同步失败，请重试')
                }else {
                    this.$message.success('同步成功！')
                }

            })

        }
    }
}

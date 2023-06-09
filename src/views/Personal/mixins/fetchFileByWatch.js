export default {
    computed: {
        pageSize() {
            return this.$store.state.app.globalPageSize
        },
        fileDefaultSort() {
            return this.$store.state.app.fileDefaultSort
        },
        isAsc() {
            return this.fileDefaultSort.order === 'ascending'
        },
        sortName() {
            return this.fileDefaultSort.prop
        }
    },
    watch: {
        fileDefaultSort() {
            this.fetchFiles()
        }
    },
    methods: {
        handleOpenIn(file) {
            if(this.diskId) {
                this.$router.push({
                    name: `${this.diskId}-all`,
                    params: {
                        folderId: file.folderParentId,
                        folderName: file.folderParentName,
                        fileId: file.id,
                        fileName: file.fileName
                    }
                })
            }else {
                this.$router.push({
                    name: 'personal-all',
                    params: {
                        folderId: file.folderParentId,
                        folderName: file.folderParentName,
                        fileId: file.id,
                        fileName: file.fileName
                    }
                })
            }
        },
    }
}

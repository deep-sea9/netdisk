export default {
    methods: {
        getFileName(file) {
            if(file.fileType) {
                return `${file.fileName}.${file.fileType}`
            }else {
                return file.folderName
            }
        },
    }
}

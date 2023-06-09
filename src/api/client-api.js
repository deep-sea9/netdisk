const request = require("../utils/client-request");

module.exports = {
    downloadFile: (fileId, userId) => {
        return request({
            url: `/snap/download`,
            method: 'get',
            params: {fileId, userId},
            download: true,
            responseType: "stream"
        })
    },
    uploadFile: (data, headers) => {
        return request({
            url: `/snap/upload`,
            method: 'post',
            data,
            headers
        })
    }

}

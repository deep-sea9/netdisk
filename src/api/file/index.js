/*eslint-disable*/
import request, { get, post } from "../../utils/request";

const baseURL = process.env["VUE_APP_BASE_URL"]
// const previewURL = process.env.NODE_ENV === 'development'? 'http://192.168.60.62/ndk_apis': baseURL
const previewURL = baseURL

//获取全部文件
export const fileListAll = (diskId, id, pageNo, pageSize, keyword, sortName, isAsc) => {
    return get(`/files/query`, {diskId, id, pageNo, pageSize, keyword, sortName, isAsc})
};

export const renameFileName = (data) => {
    return request({
        url: "/files/rename",
        method: 'put',
        data
    })
}

//获取文档列表
export const fileListDocument = () => {
    return post("/file/list/document")

}
//获取文件操作权限
export const fileListLimit = () => {
    return post("/file/limit")
}

export const getFileHistoryById = (fileId) => {
    return get('/snap/listSnap', { fileId })
}

export const getHistoryFile = (fileId, snapId) => {
    return request({
        url: '/snap/pastDown',
        method: 'get',
        params: { fileId, snapId },
        download: true,
        responseType: "blob"
    })
}

export const rollup2CurrentVersion = (fileId, snapId) => {
    return request({
        url: '/snap/rollback',
        method: 'put',
        params: { fileId, snapId }
    })
}

export const getThumnOfImg = (fileId) => {
    return request({
        url: '/preview/compressPic',
        method: 'get',
        params: { fileId },
        download: true,
        responseType: "blob"
    })
}

export const getThumnUrlOfImg = fileId => `${previewURL}/preview/compressPic?fileId=${fileId}`

export const setVideoCover = (data) => {
    return request({
        url: '/preview/saveVideoCover',
        method: 'post',
        data
    })
}

export const uploadFileForUpdateHistory = (data) => {
    return request({
        url: `/snap/upload`,
        method: 'post',
        data
    })
}

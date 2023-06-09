/*eslint-disable*/
import request from "../../utils/request";

//获取上传中文件列表
export const getUploadingList = () => {
    return request({
        url: `/transfer/listUpload`
    })
};

//获取下载中文件列表
export const getDownloadingList = () => {
    return request({
        url: `/transfer/listDownLoad`
    })
};

//获取传输完成文件列表
export const getTranslatedList = (pageNo = 1, pageSize = 10) => {
    return request({
        url: `/transfer/listEnd`,
        params: { pageNo, pageSize }
    })
};

// 删除传输记录
export const delTranslateRecord = (params) => {
    return request({
        url: `/transfer/delete`,
        method: 'delete',
        params
    })
};

// 开始迁移
export const beginDiskMigrate = () => {
    return request({
        url: `/migrate/begin`,
        method: 'put'
    })
};

// 停止迁移
export const stopDiskMigrate = () => {
    return request({
        url: `/migrate/end`,
        method: 'put'
    })
};

// 迁移列表
export const getMigrateList = (pageNo = 1,pageSize = 10) => {
    return request({
        url: `/migrate/pageDisk`,
        method: 'get',
        params: { pageNo, pageSize }
    })
};

// 迁移列表记录文件列表
export const getFileListOfMigrateRecord = (diskId, pageNo = 1,pageSize = 10) => {
    return request({
        url: `/migrate/pageFile`,
        method: 'get',
        params: { diskId, pageNo, pageSize }
    })
};

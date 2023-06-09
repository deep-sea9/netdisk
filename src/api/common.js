import request from "@/utils/request";

//登录
export const login = data => {
    return request({
        url: "/login/dologin",
        method: "post",
        params: data
    });
};

//获取用户信息
export const getUserInfo = () => {
    return request({
        url: "/system/getUserInfo",
        method: "get"
    });
};

//获取组织列表：平铺形式
export const getDepartmentTree = () => {
    return request({
        url: "/system/listOrgan",
        method: "get"
    });
};

//退出
export const quitSys = () => {
    return request({
        url: "/logout",
        method: "post"
    });
};

// 新建文件夹
export const createFold = data => {
    return request({
        url: '/folder/create',
        method: 'post',
        data
    })
}

// 重命名文件夹
export const renameFold = data => {
    return request({
        url: '/folder/rename',
        method: 'put',
        params: data
    })
}

// 文件夹列表
export const getFoldList = params => {
    return request({
        url: '/folder/query',
        method: 'get',
        params
    })
}

// 关键字搜索列表
export const getFilesByKeyword = params => {
    return request({
        url: `/files/query`,
        method: 'get',
        params
    })
}

// 上传文件 { fileName, md5, sha, size, file, chunk, chunks, diskId, folderId, id: 首次不用传 }
export const uploadFiles = data => {
    return request({
        url: `/files/upload`,
        method: 'post',
        data
    })
}

// md5校验文件 { diskId, md5, sha, size }
export const checkFiles = data => {
    return request({
        url: `/files/check`,
        method: 'post',
        data
    })
}

// 秒传 { diskId, fileName, folderId, resourceId }
export const secondFile = data => {
    return request({
        url: `/files/pass`,
        method: 'post',
        data
    })
}

// 下载文件
export const downloadFiles = (params, handleDownload) => {
    return request({
        url: `/files/download`,
        method: 'get',
        downloadFile: true,
        params,
        responseType: "blob",
        timeout: 1000 * 60 * 60,
        onDownloadProgress: (e) => {
            typeof handleDownload === 'function' ? handleDownload(e) : console.log(e)
            // handleDownload(e)
        }
    })
}

// 批量下载文件
export const batchDownloadFiles = (params, handleDownload) => {
    return request({
        url: `/files/batchDownload`,
        method: 'get',
        downloadFile: true,
        params,
        responseType: "blob",
        timeout: 1000 * 60 * 60,
        onDownloadProgress: (e) => {
            typeof handleDownload === 'function' ? handleDownload(e) : console.log(e)
            // handleDownload(e)
        }
    })
}

// 逻辑删除文件
export const deleteFiles = data => {
    return request({
        // url: `/perdisk/files/delete`,
        url: `/recyle/create`,
        // method: 'delete',
        method: 'post',
        data
    })
}

// 复制文件
export const copyFiles = data => {
    return request({
        url: `/files/copy`,
        method: 'post',
        data
    })
}

// 移动文件
export const moveFiles = data => {
    return request({
        url: `/files/move`,
        method: 'put',
        data
    })
}

// 图片预览
export const previewImg = (fileId, shareId) => request({
    url: `/preview/picture`,
    method: 'get',
    download: true,
    responseType: "blob",
    params: { fileId, shareId }
})

/**
 * 视频预览
 *
 * @param fileId   资源Id
 * @param Range   范围
 * @return
 */
export const previewVideo = (fileId, Range) => request({
    url: `/preview/video`,
    method: 'get',
    download: true,
    responseType: "blob",
    headers: { Range },
    params: { fileId }
})

/**
 * 音频预览
 *
 * @param fileId   资源Id
 * @param Range   范围
 * @return
 */
export const previewAudio = (fileId, Range) => request({
    url: `/preview/music`,
    method: 'get',
    download: true,
    responseType: "blob",
    headers: { Range },
    params: { fileId }
})

/**
 * 文件预览
 *
 * @param fileId   资源Id
 * @param shareId
 * @return
 */
export const previewOffice = (params) => request({
    url: `/preview/doc`,
    method: 'get',
    download: true,
    responseType: "blob",
    timeout: 1000 * 60 * 60,
    params
})

//获取组织列表：第一层
export const getFirstLayerOrg = () => {
    return request({
        url: "/system/getTopOrgan",
        method: "get"
    });
};

//获取组织列表：通过上层组织id
export const getOrgById = (parentId) => {
    return request({
        url: "/system/listOrganByParentId",
        method: "get",
        params: { parentId }
    });
};

//获取用户列表：通过上层组织id
export const getUsersById = (organId) => {
    return request({
        url: "/system/listUserByOrganId",
        method: "get",
        params: { organId }
    });
};

//获取完整组织架构
export const getOrganTree = () => {
    return request({
        url: "/system/getTreeOrgan",
        method: "get"
    });
};

export const getStaffTree = () => request({
    url: `/system/getAllTree`,
    method: 'get'
})

//获取个人总网盘空间大小分配情况
export const getSpaceSizeInfo = () => {
    return request({
        url: "/system/getSpaceInfo",
        method: "get",
    });
};

// 获取网盘配置
export const getDiskConfig = () => {
    return request({
        url: '/system/listConfig',
        method: 'get'
    })
}

// 保存网盘配置
export const saveDiskConfig = (data) => {
    return request({
        url: '/system/saveConfig',
        method: 'post',
        data
    })
}

// 上传LOGO
export const uploadLogo = (data) => {
    return request({
        url: '/system/uploadLogo',
        method: 'post',
        data
    })
}

// 上传LOGO
export const downloadLogo = () => {
    return request({
        url: '/system/downloadLogo',
        method: 'get',
        download: true,
        responseType: "blob",
    })
}

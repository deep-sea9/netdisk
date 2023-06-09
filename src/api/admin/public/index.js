import request from "@/utils/request";

// 获取指定公共网盘配置
export function getPublicConfigById(id) {
    return request({
        url: "/pubdisk/disk/getById",
        method: "get",
        params: {id}
    });
}

// 保存指定网盘配置
export function setPublicConfigById(data) {
    return request({
        url: "/pubdisk/disk/saveDisk",
        method: "post",
        data
    });
}

// 获取指定公共网盘已授权部门列表
export function getPublicDepartmentById(diskId) {
    return request({
        url: "/pubdisk/disk/authOrganQuery",
        method: "get",
        params: {diskId}
    });
}

// 删除指定公共网盘已授权部门
export function deletePublicDepartmentById(data) {
    return request({
        url: "/pubdisk/disk/deleteAuthOrgan",
        method: "delete",
        data
    });
}

/*
* 保存指定公共网盘已授权部门权限
*
* auth: Enum{ READONLY,READUPLOAD }
* */
export function savePublicDepartmentById(data) {
    return request({
        url: `/pubdisk/disk/saveAuthOrgan`,
        method: "post",
        data
    });
}

/*
* 新增指定公共网盘已授权部门
* */
export function addPublicDepartment(data) {
    return request({
        url: `/pubdisk/disk/addAuthOrgans`,
        method: "post",
        data
    });
}

// 公共网盘列表：管理端

export function getAllPublicDiskList() {
    return request({
        url: `/pubdisk/disk/listByAdmin`,
        method: "get"
    })
}


/**
 * 删除公共网盘
 *
 * @return
 */
export const deletePublicDisk = (diskId) => {
    return request({
        url: `/pubdisk/disk/deleteDisk?id=${diskId}`,
        method: 'delete'
    })
};

import request from "@/utils/request";


// 获取群组网盘列表
export function getGroupDiskList(params) {
    return request({
        url: "/grodisk/disk/pageDisk",
        method: "get",
        params
    });
}

// 解散指定群组网盘
export function dismissGroupDisk(data) {
    return request({
        url: "/grodisk/disk/deleteDisk",
        method: "delete",
        data
    });
}

// 删除分组
export function deleteGroupById(data) {
    return request({
        url: "/grodisk/disk/deleteGroup",
        method: "delete",
        data
    });
}

// 获取指定公共网盘配置
export function getGroupDiskConfigById(id) {
    return request({
        url: "/grodisk/disk/getById",
        method: "get",
        params: {id}
    });
}

// 保存指定群组网盘配置
export function setGroupDiskConfig(data) {
    return request({
        url: "/grodisk/disk/saveDisk",
        method: "post",
        data
    });
}

// 获取指定群组网盘已授权成员列表
export function getGroupDiskMember(params) {
    return request({
        url: "/grodisk/disk/memberQuery",
        method: "get",
        params
    });
}

// 删除指定公共网盘已授权部门
export function deleteGroupMemberByIds(data) {
    return request({
        url: "/grodisk/disk/deleteMembers",
        method: "delete",
        data
    });
}

/*
* 保存指定群组网盘已授权人员权限
*
* auth: Enum{ READONLY,READUPLOAD }
* */
export function saveGroupDiskPermissionById(data) {
    return request({
        url: `/grodisk/disk/saveMember`,
        method: "post",
        data
    });
}

/*
* 新增指定群组网盘已授权用户
* */
export function addGroupDiskUsers(data) {
    return request({
        url: `/grodisk/disk/addMembers`,
        method: "post",
        data
    });
}

/*
* 保存分组名称
* */
export function saveGroupName(params) {
    return request({
        url: `/grodisk/disk/saveGroup`,
        method: "put",
        params
    });
}

/*
* 拖拽分组排序
* */
export function dragSortGroup(data) {
    return request({
        url: `/grodisk/disk/dragGroup`,
        method: "put",
        data
    });
}

/*
* 拖拽网盘排序
* */
export function dragSortDisk(data) {
    return request({
        url: `/grodisk/disk/dragDisk`,
        method: "put",
        data
    });
}

import request from "@/utils/request";

// 我的共享列表
export function getMyShareList(params) {
    return request({
        url: "/share/pageMine",
        method: "get",
        params
    });
}

// 他人共享列表
export function getOthersShareList(params) {
    return request({
        url: "/share/pageOther",
        method: "get",
        params
    });
}

// 链接共享列表
export function getLinkShareList(params) {
    return request({
        url: "/share/link/page",
        method: "get",
        params
    });
}

// 获取共享链接
export function getShareLink() {
    return request({
        url: "/share/getLink",
        method: "get"
    });
}

// 验证共享链接
export function checkShareLink(params) {
    return request({
        url: "/share/link/verify",
        method: "get",
        params
    });
}

// 转存到个人网盘
export function restoreToPerson(data) {
    return request({
        url: "/share/transfer",
        method: "put",
        data
    });
}

// 保存共享
export function saveShare(data) {
    return request({
        url: "/share/save",
        method: "post",
        data,
    });
}

// 删除共享
export function deleteShare(data) {
    return request({
        url: "/share/delete",
        method: "delete",
        data
    });
}

// 获取文件访问者列表
export function getVisitorList(params) {
    return request({
        url: "/share/listVisitUser",
        method: "get",
        params
    });
}

// 获取文件访问日志列表
export function getVisitedLog(params) {
    return request({
        url: "/share/getVisitLog",
        method: "get",
        params
    });
}

// 撤回共享
export function recallShare(data) {
    return request({
        url: "/share/withDraw",
        method: "put",
        data
    });
}

// 取消共享
export function cancelShare(data) {
    return request({
        url: "/share/cancel",
        method: "put",
        data
    });
}

import request from "@/utils/request";

export function getRecycleList(params) {
    return request({
        url: "/recyle/query",
        method: "get",
        params
    });
}

// 清空回收站
export function deleteRecycle(data) {
    return request({
        url: "/recyle/delete",
        method: "delete",
        data
    });
}

// 还原文件
export function restoreFile(data) {
    return request({
        url: "/recyle/recover",
        method: "post",
        data
    });
}

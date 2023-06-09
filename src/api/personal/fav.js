import request from "@/utils/request";

// 收藏列表
export function getFavList(params) {
    return request({
        url: "/favorite/data",
        method: "get",
        params
    });
}

// 取消收藏
export function cancelFav(data) {
    return request({
        url: "/favorite/unCollect",
        method: "put",
        // data
        params: data
    });
}

// 收藏文件
export function favFile(data) {
    return request({
        url: "/favorite/collect",
        method: "put",
        // data,
        params: data,
        // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
}

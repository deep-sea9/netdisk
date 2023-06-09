import request from "@/utils/request";

// 收藏列表
export function getRecentlyList(params) {
    return request({
        url: "/visit/data",
        method: "get",
        params
    });
}

import request from "@/utils/request";


/*
* 获取群组网盘列表
*
* pageNo: 页码
* pageSize：页大小
* userName：用户名称
* */
export function getPersonalDiskList(params) {
    return request({
        url: "/perdisk/pageDisk",
        method: "get",
        params
    });
}

/*
* 修改个人网盘最大空间
*
* diskIds: 网盘id
* space：空间大小
* */
export function modifyDiskSize(data) {
    return request({
        url: "/perdisk/changeSpace",
        method: "put",
        data
    });
}

/*
* 获取群组网盘列表
*
* pageNo: 页码
* pageSize：页大小
* userName：用户名称
* */
export function getPersonalDiskListOfOrgan(params) {
    return request({
        url: "/system/listPersonalDiskByOrganId",
        method: "get",
        params
    });
}

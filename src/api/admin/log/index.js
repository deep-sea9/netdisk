import request from "@/utils/request";


/*
* 获取模块列表
* parentCode: string
* */
export function getLogModule(params) {
    return request({
        url: "/log/listModule",
        method: "get",
        params
    });
}

/*
* 获取日志列表
*
* pageNo: 页码(require)
* pageSize：页大小(require)
* operatorName：操作员名称
* diskType：系统模块
* beginDate：开始日期
* endDate：结束日期
* module：string(require)
* */
export function getLogList(data) {
    return request({
        url: "/log/data",
        method: 'post',
        data
    });
}

/*
* 删除日志
*
* ids: string(require)
* */
export function delLog(data) {
    return request({
        url: "/log/delete",
        method: "delete",
        data
    });
}

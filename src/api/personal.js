
import {get} from "../utils/request";
/**
 * 各类型列表
 *
 * @param code 查询列表（0文档 1图片 2视频 3音频 4压缩文件）
 * @param pageNo   当前页
 * @param pageSize 每页展示的数量
 * @param keyword 关键字
 * @param sortName 排序字段
 * @param isAsc 是否正序
 * @return
 */
export const fileListAll = (code = 0,pageNo = 1, pageSize= 10, keyword, sortName, isAsc) => {
    return get(`/files/query`, {code, pageNo, pageSize, keyword, sortName, isAsc})
};

/**
 * 视频预览
 *
 * @param resourceId   资源Id
 * @return
 */
export const previewVideo = (resourceId) => {
    return get(`/preview/video`, {resourceId})
};

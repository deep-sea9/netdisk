
import {get} from "../../utils/request";
/**
 * 各类型列表
 *
 * @param diskId 查询列表（1个人网盘 2公共网盘 4群组网盘 8他人共享）
 * @param id 文件夹id
 * @param pageNo   当前页
 * @param pageSize 每页展示的数量
 * @param createUserId 上传者Id
 * @return
 */
export const fileListAll = (diskId, id, pageNo = 1, pageSize= 10, createUserId, sortName, isAsc) => {
    return get(`/files/query`, {diskId, id, pageNo, pageSize, createUserId, sortName, isAsc})
};

/**
 * 各类型列表
 *
 * @param code 查询列表（0文档 1图片 2视频 3音频 4压缩文件）
 * @param pageNo   当前页
 * @param pageSize 每页展示的数量
 * @param diskId 网盘Id
 * @return
 */
export const typeFileList = (code = 0,pageNo = 1, pageSize= 10, diskId, sortName, isAsc) => {
    return get(`/files/query`, {code, pageNo, pageSize, diskId, sortName, isAsc})
};

/**
 * 公共网盘列表
 *
 * @return
 */
export const getDiskList = () => {
    return get(`/pubdisk/disk/diskQuery`)
};

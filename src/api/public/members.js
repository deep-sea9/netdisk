
import {get} from "../../utils/request";

/**
 * 公共网盘成员
 *
 * @param diskId 查询列表（1个人网盘 2公共网盘 4群组网盘 8他人共享）
 * @return
 */
export const getDiskMembers = params => {
    return get(`/pubdisk/disk/memberQuery`, params)
};

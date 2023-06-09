
import {get} from "../../utils/request";

/**
 * 群组网盘成员
 *
 * @return
 * @param params
 */
export const getDiskMembers = params => {
    return get(`/grodisk/disk/memberQuery`, params)
};

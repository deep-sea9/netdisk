export const fileListAll = () => {
    return {
        code: 200,
        data: new Array(10).fill(0).map(() => {
            return {
                id: Math.random() * 10000,
                name: "新建文档.doc",
                modifyTime: "2021-11-04 19:09:21",
                size: "32.06M",
            };
        })
    }
};

export const fileListDocument = () => {
    return {
        code: 200,
        data: new Array(10).fill(0).map(() => {
            return {
                id: Math.random() * 10000,
                name: "新建文档.doc",
                modifyTime: "2021-11-04 19:09:21",
                size: "32.06M",
            };
        })
    }
}

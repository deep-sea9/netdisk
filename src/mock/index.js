/*eslint-disable*/
const Mock = require("mockjs")

import { fileListAll, fileListDocument } from "./file"

Mock.mock("/api/file/list/all", "post", fileListAll)
Mock.mock("/api/file/list/document", "post", fileListDocument)
Mock.mock("/api/file/limit", "post", () => {
    return {
        code: 200,
        data: []
    }
})

import axios from "axios"
import { Message, MessageBox } from 'element-ui'
import store from '@/store'
import router from '@/router/index.js'
import { getRawType } from "@/utils/index";

const baseURL = process.env["VUE_APP_BASE_URL"]
const request = axios.create({
    // baseURL: process.env["NODE_ENV"] === 'development'? '/api' : baseURL,
    // baseURL: '/ndk_apis',
    baseURL: baseURL,
    timeout: 50000
})

request.interceptors.request.use(
    config => {
        // do something before request is sent

        if (store.getters.token) {
            // let each request carry token
            // ['X-Token'] is a custom headers key
            // please modify it according to the actual situation
            config.headers['token'] = store.getters.token
        }
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

request.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    async response => {
        const res = response.data

        // if(response.config.download || res.token) {
        //     return res
        // }

        if(response.config.downloadFile || response.config.download) {
            let FR = new FileReader()

            const p = new Promise((resolve, reject) => {

                // 回来的直接是个对象的话证明接口有报错返回值
                if(getRawType(res) === 'object') {
                    resolve(res)
                }

                FR.onload = function () {
                    try {
                        const result = JSON.parse(this.result)

                        // JSON.parse可以直接parse 纯数字字符串或纯数字类型
                        if(typeof result === 'number') {
                            reject(result)
                            return
                        }
                        // 处理文本内容是json字符串
                        if(getRawType(result) === 'object') {
                            reject(result)
                            return
                        }

                        resolve(result)

                    }catch (e) {
                        reject(e)
                    }
                }

                FR.readAsText(res)
            })

            try {
                const result = await p
                Message({
                    message: result.message || result.msg || 'Error',
                    type: 'error',
                    duration: 3 * 1000,
                })
                return Promise.reject(result)
            }catch (e) {
                if(response.config.download) {
                    return res
                }
                return response
            }

        }

        // if the custom code is not 20000, it is judged as an error.
        if (res.code !== 200) {

            //  205: Token expired;
            if (res.code === 205) {
                // to re-login
                MessageBox.confirm('你已被登出, 你可以取消以留在这个页面, 或者重新登录', '登录失效', {
                    confirmButtonText: '重新登录',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    console.log(router.currentRoute);
                    router.push({
                        path: '/login',
                        query: { redirect: router.currentRoute.query.redirect }
                    })
                })
            }else {
                Message({
                    message: res.message || res.msg || 'Error',
                    type: 'error',
                    duration: 3 * 1000
                })
            }
            return Promise.reject(res)
        } else {
            return res
        }
    },
    error => {
        console.log(error, error.response, error.code);
        const { response } = error
        // const errData = error.response.data
        Message({
            message: response? (response.data.msg || response.data.message) : error || '网络错误',
            type: 'error',
            duration: 3 * 1000
        })
        return Promise.reject(error)
    }
)
export default request


export const post = (url, data = {}) => {
    return request({
        url,
        data,
        method: "post",
    });
};

export const get = (url, params = {}) => {
    return request({
        url,
        params,
        method: "get"
    });
};




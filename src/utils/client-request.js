const axios = require('axios')
// const serverHost = require('./constantly')

const request = axios.create({
    baseURL: process.env["VUE_APP_BASE_URL"],
    timeout: 50000
})

request.interceptors.request.use(
    config => {
        // do something before request is sent
        console.log('req config', JSON.stringify(config.headers));
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
    response => {
        const res = response.data


        // if the custom code is not 20000, it is judged as an error.
        if (res.code) {

            if(res.code === 200) {
                return res
            }

            //  205: Token expired;
            if (res.code === 205) {
                // to re-login
                console.log('login failed')
            }else {
                return Promise.reject(new Error(res.message))
            }

        } else {
            if(response.config.download) {
                return res
            }
        }
    },
    error => {
        // const errData = error.response.data
        console.log('cant connet ', error);
        return Promise.reject(error)
    }
)
module.exports = request



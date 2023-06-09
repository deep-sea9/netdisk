import router from './router'
import store from './store'
import { Message, MessageBox } from 'element-ui'
import qs from 'qs'
import { getDiskConfig } from '@/api/common.js'

const whiteList = ['/login']

const removeSpinner = () => {
    const spinner = document.getElementById('loading-a')
    if(spinner) {
        document.body.removeChild(spinner)
    }
}

const changeLoadingText = (msg = "oh!登录失败咯，刷新重试一下") => {
    const loadingText = document.getElementById('loading-text')
    loadingText && (loadingText.innerText = msg + ' 或可以尝试联系管理员(具体可咨询组织领导)')
}

router.beforeEach(async (to, from, next) => {

    // determine whether the user has logged in
    // const hasUserId = getUserId()
    const hasUserId = store.getters.userId
    // console.log(hasUserId, to.path, store.getters.adminPublicRoutes);

    if (hasUserId) {

        switch (to.path) {
            case '/public':
                // store.getters.firstHasChildOfPublicRoute !== undefined && store.getters.firstHasChildOfPublicRoute.id? next(`/public/${store.getters.publicMenus[0].id}/all`): next()
                store.getters.firstHasChildOfPublicRoute !== undefined? next(store.getters.firstHasChildOfPublicRoute.path): next()
                // next(`/public/${store.getters.publicMenus[0].id}/all`)
                break;
            case '/admin/public':
                // store.getters.firstHasChildOfPublicRoute !== undefined && store.getters.firstHasChildOfPublicRoute.id? next(`/admin/public/${store.getters.publicMenus[0].id}`): next()
                store.getters.adminPublicRoutes.length > 0? next(`${store.getters.adminPublicRoutes[0].path}`): next()
                // next(`/admin/public/${store.getters.publicMenus[0].id}`);
                break;
            case '/group':
                store.getters.firstHasChildOfGroupRoute? next(store.getters.firstHasChildOfGroupRoute.redirect): next()
                break;
            case '/group/member-uphold':
                store.getters.firstHasChildOfGroupUpholdRoute? next(store.getters.firstHasChildOfGroupUpholdRoute.redirect): next()
                break;

            case '/admin/logs':
                next(store.getters.logRoutes[0].path)
                break;

            default:
                next()
        }

        removeSpinner()

    } else {
        /* has no token*/

        if (whiteList.indexOf(to.path) !== -1) {
            // in the free login whitelist, go directly
            next()
        } else {
            // next(`/login?redirect=${to.path}`)
            const queryStringMap = qs.parse(window.location.href.split('?')[1])
            const qsKeys = Object.keys(queryStringMap)
            if(qsKeys.indexOf('ticket') > -1) {
                store.dispatch('login', {ticket: queryStringMap['ticket']}).then(res => {
                    if(!res) {
                        console.log(res);
                        Message.error('登录失败')
                        changeLoadingText()
                    }else {
                        // Message.success(res.msg || '登录成功！')
                        getUserInfo().then(() => {
                            // next()
                            store.dispatch('system/getSysConfig')
                            // store.dispatch('getInfo')
                            toNext(to, next)
                        })
                    }
                }).catch(err => {
                    const { response } = err
                    if(response && response.status === 401) {
                        changeLoadingText(response.data.message + ' （OA认证失败，请联系负责OA人员）')
                        return
                    }
                    changeLoadingText(( response && response.data.message ) || err.message)
                })
            }else if(qsKeys.indexOf('access_token') > -1) {
                store.dispatch('login', {access_token: queryStringMap['access_token']}).then(res => {
                    if(!res) {
                        Message.error('Has Error')
                        changeLoadingText()
                    }else {
                        // Message.success(res.msg || '登录成功！')
                        getUserInfo().then(() => {
                            // next()
                            store.dispatch('system/getSysConfig')
                            // store.dispatch('getInfo')
                            toNext(to, next)
                        })
                    }
                }).catch(err => {
                    const { response } = err
                    changeLoadingText(( response && response.data.message ) || err.message)
                })
            }else {
                try {
                    await getUserInfo()
                    toNext(to, next)
                }catch (e) {
                    getDiskConfig().then(res => {
                        const alone_login = res.data.find(config => config.code === 'alone_login')
                        const theme_config = res.data.find(config => config.code === 'sys_color')
                        if(alone_login.value == 1) {
                            store.commit('system/SET_THEME_VALUE', theme_config.value)
                            next(`/login?redirect=${to.path}`)
                        }else {
                            const cas_login_url = res.data.find(config => config.code === 'cas_login_url')
                            const currentHref = window.location.href
                            window.location.href = `${cas_login_url.value}?service=${currentHref}`
                        }
                    })
                    Message.error(e.message || e.msg || '获取用户信息失败')
                }

            }

        }
    }
})

router.afterEach(() => {
    removeSpinner()
})

function getUserInfo(){
    return new Promise((resolve, reject) => {
        store.dispatch('getInfo').then(res => {
            resolve(res)
        }).catch(error => reject(error))
    })

}

function toNext(to, next) {
    if(to.path.indexOf('public') > -1) {
        if(to.path === '/public') {
            next(`/public/${store.getters.publicMenus[0].id}/all`)
        }else if(to.path === '/admin/public') {
            next(`/admin/public/${store.getters.publicMenus[0].id}`)
        }else {
            next()
        }
    }else {
        next()
    }
    removeSpinner()
    navigator.clipboard && navigator.clipboard.readText().then(res => {
        console.log(res);
        if(res.indexOf('/other-link-share') > -1) {
            MessageBox.confirm('从剪切板读取到网盘分享链接，是否前往查看分享内容？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '忽略',
                type: 'info'
            }).then(() => {
                window.location.href = res
            })
        }else {
            console.log(res);
        }
    }).catch(err => {
        console.log('读取剪切板失败,', err);
    })
}

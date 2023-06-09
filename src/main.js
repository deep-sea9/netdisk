import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import Base from '@/components/Base'
import SvgIcon from '@/components/Custom/SvgIcon'
import 'driver.js/dist/driver.min.css'


import NetilerUI from '@leadal/netiler-ui'
import '@leadal/netiler-ui/dist/netilerui.min.css'

// import Contextmenu from 'vue-contextmenujs'
import ElementUI from 'element-ui'
import '@/assets/scss/element-variables.scss'

import 'mf-icos'
import '@/assets/fonts/index.css'

import VueAgile from 'vue-agile'

import VueVideoPlayer from 'vue-video-player'
window.videojs = VueVideoPlayer.videojs
import 'video.js/dist/video-js.css'
require('video.js/dist/lang/zh-CN.js')


Vue.config.productionTip = false
Vue.config.performance = process.env.NODE_ENV !== 'production'
import contextmenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'
// import "./mock/index"

import '@/icons/index.js'

import Theme from 'theme-vue'
const th = new Theme()

store.commit('system/SET_THEME_INSTANCE', th)

th.changeTheme('#06a7ff')

Vue.prototype.$_th = th

Vue.component('z-svg-icon', SvgIcon)

Vue.use(Base)
    .use(ElementUI)
    .use(contextmenu)
    .use(VueAgile)
    .use(VueVideoPlayer)
    .use(NetilerUI)

const $confirm = Vue.prototype.$confirm

import './login_permission'

Vue.prototype.$confirm = (message, title = '提示', type = 'warning', center = false) => {
    return new Promise(resolve => {
        $confirm(message, title, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type,
            center,
        })
            .then(() => resolve(true))
            .catch(() => resolve(false))
    })
}

Vue.prototype.$_EB = new Vue()

store.commit('app/SET_IS_GRID', JSON.parse(localStorage.getItem('isGrid')))
store.commit('app/SET_GLOBAL_GRID', JSON.parse(localStorage.getItem('isGridOfGlobal')))
store.commit('app/SET_PUBLIC_AND_GROUP_IS_GRID', JSON.parse(localStorage.getItem('publicAndGroupIsGrid')))
store.commit('app/SET_GLOBAL_PAGE_SIZE', parseInt(localStorage.getItem('globalPageSize') || 50))
localStorage.getItem('default-sort') && store.commit('app/SET_FILE_DEFAULT_SORT', JSON.parse(localStorage.getItem('default-sort')))

const rootInstance = new Vue({
    router,
    store,
    render: h => h(App),
})
rootInstance.$mount('#app')
rootInstance.$_EB.$on('update-space', () => {
    store.dispatch('updatePersonalSpaceInfo')
    store.dispatch('updateGroupMenus')
    store.dispatch('updatePublicMenus')
})

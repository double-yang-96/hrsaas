// 权限拦截在路由跳转 导航守卫

import router from '@/router'
import store from '@/store'
import nprogress from 'nprogress' // 引入进度条
import 'nprogress/nprogress.css'

//定义白名单
const whiteList = ['/login', '404']
// 前置守卫
// next 必须执行
// next() 放过
// next(false) 跳转终止
// next(地址) 跳转到某个地址
router.beforeEach(async (to, from, next) => {
    nprogress.start()// 开启进度条
    if (store.getters.token) {
        // 如果有token
        if (to.path === '/login') {
            // 如果访问的是登录页
            next('/')// 跳到主页
        } else {
            // 如果当前vuex中有用户资料的id 表示已经有用户资料 不需要再获取
            if (!store.getters.userId) {
                // 如果没有id这个值 才会调用 vuex的获取资料的action
                await store.dispatch('user/getUserInfo')
                // 为什么要写await 因为我们想获取完资料再去放行
            }
            next()
        }
    } else {
        // 如果没有token
        if (whiteList.indexOf(to.path) > -1) {
            // 要去的地址在白名单内
            next()
        } else {
            next('/login')
        }
    }
    nprogress.done()// 手动强制关闭一次
})
// 后置守卫
router.afterEach(() => {
    nprogress.done()// 关闭进度条
})
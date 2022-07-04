import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import router from '@/router'

import { getTimeStamp } from '@/utils/auth'
const TimeOut = 3600 // 定义超时时间

// 创建一个 service 实例
const service = axios.create({
    // 如果执行 npm run dev  值为 /api
    // '/api' 触发跨域代理
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: 5000 // 设置超时时间
})

// 请求拦截器
// 两个参数是回调函数，一个成功，一个失败
service.interceptors.request.use(config => {
    // config 是请求的配置信息
    // 注入token
    if (store.getters.token) {
        // 检查时间戳是否超时
        if (IsCheckTimeOut()) {
            // 表示过期
            // 登出
            store.dispatch('user/logout')
            // 跳转登录页
            router.push('/login')
            return Promise.reject(new Error('token超时了'))
        }
        config.headers['Authorization'] = `Bearer ${store.getters.token}`
    }
    return config
}, error => {
    return Promise.reject(error)
})

// 响应拦截器
// 两个参数是回调函数，一个成功，一个失败
service.interceptors.response.use(response => {
    // axios 默认加了一层data
    const { success, message, data } = response.data
    // console.log(response.data);
    if (success) {
        return data
    } else {
        // 业务已经错误 进入catch 如何进入catch Promise.reject
        Message.error(message)// 提示错误消息
        return Promise.reject(new Error(message))
    }
}, error => {
    if (error.response && error.response.data && error.response.data.code === 10002) {
        // 当等于10002时 表示后端提示token超时
        store.dispatch('user/logout')
        router.push('/login')
    } else {
        Message.error(error.message)// 提示错误信息
    }
    return Promise.reject(error)// 返回执行错误 让当前的执行链跳出成功 直接进入 catch
})

//是否超时
function IsCheckTimeOut() {
    var currentTime = Date.now() // 当前时间戳
    var timestamp = getTimeStamp()  // 缓存时间戳
    return (currentTime - timestamp) / 1000 > TimeOut

}

// 导出 service 实例
export default service

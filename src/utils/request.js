import axios from 'axios'
// 创建一个 service 实例
const service = axios.create()

// 请求拦截器
service.interceptors.request.use()

// 响应拦截器
service.interceptors.response.use()

// 导出 service 实例
export default service

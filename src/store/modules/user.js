import { getToken, setToken, removeToken, setTimeStamp, getTimeStamp } from "@/utils/auth"
import { login, getUserInfo, getUserDetailById } from '@/api/user'
// 状态
const state = {
  token: getToken(),  // 设置token为共享状态 一初始化vuex时候 就先从缓存中读取
  userInfo: {} // 定义一个空对象
}
// 修改状态
const mutations = {
  // 创建一个mutation方法setToken
  setToken(state, token) {
    state.token = token // 将数据设置给vuex
    // 调用setToken方法 同步给缓存
    setToken(token)
  },
  // 创建一个removeToken的mutation方法
  removeToken(state) {
    state.token = null
    // 调用removeToken方法 同步给缓存
    removeToken()
  },
  setUserInfo(state, userInfo) {
    // 更新一个对象
    state.userInfo = { ...userInfo }
  },
  removeUserInfo(state) {
    state.userInfo = {}
  }
}
const actions = {
  // 外面是action方法，里面是调用api接口
  async login(context, data) {
    // 调用接口，返回promise对象，用async/await
    const result = await login(data)
    context.commit('setToken', result)

    setTimeStamp()// 设置当前时间戳
  },

  // 获取用户资料action
  async getUserInfo(context) {
    const result = await getUserInfo()  // 获取返回值
    // 获取用户详情
    const baseInfo = await getUserDetailById(result.userId)
    context.commit('setUserInfo', { ...result, ...baseInfo }) // 将整个的个人信息设置到用户的vuex数据中
    return result
  },

  // 登出操作
  logout(context) {
    // 删除token
    context.commit('removeToken') // 不仅删除了vuex中的 还删除了缓存中的
    // 删除用户资料
    context.commit('removeUserInfo')
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}

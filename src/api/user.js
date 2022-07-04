import request from '@/utils/request'
/**
 * 封装单独的登录接口
*/
export function login(data) {
    return request({
        url: '/sys/login',
        method: 'POST',
        data
    })
}

export function getInfo(token) {
}
/**
 * 获取用户基本资料接口
*/
export function getUserInfo() {
    return request({
        url: '/sys/profile',
        method: 'POST',
    })
}
/**
 * 获取用户基本信息 为了显示头像
 */
export function getUserDetailById(id) {
    return request({
        url: `/sys/user/${id}`,
        method: 'GET'
    })
}

export function logout() {

}

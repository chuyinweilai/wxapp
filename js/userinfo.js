const app = getApp()
var util = require('../utils/util.js');
var time = util.formatTime(new Date())

//获取用户信息，并且更新网站数据
function getUserInfo(e) {
  if (e.detail.userInfo) {
    app.globalData.userInfo = e.detail.userInfo
    app.globalData.hasUserInfo = true
    getTaoraiseID(e.detail.userInfo)
    return e.detail.userInfo
  }
}
//已授权，存储用户信息
function setUserInfo(e) {
  app.globalData.userInfo = e
  getTaoraiseID(e)
}
//获取taoraiseid
function getTaoraiseID(e) {
  if(app.globalData.taoraiseid == ''){
    if (app.globalData.wxopenid != '') {
      wx.request({
        url: app.globalData.requestUrl + 'customer/UpdateUserInfo.aspx',
        data: {
          licence: app.globalData.requestLicence,
          openid: app.globalData.wxopenid,
          nickName: e.nickName,
          headUrl: e.avatarUrl,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (result) {
          app.globalData.taoraiseid = result.data.taoraiseid
          app.globalData.taouserInfo = result.data
          app.globalData.finishGetUser = 'got'
          //根据用户手机信息，设置手机号授权窗
          if (app.globalData.taouserInfo.phone != '') {
            app.globalData.hasUserPhone = 'true'
          } else {
            app.globalData.hasUserPhone = 'false'
          }
        }
      })
    } else {//防止在没有获取到openid的情况下，请求taoraiseid
      setTimeout(function () {
        getTaoraiseID(e)
      }, 200)//间隔0.2秒
    }
  }
}

module.exports = {
  getUserInfo: getUserInfo,
  setUserInfo: setUserInfo,
}
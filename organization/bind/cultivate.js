// organization/bind/cultivate.js
const app = getApp()
var util = require('../../utils/util.js');
var jsuserinfo = require('../../js/userinfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    phone: '',
    organization: '',
    //登录获取用户信息data组
    userInfo: {},        
    hasUserInfo: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  //ascx/head,顶部两个按钮方法
  ReturnHome: function () {
    getApp().ReturnHome()
  },
  ReturnBack: function () {
    getApp().ReturnBack()
  },
  //授权弹窗方法组，onload启动方法this.resetUserInfo()
  //如果需要确认授权状态再进行请求数据的话
  //jsuserinfo.setUserInfo的方法会设置finishiGetUser，所以无需在调用这个方法的情况设置finishiGetUser
  bindGetUserInfo(e) {//授权弹窗点击授权后
    var that = this
    if (e.detail.userInfo) {
      var thisUserinfo = jsuserinfo.getUserInfo(e);
      that.setDataForUser(thisUserinfo);
    }
  },
  resetUserInfo(e) {
    var that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {// 已经授权
          wx.getUserInfo({
            success: res => {
              jsuserinfo.setUserInfo(res.userInfo);
              that.setDataForUser(res.userInfo);
            }
          })
        } else {//没有授权弹出授权窗口
          //授权状态结束
          this.setData({
            hasUserInfo: false,
          })
        }
      }
    })
  },
  setDataForUser(e) {
    this.setData({
      userInfo: e,
      hasUserInfo: true
    })
  },

  // 输入框输入方法组
  inputValue: function(e){
    var thisinput = e.currentTarget.dataset.input
    this.setData({
      [thisinput]: e.detail.value
    })
  },
  postBind: function(){
    wx.showLoading({
      title: '提交申请中……',
    })
    var that = this
    wx.request({
      url: getApp().globalData.requestUrl + 'ashx/getPostBind.ashx',
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: util.json2Form({
        licence: app.globalData.requestLicence,
        wxopenid: app.globalData.wxopenid,
        name: that.data.name,
        phone: that.data.phone,
        organization: that.data.organization
      }),
      success: function (result) {
        wx.navigateTo({
          url: 'success',
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ fillHeight: app.globalData.fillHeight })
    var that = this
    //登录授权方法
    that.resetUserInfo(options)
    //判断手机型号，加载填充view
    if (getApp().globalData.isIphoneX != '') {
      that.setData({
        isIphoneX: getApp().globalData.isIphoneX,
      })
    }
    that.requestDataForPage()
  },

  // 验证该用户是否已经绑定过机构
  requestDataForPage: function () {
    var that = this
    if (app.globalData.wxopenid != '') {
      wx.request({
        url: app.globalData.requestUrl + 'organization/bind/cultivate.aspx',
        data: {
          licence: app.globalData.requestLicence,
          wxopenid: app.globalData.wxopenid,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (result) {
          if (result.data == 'Y') {
            wx.showModal({
              title: '您已绑定过机构',
              content: '将会跳转至订单生成页面！',
              showCancel: false,
              success(res){
                if (res.confirm){
                  wx.navigateTo({
                    url: '../../order/cultivate/generate',
                  })
                }
              }
            })
          }
        }
      })
    } else {
      setTimeout(function () { that.requestDataForPage() }, 300)
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数inputValue--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
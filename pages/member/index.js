// pages/member/index.js
var app = getApp()
var jsuserinfo = require('../../js/userinfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: 'mc',
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
  //ascx/foot,底部导航方法
  navto: function (e) {
    getApp().navto(e)
  },

  //授权弹窗方法组，onload启动方法this.resetUserInfo()
  bindGetUserInfo(e) {//授权弹窗点击授权后
    if (e.detail.userInfo) {
      var thisUserinfo = jsuserinfo.getUserInfo(e);
      this.setDataForUser(thisUserinfo)
    }
  },
  resetUserInfo() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {// 已经授权
          wx.getUserInfo({
            success: res => {
              jsuserinfo.setUserInfo(res.userInfo)
              this.setDataForUser(res.userInfo)
            }
          })
        } else {//点击取消，再次弹出授权窗口，直至授权
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
      hasUserInfo: true,
    })
  },

  selectNav: function (e){
    this.setData({ nav: e.currentTarget.dataset.nav })
  },
  turnToDetail: function (e){
    var nav = ''
    if(e.currentTarget.dataset.nav == '1'){
      nav = '../institution/details?insid='
    } else if (e.currentTarget.dataset.nav == '3'){
      nav = '../cultivate/details?culid='
    } else if (e.currentTarget.dataset.nav == 'order') {
      nav = '../orderdetail/detail?orderid='
    } else{
      nav = '../institution/teacher?teacherid='
    }
    wx.navigateTo({
      url: nav + e.currentTarget.dataset.objid,
    })
  },
  turnToQuestion: function(e){
    wx.navigateTo({
      url: '../qa/detail?qaid=' + e.currentTarget.dataset.qaid,
    })
  },
  confirmagreement: function(e){
    if (this.data.member) {
      wx.showModal({
        title: '您已提交过申请',
        content: '我们将尽快进行审核……',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            
          }
        }
      })
    }else{
      wx.navigateTo({
        url: '../agreement/apply',
      })
    }
  },
  selectOrder: function (e) {
    wx.navigateTo({
      url: nav + e.currentTarget.dataset.objid,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.resetUserInfo()
    this.requestDataForPage()
  },

  requestDataForPage: function (){
    var that = this
    if(app.globalData.taoraiseid != ''){
      wx.showLoading({
        title: '加载中……',
      })
      wx.request({
        url: app.globalData.requestUrl + 'response/member/index.aspx',
        data: {
          licence: app.globalData.requestLicence,
          taoraiseid: app.globalData.taoraiseid,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (result) {
          console.log("success", result)
          that.setDataForPage({
            collectlist: [],
            orderlist: [],
            qalist: [],
            member:'',
          })
          // that.setDataForPage(result.data)
        },
        fail: function(res){
          console.log("fail", res)
        }
      })
    }else{
      setTimeout(function(){ that.requestDataForPage() },300)
    }
  },
  setDataForPage: function(e){
    this.setData({
      collectlist: e.collectlist,
      orderlist: e.orderlist,
      qalist: e.qalist,
      member: '',
    })
    if (e.member.length > 0) {
      this.setData({
        member: e.member[0],
      })
    }
    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    setTimeout(function () {
      that.setData({ fillHeight: app.globalData.fillHeight })
      //判断手机型号，加载填充view，noslogon的css
      if (getApp().globalData.isIphoneX != '') {
        that.setData({
          isIphoneX: getApp().globalData.isIphoneX,
          isIphoneXandNoslogonHeight: true,
        })
      }
    }, 600)
    that.requestDataForPage()
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
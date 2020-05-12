// pages/institution/teacher.js
const app = getApp()
var checkdatatime = require('../../js/checkdatatime.js');
var WxParse = require('../../wxParse/wxParse.js');
var util = require('../../utils/util.js');
var jsuserinfo = require('../../js/userinfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    resumeList:[],
    //登录获取用户信息data组
    userInfo: {},
    hasUserInfo: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserPhone: app.globalData.hasUserPhone,
  },

  //ascx/head,顶部两个按钮方法
  ReturnHome: function(){
    getApp().ReturnHome()
  },
  ReturnBack: function(){
    getApp().ReturnBack()
  },
  //ascx/foot,底部导航方法
  navto: function (e) {
    getApp().navto(e)
  },
  clickCollect: function (e) {
    var that = this
    if (app.globalData.finishGetUser != 'got'){
      wx.showModal({
        title: '请先授权',
        content: '您需要先授权，才可点击收藏按钮，并在个人中心中找到这些收藏。',
        success: function (res) {
          if (res.confirm) {
            that.setData({ hasUserInfo: false })//如果没有获得taoraiseid，弹出授权框
          }
        }
      })
    }else{
      var collectvalue = this.data.teacher.Collect
      if (collectvalue == 'Y') {
        collectvalue = '0'//代表收藏变成未收藏
      } else {
        collectvalue = '1'//代表未收藏变成收藏
      }
      getApp().clickCollect('teacher', that.data.teacher.ID, collectvalue)
      that.requestDataAgainToSet(collectvalue)
    }
  },
  //咨询小管家
  handleContact: function (e) {
    app.HandleContact(e)
  },

  //授权弹窗方法组，onload启动方法this.resetUserInfo()
  //如果需要确认授权状态再进行请求数据的话
  //jsuserinfo.setUserInfo的方法会设置finishiGetUser，所以无需在调用这个方法的情况设置finishiGetUser
  bindGetUserInfo(e) {//授权弹窗点击授权后
    var that = this
    if (e.detail.userInfo) {
      var thisUserinfo = jsuserinfo.getUserInfo(e);
      that.setDataForUser(thisUserinfo);
      that.requestDataAgain(that.data, 'got');//点击授权，特殊情况，让request必须等到jsuserinfo设置完
      that.checkUserPhone()//处理手机号授权
    } else {
      that.setData({ hasUserInfo: true })
      app.globalData.finishGetUser = 'finish'
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
              that.requestDataAgain(e, 'got');//默认已授权，再请求collect
            }
          })
          that.checkUserPhone()//处理手机号授权
        } else {//没有授权弹出授权窗口
          //授权状态结束
          this.setData({
            hasUserInfo: false,
            hasUserPhone: false,//没有授权时，同时弹出手机授权窗
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
  //手机号授权窗口
  checkUserPhone() {
    var that = this
    var hasuserphone = app.globalData.hasUserPhone
    if (hasuserphone != 'notsure') {
      that.setData({ hasUserPhone: hasuserphone })
    } else {
      setTimeout(function () {
        that.checkUserPhone()
      }, 300)//间隔0.3秒
    }
  },
  resetGetPhone() {
    var that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {// 已经授权
          that.setData({ hasUserPhone: 'false' })
        } else {//没有授权弹出授权窗口
          that.setData({
            hasUserInfo: false,
            hasUserPhone: false,//没有授权时，同时弹出手机授权窗
          })
        }
      }
    })
  },
  getPhoneNumber(e) {
    var that = this
    if (e.detail.iv != undefined) {
      wx.request({
        url: getApp().globalData.requestUrl + 'ashx/getPostPhoneNumber.ashx',
        method: 'post',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: util.json2Form({
          openid: app.globalData.wxopenid,
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData,
        }),
        success: function (result) {
          jsuserinfo.setUserInfo(app.globalData.userInfo);
          that.setData({ hasUserPhone: 'true' })
        }
      })
    } else {
      //未同意授权
      that.setData({ hasUserPhone: 'unauthorized' })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ fillHeight: app.globalData.fillHeight })
    var that = this
    //登录授权方法
    that.resetUserInfo(options)
    that.setData({ teacherid: options.teacherid })
    //判断手机型号，加载填充view
    if (getApp().globalData.isIphoneX != '') {
      this.setData({
        isIphoneX: getApp().globalData.isIphoneX,
      })
    }
    // 获取教师详情
    wx.request({
      url: app.globalData.requestUrl + 'response/institution/teacher.aspx',
      data: {
        teacherid: options.teacherid,
        licence: app.globalData.requestLicence,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        that.setDataForPage(result.data)
      }
    })
  },

  //等待授权状态结束后，更新collect
  requestDataAgain: function (e, status) {
    var that = this
    if (app.globalData.finishGetUser == status) {//如果确认了授权状态
      if (app.globalData.taoraiseid != "") {
        wx.request({
          url: app.globalData.requestUrl + 'response/institution/detail_again.aspx',
          data: {
            licence: app.globalData.requestLicence,
            teacherid: e.teacherid,
            taoraiseid: app.globalData.taoraiseid,
            nav: 'teacher',
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (result) {
            if (result.data == '1') {
              that.requestDataAgainToSet('1')
            }
          }
        })
      }
    } else {
      setTimeout(function () {
        that.requestDataAgain(e, status)
      }, 400)
    }
  },
  //若collect发生了改变
  requestDataAgainToSet: function (e) {
    var that = this
    //更新页面数据appdata
    var setdatachange = 'teacher.Collect'
    var thiscollect = 'N'
    if (e == '1') {
      thiscollect = 'Y'
    }
    that.setData({ [setdatachange]: thiscollect })
  },

  //页面存储数据
  setDataForPage: function (e) {
    console.log(e.teacherdetail[0]);
    this.setData({
      resumeList: e.resumeList[0] || [],
      teacher: e.teacherdetail[0],
    })
    WxParse.wxParse('teacherIntroduceOneself', 'html', e.IntroduceOneself, this, 0);
    WxParse.wxParse('teacherPastExperience', 'html', e.PastExperience, this, 0);
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
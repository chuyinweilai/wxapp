//index.js
//获取应用实例
const app = getApp()
var jsuserinfo = require('../../js/userinfo.js');
var util = require('../../utils/util.js');
var checkdatatime = require('../../js/checkdatatime.js');
var jssearch = require('../../js/search.js');

Page({
  data: {
    searchvalue: '搜索',
    requestUrl: app.globalData.requestUrl,
    qalist: [],
    qalisttype: 'hits',
    //登录获取用户信息data组
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    //轮播data组
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    textUserPhone: false,
    hasUserPhone: true,
    hasUserInfo: true,
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
  //咨询小管家
  handleContact: function (e){
    console.log("咨询")
    // app.HandleContact(e)
  },
  //授权弹窗方法组，onload启动方法this.resetUserInfo()
  //如果需要确认授权状态再进行请求数据的话
  //jsuserinfo.setUserInfo的方法会设置finishiGetUser，所以无需在调用这个方法的情况设置finishiGetUser
  bindGetUserInfo(e) {//授权弹窗点击授权后
    var that = this
    if (e.detail.userInfo) {
      var thisUserinfo = jsuserinfo.getUserInfo(e);
      that.setDataForUser(thisUserinfo);
      that.checkUserPhone()//处理手机号授权
    } else {
      that.setData({ hasUserInfo: true })
      app.globalData.finishGetUser = 'finish'
    }
  },
  resetUserInfo() {
    var that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {// 已经授权
          wx.getUserInfo({
            success: res => {
              jsuserinfo.setUserInfo(res.userInfo)
              that.setDataForUser(res.userInfo)
            }
          })
          that.checkUserPhone() //处理手机号授权
        } else {//没有授权弹出授权窗口
          that.setData({
            userInfo: {}
          })
        }
      }
    })
  },
  //手机号授权窗口
  checkUserPhone() {
    var that = this
    var hasuserphone = app.globalData.hasUserPhone;
    if (hasuserphone != 'notsure') {
      that.setData({
        textUserPhone: true,
        hasUserPhone: hasuserphone
      })
    } else {
      // that.setData({ hasUserPhone: false })
      setTimeout(function () {
        that.checkUserPhone()
      }, 500)//间隔0.3秒
    }
  },
  setDataForUser(e) {
    this.setData({
      userInfo: e,
      hasUserInfo: true
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
          console.log("result", result)
          jsuserinfo.setUserInfo(app.globalData.userInfo);
          that.setData({ 
            textUserPhone: true,
            hasUserPhone: true
          })
        }
      })
    } else {
      //未同意授权
      that.setData({ hasUserPhone: 'unauthorized' })
    }
  },

  gotoNav: function (e){
    const { nav } = e.currentTarget.dataset;
    // const { isIOS } = this.data;
    const isIOS = false;
    if (nav == "pages/cultivate/list") {
      if (isIOS){
        wx.navigateTo({
          url: '/pages/webview/webview?type=yupei',
        })
      } else {
        wx.navigateToMiniProgram({
          appId: 'wx7573ba3998dc26df',
          path: '/pages/index/index',
          envVersion: 'release',
          success(res) {
            // 打开成功
            console.log('miniPro success')
          },
          fail(res) {
            console.log(res)
          }
        })
      }
    } else {
      wx.navigateTo({
        url: '../../' + nav,
      })
    }
  },
  gotoNavSelected: function (e) {
    wx.navigateTo({
      url: '../../' + e.currentTarget.dataset.nav + '&nav=score',
    })
  },

  //根据最新问题的排序条件，设置不同的qalist循环
  setqalist: function (e) {
    var qalistpointtype = e.currentTarget.dataset.listtype
    var qalisttemp = this.data.qalist
    if (qalistpointtype != qalisttemp) {
      if (qalistpointtype == 'hits') {
        qalisttemp = this.data.qalistHits
      } else {
        qalisttemp = this.data.qalistTime
      }
      this.setData({
        qalist: qalisttemp,
        qalisttype: qalistpointtype,
      })
    }
  },

  onLoad: function () {
    const { isIOS, isIphoneX } = app.globalData;
    this.setData({ fillHeight: app.globalData.fillHeight })
    //登录授权方法
    this.resetUserInfo()
    var time = util.formatTime(new Date())
    this.setData({ time, isIOS})
    if (isIphoneX == true){
      this.setData({
        isIphoneX: true
      })
    }
    //校验数据获取时间，超过间隔时间获取一次新的数据
    var nav = ['hotevent', 'inslist', 'cullist', 'qalist']
    var indexdataTime = wx.getStorageSync('indexdatatime')
    if(indexdataTime != null && indexdataTime != ''){
      //如果缓存里有数据，先加载原先的数据
      for (var inav = 0; inav < nav.length; inav++) {
        var thisnavdata = wx.getStorageSync('index-' + nav[inav])
        this.setDataForPage(nav[inav], thisnavdata)
      }
      //判断数据时间是否已经过期
      if (!checkdatatime.countDiffer(time, indexdataTime)) {
        this.requestDataBecauseNoData(nav,time)
      }
    }else{
      this.requestDataBecauseNoData(nav, time)
    }
  },

  requestDataBecauseNoData: function(nav, time){
    for (var inav = 0; inav < nav.length; inav++) {
      this.requestDataForIndex(nav[inav])
    }
    wx.setStorage({
      key: 'indexdatatime',
      data: time,
    })
  },
  requestDataForIndex: function(nav){
    var that = this
    wx.request({
      url: app.globalData.requestUrl + 'response/index/index.aspx',
      data: {
        licence: app.globalData.requestLicence,
        nav: nav,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        that.setDataForPage(nav, result.data)
        wx.setStorage({
          key: 'index-' + nav,
          data: result.data,
        })
      }
    })
  },
  resetGetPhone() {
    var that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {// 已经授权
          that.setData({
            hasUserInfo: true,
            hasUserPhone: true
          })
        } else {//没有授权弹出授权窗口
          that.setData({
            hasUserInfo: false,
            hasUserPhone: false,//没有授权时，同时弹出手机授权窗
          })
        }
      }
    })
  },
  //页面存储数据
  setDataForPage: function (nav, value){
    if (nav == 'hotevent'){
      this.setData({
        hoteventlist: value.hotevent,
      })
    } else if (nav == 'inslist'){
      this.setData({
        inslist: value.inslist,
      })
    } else if (nav == 'cullist'){
      this.setData({
        cullist: value.cullist,
      })
    }else{
      this.setData({
        qalist: value.qalistHits,//默认是根据热度排序
        qalistHits: value.qalistHits,
        qalistTime: value.qalistTime,
      })
    }
  },

  onShow: function () {

  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {

  },

  //搜索按钮方法组
  reset_search(e){
    if(e.detail.value == '搜索'){
      this.setData({
        searchvalue: '',
      })
    }
  },
  check_search(e){
    if (e.detail.value == ''){
      this.setData({
        searchvalue: '搜索',
      })
    }
  },
  bc_search(e){
    if (jssearch.returnSearchResult('index',e.detail.value)){
      wx.navigateTo({
       url: '../search/default?nav=index&value=' + e.detail.value,
      })
    }
  },
})

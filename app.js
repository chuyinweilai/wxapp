//app.js
var util = require('/utils/util.js');

App({
  //head控件的两个按钮
  ReturnHome: function(){
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },
  ReturnBack: function(){
    var pages = getCurrentPages()
    if(pages.length > 1){
      wx.navigateBack({
        delta: 1,
      })
    } else {//如果等于1，代表没有上层页面
      this.ReturnHome()
    }
  },
  SystemCheck: function (){
    wx.getSystemInfo({
      success: (res) => {
        const system = res.system.toLowerCase();
        const isIOS = system.includes('ios')?true: false;
        this.globalData.isIOS = isIOS;
      },
    })
  },
  GetYearRange: function(){
    let years = new Date().getFullYear();
    let yearsRange = [];
    for(let i = 0; i < 10; i++){
      yearsRange.push(years);
      years--;
    }
    this.globalData.yearsRange = yearsRange;
  },
  //foot控件的按钮
  navto: function(e){
    var navTitle = e.currentTarget.dataset.nav
    var navUrl = '/pages/' + e.currentTarget.dataset.nav + '/list'
    if(navTitle == 'member' || navTitle == 'index'){
      navUrl = '/pages/' + e.currentTarget.dataset.nav + '/index'
    }
    wx.navigateTo({
      url: navUrl
    })
  },
  
  clickCollect: function(objnav, objid,value){
    var nav = ''
    if(objnav == 'ins'){
      nav = 1
    }else if (objnav == 'cul'){
      nav = 3
    }else if(objnav == 'teacher'){
      nav = 2
    }
    wx.request({
      url: getApp().globalData.requestUrl + 'ashx/getPostCollect.ashx',
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: util.json2Form({
        licence: getApp().globalData.requestLicence,
        taoraiseid: getApp().globalData.taoraiseid,
        objnav: nav,
        objid: objid,
        value: value,
      }),
      success: function (result) {
        
      }
    })
  },

  //咨询小管家
  HandleContact: function (e) {

  },

  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    this.GetYearRange()
    //检测是否为iphonex或尺寸相符的机型
    wx.getSystemInfo({
      success: res => {
        var mobileheight = 0//计算手机高度，iphoneX为1624
        wx.getSystemInfo({
          success: function (res) {
            let h = 750 * res.windowHeight / res.windowWidth
            mobileheight = h
          }
        })
        //1620作为高度适配的定量
        if (res.model.indexOf('iPhone X') > -1 || mobileheight >= 1480) {
          this.globalData.isIphoneX = true
        } else {
          this.globalData.isIphoneX = false
        }
        // this.globalData.isIphoneX = true
        var menuData = wx.getMenuButtonBoundingClientRect()
        this.globalData.fillHeight = menuData.top + 1 * res.windowWidth / res.windowHeight
        this.globalData.windowHeight = mobileheight
      }
    })

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: this.globalData.requestUrl + 'customer/getOpenID.aspx?licence='+this.globalData.requestLicence+'&code=' + res.code,
          success: res => {
            this.globalData.wxopenid = res.data.openid;
          }
        })
      }
    })
    this.SystemCheck.apply(this)
  },

  globalData: {
    isIphoneX: '',
    isIOS: 'false',
    yearsRange:[],  // 最近的十年范围
    differForTakingDataTime: '1',//间隔分钟数，更新storage
    //timestamp: (new Date()).valueOf(),
    userInfo: null,
    hasUserInfo: 'notsure',//用于判定页面是否需要弹出授权窗口
    finishGetUser: 'notyet',//用于判定小程序是否已确认用户授权状态，notyet/finish
    hasUserPhone: 'notsure',//用于判断是否需要弹出获取手机号窗口
    userPhoneNum: 0,
    wxopenid: '',
    taoraiseid: '',
    taouserInfo: [],//存储网站用户的部分信息，userInfo中没有的
    requestUrl: 'https://testwx.taoraise.com/',
    requestLicence: 'taozhitianxia2019',
    myappid: 'wx5e53c54fb839b923',
    myappsecret: '611bbfe8bb1eca0f0d1eddb91ec938b1',
    myplatformkey: 'Taoraise2017WechatPayTengXun0602',
  }
})
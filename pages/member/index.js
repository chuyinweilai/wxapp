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
    statusList: {
      "unpaid":"未支付",
      "paying":"支付中",
      "confirming":"待确认",
      "success":"成功",
      "closed":"关闭"
    },
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
    });
  },

  selectNav: function (e) {
    this.setData({ nav: e.currentTarget.dataset.nav })
  },
  turnToDetail: function (e){
    var nav = ''
    if(e.currentTarget.dataset.nav == '1'){
      nav = '../institution/details?insid='
    } else if (e.currentTarget.dataset.nav == '3'){
      nav = '../cultivate/details?culid='
    } else if (e.currentTarget.dataset.nav == 'order') {
      nav = '../orderdetail/detail?orderNo='
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
    this.requestDataForOrder()
    this.requestDataForPage()
  },

  // 获取用户订单列表
  requestDataForOrder: function(obj = {page:1, size: 15}, type="new"){
    const that = this;
    const { orderlist } = that.data;
    const mobile = app.globalData.userPhoneNum;
    const { page, size } = obj;
    console.log("mobile", mobile)
    wx.showLoading({
      title: '加载中……',
    })

    wx.request({
      url: app.globalData.requestUrl + 'response/member/test.aspx',
      data: {
        licence: app.globalData.requestLicence,
        page, size,
        mobile,
      },
      // mobile: 18621639139
      // "13817837669"
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        const { dataList = [{}] } = result.data;
        if (!dataList[0]) {
          wx.hideLoading();
          return false
        };
        let new_orderlist = dataList[0].data || [];
        if (type == "add"){
          new_orderlist = orderlist.concat(new_orderlist);
        }
        wx.setStorageSync('oredrResult', new_orderlist);
        console.log("dataList[0]", dataList[0])
        console.log("new_orderlist", new_orderlist)
        that.setData({ oredrResult: dataList[0], orderlist: new_orderlist, })
        wx.hideLoading();
      },
      fail: function (res) {
        wx.hideLoading();
        console.log("fail", res)
      }
    })
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
          wx.hideLoading();
        },
        fail: function (res) {
          wx.hideLoading();
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
  onReachBottom: function (e) {
    const { oredrResult } = this.data;
    let { current_page, last_page } = oredrResult.page;
    if ( current_page < last_page){
      this.requestDataForOrder({
        page: current_page + 1,
        size: 15,
      }, "add" )
    }
  },

  // onPageScroll: function(e){
  //   console.log("onPageScroll------->", e);
  // },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
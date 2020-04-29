// pages/orderdetail/detail.js
var app = getApp()
var jsuserinfo = require('../../js/userinfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // search
    payWay: {
      "none":"自有支付",
      "original_wechat":"平台代收",
      "virtual_coin":"虚拟币支付"
    },
    orderNo:"",
    data: {},
    buyer: {},
    orderitems: {},
  },

  //ascx/head,顶部两个按钮方法
  ReturnHome: function () {
    getApp().ReturnHome()
  },
  ReturnBack: function () {
    getApp().ReturnBack()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ orderNo: options.orderNo })
    this.requestDetailForOrder()
  },

  requestDetailForOrder: function () {
    wx.showLoading({
      title: '加载中……',
    })
    const that = this;
    const { orderNo } = that.data;
    wx.request({
      url: app.globalData.requestUrl + 'response/order/info.aspx',
      data: {
        licence: app.globalData.requestLicence,
        orderNo,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        const data = result.data.dataList[0] || {};
        const orderitems = result.data.dataList[0].orderitems[0] || {};
        const buyer = result.data.dataList[0].buyer || {};
        that.setData({ buyer, data, orderitems });
        wx.hideLoading()
      },
      fail: function (res) {
        console.log("fail", res)
      }
    })
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
    that.requestDetailForOrder()
  },

  // requestDetailForOrder: function () {
  //   var that = this
  //   if (app.globalData.taoraiseid != '') {
  //     wx.showLoading({
  //       title: '加载中……',
  //     })
  //     wx.request({
  //       url: app.globalData.requestUrl + 'response/order/detial.aspx',
  //       data: {
  //         licence: app.globalData.requestLicence,
  //         taoraiseid: app.globalData.taoraiseid,
  //       },
  //       header: {
  //         'content-type': 'application/json'
  //       },
  //       success: function (result) {
  //         that.setDataForPage(result.data)
  //       }
  //     })
  //   } else {
  //     setTimeout(function () { that.requestDetailForOrder() }, 300)
  //   }
  // },
  setDataForPage: function (e) {
    console.log(e)
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
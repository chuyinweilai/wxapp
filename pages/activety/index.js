// pages/acitivity/index.js
const app = getApp()
var util = require('../../utils/util.js');
var checkdatatime = require('../../js/checkdatatime.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    requestUrl: app.globalData.requestUrl,
    listPart: [
      // 人文社会、STEM、艺术音乐、商科、其他综合
      { id: 1, title: "人文社会" },
      { id: 2, title: "STEM" },
      { id: 3, title: "艺术音乐" },
      { id: 4, title: "商科" },
      { id: 5, title: "其他综合" }
    ]
  },
  gotoNav: function (e) {
    wx.navigateTo({
      url: '../../' + e.currentTarget.dataset.nav,
    })
  },
  gotoDetail: function(e){
    // console.log(e);
    // return
    wx.navigateTo({
      url: 'detail?id='+e.currentTarget.dataset.id,
    })
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
  handleContact: function (e) {
    app.HandleContact(e)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '数据加载中……',
    })
    this.setData({ fillHeight: app.globalData.fillHeight })
    if (app.globalData.isIphoneX == true) {
      this.setData({
        isIphoneX: true,
      })
    }
    //校验数据获取时间，超过间隔时间获取一次新的数据
    var time = util.formatTime(new Date())
    that.setData({ time: time })
    var activetydatatime = wx.getStorageSync('activetylistdatatime')
    if (!checkdatatime.countDiffer(time, activetydatatime)) {
      that.requestDataForPage()
    } else {
      var activetydata = wx.getStorageSync('activetylistdata')
      that.setDataForPage(activetydata)
    }
  },

  // 获取活动列表
  requestDataForPage: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrl + 'response/activety/index.aspx',
      data: {
        licence: app.globalData.requestLicence,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        wx.setStorageSync('activetylistdatatime', that.data.time)
        wx.setStorageSync('activetylistdata', result.data)
        that.setDataForPage(result.data)
      }
    })
  },
  //页面存储数据
  setDataForPage: function (e) {
    console.log(e.list)
    this.setData({
      list: e.list
    })
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
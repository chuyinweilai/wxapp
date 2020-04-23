// pages/activity/detail.js
const app = getApp()
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activitydetail: {},
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
    wx.showLoading({
      title: '页面加载中……',
    })
    this.setData({ fillHeight: app.globalData.fillHeight })
    this.requestDetail(options)
  },

  // 获取活动列表
  requestDetail: function (val) {
    var that = this
    wx.request({
      url: app.globalData.requestUrl + 'response/improvementactivity/detail.aspx',
      data: {
        licence: app.globalData.requestLicence,
        id: val.id
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        let { data={} } = result;
        let { activityList } = data;
        activityList = activityList[0] || {};
        let detail = activityList.Detail;
        if (detail) {
          // let detail = data.activityList[0];
          detail = detail.replace(/\t+/g, "");
          detail = detail.replace(/[\r\n]/g, "");
        }
        activityList.Detail = detail;
        that.setData({ activitydetail: activityList || {} })
        wx.hideLoading()
      }
    })
  },
  //小程序里的转义方法
  escape2Html: function (str) {
    var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) { return arrEntities[t]; });
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
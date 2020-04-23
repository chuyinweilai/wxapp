// pages/ranking/index.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    yearObject: [
      {
        id: 2020,
        name: '2020'
      },
      {
        id: 2019,
        name: '2019'
      },
      {
        id: 2018,
        name: '2018'
      }
    ],
    rankData:[],
    region: 0,
    key:""
  },
  previewImg: function (e) {
    var thisurl = 'http://www.taoraise.com/' + e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [thisurl],// 预览图片组的url
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
    this.setData({ fillHeight: app.globalData.fillHeight })
    if (app.globalData.isIphoneX == true) {
      this.setData({
        isIphoneX: true,
      })
    }
    this.getRankData()
  },

  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
    this.getRankData()
  },
  bindSearch: function (e) {
    this.setData({
      key: e.detail.value
    })
  },

  getRankData: function(e) {
    const { key = "", region = "0", yearObject } = this.data;
    const year = yearObject[region].id;
    let that = this;
    wx.request({
      url: getApp().globalData.requestUrl + 'response/data/index.aspx',
      method: 'get',
      header: {
        'content-type': 'application/json'
      },
      data: {
        key,
        licence: app.globalData.requestLicence,
        year,
      },
      success: function (result) {
        const { data = {} } = result;
        const { activityList = [] } = data;
        that.setData({ rankData: activityList[0] || [] })
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
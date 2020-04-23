// pages/acitivity/index.js
const app = getApp()
var util = require('../../utils/util.js');
var checkdatatime = require('../../js/checkdatatime.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activetyList: {},
    activetyType:[],
    requestUrl: app.globalData.requestUrl,
    listPart: []
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
    // wx.showLoading({
    //   title: '数据加载中……',
    // })
    this.setData({ fillHeight: app.globalData.fillHeight })
    if (app.globalData.isIphoneX == true) {
      this.setData({
        isIphoneX: true,
      })
    }

    this.requestDataForType();
    return 
    //校验数据获取时间，超过间隔时间获取一次新的数据
    // var time = util.formatTime(new Date())
    // this.setData({ time: time })
    // var activetydatatime = wx.getStorageSync('activetylistdatatime')
    // if (!checkdatatime.countDiffer(time, activetydatatime)) {
    //   // 获取活动类型列表
    //   this.requestDataForType();
    //   // 获取活动列表
    //   // this.requestDataForPage();
    // } else {
    //   var activetyType = wx.getStorageSync('activetyType')
    //   var activetyList = wx.getStorageSync('activetylistdata')
    //   this.setData({
    //     activetyType: activetyType,
    //     activetyList: activetyList
    //   })
    // }
  },
  gotoNav: function (e) {
    wx.navigateTo({
      url: '../../' + e.currentTarget.dataset.nav,
    })
  },
  gotoDetail: function (e) {
    wx.navigateTo({
      url: 'detail?id=' + e.currentTarget.dataset.id,
    })
  },

  requestDataForType: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrl + 'response/improvementactivity/type.aspx',
      data: {
        licence: app.globalData.requestLicence,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        const {data={}} = result;
        let { typeList=[] } = data;
        typeList = typeList.reverse();
        wx.setStorageSync('activetyType', typeList);
        that.setData({ activetyType: typeList });
        typeList.forEach((val,index) => {
          that.requestDataForPage(val)
        })
      }
    })
  },

  // 获取活动列表
  requestDataForPage: function (val) {
    let { activetyList } = this.data;
    var that = this
    wx.request({
      url: app.globalData.requestUrl + 'response/improvementactivity/index.aspx',
      data: {
        licence: app.globalData.requestLicence,
        id: val.ID
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        let { data = {} } = result;
        let { activityList=[{}] } = data;
        // activetyList[val.ID] = activityList[0].Title ? data.activityList : [];
        activetyList[val.ID] = activityList;
        wx.setStorageSync('activetylistdatatime', that.data.time)
        wx.setStorageSync('activetylistdata', activetyList)
        that.setData({ activetyList })
      }
    })
  },
  //页面存储数据
  // setDataForPage: function (e) {
  //   this.setData({
  //     list: e.list
  //     // list
  //   })
  //   wx.hideLoading()
  // },

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
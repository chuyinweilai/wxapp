// pages/search/default.js
const app = getApp()
var jssearch = require('../../js/search.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchvalue: '搜索',
    //当搜索出的结果不足以撑满高度时，设置最低高度，使背景色铺满屏幕
    miniheight: '',
  },

  //ascx/head,顶部两个按钮方法
  ReturnHome: function () {
    getApp().ReturnHome()
  },
  ReturnBack: function () {
    getApp().ReturnBack()
  },

  searchToPage: function (e){
    var sid = e.currentTarget.dataset.sid
    var stype = e.currentTarget.dataset.stype
    var surl = ''
    if(stype == 'qa'){
      surl = '../qa/detail?qaid=' + sid
    }else if (stype=='ins'){
      surl = '../institution/details?insid=' + sid
    }else if (stype=='cul'){
      surl = '../cultivate/details?culid=' + sid
    }
    wx.navigateTo({
      url: surl,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //判断手机型号，加载填充view
    if (getApp().globalData.isIphoneX != '') {
      that.setData({
        isIphoneX: getApp().globalData.isIphoneX,
        isIphoneXandNoslogonHeight: true,
      })
    }
    //获取最低高度
    wx.getSystemInfo({
      success: function (res) {
        let h = 750 * res.windowHeight / res.windowWidth
        that.setData({
          miniheight: h - 116,
        })
      }
    })
    //获取数据
    that.setDataForPage(options.nav,options.value)
  },

  setDataForPage(nav,value){
    var that = this
    wx.request({
      url: app.globalData.requestUrl + 'response/search/default.aspx',
      data: {
        licence: app.globalData.requestLicence,
        nav: nav,
        value: value,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        that.setData({ 
          list: result.data.list,
          searchvalue: value,
          searchhistory: wx.getStorageSync('search')
        })
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

  },

  //搜索按钮方法组
  reset_search(e) {
    if (e.detail.value == '搜索') {
      this.setData({
        searchvalue: '',
      })
    }
  },
  check_search(e) {
    if (e.detail.value == '') {
      this.setData({
        searchvalue: '搜索',
      })
    }
  },
  cancel_search(){
    this.setData({
      searchvalue: '搜索',
      list: []
    })
  },
  bc_search(e){
    if (jssearch.returnSearchResult('index', e.detail.value)) {
      this.setDataForPage('index', e.detail.value)
    }
  },
  confirm_search(e) {
    if (jssearch.returnSearchResult(e.currentTarget.dataset.nav, e.currentTarget.dataset.value)) {
      this.setDataForPage(e.currentTarget.dataset.nav, e.currentTarget.dataset.value)
    }
  },
  delete_search(e){
    var newpushhistory = []
    var historylist = this.data.searchhistory
    for(var ihistory = 0; ihistory < historylist.length; ihistory ++){
      if (historylist[ihistory].nav != e.currentTarget.dataset.nav || historylist[ihistory].value != e.currentTarget.dataset.value){
        newpushhistory.push(historylist[ihistory])
      }
    }
    this.setData({ searchhistory: newpushhistory })
    wx.setStorageSync('search', newpushhistory)
  },
})
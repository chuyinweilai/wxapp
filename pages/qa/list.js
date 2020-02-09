// pages/qa/list.js
const app = getApp()
var util = require('../../utils/util.js');
var listoperate = require('../../js/listoperate.js');
var checkdatatime = require('../../js/checkdatatime.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    listsortby: 'Hits',
    listtypeid: 3,
    searchWord: '',
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

  setListTypeID: function(e){
    this.setData({ listtypeid: e.currentTarget.dataset.typeid })
  },

  getSearchWord: function (e) {
    this.setData({
      searchWord: e.detail.value,
      getSearchWordNotNull: 'y',
    })
  },
  clickSearchWord: function () {
    this.setData({
      getSearchWordNotNull: 'y',
    })
  },
  confirmSearchWord: function () {
    var searchword = this.data.searchWord
    if (searchword == "" || searchword == null) {
      this.setData({ getSearchWordNotNull: '' })
    }
    this.pushNewList()
  },
  resetSearchWord: function(){
    this.setData({ searchWord: '' })
    this.pushNewList()
  },
  //筛选后，重新组合数组
  pushNewList: function () {
    var thislist = this.data.qalist
    var result;
    var containid_searchword = ''
    for (var ilist = 0; ilist < thislist.length; ilist++) {
      var thiscondition = this.data.conditioncontent
      var regex = /\[(.+?)\]/g;
      //筛选条件组
      if (this.data.searchWord == "" || this.data.searchWord == null) {
        containid_searchword += '[' + thislist[ilist].ID + ']'
      } else {
        if (thislist[ilist].Title.indexOf(this.data.searchWord) > -1) {
          containid_searchword += '[' + thislist[ilist].ID + ']'
        }
      }
      var pushlist = []
      for (var ipush = 0; ipush < thislist.length; ipush++) {
        var newid = '[' + thislist[ipush].ID + ']'
        if (containid_searchword.indexOf(newid) > -1) {
          pushlist.push(thislist[ipush])
        }
      }
    }
    this.setData({
      thislistpush: pushlist,
    })
  },

  turnToQaDetail: function (e){
    var qaid = e.currentTarget.dataset.qaid
    wx.navigateTo({
      url: 'detail?qaid=' + qaid,
    })
    var newHits = parseInt(e.currentTarget.dataset.hits) + 1
    var newpushilist = this.data.thislistpush
    //————————————————！！！注意！！！————————————————//
    //qalist和thislistpush是联动的，当qalist发生改变时，thislistpush也会改动
    for (var iqa = 0; iqa < newpushilist.length; iqa ++){
      if (newpushilist[iqa].ID == qaid){
        let datanewhits = "thislistpush["+iqa+"].Hits"
        //在上面这个位置，发生了qalist也被改动的情况
        this.setData({
          [datanewhits]: newHits,
        })
        //把新的qalist存入缓存
        //qalist发生奇葩联动，直接存入storage
        var newstorage = {'qalist':''}
        newstorage.qalist = this.data.qalist
        wx.setStorageSync('qalistdata', newstorage)
      }
    }
  },
  turnToQuestion: function (e){
    wx.navigateTo({
      url: 'question',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ fillHeight: app.globalData.fillHeight })
    var that = this
    //判断手机型号，加载填充view
    if (getApp().globalData.isIphoneX != '') {
      that.setData({
        isIphoneX: getApp().globalData.isIphoneX,
        isIphoneXandNoslogonHeight: true,
      })
    }
    that.requestPageData()
    wx.showLoading({
      title: '加载中……',
    })
  },

  requestPageData: function (){
    var that = this
    var qalistdata = wx.getStorageSync('qalistdata')
    if(qalistdata.length > 0){
      that.setDataForPage(qalistdata)
    }
    //校验数据获取时间，超过间隔时间获取一次新的数据
    var time = util.formatTime(new Date())
    wx.request({
      url: app.globalData.requestUrl + 'response/qa/list.aspx',
      data: {
        licence: app.globalData.requestLicence,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        wx.setStorageSync('qalistdatatime', time)
        wx.setStorageSync('qalistdata', result.data)
        that.setDataForPage(result.data)
      }
    })
  },

  //页面存储数据
  setDataForPage: function (e) {
    //默认执行一次按热度排序
    var newlist = e.qalist.sort(this.sortByColumn('Hits'))
    this.setData({
      qalist: newlist,
      thislistpush: newlist,
      listsortby: 'Hits',
    })
    wx.hideLoading()
  },

  sortOrderList: function (e){
    var newlist = this.data.thislistpush.sort(this.sortByColumn(e.currentTarget.dataset.sortby))
    this.setData({ 
      thislistpush: newlist,
      listsortby: e.currentTarget.dataset.sortby,
    })
  },
  sortByColumn: function (property) {
     return listoperate.sortByColumn(property)
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
    this.requestPageData()
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
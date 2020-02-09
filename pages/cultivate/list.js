// pages/cultivate/list.js
const app = getApp()
var util = require('../../utils/util.js');
var checkdatatime = require('../../js/checkdatatime.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchWord: '',
    conditiontitle: '[1]',//条件组title的变量
    conditionview: 'close',//打开搜索条件时，覆盖view的变量
    conditioncontent: '[1][2][3][4]',//实际的搜索条件
    conditioncontenttemp: '[1][2][3][4]',//用于打开搜索条件后点选时的临时条件变量，若没有点击确认，需要回复到最初

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

  gotoNav: function (e) {
    wx.navigateTo({
      url: 'details?culid=' + e.currentTarget.dataset.culid,
    })
  },

  // 条件筛选方法组 —— 开始
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
  openCondition: function (e) {
    var thisconditiontitle = e.currentTarget.dataset.conditiontitle
    if (thisconditiontitle == 'closeCondition') {
      //如果用户没有点击确认和重置按钮，直接点击了覆盖view，希望关掉条件搜索时
      var thisconditioncontent = this.data.conditioncontent
      //因为没有点击确认，所以需要根据实际的条件判断条件组的title的样式
      thisconditiontitle = ''
      if (thisconditioncontent.indexOf('[1]') > -1 || thisconditioncontent.indexOf('[2]') > -1 || thisconditioncontent.indexOf('[3]') > -1 || thisconditioncontent.indexOf('[4]') > -1) {
        thisconditiontitle += '[1]'
      }
      if (thisconditioncontent.indexOf('[7]') > -1 || thisconditioncontent.indexOf('[8]') > -1 || thisconditioncontent.indexOf('[9]') > -1) {
        thisconditiontitle += '[2]'
      }
      this.setData({
        conditionview: 'close',
        conditiontitle: thisconditiontitle,
        conditioncontenttemp: this.data.conditioncontent,//将临时条件变量返回最初状态即实际条件
      })
    } else {
      this.setData({
        conditionview: 'open',
        conditiontitle: thisconditiontitle,
      })
    }
  },
  setConditionScreen: function (e) {
    var thiscc = e.currentTarget.dataset.cc
    var tempccgroup = this.data.conditioncontenttemp
    if (tempccgroup.indexOf(thiscc) > -1) {
      tempccgroup = tempccgroup.replace(thiscc, '')
      this.setData({ conditioncontenttemp: tempccgroup })
    } else {
      tempccgroup = tempccgroup + thiscc
      this.setData({ conditioncontenttemp: tempccgroup })
    }
  },
  resetConditionContent: function () {
    this.setData({
      conditiontitle: '[1]',
      conditionview: 'close',
      conditioncontent: '[1][2][3][4]',
      conditioncontenttemp: '[1][2][3][4]',
      thislistpush: this.data.cullist,
      Lowpricetemp: '',
      Highpricetemp: '',
      getSearchWordNotNull: '',
    })
  },
  confirmConditionContent: function () {
    var confirmtitle = ''
    if (this.data.conditioncontenttemp.indexOf('[1]') > -1 || this.data.conditioncontenttemp.indexOf('[2]') > -1 || this.data.conditioncontenttemp.indexOf('[3]') > -1 || this.data.conditioncontenttemp.indexOf('[4]') > -1) {
      confirmtitle += '[1]'
    }
    if (this.data.conditioncontenttemp.indexOf('[7]') > -1 || this.data.conditioncontenttemp.indexOf('[8]') > -1 || this.data.conditioncontenttemp.indexOf('[9]') > -1) {
      confirmtitle += '[2]'
    }
    this.setData({
      conditiontitle: confirmtitle,
      conditionview: 'close',
      conditioncontent: this.data.conditioncontenttemp,
    })
    this.pushNewList()
  },
  //筛选后，重新组合数组
  pushNewList: function () {
    var thislist = this.data.cullist
    var result;
    var containid_1234 = ''
    var containid_789 = ''
    var containid_searchword = ''
    for (var ilist = 0; ilist < thislist.length; ilist++) {
      var thiscondition = this.data.conditioncontent
      var regex = /\[(.+?)\]/g;
      //筛选条件组1
      if (thiscondition.indexOf('[1]') <= -1 && thiscondition.indexOf('[2]') <= -1 && thiscondition.indexOf('[3]') <= -1 && thiscondition.indexOf('[4]') <= -1) {//如果没有选择任何一个条件，则id都符合条件
        containid_1234 += '[' + thislist[ilist].ID + ']'
      } else {
        while ((result = regex.exec(thiscondition)) != null) {
          if (result[1] == 1) {
            if (thislist[ilist].CultivateClassType.indexOf('GPA') > -1) { containid_1234 += '[' + thislist[ilist].ID + ']' }
          }
          if (result[1] == 2) {
            if (thislist[ilist].CultivateClassType.indexOf('TOFEL') > -1) { containid_1234 += '[' + thislist[ilist].ID + ']' }
          }
          if (result[1] == 3) {
            if (thislist[ilist].CultivateClassType.indexOf('SAT') > -1) { containid_1234 += '[' + thislist[ilist].ID + ']' }
          }
          if (result[1] == 4) {
            if (thislist[ilist].CultivateClassType.indexOf('ACT') > -1) { containid_1234 += '[' + thislist[ilist].ID + ']' }
          }
        }
      }
      //筛选条件组3
      if (thiscondition.indexOf('[7]') <= -1 && thiscondition.indexOf('[8]') <= -1 && thiscondition.indexOf('[9]') <= -1) {//如果没有选择任何一个条件，则id都符合条件
        containid_789 += '[' + thislist[ilist].ID + ']'
      } else {
        while ((result = regex.exec(thiscondition)) != null) {
          if (result[1] == 7) {
            if (thislist[ilist].TeachersCount <= 5) { containid_789 += '[' + thislist[ilist].ID + ']' }
          }
          if (result[1] == 8) {
            if (thislist[ilist].TeachersCount > 5 && thislist[ilist].TeachersCount <= 10) { containid_789 += '[' + thislist[ilist].ID + ']' }
          }
          if (result[1] == 9) {
            if (thislist[ilist].TeachersCount > 10) { containid_789 += '[' + thislist[ilist].ID + ']' }
          }
        }
      }
      //筛选条件组4
      if (this.data.searchWord == "" || this.data.searchWord == null) {
        containid_searchword += '[' + thislist[ilist].ID + ']'
      } else {
        if (thislist[ilist].InstitutionName.indexOf(this.data.searchWord) > -1) {
          containid_searchword += '[' + thislist[ilist].ID + ']'
        }
      }
    }
    var pushlist = []
    for (var ipush = 0; ipush < thislist.length; ipush++) {
      var newid = '[' + thislist[ipush].ID + ']'
      if (containid_1234.indexOf(newid) > -1 && containid_789.indexOf(newid) > -1 && containid_searchword.indexOf(newid) > -1) {
        pushlist.push(thislist[ipush])
      }
    }
    this.setData({
      thislistpush: pushlist,
    })
  },
  // 条件筛选方法组 —— 结束

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ fillHeight: app.globalData.fillHeight })
    var that = this
    wx.showLoading({
      title: '加载中……',
    })
    //判断手机型号，加载填充view
    if (getApp().globalData.isIphoneX != '') {
      that.setData({
        isIphoneX: getApp().globalData.isIphoneX,
      })
    }
    //校验数据获取时间，超过间隔时间获取一次新的数据
    var time = util.formatTime(new Date())
    var cullistdatatime = wx.getStorageSync('cullistdatatime')
    if (!checkdatatime.countDiffer(time, cullistdatatime)) {
      wx.request({
        url: app.globalData.requestUrl + 'response/cultivate/list.aspx',
        data: {
          licence: app.globalData.requestLicence,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (result) {
          wx.setStorageSync('cullistdatatime', time)
          wx.setStorageSync('cullistdata', result.data)
          that.setDataForPage(result.data)
        }
      })
    } else {
      var cullistdata = wx.getStorageSync('cullistdata')
      that.setDataForPage(cullistdata)
    }
  },

  //页面存储数据
  setDataForPage: function (e) {
    this.setData({
      cullist: e.cullist,
      thislistpush: e.cullist,
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
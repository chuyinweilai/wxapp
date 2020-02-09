// pages/qa/detail.js
const app = getApp()
var util = require('../../utils/util.js');
var listoperate = require('../../js/listoperate.js');
var checkdatatime = require('../../js/checkdatatime.js');
var jsuserinfo = require('../../js/userinfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOrderByLike: false,
    isAudioPlay: 'no',
    audioDuration: 0,
    audiostatus: 'playAudio',
    imagePaths: [],
    //defaultImageForQuestion: '',//问题的图片展示默认值
    //defaultImageGroup: [],//最新高分的默认图片
    //登录获取用户信息data组
    userInfo: {},
    hasUserInfo: true,
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
  //咨询小管家
  handleContact: function (e) {
    app.HandleContact(e)
  },

  turnToAnswer: function(e){
    wx.navigateTo({
      url: 'answer?qaid=' + e.currentTarget.dataset.qaid,
    })
  },

  //图片和音频方法组
  setDefaultImage: function (e) {
    var changeUrl = ''
    if (e.currentTarget.dataset.key == 'imagePaths'){
      changeUrl = 'defaultImageForQuestion'
    }else{
      changeUrl = 'defaultImageGroup[' + e.currentTarget.dataset.commentlistindex + '].ImageUrl'
    }
    this.setData({
      [changeUrl]: e.currentTarget.dataset.url
    })
  },
  previewImg: function (e) {
    var previewurlgroup = e.currentTarget.dataset.urlarray
    for (var ipre = 0; ipre < previewurlgroup.length; ipre++) {
      previewurlgroup[ipre] = 'https://testwx.taoraise.com/UploadFiles/image/' + previewurlgroup[ipre] + '.jpg'
    }
    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的http链接
      urls: previewurlgroup,// 预览图片组的url
    })
  },
  playAudio: function (e) {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = e.currentTarget.dataset.audiourl
    innerAudioContext.play()
    var audiospace = e.currentTarget.dataset.audiospace //区分回答列表的audio，传入audio位置
    this.setData({
      [audiospace]: 'yes',
      audiostatus: 'stopAudio',
    })
    innerAudioContext.onEnded((res) => {
      this.setDataForStopPalyAudio(audiospace,'playtostop')
    })
  },
  stopAudio: function (audiospace, status) {
    if(status != 'playtostop'){
      audiospace = audiospace.currentTarget.dataset.audiospace //区分回答列表的audio，传入audio位置
    }
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = ''
    innerAudioContext.stop()
    this.setDataForStopPalyAudio(audiospace)
  },
  setDataForStopPalyAudio: function (audiospace) {
    //当音频播放结束时或停止播放时
    this.setData({
      [audiospace]: 'no',
      audiostatus: 'playAudio',
    })
  },


  //授权弹窗方法组，onload启动方法this.resetUserInfo()
  //这是qa页面特殊的方法组
  bindGetUserInfo(e) {//授权弹窗点击授权后
    var that = this
    if (e.detail.userInfo) {
      var thisUserinfo = jsuserinfo.getUserInfo(e);
      that.setDataForUser(thisUserinfo);
    } else {
      that.setData({ hasUserInfo: true })
      wx.showModal({
        title: '您还没有授权',
        content: '为了您更好的用户体验，请点击确认再次打开授权按钮，并同意授权。',
        success: function (res) {
          if (res.confirm) {
            that.setData({ hasUserInfo: false })
          }
        },
        fail: function (res){
          //授权状态结束
          app.globalData.finishGetUser = 'finish'
        }
      })
    }
  },
  resetUserInfo() {
    var that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {// 已经授权
          wx.getUserInfo({
            success: res => {
              jsuserinfo.setUserInfo(res.userInfo);
              that.setDataForUser(res.userInfo);
            }
          })
        } else {//没有授权弹出授权窗口
          //授权状态结束
          app.globalData.finishGetUser = 'finish'
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
      hasUserInfo: true
    })
  },

  changeListOrder: function (){
    var listorderby = this.data.isOrderByLike
    var listorderbyproperty = ''
    if(listorderby == false){
      listorderby = true
      listorderbyproperty = 'AddTime'
    }else{
      listorderby = false
      listorderbyproperty = 'Ilike'
    }
    this.setData({ isOrderByLike: listorderby })
    this.sortOrderList(listorderbyproperty)
  },
  clickIlick: function (e){
    if (e.currentTarget.dataset.isliked != 'Y'){
      var that = this
      var userid = app.globalData.taoraiseid
      if (userid == '') {
        wx.showModal({
          title: '需要授权',
          content: '您需要授权后，才可以点击有用按钮，点击确认弹出授权对话框',
          success: function (res) {
            if (res.confirm) {
              this.setData({ hasUserInfo: false })//弹出授权窗口
            }
          }
        })
      } else {
        wx.request({
          url: app.globalData.requestUrl + 'ashx/getPostDataQa.ashx',
          method: 'post',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: util.json2Form({
            licence: app.globalData.requestLicence,
            taoraiseid: app.globalData.taoraiseid,
            objid: e.currentTarget.dataset.answerid,
            datatype: 'Ilike',
          }),
          success: function (result) {
            var newIlike = parseInt(e.currentTarget.dataset.ilike) + 1
            for(var ians = 0; ians < that.data.answerlist.length; ians++){
              if (that.data.answerlist[ians].ID == e.currentTarget.dataset.answerid) {
                let datanewlike = "answerlist[" + ians + "].Ilike"
                let datanewisliked = "answerlist[" + ians + "].isLiked"
                that.setData({
                  [datanewlike]: newIlike,
                  [datanewisliked]: 'Y',
                })
              }
            }
          }
        })
      }
    }else{
      wx.showModal({
        title: '已经点过赞',
        content: '您已经点击过有用，无法重复点击。',
        showCancel: false,
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ fillHeight: app.globalData.fillHeight })
    var that = this
    //登录授权方法
    that.resetUserInfo()
    //判断手机型号，加载填充view
    if (getApp().globalData.isIphoneX != '') {
      that.setData({
        isIphoneX: getApp().globalData.isIphoneX,
        isIphoneXandNoslogonHeight: true,
      })
    }
    if(options.id != '' && options.id != null){//旧版提醒功能的保留
      wx.redirectTo({
        url: 'detail?qaid=' + options.id,
      })
    }else{
      that.requestDataForPage(options)
    }
    wx.showLoading({
      title: '加载中……',
    })
  },

  //等待授权状态结束后，再发起request请求
  requestDataForPage: function (e){
    var that = this
    if(app.globalData.finishGetUser != 'notyet'){//如果确认了授权状态
      //为了实时更新阅读量，不做缓存处理，每次打开都更新一次数据
      wx.request({
        url: app.globalData.requestUrl + 'response/qa/detail.aspx',
        data: {
          licence: app.globalData.requestLicence,
          qaid: e.qaid,
          taoraiseid: app.globalData.taoraiseid,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (result) {
          if (result.data.qadetail == ''){
            //参数错误，服务器端返回空数据
            wx.redirectTo({
              url: 'list',
            })
          }else{
            var thisduration = result.data.qadetail[0].Duration
            if (thisduration == '') {
              thisduration = 0
            }
            //音频播放，重组array，加answerlistplay下标
            var answerlistarray = result.data.answerlist
            for (var ilist = 0; ilist < answerlistarray.length; ilist++) {
              answerlistarray[ilist].answerlistplay = 'no'
            }
            //阅读量加1发生在获取数据之后的服务器端，所以这里取到阅读量，需要加1，保证和数据库的阅读量一致
            result.data.qadetail[0].Hits = parseInt(result.data.qadetail[0].Hits) + 1
            //给评论设置默认图
            // var buildImageGroup = []
            // for (var imageIndex = 0; imageIndex < answerlistarray.length; imageIndex++) {
            //   var thisimageurl = {}
            //   thisimageurl.GroupIndex = imageIndex
            //   if (answerlistarray[imageIndex].Image.length > 0) {
            //     thisimageurl.ImageUrl = answerlistarray[imageIndex].Image[0]
            //   } else {
            //     thisimageurl.ImageUrl = ''
            //   }
            //   buildImageGroup.push(thisimageurl)
            // }
            that.setData({
              qaid: e.qaid,
              qadetail: result.data.qadetail[0],
              answerlist: answerlistarray,
              audioDuration: thisduration,
              imagePaths: result.data.qadetail[0].Image,
              //defaultImageGroup: buildImageGroup,
            })
            wx.hideLoading()
            // if (result.data.qadetail[0].Image.length > 0){
            //   that.setData({ defaultImageForQuestion: result.data.qadetail[0].Image[0] })
            // }
          }
        }
      })
    }else{
      setTimeout(function(){
        that.requestDataForPage(e)
      },300)
    }
  },

  sortOrderList: function (e) {
    var newlist = this.data.answerlist.sort(this.sortByColumn(e))
    this.setData({
      answerlist: newlist,
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
// pages/cultivate/detail.js
const app = getApp()
var util = require('../../utils/util.js');
var checkdatatime = require('../../js/checkdatatime.js');
var jsuserinfo = require('../../js/userinfo.js');
const recorderManager = wx.getRecorderManager()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    culfoot: 'preferentialclose',
    moreaddress: 'display:none',
    culdetailnav: 'dt',
    orderbtnstatus: 'confirmOrder',
    isAudioPlay: 'no',
    audioDuration: 0,
    audiostatus: 'playAudio',
    imagePaths: [],
    //defaultImageGroup: [],//最新高分的默认图片
    //登录获取用户信息data组
    userInfo: {},
    hasUserInfo: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  setculfoot: function(e) {
    this.setData({
      culfoot: e.currentTarget.dataset.culfoot
    })
  },
  showmoreaddress: function(){
    this.setData({
      moreaddress: ''
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
  clickCollect: function (e) {
    var that = this
    if (app.globalData.finishGetUser != 'got') {
      that.showNeedAuthorization()
    } else {
      var collectvalue = this.data.culdetail.Collect
      if (collectvalue == 'Y') {
        collectvalue = '0'//代表收藏变成未收藏
      } else {
        collectvalue = '1'//代表未收藏变成收藏
      }
      getApp().clickCollect('cul', this.data.culid, collectvalue)
      this.requestDataAgainToSet(collectvalue)
    }
  },
  //咨询小管家
  handleContact: function (e) {
    app.HandleContact(e)
  },

  //图片和音频方法组
  setDefaultImage: function (e) {
    var changeUrl = 'defaultImageGroup[' + e.currentTarget.dataset.commentlistindex+'].ImageUrl'
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
      this.setDataForStopPalyAudio(audiospace, 'playtostop')
    })
  },
  stopAudio: function (audiospace, status) {
    if (status != 'playtostop') {
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

  selectDetailNav: function (e){
    var detailnav = e.currentTarget.dataset.nav
    this.setData({ culdetailnav: detailnav })
  },
  setTeacherIntro: function (e){
    var newteacherlist = this.data.teacherslist
    var newspreadvalue = false
    if(e.currentTarget.dataset.spread == false){
      newspreadvalue = true
    }
    newteacherlist[e.currentTarget.dataset.idx].Spread = newspreadvalue
    this.setData({ teacherslist: newteacherlist })
  },
  gotoCommemt: function(e){
    wx.navigateTo({
      url: '../comment/default?objtype=4&objid=' + this.data.culid,
    })
  },
  //订单部分
  countNum: function(e){
    var thiscount = parseInt(e.currentTarget.dataset.count)
    var thistype = e.currentTarget.dataset.type
    if (thistype == 'minus') {
      if(thiscount > 0){
        thiscount = thiscount - 1
      }
    }else{
      thiscount = thiscount + 1
    }
    for(var icn = 0; icn < this.data.courselist.length; icn ++){
      if(this.data.courselist[icn].ID == e.currentTarget.dataset.id){
        this.data.courselist[icn].Count = thiscount
      }
    }
    //将新的数据数量保存刷新
    this.setData({ courselist: this.data.courselist })
  },
  confirmOrder: function(e){
    wx.showLoading({
      title: '前往订单页面……',
    })
    var fromCourse = ''
    if (e.currentTarget.dataset.fee){
      fromCourse += '&fee=' + e.currentTarget.dataset.fee + '&coursename=' + e.currentTarget.dataset.name + 
        '&cultivate=' + this.data.culdetail.CultivateName
    }
    wx.hideLoading()
    wx.navigateTo({
      url: '../../order/cultivate/generate?fromuser=self' + fromCourse,
    })
    // var that = this
    // if (app.globalData.finishGetUser != 'got') {
    //   that.showNeedAuthorization()
    // } else {
    //   that.setData({ orderbtnstatus: 'buildOrder' })
    //   wx.request({
    //     url: getApp().globalData.requestUrl + 'ashx/getPostOrder.ashx',
    //     method: 'post',
    //     header: {
    //       'content-type': 'application/x-www-form-urlencoded'
    //     },
    //     data: util.json2Form({
    //       licence: getApp().globalData.requestLicence,
    //       taoraiseid: getApp().globalData.taoraiseid,
    //       order: JSON.stringify(that.data.courselist),
    //     }),
    //     success: function (result) {
    //       //走向支付订单页面，result.data即为订单id
    //       wx.navigateTo({
    //         url: '../order/payment?orderid=' + result.data,
    //       })
    //     }
    //   })
    // }
  },
  buildOrder: function(){
    wx.showModal({
      title: '正在生成订单',
      content: '正在生成订单，请稍后……',
      showCancel: false,
    })
  },

  //弹出示意授权modal
  showNeedAuthorization: function(){
    wx.showModal({
      title: '请先授权',
      content: '您需要先授权，才可点击收藏按钮，并在个人中心中找到这些收藏。',
      success: function (res) {
        if (res.confirm) {
          that.setData({ hasUserInfo: false })//如果没有获得taoraiseid，弹出授权框
        }
      }
    })
  },

  //授权弹窗方法组，onload启动方法this.resetUserInfo()
  //如果需要确认授权状态再进行请求数据的话
  //jsuserinfo.setUserInfo的方法会设置finishiGetUser，所以无需在调用这个方法的情况设置finishiGetUser
  bindGetUserInfo(e) {//授权弹窗点击授权后
    var that = this
    if (e.detail.userInfo) {
      var thisUserinfo = jsuserinfo.getUserInfo(e);
      that.setDataForUser(thisUserinfo);
      that.requestDataAgain(that.data, 'got');//点击授权，特殊情况，让request必须等到jsuserinfo设置完
    } else {
      that.setData({ hasUserInfo: true })
      app.globalData.finishGetUser = 'finish'
    }
  },
  resetUserInfo(e) {
    var that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {// 已经授权
          wx.getUserInfo({
            success: res => {
              jsuserinfo.setUserInfo(res.userInfo);
              that.setDataForUser(res.userInfo);
              that.requestDataAgain(e, 'got');//默认已授权，再请求collect
            }
          })
        } else {//没有授权弹出授权窗口
          //授权状态结束
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ fillHeight: app.globalData.fillHeight })
    var that = this
    wx.showLoading({
      title: '加载中……',
    })
    //登录授权方法
    that.resetUserInfo(options)
    //判断手机型号，加载填充view
    if (getApp().globalData.isIphoneX != '') {
      that.setData({
        isIphoneX: getApp().globalData.isIphoneX,
      })
    }
    //校验数据获取时间，超过间隔时间获取一次新的数据
    var time = util.formatTime(new Date())
    that.setData({ culid: options.culid, time: time })
    var culdetaildatatime = wx.getStorageSync('culdetaildatatime_' + options.culid)
    if (!checkdatatime.countDiffer(time, culdetaildatatime)) {
      that.requestDataForPage(options)
    } else {
      var culdetaildata = wx.getStorageSync('culdetaildata_' + options.culid)
      that.setDataForPage(culdetaildata)
    }
    //判断是否为点击晒高分进入机构列表
    if(options.nav != null){
      that.setData({ culdetailnav: 'dts' })
    }
  },

  //等待授权状态结束后，更新collect
  requestDataAgain: function (e, status) {
    var that = this
    if (app.globalData.finishGetUser == status) {//如果确认了授权状态
      if (app.globalData.taoraiseid != "") {
        wx.request({
          url: app.globalData.requestUrl + 'response/cultivate/detail_again.aspx',
          data: {
            licence: app.globalData.requestLicence,
            culid: e.culid,
            taoraiseid: app.globalData.taoraiseid,
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (result) {
            if (result.data == '1') {
              that.requestDataAgainToSet('1')
            }
          }
        })
      }
    } else {
      setTimeout(function () {
        that.requestDataAgain(e, status)
      }, 400)
    }
  },
  //若collect发生了改变
  requestDataAgainToSet: function (e) {
    var that = this
    //更新页面数据appdata
    var setdatachange = 'culdetail.Collect'
    var thiscollect = 'N'
    if (e == '1') {
      thiscollect = 'Y'
    }
    that.setData({ [setdatachange]: thiscollect })
    //更改缓存数据，并存储，延迟1秒，已免报错
    setTimeout(function () {
      var thispagedata = wx.getStorageSync('culdetaildata_' + that.data.culid)
      thispagedata.culdetail[0].Collect = thiscollect
      wx.setStorageSync('culdetaildata_' + that.data.culid, thispagedata)
    }, 1000)
  },
  //实际数据请求，可以先执行，授权后更新collect
  requestDataForPage: function (e) {
    var that = this
    wx.request({
      url: app.globalData.requestUrl + 'response/cultivate/detail.aspx',
      data: {
        licence: app.globalData.requestLicence,
        culid: e.culid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        wx.setStorageSync('culdetaildatatime_' + e.culid, that.data.time)
        wx.setStorageSync('culdetaildata_' + e.culid, result.data)
        that.setDataForPage(result.data)
      }
    })
  },
  //页面存储数据
  setDataForPage: function (e) {
    //订单数据，将数量初始化为0
    for (var ico = 0; ico < e.courselist.length; ico++) {
      e.courselist[ico].Count = 0
    }
    //老师列表数据展开下标
    for(var imark = 0; imark < e.culteachers.length; imark ++){
      e.culteachers[imark].Spread = false
    }
    //给评论设置默认图
    // var buildImageGroup = []
    // for(var imageIndex = 0; imageIndex < e.commentlist.length; imageIndex ++){
    //   var thisimageurl = {}
    //   thisimageurl.GroupIndex = imageIndex
    //   if (e.commentlist[imageIndex].Image.length > 0) {
    //     thisimageurl.ImageUrl = e.commentlist[imageIndex].Image[0]
    //   } else {
    //     thisimageurl.ImageUrl = ''
    //   }
    //   buildImageGroup.push(thisimageurl)
    // }
    var thisbanner = e.culdetail[0].Banner
    if(thisbanner.length > 0){
      for(var ibanner = 0; ibanner < thisbanner.length; ibanner ++){
        thisbanner[ibanner] = app.globalData.requestUrl + 'UploadFiles/cultivate/banner/' + e.culdetail[0].ID + '/' + thisbanner[ibanner]
      }
    }
    this.setData({
      culdetail: e.culdetail[0],
      culaddress: e.culaddress,
      teacherslist: e.culteachers,
      courselist: e.courselist,
      commentlist: e.commentlist,
      culbanner: thisbanner,
      //defaultImageGroup: buildImageGroup,
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
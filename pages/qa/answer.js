// pages/qa/answer.js
const app = getApp()
var util = require('../../utils/util.js');
var jsuserinfo = require('../../js/userinfo.js');
var replaceStr = require('../../js/replace.js');
const recorderManager = wx.getRecorderManager()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    contactinfo: '',//联系方式
    qacontent: '',//问题内容
    switchvalue: false,
    audiofunction: 'startRecordAudio',
    audioID: '',
    hasRecord: 'none',
    isAudioPlay: 'no',
    audioDuration: 0,
    audiostatus: 'playAudio',
    imagePaths: [],
    imageReturnID: [],
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

  //录音方法组
  startRecordAudio: function(){
    const options = {
      duration: 60000,//指定录音的时长，单位 ms
      sampleRate: 16000,//采样率
      numberOfChannels: 2,//录音通道数
      encodeBitRate: 96000,//编码码率
      format: 'mp3',//音频格式，有效值 aac/mp3
      frameSize: 2048,//指定帧大小，单位 KB
    }
    recorderManager.start(options)
    recorderManager.onStart(() => {
      this.setData({
        audiofunction: 'stopRecordAudio',
        audioID: '',
      })
    });
    //如果超过时长，会直接调用onStop
    recorderManager.onStop((res) => {
      this.whenStopRecordAudio(res)
    })
    //错误回调
    recorderManager.onError((res) => {
      console.log('error')
    })
  },
  stopRecordAudio: function(){
    recorderManager.stop();
    recorderManager.onStop((res) => {
      this.whenStopRecordAudio(res)
    })
  },
  //当录音结束时
  whenStopRecordAudio: function(res){
    var that = this
    //res.tempFilePath\fileSize\duration;
    var thisduration = res.duration
    thisduration = thisduration / 1000
    thisduration = thisduration.toFixed(0)
    that.setData({
      hasRecord: 'has',
      audioDuration: thisduration,
      audiofunction: 'startRecordAudio',
      audiopath: res.tempFilePath,
    })
    //上传音频文件
    wx.uploadFile({
      url: app.globalData.requestUrl + 'ashx/getPostUploadFile.ashx',
      filePath: res.tempFilePath,
      name: 'file',
      formData: {
        fileType: 'audio',
        duration: thisduration,
        filePath: res.tempFilePath,
      },
      success(res) {
        //服务器端保存音频后，返回一个文件上传临时ID，用于用户确认提交后关联至该回答
        that.setData({ audioID: res.data })
      }
    })
  },
  playAudio: function(){
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = this.data.audiopath
    innerAudioContext.play()
    this.setData({
      isAudioPlay: 'yes',
      audiostatus: 'stopAudio',
    })
    innerAudioContext.onEnded((res) => {
      this.setDataForStopPalyAudio()
    })
  },
  stopAudio: function(){
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = this.data.audiopath
    innerAudioContext.stop()
    this.setDataForStopPalyAudio()
  },
  setDataForStopPalyAudio: function () {
    //当音频播放结束时或停止播放时
    this.setData({
      isAudioPlay: 'no',
      audiostatus: 'playAudio',
    })
  },
  clearAudio: function(){
    this.setData({
      hasRecord: 'none',
      audioDuration: '',
      audiofunction: 'startRecordAudio',
      audiopath: '',
    })
  },
  //上传图片方法组
  uploadImage: function(){
    var that = this
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        // const tempFilePaths = res.tempFilePaths
        that.setData({
          imagePaths: res.tempFilePaths,
          imageReturnID: []
        })
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          wx.uploadFile({
            url: app.globalData.requestUrl + 'ashx/getPostUploadFile.ashx',
            filePath: res.tempFilePaths[i],
            name: 'file',
            formData: {
              fileType: 'image',
              filePath: res.tempFilePaths[i],
            },
            success(res) {
              //服务器端保存图片后，返回一个图片上传临时id字符串，传递回服务器处理
              var arrimageReturnID = that.data.imageReturnID
              arrimageReturnID.push(res.data)
              that.setData({ imageReturnID: arrimageReturnID })
            }
          })
        }
      }
    })
  },
  removeImage: function(e){
    var thisimagepaths = this.data.imagePaths
    thisimagepaths.splice(e.currentTarget.dataset.idx, 1)
    var thisimagereturnid = this.data.imageReturnID
    thisimagereturnid.splice(e.currentTarget.dataset.idx, 1)
    this.setData({
      imagePaths: thisimagepaths,
      imageReturnID: thisimagereturnid,
    })
  },
  //上传视频方法
  uploadVideo: function (e) {
    var that = this
    wx.showModal({
      title: '上传视频时请注意',
      content: '视频不能超过10秒，并且大小不能超过5m。',
      //showCancel: false,
      success: function (res) {
        if (res.confirm) {
          wx.chooseVideo({
            sourceType: ['album', 'camera'],
            maxDuration: 10,
            camera: 'back',
            success(res) {
              if (res.duration <= 10 && res.size <= 5 * 1024 * 1024) {
                //如果视频的长度小于10秒并且视频的大小小于5m
                wx.uploadFile({
                  url: app.globalData.requestUrl + 'ashx/getPostUploadFile.ashx',
                  filePath: res.tempFilePath,
                  name: 'file',
                  formData: {
                    fileType: 'video',
                    filePath: res.tempFilePath,
                  },
                  success(res) {
                    //服务器端保存图片后，返回一个图片上传临时id字符串，传递回服务器处理
                    var tempjson = JSON.parse(res.data)
                    that.setData({
                      videosrc: app.globalData.requestUrl + 'UploadFiles/video/' + tempjson.fileurl,
                      videoID: tempjson.sid
                    })
                  }
                })
              } else {
                wx.showModal({
                  title: '上传的视频不符合要求',
                  content: '请确认视频不长于10秒，并且视频的大小小于5m。',
                  showCancel: false,
                })
              }
            }
          })
        } else {
          //用户点击取消
        }
      }
    })
  },

  //提交回答方法组
  inputContactInfo(e) {
    if (e.detail.value != '') {
      this.setData({ contactinfo: e.detail.value })
    }
  },
  inputQaContent(e) {
    if (e.detail.value != '') {
      this.setData({ qacontent: e.detail.value })
    }
  },
  switchAnonymous(e) {
    this.setAnonymouse(e.detail.value)
  },
  bindAnonymouse(e) {
    this.setAnonymouse(e.currentTarget.dataset.value)
  },
  setAnonymouse(value) {
    this.setData({ switchvalue: value })
  },
  confirmPostQuestion() {
    var that = this
    wx.showModal({
      title: '提交问题',
      content: '是否确认提交？',
      success: function (res) {
        if (res.confirm) {
          var thisanonymous = that.data.switchvalue
          if (thisanonymous == true) {
            thisanonymous = 'Y'
          } else {
            thisanonymous = 'N'
          }
          that.requetTheAnswer(thisanonymous)
        }
      }
    })
  },
  // 提交问题的request请求部分
  requetTheAnswer: function(anonymousvalue){
    var that = this
    var thiscontent = that.data.qacontent
    thiscontent = replaceStr.filterEmoji(thiscontent)
    //thiscontent = replaceStr.filterSpace(thiscontent)
    wx.request({
      url: getApp().globalData.requestUrl + 'ashx/getPostDataQa.ashx',
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: util.json2Form({
        licence: app.globalData.requestLicence,
        taoraiseid: app.globalData.taoraiseid,
        openid: app.globalData.wxopenid,//传入openid，以防未获取到taoraiseid
        datatype: 'answer',
        objid: that.data.qaid,
        contact: that.data.contactinfo,
        content: thiscontent,
        anonymous: anonymousvalue,
        audioid: that.data.audioID,
        imageid: that.data.imageReturnID,
        videoid: that.data.videoID,
      }),
      success: function (result) {
        wx.showToast({
          title: '成功发表！',
        })
        setTimeout(function () {
          wx.navigateTo({
            url: 'detail?qaid=' + that.data.qaid,
          })
        }, 300)//间隔0.3秒
      }
    })
  },

  //授权弹窗方法组，onload启动方法this.resetUserInfo()
  bindGetUserInfo(e) {//授权弹窗点击授权后
    if (e.detail.userInfo) {
      var thisUserinfo = jsuserinfo.getUserInfo(e);
      this.setDataForUser(thisUserinfo)
    }
  },
  resetUserInfo() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {// 已经授权
          wx.getUserInfo({
            success: res => {
              jsuserinfo.setUserInfo(res.userInfo)
              this.setDataForUser(res.userInfo)
            }
          })
        } else {//没有授权弹出授权窗口
          this.setData({
            hasUserInfo: false,
          })
        }
      }
    })
  },
  setDataForUser(e) {
    var that = this
    //如果需要第一时间使用taouserinfo
    if (app.globalData.taouserInfo != '') {
      var appglobaluserinfo = app.globalData.taouserInfo
      var userinfocontact = ''
      if (appglobaluserinfo.phone != '') {//只要手机不为空，联系方法就显示为手机
        userinfocontact = appglobaluserinfo.phone
      } else {
        if (appglobaluserinfo.email != '') {//如果手机信息没有，则联系方法为邮箱
          userinfocontact = appglobaluserinfo.email
        }
        //都没有则依旧为空
      }
      //真实方法
      that.setData({
        userInfo: e,
        hasUserInfo: true,
        taouserInfo: app.globalData.taouserInfo,
        contactinfo: userinfocontact,
      })
    } else {
      setTimeout(function () {
        that.setDataForUser(e)
      }, 500)//间隔0.5秒
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
    wx.request({
      url: app.globalData.requestUrl + 'response/qa/answer.aspx',
      data: {
        licence: app.globalData.requestLicence,
        qaid: options.qaid,
      },
      header:{
        'content-type': 'application/json'
      },
      success: function(result){
        that.setData({ 
          qaid: options.qaid,
          qatitle: result.data,
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

  }
})
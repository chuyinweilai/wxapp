// pages/agreement/apply.js
var app = getApp()
var jsuserinfo = require('../../js/userinfo.js');
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    contactimage: '',
    payimage: '',
    verification_bank: true,
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

  pickerchange: function(e){
    var colum = e.currentTarget.dataset.key + 'value'
    this.setData({ [colum]: e.currentTarget.dataset.array[e.detail.value] })
  },
  inputContactInfo: function(e){
    this.setData({ [e.currentTarget.dataset.colum]: e.detail.value })
    if (e.currentTarget.dataset.colum == 'bankcard'){
      var thisverification = false
      if (e.detail.value.length == 11 || e.detail.value.length == 12){
        thisverification = true
      }
      this.setData({ verification_bank: thisverification })
    }
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
        } else {//点击取消，再次弹出授权窗口，直至授权
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
      hasUserInfo: true,
    })
  },

  //上传图片方法组
  uploadImage: function (e) {
    var that = this
    var imagepath = e.currentTarget.dataset.imagenav
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        // const tempFilePaths = res.tempFilePaths
        var saveimageurl = imagepath + 'url'
        that.setData({ [saveimageurl]: res.tempFilePaths[0] })
        wx.uploadFile({
          url: app.globalData.requestUrl + 'ashx/getPostUploadFile.ashx',
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            fileType: 'image',
            filePath: res.tempFilePaths[0],
          },
          success(res) {
            //服务器端保存图片后，返回一个图片上传临时id字符串，传递回服务器处理
            var saveimagepath = imagepath + 'image'
            that.setData({ [saveimagepath]: res.data })
          }
        })
      }
    })
  },
  removeImage: function (e) {
    var imagepath = e.currentTarget.dataset.imagenav
    var saveimagepath = imagepath + 'image'
    this.setData({ [saveimagepath]: '' })
  },

  postAgreement: function(e){
    var that = this
    //console.log(e.detail.formId)
    wx.showModal({
      title: '提交第三方协议',
      content: '是否确认提交？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在提交协议申请……',
          })
          that.requestTheAgreement(e.detail.formId)
        }
      }
    })
  },
  requestTheAgreement: function(formid){
    var that = this
    wx.request({
      url: getApp().globalData.requestUrl + 'ashx/getPostDataAgreement.ashx',
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: util.json2Form({
        licence: app.globalData.requestLicence,
        openid: app.globalData.wxopenid,
        name: that.data.name,
        abroadvalue: that.data.abroadvalue,
        sexvalue: that.data.sexvalue,
        pname: that.data.pname,
        relationshipvalue: that.data.relationshipvalue,
        phone: that.data.phone,
        contactimage: that.data.contactimage,
        payimage: that.data.payimage,
        bankcard: that.data.bankcard,
        cardowner: that.data.cardowner,
        bankname: that.data.bankname,
        formid: formid,
      }),
      success: function (result) {
        wx.hideLoading()
        wx.showModal({
          title: '申请已提交',
          content: '我们将尽快进行审核……',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../member/index',
              })
            }
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ fillHeight: app.globalData.fillHeight })
    this.resetUserInfo()
    //判断手机型号，加载填充view，noslogon的css
    if (getApp().globalData.isIphoneX != '') {
      this.setData({
        isIphoneX: getApp().globalData.isIphoneX,
        isIphoneXandNoslogonHeight: true,
      })
    }
    this.requestDataForPage()
  },
  requestDataForPage: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrl + 'response/agreement/apply.aspx',
      data: {
        licence: app.globalData.requestLicence
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        that.setDataForPage(result.data)
      }
    })
  },
  //页面存储数据
  setDataForPage: function (e) {
    this.setData({
      abroad: e.abroad,
      sex: e.sex,
      relationship: e.relationship,
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
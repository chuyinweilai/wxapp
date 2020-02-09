// order/cultivate/generate.js
const app = getApp()
var replaceStr = require('../../js/replace.js');
var util = require('../../utils/util.js');
var jsuserinfo = require('../../js/userinfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    ctime: '',
    fee: '',
    discount: '',
    discountfold: '',
    payment: '',
    imageReturnID: [],
    cularray: [],
    index: 0,
    selectins: '请选择机构',
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
  //授权弹窗方法组，onload启动方法this.resetUserInfo()
  //如果需要确认授权状态再进行请求数据的话
  //jsuserinfo.setUserInfo的方法会设置finishiGetUser，所以无需在调用这个方法的情况设置finishiGetUser
  bindGetUserInfo(e) {//授权弹窗点击授权后
    var that = this
    if (e.detail.userInfo) {
      var thisUserinfo = jsuserinfo.getUserInfo(e);
      that.setDataForUser(thisUserinfo);
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

  //选择机构
  bindPickerChange(e) {
    this.setData({
      index: e.detail.value,
      selectins: this.data.cularray[e.detail.value]
    })
  },
  //查看课表
  previewImg: function (e) {
    var thisurl = this.data.imagePaths[0]
    wx.previewImage({
      urls: [thisurl],// 预览图片组的url
    })
  },
  //上传文件方法组
  uploadShedule: function (e){
    var that = this
    wx.chooseImage({
      count: 1,
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

  // 输入框输入方法组
  inputValue: function (e) {
    this.compareValue(e.currentTarget.dataset.input, e.detail.value)
  },
  compareValue: function(datacol,value){
    this.setData({ [datacol]: value })
    if (datacol == 'fee' && value != '') {
      if (value > 36000) {
        this.setData({
          discount: value * 0.1,
          discountfold: '9',
          payment: value * 0.9,
        })
      } else {
        this.setData({
          discount: value * 0.05,
          discountfold: '9.5',
          payment: value * 0.95,
        })
      }
    }
  },
  //提交订单
  confirmPostOrder: function (e){
    var that = this
    wx.showModal({
      title: '提交订单',
      content: '是否确认提交？',
      success: function (res) {
        if (res.confirm) {
          that.postOrder()
        }
      }
    })
  },
  // 提交订单信息
  postOrder: function () {
    var that = this
    var thiscontent = that.data.content
    thiscontent = replaceStr.filterEmoji(thiscontent)
    //候补js认证，输入类型等
    if (that.data.selectins != '请选择机构' && that.data.content != '' && that.data.ctime != '' && that.data.fee != ''){
      wx.request({
        url: getApp().globalData.requestUrl + 'ashx/getPostOrder.ashx',
        method: 'post',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: util.json2Form({
          licence: app.globalData.requestLicence,
          openid: app.globalData.wxopenid,
          ordernumber: util.getOrderNum(),//创建合同号
          content: thiscontent,
          ctime: that.data.ctime,
          fee: that.data.fee,
          payment: that.data.payment,
          imageid: that.data.imageReturnID[0],
          selectins: that.data.selectins,
        }),
        success: function (result) {
          var turnurl = '/order/user/order?id=' + result.data
          var thisModalContent = '请在跳转后，将页面转发给用户'
          if (that.data.fromuser == 'self') {
            thisModalContent = '请跳转后，在页面验证身份支付订单'
            turnurl += '&fromuser=self'
          }
          wx.showModal({
            title: '生成订单成功',
            content: thisModalContent,
            showCancel: false,
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: turnurl,
                })
              }
            }
          })
        }
      })
    }else{
      wx.showModal({
        title: '未填写完整信息',
        content: '机构、课程内容、课程时间与课程总价不能为空！',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            
          }
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.fromuser == undefined){
      this.setData({
        fillHeight: app.globalData.fillHeight,
      })
    }else{
      this.setData({
        fillHeight: app.globalData.fillHeight,
        fromuser: options.fromuser
      })
    }
    var that = this
    //登录授权方法
    that.resetUserInfo(options)
    //判断手机型号，加载填充view
    if (getApp().globalData.isIphoneX != '') {
      that.setData({
        isIphoneX: getApp().globalData.isIphoneX,
      })
    }
    that.requestDataForPage(options)
  },

  // 验证该用户是否已经绑定过机构
  requestDataForPage: function (opt) {
    var that = this
    if (app.globalData.wxopenid != '') {
      wx.request({
        url: app.globalData.requestUrl + 'organization/bind/confirm.aspx',
        data: {
          licence: app.globalData.requestLicence,
          wxopenid: app.globalData.wxopenid,
          fromuser: opt.fromuser,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (result) {
          if (result.data == 'N') {
            wx.showModal({
              title: '您还未绑定机构',
              content: '将会跳转至机构绑定页面！',
              showCancel: false,
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../../organization/bind/cultivate',
                  })
                }
              }
            })
          }else if (result.data.length > 0 && result.data != 'N'){
            var cularray = result.data
            that.setData({
              cularray: cularray
            })
            if(opt.cultivate){//如果用户带着机构参数
              var culindex = 0
              var coursetime = 1
              var coursetitle = opt.coursename
              var coursefee = opt.fee
              that.compareValue('fee', coursefee)//执行对比折扣的js
              var cultivate = opt.cultivate
              for (var icul = 0; icul < cularray.length; icul++) {
                if(cularray[icul] == opt.cultivate){
                  culindex = icul
                }
              }
              that.setData({
                index: culindex,
                selectins: cultivate,
                ctime: 1,
                fee: coursefee,
                content: coursetitle
              })
            }
          }
        }
      })
    } else {
      setTimeout(function () { that.requestDataForPage(opt) }, 300)
    }
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
// order/user/order.js
const app = getApp()
var replaceStr = require('../../js/replace.js');
var md5 = require('../../utils/md5.js');
var util = require('../../utils/util.js');
var jsuserinfo = require('../../js/userinfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowsHeight: 0,
    name: '',
    phone: '',
    verify: '',
    canPostVerify: true,
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

  //查看课表
  previewImg: function () {
    var thisurl = this.data.order.Shedule
    wx.previewImage({
      urls: [thisurl],// 预览图片组的url
    })
  },

  //验证手机号
  verifyPhone: function(){
    this.setData({ windowsHeight: app.globalData.windowHeight })
  },
  //获取验证码
  postVerify: function(){
    var that = this
    //手机号验证
    if (that.data.phone.length == 11) {
      that.setData({ canPostVerify: false })
      //开始倒计时
      var countDownNum = '60';//获取倒计时初始值
      //如果将定时器设置在外面，那么用户就看不到countDownNum的数值动态变化，所以要把定时器存进data里面
      that.setData({
        timer: setInterval(function () {//这里把setInterval赋值给变量名为timer的变量
          //每隔一秒countDownNum就减一，实现同步
          countDownNum--;
          //然后把countDownNum存进data，好让用户知道时间在倒计着
          that.setData({
            countDownNum: countDownNum
          })
          //在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
          if (countDownNum == 0) {
            //这里特别要注意，计时器是始终一直在走的，如果你的时间为0，那么就要关掉定时器！不然相当耗性能
            //因为timer是存在data里面的，所以在关掉时，也要在data里取出后再关闭
            clearInterval(that.data.timer);
            that.setData({ canPostVerify: true })
            //关闭定时器之后，可作其他处理codes go here
          }
        }, 1000)
      })
      wx.request({
        url: app.globalData.requestUrl + 'public/verify.aspx',
        data: {
          phone: that.data.phone,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (result) {
          that.setData({ code: result.data })
        }
      })
    }else{
      wx.showModal({
        title: '手机号输入错误',
        content: '请填写正确的11位手机号',
        showCancel: false,
        success: function (res) {
          
        }
      })
    }
  },

  // 输入框输入方法组
  inputValue: function (e) {
    var thisinput = e.currentTarget.dataset.input
    this.setData({
      [thisinput]: e.detail.value
    })
  },

  //提交订单
  postOrder: function(){
    wx.showLoading({
      title: '订单生成中……',
    })
    var that = this
    wx.request({
      //后台生成预支付订单
      url: app.globalData.requestUrl + 'wxpay/unifiedorder.aspx',
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        ordernumber: that.data.order.OrderNumber,
        payment: that.data.order.Payment,//合同金额
        orderid: that.data.order.ID,//本地合同数据的ID
        openid: app.globalData.wxopenid,
        phone: that.data.phone,
        name: that.data.name,
      },
      success: function (result) {
        var prepay_id = result.data//预支付返回的id
        var noncestr = util.createCode()
        //日期转时间戳
        var time = util.formatTime(new Date())
        var timestamp = Date.parse(time);
        timestamp = timestamp / 1000;
        timestamp = timestamp.toString()
        var packageNo = 'prepay_id=' + prepay_id
        //MD5签名
        var stringA = md5.hexMD5('appId=' + app.globalData.myappid + '&nonceStr=' + noncestr + '&package=' + packageNo + '&signType=MD5&timeStamp=' + timestamp + '&key=' + app.globalData.myplatformkey)
        stringA = stringA.toUpperCase()

        var status = 1;
        //request请求
        wx.requestPayment({
          'timeStamp': timestamp,
          'nonceStr': noncestr,
          'package': packageNo,
          'signType': 'MD5',
          'paySign': stringA,
          'success': function (res) {
            status = 2
          },
          'fail': function (res) {
            status = 4
          },
          'complete': function (res) { //complete无论成功与否都会执行
            var statustitle = ''
            if (status == 1) {
              statustitle = '待支付'
            } else if (status == 2) {
              statustitle = '已成功支付订单'
            } else {
              statustitle = '已取消支付订单'
            }
            that.postUpdateOrderStatus(status, statustitle)
          },
        })
      },
      fail: function (result) {
        //console.log(result.data)
      }
    })
  },

  postUpdateOrderStatus: function (e,stitle) {//1:待支付、2:已支付、3:已过期、4:已取消
    var that = this
    wx.request({
      url: app.globalData.requestUrl + 'wxpay/updateorderstatus.aspx',
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        orderid: that.data.order.ID,//本地合同数据的ID
        status: e,
        openid: app.globalData.wxopenid,
      },
      success: function (result) {
        wx.hideLoading()
        wx.showModal({
          title: stitle,
          content: '请联系我们处理订单',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../../pages/index/index',
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
    wx.showLoading({
      title: '加载中……',
    })
    this.setData({
      fillHeight: app.globalData.fillHeight,
      id: options.id,
    })
    var that = this
    //登录授权方法
    that.resetUserInfo(options)
    //判断手机型号，加载填充view
    if (getApp().globalData.isIphoneX != '') {
      that.setData({
        isIphoneX: getApp().globalData.isIphoneX,
      })
    }
    that.requestData(options.id)
    that.requestDataForPage(options.fromuser)
  },

  // 验证该用户是否已经绑定过机构
  requestDataForPage: function (fromuser) {
    var that = this
    if (app.globalData.wxopenid != '') {
      wx.request({
        url: app.globalData.requestUrl + 'organization/bind/confirm.aspx',
        data: {
          licence: app.globalData.requestLicence,
          wxopenid: app.globalData.wxopenid,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (result) {
          if (result.data != 'N' && fromuser != 'self') {
            that.setData({ orderstate: 'Create' })
          }
        }
      })
    } else {
      setTimeout(function () { that.requestDataForPage() }, 300)
    }
  },
  //请求订单数据
  requestData: function(){
    var that = this
    if (app.globalData.wxopenid != '' && that.data.id != undefined) {
      wx.request({
        url: app.globalData.requestUrl + 'response/user/order.aspx',
        data: {
          licence: app.globalData.requestLicence,
          openid: app.globalData.wxopenid,
          id: that.data.id,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (result) {
          if(result.data != 'no data'){
            that.setData({ order: result.data.order })
          }else{
            wx.showModal({
              title: '这是一个不存在的订单或已经支付的订单',
              content: '请通过咨询小管家联系我们',
              showCancel: false,
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../../pages/index/index',
                  })
                }
              }
            })
          }
          wx.hideLoading()
        }
      })
    } else {
      setTimeout(function () { that.requestData() }, 500)
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
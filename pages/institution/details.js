// pages/institution/details.js
var app = getApp()
var util = require('../../utils/util.js');
var checkdatatime = require('../../js/checkdatatime.js');
var jsuserinfo = require('../../js/userinfo.js');
const recorderManager = wx.getRecorderManager()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    yearsRange:[],
    region:0,
    isIphoneX: app.globalData.isIphoneX,
    selectNav: 'dt',
    conditiontitle: '[1]',//条件组title的变量
    conditionview: 'close',//打开搜索条件时，覆盖view的变量
    conditioncontent: '[1][2][3]',//实际的搜索条件
    conditioncontenttemp: '[1][2][3]',//用于打开搜索条件后点选时的临时条件变量，若没有点击确认，需要回复到最初
    isAudioPlay: 'no',
    audioDuration: 0,
    audiostatus: 'playAudio',
    imagePaths: [],
    //defaultImageGroup: [],//最新高分的默认图片
    //登录获取用户信息data组
    userInfo: {},
    hasUserInfo: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserPhone: app.globalData.hasUserPhone,
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
  clickCollect: function (e){
    var that = this
    if (app.globalData.finishGetUser != 'got') {
      wx.showModal({
        title: '请先授权',
        content: '您需要先授权，才可点击收藏按钮，并在个人中心中找到这些收藏。',
        success: function (res) {
          if (res.confirm) {
            that.setData({ hasUserInfo: false })//如果没有获得taoraiseid，弹出授权框
          }
        }
      })
    } else {
      var collectvalue = this.data.insdetail.Collect
      if(collectvalue == 'Y'){
        collectvalue = '0'//代表收藏变成未收藏
      }else{
        collectvalue = '1'//代表未收藏变成收藏
      }
      getApp().clickCollect('ins',this.data.insid,collectvalue)
      this.requestDataAgainToSet(collectvalue)
    }
  },
  //咨询小管家
  handleContact: function (e) {
    app.HandleContact(e)
  },

  //图片和音频方法组
  setDefaultImage: function (e) {
    var changeUrl = 'defaultImageGroup[' + e.currentTarget.dataset.commentlistindex + '].ImageUrl'
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

  turnToTeacher: function (e){
    wx.navigateTo({
      url: 'teacher?teacherid=' + e.currentTarget.dataset.teacherid,
    })
  },
  selectDetailNav: function (e){
    this.setData({ selectNav:e.currentTarget.dataset.nav })
  },
  gotoCommemt: function (e) {
    wx.navigateTo({
      url: '../comment/default?objtype=3&objid=' + this.data.insid,
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
      that.checkUserPhone()//处理手机号授权
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
          that.checkUserPhone()//处理手机号授权
        } else {//没有授权弹出授权窗口
          //授权状态结束
          this.setData({
            hasUserInfo: false,
            hasUserPhone: false,//没有授权时，同时弹出手机授权窗
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
  //手机号授权窗口
  checkUserPhone(){
    var that = this
    var hasuserphone = app.globalData.hasUserPhone;
    if(hasuserphone != 'notsure'){
      that.setData({ hasUserPhone: hasuserphone })
    }else{
      setTimeout(function () {
        that.checkUserPhone()
      }, 300)//间隔0.3秒
    }
  },
  resetGetPhone(){
    var that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {// 已经授权
          that.setData({ hasUserPhone: 'false' })
        } else {//没有授权弹出授权窗口
          that.setData({
            hasUserInfo: false,
            hasUserPhone: false,//没有授权时，同时弹出手机授权窗
          })
        }
      }
    })
  },
  getPhoneNumber(e) {
    var that = this
    if (e.detail.iv != undefined) {
      wx.request({
        url: getApp().globalData.requestUrl + 'ashx/getPostPhoneNumber.ashx',
        method: 'post',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: util.json2Form({
          openid: app.globalData.wxopenid,
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData,
        }),
        success: function (result) {
          console.log(result);
          jsuserinfo.setUserInfo(app.globalData.userInfo);
          that.setData({ hasUserPhone: 'true' })
        }
      })
    }else{
      //未同意授权
      that.setData({ hasUserPhone: 'unauthorized' })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ fillHeight: app.globalData.fillHeight })
    let yersarr = [].concat(app.globalData.yearsRange);
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

    var yearnow = new Date().getFullYear()
    var time = util.formatTime(new Date())
    that.setData({ 
      yearnow: yearnow, 
      insid: options.insid, 
      time:time,
      yearsRange: yersarr.splice(0, 3)
    })
    //校验数据获取时间，超过间隔时间获取一次新的数据
    var insdetailtime = wx.getStorageSync('insdetailtime_' + options.insid)
    if (!checkdatatime.countDiffer(time, insdetailtime)) {
      that.requestDataForPage(options)
    } else {
      var insdetaildata = wx.getStorageSync('insdetaildata_' + options.insid)
      that.setDataForPage(insdetaildata)
    }
    // var that = this
    // var query = wx.createSelectorQuery();
    // query.select('.ins_ascx_teacherlist_groupview').boundingClientRect()
    // query.exec((res) => {
    //   that.setData({
    //     blockheight: res[0].height,
    //   })
    // })
  },

  // 榜单年份选择
  bindRegionChange: function (e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      region: index
    })
    this.getAdmissions()
  },

  //等待授权状态结束后，更新collect
  requestDataAgain: function (e,status) {
    var that = this
    if (app.globalData.finishGetUser == status) {//如果确认了授权状态
      if (app.globalData.taoraiseid != "") {
        wx.request({
          url: app.globalData.requestUrl + 'response/institution/detail_again.aspx',
          data: {
            licence: app.globalData.requestLicence,
            insid: e.insid,
            taoraiseid: app.globalData.taoraiseid,
            nav: 'ins',
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (result) {
            if(result.data == '1'){
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
  requestDataAgainToSet: function (e){
    var that = this
    //更新页面数据appdata
    var setdatachange = 'insdetail.Collect'
    var thiscollect = 'N'
    if(e == '1'){
      thiscollect = 'Y'
    }
    that.setData({ [setdatachange]: thiscollect })
    //更改缓存数据，并存储，延迟1秒，已免报错
    setTimeout(function(){
      var thispagedata = wx.getStorageSync('insdetaildata_' + that.data.insid)
      thispagedata.insdetail[0].Collect = thiscollect
      wx.setStorageSync('insdetaildata_' + that.data.insid, thispagedata)
    },1000)
  },
  //实际数据请求，可以先执行，授权后更新collect
  requestDataForPage: function (e) {
    var that = this;
    this.getAdmissions()
    wx.request({
      url: app.globalData.requestUrl + 'response/institution/detail.aspx',
      data: {
        licence: app.globalData.requestLicence,
        insid: e.insid,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        wx.setStorageSync('insdetailtime_' + e.insid, that.data.time)
        wx.setStorageSync('insdetaildata_' + e.insid, result.data)
        that.setDataForPage(result.data)
      }
    })
  },
  //页面存储数据
  setDataForPage: function (e) {
    this.setData({
      insdetail: e.insdetail[0],
      teacherlist: e.teacherlist,
      thislistpush: e.teacherlist,
      outstandingcase: e.outstandingcase,
      commentlist: e.commentlist,
      // defaultImageGroup: buildImageGroup,
    })
    wx.hideLoading()
  },

  // 录取榜单
  getAdmissions: function(){
    const { yearsRange, region=0 } = this.data;
    let that = this;
    const { insid } = this.data;
    wx.request({
      url: app.globalData.requestUrl + 'response/institution/rank.aspx',
      data: {
        licence: app.globalData.requestLicence,
        insid,
        year: yearsRange[region],
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (result) {
        const { data={} } = result;
        console.log("data", data)
        that.setData({ 
          admissionlist: data.admissionlist,
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

  // 条件筛选方法组 —— 开始
  openCondition: function (e) {
    var thisconditiontitle = e.currentTarget.dataset.conditiontitle
    if (thisconditiontitle == 'closeCondition') {
      //如果用户没有点击确认和重置按钮，直接点击了覆盖view，希望关掉条件搜索时
      var thisconditioncontent = this.data.conditioncontent
      //因为没有点击确认，所以需要根据实际的条件判断条件组的title的样式
      thisconditiontitle = ''
      if (thisconditioncontent.indexOf('[1]') > -1 || thisconditioncontent.indexOf('[2]') > -1 || thisconditioncontent.indexOf('[3]') > -1) {
        thisconditiontitle += '[1]'
      }
      if (this.data.Lowpricetemp != "" && this.data.Lowpricetemp != null && this.data.Highpricetemp != "" && this.data.Highpricetemp != null) {
        thisconditiontitle += '[2]'
      }
      if (thisconditioncontent.indexOf('[7]') > -1 || thisconditioncontent.indexOf('[8]') > -1 || thisconditioncontent.indexOf('[9]') > -1) {
        thisconditiontitle += '[3]'
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
      conditioncontent: '[1][2][3]',
      conditioncontenttemp: '[1][2][3]',
      thislistpush: this.data.teacherlist,
      Lowpricetemp: '',
      Highpricetemp: '',
    })
  },
  confirmConditionContent: function () {
    var confirmtitle = ''
    if (this.data.conditioncontenttemp.indexOf('[1]') > -1 || this.data.conditioncontenttemp.indexOf('[2]') > -1 || this.data.conditioncontenttemp.indexOf('[3]') > -1) {
      confirmtitle += '[1]'
    }
    if (this.data.Lowpricetemp != "" && this.data.Lowpricetemp != null && this.data.Highpricetemp != "" && this.data.Highpricetemp != null) {
      var regNumLow = new RegExp('^[0-9]*$', 'g');//判断用户输入的是否为数字
      var rexNumLow = regNumLow.exec(this.data.Lowpricetemp)
      var regNumHigh = new RegExp('^[0-9]*$', 'g');//判断用户输入的是否为数字
      var rexNumHigh = regNumHigh.exec(this.data.Highpricetemp)
      //必须单独分开定义正则式
      if (rexNumLow && rexNumHigh && this.data.Highpricetemp >= this.data.Lowpricetemp) {
        confirmtitle += '[2]'
      } else {
        var that = this
        wx.showModal({
          title: '输入有误',
          content: '必须输入数字（整数），并且最高价格需大于等于最低价格。',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              that.setData({
                conditionview: 'open',
                conditiontitle: '[2]',
              })
            }
          }
        })
      }
    }
    if (this.data.conditioncontenttemp.indexOf('[7]') > -1 || this.data.conditioncontenttemp.indexOf('[8]') > -1 || this.data.conditioncontenttemp.indexOf('[9]') > -1) {
      confirmtitle += '[3]'
    }
    this.setData({
      conditiontitle: confirmtitle,
      conditionview: 'close',
      conditioncontent: this.data.conditioncontenttemp,
    })
    this.pushNewList()
  },
  //筛选条件输入框的方法组
  getLowprice: function (e) {
    this.setData({ Lowpricetemp: e.detail.value })
  },
  getHighprice: function (e) {
    this.setData({ Highpricetemp: e.detail.value })
  },
  //筛选后，重新组合数组
  pushNewList: function () {
    var thislist = this.data.teacherlist
    var result;
    var containid_123 = ''
    var containid_456 = ''
    var containid_789 = ''
    for (var ilist = 0; ilist < thislist.length; ilist++) {
      var thiscondition = this.data.conditioncontent
      var regex = /\[(.+?)\]/g;
      //筛选条件组1
      if (thiscondition.indexOf('[1]') <= -1 && thiscondition.indexOf('[1]') <= -1 && thiscondition.indexOf('[1]') <= -1) {//如果没有选择任何一个条件，则id都符合条件
        containid_123 += '[' + thislist[ilist].ID + ']'
      } else {
        while ((result = regex.exec(thiscondition)) != null) {
          if (result[1] == 1) {
            if (thislist[ilist].Education == "学士") { containid_123 += '[' + thislist[ilist].ID + ']' }
          }
          if (result[1] == 2) {
            if (thislist[ilist].Education == "硕士") { containid_123 += '[' + thislist[ilist].ID + ']' }
          }
          if (result[1] == 3) {
            if (thislist[ilist].Education.indexOf('博士') > -1) { containid_123 += '[' + thislist[ilist].ID + ']' }
          }
        }
      }
      //筛选条件组2
      if ((this.data.Lowpricetemp == "" || this.data.Lowpricetemp == null) && (this.data.Highpricetemp == "" || this.data.Highpricetemp == null)) {
        containid_456 += '[' + thislist[ilist].ID + ']'
      } else {
        if (util.mathFeeRound(thislist[ilist].ClassFee) >= parseInt(this.data.Lowpricetemp) && util.mathFeeRound(thislist[ilist].ClassFee) <= parseInt(this.data.Highpricetemp)) {
          //需要转化为数字才能计算，或者通过进行计算转化为数字
          containid_456 += '[' + thislist[ilist].ID + ']'
        }
      }
      //筛选条件组3
      if (thiscondition.indexOf('[7]') <= -1 && thiscondition.indexOf('[8]') <= -1 && thiscondition.indexOf('[9]') <= -1) {//如果没有选择任何一个条件，则id都符合条件
        containid_789 += '[' + thislist[ilist].ID + ']'
      } else {
        while ((result = regex.exec(thiscondition)) != null) {
          if (result[1] == 7) {
            if (thislist[ilist].Years <= 5) { containid_789 += '[' + thislist[ilist].ID + ']' }
          }
          if (result[1] == 8) {
            if (thislist[ilist].Years > 5 && thislist[ilist].Years <= 10) { containid_789 += '[' + thislist[ilist].ID + ']' }
          }
          if (result[1] == 9) {
            if (thislist[ilist].Years > 10) { containid_789 += '[' + thislist[ilist].ID + ']' }
          }
        }
      }
    }
    var pushlist = []
    for (var ipush = 0; ipush < this.data.teacherlist.length; ipush++) {
      var newid = '[' + thislist[ipush].ID + ']'
      if (containid_123.indexOf(newid) > -1 && containid_789.indexOf(newid) > -1 && containid_456.indexOf(newid) > -1) {
        pushlist.push(thislist[ipush])
      }
    }
    this.setData({
      thislistpush: pushlist,
    })
  },
  // 条件筛选方法组 —— 结束
})
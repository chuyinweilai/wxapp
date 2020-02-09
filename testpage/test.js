// testpage/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pickeobjrarray: [{
      id: 3, name: '顾问'
    }, {
      id: 5, name: '语培'
    }, {
      id: 2, name: '寄宿'
    }, {
      id: 4, name: '夏令营'
    }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var newlist = []
    var newnewlist = []
    console.log(this.data.pickeobjrarray[0].id)
    this.data.pickeobjrarray[0].id = parseInt(this.data.pickeobjrarray[0].id) + 1
    console.log(this.data.pickeobjrarray[0].id)
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
//对比缓存中的search
function returnSearchResult(nav,value){
  if (value != '' && value != '搜索') {
    var searchvalue = wx.getStorageSync('search')
    var thissearchvalue = {}
    thissearchvalue.nav = nav
    thissearchvalue.value = value
    if (searchvalue != null && searchvalue != '') {
      var pushthissearch = true //是否在缓存里加入这个搜索条件，默认是
      for (var isearch = 0; isearch < searchvalue.length; isearch++) {
        if (searchvalue[isearch].nav == nav && searchvalue[isearch].value == value) {
          pushthissearch = false //当判断如果缓存里的search中已经有这个搜索条件了，则不再添加这个条件
        }
      }
      if (pushthissearch == true) {
        searchvalue.push(thissearchvalue)
      }
    } else {
      searchvalue = []
      searchvalue.push(thissearchvalue)
    }
    wx.setStorageSync('search', searchvalue)
    return true//是否继续执行
  }else{
    return false
  }
}

module.exports = {
  returnSearchResult: returnSearchResult,
}
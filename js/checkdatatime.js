function countDiffer(timenow, differtime){
  var start_date = new Date(differtime.replace(/-/g, "/"));
  var end_date = new Date(timenow.replace(/-/g, "/"));
  //转成毫秒数，两个日期相减
  var differ = end_date.getTime() - start_date.getTime();
  var minutes = parseInt(differ / (1000 * 60))
  //转换成天数
  //var day = parseInt(days / (1000 * 60 * 60 * 24));
  if (minutes <= getApp().globalData.differForTakingDataTime){
    return true;
  }else{
    return false;
  }
}

module.exports = {
  countDiffer: countDiffer,
}
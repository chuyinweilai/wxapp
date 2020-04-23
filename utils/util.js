const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const getOrderNum = string =>{
  var timestamp = Date.parse(new Date());
  var timestring = new Date()
  //年
  var year = timestring.getFullYear();
  //月
  var month = (timestring.getMonth() + 1 < 10 ? '0' + (timestring.getMonth() + 1) : timestring.getMonth() + 1);
  //日
  var day = timestring.getDate() < 10 ? '0' + timestring.getDate() : timestring.getDate();
  //时
  var hour = timestring.getHours() < 10 ? '0' + timestring.getHours() : timestring.getHours();
  //分
  var minute = timestring.getMinutes() < 10 ? '0' + timestring.getMinutes() : timestring.getMinutes();
  //秒
  var second = timestring.getSeconds() < 10 ? '0' + timestring.getSeconds() : timestring.getSeconds();
  //获取毫秒
  var millisecond = new Date(timestamp).getMilliseconds();
  var stringnon = 'wx' + year + month + day + hour + minute + second + millisecond
  return stringnon
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function json2Form(json) {
  var str = [];
  for (var p in json) {
    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(json[p]));
  }
  return str.join('&');
}

function mathFeeRound(val){
  val = val * 6.8 / 1000 //为了保留千位，除以1000
  val = Math.ceil(val) //保留整数
  val = val * 1000 //返回千位
  return val
}

function createCode() {//随机字符串
  var code;
  //首先默认code为空字符串
  code = '';
  //设置长度，这里看需求
  var codeLength = 20;
  //设置随机字符
  var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
  //循环codeLength
  for (var i = 0; i < codeLength; i++) {
    //设置随机数范围,这设置为0 ~ 36
    var index = Math.floor(Math.random() * 36);
    //字符串拼接 将每次随机的字符 进行拼接
    code += random[index];
  }
  return code
}


/**
 * 获取屏幕的宽高
 */

let windowWidth = 0
let windowHeight = 0
wx.getSystemInfo({
  success(res) {
    windowWidth = res.windowWidth
    windowHeight = res.windowHeight
  }
})

const getSystemInfo = () => {
  return [windowWidth, windowHeight]
}

module.exports = {
  getSystemInfo,
  formatTime: formatTime,
  json2Form: json2Form,
  mathFeeRound: mathFeeRound,
  getOrderNum: getOrderNum,
  createCode: createCode,
}
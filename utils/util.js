var config = require('./config/config.js');
import { myStore } from './tools/store';
import { tools } from './tools/tools';

function getNowFormatDate(){  //yyyy-MM-dd HH:MM:SS”
  var date = new Date();
  var seperator1 = "/"; 
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + date.getHours() + seperator2 + date.getMinutes()
    + seperator2 + date.getSeconds();
  return currentdate;
}

//计算距离 纬度 经度 返回单位米
function calcDistance(lat1, lng1, lat2, lng2) {
  var dis = 0;
  var radLat1 = lat1 * Math.PI / 180;
  var radLat2 = lat2 * Math.PI / 180;
  var deltaLat = radLat1 - radLat2;
  var deltaLng = lng1 * Math.PI / 180 - lng2 * Math.PI / 180;
  var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  return dis * 6378137;
}

//换算长度 低于1000返回米，否则返回公里
function transformLength(len) {
  if (!len || Math.abs(len) <= 0.000001) {
    return "0m";
  }
  if (len < 1000) {
    return len.toFixed(0) + "m";
  }
  else {
    return (len / 1000).toFixed(1) + "km";
  }
}

function utf16toEntities(str) {  //将emoji表情转为字符进行存储 
  var patt = /[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则 
  str = str.replace(patt, function (char) {
    var H, L, code;
    if (char.length === 2) {
      H = char.charCodeAt(0); // 取出高位 
      L = char.charCodeAt(1); // 取出低位 
      code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法 
      return "&#" + code + ";";
    } else {
      return char;
    }
  });
  return str;
}

function uncodeUtf16(str) {  //反解开EMOJI编码后的字符串   与上对应使用
  var reg = /\&#.*?;/g;
  var result = str.replace(reg, function (char) {
    var H, L, code;
    if (char.length == 9) {
      code = parseInt(char.match(/[0-9]+/g));
      H = Math.floor((code - 0x10000) / 0x400) + 0xD800;
      L = (code - 0x10000) % 0x400 + 0xDC00;
      return unescape("%u" + H.toString(16) + "%u" + L.toString(16));
    } else {
      return char;
    }
  });
  return result;
}

function timeDiffrence(current, updateTime, createTime) {      //文章发布时间 
  let createT = '', timestamp = 0, str = '暂无';
  updateTime = updateTime?updateTime.replace(/-/g, "/"):''; 
  updateTime = updateTime ? updateTime : createTime;
  if (updateTime != null && updateTime != '') {
    createT = new Date(updateTime).getTime();
    timestamp = (+current - createT) / 1000;
    if (timestamp / 31536000 > 1 || timestamp / 31536000 == 1) {
      str = Math.floor(timestamp / 60 / 60 / 24 / 365) + '年前';
    } else if (timestamp / 2592000 > 1 || timestamp / 2592000 == 1) {
      str = Math.floor(timestamp / 60 / 60 / 24 / 30) + '个月前';
    } else if (timestamp / 86400 > 1 || timestamp / 86400 == 1) {
      str = Math.floor(timestamp / 60 / 60 / 24) + '天前';
    } else if (timestamp / 3600 > 1 || timestamp / 3600 == 1) {
      str = Math.floor(timestamp / 60 / 60) + '小时' + Math.floor((timestamp % 3600) / 60) + '分钟前';
    } else if (timestamp / 60 > 1 || timestamp / 60 == 1) {
      str = Math.floor(timestamp / 60) + '分钟前';
    } else {
      str = '刚刚发布';
    }
  }
  return str;
}

function reciprocal(cleartime){  //倒计时
  if (!cleartime){
    return 'no'
    return false
  }
  cleartime = new Date(cleartime);
  // cleartime = cleartime ? cleartime.replace(/-/g, "/") : '';
  let start = cleartime.getTime(); 
  start = start+ 1*60*1000;
  let date = new Date();
  let now = date.getTime();
  let leftTime = start - now; 
  let  d, h, m, s;
  if (leftTime >= 0) {
    d = Math.floor(leftTime / 1000 / 60 / 60 / 24);  //天
    h = Math.floor(leftTime / 1000 / 60 / 60 % 24);  //时
    m = Math.floor(leftTime / 1000 / 60 % 60);  //分
    s = Math.floor(leftTime / 1000 % 60);  //秒
    if(s!=0){
      return s + '秒后重发'
    }
  } else{
    return 'yes'
  }
}

function million(num){    //数字过万处理
  return num > 9999 ? (Math.floor(num / 1000) / 10) + '万+' : num
}

function dateConv(dateStr,type) {  //   yyyy/mm/dd
  let year = dateStr.getFullYear(),
    month = dateStr.getMonth() + 1,
    today = dateStr.getDate();
  month = month > 9 ? month : "0" + month;
  today = today > 9 ? today : "0" + today;
  if(type == '-'){
    return year + "-" + month + "-" + today;
  }else{
    return year + "/" + month + "/" + today;
  }
}
 // 升序排序
function compareUp(propertyName) {
  if ((typeof data[0][propertyName]) != "number") { // 属性值为非数字
    return function (object1, object2) {
      var value1 = object1[propertyName];
      var value2 = object2[propertyName];
      return value1.localeCompare(value2);
    }
  }
  else {
    return function (object1, object2) { // 属性值为数字
      var value1 = object1[propertyName];
      var value2 = object2[propertyName];
      return value1 - value2;
    }
  }
}
// 降序排序
function compareDown(propertyName) { 
  if ((typeof data[0][propertyName]) != "number") { // 属性值为非数字
    return function (object1, object2) {
      var value1 = object1[propertyName];
      var value2 = object2[propertyName];
      return value2.localeCompare(value1);
    }
  }
  else {
    return function (object1, object2) { // 属性值为数字
      var value1 = object1[propertyName];
      var value2 = object2[propertyName];
      return value2 - value1;
    }
  }
}

let getQueryString = function (url, name) {  //识别普通二维码，跳转到指定商家页面
  // console.log("url = " + url)
  // console.log("name = " + name)
  var reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i')
  var r = url.substr(1).match(reg)
  if (r != null) {
    // console.log("r = " + r)
    // console.log("r[2] = " + r[2])
    return r[2]
  }else{
    return null;
  }
  
}



module.exports = {
  calcDistance: calcDistance,
  transformLength: transformLength,
  utf16toEntities: utf16toEntities,
  uncodeUtf16: uncodeUtf16,
  timeDiffrence: timeDiffrence,
  store: myStore,
  tools: tools,
  million: million,
  getNowFormatDate: getNowFormatDate,
  reciprocal: reciprocal,
  getQueryString: getQueryString,
  dateConv: dateConv,
  compareUp: compareUp,
  compareDown: compareDown
}

// const formatTime = date => {
//   const year = date.getFullYear()
//   const month = date.getMonth() + 1
//   const day = date.getDate()
//   const hour = date.getHours()
//   const minute = date.getMinutes()
//   const second = date.getSeconds()

//   return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
// }

// const formatNumber = n => {
//   n = n.toString()
//   return n[1] ? n : '0' + n
// }

// module.exports = {
//   formatTime: formatTime
// }


var config = require('./config/config.js');


import { myStore } from './tools/store';
import { tools } from './tools/tools';


function formatTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

function formatDate(date, split) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return [year, month, day].map(formatNumber).join(split || '');
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n
}

//格式化时间
function formatDateTime(date, fmt) {
  var o = {
    "M+": date.getMonth() + 1, //月份 
    "d+": date.getDate(), //日 
    "h+": date.getHours(), //小时 
    "m+": date.getMinutes(), //分 
    "s+": date.getSeconds(), //秒 
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
    "S": date.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

//设置默认图片
function getUserDefaultImg(img) {
  if (!img) {
    return "/image/person/default_pic.png";
  }
  return getImgPath(img);
}
//直接用默认图片
function getUserCommonImg() {
  return "/image/person/default_pic.png";
}

//设置图片网络路径
function getImgPath(value) {
  if (typeof (value) != undefined && value && (value.indexOf("http") != 0 && value.indexOf("//") != 0)) {
    return config.imgbaseurl + value;
  } else if (value && 0 == value.indexOf("http") && value.indexOf("www.huaaotech.date") > 0) {
    value = value.replace("www.huaaotech.date", config.domain);
  } else if (value && 0 == value.indexOf("http") && value.indexOf("www.huaaotech.tech") > 0) {
    value = value.replace("www.huaaotech.tech", config.domain);
  }
  return value;
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
    return "0米";
  }
  if (len < 1000) {
    return len.toFixed(0) + "米";
  }
  else {
    return (len / 1000).toFixed(2) + "公里";
  }
}

//获取配置信息
function getConfig() {
  return config;
}

//网页解码
function htmlDecode(str) {
  var s = "";
  if (str.length == 0) return "";
  s = str.replace(/&amp;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&nbsp;/g, " ");
  s = s.replace(/&#39;/g, "\'");
  s = s.replace(/&quot;/g, "\"");
  // s = s.replace(/&nbsp;/g, " ");  
  return s;
}

//提示消息
function toast(myType, msg, time) {
  // console.log("myType: ", myType);
  let _time = ((typeof (time) != undefined && time) ? time : 2000);

  if ("success" == myType) {
    wx.showToast({
      title: `${msg}`,
      icon: 'success',
      duration: _time
    })
  } else if ("error" == myType) {
    wx.showToast({
      title: `${msg}`,
      image: '/image/common/icon_toast_error.png',
      duration: _time
    })
  } else if ("warn" == myType) {
    wx.showToast({
      title: `${msg}`,
      image: '/image/common/icon_toast_warn.png',
      duration: _time
    })
  }
  else {
    wx.showToast({
      title: `${msg}`,
      image: '/image/common/icon_toast_info.png',
      duration: _time
    })
  }
}

//判断是否快速连续点击
let lastClickTime = 0;
function checkFastClick() {
  let curTimeStamp = (new Date()).valueOf();
  let timeSpan = curTimeStamp - lastClickTime;
  if (timeSpan > 0 && timeSpan < 1000) {
    return true;
  }
  lastClickTime = curTimeStamp;
  return false;
}

//判断是否是表情字符
function isEmojiCharacter(substring) {
  for (var i = 0; i < substring.length; i++) {
    var hs = substring.charCodeAt(i);
    if (0xd800 <= hs && hs <= 0xdbff) {
      if (substring.length > 1) {
        var ls = substring.charCodeAt(i + 1);
        var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
        if (0x1d000 <= uc && uc <= 0x1f77f) {
          return true;
        }
      }
    } else if (substring.length > 1) {
      var ls = substring.charCodeAt(i + 1);
      if (ls == 0x20e3) {
        return true;
      }
    } else {
      if (0x2100 <= hs && hs <= 0x27ff) {
        return true;
      } else if (0x2B05 <= hs && hs <= 0x2b07) {
        return true;
      } else if (0x2934 <= hs && hs <= 0x2935) {
        return true;
      } else if (0x3297 <= hs && hs <= 0x3299) {
        return true;
      } else if (hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030
        || hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b
        || hs == 0x2b50) {
        return true;
      }
    }
  }
}

module.exports = {
  getConfig: getConfig,
  formatTime: formatTime,
  formatDate: formatDate,
  formatDateTime: formatDateTime,
  getUserDefaultImg: getUserDefaultImg,
  getUserCommonImg: getUserCommonImg,
  getImgPath: getImgPath,
  calcDistance: calcDistance,
  transformLength: transformLength,
  htmlDecode: htmlDecode,
  checkFastClick: checkFastClick,
  isEmojiCharacter: isEmojiCharacter,
  toast: toast,
  store: myStore,
  tools: tools
}

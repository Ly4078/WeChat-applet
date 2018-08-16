import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js'
var utils = require('../../../../utils/util.js')
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    maxtime: "",
    isHiddenLoading: true,
    isHiddenToast: true,
    bargainList: [],
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0
  },
  onLoad: function() {
    this.setData({
      userId: app.globalData.userInfo.userId
    });
  },
  countDown(endTime) {
    var totalSecond = new Date(endTime).getTime() - Date.parse(new Date()) / 1000, isEnd = false, countDownHour = '', countDownMinute = '', countDownSecond = '';
    if (totalSecond < 0) {
      isEnd = true;
    } else {
      var interval = setInterval(function() {
        // 秒数
        var second = totalSecond;
        // 天数位
        var day = Math.floor(second / 3600 / 24);
        var dayStr = day.toString();
        if (dayStr.length == 1) dayStr = '0' + dayStr;
        // 小时位
        var hr = Math.floor((second - day * 3600 * 24) / 3600);
        var hrStr = hr.toString();
        if (hrStr.length == 1) hrStr = '0' + hrStr;
        // 分钟位
        var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
        var minStr = min.toString();
        if (minStr.length == 1) minStr = '0' + minStr;
        // 秒位
        var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
        var secStr = sec.toString();
        if (secStr.length == 1) secStr = '0' + secStr;
        countDownHour = hrStr;
        countDownMinute = minStr;
        countDownSecond = secStr;
        totalSecond--;
        if (totalSecond < 0) {
          clearInterval(interval);
        }
      }.bind(this), 1000);
    }
    return {
      isEnd: isEnd,
      countDownHour: '00',
      countDownMinute: '00',
      countDownSecond: '00'
    }
  },
  onShow: function() {
    this.vegetablesInquire(); //查询菜品
  },
  vegetablesInquire: function() { //查询菜品列表
    let _parms = {
      userId: this.data.userId
    };
    Api.bargainList(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data) {
        let list = res.data.data;
        for (let i = 0; i < list.length; i++) {
          list[i].isEnd = this.countDown(list[i].endTime).isEnd;
          list[i].countDownHour = this.countDown().countDownHour;
          list[i].countDownMinute = this.countDown().countDownMinute;
          list[i].countDownSecond = this.countDown().countDownSecond;
        }
        this.setData({
          bargainList: list
        });
      }
    });
  },
  bargainDetail(e) {
    let id = e.currentTarget.id,
      list = this.data.bargainList;
    for (let i = 0; i < list.length; i++) {
      if (list[i].skuId == id) {
        wx.navigateTo({
          url: '../AprogressBar/AprogressBar?groupId=' + list[i].groupId + '&shopId=' + list[i].shopId + '&refId=' + list[i].skuId + '&skuMoneyOut=' + list[i].skuMoneyOut + '&skuMoneyMin=' + list[i].skuMoneyMin
        })
        return false;
      }
    }
  }
})
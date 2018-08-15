import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js'
var utils = require('../../../../utils/util.js')
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    windowHeight: 654,
    maxtime: "",
    isHiddenLoading: true,
    isHiddenToast: true,
    dataList: {},
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    data:[],
    skuName:[],
    picUrl:[],
  },
  onLoad: function () {
    this.setData({
      windowHeight: wx.getStorageSync('windowHeight')
    });
  },

  // 页面渲染完成后 调用
  onReady: function () {
    var totalSecond = 1505540080 - Date.parse(new Date()) / 1000;
    var interval = setInterval(function () {
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
      this.setData({
        countDownHour: hrStr,
        countDownMinute: minStr,
        countDownSecond: secStr,
      });
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        wx.showToast({
          title: '活动已结束',
        });
        this.setData({
          countDownHour: '00',
          countDownMinute: '00',
          countDownSecond: '00',
        });
      }
    }.bind(this), 1000);
  },

  onShow: function () {
    this.vegetablesInquire(); //查询菜品
  },


  vegetablesInquire: function () { //查询菜品   
    let _parms = {
      userId: app.globalData.userInfo.userId,   //userId
    };
    let that = this;
    Api.vegetables(_parms).then((res) => {
      console.log("res_res:", res)
      let sukId = res.data.data[0].skuId;
      wx.request({ //通过skuId查询菜品 
        url: this.data._build_url + 'sku/get/' + sukId,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          let skuName_ = res.data.data.skuName
          let picUrl_ = res.data.data.picUrl
          that.setData({
            skuName: skuName_,
            picUrl: picUrl_
          });
        }
      });
      that.setData({
        skuMoneyNow: res.data.data[0].skuMoneyNow,  //现价
        skuMoneyOut: res.data.data[0].skuMoneyOut,  //低价
        skuAmount: res.data.data[0].skuAmount,      //已减
        peoplenum: res.data.data[0].peoplenum       //砍价人数
      });
    });

  },

  







  
})

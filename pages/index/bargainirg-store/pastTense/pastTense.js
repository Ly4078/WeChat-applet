import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js'
var utils = require('../../../../utils/util.js')
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isHiddenLoading: true,
    isHiddenToast: true,
    bargainList: [],
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    page: 1,
    timer: null,
    timeArr: [] //时间集合
  },
  onLoad: function() {

  },
  onShow: function() {
    this.setData({
      bargainList: []
    });
    this.vegetablesInquire(); //查询菜品
  },
  onHide: function() {
    let _this = this;
    this.setData({
      bargainList: []
    })
    clearInterval(_this.data.timer);
    this.setData({
      timer: null
    });
  },
  onUnload() {
    let _this = this;
    clearInterval(_this.data.timer);
    this.setData({
      timer: null
    });
  },
  vegetablesInquire: function() { //查询菜品列表
    let _parms = {
        userId: app.globalData.userInfo.userId,
        page: this.data.page,
        rows: 5
      },
      that = this;
    Api.bargainList(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data) {
        let list = res.data.data,
          _now = (new Date()).getTime();
        for (let i = 0; i < list.length; i++) {
          list[i].subtract = (list[i].skuMoneyOut - list[i].skuMoneyNow).toFixed(2);
          let _endTime = (new Date(list[i].endTime.replace(/\-/g, "/"))).getTime();
        }
        this.setData({
          bargainList: list
        });
        let arr = [];
        for (let i = 0; i < list.length; i++) {
          arr.push({
            endTime: list[i].endTime.replace(/\-/g, "/"),
            countDown: ''
          });
        }
        that.updateTime(arr);
      }
    });
  },

  updateTime(arr) { //倒时计
    let hours = '',
      minutes = '',
      seconds = '',
      timeArr = arr,
      countDown = '',
      miliEndTime = '',
      miliNow = '',
      timer = null,
      minus = '', //时间差(秒)
      that = this;
    this.setData({
      timer: setInterval(function() {
        console.log('定时器');
        let isEnd = 0;
        for (let i = 0; i < arr.length; i++) {
          miliNow = new Date().getTime(); //现在时间
          miliEndTime = (new Date(timeArr[i].endTime)).getTime(); //结束时间
          minus = Math.floor((miliEndTime - miliNow) / 1000); //时间差(秒)
          if (minus <= 0) {
            isEnd++;
            timeArr[i].countDown = '';
          } else {
            isEnd--;
            hours = Math.floor(minus / 3600); //时
            minutes = Math.floor(minus / 60); //分
            seconds = minus % 60; //秒
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            timeArr[i].countDown = hours + ':' + minutes + ':' + seconds;
          }
          that.setData({
            timeArr: timeArr
          });
          timeArr = that.data.timeArr;
        }
        that.setData({
          timeArr: timeArr
        });
        if (isEnd == timeArr.length) {
          clearInterval(that.data.timer);
          return false;
        }
        minus--;
      }, 1000)
    });
  },
  bargainDetail(e) {
    let id = e.currentTarget.id,
      list = this.data.bargainList,
      that = this;;
    for (let i = 0; i < list.length; i++) {
      if (list[i].skuId == id) {
        this.setData({
          bargainList: []
        })
        clearInterval(that.data.timer);
        wx.navigateTo({
          url: '../AprogressBar/AprogressBar?groupId=' + list[i].groupId + '&shopId=' + list[i].shopId + '&refId=' + list[i].skuId + '&skuMoneyOut=' + list[i].skuMoneyOut + '&skuMoneyMin=' + list[i].skuMoneyMin + '&initiator=' + app.globalData.userInfo.userId
        })
        return false;
      }
    }
  }
})
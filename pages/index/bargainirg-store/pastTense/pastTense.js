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
          list[i].subtract = (list[i].skuMoneyOut - list[i].skuMoneyNow).toFixed(2);
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
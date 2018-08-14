import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js'
var utils = require('../../../utils/util.js')
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    speciesList:'',
    data: [],
    isdata: false,
    total:0
  },

  onReady: function () {

  },

  // 金币商城直通车
  goldPath: function () {
    wx.showToast({
      title: '待更新...',
      icon: 'none',
      duration: 2000
    })
  },

  onShow: function () {
    this.getTicketaBlancees(); //金币余额
    this.getTicketList(); //获取劵列表
  },
  getTicketaBlancees: function () { //金币余额   入参:userId
    let _parms = {
      userId: app.globalData.userInfo.userId,   //userId
    };
    Api.getTicketaBlance(_parms).then((res) => {
      console.log("余额:",res)
      this.setData({
        // likeNum: res.data.data
      });
    });
  },

  getTicketList: function () { //获取劵列表   入参:userId
    let _parms = {
      userId: app.globalData.userInfo.userId,   //userId     
      type: 2,
    };
    Api.speciesList(_parms).then((res) => {
      console.log("列表:", res)
      wx.hideLoading();
      if (res.data.code == 0) {
        let _data = res.data.data.list;

        let posts = this.data.data;
        for (let i = 0; i < _data.length; i++) {
          posts.push(_data[i])
        }
        if (posts.length > 0) {
          this.setData({
            isdata: true
          })
        }
        this.setData({
          data: posts,
          total:res.data.data.total
        })
      }
    });
  },
  
  heaven:function(){ //关于金币
    wx.navigateTo({
      url: 'available-m/available-m',
    })
  },
})
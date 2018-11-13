// pages/index/notification/notification.js

import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    arrdata: [{
        id: 1,
        imgUrl: '/images/icon/xitong.png',
        total: 15,
        messageText: {
          title: '系统通知',
          sendTime: new Date().getTime(),
          content: '魅力十堰，热门景点门景点门票、酒店1门景点门票、酒店1门票、酒店1折购买、限量抢购...'
        }
      },
      {
        id: 2,
        imgUrl: '/images/icon/huodong.png',
        total: 0,
        messageText: {
          title: '活动通知',
          sendTime: new Date().getTime(),
          content: ''
        }
      }
    ]
  },

  handItem: function(e) {
    wx.navigateTo({
      url: '/pages/index/notification/message/message?sort=' + e.currentTarget.id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getMessageTotal();
  },
  //获取未读数据
  getMessageTotal: function() {
    let that = this;
    wx.request({
      url: this.data._build_url + 'msg/unreadMessageTotal',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          let _data = res.data.data,
            _Data = that.data.arrdata;

          for (let i = 0; i < _data.length; i++) {
            if (_data[i].messageText.type == 3) {
              _Data[0] = _data[i];
              _Data[0].imgUrl = '/images/icon/xitong.png';
            }
            if (_data[i].messageText.type == 2) {
              _Data[1] = _data[i];
              _Data[1].imgUrl = '/images/icon/huodong.png';
            }
          }
          
          _Data[0].messageText.sendTime = utils.daysAgo(_Data[0].messageText.sendTime);
          _Data[1].messageText.sendTime = utils.daysAgo(_Data[1].messageText.sendTime);
          that.setData({
            arrdata: _Data
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
// pages/activityDetails/activity-details/other-details.js


import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import getToken from '../../../utils/getToken.js';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    mainPic:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      mainPic:options.mainPic,
      page: options.actid*1+1
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.gethomeData();
  },
  gethomeData: function (types) {
    let locations = {}, that = this;
    if (app.globalData.userInfo.lat && app.globalData.userInfo.lng && app.globalData.userInfo.city) {
      locations.lat = app.globalData.userInfo.lat
      locations.lng = app.globalData.userInfo.lng
      locations.city = app.globalData.userInfo.city
    } else {
      locations.lat = '32.6226'
      locations.lng = '110.77877'
      locations.city = '十堰市'
    }
    let data = {
      locationX: locations.lng,
      locationY: locations.lat,
      city: locations.city,
      page: that.data.page,
      rows: 20
    }
    if (that.data.listStart != null && types != 'reset') {
      data.listStart = that.data.listStart
    }
    wx.request({
      // url: that.data._build_url + 'hcl/listForHomeObject',
      url: that.data._build_url + 'hcl/listForHomeObjectLv',
      method: 'POST',
      data: JSON.stringify(data),
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == '0') {
          var notData = true
          let data = res.data.data
          var arr = [];
          for (var k in data) {
            if (data[k]) {
              if (data[k].length) {
                notData = false
                if (data[k][0].homeTotle) {
                  var obj = {};
                  obj.type = k
                  obj.start = data[k][0].homeTotle
                  arr.push(obj)
                }
              }
            }
          }
          if (!res.data.data) {
            notData = true
          }
          if (data.topicVideo) {
            if (data.topicVideo.length) {
              for (var i = 0; i < data.topicVideo.length; i++) {
                if (data.topicVideo[i].content) {
                  data.topicVideo[i].content = JSON.parse(data.topicVideo[i].content);
                }
              }
            }
          }
          try {
            data.skuMS = data.skuMS.slice(0, data.skuMS.length - (data.skuMS.length % 2))
          } catch (err) {

          }
          var allList = that.data.allList ? that.data.allList : [];
          if (types == 'reset') {
            allList = []
            allList[0] = data
          } else {
            allList.push(data)
          }
          for (let i in allList[0].skuKJ) {
            allList[0].skuKJ[i].distance = utils.transformLength(allList[0].skuKJ[i].distance);

          }
          for (let i in allList[0].skuMS) {
            allList[0].skuMS[i].distance = utils.transformLength(allList[0].skuMS[i].distance);
          }
          console.log('allList:', allList)
          console.log('arr:', arr)
          that.setData({
            listStart: arr,
            allList: allList,
            loading: false,
            showSkeleton: false,
            notData: notData
          }, () => {
            wx.hideLoading();
          })

        } else {
          wx.hideLoading();
          that.setData({
            loading: false,
            showSkeleton: false,
          })
        }
      },
      fail() {
        wx.hideLoading();
        that.setData({
          loading: false,
          showSkeleton: false,
        })
      }
    })
  },
  candyDetails(e) {
    let id = e.currentTarget.id,
      distance = e.currentTarget.dataset.distance,
      actid = e.currentTarget.dataset.actid,
      shopId = e.currentTarget.dataset.index,
      categoryId = e.currentTarget.dataset.categoryid;
    wx.navigateTo({
      url: '/pages/index/merchant-particulars/merchant-particulars?shopid=' + shopId
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
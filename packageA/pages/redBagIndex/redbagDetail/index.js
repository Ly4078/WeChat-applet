

var app = getApp();
import getToken from "../../../../utils/getToken.js";
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var timer = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    redBagType: '',// 1 红包未领取 并且当前用户不是红包送出人， 2 我是送出人，红包未领取 3 我是领取人 红包被我领了 4 红包已被领取 我不是领取人 
    _build_url: GLOBAL_API_DOMAIN,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (options.shareId) {
      that.setData({
        shareId: options.shareId,
        id: options.id,
        iconUrl: options.iconUrl,
        nickName: options.nickName,
        redBagTitle: options.title,
        oldVersionNo: options.versionNo
      })
      app.globalData.currentScene.query = {
        shareId: options.shareId,
        id: options.id,
        iconUrl: options.iconUrl,
        nickName: options.nickName,
        redBagTitle: options.title
      }
      app.globalData.currentScene.path = "packageA/pages/redBagIndex/redbagDetail/index"
    } else {
      wx.showToast({
        title: '参数错误',
        icon: "none",
        duration: 4000
      })
    }
    wx.getSystemInfo({
      success: function (res) {
        that.setData({ windowHeight: res.windowHeight })
      },
    })
    wx.showLoading({
      title: '红包正在赶来...',
    })

  },
  onShow: function () {
    let that = this;
    if (!app.globalData.token) {
      getToken(app).then(() => {
        that.getData();
      })
    } else {
      that.getData();
      timer = clearInterval( ()=>{
        that.getData();
      },1000)
    }
  },
  getData: function () {
    let that = this;
    let userInfo = wx.getStorageSync("userInfo");
    let url = that.data._build_url + 'orderCoupon/getDetail?id=' + that.data.id + '&sendOrReceiveUserId=' + that.data.shareId;
    let urls = encodeURI(url)
    wx.request({
      url: urls,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == '0') {
          let data = res.data.data;
          let type = '';
          if (data.isUsed == '0') {//红包未使用
            if (that.data.shareId == userInfo.id) {
              type = 2
            } else {
              type = 1
            }
          } else {//已领取
            if (data.orderCouponSendOuts.length) {
              for (let i = 0; i < data.orderCouponSendOuts.length; i++) {
                if (data.ownId == data.orderCouponSendOuts[i].receiveUserId) {
                  data.orderCouponSendOuts[0] = data.orderCouponSendOuts[i];
                  break;
                }
              }
            }
            if (data.orderCouponSendOuts.length && data.orderCouponSendOuts[0].receiveUserId == userInfo.id) {
              type = 3
            } else {
              type = 4
            }
          }
          if(timer != null){
            clearInterval(timer);
          }
          that.setData({
            redBagType: type,
            data: data
          })
        }
      },fail:function(){},
      complete:function(){
        wx.hideLoading();
      }
    })
  },
  towallet: function () {
    wx.navigateTo({
      url: '/pages/personal-center/wallet/wallet',
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

  click: function () {
    let that = this;
    that.setData({ isclick: true });
    let url = that.data._build_url + 'orderCoupon/getDetail?id=' + that.data.id + '&sendOrReceiveUserId=' + that.data.shareId;
    let urls = encodeURI(url)
    wx.request({
      url: urls,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == '0') {
          if (res.data.data.isUsed == '0') {
            that.getsendCoupon()
          } else {
            wx.showToast({
              title: '红包已被领取',
              icon: 'none'
            });
            that.setData({ isclick: false });
            that.onShow();
          }
        } else {

        }
      }


    })

  },
  getsendCoupon: function () { //领取券
    let _parms = {},
      _this = this,
      _value = "",
      url = "",
      _Url = "",
      _txt = "";
    _parms = {
      orderCouponCode: _this.data.data.couponCode,
      sendUserId: _this.data.data.ownId,
      versionNo: _this.data.oldVersionNo ? _this.data.oldVersionNo : _this.data.data.versionNo,
      token: app.globalData.token
    };
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    url = _this.data._build_url + 'orderCoupon/sendVersionCoupon?' + _value;
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        console.log('领取', res)
        if (res.data.code == 0) {
          _this.chairedbag();
        } else {
          _this.setData({ isclick: false });
          wx.showToast({
            title: '红包已被领取',
            icon: 'none',
            duration: 2000
          })
          _this.onShow();
        }
      }
    })
  },
  chairedbag: function () {
    let that = this;
    let url = that.data._build_url + "orderCoupon/useCouponForRedPacket?id=" + that.data.id + "&remark=" + that.data.redBagTitle;
    let urls = encodeURI(url);
    wx.request({
      url: urls,
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        console.log('使用', res)
        if (res.data.code == '0' && res.data.data == '1') {
          that.setData({ isclick: false, redBagType: '3' })
          that.audio();
        } else {
          that.setData({ isclick: false });
          wx.showToast({
            title: '红包已被领取',
            icon: 'none',
            duration: 2000
          })
          that.onShow();
        }
      },
      fail: function () {

      },
      complete: function () {
        wx.hideLoading()
      }

    })

  },
  audio: function () {
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true
    innerAudioContext.src = "https://xqmp4-1256079679.file.myqcloud.com/15927505686_pd-5b76903d9df2c896.mp3";
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
  },
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (timer != null) {
      clearInterval(timer);
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (timer != null) {
      clearInterval(timer);
    }
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
    let that = this;
    return {
      title: '新春来贺喜，情藏红包里 ',
      path: '/packageA/pages/redBagIndex/redbagDetail/index?id=' + that.data.id + '&shareId=' + that.data.shareId + '&redBagTitle=' + that.data.redBagTitle + '&iconUrl=' + that.data.iconUrl + '&nickName=' + that.data.nickName,
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/15927505686_12312321312321312321312.png'
    }
  }
})
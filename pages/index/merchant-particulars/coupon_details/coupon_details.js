import Api from '../../../../utils/config/api.js';  
import { GLOBAL_API_DOMAIN } from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js')
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    listagio: [],
    _build_url: GLOBAL_API_DOMAIN,
    packdata: [],
    arr: [],
    store: [],
    isAgio: false,
    txt: [
      '本券全平台通用',
      '本券不可叠加使用，每桌消费仅限使用一张',
      '用户每次可领取一张，核销使用后，可继续领取',
      '酒水饮料等问题，请致电商家咨询，以商家反馈为准 ',
      '仅限堂食，外带、打包以商家反馈为准',
      '本券活动不与其他店内活动同享',
      '本券最终解释权归享7购平台所有'
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getstoredata(options.shopid);

    let _parms = {
      id: options.id,
      zanUserId: app.globalData.userInfo.userId,
      shopId: options.shopid
    }
    Api.getAgio(_parms).then((res) => {
      if (res.data.code == 0) {
        let _data = res.data.data;
        if (_data.skuInfo) {
          let boxarr = [];
          let arr = _data.skuInfo.split('@');
          var _arr = JSON.parse(arr[0]);
          for (let i = 0; i < arr.length; i++) {
            let newarr = JSON.parse(arr[i]);
            boxarr.push(newarr)
          }
          this.setData({
            arr: boxarr
          })
        }
        this.setData({
          packdata: _data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'sku/listForAgio',
      data: {
        userId: app.globalData.userInfo.userId
      },
      success: function (res) {
        let data = res.data;
        if (data.code == 0) {
          let _data = data.data.list[0]
          if (_data.isAgio == 0 || _data.isAgio == null) {  //未领取
            that.setData({
              isAgio: true
            })
          } else {   //已领取
            that.setData({
              isAgio: false
            })
          }
          that.setData({
            listagio: _data
          });
        }
      }
    })
  },

  receive: function () {  //去使用
    let that = this
    if (!this.data.isAgio) {
      wx.navigateTo({
        url: '../../../personal-center/my-discount/my-discount',
      })
    } else {
      let _parms = {
        // userId: app.globalData.userInfo.userId,
        // userName: app.globalData.userInfo.userName,
        payType: '1',
        skuId: this.data.listagio.id,
        skuNum: '1',
        token: app.globalData.token
      }
      Api.freeOrderForAgio(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '领取成功！',
            mask: 'true',
            icon: 'none',
          }, 1500)
          let listagio = that.data.listagio;
          listagio.sellNum++;
          that.setData({
            isAgio: false,
            listagio: listagio
          });
        } else {
          wx.showToast({
            title: '你已领取过，请使用后再领取',
            mask: 'true',
            icon: 'none',
          }, 1500)
        }
      })
    }

  },
  getstoredata(val) {  //获取店铺详情数据   
    let that = this
    wx.request({
      url: that.data._build_url + 'shop/get/' + val,
      header: {
        'content-type': 'application/json;Authorization'
      },
      success: function (res) {
        let _data = res.data.data
        that.setData({
          store: _data
        })
      }
    })
  },
  receiveuse: function () {  //去使用
    wx.navigateTo({
      url: '../../voucher-details/voucher-details?cfrom=pack',
    })
  },
  calling: function () {  //拨打电话
    wx.makePhoneCall({
      phoneNumber: this.data.store.phone ? this.data.store.phone : this.data.store.mobile,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },

  TencentMap: function (event) {// 打开腾讯地图
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        let latitude = res.latitude,
        longitude = res.longitude,
        storeDetails = that.data.store;
        wx.openLocation({
          longitude: storeDetails.locationX,
          latitude: storeDetails.locationY,
          scale: 18,
          name: storeDetails.shopName,
          address: storeDetails.address,
          success: function (res) {
            console.log(res)
          }
        })
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户信息或位置信息
              wx.showModal({
                title: '提示',
                content: '更多体验需要你授权位置信息',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({ //打开授权设置界面
                      success: (res) => {
                        if (res.authSetting['scope.userLocation']) {
                          wx.getLocation({
                            type: 'wgs84',
                            success: function (res) {
                              let latitude = res.latitude,
                                longitude = res.longitude,
                                storeDetails = that.data.store;
                              wx.openLocation({
                                longitude: storeDetails.locationX,
                                latitude: storeDetails.locationY,
                                scale: 18,
                                name: storeDetails.shopName,
                                address: storeDetails.address,
                                success: function (res) {
                                  console.log(res)
                                }
                              })
                            }
                          })
                        } else {
                          this.Renew();
                        }
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  },
  Renew:function(){//重新请求
    this.TencentMap();
  }

})
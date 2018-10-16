import Api from '../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
var app = getApp();
var swichrequestflag = [false,false,false]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData: [],
    actaddress: {},
    tabs: ["提蟹券", "赠送记录", "领取记录"],
    ind: 0, //tab下标
    page: 1, //  券页
    sendpage: 1, //赠送页
    recpage: 1, //收取页
    sendData: [], //赠送数据
    recData: [] //收取数据
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
    this.getorderCoupon(0);
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    wx.hideLoading();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

    if (this.data.ind == 0) {
      if (swichrequestflag[0]){
        return
      }
      this.setData({
        page: 1,
        listData: []
      },()=>{
        this.getorderCoupon(0);
      });
     
    } else if (this.data.ind == 1) {
      if (swichrequestflag[1]) {
        return
      }
      this.setData({
        sendpage: 1,
        sendData: []
      }, () => {
        this.getlistCoupon(1);
      });
    } else if (this.data.ind == 2) {
      if (swichrequestflag[2]) {
        return
      }
      this.setData({
        recpage: 1,
        recData: []
      }, () => {
        this.getlistCouponReceive(2);
      });
     
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.ind == 0) {
      if (swichrequestflag[0]) {
        return
      }
      if (this.data.pageTotal && this.data.pageTotal <= this.data.page) {
        return
      } else {
        this.setData({
          page: this.data.page + 1
        }, () => {
          this.getorderCoupon(0);
        });
      }
    } else if (this.data.ind == 1) {
      if (swichrequestflag[1]) {
        return
      }
      if (this.data.sendTotal && this.data.sendTotal <= this.data.sendpage) {
        return
      } else {
        this.setData({
          sendpage: this.data.sendpage + 1
        }, () => {
          this.getlistCoupon(1);
        });
      }
    } else if (this.data.ind == 2) {
      if (swichrequestflag[2]) {
        return
      }
      if (this.data.recTotal && this.data.recTotal <= this.data.recpage) {
        return
      } else {
        this.setData({
          recpage: this.data.recpage + 1
        }, () => {
          this.getlistCouponReceive(2);
        });
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    let id = e.target.id,
      _skuName = e.target.dataset.sku;
    return {
      title: _skuName,
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/Colin_ajdlfadjfal.png',
      path: '/pages/index/crabShopping/voucherDetails/voucherDetails?id=' + id,
      success: function(res) {}
    }
  },

  //点击ab
  handtab: function(e) {
    let _ind = e.currentTarget.id;
    var nowTime = new Date().getTime();
    var beforeClickTime = wx.getStorageSync("beforeClickTime") || 0;
    // if (beforeClickTime){
    console.log(nowTime - beforeClickTime)
    wx.setStorageSync('beforeClickTime', nowTime)
    if ((nowTime - beforeClickTime) <= 300) {
      // wx.showToast({
      //   title: '点击频率已超过0.3秒每次',
      //   icon: 'none'
      // })
      return
    }
    // }
    this.setData({
      ind: _ind
    },()=>{
      console.log(swichrequestflag[_ind])
      if (swichrequestflag[_ind]) {
        return
      }
        if (_ind == 0) {
          if (this.data.listData.length > 0) {
          } else {
            
            this.getorderCoupon(0);
          }
        } else if (_ind == 1) {
          if (this.data.sendData.length > 0) { } else {
            this.getlistCoupon(1);
          }
        } else if (_ind == 2) {
          if (this.data.recData.length > 0) { } else {
            this.getlistCouponReceive(2);
          }
        }
    });
    console.log(swichrequestflag)
  },
  findByCode: function() { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let _data = res.data.data;
            for (let key in _data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = _data[key]
                }
              }
              that.getorderCoupon(0);
            };
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  //查询我的礼品券列表数据 
  getorderCoupon: function(types) {
    if (!app.globalData.userInfo.userId) {
      this.findByCode();
    } else {
      wx.showLoading({
        title: '数据加载中...',
        mask: true
      });
      let _parms = {
        userId: app.globalData.userInfo.userId,
        page: this.data.page,
        // isUsed:0,
        rows: 10
      };
      if (this.data.page == 1) {
        this.setData({
          listData: []
        })
      }
      swichrequestflag[types] = true
      Api.orderCoupon(_parms).then((res) => {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let _data = this.data.page==1 ? [] : this.data.listData,
            _list = res.data.data.list;
          if (_list && _list.length > 0) {
            for (let i = 0; i < _list.length; i++) {
              _list[i].sku = "公" + _list[i].maleWeight + " 母" + _list[i].femaleWeight + " 4对 " + _list[i].styleName + " | " + _list[i].otherMarkerPrice + "型";
              if (_list[i].ownId) {
                if (_list[i].ownId != app.globalData.userInfo.userId) {
                  _list[i].isUsed = 1;
                }
              }
              // _data.push(_list[i]);
            }
            this.setData({
              listData: _data.concat(_list),
              pageTotal: Math.ceil(res.data.data.total / 10)
            }, () => {
              wx.hideLoading();
            })
          } else {
            wx.hideLoading();
          }
          swichrequestflag[types] = false
        }
      },()=>{
        wx.hideLoading();
        swichrequestflag[types] = false
      })
    }
  },
  // 查询提蟹券赠送记录
  getlistCoupon: function(types) {
    if (!app.globalData.userInfo.userId) {
        this.findByCode();
        return
      } 
    let _parms = {},
      that = this;
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    });
    _parms = {
      row: 10
    }, that = this;
      _parms.page = this.data.sendpage;
      _parms.sendUserId = app.globalData.userInfo.userId;
    swichrequestflag[types] = true
    Api.listCoupon(_parms).then((res) => {
      wx.stopPullDownRefresh();
      if (res.data.code == 0) {
        let _lists = res.data.data.list;
        if (_lists && _lists.length > 0) {
          for (let i = 0; i < _lists.length; i++) {
            if (_lists[i].receiveUserName) {
              _lists[i].receiveUserName = _lists[i].receiveUserName.substr(0, 3) + "****" + _lists[i].receiveUserName.substr(7);
            }
            if (_lists[i].sendUserName) {
              _lists[i].sendUserName = _lists[i].sendUserName.substr(0, 3) + "****" + _lists[i].sendUserName.substr(7);
            }
            // _sendData.push(_lists[i]);

          }
          let _sendData = this.data.sendpage==1?[]:this.data.sendData;
      

          that.setData({
            sendData: _sendData.concat(_lists),
            sendTotal: Math.ceil(res.data.data.total / 10)

          }, () => {
            wx.hideLoading();
          })
        }else{
          wx.hideLoading();
        }
        swichrequestflag[types] = false
      }
    
    },()=>{
      wx.hideLoading();
      swichrequestflag[types] = false
    })
  },
  getlistCouponReceive: function (types) {
    if (!app.globalData.userInfo.userId) {
      this.findByCode();
      return
    } 
    let _parms = {},
      that = this;
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    });
    _parms = {
      row: 10
    }, that = this;

      _parms.page = this.data.recpage;
      _parms.receiveUserId = app.globalData.userInfo.userId;
    swichrequestflag[types] = true
    Api.listCoupon(_parms).then((res) => {
      wx.stopPullDownRefresh();
      if (res.data.code == 0) {
        let _lists = res.data.data.list;
        if (_lists && _lists.length > 0) {
          for (let i = 0; i < _lists.length; i++) {
            if (_lists[i].receiveUserName) {
              _lists[i].receiveUserName = _lists[i].receiveUserName.substr(0, 3) + "****" + _lists[i].receiveUserName.substr(7);
            }
            if (_lists[i].sendUserName) {
              _lists[i].sendUserName = _lists[i].sendUserName.substr(0, 3) + "****" + _lists[i].sendUserName.substr(7);
            }
            // _sendData.push(_lists[i]);

          }
           let  _recData = this.data.recpage == 1 ? [] : this.data.recData;
          that.setData({
            recData: _recData.concat(_lists),
            recTotal: Math.ceil(res.data.data.total / 10),
          }, () => {
            wx.hideLoading();
          })
        } else {
          wx.hideLoading();
        }
        swichrequestflag[types] = false
      }

    }, () => {
      wx.hideLoading();
      swichrequestflag[types] = false
    })
  },
  //立即兑换
  redeemNow: function(e) {
    let id = e.currentTarget.id,
      _skuName = e.currentTarget.dataset.index,
      _isUsed = e.currentTarget.dataset.used,
      _orderId = e.target.dataset.order;
    if (_isUsed == 0) {
      wx.navigateTo({
        url: '../../index/crabShopping/voucherDetails/voucherDetails?id=' + id + '&skuname=' + _skuName
      })
    }
  },
  //点击购买券
  buyVoucher: function() {
    wx.navigateTo({
      url: '../../index/crabShopping/crabShopping?currentTab=0&spuval=3',
    })
  },
  //点击兑换记录
  handexchange: function() {
    wx.navigateTo({
      url: '../voucher/record/record',
    })
  }
})
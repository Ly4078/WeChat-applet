import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js')
var app = getApp()
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    id: '',
    storeUrl: '',
    detailName: '',
    address: '',
    distance: '',
    crabList: [],
    page: 1,
    flag: true
  },
  onLoad: function(options) {
    this.setData({
      id: options.id,
      distance: options.distance
    });
    if (options.isShare) {
      this.setData({
        isShare: options.isShare
      });
    }
  },
  onShow: function() {
    let that = this;
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          this.marketDetail();
          this.crabList();
        } else {
          this.authlogin();
        }
      } else {
        this.authlogin();
      }
    } else {
      this.findByCode();
    }
  },
  onHide: function() {
    wx.hideLoading();
  },
  onUnload: function() {
    wx.hideLoading();
  },
  findByCode: function () {//通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({ code: res.code }).then((res) => {
          if (res.data.code == 0) {
            console.log("findByCoderes:", res)
            let _data = res.data.data;
            if (_data.id && _data != null) {
              for (let key in _data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = _data[key]
                  }
                }
              };
              app.globalData.userInfo.userId = _data.id;
              if (_data.mobile){
                that.authlogin();
              }else{
                wx.navigateTo({
                  url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
                })
              }
            }
          }
        })
      }
    })
  },
  authlogin: function (val) { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          that.marketDetail();
          that.crabList();
        }
      }
    })
  },
  marketDetail() {   //超市详细信息
    let _parms = {
      id: this.data.id,
      token: app.globalData.token
    };
    Api.superMarketDetail(_parms).then((res) => {
      if (res.data.code == 0) {
        let data = res.data.data;
        this.setData({
          storeUrl: data.indexUrl,
          detailName: data.salepointName,
          address: data.address
        });
        wx.setNavigationBarTitle({
          title: data.salepointName
        })
      }
    })
  },
  crabList() {
    let _parms = {
      id: this.data.id,
      sendType:2,
      page: this.data.page,
      rows: 6,
      token: app.globalData.token
    };
    if (this.data.page == 1) {
      this.setData({
        crabList: []
      })
    };
    Api.storeSrabList(_parms).then((res) => {
      wx.hideLoading();
      if (res.data.code == 0) {
        let _list = res.data.data.list,
          crabList = this.data.crabList;
        if (_list && _list.length > 0) {
          for (let i = 0; i < _list.length; i++) {
            _list[i].logoUrl = _list[i].logoUrl ? _list[i].logoUrl : _list[i].indexUrl;
            crabList.push(_list[i]);
          };
          this.setData({
            crabList: crabList,
          })
          if (_list.length < 6) {
            this.setData({
              flag: false
            });
          }
        } else {
          this.setData({
            flag: false
          });
        }
      }
    })
  },
  crabDetail(e) { //跳转至螃蟹详情页
    wx.navigateTo({
      url: 'storeOrder/storeOrder?id=' + e.currentTarget.id + '&salepointId=' + this.data.id
    })
  },
  onPullDownRefresh: function() { //下拉刷新事件
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      crabList: [],
      page: 1,
      flag: true
    });
    this.crabList();
  },
  onReachBottom: function() { //上拉触底事件
    if (this.data.flag) {
      wx.showLoading({
        title: '加载中...'
      })
      this.setData({
        page: this.data.page + 1
      });
      this.crabList();
    }
  },
  //跳转至首页
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  //分享给好友
  onShareAppMessage: function () {
    let title = this.data.detailName + this.data.address;
    return {
      title: title,
      path: '/pages/index/crabShopping/superMarket/superMarket?id=' + this.data.id + '&distance=' + this.data.distance + '&isShare=true'
    }
  }
})
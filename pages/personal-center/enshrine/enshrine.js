import Api from '../../../utils/config/config.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
var app = getApp();
let requestCollect = true;
let shoprequestflag = false;
Page({
  data: {
    showSkeleton: true,
    _build_url: GLOBAL_API_DOMAIN,
    newshopid:'',
    posts_key: [],
    dish:[],
    total: 0,
    page: 1,
    shopList: [],
    shopPages: 1,
    shopPage: 1,
    tipisShow: false
  },
  onLoad() {
    if (this.data.shopList.length <= 0) {
      this.hotShopList(); //砍价菜精选推荐列表
    }
  },
  onShow: function() {
    this.getShareList();
  },
  onHide: function() {
    this.setData({
      posts_key: [],
      page: 1
    })
  },
  getShareList: function() {
    let that = this;
    requestCollect = true;
    wx.request({
      url: that.data._build_url + 'fvs/getSCForList?page=' + that.data.page + '&rows=5',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        let data = res.data;
        if (data.code == 0) {
          if (data.data.list != null && data.data.list != "" && data.data.list != []) {
            let posts_key = that.data.posts_key;
            for (let i = 0; i < data.data.list.length; i++) {
              let ruleDescs = data.data.list[i].ruleDescs;
              if (ruleDescs && ruleDescs != [null] && ruleDescs != 'null') {
                data.data.list[i].ruleDescs = ruleDescs.slice(0, 2);
              } else {
                data.data.list[i].ruleDescs = [];
              }
              posts_key.push(data.data.list[i]);
            }
            // for (let i = 0; i < data.data.list.length; i++) {
            //   wx.request({ //推荐菜
            //     url: that.data._build_url + 'sku/tsc',
            //     data: {
            //       shopId: data.data.list[i].id
            //     },
            //     header: {
            //       "Authorization": app.globalData.token
            //     },
            //     success: function (res) {
            //       if(res.data.code == 0){
            //         if(res.data.data.list && res.data.data.list.length>0){
            //           let list = res.data.data.list;
            //           list = list.slice(0, 2);
            //           data.data.list[i].dish = list;
            //         }
            //       }
            //     }
            //   })
            //   wx.request({ //满减规则
            //     url: that.data._build_url + 'pnr/selectByShopId',
            //     data: {
            //       shopId: data.data.list[i].id
            //     },
            //     header: {
            //       "Authorization": app.globalData.token
            //     },
            //     success: function (res) {
            //       let list = res.data.data;
            //       data.data.list[i].reduction = list;
            //     }
            //   })
            //   posts_key.push(data.data.list[i]);
            // }
            that.setData({
              posts_key: posts_key,
              loading: false
            });
          }
          that.setData({
            total: data.data.total
          });
          if (that.data.posts_key.length >= that.data.total) {
            that.setData({
              tipisShow: true
            });
          } else {
            that.setData({
              tipisShow: false
            });
          }
          if (that.data.shopList.length > 0) {
            setTimeout(() => {
              that.setData({
                showSkeleton: false
              })
            }, 400)
          }
        } else {
          that.setData({
            loading: false
          });
        }
        if (that.data.page == 1) {
          wx.stopPullDownRefresh();
        }
        requestCollect = false;
      },
      fail () {
        this.setData({
          loading: false
        })
        requestCollect = false;
      }
    });
  },
  enshrineXim:function(event){
    this.setData({
      newshopid: event.currentTarget.id
    })
    wx.navigateTo({
      url: '../../index/merchant-particulars/merchant-particulars?shopid=' + event.currentTarget.id,
    })
  },
  //精选推荐列表
  hotShopList() {
    let that = this,
      _parms = {},
      str = "",
      _url = "";
    let lng = wx.getStorageInfoSync('userInfo').lng ? wx.getStorageInfoSync('userInfo').lng : "110.77877";
    let lat = wx.getStorageInfoSync('userInfo').lat ? wx.getStorageInfoSync('userInfo').lat : "32.6226";
    _parms = {
      locationX: app.globalData.userInfo.lng ? app.globalData.userInfo.lng : lng,
      locationY: app.globalData.userInfo.lat ? app.globalData.userInfo.lat : lat,
      city: app.globalData.userInfo.city ? app.globalData.userInfo.city : '十堰市',
      page: this.data.shopPage,
      rows: 10,
      token: app.globalData.token
    }
    for (var key in _parms) {
      str += key + "=" + _parms[key] + "&";
    }
    str = str.substring(0, str.length - 1);
    _url = that.data._build_url + 'shop/list?' + str;
    _url = encodeURI(_url);
    shoprequestflag = true;
    wx.request({
      url: _url,
      method: 'GET',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let list = res.data.data.list,
            total = res.data.data.total;
          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              list[i].distance = utils.transformLength(list[i].distance);
              list[i].activity = list[i].ruleDescs ? list[i].ruleDescs.join(',') : '';
              if (list[i].businessCate) {
                list[i].businessCate = list[i].businessCate.split('/')[0].split(',')[0]
              }
            }
            let shopList = that.data.shopPage == 1 ? [] : that.data.shopList;
            let istruenodata = that.data.shopPage == '15'?true:false;
            if (that.data.shopPage == Math.ceil(total / 10)){
              istruenodata = true;
            }
            that.setData({
              istruenodata,
              loading: false,
              shopList: shopList.concat(list),
              shopPages: Math.ceil(total / 10)
            });
          } else {
            that.setData({
              loading: false
            });
          }
          shoprequestflag = false;
          setTimeout(() => {
            that.setData({
              showSkeleton: false
            })
          }, 400)
        }
      },
      fail() {
        that.setData({
          loading: false
        });
        shoprequestflag = false;
      }
    }, () => {
      that.setData({
        loading: false
      });
      shoprequestflag = false;
    })
  },
  //用户上拉触底
  onReachBottom: function () {
    if (requestCollect) {
      return false;
    }
    if (shoprequestflag) {
      return false;
    }
    
    if (this.data.posts_key.length >= this.data.total) {
      if (this.data.shopPage >= 15) {
        this.setData({
          loading: false
        });
        return false;
      };
      if(this.data.shopPage >= this.data.shopPages){
        return false
      }
      this.setData({
        tipisShow: true,
        loading:true,
        shopPage: this.data.shopPage + 1
      }, () => {
        this.hotShopList();
      });
    } else {
      this.setData({
        tipisShow: false,
        loading: true,
        page: this.data.page + 1
      }, () => {
        this.getShareList();
      });
    }
  },
  //用户下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      posts_key: [],
      page: 1
    });
    this.getShareList();
  },
  toindex() { //去首页
    wx.switchTab({
      url: '../../index/index',
    })
  },
  onTouchItem: function (event) {
    let shopid = event.currentTarget.id,
      _distance = event.currentTarget.dataset.distance;
    wx.navigateTo({
      url: '../../index/merchant-particulars/merchant-particulars?shopid=' + shopid + '&distance=' + _distance
    })
  }
})
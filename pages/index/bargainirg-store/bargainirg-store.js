import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var app = getApp()
var that = null;
var swichrequestflag = false;
Page({
  data: {
    navbar: [{
        id: 2,
        name: '价格'
      },
      {
        id: 0,
        name: '附近'
      },
      // {
      //   id: 1,
      //   name: '销量'
      // }
    ],
    _build_url: GLOBAL_API_DOMAIN,
    showModal: true,
    browSort: 2,
    cuisineArray: [],
    page: 1,
    scrollLeft: 0,
    choose_modal: "",
    showSkeleton: true
  },
  onLoad: function(options) {
    if(!app.globalData.token){
      this.findByCode()
    }else{
      this.dishList();
    }
  },
  onHide() {
    wx.hideLoading();
  },
  onUnload() {
    wx.hideLoading();
  },
  findByCode: function () { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        // return
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let _data = res.data.data;
            if (_data && _data.id) {
              app.globalData.userInfo.userId = _data.id;
              for (let key in _data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = _data[key]
                  }
                }
                wx.setStorageSync("userInfo", app.globalData.userInfo)
              };
              if (_data.mobile) {
                that.authlogin();
              } else {
                wx.navigateTo({
                  url: '/pages/init/init'
                })
              }
            } else {
              wx.navigateTo({
                url: '/pages/init/init'
              })
            }
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
    let that = this;
    wx.request({
      url: that.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.userInfo.token = _token
          app.globalData.token = _token
          wx.setStorageSync('token', _token);
          that.dishList();

        } else {
          that.findByCode();
        }
      },
      fail() {
        that.findByCode();
      }
    })
  },
  dishList() { //砍菜列表
    //browSort 0附近 1销量 2价格
    let _parms = {
      actId: 41,
      zanUserId: app.globalData.userInfo.userId,
      browSort: this.data.browSort,
      locationX: app.globalData.userInfo.lng ? app.globalData.userInfo.lng : '110.77877',
      locationY: app.globalData.userInfo.lat ? app.globalData.userInfo.lat : '32.6226',
      city: app.globalData.userInfo.city ? app.globalData.userInfo.city : '十堰市',
      isDeleted: 0,
      page: this.data.page,
      rows: 10,
      token: app.globalData.token
    };
    swichrequestflag = true;
    Api.partakerList(_parms).then((res) => {
      if (res.data.code == 0) {
        if (this.data.page == 1) {
          this.setData({
            cuisineArray: []
          });
        }
        if (res.data.data.list && res.data.data.list.length > 0) {
          let list = res.data.data.list,
            cuisineArray = this.data.cuisineArray;
          for (let i = 0; i < list.length; i++) {
            list[i].distance = utils.transformLength(list[i].distance);
            if(list[i].shopId == 0){
              list[i].shopName = '享七自营'
            }
            if (list[i].goodsPromotionRules && list[i].goodsPromotionRules.length>0){
              let _goods = list[i].goodsPromotionRules;
              for(let j in _goods){
                if (_goods[j].ruleType == 4){
                  list[i].agioPrice2 = _goods[j].actAmount;
                }
              }
            }
            cuisineArray.push(list[i]);
          }
          this.setData({
            cuisineArray: cuisineArray,
            pageTotal: Math.ceil(res.data.data.total / 8),
            loading: false,
            showSkeleton: false
          }, () => {
            wx.hideLoading();
          });
        } else {
          this.setData({
            loading: false,
            showSkeleton: false
          })
          wx.hideLoading();
        }
        swichrequestflag = false;
      } else {
        wx.hideLoading();
        this.setData({
          loading: false,
          showSkeleton: false
        })
      }
    }, () => {
      wx.hideLoading();
      this.setData({
        loading: false,
        showSkeleton: false
      })
      swichrequestflag = false;
    });
  },
  occludeAds: function() {
    this.setData({
      showModal: false
    })
  },
  //菜品砍价详情
  candyDetails: function(e) {
    let id = e.currentTarget.id,
      distance = e.currentTarget.dataset.distance,
      shopId = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: 'CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId + '&actId=41&categoryId=8'
    })
  },
  //顶部tab栏
  navbarTap: function(e) {
    if (swichrequestflag) {
      return;
    }
    //browSort 0附近 1销量 2价格    ---    navbar: ['价格', '附近', '销量'],
    let oldBrowSort = this.data.browSort;
    this.setData({
      browSort: e.currentTarget.id,
      page: 1
    }, () => {
      if (oldBrowSort != e.currentTarget.id) {
        this.dishList();
      }
    })
  },
  onReachBottom: function() { //用户上拉触底加载更多
    // if (this.data.pageTotal <= this.data.page){
    //   return
    // }
    // if (swichrequestflag) {
    //   return;
    // }
    this.setData({
      page: this.data.page + 1,
      loading: true
    });
    this.dishList();
  },
  onPullDownRefresh: function() {
    if (swichrequestflag) {
      return;
    }
    this.setData({
      cuisineArray: [],
      page: 1
    });
    wx.showLoading({
      title: '加载中...',
    })
    this.dishList();
  },
  //图片加载出错，替换为默认图片
  imageError: function(e) {
    let id = e.target.id,
      cuisineArray = this.data.cuisineArray;
    for (let i = 0; i < cuisineArray.length; i++) {
      if (cuisineArray[i].id == id) {
        cuisineArray[i].picUrl = "/images/icon/morentu.png";
      }
    }
    this.setData({
      cuisineArray: cuisineArray
    });
  },
  onShareAppMessage: function (res) {
    return {
      title:'拼菜砍价',    imageUrl:'https://xq-1256079679.file.myqcloud.com/15927505686_1545621392_kanjia2321312_0.png'
    }
  }
})
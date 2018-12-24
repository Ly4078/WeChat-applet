import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js'
var utils = require('../../../utils/util.js');
var app = getApp();
var requestTask = false, goodsRequestTask = null;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId: '41', //活动ID
    sort: [], //类别列表
    sortId: '', //类别ID
    comList: [], //商品列表
    loading: false,
    rows: 10,
    page: 1,
    currentTab:0,
    showSkeleton: true,
    showSkeletonRight: false
  },
  onLoad: function (options) {
    let that = this
    if (options.actId) {
      this.setData({
        actId: options.actId
      })
    }
   
  },
  onShow:function(){
    let that = this;
    if (!app.globalData.token) {
      that.findByCode();
    } else {
      if (!that.data.comList.length){
        that.getsortdata();
      }
    
    }
  },
  findByCode: function () { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            console.log(res)
            if (data.id) {
              app.globalData.userInfo.userId = data.id;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              }
              that.authlogin(); //获取token
            } else {
              if (!data.mobile) { //是新用户，去注册页面
                wx.navigateTo({
                  url: '/pages/init/init?isback=1'
                })
              } else {
                that.authlogin();
              }
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
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
          let userInfo = wx.getStorageSync('userInfo') || {}
          userInfo.token = _token
          wx.setStorageSync("token", _token)
          wx.setStorageSync("userInfo", userInfo)
          that.getsortdata();
          if (app.globalData.userInfo.mobile) {

          } else {
            wx.navigateTo({
              url: '/pages/init/init?isback=1',
            })
          }
        }
      }
    })
  },
  //获取类别数据
  getsortdata: function () {
    let that = this,_url='';
    _url ='goodsCategory/list';
    // _url = 'actGoodsSku/getSpuList?actId=' + this.data.actId;
    wx.request({
      url: this.data._build_url + _url,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        // return
        that.setData({
          loading: false,
          showSkeleton: false,
          showSkeletonRight: false
        })
        if (res.data.code == 0) {
          if (res.data.data && res.data.data.length > 0) {
            let _data = res.data.data, sortarr=[];
            for (let i in _data){
              if (_data[i].status == 1 || _data[i].status == 3){
                if (_data[i].children && _data[i].children.length > 0) {
                  for (let j in _data[i].children) {
                    if (_data[i].children[j].status == 1 || _data[i].children[j].status == 3) {
                      sortarr.push(_data[i].children[j]);
                    }
                  }
                }
              }
            }
            that.setData({
              sort: sortarr,
              sortId: sortarr[0].id
            })
            that.getlistdata(sortarr[0].id, 'reset');
          } else {
            that.setData({
              loading: false,
              showSkeleton: false,
              showSkeletonRight: false
            })
          }
        } else {
          that.setData({
            loading: false,
            showSkeleton: false,
            showSkeletonRight: false
          })
        }
      }, fail: function () {
        that.setData({
          loading: false,
          showSkeleton: false,
          showSkeletonRight: false
        })
      }
    })
  },
  // =======================
  scroll(e) {
    console.log(e)
  },

  // ==============
  //点击某个类别
  bindSort: function (e) {
    console.log("e:",e)
    if (e.currentTarget.id == this.data.sortId) {
      return false
    }
    if (goodsRequestTask != null) {
      goodsRequestTask.abort();
      goodsRequestTask = null;
    }
    this.setData({
      sortId: e.currentTarget.id,
      page: 1,
      comList: [],
      showSkeletonRight: true
    }, () => {
      this.getlistdata(e.currentTarget.id, 'reset');
    })
  },
  //获取商品列表数据 
  getlistdata: function (sortId, types) {
    // return
    let that = this, url='';
    requestTask = true;
    url = this.data._build_url + 'goodsSku/listForAct?actId=' + this.data.actId + '&categoryId=' + sortId + '&rows=' + this.data.rows + '&page=' + this.data.page;
    goodsRequestTask = wx.request({
      url: encodeURI(url),
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          if (res.data.data.list && res.data.data.list.length > 0) {
            let arr = [];
            if (types == 'reset') {
              arr = res.data.data.list.length ? res.data.data.list : []
            } else {
              arr = that.data.comList ? that.data.comList : []
              arr = arr.concat(res.data.data.list)
            }
            that.setData({
              comList: arr,
              loading: false,
              showSkeleton: false,
              showSkeletonRight: false
            }, () => {
              requestTask = false
            })
          } else {
            requestTask = false;
            if (that.data.comList.length > 0) {
              wx.showToast({
                title: '没有更多数据了',
                icon: 'none'
              })
            } else {
              that.setData({
                comList: [],
              })
            }
            if (types == 'reset') {
              that.setData({
                comList: [],
              })
            }
            that.setData({
              loading: false,
              showSkeleton: false,
              showSkeletonRight: false
            })
          }
        } else {
          requestTask = false
          that.setData({
            loading: false,
            showSkeleton: false,
            showSkeletonRight: false
          })
        }
      },
      fail() {
        requestTask = false
        // that.setData({
        //   loading: false,
        //   showSkeleton: false,
        //   showSkeletonRight: false
        // })
      }, complete: function () {

      }
    })
  },

  //点击某个商品
  bindItem: function (e) {
    let _id = e.currentTarget.id,
      _shopid = e.currentTarget.dataset.shopid,
      _categoryid = e.currentTarget.dataset.categoryid,
      _categ = e.currentTarget.dataset.cate;
    wx.navigateTo({
      url: '/pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + _id + '&actId=' + this.data.actId + '&categoryId=' + _categoryid + '&shopId=' + _shopid,
    })
  },
  //下拉刷新
  onPullDownRefresh: function () { //下拉刷新
    if (requestTask) {
      return false
    }
    console.log('onPullDownRefresh')
    this.setData({
      comList: [],
      page: 1
    })
    this.getlistdata(this.data.sortId, 'reset');
  },
  //上接加载更多
  onReachBottom: function () {
    if (requestTask) {
      return false
    }
    this.setData({
      page: this.data.page + 1,
      loading: true
    })
    this.getlistdata(this.data.sortId, '');
  },
  onShareAppMessage: function (res) {
      return{
        title:'享购',   imageUrl:'https://xq-1256079679.file.myqcloud.com/15927505686_1545388420_xianggou213123213_0.png'

      }
  }
})
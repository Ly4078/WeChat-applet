import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp()
var that = null;
var swichrequestflag = false;
Page({
  data: {
    navbar: [
      {
        id: 2,
        name: '价格'
      },
      {
        id: 0,
        name: '附近'
      },
      {
        id: 1,
        name: '销量'
      }
    ],
    showModal: true,
    browSort: 2,
    cuisineArray: [],
    page: 1,
    scrollLeft: 0,
    choose_modal: "",
    showSkeleton:true
    
  },
  onLoad: function(options) {
    this.dishList();
  },
  onHide() {
    wx.hideLoading();
  },
  onUnload() {
    wx.hideLoading();
  },
  dishList() {     //砍菜列表
    //browSort 0附近 1销量 2价格
    let _parms = {
      zanUserId: app.globalData.userInfo.userId, 
      browSort: this.data.browSort,  
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      isDeleted: 0,
      page: this.data.page,
      rows: 8,
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
        if (res.data.data.list && res.data.data.list.length>0){
          let list = res.data.data.list, cuisineArray = this.data.cuisineArray;
          for (let i = 0; i < list.length; i++) {
            list[i].distance = utils.transformLength(list[i].distance);
            cuisineArray.push(list[i]);
          }
          this.setData({
            cuisineArray: cuisineArray,
            pageTotal: Math.ceil(res.data.data.total /8),
            loading: false,
            showSkeleton: false
          }, () => {
            wx.hideLoading();
          });
        } else {
          this.setData({ loading: false, showSkeleton: false})
          wx.hideLoading();
        }
        swichrequestflag = false;
      }else{
        wx.hideLoading();
        this.setData({ loading: false, showSkeleton: false})
      }
    }, () => {
      wx.hideLoading();
      this.setData({ loading: false, showSkeleton: false })
      swichrequestflag = false;
    });
  },
  occludeAds: function() {
    this.setData({
      showModal: false
    })
  },
  //菜品砍价详情
  candyDetails:function(e){
    let id = e.currentTarget.id, shopId = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: 'CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId
    })
  },
  //顶部tab栏
  navbarTap: function (e) {
    if (swichrequestflag) {
      return;
    }
    //browSort 0附近 1销量 2价格    ---    navbar: ['价格', '附近', '销量'],
    let oldBrowSort = this.data.browSort;
    this.setData({
      browSort: e.currentTarget.id,
      page: 1
    }, ()  => {
      if (oldBrowSort != e.currentTarget.id) {
        this.dishList();
      }
    })
  },
  onReachBottom: function () {  //用户上拉触底加载更多
    if (this.data.pageTotal <= this.data.page){
      return
    }
    if (swichrequestflag) {
      return;
    }
    this.setData({
      page: this.data.page + 1,
      loading: true
    });
    this.dishList();
  },
  onPullDownRefresh: function () {
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
  imageError: function (e) {
    let id = e.target.id, cuisineArray = this.data.cuisineArray;
    for (let i = 0; i < cuisineArray.length; i++) {
      if (cuisineArray[i].id == id) {
        cuisineArray[i].picUrl = "/images/icon/morentu.png";
      }
    }
    this.setData({
      cuisineArray: cuisineArray
    });
  }
})
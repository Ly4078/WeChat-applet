import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp()
var that = null;
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
    choose_modal: ""
    
  },
  onLoad: function(options) {
    this.dishList();
  },
  dishList() {     //砍菜列表
    //browSort 0附近 1销量 2价格
    wx.showLoading({
      title: '数据加载中...',
    });
    let _parms = {
      zanUserId: app.globalData.userInfo.userId, 
      browSort: this.data.browSort,  
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      isDeleted: 0,
      page: this.data.page,
      rows: 8
    };
    Api.partakerList(_parms).then((res) => {
      wx.hideLoading();
      if(res.data.code == 0){
        if (res.data.data.list && res.data.data.list.length>0){
          let list = res.data.data.list, cuisineArray = this.data.cuisineArray;
          for (let i = 0; i < list.length; i++) {
            list[i].distance = utils.transformLength(list[i].distance);
            console.log(list[i])
            cuisineArray.push(list[i]);
          }
          this.setData({
            cuisineArray: cuisineArray
          });
        }else{
          // this.dishList();
        }
      }
    })
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
    //browSort 0附近 1销量 2价格    ---    navbar: ['价格', '附近', '销量'],
    this.setData({
      browSort: e.currentTarget.id,
      cuisineArray: [],
      page: 1
    })
    this.dishList();
  },
  onReachBottom: function () {  //用户上拉触底加载更多
  
    this.setData({
      page: this.data.page + 1
    });
    this.dishList();
  },
  onPullDownRefresh: function () {
    this.setData({
      cuisineArray: [],
      page: 1
    });
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
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp()
var that = null;
Page({
  data: {
    navbar: ['附近', '销量', '价格'],
    showModal: true,
    browSort: 0,
    cuisineArray: [],
    page: 1,
    flag: true,   //节流阀
    scrollLeft: 0,
    choose_modal: "",
    isball:true
  },
  onLoad: function(options) {
    this.dishList();
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
      rows: 8
    };
    Api.partakerList(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data.list && res.data.data.list != 'null') {
        let list = res.data.data.list, cuisineArray = this.data.cuisineArray;
        for(let i = 0; i < list.length; i++) {
          list[i].distance = utils.transformLength(list[i].distance);
          cuisineArray.push(list[i]);
        }
        this.setData({
          cuisineArray: cuisineArray
        });
        if(list.length < 6) {
          this.setData({
            flag: false
          });
        }
      } else {
        this.setData({
          flag: false
        });
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
    let idx = e.currentTarget.dataset.idx;
    this.setData({
      browSort: idx,
      flag: true,
      cuisineArray: [],
      page: 1
    })
    this.dishList();
  },
  toactlist() {
    this.setData({
      isball: false
    })
    wx.switchTab({
      url: '../../index/index',
    })
  },
  onReachBottom: function () {  //用户上拉触底加载更多
    if (!this.data.flag) {
      return false;
    }
    this.setData({
      page: this.data.page + 1
    });
    this.dishList();
  },
  onPullDownRefresh: function () {
    this.setData({
      flag: true,
      cuisineArray: [],
      page: 1
    });
    this.dishList();
  }
})
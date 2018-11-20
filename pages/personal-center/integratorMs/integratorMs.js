import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js'
var utils = require('../../../utils/util.js')
var app = getApp();
var requesting = false;

Page({ 
  data: {
    showSkeleton: true,
    _build_url: GLOBAL_API_DOMAIN,
    speciesList:'',
    data: [],
    page: 1,
    flag: true,
    isdata: false,
    total:0,
    pageTotal:1,
  },
  // 金币商城直通车
  goldPath: function () {
    wx.showToast({
      title: '待更新...',
      icon: 'none',
      duration: 2000
    })
  },
  onLoad: function () {
    let that = this;
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 5000)
    this.getTicketaBlancees(); //金币余额
    this.getTicketList(); //获取劵列表
    wx.showLoading({
      title: '加载中',
    })
  },

  getTicketaBlancees: function () { //金币余额   入参:userId
    let _parmes = {
      userId: app.globalData.userInfo.userId,   //userId
      token: app.globalData.token
    };
    Api.getTicketaBlance(_parmes).then((res) => {
      this.setData({
        aggregate: res.data
      });
    });
  },
  getTicketList: function () { //获取劵列表   入参:userId
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId,   //userId     
      type: 2,
      page: this.data.page,
      rows: 10,
      token: app.globalData.token
    };
    requesting = true;
    Api.speciesList(_parms).then((res) => {
      if (res.data.code == 0) {
        requesting = false;
        let _data = res.data.data.list;
        if (!_data){
          wx.hideLoading();
          return false;
        }
        let posts = this.data.data;
        for (let i = 0; i < _data.length; i++) {
          posts.push(_data[i])
        }
        if (posts.length > 0) {
          this.setData({
            isdata: true
          })
        } 
        if(_data.length <= 0) {
          this.setData({
            flag: false
          })
        }
        this.setData({
          data: posts,
          total:res.data.data.total,
          loading: false,
          pageTotal: Math.ceil(res.data.data.total / 10)//总条数除以每页10条数据，获取数据总页数
        },()=>{
          wx.hideLoading();
        })
        setTimeout(() => {
          that.setData({
            showSkeleton: false
          })
        }, 400)
      } else {
        this.setData({
          flag: false,
          loading: false
        })
        wx.hideLoading();
        requesting = false;
      } 
    },()=>{
      wx.hideLoading();
      this.setData({
        loading: false
      })
      requesting = false;
    });
  },
  
  heaven:function(){ //关于金币
    wx.navigateTo({
      url: 'available-m/available-m',
    })
  },
  //用户上拉触底
  onReachBottom: function () {
    if (requesting){
      return
    }
    if (this.data.pageTotal <= this.data.page){
      return 
    }
    if (this.data.flag) {
      this.setData({
        page: this.data.page + 1,
        loading: true
      },()=>{
        this.getTicketList();
      });
     
    }
  },
  //用户下拉刷新
  onPullDownRefresh: function () {
    if (requesting) {
      return
    }
    this.setData({
      data: [],
      page: 1,
      flag: true
    },()=>{
      this.getTicketList();
    });
   
  },
  onHide: function () {
    wx.hideLoading();
  },
  onUnload: function () {
    wx.hideLoading();
  }
})
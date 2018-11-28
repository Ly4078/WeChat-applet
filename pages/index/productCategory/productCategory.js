import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js'
var utils = require('../../../utils/util.js');
var app = getApp();
var requestTask = false;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId:'41',//活动ID
    sort:[],//类别列表
    sortId:'',//类别ID
    comList:[],//商品列表
    loading:false,
    rows:10,
    page:1
  },
  onLoad: function(options) {
    if (options.actId){
      this.setData({
        actId: options.actId
      })
    }
    this.getsortdata();
  },

  //获取类别数据
  getsortdata:function(){
    let that = this;
    wx.request({
      url: this.data._build_url + 'actGoodsSku/getSpuList?actId='+this.data.actId,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if(res.data.code == 0){
          if(res.data.data && res.data.data.length>0){
            that.setData({
              sort: res.data.data,
              sortId: res.data.data[0].categoryId
            })
            that.getlistdata(res.data.data[0].categoryId,'reset');
          }
        }
      }
    })
  },
  //点击某个类别
  bindSort:function(e){
    this.setData({
      sortId: e.currentTarget.id,
      page:1
    }, ()=>{
      this.getlistdata(e.currentTarget.id, 'reset');
    })
    
  },
  //获取商品列表数据 
  getlistdata: function (sortId,types){
    // return
    let that = this;
  
    requestTask = true
    wx.request({
      url: this.data._build_url + 'goodsSku/listForAct?actId=' + this.data.actId + '&categoryId=' + sortId + '&rows=' + this.data.rows+'&page='+this.data.page,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.stopPullDownRefresh();
        
        if (res.data.code == 0) {
          if (res.data.data.list && res.data.data.list.length > 0) {
            var arr = [];
            if(types =='reset'){
              arr = res.data.data.list
            }else{
              arr = that.data.comList ? that.data.comList:[]
              arr = arr.concat(res.data.data.list)
            }
            that.setData({
              comList: arr,
              loading: false
            },()=>{
              requestTask = false
            })
          }else{
            requestTask = false
            that.setData({ loading: false })
          }
        }else{
          requestTask = false
          that.setData({ loading: false })
        }
      },fail () {
        requestTask = false
        that.setData({ loading: false })
      }
    })
  },

  //点击某个商品
  bindItem:function(e){
    let _id = e.currentTarget.id, _categoryId = e.currentTarget.dataset.cate;
    wx.navigateTo({
      url: '/pages/index/bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + _id + '&actId=' + this.data.actId + '&categoryId=' + _categoryId,
    })
  },
  //下拉刷新
  onPullDownRefresh: function() { //下拉刷新
    if (requestTask){
      return false
    }
    this.setData({
      comList:[],
      page:1
    })
    this.getlistdata(this.data.sortId,'reset');
  },
  //上接加载更多
  onReachBottom: function () {
    if (requestTask) {
      return false
    }
    this.setData({
      page:this.data.page+1,
      loading: true
    })
    this.getlistdata(this.data.sortId,'');
  }
})
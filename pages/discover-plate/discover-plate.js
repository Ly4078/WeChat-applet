import Api from '../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
var utils = require('../../utils/util.js')
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    food:[],
    page:1,
    hotlive:[],
    flag: true
  },
  onLoad:function(){
    
  },
  onShow: function (options) {
    let that = this;
    this.setData({
      food:[],
      page: 1,
      flag: true
    })
    this.getfood();
    wx.request({
      url: that.data._build_url + 'zb/list/',
      success: function (res) {
        that.setData({
          hotlive: res.data.data.list
        })
      }
    })
    wx.setStorage({
      key: 'cover',
      data: ''
    })
    wx.setStorage({
      key: 'title',
      data: '',
    })
    wx.setStorage({
      key: 'text',
      data: '',
    })
  },
  getfood:function(){
    let that = this;
    let _parms = {
      page: this.data.page,
      row: 8
    }
    Api.topiclist(_parms).then((res) => {
      let _data = this.data.food
      if (res.data.code == 0 && res.data.data.list != null && res.data.data.list != "" && res.data.data.list != []) { 
        _data =_data.concat(res.data.data.list)
        for(let i=0;i<_data.length;i++){
          _data[i].summary = utils.uncodeUtf16(_data[i].summary)
          _data[i].content = utils.uncodeUtf16(_data[i].content)
        }
        this.setData({
          food:_data
        })
      } else {
        this.setData({
          flag: false
        });
      }
      if (that.data.page == 1) {
        wx.stopPullDownRefresh();
      } else {
        wx.hideLoading();
      }
    })
  },
  clickarticle:function(e){  //点击某条文章
    const id = e.currentTarget.id
    let _data = this.data.food
    let zan = ''
    for (let i = 0; i < _data.length;i++){
      if(id == _data[i].id){
          zan = _data[i].zan
      }
    }
    wx.navigateTo({
      url: 'dynamic-state/article_details/article_details?id='+id+'&zan='+zan
    })
  },
  announceState:function(event){ // 跳转到编辑动态页面
    wx.redirectTo({
      url: 'dynamic-state/dynamic-state',
    })
  },
  onReachBottom: function () {  //用户上拉触底
    if(this.data.flag) {
      wx.showLoading({
        title: '加载中..'
      })
      let that = this
      this.setData({
        page: this.data.page + 1
      });
      that.getfood();
    }
  },
  //用户下拉刷新
  onPullDownRefresh: function () {
    let that = this;
    this.setData({
      food: [],
      page: 1,
      flag: true
    });
    this.getfood();
    wx.request({
      url: that.data._build_url + 'zb/list/',
      success: function (res) {
        console.log("下拉刷新数据:",res)
        that.setData({
          hotlive: res.data.data.list
        })
      }
    })
  }
})
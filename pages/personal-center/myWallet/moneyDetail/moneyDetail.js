import { GLOBAL_API_DOMAIN } from '/../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js'
var utils = require('../../../../utils/util.js')
var app = getApp();
Page({
  data: {
    detailList:'',
    data:[],
    page:1,
  },
  onReachBottom: function () {  //用户上拉触底加载更多
    let oldpage = this.data.page
    this.setData({
      page: this.data.page + 1
    });
    this.searchValues()
  },
  onLoad: function (options) {
    this.searchValues()
  },

  searchValues:function(){
    wx.showLoading({
      title: '数据加载中。。。',
      mask: true
    })
   
    let _account = {
      userId: app.globalData.userInfo.userId,
      page: this.data.page,
      rows: 15
    }
    Api.detailList(_account).then((res) => { //查询余额
      wx.hideLoading();
      if(res.data.code == 0){
        let _data = res.data.data.list;
        let posts = this.data.data;
        for (let i = 0; i < _data.length; i++) {
          posts.push(_data[i])
        }
        this.setData({
          data: posts,
        })
      }
    })
  }
})
import Api from '/../../../utils/config/api.js'; 
import { GLOBAL_API_DOMAIN } from '/../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    article_list: [],
    reFresh: true,
    page: 1
  },
  onLoad: function () {
    
  },
  onShow: function() {
    this.getList();
  },
  onHide: function() {
    this.setData({
      article_list: [],
      reFresh: true,
      page: 1
    })
  },
  getList: function() {
    let that = this;
    if (app.globalData.isflag) {
      wx.request({
        url: that.data._build_url + 'topic/myList',
        method: 'GET',
        data: {
          userId: app.globalData.userInfo.userId,
          page: that.data.page,
          rows: 5
        },
        success: function (res) {
          var data = res.data;
          if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
            let article_list = that.data.article_list;
            for (let i = 0; i < data.data.list.length; i++) {
              let list_item = data.data.list[i];
              list_item.summary = utils.uncodeUtf16(list_item.summary)
              list_item.content = utils.uncodeUtf16(list_item.content)
              list_item.timeDiffrence = utils.timeDiffrence(data.currentTime, list_item.updateTime, list_item.createTime);
              list_item.isplay = false;
              article_list.push(list_item);

            }
            that.setData({
              article_list: article_list,
              reFresh: true
            });
          } else {
            that.setData({
              reFresh: false
            });
          }
          if (that.data.page == 1) {
            wx.stopPullDownRefresh();
          } else {
            wx.hideLoading();
          }
        }
      })
    }
   
  },
  deleteMode: function (e) {    //删除文章
    let id = e.currentTarget.id, that = this;
    console.log(id)
    wx.showModal({
      title: '是否删除',
      cancelColor: '#191919',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: that.data._build_url + 'topic/delete/' + id,
            method: 'GET',
            success: function (res) {
              that.setData({
                article_list: [],
                reFresh: true,
                page: 1
              })
              that.getList();
            }
          })
        }
      }
    })
  },
  toArticleInfo: function(event) {
    const id = event.currentTarget.id;
    let _data = this.data.article_list, zan = '',userid='';
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan;
        userid = _data[i].userId;
      }
    }
    wx.navigateTo({
      url: '../../activityDetails/video-details/video-details?id=' + id + '&zan=' + zan + '&userId=' + userid
    })
  },
  amplification: function (e) {
    var index = e.currentTarget.dataset.index;
    var imgArr = this.data.imgArr;
    wx.previewImage({
      current: imgArr[index],     //当前图片地址
      urls: imgArr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //用户上拉触底
  onReachBottom: function () {
    if (this.data.reFresh) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        page: this.data.page + 1
      });
      this.getList();
    }
  },
  //用户下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      article_list: [],
      reFresh: true,
      page: 1
    });
    this.getList();
  }
})
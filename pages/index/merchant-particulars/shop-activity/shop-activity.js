import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js')
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    page: 1,
    flag: true,
    merchantArt: []
  },
  onLoad: function(options) {
    this.setData({
      shopId: options.shopid
    });
    this.merchantArt();
  },
  onShow: function() {

  },
  //商家动态
  merchantArt: function() {
    let _parms = {
      shopId: this.data.shopId,
      page: this.data.page,
      rows: 8,
      token: app.globalData.token
    }
    if (this.data.switchFlag) {
      _parms.topicType = this.data.switchFlag;
    }
    Api.myArticleList(_parms).then((res) => {
      let data = res.data;
      wx.hideLoading();
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
        let _data = data.data.list,
          articleList = this.data.merchantArt;
        for (let i = 0; i < _data.length; i++) {
          _data[i].title = utils.uncodeUtf16(_data[i].title);
          _data[i].timeDiffrence = utils.timeDiffrence(data.currentTime, _data[i].updateTime, _data[i].createTime)
          articleList.push(_data[i]);
          _data[i].hideVideo = true;
          if (_data[i].topicType == '2') {
            let txtObj = wx.getStorageSync("txtObj");
            if (txtObj.videoShow) {
              _data[i].hideVideo = true;
            } else {
              _data[i].hideVideo = false;
            }
          }
        }
        this.setData({
          merchantArt: articleList
        });
        if (_data.length < 8) {
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
  tabSwitch(e) { //切换tab
    this.setData({
      switchFlag: e.currentTarget.id,
      merchantArt: [],
      page: 1,
      flag: true
    });
    this.merchantArt();
  },
  //跳转至文章详情
  toArticleInfo: function(e) {
    const id = e.currentTarget.id
    let _data = this.data.merchantArt
    let zan = ''
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan
        if (_data[i].topicType == 1) {
          wx.navigateTo({
            url: '/pages/discover-plate/dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan
          })
        } else if (_data[i].topicType == 2) {
          wx.navigateTo({
            url: '/pages/activityDetails/video-details/video-details?id=' + id + '&zan=' + zan
          })
        }
      }
    }
  },
  onReachBottom: function() { //用户上拉触底
    if (this.data.flag) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        page: this.data.page + 1
      });
      this.merchantArt();
    }
  },
  onPullDownRefresh: function() { //用户下拉刷新
    wx.showLoading({
      title: '加载中..'
    })
    this.setData({
      merchantArt: [],
      page: 1,
      flag: true
    });
    this.merchantArt();
  },
})
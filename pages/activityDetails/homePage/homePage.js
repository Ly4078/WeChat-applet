import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId: 0,
    userId: 0,
    voteUserId: 0,
    articleNum: 0,
    sortType: 0,    //最新0最热1
    nickName: '',
    articleList: [],
    flag: true,
    page: 1
  },
  onLoad: function (options) {
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      voteUserId: app.globalData.userInfo.userId,
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond)),
      actId: options.actId,
      userId: options.userId
    });
  },
  onShow: function () {
    this.playerDetail();
    this.article();
  },
  playerDetail() {    //选手资料
    let _parms = {
      actId: this.data.actId,
      beginTime: this.data.today,
      endTime: this.data.tomorrow,
      voteUserId: this.data.voteUserId,
      userId: this.data.userId
    };
    Api.playerDetails(_parms).then((res) => {
      if (res.data.code == 0) {
        let data = res.data.data;
        this.setData({
          // refId: data.id,
          nickName: data.nickName,
          iconUrl: data.iconUrl,
          sex: data.sex,
          age: data.age,
          height: data.height,
          voteNum: data.voteNum,
          picUrls: data.picUrls,
        });
        for (let i = 0; i < data.picUrls.length; i++) {
          if (data.picUrls[i].smallPicUrl) {
            this.setData({
              bgUrl: data.picUrls[i].picUrl
            });
            return false;
          }
        }
      } else {
        wx.showToast({
          title: '系统繁忙',
          icon: 'none'
        })
      }
    });
  },
  article() {    //文章列表
    let _parms = {
      userId: this.data.userId,
      page: this.data.page,
      rows: 5
    };
    Api.myArticleList(_parms).then((res) => {
      let data = res.data, list = data.data.list, articleList = this.data.articleList;
      if (data.code == 0) {
        wx.hideLoading();
        if (list != null && list != "" && list != []) {
          for (let i = 0; i < list.length; i++) {
            list[i].content = JSON.parse(list[i].content);
            list[i].isImg = true;
            if (list[i].content[0].type == 'video') {
              list[i].isImg = false;
            }
            articleList.push(list[i]);
          }
          this.setData({
            articleList: articleList
          });
        } else {
          this.setData({
            flag: false
          });
        }
      } else {
        wx.showToast({
          title: '系统繁忙',
          icon: 'none'
        })
      }
    });
  },
  dianzanwz: function (e) {  //文章点赞
    let articleList = this.data.articleList, id = e.currentTarget.id
    let _parms = {
      actId: this.data.actId,
      refId: id,
      type: '2',
      userId: this.data.voteUserId
    }
    Api.zanadd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '点赞成功'
        }, 1500);
        for (let i = 0; i < articleList.length; i++) {
          if (articleList[i].id == id) {
            articleList[i].isZan = 1
            articleList[i].zan = articleList[i].zan + 1;
            this.setData({
              articleList: articleList,
              voteNum: this.data.voteNum + 1
            })
            return false;
          }
        }
      }
    })
  },
  quxiaozanwz: function (e) {  //文章取消点赞
    let articleList = this.data.articleList, id = e.currentTarget.id;
    let _parms = {
      actId: this.data.actId,
      refId: id,
      type: '2',
      userId: this.data.voteUserId
    }
    Api.zandelete(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '取消成功'
        }, 1500);
        for (let i = 0; i < articleList.length; i++) {
          if (articleList[i].id == id) {
            articleList[i].isZan = 0;
            articleList[i].zan = articleList[i].zan > 0 ? articleList[i].zan - 1 : 0;
            this.setData({
              articleList: articleList,
              voteNum: this.data.voteNum > 0 ? this.data.voteNum - 1 : 0
            })
            return false;
          }
        }
      }
    })
  },
  toDetail(e) {
    const id = e.currentTarget.id
    let _data = this.data.articleList
    let zan = '';
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan;
        if (_data[i].isImg) {
          wx.navigateTo({
            url: '../../discover-plate/dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan
          })
        }
      }
    }
  },
  onReachBottom: function () {  //用户上拉触底
    if (this.data.flag) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        page: this.data.page + 1
      });
      this.article();
    }
  },
  onPullDownRefresh: function () {  //用户下拉刷新
    this.setData({
      articleList: [],
      page: 1,
      flag: true
    });
    this.article();
  },
  dateConv: function (dateStr) {
    let year = dateStr.getFullYear(),
      month = dateStr.getMonth() + 1,
      today = dateStr.getDate();
    month = month > 9 ? month : "0" + month;
    today = today > 9 ? today : "0" + today;
    return year + "-" + month + "-" + today;
  }
})
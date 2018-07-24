import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    actId: 0,
    userId: 0,
    voteUserId: 0,
    voteNum: 0,
    issnap: false,
    nickName: '',
    userName: '',
    articleList: [],
    flag: true,
    page: 1,
    isMine: false,
    actUserName: ''
  },
  onLoad: function(options) {
    // console.log('options:',options)
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      voteUserId: app.globalData.userInfo.userId,
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond)),
      actId: options.actId ? options.actId : '',
      userId: options.userId
    });
    this.homePageInit();
  },
  onShow: function() {
    let isMine = false;
    if (this.data.voteUserId == this.data.userId) {
      isMine = true;
    } 
    this.setData({
      isMine: isMine
    });
    console.log(this.data.isMine);
  },
  homePageInit: function() {
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    this.playerDetail();
    this.getLikeNum();
    this.getactzanTotal();
  },
  playerDetail() { //选手资料
    let _parms = {
        actId: this.data.actId ? this.data.actId : 37,
        beginTime: this.data.today,
        endTime: this.data.tomorrow,
        voteUserId: this.data.voteUserId,
        userId: this.data.userId
      },
      that = this;
    Api.playerDetails(_parms).then((res) => {
      if (res.data.code == 0) {
        if (res.data.data) {
          let data = res.data.data,
            _nickName = '',
            reg = /^1[34578][0-9]{9}$/;
          if (data.userName && reg.test(data.userName)) {
            data.userName = data.userName.substr(0, 3) + "****" + data.userName.substr(7);
          }
          if (data.nickName && reg.test(data.nickName)) {
            data.nickName = data.nickName.substr(0, 3) + "****" + data.nickName.substr(7);
          }
          if (data.nickName == 'null' || !data.nickName) {
            _nickName = data.userName
          } else {
            _nickName = data.nickName
          }
          this.setData({
            // refId: data.id,
            nickName: _nickName,
            actUserName: data.actUserName,
            iconUrl: data.iconUrl,
            sex: data.sex,
            age: data.age,
            height: data.height,
            // voteNum: data.voteNum ? data.voteNum : 0,
            picUrls: data.picUrls ? data.picUrls : []
          });
          for (let i = 0; i < data.picUrls.length; i++) {
            let str = data.picUrls[i].picUrl.substring(data.picUrls[i].picUrl.length - 4, data.picUrls[i].picUrl.length);
            if (str == '.png' || str == '.jpg') {
              this.setData({
                bgUrl: data.picUrls[i].picUrl
              });
            }
          }
        } else {
          wx.request({ //从自己的服务器获取用户信息
            url: that.data._build_url + 'user/get/' + that.data.userId,
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function(res) {
              if (res.data.code == 0) {
                let data = res.data.data,
                  reg = /^1[34578][0-9]{9}$/,
                  _nickName = '';
                if (data.userName && reg.test(data.userName)) {
                  data.userName = data.userName.substr(0, 3) + "****" + data.userName.substr(7);
                }
                if (data.nickName && reg.test(data.nickName)) {
                  data.nickName = data.nickName.substr(0, 3) + "****" + data.nickName.substr(7);
                }
                if (data.nickName == 'null' || !data.nickName) {
                  _nickName = data.userName
                } else {
                  _nickName = data.nickName
                }
                that.setData({
                  // refId: data.id,
                  nickName: _nickName,
                  userName: data.userName,
                  iconUrl: data.iconUrl,
                  sex: data.sex,
                  age: data.age,
                  height: data.height,
                  // voteNum: data.voteNum ? data.voteNum : 0,
                  picUrls: data.picUrls ? data.picUrls : []
                  // bgUrl: data.picUrl
                });
                // console.log(_nickName);
                // console.log(data.userName);
                // console.log(data.iconUrl);
                // console.log(data.sex);
                // console.log(data.age);
                // console.log(data.height);
                // console.log(data.voteNum);
                // console.log(data.picUrls);
                // console.log(data.picUrl);
              }
            }
          })
        }
        that.article();
      } else {
        wx.showToast({
          title: '系统繁忙',
          mask: 'true',
          duration: 2000,
          icon: 'none'
        })
      }
    });
  },
  getactzanTotal() {
    let _parms = {
      userId: this.data.userId
    }
    Api.actzanTotal(_parms).then((res) => {
      if (res.data.code == 0) {
        let _vote = res.data.data;
        if (_vote == 'null' || _vote == null || _vote == '' || _vote == undefined) {
          _vote = 0
        }
        this.setData({
          voteNum: _vote
        })
      }
    })
  },
  getLikeNum() { //获取关注数据
    let _parms = {
      userId: this.data.userId, //关注人userId
      type: 1,
      viewUserId: this.data.voteUserId //当前用户的userId
    };
    Api.getLikeNum(_parms).then((res) => {
      this.setData({
        likeNum: res.data.data
      });
    });
  },
  addLike() { //添加关注
    let that = this;
    let _parms = {
      userId: that.data.voteUserId,
      refId: that.data.userId,
      type: 1,
    };
    Api.addLike(_parms).then((res) => {
      if (res.data.code == 0) {
        that.setData({
          likeNum: {
            isCollected: 1,
            fans: that.data.likeNum.fans + 1,
            focus: that.data.likeNum.focus
          }
        });
        wx.showToast({
          icon: 'none',
          title: '已关注'
        })
      }
    });
  },
  delLike() { //取消关注
    let that = this;
    wx.showModal({
      title: '确定取消关注?',
      success: function(res) {
        if (res.confirm) {
          let _parms = {
            userId: that.data.voteUserId,
            refId: that.data.userId,
            type: 1
          };
          Api.delLike(_parms).then((res) => {
            if (res.data.code == 0) {
              that.setData({
                likeNum: {
                  isCollected: 0,
                  fans: that.data.likeNum.fans < 1 ? 0 : that.data.likeNum.fans - 1,
                  focus: that.data.likeNum.focus
                }
              });
              wx.showToast({
                icon: 'none',
                title: '取消关注'
              })
            }
          });
        }
      }
    })
  },
  toLikeList(e) {  //跳转至关注列表
    wx.navigateTo({
      url: '../../personal-center/livepage/livepage?likeType=' + e.currentTarget.id + '&userId=' + this.data.userId
    })
  },
  article() { //文章列表
    if (app.globalData.isflag) {
      let _parms = {
        userId: this.data.userId,
        zanUserId: app.globalData.userInfo.userId,
        page: this.data.page,
        rows: 6
      };
      Api.myArticleList(_parms).then((res) => {
        let data = res.data,
          list = data.data.list,
          articleList = this.data.articleList;

        if (data.code == 0) {
          wx.hideLoading();
          if (list != null && list != "" && list != []) {
            for (let i = 0; i < list.length; i++) {
              list[i].isMine = this.data.isMine;
              // list[i].content = JSON.parse(list[i].content);
              list[i].timeDiffrence = utils.timeDiffrence(res.data.currentTime, list[i].updateTime, list[i].createTime)
              list[i].isImg = true;
              // if (list[i].content[0].type == 'video') {
              //   list[i].isImg = false;
              // }
              list[i].isplay = false;
              if (!list[i].nickName) {
                list[i].nickName = this.data.nickName;
              }
              list[i].actUserName = this.data.actUserName;
              list[i].summary = utils.uncodeUtf16(list[i].summary);
              var myreg = /^[1][3,4,5,7,8][0-9]{9}$/, phone = list[i].userName;
              if (myreg.test(phone)) {
                list[i].userName = phone.substring(0, 4) + '****' + phone.substring(phone.length - 3, phone.length);
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
            mask: 'true',
            duration: 2000,
            icon: 'none'
          })
        }
      });
    } else {
      wx.hideLoading();
    }
  },
  cancel(e) {  //自己动态可以删除
    let id = e.currentTarget.id, that = this;
    wx.showModal({
      title: '是否删除',
      cancelColor: '#191919',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: that.data._build_url + 'topic/delete/' + id,
            method: 'GET',
            success: function (res) {
              that.setData({
                articleList: [],
                page: 1,
                flag: true
              })
              that.article();
            }
          })
        }
      }
    })
    let _parms = {
      
    }
    
  },
  videoplay(e) {
    let id = e.currentTarget.id,
      _data = this.data.articleList;
    for (let i in _data) {
      if (_data[i].topicType == 2) { //视频
        wx.redirectTo({
          url: '../../activityDetails/video-details/video-details?actId=' + this.data.actId + '&userId=' + this.data.userId + '&id=' + id
        })
      } else if (_data[i].topicType == 1) { //文章
        wx.redirectTo({
          url: '../../discover-plate/dynamic-state/article_details/article_details?actId=' + this.data.actId + '&userId=' + this.data.userId + '&id=' + id + '&zan=' + this.data.voteNum
        })
      }
    }
    this.setData({
      articleList: _data
    })
  },
  toindex() {
    wx.switchTab({
      url: '../../index/index',
    })
  },
  toDetails(e) {
    let str = e.currentTarget;
    wx.navigateTo({
      url: '../../discover-plate/dynamic-state/article_details/article_details?id=' + str.id + '&zan=' + str.dataset.index
    })
  },
  dianzanwz: function(e) { //文章点赞
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let articleList = this.data.articleList,
      id = e.currentTarget.id,
      that = this;
    let _parms = {
      actId: this.data.actId,
      refId: id,
      type: '2',
      userId: this.data.voteUserId
    }
    Api.zanadd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: 'true',
          duration: 2000,
          icon: 'none',
          title: '点赞成功'
        });
        for (let i = 0; i < articleList.length; i++) {
          if (articleList[i].id == id) {
            articleList[i].isZan = 1
            articleList[i].zan = articleList[i].zan + 1;
            this.setData({
              articleList: articleList,
              voteNum: that.data.voteNum ? that.data.voteNum + 1 : 1
            })

            return false;
          }
        }
      }
    })
  },
  quxiaozanwz: function(e) { //文章取消点赞
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    let articleList = this.data.articleList,
      id = e.currentTarget.id;
    let _parms = {
      actId: this.data.actId,
      refId: id,
      type: '2',
      userId: this.data.voteUserId
    }
    Api.zandelete(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: 'true',
          duration: 2000,
          icon: 'none',
          title: '取消成功'
        });
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
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
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
  onReachBottom: function() { //用户上拉触底
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
  onPullDownRefresh: function() { //用户下拉刷新
    this.setData({
      articleList: [],
      page: 1,
      flag: true
    });
    this.article();
  },
  dateConv: function(dateStr) {
    let year = dateStr.getFullYear(),
      month = dateStr.getMonth() + 1,
      today = dateStr.getDate();
    month = month > 9 ? month : "0" + month;
    today = today > 9 ? today : "0" + today;
    return year + "-" + month + "-" + today;
  },
  closetel: function(e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  }
})
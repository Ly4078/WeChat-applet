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
    refId: 0,
    issnap: false,
    nickName: '',
    bgUrl: '',
    iconUrl: '',
    sex: 0,
    age: 0,
    height: 0,
    userCode: 0,
    userInfo: '',
    voteNum: 0,
    videoArr: [],
    imgArr: [],
    article: [],
    articleNum: 0,
    comment_list: [],
    totalComment: 0,
    isComment: false,
    commentVal: '',
    availableNum: 0,    //可用票数
    cmtdata: [],
    isApply: false,
    shareFlag: false
  },
  onLoad: function (options) {
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      actId: options.actId,
      userId: options.id,
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond)),
      actName: options.actName
    });
    if (options.voteUserId) {
      this.setData({
        voteUserId: options.voteUserId,
        shareFlag: true
      });
    } else {
      this.setData({
        voteUserId: app.globalData.userInfo.userId
      });
    }
    if (this.data.userId != this.data.voteUserId) {
      this.isSign();
    }
  },
  onShow: function () {
    this.playerDetail();
    this.articleList();
  },
  isSign() {
    let _parms = {
      refId: this.data.voteUserId,
      actId: this.data.actId,
      type: 1
    }
    Api.actisSign(_parms).then((res) => {
      if (res.data.code == 0) {
        this.setData({
          isApply: true
        });
      }
    });
  },
  toApply() {
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.navigateTo({
      url: '../hot-activity/apply-player/apply-player?id=' + this.data.actId + '&_actName=' + this.data.actName
    })
  },
  toArtList() {
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.redirectTo({
      url: '../onehundred-dish/onehundred-dish?actid=' + this.data.actId
    })
  },
  playerDetail() {
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
          refId: data.id,
          nickName: data.nickName,
          iconUrl: data.iconUrl,
          sex: data.sex,
          age: data.age,
          height: data.height,
          userCode: data.userCode,
          voteNum: data.voteNum,
          userInfo: data.userInfo ? data.userInfo : ''
        });
        this.comment();
        let picUrls = data.picUrls, imgArr = [], videoArr = [];
        for (let i = 0; i < picUrls.length; i++) {
          let str = picUrls[i].picUrl;
          if (str.substring(str.length - 4, str.length) == '.mp4') {
            videoArr.push(picUrls[i]);
          } else {
            imgArr.push(picUrls[i]);
          }
        }
        this.setData({
          videoArr: videoArr,
          imgArr: imgArr,
          bgUrl: imgArr[0].picUrl
        });
      } else {
        wx.showToast({
          title: '系统繁忙',
          icon: 'none'
        })
      }
    });
  },
  articleList() {
    let _parms = {
      zanUserId: this.data.voteUserId,
      userId: this.data.userId,
      page: 1,
      rows: 10
    };
    Api.myArticleList(_parms).then((res) => {
      let data = res.data;
      if(res.data.code == 0) {
        this.setData({
          article: res.data.data.list,
          articleNum: res.data.data.total
        });
      } 
    });
  },
  previewImg(e) {
    let id = e.target.id, imgArr = this.data.imgArr, imgUrls = [], idx = 0;
    for (let i = 0; i < imgArr.length; i++) {
      imgUrls.push(imgArr[i].picUrl);
      if (id == imgArr[i].id) {
        idx = i;
      }
    }
    wx.previewImage({
      current: imgArr[idx].picUrl, 
      urls: imgUrls
    })
  },
  toUploadVideo() {
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.navigateTo({
      url: '../../discover-plate/dynamic-state/dynamic-state?id=2&actId=37'
    })
  },
  dianzanwz: function (e) {  //文章点赞
    let id = e.currentTarget.id, article = this.data.article;
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    let _parms = {
      refId: id,
      type: 2,
      userId: app.globalData.userInfo.userId
    }
    Api.zanadd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '点赞成功'
        }, 1500)
        for (let i = 0; i < article.length; i++) {
          if (id == article[i].id) {
            article[i].isZan++;
            article[i].zan++;
            this.setData({
              article: article,
              voteNum: this.data.voteNum + 1
            })
            return false;
          }
        }
      }
    })
  },
  quxiaozanwz: function (e) {  //文章取消点赞
    let id = e.currentTarget.id, article = this.data.article;
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    let _parms = {
      refId: id,
      type: 2,
      userId: app.globalData.userInfo.userId
    }
    Api.zandelete(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '取消成功',
        }, 1500)
        for (let i = 0; i < article.length; i++) {
          if (id == article[i].id) {
            article[i].isZan--;
            article[i].zan--;
            console.log(article)
            if (article[i].isZan <= 0) {
              article[i].isZan = 0;
            }
            if (article[i].zan <= 0) {
              article[i].zan = 0;
            }
            this.setData({
              article: article,
              voteNum: this.data.voteNum - 1
            })
            if(this.data.voteNum <= 0) {
              this.setData({
                voteNum: 0
              })
            }
            return false;
          }
        }
      }
    })
  },
  toDetails(e) {
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    let str = e.currentTarget;
    wx.navigateTo({
      url: '../../discover-plate/dynamic-state/article_details/article_details?id=' + str.id + '&zan=' + str.dataset.index
    })
  },
  comment() {
    let _parms = {
      refId: this.data.refId,
      cmtType: 7,
      zanUserId: this.data.voteUserId,
      page: 1,
      rows: 5
    };
    Api.cmtlist(_parms).then((res) => {
      if (res.data.code == 0) {
        let _data = res.data.data;
        let reg = /^1[34578][0-9]{9}$/;
        for (let i in _data.list) {
          if (reg.test(_data.list[i].userName)) {
            _data.list[i].userName = _data.list[i].userName.substr(0, 3) + "****" + _data.list[i].userName.substr(7);
          }
        }
        this.setData({
          comment_list:_data.list,
          totalComment:_data.total
        });
      }
    });
  },
  toMoreComment() {
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.navigateTo({
      url: '../../index/merchant-particulars/total-comment/total-comment?id=' + this.data.refId + '&cmtType=7'
    })
  },
  showArea() {
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    this.setData({
      isComment: !this.data.isComment
    });
  },
  getCommentVal(e) {
    this.setData({
      commentVal: e.detail.value
    })
  },
  setcmtadd: function () {  //新增评论
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (!this.data.commentVal) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    this.setData({
      isComment: false
    })
    let _parms = {
      refId: this.data.refId,
      cmtType: 7,
      content: utils.utf16toEntities(this.data.commentVal),
      userId: this.data.voteUserId,
      userName: app.globalData.userInfo.userName,
      nickName: app.globalData.userInfo.nickName,
    }
    Api.cmtadd(_parms).then((res) => {
      console.log(res);
      if(res.data.code == 0) {
        this.comment();
      } else {
        wx.showToast({
          title: '系统繁忙,请稍后再试',
          icon:'none'
        })
      }
    })
  },
  castvote: function () {  //選手投票
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    let _this = this;
    let _parms = {
      actId: this.data.actId,
      userId: this.data.voteUserId,
      playerUserId: this.data.userId
    }
    Api.availableVote(_parms).then((res) => {
      this.setData({
        availableNum: res.data.data.user
      });
      if (this.data.availableNum <= 0) {
        console.log(this.data.availableNum)
        wx.showToast({
          title: '今天票数已用完,请明天再来',
          icon: 'none'
        })
        return false;
      }
      Api.voteAdd(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '投票成功',
            icon: 'none'
          })
          _this.setData({
            availableNum: _this.data.availableNum - 1,
            voteNum: _this.data.voteNum + 1
          });
        }
      });
    });
  },
  toLike: function (e) {//评论点赞
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    let id = e.currentTarget.id;
    let ind = '';
    for (let i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        ind = i;
      }
    }
    let _parms = {
      refId: id,
      type: 4,
      userId: this.data.voteUserId,
    }
    Api.zanadd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: true,
          icon: 'none',
          title: '点赞成功'
        }, 1500)
        var comment_list = this.data.comment_list;
        comment_list[ind].isZan = 1;
        comment_list[ind].zan++;
        this.setData({
          comment_list: comment_list
        });
      }
    })
  },
  cancelLike() {
    if (app.globalData.userInfo.mobile == undefined || app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.showToast({
      title: '您已经点过赞了',
      icon: 'none'
    })
  },
  onPageScroll: function () {  //监听页面滑动
    this.setData({
      isComment: false
    })
  },
  homePage() {
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
      return false
    }
    wx.navigateTo({
      url: '../homePage/homePage?actId=' + this.data.actId + '&userId=' + this.data.userId,
    })
  },
  onShareAppMessage() {
    return {
      title: '选手详情',
      desc: '享7美食',
      path: '/pages/activityDetails/player-detail/player-detail?actId=' + this.data.actId + '&id=' + this.data.userId + '&voteUserId=' + this.data.voteUserId,
      success() {
        console.log('转发成功');
      }
    }
  },
  transpond() {
    this.onShareAppMessage();
  },
  dateConv: function (dateStr) {
    let year = dateStr.getFullYear(),
      month = dateStr.getMonth() + 1,
      today = dateStr.getDate();
    month = month > 9 ? month : "0" + month;
    today = today > 9 ? today : "0" + today;
    return year + "-" + month + "-" + today;
  },
  closetel: function (e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.redirectTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  }
})
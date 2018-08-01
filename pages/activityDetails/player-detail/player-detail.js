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
    refId: 0,
    issnap: false,
    istouqu:false,
    isball: true,
    nickName: '',
    actUserName: '',
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
    availableNum: 0, //可用票数
    cmtdata: [],
    isApply: false,
    isnew: false,
    shareFlag: false,
    isshow: false,
    voteFlag: true,
    likeFlag: true,
    castFlag: true,
    user:''
  },
  onLoad: function(options) {
    console.log("options:", options)
    let dateStr = new Date();
    let milisecond = new Date(this.dateConv(dateStr)).getTime() + 86400000;
    this.setData({
      actId: options.actId,
      userId: options.id,
      today: this.dateConv(dateStr),
      tomorrow: this.dateConv(new Date(milisecond)),
      actName: options.actName
    });
    if (app.globalData.userInfo.userId) {
      this.setData({
        voteUserId: app.globalData.userInfo.userId
      });
    } else if (options.voteUserId) {
      this.setData({
        voteUserId: options.voteUserId,
        shareFlag: true
      });
    }
    if (this.data.userId != this.data.voteUserId) {
      this.isSign();
    }
  },
  onShow: function() {
    if (!app.globalData.userInfo.mobile) {
      this.getuserinfo();
    }
    if (app.globalData.isflag) {
      this.setData({
        isshow: true
      })
    } else {
      this.setData({
        isshow: false
      })
    }
    this.playerDetail();
    this.articleList();
    this.availableVote;
  },
  availableVote() { //获取用户剩余投票数
    let _parms = {
      actId: this.data.actId,
      userId: this.data.voteUserId
    }
    Api.availableVote(_parms).then((res) => {
      let sku = 0;
      if (res.data.code == 0) {
        user = res.data.data.user;
        console.log('sku:', sku)
        this.setData({
          user: user
        });
      }
    });
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        sku: 0,
        user: 0
      });
    }
  },
  isSign() {
    let _parms = {
      refId: app.globalData.userInfo.userId,
      actId: this.data.actId ? this.data.actId : 37,
      type: 1
    }
    Api.actisSign(_parms).then((res) => {
      if (res.data.code == 0) {
        this.setData({
          isApply: true
        });
      } else {
        this.setData({
          isApply: false
        });
      }
    });
  },
  toApply() {
    let that = this;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (app.globalData.userInfo.userType == '2' && app.globalData.userInfo.shopId != '') {
      wx.navigateTo({
        url: '../../../pages/index/download-app/download?isshop=ind',
      })
    } else {

      wx.showModal({
        title: '',
        content: '立即报名',
        cancelText: '商家报名',
        cancelColor: '#3CC51F',
        confirmText: '选手报名',
        success: function(res) {
          if (res.cancel) { //商家用户
            wx.navigateTo({
              url: '../../../pages/index/download-app/download?isshop=ind',
            })
          } else if (res.confirm) { //普通用户
            let _parms = {
              refId: that.data.voteUserId,
              actId: that.data.actId,
              type: 1
            }
            Api.actisSign(_parms).then((res) => {
              let data = res.data;
              if (data.code == 0) {
                wx.navigateTo({
                  url: '../hot-activity/apply-player/apply-player?id=' + that.data.actId + '&_actName=' + that.data.actName
                })
              } else {
                wx.showToast({
                  title: data.message,
                  mask: 'true',
                  duration: 2000,
                  icon: 'none'
                })
              }
            });
          }
        }
      })
    }
  },
  toArtList() {
    if (!app.globalData.userInfo.mobile) {
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
        let data = res.data.data,
          reg = /^1[34578][0-9]{9}$/,
          _nickName = '';
        if (data.nickName && reg.test(data.nickName)) {
          data.nickName = data.nickName.substr(0, 3) + "****" + data.nickName.substr(7)
        }
        if (data.userName && reg.test(data.userName)) {
          data.userName = data.userName.substr(0, 3) + "****" + data.userName.substr(7)
        }
        if (data.nickName == 'null' || !data.nickName) {
          _nickName = data.userName
        } else {
          _nickName = data.nickName
        }
        data.userInfo = utils.uncodeUtf16(data.userInfo);
        this.setData({
          refId: data.id,
          nickName: _nickName,
          actUserName: data.actUserName,
          iconUrl: data.iconUrl,
          sex: data.sex,
          age: data.age,
          height: data.height,
          userCode: data.userCode,
          voteNum: data.voteNum,
          userInfo: data.userInfo ? data.userInfo : ''
        });
        this.comment();
        let picUrls = data.picUrls,
          imgArr = [],
          videoArr = [];
        for (let i = 0; i < picUrls.length; i++) {
          let str = picUrls[i].picUrl;
          if (str.substring(str.length - 4, str.length) == '.mp4') {
            videoArr.push(picUrls[i]);
          } else {
            imgArr.push(picUrls[i]);
          }
        }
        console.log("videoArr:", videoArr)
        this.setData({
          videoArr: videoArr,
          imgArr: imgArr,
          bgUrl: imgArr[0].picUrl
        });
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
  articleList() {
    if (app.globalData.isflag) {
      let _parms = {
        zanUserId: this.data.voteUserId,
        userId: this.data.userId,
        page: 1,
        rows: 10
      };
      Api.myArticleList(_parms).then((res) => {
        if (res.data.code == 0) {
          let _data = res.data.data,
            videoarr = [],
            articlearr = [];
          for (let i in _data.list) {

            _data.list[i].content = JSON.parse(_data.list[i].content);
            if (_data.list[i].content[0].type == 'video' || _data.list[i].topicType == 2) { //视频
              videoarr.push(_data.list[i])
            } else if (_data.list[i].content[0].type == 'img' || _data.list[i].topicType == 1) { //文章
              articlearr.push(_data.list[i])
            }
          }

          this.setData({
            article: videoarr,
            articleNum: _data.total
          });
        }
      });
    }

  },
  previewImg(e) {
    let id = e.target.id,
      imgArr = this.data.imgArr,
      imgUrls = [],
      idx = 0;
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
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (app.globalData.isflag) {
      wx.navigateTo({
        url: '../../discover-plate/dynamic-state/dynamic-state?acfrom=2&id=2&actId=' + this.data.actId
      })
    } else {
      wx.showToast({
        title: '功能开发中...',
        icon: 'none'
      })
    }
  },
  dianzanwz: function(e) { //文章点赞
    let id = e.currentTarget.id,
      article = this.data.article,
      that = this;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }

    if (this.data.likeFlag) {
      that.setData({
        likeFlag: false
      });
      let _parms = {
        refId: id,
        type: 2,
        userId: app.globalData.userInfo.userId
      }
      Api.zanadd(_parms).then((res) => {
        setTimeout(function() {
          that.setData({
            likeFlag: true
          });
        }, 3000);
        if (res.data.code == 0) {
          wx.showToast({
            mask: 'true',
            icon: 'none',
            title: '点赞成功',
            duration: 3000
          })
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
    }
  },
  quxiaozanwz: function(e) { //文章取消点赞
    let id = e.currentTarget.id,
      article = this.data.article,
      that = this;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (this.data.likeFlag) {
      that.setData({
        likeFlag: false
      });
      let _parms = {
        refId: id,
        type: 2,
        userId: app.globalData.userInfo.userId
      }
      Api.zandelete(_parms).then((res) => {
        setTimeout(function () {
          that.setData({
            likeFlag: true
          });
        }, 3000);
        if (res.data.code == 0) {
          wx.showToast({
            mask: 'true',
            icon: 'none',
            title: '取消成功',
            duration: 3000
          })
          for (let i = 0; i < article.length; i++) {
            if (id == article[i].id) {
              article[i].isZan--;
              article[i].zan--;
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
              if (this.data.voteNum <= 0) {
                this.setData({
                  voteNum: 0
                })
              }
              return false;
            }
          }
        }
      })
    }
  },
  toDetails(e) {
    if (!app.globalData.userInfo.mobile) {
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
          _data.list[i].content = utils.uncodeUtf16(_data.list[i].content);
          if (reg.test(_data.list[i].userName)) {
            _data.list[i].userName = _data.list[i].userName.substr(0, 3) + "****" + _data.list[i].userName.substr(7);
          }
        }
        this.setData({
          comment_list: _data.list,
          totalComment: _data.total
        });
      }
    });
  },
  toMoreComment() {
    if (!app.globalData.userInfo.mobile) {
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
    if (!app.globalData.userInfo.mobile) {
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
  setcmtadd: function() { //新增评论
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (!this.data.commentVal) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none',
        mask: 'true',
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
      if (res.data.code == 0) {
        this.comment();
      } else {
        wx.showToast({
          title: '系统繁忙,请稍后再试',
          mask: 'true',
          duration: 2000,
          icon: 'none'
        })
      }
    })
  },
  castvote: function() { //選手投票
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (this.data.castFlag) {
      this.setData({
        castFlag: false
      });
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
        setTimeout(function() {
          _this.setData({
            castFlag: true
          });
        }, 3000);
        if (this.data.availableNum <= 0) {
          wx.showToast({
            title: '今天票数已用完,请明天再来',
            mask: 'true',
            icon: 'none',
            duration: 2000
          })
          return false;
        }
        Api.voteAdd(_parms).then((res) => {
          if (res.data.code == 0) {
            wx.showToast({
              title: '投票成功',
              mask: 'true',
              icon: 'none'
            })
            _this.setData({
              availableNum: _this.data.availableNum - 1,
              voteNum: _this.data.voteNum + 1
            });
          }
        });
      });
    }
  },
  toLike: function(e) { //评论点赞
    let that = this;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (!this.data.voteFlag) {
      return false;
    }
    this.setData({
      voteFlag: false
    });
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
          mask: 'true',
          duration: 2000,
          icon: 'none',
          title: '点赞成功'
        })
        var comment_list = this.data.comment_list;
        comment_list[ind].isZan = 1;
        comment_list[ind].zan++;
        this.setData({
          comment_list: comment_list
        });
        setTimeout(function() {
          that.setData({
            voteFlag: true
          });
        }, 1000);
      }
    })
  },
  cancelLike(e) {
    let that = this;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (!this.data.voteFlag) {
      return false;
    }
    this.setData({
      voteFlag: false
    });
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
    Api.zandelete(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          mask: 'true',
          duration: 2000,
          icon: 'none',
          title: '点赞取消'
        })
        var comment_list = this.data.comment_list;
        comment_list[ind].isZan = 0;
        comment_list[ind].zan--;
        if (comment_list[ind].zan <= 0) {
          comment_list[ind].zan = 0;
        }
        this.setData({
          comment_list: comment_list
        });
        setTimeout(function() {
          that.setData({
            voteFlag: true
          });
        }, 1000);
      }
    })
  },
  handvideo: function() {
    let Url = this.data.videoArr[0].picUrl;
    wx.navigateTo({
      url: '../video-details/video-details?url=' + Url + '&actId=' + this.data.actId + '&userId=' + this.data.userId,
    })
  },
  clickvidoe: function(e) {
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let id = e.currentTarget.id,
      ind = '',
      str = e.currentTarget;;
    let _actId = this.data.actId,
      isvideo = false;
    for (let i = 0; i < this.data.article.length; i++) {
      if (this.data.article[i].id == id) {
        if (this.data.article[i].content[0].type == 'video' || this.data.article[i].topicType == 2) {
          wx.navigateTo({
            url: '../video-details/video-details?&id=' + id + '&actId=' + _actId + '&userId=' + this.data.userId,
          })
        } else if (this.data.article[i].content[0].type == 'img' || this.data.article[i].topicType == 1) {
          wx.navigateTo({
            url: '../../discover-plate/dynamic-state/article_details/article_details?id=' + str.id + '&zan=' + str.dataset.index
          })
        }
      }
    }
  },
  onPageScroll: function() { //监听页面滑动
    this.setData({
      isComment: false
    })
  },
  homePage() {
    if (!app.globalData.userInfo.mobile) {
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
  },
  getuserinfo() {
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          let that = this;
          Api.getOpenId(_parms).then((res) => {
            app.globalData.userInfo.openId = res.data.data.openId;
            app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
            if (res.data.data.unionId) {
              app.globalData.userInfo.unionId = res.data.data.unionId;
              that.getmyuserinfo();
            } else {
              that.findByCode();
              wx.hideLoading();
            }
          })
        }
      }
    })
  },
  getmyuserinfo: function() {
    let _parms = {
        openId: app.globalData.userInfo.openId,
        unionId: app.globalData.userInfo.unionId
      },
      that = this;
    Api.addUserUnionId(_parms).then((res) => {
      if (res.data.data) {
        app.globalData.userInfo.userId = res.data.data;
        that.setData({
          voteUserId: res.data.data
        })
        that.isSign();
        wx.request({ //从自己的服务器获取用户信息
          url: this.data._build_url + 'user/get/' + res.data.data,
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function(res) {
            if (res.data.code == 0) {
              let data = res.data.data;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              };

              if (!data.mobile) {
                that.setData({
                  isnew: true
                })
              }
            }
          }
        })
      }
    })
  },
  findByCode: function() {
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            if (res.data.data.unionId) {
              app.globalData.userInfo.unionId = res.data.data.unionId;
              that.getmyuserinfo();
            } else {
              wx.hideLoading();
              that.setData({
                istouqu: true
              })
            }
          } else {
            that.findByCode();
            wx.hideLoading();
            that.setData({
              istouqu: true
            })
          }
        })
      }
    })
  },
  againgetinfo: function () { //点击获取用户unionId
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        let _pars = {
          sessionKey: app.globalData.userInfo.sessionKey,
          ivData: res.iv,
          encrypData: res.encryptedData
        }
        Api.phoneAES(_pars).then((resv) => {
          if (resv.data.code == 0) {
            that.setData({
              istouqu: false
            })
            let _data = JSON.parse(resv.data.data);
            app.globalData.userInfo.unionId = _data.unionId;
            that.getmyuserinfo();
          }
        })
      }
    })
  },
  toactlist() {
    wx.switchTab({
      url: '../../index/index',
    })
  }
})
import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require("../../../../utils/util.js")
var WxParse = require('../../../../utils/wxParse/wxParse.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN, //服务器域名
    _id: '', //文章ID
    zan: '', //点赞数
    details: {}, //文章数据 
    cmtdata: [], //文章评论数据 
    nodes: [],
    interval: '', //时间差
    commentVal: '', //评论内容
    userInfo: {}, //用户数据 
    isComment: false,
    preview: {}, //预览数据
    userId: '1', //虚拟ID 暂用
    userName: '测试名称', //虚拟名称 暂用
    clickvideo: false,
    issnap: false,
    cfrom: '',
    hideUserinfo:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('options:', options)
    if(options.froms=='index'){
      this.setData({
        hideUserinfo:false
      })
    }
    if (options.cfrom == 'dy') {
      this.setData({
        cfrom: options.cfrom
      })
    }
    if (options.id) {
      const id = options.id
      this.setData({
        _id: id,
        zan: options.zan,
      })

    } else {
      this.setData({
        details: options
      })
    }
    if (app.globalData.userInfo.id) {
      // this.setData({
      //   userInfo: app.globalData.userInfo
      // })
      this.gettopiclist(this.data._id);
      this.getcmtlist();
    } else {
      this.findByCode();
    }
    // this.setcmtadd()
  },
  onShow:function(){

  },
  // 初始化start
  findByCode: function() { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let _data = res.data.data;
            if (_data.id && _data != null) {
              app.globalData.userInfo.userId = _data.id;
              for (let key in _data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = _data[key]
                  }
                }
              };
              if (_data.mobile) {
                that.authlogin();
              } else {
                wx.navigateTo({
                  url: '/pages/init/init?isback=1'
                })
              }
            } else {
              wx.navigateTo({
                url: '/pages/init/init?isback=1'
              })
            }
          }
        })
      }
    })
  },
  authlogin: function() { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          wx.setStorageSync('token', _token)
          that.gettopiclist(that.data._id);
          that.getcmtlist();
        }
      }
    })
  },
  gettopiclist: function(id) { //获取单个文章内容数据
  let that = this;
    let _parms = {
      id: id,
      zanUserId: app.globalData.userInfo.userId,
      zanUserName: app.globalData.userInfo.userName,
      zanSourceType: '1',
      token: app.globalData.token
    }
    Api.getTopicByZan(_parms).then((res) => {
      if (res.data.code == 0) {
        let _data = res.data.data;
        console.log(_data)
        WxParse.wxParse('article', 'html', _data.content, that,10);
        _data.summary = utils.uncodeUtf16(_data.summary)
        _data.content = utils.uncodeUtf16(_data.content)
        _data.timeDiffrence = utils.timeDiffrence(res.data.currentTime, _data.updateTime, _data.createTime)
        // _data.content = JSON.parse(_data.content);
        _data.hitNum = utils.million(_data.hitNum)
        _data.zan = utils.million(_data.zan)
        let reg = /^1[34578][0-9]{9}$/;
        if (reg.test(_data.userName)) {
          _data.userName = _data.userName.substr(0, 3) + "****" + _data.userName.substr(7);
        }
        _data.title = utils.uncodeUtf16(_data.title);
        this.setData({
          details: _data,
          nodes: _data.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto" ')
        })
        this.getuser(_data.userId)
      }
    })
  },
  getuser: function(id) { //获取用户信息
    let that = this;
    wx.request({
      url: this.data._build_url + 'user/get/' + id,
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            userInfo: res.data.data
          })
        }
      }
    })
  },
  getcmtlist: function() { //获取文章评论数据
    let _parms = {
      // zanUserId: app.globalData.userInfo.userId,
      cmtType: '2',
      refId: this.data._id,
      token: app.globalData.token
    }
    Api.cmtlist(_parms).then((res) => {
      let _data = res.data.data;
      _data.total = utils.million(_data.total)
      if (_data.list) {
        let reg = /^1[34578][0-9]{9}$/;
        for (let i = 0; i < _data.list.length; i++) {
          _data.list[i].content = utils.uncodeUtf16(_data.list[i].content)
          _data.list[i].zan = utils.million(_data.list[i].zan)
          if (reg.test(_data.list[i].nickName)) {
            _data.list[i].nickName = _data.list[i].nickName.substr(0, 3) + "****" + _data.list[i].nickName.substr(7)
          }
          if (reg.test(_data.list[i].userName)) {
            _data.list[i].userName = _data.list[i].userName.substr(0, 3) + "****" + _data.list[i].userName.substr(7)
          }
        }
        this.setData({
          cmtdata: _data
        })
      }
    })
  },
  showAreatext: function() { //显示发表输入框
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    this.setData({
      isComment: true
    })
  },
  getCommentVal: function(e) { //获取评论输入框
    this.setData({
      commentVal: e.detail.value
    })
  },
  setcmtadd: function() { //新增文章评论
    let _values = "", _parms = {},that = this, _url = '';
    if (!this.data.commentVal) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none',
        duration: 2000
      })
      this.setData({
        isComment: false
      })
      return false;
    } else {
      let _value = utils.utf16toEntities(this.data.commentVal)
      this.setData({
        commentVal: _value
      })
    }
    _parms = {
      refId: this.data._id,
      cmtType: '2',
      content: this.data.commentVal,
      // userId: app.globalData.userInfo.userId,
      // userName: app.globalData.userInfo.userName,
      // nickName: app.globalData.userInfo.nickName,

    }
    for (var key in _parms) {
      _values += key + "=" + _parms[key] + "&";
    }
    _values = _values.substring(0, _values.length - 1);
    _url = encodeURI(that.data._build_url + 'cmt/add?' + _values);
    wx.request({
      url: _url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        if(res.data.code == 0){
          that.setData({
            isComment: false
          })
          that.getcmtlist()
        }
      }
    })
  },
  videoclick: function() {
    this.setData({
      clickvideo: true
    })
  },
  //视频播放完成
  bindended: function() {
    this.setData({
      clickvideo: false
    })
  },
  //跳转至所有评论
  jumpTotalComment: function() {
    wx.navigateTo({
      url: '../../../index/merchant-particulars/total-comment/total-comment?id=' + this.data._id + '&cmtType=2&source=article'
    })
  },
  clickzan: function() { //  点赞/取消点赞
    if (this.data.details.isZan) {
      this.quxiaozanwz();
    } else {
      this.dianzanwz();
    }
  },
  dianzanwz: function() { //文章点赞
    let that = this,
      _details = this.data.details;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true,
        clickvideo: false
      })
    } else {
      wx.request({
        url: that.data._build_url + 'zan/add?refId=' + _details.id + '&type=2',
        method: 'POST',
        header: {
          "Authorization": app.globalData.token
        },
        success: function(res) {
          if (res.data.code == 0) {
            wx.showToast({
              mask: true,
              icon: 'none',
              title: '点赞成功'
            }, 1500)
            _details.isZan = 1
            _details.zan = _details.zan + 1
            let _zan = that.data.zan
            _zan++
            that.setData({
              details: _details,
              zan: _zan
            })
          }
        }
      })
    }
  },
  quxiaozanwz: function() { //文章取消点赞
    let that = this
    let _details = this.data.details
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true,
        clickvideo: false
      })
      return false
    }
    wx.request({
      url: this.data._build_url + 'zan/delete?refId=' + _details.id + '&type=2',
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          wx.showToast({
            mask: true,
            icon: 'none',
            title: '取消成功',
          }, 1500)
          _details.isZan = 0
          _details.zan = _details.zan - 1
          if (_details.zan < 0) {
            _details.zan = 0
          }
          let _zan = that.data.zan;
          _zan--;
          that.setData({
            details: _details,
            zan: _zan
          })
        }
      }
    })
  },
  //监听页面分享
  onShareAppMessage: function (res) {
    let _details = this.data.details;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: _details.title,
      path: 'pages/discover-plate/dynamic-state/article_details/article_details',
      imageUrl: _details.homePic,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  toLike: function(event) { //评论点赞
    let that = this,
      id = event.currentTarget.id,
      ind = '';
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    } else {
      for (let i = 0; i < this.data.cmtdata.list.length; i++) {
        if (this.data.cmtdata.list[i].id == id) {
          ind = i;
        }
      }
      wx.request({
        url: this.data._build_url + 'zan/add?refId=' + id + '&type=4',
        method: 'POST',
        header: {
          "Authorization": app.globalData.token
        },
        success: function(res) {
          if (res.data.code == 0) {
            wx.showToast({
              mask: true,
              icon: 'none',
              title: '点赞成功'
            }, 1500)
            let _cmtdata = that.data.cmtdata
            _cmtdata.list[ind].isZan = 1;
            _cmtdata.list[ind].zan++;
            that.setData({
              cmtdata: _cmtdata
            });
          }
        }
      })
    }
  },
  cancelLike: function(event) { //评论取消点赞
    let that = this
    let id = event.currentTarget.id
    let ind = ''
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    } else {
      for (let i = 0; i < this.data.cmtdata.list.length; i++) {
        if (this.data.cmtdata.list[i].id == id) {
          ind = i;
        }
      }

      wx.request({
        url: this.data._build_url + 'zan/delete?refId=' + id + '&type=4',
        method: 'POST',
        header: {
          "Authorization": app.globalData.token
        },
        success: function(res) {
          if (res.data.code == 0) {
            wx.showToast({
              mask: true,
              icon: 'none',
              title: '已取消'
            }, 1500)
            let _cmtdata = that.data.cmtdata
            _cmtdata.list[ind].isZan = 0;
            _cmtdata.list[ind].zan == 0 ? _cmtdata.list[ind].zan : _cmtdata.list[ind].zan--;
            that.setData({
              cmtdata: _cmtdata
            });
          }
        }
      })
    }
  },
  closetel: function(e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.redirectTo({
        url: '/pages/init/init?isback=1'
        // url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
      })
    }
  }
})

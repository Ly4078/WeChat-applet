
import Api from '/../../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js')
  
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    foodData:[],
    comment_list:[],
    option:{},
    issnap: false,  //是否是临时用户
    isComment:false,
    commentVal:'',
    commentNum:0,
    _details: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    this.setData({
      option: options
    })
    this.getfoodData(options)
  },
  getfoodData: function (options){  //获取特色菜数据
    let that = this;
    let _parms = {
      id: options.id,
      shopId:options.shopid,
      zanUserId: app.globalData.userInfo.userId
    }
    Api.getTscForZan(_parms).then((res) => {
      let _data = res.data.data;
      _data.skuInfo = utils.uncodeUtf16(_data.skuInfo);
      this.setData({
        foodData: _data
      })
      this.commentList()
    })
  },
  onPageScroll: function () {  //监听页面滑动
    this.setData({
      isComment: false
    })
  },
  clickzan:function(){  //点赞
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let _details = this.data.foodData.isZan
    if (_details == 0){
      this.dianzanwz();
    }else{
      this.quxiaozanwz();
    }
  },
  dianzanwz: function (e) {  //推荐菜点赞
    let that = this, _details = this.data.foodData;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    } else {
      wx.request({
        url: that.data._build_url + 'zan/add?refId=' + _details.id + '&type=6',
        method: "POST",
        header: {
          "Authorization": app.globalData.token
        },
        success: function (res) {
          if (res.data.code == 0) {
            wx.showToast({
              mask: true,
              icon: 'none',
              title: '点赞成功'
            }, 1500)
            _details.isZan = 1;
            _details.zan = _details.zan + 1;
            let _zan = that.data.zan;
            _zan++;
            that.setData({
              foodData: _details,
              zan: _zan
            })
          }
        }
      })
    }
  },
  quxiaozanwz: function () {  //推荐菜取消点赞
    let that = this, _details = this.data.foodData;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    }else{
      wx.request({
        url: that.data._build_url + 'zan/delete?refId=' + _details.id + '&type=6',
        method: "POST",
        header: {
          "Authorization": app.globalData.token
        },
        success: function (res) {
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
            let _zan = that.data.zan
            _zan--
            that.setData({
              foodData: _details,
              zan: _zan
            })
          }
        }
      })
    }
  },
  toLike: function (event) { //评论点赞
    let that = this
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    let id = event.currentTarget.id, index = "";
    for (var i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        index = i;
      }
    }
    wx.request({
      url: that.data._build_url + 'zan/add?refId=' + id + '&type=4&userId=' + app.globalData.userInfo.userId,
      method: "POST",
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            mask: true,
            icon: 'none',
            title: '点赞成功'
          }, 1500)
          var comment_list = that.data.comment_list
          comment_list[index].isZan = 1;
          comment_list[index].zan++;
          that.setData({
            comment_list: comment_list
          });
        }
      }
    })
  },
  cancelLike: function (event) { //取消点赞
    let that = this,
      id = event.currentTarget.id,
      cmtType = "",
      index = "";
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    for (var i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        index = i;
      }
    }
    wx.request({
      url: that.data._build_url + 'zan/delete?refId=' + id + '&type=4&userId=' + app.globalData.userInfo.userId,
      method: "POST",
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            mask: true,
            icon: 'none',
            title: '已取消'
          }, 1500)
          var comment_list = that.data.comment_list
          comment_list[index].isZan = 0;
          comment_list[index].zan == 0 ? comment_list[index].zan : comment_list[index].zan--;
          that.setData({
            comment_list: comment_list
          });
        }
      }
    })
  },
  showAreatext: function () { //显示发表评论框
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
  getCommentVal: function (e) { //获取评论输入框
    this.setData({
      commentVal: e.detail.value
    })
  },
  sendComment: function (e) { //发表评论
    let that = this;
    if (this.data.commentVal == "" || this.data.commentVal == undefined) {
      wx.showToast({
        mask: true,
        title: '请先输入评论',
        icon: 'none'
      }, 1500)
    } else {
      let content = utils.utf16toEntities(that.data.commentVal), _values = "", _parms = {};
      _parms = {
        refId: that.data.option.id,
        cmtType: '6',
        content: content,
      }
      for (var key in _parms) {
        _values += key + "=" + _parms[key] + "&";
      }
      _values = _values.substring(0, _values.length - 1);
      wx.request({
        url: that.data._build_url + 'cmt/add?' + _values,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function (res) {
          if (res.data.code == 0) {
            that.setData({
              isComment: false,
              commentVal: ""
            })
            that.commentList()
          }
        }
      });
    }
  },
  commentList: function () {//评论列表
    let that = this;
    wx.request({
      url: that.data._build_url + 'cmt/list',
      header: {
        "Authorization": app.globalData.token
      },
      data: {
        refId: that.data.option.id,
        cmtType:6,
        zanUserId: app.globalData.userInfo.userId,
        page: 1,
        rows: 5
      },
      success: function (res) {
        let data = res.data;
        if (data.code == 0 && data.data.list != null && data.data.list != "") {
          if (res.data.code == 0) {
            let _data = res.data.data.list
            let reg = /^1[34578][0-9]{9}$/;
            for (let i = 0; i < _data.length; i++) {
              _data[i].zan = utils.million(_data[i].zan)
              _data[i].content = utils.uncodeUtf16(_data[i].content)
              if (reg.test(_data[i].nickName)) {
                _data[i].nickName = _data[i].nickName.substr(0, 3) + "****" + _data[i].nickName.substr(7);
              }
            }
            that.setData({
              comment_list: _data
            })
          }
          that.setData({
            commentNum: res.data.data.total
          })
          wx.stopPullDownRefresh();
        }
      }
    })
  },
  jumpTotalComment: function () {//跳转至所有评论
    let that = this;
    wx.navigateTo({
      url: '../total-comment/total-comment?id=' + that.data.option.id + '&cmtType=6'
    })
  },
  getPhoneNumber: function (e) { //获取用户授权的电话号码
    let that = this,msg = e.detail;
    this.setData({
      isphoneNumber: false
    })
    if (!e.detail.iv) { //拒绝授权
      return false
    }
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.getOpenId(_parms).then((res) => {
            app.globalData.userInfo.openId = res.data.data.openId;
            app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
            if (res.data.code == 0) {
              let _sessionKey = app.globalData.userInfo.sessionKey,
                _ivData = res.iv, _encrypData = res.encryptedData;
              _sessionKey = _sessionKey.replace(/\=/g, "%3d");
              _ivData = _ivData.replace(/\=/g, "%3d");
              _ivData = _ivData.replace(/\+/g, "%2b");
              _encrypData = _encrypData.replace(/\=/g, "%3d");
              _encrypData = _encrypData.replace(/\+/g, "%2b");
              _encrypData = _encrypData.replace(/\//g, "%2f");

              wx.request({
                url: that.data._build_url + 'auth/phoneAES?sessionKey=' + _sessionKey + '&ivData=' + _ivData + '&encrypData=' + _encrypData,
                header: {
                  'content-type': 'application/json' // 默认值
                },
                method: 'POST',
                success: function (resv) {
                  if (resv.data.code == 0) {
                    let _data = JSON.parse(resv.data.data)
                    // console.log("_data:", _data)
                    app.globalData.userInfo.mobile = _data.phoneNumber,
                      that.setData({
                        isphoneNumber: false,
                        issnap: false
                      })
                    // this.getuseradd()
                  }
                }
              })
            }
          })
        }
      }
    })
  },
  closetel: function (e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
      })
    }
  }
})
// pages/activityDetails/video-details/discuss/discuss.js

import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
var Public = require('../../../../utils/public.js');
var app = getApp();
var requestTask = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    commentVal:'',
    refId:'',
    totalComment:'0',
    comment_list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      refId: options.refId
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getcmtlist();
  },
  getCommentVal(e) { //实时获取输入的评论
    this.setData({
      commentVal: e.detail.value
    })
  },
  setcmtadd: function () { //新增评论
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    } else {
      if (this.data.commentVal) {
        let _value = utils.utf16toEntities(this.data.commentVal),
          that = this, _values = "", url = "", _Url = "", _parms = {};
        this.setData({
          commentVal: _value,
          isComment: false
        });
        _parms = {
          refId: this.data.refId,
          cmtType: "2",
          content: this.data.commentVal,
          // userId: app.globalData.userInfo.userId,
          // userName: app.globalData.userInfo.userName,
          // nickName: app.globalData.userInfo.nickName,
        };

        for (var key in _parms) {
          _values += key + "=" + _parms[key] + "&";
        }
        _values = _values.substring(0, _values.length - 1);
        url = that.data._build_url + 'cmt/add?' + _values;
        _Url = encodeURI(url);
        wx.request({
          url: _Url,
          header: {
            "Authorization": app.globalData.token
          },
          method: 'POST',
          success: function (res) {
            if (res.data.code == 0) {
              that.setData({
                commentVal: '',
              })
              that.getcmtlist();
            } else {
              wx.showToast({
                title: '系统繁忙,请稍后再试',
                icon: 'none'
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: '请输入评论内容',
          icon: 'none',
          duration: 2000
        })
        this.setData({
          isComment: false
        })
      }
    }
  },
  getcmtlist: function (id) { //获取评论数据
    let _parms={},that=this;
    _parms = {
      // zanUserId: app.globalData.userInfo.userId,
      token: app.globalData.token,
      cmtType: '2',
      refId: this.data.refId,
      token: app.globalData.token
    };
    Api.cmtlist(_parms).then((res) => {
      let _data = res.data.data;
      _data.total = utils.million(_data.total)
      if (_data.list) {
        let reg = /^1[34578][0-9]{9}$/;
        for (let i = 0; i < _data.list.length; i++) {
          _data.list[i].content = utils.uncodeUtf16(_data.list[i].content);
          _data.list[i].zan = utils.million(_data.list[i].zan);
          if (reg.test(_data.list[i].nickName)) {
            _data.list[i].nickName = _data.list[i].nickName.substr(0, 3) + "****" + _data.list[i].nickName.substr(7);
          }
          if (reg.test(_data.list[i].userName)) {
            _data.list[i].userName = _data.list[i].userName.substr(0, 3) + "****" + _data.list[i].userName.substr(7);
          }
        }
        that.setData({
          comment_list: _data.list,
          totalComment: _data.list.length,
          assNum: _data.list.length,
        })
      }
    })
  },
  toLike: function (e) { //评论点赞
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    } else {
      if (requestTask) {
        return false
      }
      let id = e.currentTarget.id,
        ind = '', _parms = {}, _values = "", that = this;
      for (let i = 0; i < this.data.comment_list.length; i++) {
        if (this.data.comment_list[i].id == id) {
          ind = i;
        }
      }
      _parms = {
        refId: id,
        type: 4
      };

      for (var key in _parms) {
        _values += key + "=" + _parms[key] + "&";
      }
      _values = _values.substring(0, _values.length - 1);
      requestTask = true; 
      wx.request({
        url: that.data._build_url + 'zan/add?' + _values,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function (res) {
          requestTask = false;
          if (res.data.code == 0) {
            wx.showToast({
              icon: 'none',
              title: '点赞成功',
              duration: 1000
            })
            let comment_list = that.data.comment_list;
            comment_list[ind].isZan = 1;
            comment_list[ind].zan++;
            that.setData({
              comment_list: comment_list
            });
          }
        },fail(){
          requestTask = false;
        }
      })
    }
  },
  cancelLike(e) { //取消点赞
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
    } else {
      let id = e.currentTarget.id,
        ind = '', _parms = {}, _values = "", that = this;
      for (let i = 0; i < this.data.comment_list.length; i++) {
        if (this.data.comment_list[i].id == id) {
          ind = i;
        }
      }
      _parms = {
        refId: id,
        type: 4
        // userId: app.globalData.userInfo.userId,
        // token: app.globalData.token
      }

      for (var key in _parms) {
        _values += key + "=" + _parms[key] + "&";
      }
      _values = _values.substring(0, _values.length - 1);
      wx.request({
        url: that.data._build_url + 'zan/delete?' + _values,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function (res) {
          if (res.data.code == 0) {
            wx.showToast({
              duration: 1000,
              icon: 'none',
              title: '点赞取消'
            })
            let comment_list = that.data.comment_list;
            comment_list[ind].isZan = 0;
            comment_list[ind].zan--;
            if (comment_list[ind].zan <= 0) {
              comment_list[ind].zan = 0;
            }
            that.setData({
              comment_list: comment_list
            });
          }
        }
      })
    }
  }

})
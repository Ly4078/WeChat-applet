// pages/index/notification/message/message.js

import Api from '/../../../../utils/config/api.js';

import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var app = getApp();
var startTime='',endTime='';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    ismodel:false,
    loading:false,
    messageTextId:'',
    page:1,
    msgtype: 2, //系统通知 3  活动通知 2
    data:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.sort == 0){
      wx.setNavigationBarTitle({
        title: '系统通知',
      })
      this.setData({
        msgtype:3
      })
    }else if(options.sort == 1){
      wx.setNavigationBarTitle({
        title: '活动通知',
      })
      this.setData({
        msgtype:2
      })
    }
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    if (this.data.msgtype == 3) {
      this.readAllNotic();
    } else {
      this.getListData();
    }
  },
  bindTouchStart: function (e) {
    this.startTime = e.timeStamp;
  },
  bindTouchEnd: function (e) {
    this.endTime = e.timeStamp;
  },
  // 点击某个消息
  bindTap: function (e) {
    if (this.endTime - this.startTime < 350) {
      let that = this;
      const ind = e.currentTarget.id;
      if(this.data.msgtype == 2){
        let _Data = this.data.data;
        for(let i=0;i<_Data.length;i++){
          if (ind == _Data[i].messageText.id) {
            if (!_Data.status){
              that.readAct(ind);
            }

            if (_Data[i].messageText.actId){
              wx.navigateTo({
                url: _Data[i].messageText.url
              })
            }
            break;
          }
        }
      }
    }
  },
  //  长按某个消息
  bingLongTap:function(e){
    const ind = e.currentTarget.id;
    this.setData({
      ismodel: true,
      messageTextId: ind
    })
  },
  //关闭弹窗
  closemodel:function(){
    this.setData({
      ismodel:false
    })
  },
  //点击 删除 ，
  delItem:function(){
    let that = this;
    wx.request({
      url: this.data._build_url + 'msg/delete?type=' + this.data.msgtype + '&messageTextId=' + this.data.messageTextId +'&receiverId='+app.globalData.userInfo.userId,
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _Data= that.data.data;
          wx.showToast({
            title: '删除成功',
            icon:'none'
          })
          for (let i = 0; i < _Data.length;i++){
            if (that.data.messageTextId == _Data[i].messageText.id){
              _Data.splice(i, 1);
              that.setData({
                data:_Data
              });
              break;
            }
          }
        }
      }
    })
  },


  // 获取列表数据
  getListData:function(){
    let that = this;
    this.setData({
      loading:true
    })
    wx.request({
      url: this.data._build_url + 'msg/listAct?rows=10&type='+this.data.msgtype+'&page='+this.data.page,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.stopPullDownRefresh();
        if(res.data.code == 0){
          if(res.data.data.list && res.data.data.list.length>0){
            let _soData = res.data.data.list,
            _oldData=that.data.data
            if(that.data.page == 1){
              _oldData=[];
              that.setData({
                data:[]
              })
            }
            for(let i in _soData){
              _oldData.push(_soData[i])
            }
            that.setData({
              loading:false,
              data: _oldData
            })
          } else {
            that.setData({
              loading: false
            })
          }
        }else{
          that.setData({
            loading: false
          })
        }
      }
    })
  },
  //标记所有系统通知消息为已读
  readAllNotic:function(){
    let that = this;
    wx.request({
      url: this.data._build_url + 'msg/readAllNotic',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getListData();
        }
      }
    })
  },
  //标记某条活动通知消息为已读
  readAct:function(val){
    let that = this;
    wx.request({
      url: this.data._build_url + 'msg/readAct?messageTextId='+val,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _Data = that.data.data;
          for (let i = 0; i < _Data.length; i++) {
            if (val == _Data[i].messageText.id) {
              _Data[i].status=1;
              that.setData({
                data:_Data
              })
              break;
            }
          }
        }
      }
    })
  },
   //用户上拉触底加载更多
  onReachBottom: function () {
    this.setData({
      page:this.data.page+1
    });
    this.getListData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1
    });
    this.getListData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
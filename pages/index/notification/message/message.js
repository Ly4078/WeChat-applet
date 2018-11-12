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
    messageTextId:'',
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
    console.log('data:',this.data.data)
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
      console.log("handItem__ind:", ind)
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
            }else{
              console.log("no actId")
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
    console.log("bindTouchStart__ind:", ind)
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
    console.log('messageTextId:', this.data.messageTextId)
    let that = this;
    wx.request({
      url: this.data._build_url + 'msg/delete?type=' + this.data.msgtype + '&messageTextId=' + this.data.messageTextId +'&receiverId='+app.globalData.userInfo.userId,
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        console.log("res:", res)
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },



  // 获取列表数据
  getListData:function(){
    let that = this;
    wx.request({
      url: this.data._build_url + 'msg/listAct?type='+this.data.msgtype,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        console.log("res:",res)
        if(res.data.code == 0){
          if(res.data.data.list && res.data.data.list.length>0){
            that.setData({
              data:res.data.data.list
            })
          }
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
        console.log("res:", res)
        if (res.data.code == 0) {
          console.log('全部已读')
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
        console.log("res:", res)
        if (res.data.code == 0) {
          console.log('此消息已为已读')
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
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
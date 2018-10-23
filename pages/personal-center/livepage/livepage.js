import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js'
var utils = require('../../../utils/util.js')
var app = getApp();
var requesting = false;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    likeType: 1,
    myList: [],
    flag: true,
    pageTotal:1,
    id:''
  },
  onLoad: function(options) {
    this.setData({
      likeType: options.likeType,
      voteUserId: options.userId,
      id: options.id ? options.id:'',
      isMine: options.userId == app.globalData.userInfo.userId ? true : false
    });
    if(options.id){
      if (options.id == 1) {
        wx.setNavigationBarTitle({
          title: '关注列表'
        })
      } else if (options.id == 2) {
        wx.setNavigationBarTitle({
          title: '粉丝列表'
        })
      }
    }
  },
  onShow: function() {
    this.setData({
      page: 1,
      myList: [],
      flag: true
    },()=>{
      this.list();
    });
    
  },
  list() {
    // 注: 入参为userId(想要查看哪个用户的userId)和type(关注类型)----此是一个用户关注了哪些人
    // 注:入参为type和refId--------------此是看一个用户被哪些人关注
    let _parms = {}, likeType = this.data.likeType, that = this, reg = /^1[34578][0-9]{9}$/;
    _parms = {
        type: 1,
        page:this.data.page?this.data.page:1,
        rows: 10,
        token: app.globalData.token
      };
    if (likeType == 1) { //关注列表
      _parms.userId = this.data.voteUserId;
    } else if (likeType == 2) { //粉丝列表
      _parms.refId = this.data.voteUserId;
    }
    requesting = true;
    Api.likeList(_parms).then((res) => {
      let data = res.data.data;
      if (res.data.code == 0) {
        if (data.list != [] && data.list != null && data.list != '' && data.list != undefined) {
          let myList = this.data.myList;
          for (let i = 0; i < data.list.length; i++) {
            data.list[i].isCollected = 1;
            if (data.list[i].userName && reg.test(data.list[i].userName)) {
              data.list[i].userName = data.list[i].userName.substr(0, 3) + "****" + data.list[i].userName.substr(7);
            }
            myList.push(data.list[i]);
          }
          this.setData({
            myList: myList,
            pageTotal: Math.ceil(res.data.data.total / 10),
            loading: false
          });
          requesting = false;
        } else {
          this.setData({
            flag: false,
            loading: false
          });
          requesting = false;
        }
      } else {
        this.setData({
          flag: false,
          loading: false
        });
        requesting = false;
      }
    },()=>{
      this.setData({
        loading: false
      })
      requesting = false;
    })
  },
  addLike(e) { //添加关注
    if (!this.data.isMine) {
      return false;
    }
    let id = e.currentTarget.id,that = this;
    wx.request({
      url: that.data._build_url + 'userConcern/add?userId=' + that.data.voteUserId + '&refId=' + id + '&type=1',
      method: "POST",
      data: {},
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let myList = that.data.myList;
          for (let i = 0; i < myList.length; i++) {
            if (myList[i].refId == id) {
              myList[i].isCollected = 1;
              that.setData({
                myList: myList
              });
              wx.showToast({
                icon: 'none',
                title: '已关注',
              })
              return false;
            }
          }
        }
      }
    });
  },
  delLike(e) { //取消关注
    if (!this.data.isMine) {
      return false;
    }
    let id = e.currentTarget.id,
      that = this;
    wx.showModal({
      title: '确定取消关注?',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: that.data._build_url + 'userConcern/delete?userId=' + that.data.voteUserId + '&refId=' +id + '&type=1',
            method: "POST",
            data: {},
            header: {
              "Authorization": app.globalData.token
            },
            success: function (res) {
              if (res.data.code == 0) {
                let myList = that.data.myList;
                for (let i = 0; i < myList.length; i++) {
                  if (myList[i].refId == id) {
                    myList[i].isCollected = 0;
                    that.setData({
                      myList: myList
                    });
                    wx.showToast({
                      icon: 'none',
                      title: '取消关注'
                    })
                    return false;
                  }
                }
              }
            }
          })
        }
      }
    })
  },
  toHomePage(e) { //跳转至个人主页
    let id = 0;
    if(this.data.likeType == 1) {
      id = e.currentTarget.dataset.idx;
    } else if (this.data.likeType == 2) {
      id = e.currentTarget.id;
    }
    wx.navigateTo({
      url: '../../activityDetails/homePage/homePage?userId=' + id
    })
  },
  onPullDownRefresh: function() { //下拉刷新
    if (requesting){
      return
    }
    this.setData({
      page: 1,
      myList: [],
      flag: true
    },()=>{
      this.list();
    });
   
  },
  onReachBottom: function() { //上拉加载
    if (requesting) {
      return
    }
    if (this.data.pageTotal <= (this.data.page || 1)){
      return
    }
    this.setData({
      page: this.data.page + 1,
      loading: true
    },()=>{
      this.list();
    });
  },
  onShareAppMessage: function() {
    this.list();
  }
})
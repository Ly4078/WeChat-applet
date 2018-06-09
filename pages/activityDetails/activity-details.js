import Api from '/../../utils/config/api.js';
var utils = require('/../../utils/util.js');
var app = getApp();
Page({
  data: {
    actdata: [],
    page: 1,
    actid: '',  //活动ID
    flag: true,
    istouqu: false,
    placeholderFlag: true
  },

  onLoad: function (options) {
    
  },
  onShow: function () {
    let that = this;
    this.setData({
      actdata: [],
      page: 1,
      flag: true
    })
    this.getcatdata();
    if (!app.globalData.userInfo.unionId){
      wx.login({
        success: res => {
          if (res.code) {
            let _parms = {
              code: res.code
            }
            Api.getOpenId(_parms).then((res) => {
              app.globalData.userInfo.openId = res.data.data.openId;
              app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
              if (res.data.data.unionId) {
                app.globalData.userInfo.unionId = res.data.data.unionId;
                that.setData({
                  istouqu: false
                })
              } else {
                that.setData({
                  istouqu: true
                })
              }
            })
          }
        }
      })
    }else{
      that.setData({
        istouqu: false
      })
    }
  },
  againgetinfo: function () {
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
          }
        })
      }
    })
  },
  getcatdata: function () {  //获取列表数据
    let that = this;
    let _parms = {
      page: this.data.page,
      row: 8
    }
    wx.showLoading({
      title: '更多数据加载中。。。',
      mask: true
    })
    Api.actlist(_parms).then((res) => {
      let data = res.data;
      wx.hideLoading()
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {

        let actList = [];
        actList = that.data.actdata;
        for (let i = 0; i < data.data.list.length; i++) {
          data.data.list[i].viewNum = utils.million(data.data.list[i].viewNum)
          actList.push(data.data.list[i]);
          actList[i].endTime = actList[i].endTime.substring(0, actList[i].endTime.indexOf(' '));
        }
        that.setData({
          actdata: actList
        })
      } else {
        that.setData({
          flag: false
        });
      }
      this.placeholderFlag = this.data.actdata.length < 1 ? false : true;
      if (that.data.page == 1) {
        wx.stopPullDownRefresh()
      } else {
        wx.hideLoading();
      }
    })
  },
  clickVote: function (event) {
    const actid = event.currentTarget.id;
    let _actName = "";
    for (let i = 0; i < this.data.actdata.length; i++) {
      if (this.data.actdata[i].id == actid) {
        _actName = this.data.actdata[i].actName;
      }
    }
    if (actid == 34 || actid == 35 || actid == 36) {
      wx.navigateTo({
        url: './hot-activity/hot-activity?id=' + actid + '&_actName=' + _actName,
      })
    } else {
      wx.navigateTo({
        url: 'details-like/details-like?actid=' + actid,
      })
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
      this.getcatdata();
    }
  },
  onPullDownRefresh: function () {    //用户下拉刷新
    this.setData({
      actdata: [],
      page: 1,
      flag: true
    });
    this.getcatdata();
  }
})
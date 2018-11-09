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

  onShow: function (options) {
    
  },
  onLoad: function () {
    wx.showLoading({
      title: '加载中...'
    })
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
                that.setData({
                  istouqu: false
                })
                let _data = JSON.parse(resv.data.data);
                app.globalData.userInfo.unionId = _data.unionId;
              }
            }
          })
      }
    })
  },
  getcatdata: function () {  //获取列表数据
    let that = this;
    let _parms = {
      page: this.data.page,
      token: app.globalData.token,
      row: 8
    }
    Api.actlist(_parms).then((res) => {
      let data = res.data;
      if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
        let actList = [];
        actList = that.data.actdata;
        for (let i = 0; i < data.data.list.length; i++) {
          data.data.list[i].viewNum = utils.million(data.data.list[i].viewNum)
          actList.push(data.data.list[i]);
          actList[i].endTime = actList[i].endTime.substring(0, actList[i].endTime.indexOf(' '));
        }
        // console.log("actList:", actList)
        that.setData({
          actdata: actList,
          pageTotal: Math.ceil(res.data.data.total /8),
          loading: false
        })
        wx.hideLoading()
      } else {
        that.setData({
          flag: false,
          loading: false
        });
      }
      this.placeholderFlag = this.data.actdata.length < 1 ? false : true;
      if (that.data.page == 1) {
        wx.stopPullDownRefresh()
      } else {
        wx.hideLoading();
        that.setData({
          loading: false
        });
      }
    },()=>{
      wx.hideLoading();
      that.setData({
        flag: false,
        loading: false
      });
    })
  },
  clickVote: function (event) {
    const actid = event.currentTarget.id;
    console.log('actid:', actid);
    let _actName = "",_type = '';
    for (let i = 0; i < this.data.actdata.length; i++) {
      if (this.data.actdata[i].id == actid) {
        _actName = this.data.actdata[i].actName;
        _type = this.data.actdata[i].type;
      }
    }
    if(actid == 41){
      wx.navigateTo({
        url: '/pages/index/productCategory/productCategory',
      })
    } else if (actid == 42){
      wx.navigateTo({
        url: 'holdingActivity/holdingActivity'
      })
    } else if (actid == 38){
      wx.navigateTo({
        url: 'video-list/video-list?id=' + actid,
      })
    } 
  },
  onReachBottom: function () {  //用户上拉触底

    if (this.data.flag) {
      if (this.data.page >= this.data.pageTotal){
        return
      }else{
        this.setData({
          page: this.data.page + 1,
          loading: true
        }, () => {
          this.getcatdata();
        });
      }
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
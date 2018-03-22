import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
import Api from '../../utils/config/api.js'
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    iconUrl: app.globalData.userInfo.iconUrl,
    userName: app.globalData.userInfo.userName,
    isname:false,
    qrCode: ''
  },
  onLoad: function (options) {
    this.setData({
      userName: app.globalData.userInfo.userName
    })
  },
  onShow: function () {
    let that = this;
    this.getuserInfo()
    wx.request({
      url: that.data._build_url + 'topic/myList',
      method: 'GET',
      data: {
        userId: app.globalData.userInfo.userId,
        page: '1',
        rows: 1,
      },
      success: function (res) {
        var data = res.data;
        that.setData({
          sumTotal: res.data.data.total
        })
      }
    })
    wx.request({
      url: that.data._build_url + 'fvs/list?userId=' + app.globalData.userInfo.userId + '&page=' + that.data.page + '&rows=10',
      method: 'GET',
      data: {
        userId: app.globalData.userInfo.userId,
        page: '1',
        rows: 1,
      },
      success: function (res) {
        var data = res.data;
        var aaa = res.data.data.total
        that.setData({
          collectTotal: res.data.data.total
        })
      }
    })
  },
  updatauser:function(data){ //更新用户信息
    let that = this
    let _parms = {
      userId:app.globalData.userId
    }
    if (data.avatarUrl){
      _parms.iconUrl = data.avatarUrl
    }
    if (data.nickName){
      _parms.userName = data.nickName
    }
    if (data.gender){
      _parms.gender = data.gender
    }
    Api.updateuser(_parms).then((res)=>{
      console.log("res",res)
      if(res.data.code == 0){
        console.log("res.data")
      }
    })
  },
  changeimg:function(){  //更换头像图片
    let that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: that.data._build_url + 'img/upload',
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'userName': 'test'
          },
          success: function (res) {
            let _data = JSON.parse(res.data)
            that.setData({
              iconUrl: _data.data.smallPicUrl
            })
          },
          fail: function (res) {
            console.log("fail:", res)
          }
        })
      }
    })
  },
  changename:function(){  //用户更换名称
    this.setData({
      isname:true
    })
  },
  nameok:function(e){
    this.setData({
      userName: e.detail.value
    })
  },
  overname:function(){
    this.setData({
      isname: false
    })
  },
  getuserInfo: function () {  //获取用户信息
    let that = this;
    wx.getUserInfo({
      success: res => {
        if (res.userInfo) {
          console.log("res:",res)
            this.setData({
              iconUrl: res.userInfo.avatarUrl,
              userName: res.userInfo.nickName,
            })
            this.updatauser(res.userInfo)
        }
      },
      fail: res => {
        this.wxgetsetting();
      }
    })
  },
  wxgetsetting: function () {  //若用户之前没用授权其用户信息，则调整此函数请求用户授权
    let that = this
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          // console.log("用户已授受获取其用户信息")
        } else {
          // console.log("用户未授受获取其用户信息")
          wx.showModal({
            title: '提示',
            content: '享7要你的用户信息，快去授权！',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({  //打开授权设置界面
                  success: (res) => {
                    if (res.authSetting['scope.userInfo']) {
                      that.getuserInfo()
                    }
                  }
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }
    })
  },
  calling: function () {
    wx.makePhoneCall({
      phoneNumber: '02787175526', //此号码并非真实电话号码，仅用于测试  
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  enterEntrance: function (event) {
    wx.navigateTo({
      url: 'free-of-charge/free-of-charge',
    })
  },
  DynamicState: function (e) {
    wx.navigateTo({
      url: 'allDynamicState/allDynamicState',
    })
  },
  myTickets: function (event) {
    wx.navigateTo({
      url: 'my-discount/my-discount',
    })
  },
  carefulness: function (event) {
    wx.navigateTo({
      url: 'personnel-order/personnel-order',
    })
  },
  enshrineClick: function (event) {
    wx.navigateTo({
      url: 'enshrine/enshrine',
    })
  },
  scanAqrCode: function (e) {
    let that = this;
    wx.scanCode({
      onlyFromCamera: true,
      scanType: "qrCode",
      success: (res) => {
        let qrCodeArr = res.result.split('/');
        let qrCode = qrCodeArr[qrCodeArr.length - 1];
        that.setData({
          qrCode: qrCode
        });
        that.getCodeState();
      },
      fail: (res) => {

      }
    });
  },
  //判断二维码是否可以跳转
  getCodeState: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + '/cp/getByCode/' + that.data.qrCode,
      success: function (res) {
        var data = res.data;
        let current = res.currentTime;
        if (data.code == 0) {
          let isDue = that.isDueFunc(current, data.expiryDate);
          if (data.data.isUsed == 1) {
            wx.showToast({
              title: '您的票券已被使用',
              icon: 'none'
            })
            return false;
          } else if (isDue == 1) {
            wx.showToast({
              title: '您的票券已过期',
              icon: 'none'
            })
            return false;
          } else {
            wx.navigateTo({
              url: 'cancel-after-verification/cancel-after-verification?qrCode=' + that.data.qrCode + '&userId=' + app.globalData.userInfo.userId,
            })
          }
        } else {
          wx.showToast({
            title: '请扫描有效票券',
            icon: 'none'
          })
        }
      }
    })
  },
  isDueFunc: function (current, expiryDate) {     //对比时间是否过期
    let isDue = 0;
    if (new Date(expiryDate + " 23:59:59").getTime() < current) {
      isDue = 1;
    }
    return isDue;
  }
})
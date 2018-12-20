import Countdown from '../../../../utils/Countdown.js';
var WxParse = require('../../../../utils/wxParse/wxParse.js');
import canvasShareImg from '../../../../utils/canvasShareImg.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    singleData:{},
    newcomer:false,
    showSkeleton:true,
    isShare:false,
    groupIsend:false,
    timer:null,
    _content:null,
    shadowFlag:true
  },
  onLoad: function(options) {
    let that = this;
    if (options.shareType =='2'){
      that.setData({
        shareGroup:true
      })
    }
    if (options.types == 'share'){
      that.setData({
        isShare:true,
        parentId: options.parentId
      })
      app.globalData.currentScene.query = {
        id: options.id,
        actid: options.actid,
        types:'share',
        groupid: options.groupid,
        parentId: options.parentId
      }
      app.globalData.currentScene.path =        "/packageA/pages/tourismAndHotel/touristHotelDils/touristHotelDils" 
    }
    that.setData({
      id: options.id,
      actid: options.actid,
      groupid: options.groupid,
      parentId:options.parentId || ''
    })
  
    
  },
  onShow:function(){
    let that = this;
    if (app.globalData.newcomer == '1') {
      console.log('新人注册返回详情页')
      that.setData({
        newcomer: true
      })
    }
    if (!app.globalData.token) {
      that.findByCode()
    } else {
      that.addrecord()
      that.fromshare();
    }
  },
  addrecord: function (){
    let that =  this;
    let baseUlr  = '';
    if(that.data.parentId){
      baseUlr = 'actOrder/add?actGoodsSkuId=' + that.data.groupid + '&parentId=' + that.data.parentId
    }else{
      baseUlr = 'actOrder/add?actGoodsSkuId=' + that.data.groupid
    }
    if (!that.data.singleData.goodsPromotionRules){
      that.setData({
        showSkeleton:true
      })
    }
    wx.request({
      url: that.data._build_url + baseUlr,
      method:'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
        if(res.data.code=='0'){
          that.setData({
            groupStatus:res.data.data
          })
          that.getData();
        }else{
          that.setData({ showSkeleton: false})
        }
      },fail() {
        that.addrecord();
      }
    })
  },
  getData: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'goodsSku/selectDetailBySkuIdNew?id=' + that.data.id + '&actId=' + that.data.actid,
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == '0' && res.data.data) {
          let _data = res.data.data
          for (let i = 0; i < _data.goodsPromotionRules.length; i++) {
            if (_data.goodsPromotionRules[i].ruleType == '7') {
              _data.goodsPromotionRules[0] = _data.goodsPromotionRules[i]
            }
          }
          that.endTimerun(_data.actGoodsSkuOut.dueTime)
          
          canvasShareImg(_data.skuPic, _data.goodsPromotionRules[0].actAmount, _data.sellPrice).then(function (res) {
            that.setData({
              shareImg: res
            })
          })
          if (that.data._content ==null){
            that.setData({
              _content: _data.goodsSpuOut.goodsSpuDesc.content
            },()=>{
              WxParse.wxParse('article', 'html', that.data._content, that, 10);
            })
          }
          that.setData({
            singleData: _data,
            showSkeleton: false
          })
          if (_data.actGoodsSkuOut.state == '1' && that.data.groupStatus.state !='4'){

          }else{
            that.setData({
              groupIsend:true
            })
            wx.showModal({
              title: '提示',
              content: '该团已结束',
              showCancel:false,
              success(res) {
                if (res.confirm) {
                  wx.switchTab({
                    url: "/pages/index/index",
                  })
                } else if (res.cancel) {
                }
              }
            })
          }
          wx.hideLoading()
        }else{
          that.setData({
            groupIsend: true
          })
          wx.showModal({
            title: '提示',
            content: '该团已结束',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: "/pages/index/index",
                })
              } else if (res.cancel) {
              }
            }
          })
          that.setData({ showSkeleton: false })
          wx.hideLoading()
        }
      },fail:function(){
        that.setData({ showSkeleton: false })
        wx.hideLoading()
      }



    })

  },
  findByCode: function () { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            if (data.id) {
              app.globalData.userInfo.userId = data.id;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              }
              that.authlogin(); //获取token
            } else {
              if (!data.mobile) { //是新用户，去注册页面
                wx.navigateTo({
                  url: '/pages/init/init?isback=1'
                })
              } else {
                that.authlogin();
              }
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          let userInfo = wx.getStorageSync('userInfo') || {};
          userInfo.token = _token
          wx.setStorageSync("token", _token)
          wx.setStorageSync("userInfo", userInfo)
          that.addrecord()
          that.fromshare();
          if (app.globalData.userInfo.mobile) {
          } else {
            wx.navigateTo({
              url: '/pages/init/init?isback=1',
            })
          }
        }
      }
    })
  },
  configShare:function(){//配置分享，，，
    let that = this,baseurl='';
    if (that.data.newcomer){
      baseurl = 'pullUser/insertUserPull?type=5&groupId=' + that.data.groupid+'&parentId='+that.data.parentId
    }else{
      baseurl = 'pullUser/insertUserPull?type=5&groupId=' + that.data.groupid
    }
    wx.request({
      url: encodeURI(that.data._build_url + baseurl) ,
      method: "POST",
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
       }
      
      })
  },
  addPeople:function(){//新用户，为分享者添加一条参团记录
    let that = this;
    let parentId = that.data.parentId;
    let url = encodeURI(that.data._build_url + 'pullUser/updateNumsUp?type=5&groupId=' + that.data.groupid + '&UserId=' + parentId);
    wx.request({
      url: url,
      method: "POST",
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
      }

    })
  },
  fromshare:function(){//来自分享进入时。
    let that = this;
    if (that.data.isShare && that.data.newcomer && that.data.shareGroup){
        setTimeout( ()=>{
          that.addPeople();
          app.globalData.newcomer = 0
          that.setData({
            isShare: false,
            newcomer: false,
            shareGroup:false
          })
        },500)
    }
    if (that.data.isShare) {
      that.configShare();
      that.setData({
        isShare: false
      })
    }
    
  },
  endTimerun: function(endTime){
    let that = this;
    that.countdownStart(endTime);
    if (that.data.timer == null){
      that.data.timer = setInterval(() => {
        if (that.data.Countdowns.isEnd) {
          that.addrecord();
          clearInterval(that.data.timer)
        }
        that.countdownStart(endTime);
      }, 1000)
    }
   

  },
  onHide:function(){
    try{
      clearInterval(that.data.timer);
      that.setData({
        timer: null
      })
    }catch(err){}
  },
  onUnload:function(){
    try {
      clearInterval(that.data.timer);
      that.setData({
        timer: null
      })
    } catch (err) { }
  },
  countdownStart: function(endTime) {
    let that = this;
    let times = Countdown(endTime)
    that.setData({
      Countdowns: times
    })
  },

  // 左下角返回首页
  returnHomeArrive: function() {
    wx.switchTab({
      url: '/pages/index/index',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  sponsorVgts: function(payType) {//点击付款按钮
    let that = this, _parms = {};
    if (that.data.groupIsend) {
      wx.showToast({
        title: '该团已结束',
        icon: 'none'
      })
      return false
    }
    if (payType !='sellPrice'){
      if (that.data.Countdowns.isEnd) {
        wx.showToast({
          title: '该团已结束',
          icon: 'none'

        })
        return false
      }
    }

    _parms = {
      shopId: that.data.singleData.shopId,
      payType: 2,
      flagType: 7,
      singleType: that.data.singleData.singleType,
      orderItemList: [{
        goodsSkuId: that.data.singleData.id,
        goodsSpuId: that.data.singleData.spuId,
        goodsNum: 1,
        shopId: that.data.singleData.shopId,
        orderItemShopId: '0',
      }]
    };
    if (payType == 'sellPrice'){
      _parms.flagType = 1
    }else{
      _parms.actId =  that.data.actid
    }
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    wx.request({
      url: that.data._build_url + 'orderInfo/createNew',
      data: JSON.stringify(_parms),
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success:function(res){
        if(res.data.code=='0' && res.data.data){
          that.setData({
            orderId: res.data.data
          },()=>{
            that.wxpayment(payType);
          })
          
        }else{
          wx.hideLoading();
          wx.showToast({
            title:'库存不足，请稍后再试',
            icon: 'none'
          })
          that.addrecord();
        }
       
      },fail(){
        wx.hideLoading();
        wx.showToast({
          title: '支付失败',
          icon:'none'
        })
        that.addrecord();
      }
    })
  },
  //调起微信支付
  wxpayment: function (payType) {
    let _parms = {},
      that = this,
      url = "",
      _Url = "",
      _value = "";
    _parms = {
      orderId: that.data.orderId,
      openId: app.globalData.userInfo.openId,
    };
    if (payType =='sellPrice'){
      _parms.type = 1
    }else{
      _parms.actId = that.data.actid
      _parms.type = 7
    }
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }


    _value = _value.substring(0, _value.length - 1);
    url = that.data._build_url + 'wxpay/shoppingMallForCouponNew?' + _value
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
          if(res.data.code=='0' && res.data.data){
              that.pay(res.data.data)
          } else {
            wx.hideLoading();
            wx.showToast({
              title: res.data.message || '支付失败',
              icon: 'none'
            })
            that.addrecord();
          }
      }, fail() {
        wx.hideLoading();
        wx.showToast({
          title: '支付失败',
          icon: 'none'
        })
        that.addrecord();
      }
    })
  },
  pay:function (_data){
    let that = this;
    wx.hideLoading();
    wx.requestPayment({
      'timeStamp': _data.timeStamp,
      'nonceStr': _data.nonceStr,
      'package': _data.package,
      'signType': 'MD5',
      'paySign': _data.paySign,
      success:function(res){
        wx.navigateTo({
          url: '/pages/personal-center/personnel-order/logisticsDetails/logisticsDetails?soId=' + that.data.orderId,
        })
      },fail:function(res){
          wx.showToast({
            title: '支付取消',
            icon:"none",
            duration:1500
          })
        that.addrecord();
      }, complete:function(res){

      }
    })
  },
  toOrderdetail:function(e){//当前已参团时，前往详情查看
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/personal-center/personnel-order/logisticsDetails/logisticsDetails?soId=' + id,
    })
  },
  originalprice:function(){//原价购买
      let that = this;
    if (!that.data.singleData){
      return false
    }
    app.globalData.singleData = that.data.singleData
    wx.navigateTo({
      url: './order-for-goods/order-for-goods',
    })

      // that.sponsorVgts('sellPrice')

  },
  onShareAppMessage:function(){
    let that = this;
    let title = app.globalData.userInfo.nickName + '👉超值推荐  仅需' + that.data.singleData.goodsPromotionRules[0].actAmount + '元，即可拼购👉' + that.data.singleData.skuName
    return {
      title: title || '享7拼购',
      imageUrl: that.data.shareImg,
      path: '/packageA/pages/tourismAndHotel/touristHotelDils/touristHotelDils?types=share&id=' + that.data.id + '&actid=' + that.data.actid + '&groupid=' + that.data.groupid + '&parentId=' + app.globalData.userInfo.userId
    }
  },
  onHide:function(){
    wx.hideLoading();
  },
  // 遮罩层显示
  showShade: function () {
    this.setData({
      shadowFlag: false
    })
  },
  touchmove:function(){
    
  },
  // 遮罩层隐藏
  conceal: function () {
    this.setData({
      shadowFlag: true
    })
  },

}) 

var app = getApp();
import Api from '../../../../../utils/config/api.js';
import utils from '../../../../../utils/util.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
var rules= [];
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    current:{},
    username:'',
    phone:'',
    address:'',
    issku:'',
    num:'',
    sellPrice:'',
    skuName:'',
    spuName:'',
    skuPic:'',
    total:0,
    isagree:false,
    bzf:0,
    chatName : '',
    addressId:'',
    area : '',
    mobile:'',
    isbox:0,
    id:'',
    shopId:'',
    spuId:'',
    orderId:''
  },
  onLoad: function (options) {
    if (options.username) {
      this.setData({
        chatName: options.username,
        area: options.address,
        mobile: options.phone,
        addressId: options.addressId ? options.addressId : '',
      })
    }
    if (options.id) {
      app.globalData.OrderObj = options;
    }else{
      options = app.globalData.OrderObj;
    }
    this.setData({
      id: options.id,
      num: options.num,
      issku: options.issku,
      id: options.id,
      shopId: options.shopId,
      spuId: options.spuId
    })
  },
  onShow:function(){
    if (!this.data.chatName){
      this.getAddressList();
    }
    this.getDetailBySkuId();
  },
  //查询当前商品详情
  getDetailBySkuId: function (val) {
    let that = this, man = 0, _bzf = 0, _ceil = 0;
    Api.DetailBySkuId({ id: this.data.id }).then((res) => {
      if (res.data.code == 0) {
        let _obj = res.data.data, _bzf = 0, _total=0;
        if (_obj.unit) {
          rules = _obj.goodsPromotionRules;
          rules.sort(that.compareUp("ruleType"));
          for (let i = 0; i < rules.length;i++ ){
            if (rules[i].ruleType ==2){
              if (this.data.num > rules[i].manNum){
                man = Math.floor(this.data.num/rules[i].manNum);
              }
            }
            if (rules[i].ruleType == 3) {
              _ceil = Math.ceil(this.data.num/rules[i].manNum);
              _bzf += _ceil * rules[i].giftNum;
              _bzf += man * rules[i].giftNum;
              _obj.bzf = _bzf;
            }
          }
          _total = this.data.num * _obj.sellPrice + _obj.bzf;
          _obj.total = _total;
        }
        this.setData({
          current: _obj
        })
        console.log('current:', this.data.current)
      }
    })
  },
  // 升序排序
  compareUp:function(propertyName) {
    if ((typeof rules[0][propertyName]) != "number") { // 属性值为非数字
      return function (object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return value1.localeCompare(value2);
      }
    }
    else {
      return function (object1, object2) { // 属性值为数字
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return value1 - value2;
      }
    }
  },
  //查询已有收货地址
  getAddressList:function(){
    let that = this;
    let _parms={
      userId: app.globalData.userInfo.userId
    }
    Api.AddressList(_parms).then((res) => {
      if(res.data.code == 0){
        let _list=res.data.data.list,actList={};

        for(let i=0;i<_list.length;i++){
          _list[i].address = _list[i].dictProvince + _list[i].dictCity + _list[i].dictCounty + _list[i].detailAddress;
        }
     
        this.setData({
          chatName:  _list[0].chatName,
          area:  _list[0].address,
          mobile:  _list[0].mobile,
          addressId: _list[0].id
        })
      }
    })
  },
  // 选择收货地址
  additionSite:function(){
    wx.redirectTo({
      url: '../../../../personal-center/shipping/shipping',
    })
  },
  //是否同意预售协议
  checkboxChange:function(e){
    if (e.detail.value[0] ==1){
      this.setData({
        isagree:true
      })
    }else{
      this.setData({
        isagree: false
      })
    }
  },
  //点击包装费疑问
  handbzf:function(){
    wx.showModal({
      title: '',
      content: '每8斤包装费15元；不满8斤按照8斤收取15元包装费。',
      showCancel:false,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //点击提交订单
  submitSoid:function(){
    let that = this;
    if (this.data.isagree){
      if (!this.data.addressId){
        wx.showToast({
          title: '请选择或添加收货地址',
          icon:'none'
        })
        return
      }
      let _parms = {
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName,
        shopId: this.data.shopId ,
        payType: 2,
        orderAddressId: this.data.addressId,
        orderItemList: [
          {
            goodsSkuId: this.data.id,
            goodsSpuId: this.data.spuId,
            goodsNum: this.data.num,
            shopId: this.data.shopId,
            orderItemShopId: '0'
          }
        ]
      };
      wx.request({
        url: that.data._build_url + 'orderInfo/create',
        data: JSON.stringify(_parms),
        method:'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == 0) {
            if (res.data.data) {
              that.setData({
                orderId:res.data.data
              })
              console.log('订单生成成功，订单号；', res.data.data)
             that.updataUser();
            }
          }
        }
      })
    }else{
      wx.showToast({
        title: '亲,请勾线顺丰到付哟!',
        icon:'none'
      })
    }
  },
  //更新用户信息
  updataUser:function(){
    let that = this;
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code
          }
          Api.getOpenId(_parms).then((res) => {
            console.log('openres:',res)
            if(res.data.code == 0){
              app.globalData.userInfo.openId = res.data.data.openId;
              app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
              let _obj = {
                id: app.globalData.userInfo.userId,
                openId: app.globalData.userInfo.openId
              };
              Api.updateuser(_obj).then((res) => {
                if (res.data.code == 0) {
                  that.wxpayment()
                }
              })
            }
          })
        }
      }
    })
  },
  //调起微信支付
  wxpayment:function(){
    let  _parms = {
      orderId: this.data.orderId,
      openId: app.globalData.userInfo.openId
    },that = this;
    Api.shoppingMall(_parms).then((res)=>{
      if (res.data.code == 0) {
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
          success: function (res) {
            wx.redirectTo({
              url: '../../../../personal-center/personnel-order/logisticsDetails/logisticsDetails?soId=' + that.data.orderId,
            })
          },
          fail: function (res) {
            wx.showToast({
              icon: 'none',
              title: '支付取消',
              duration: 1200
            })
          }
        })
      }
    })
  }
})








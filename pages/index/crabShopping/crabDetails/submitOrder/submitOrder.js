
var app = getApp();
import Api from '../../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
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
    spuId:''
  },
  onLoad: function (options) {
    console.log('options:', options)

    if (options.username) {
      this.setData({
        chatName: options.username,
        area: options.address,
        mobile: options.phone,
      })
    } 
    let _bzf = 0;
   
    if(options.issku){
      app.globalData.OrderObj = options;
    }else{
      options = app.globalData.OrderObj;
    }
    if(options.num){
      if(options.isbox==1){ //按盒算
        _bzf = options.num*5;
      }else{  //按斤算
        _bzf = Math.floor(options.num / 8.5) * 15 + 15;
      }
     
    }
    let _total = options.sellPrice * 1 * options.num + _bzf;
    _total = _total.toFixed(2);
    if(options.issku == 1){
      this.setData({
        isagree:true
      })
    };
    
    this.setData({
      issku: options.issku,
      num: options.num,
      sellPrice: options.sellPrice,
      skuName: options.skuName,
      spuName: options.spuName,
      skuPic: options.skuPic,
      total: _total,
      bzf: _bzf,
      isbox: options.isbox,
      id:options.id,
      shopId: options.shopId,
      addressId: options.addressId,
      spuId: options.spuId
    })

  },
  onShow:function(){
    if (!this.data.chatName){
      this.getAddressList();
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
        let _list=res.data.data.list;

        for(let i=0;i<_list.length;i++){
          _list[i].address = _list[i].dictProvince + _list[i].dictCity + _list[i].dictCounty + _list[i].detailAddress;
        }
        // that.setData({
        //   address: _list
        // })
        console.log('list:',_list)
        this.setData({
          chatName: _list[0].chatName,
          area: _list[0].address,
          mobile: _list[0].mobile,
          addressId:_list[0].id
        })
      }
    })
  },
  // 选择收货地址
  additionSite:function(){
    wx.navigateTo({
      url: '../../../../personal-center/shipping/shipping',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
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
    let str ='';
    if (this.data.isbox == 1){
      str = '每盒收取5元包装费';
    }else{
      str = '每8斤包装费15元;不满8斤按照8斤收取15元包装费。';
    }
    wx.showModal({
      title: '',
      content: str ,
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
              console.log('订单生成成功，订单号；', res.data.data)
            }
          }
        }
      })
    }else{
      wx.showToast({
        title: '请先同意顺丰到付',
        icon:'none'
      })
    }
  }
})
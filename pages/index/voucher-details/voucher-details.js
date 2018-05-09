
import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
let app = getApp()
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    obj:{},
    orig:'',
    orderid:'',
    num:'',
    packdata:[],
    condeta:[],
    listagio: [],
    cfrom:''
  },
  onLoad: function (options) {
    if (options.cfrom){
      this.setData({
        cfrom: options.cfrom
      })
    }
    if (options.orderid){
      this.setData({
        orderid: options.orderid,
        num: options.num
      })
      this.getTicketInfo(options.orderid)
      this.getskudata(options.orderid)
    }else{
      options.inp = Number(options.inp)
      let _inp = options.inp.toFixed(2)
      this.setData({
        obj: options,
        sell: options.sell,
        orig: _inp
      })
      if (options.num && options.num != 'undefined' && options.num != '') {
        this.setData({
          sell: (options.sell * options.num).toFixed(2)
        })
      }
      if (options.sostatus && options.sostatus != 'undefined' && options.sostatus != '') {
        this.setData({
          sostatus: 1
        });
      }
    }
  },
  immediatelyBuy:function(){
    let data = this.data.obj, parameter = '';
    parameter = '?id=' + data.id + "&sell=" + data.sell + "&inp=" + data.inp + "&rule=" + data.rule + '&num=' + data.num + '&soid=' + data.soid;
    if (this.data.sostatus == 1) {
      parameter += '&sostatus=1'
    }
    wx.navigateTo({
      url: '../order-for-goods/order-for-goods' + parameter
    })
  },
  getskudata:function(val){
    let that = this;
    let _parms = {
      id: val,
      zanUserId: app.globalData.userInfo.userId,
      // shopId: options.shopid
      shopId: '101'
    }
    Api.getAgio(_parms).then((res) => {
      if (res.data.code == 0) {
        // console.log(" res.data.data:", res.data.data)
        that.setData({
          packdata: res.data.data
        })
      }
    })
  },
 
 
  getTicketInfo: function (val) {  //获取套餐券详情
    let that = this;
    wx.request({
      url: that.data._build_url + 'so/getForOrder/' + val,
      success: function (res) {
        if(res.data.code == 0){
          that.setData({
            condeta: res.data.data.coupons[0]
          })
        }
      }
    });
  },
  previewImage: function (e) {  //券的使用   全屏展现二维码
    let current = e.target.dataset.src;
    let arr =[];
    arr.push(current)
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: arr // 需要预览的图片http链接列表  
    })
  } ,
  useticket:function(e){  //券的领取
    let that = this;
    wx.request({
      url: that.data._build_url + 'sku/listForAgio',
      data: {},
      success: function (res) {
        let data = res.data;
        if (data.code == 0) {
          that.setData({
            listagio: data.data.list[0],
            num: data.data.list[0].sellNum
          });
          that.getforagio();
        }
      }
    })
  },
  getforagio:function(){
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.userName,
      payType: '1',
      skuId: this.data.listagio.id,
      skuNum: '1'
    }
    Api.freeOrderForAgio(_parms).then((res) => {
      if (res.data.code == 0) {
        that.setData({
          orderid: res.data.data
        })
        this.getTicketInfo(res.data.data)
        this.getskudata(res.data.data)
        wx.showToast({
          title: '领取成功！',
          mask: 'true',
          icon: 'none',
        }, 1500)
      } else {
        wx.showToast({
          title: '你已领取过，请使用后再领取',
          mask: 'true',
          icon: 'none',
        }, 1500)
      }
    })
  }
})
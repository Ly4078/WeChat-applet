import Api from '/../../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    shopId:'',
    obj:{},
    activity:[],
    ticketList:[],
    checkedArr: [],
    isChecked: false,
    isthird:false,
    msg:''
  },
  onLoad: function (options) {
    this.setData({
      obj: options
    })
    this.selectByShopId(options.shopid);
    if (options.val){
      this.getvoucher(options);
    }else{
      this.setData({
        ticketList: []
      })
    }
  },

  //获取商家活动列表
  selectByShopId: function (val) {  
    let that = this;
    Api.selectByShopId({ shopId: val}).then((res) => {
      if (res.data.code == 0) {
        that.setData({
          activity: res.data.data
        })
      }
    })
  },
  //点击立即购买
  buynow: function (ev) { 
    let skuid = ev.currentTarget.id
    let _sell = '', _inp = '', _rule = ''
    for (let i = 0; i < this.data.activity.length; i++) {
      if (skuid == this.data.activity[i].skuId) {
        _sell = this.data.activity[i].sellPrice;
        _inp = this.data.activity[i].inPrice;
        _rule = this.data.activity[i].ruleDesc;
      }
    }
    wx.redirectTo({
      url: '../../voucher-details/voucher-details?id=' + skuid + "&sell=" + _sell + "&inp=" + _inp + "&rule=" + _rule,
    })
  },
  //获取可用票券
  getvoucher: function (options) {
    let that = this, _act = options.act;
    let deff = 60 * 60 * 24 * 90 * 1000;
    let _parms = {
      shopId: options.shopid,
      userId: app.globalData.userInfo.userId,
      isUsed: '0',  //0可用  1不可用
      finalAmount: options.val
    }
    Api.listShopUser(_parms).then((res) => {
      if (res.data.code == 200045) {
        that.setData({
          isthird:true
        })
        if (res.data.data.list.length > 0) {
          let _data = res.data.data.list;
          for (let i = 0; i < _data.length; i++) {
            let arr = _data[i].updateTime.split(" ");
            _data[i].ischecked = false;
            _data[i].start = arr[0];
            let year = new Date(arr[0])
            year = year.getTime();
            let newyear = new Date(year + deff)
            let end = utils.dateConv(newyear, '-');
            _data[i].end = end;
          }

          _data[_act].ischecked = true;
          let _msg = res.data.message.replace('该用户', '您');
          that.setData({
            ticketList: _data,
            msg: _msg
          })
        }
      }else if (res.data.code == 0) {
        that.setData({
          isthird: false
        })
        if (res.data.data.list && res.data.data.list.length > 0) {
          let _data = res.data.data.list;
          for (let i = 0; i < _data.length; i++) {
            let arr = _data[i].updateTime.split(" ");
            _data[i].ischecked = false;
            _data[i].start = arr[0];
            let year = new Date(arr[0])
            year = year.getTime();
            let newyear = new Date(year + deff)
            let end = utils.dateConv(newyear, '-');
            _data[i].end = end;
          }
          if(_act>-1){
            _data[_act].ischecked = true;
          }
          console.log('_data:',_data)
          that.setData({
            ticketList: _data
          })
        }
      }
    })
  },
  //选择要用的票券  单选
  radioOperate(e) {
    let id = e.target.id, _this = this,act ='';
    console.log('id:',id)
    let _arr = this.data.ticketList;
    for (var i = 0; i < _arr.length; i++) {
      if (id == _arr[i].id) {
        _arr[i].ischecked = true;
        act=i;
      } else {
        _arr[i].ischecked = false;
      }
    }
    this.setData({
      ticketList: _arr
    });
    // return false
    setTimeout(function () {
      wx.redirectTo({
        url: '../paymentPay-page/paymentPay-page?shopid=' + _this.data.obj.shopid + '&inputValue=' + _this.data.obj.inputValue + '&offer=' + _this.data.obj.offer + '&isChecked=' + _this.data.obj.isChecked + '&act=' + act
      })
    }, 200)
  },
  //不使用现金券返回
  goback:function(){
    let _this = this, act= -2;
    wx.redirectTo({
      url: '../paymentPay-page/paymentPay-page?&shopid=' + _this.data.obj.shopid + '&inputValue=' + _this.data.obj.inputValue + '&offer=' + _this.data.obj.offer + '&isChecked=' + _this.data.obj.isChecked + '&act=' + act
    })
  }
})

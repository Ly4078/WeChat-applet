import Api from '../../../../../utils/config/api.js';

import {
  GLOBAL_API_DOMAIN
} from '../../../../../utils/config/config.js';
var utils = require('../../../../../utils/util.js');
import Public from '../../../../../utils/public.js';
var app = getApp();
let minusStatus = '';
Page({
  data: {
    // input默认是1  
    _build_url: GLOBAL_API_DOMAIN,
    number: 1,
    minusStatus: 'disabled',
    paymentAmount: '',
    obj: [],
    sostatus: 0,
    issnap: false,
    issecond: false,
    paytype: '', //支付方式， 1微信支付  2余额支付
    balance: 0, //余额
    skuName: "",
    items: [{
        name: '微信支付',
        id: '1',
        disabled: false,
        img: '/images/icon/weixinzhifu.png',
        checked: true
      }
    ]
  },
  onLoad: function(options) {


  },
  radioChange: function(e) { //选框
    let num = e.detail.value;
    this.setData({
      issecond: false
    })
    if (num == 1) { //1微信支付
      this.setData({
        paytype: 1
      })
    } else if (num == 2) { //2余额支付
      this.setData({
        paytype: 2
      })
    }
  },
  bindMinus: function() { //点击减号
    let number = this.data.number;
    if (number > 1) {
      --number;
    }
    this.setData({
      number: number,
      minusStatus: minusStatus
    });
    let _paymentAmount = this.data.number * this.data.obj.sell * 1;
    _paymentAmount = _paymentAmount.toFixed(2)
    this.calculate(_paymentAmount)
    this.setData({
      paymentAmount: _paymentAmount
    });

    minusStatus = number <= 1 ? 'disabled' : 'normal';

  },

  bindPlus: function() { //点击加号
    if (!this.data.actId && this.data.skutype != 4 && this.data.skutype != 8 && this.data.skutype != 10) {
      let number = this.data.number;
      ++number;
      if (number > 10) {
        wx.showToast({
          title: '单次最多购买10张',
          icon: 'none',
          duration: 1500,
          mask: true
        })
        number = 10;
        this.setData({
          number: number
        })
      }
      this.setData({
        number: number,
        minusStatus: minusStatus
      });
      let _paymentAmount = this.data.number * this.data.obj.sell * 1;
      _paymentAmount = _paymentAmount.toFixed(2)
      this.setData({
        paymentAmount: _paymentAmount
      });
      minusStatus = number < 1 ? 'disabled' : 'normal';
      this.calculate(_paymentAmount)
      this.setData({
        number: number,
        minusStatus: minusStatus
      });
    }
  },
  bindManual: function(e) {  //输入的数值
    var number = e.detail.value;
    this.setData({
      number: number
    });
  },
  formSubmit:function(e){  //获取fromId
    let _formId = e.detail.formId;
    Public.addFormIdCache(_formId); 
    
  },
  closetel: function(e) {  //新用户去注册
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/init/init?isback=1'
      })
    }
  }
})
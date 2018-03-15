import Api from '/../../../utils/config/api.js'
var app = getApp();
Page({
  data: {
    // input默认是1  
    number: 1,
    // 使用data数据对象设置样式名  
    minusStatus: 'disabled',
    paymentAmount: '',
    obj: [],
    userId:'1'
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      obj: options,
      paymentAmount: options.sell
    })

    var summation = this.data.obj.sell
    // var indentId = this.data.obj.id
    // this.hidtel(phone)
  },
  hidtel:function($phone) {
    $IsWhat = preg_match('/(0[0-9]{2,3}[\-]?[2-9][0-9]{6,7}[\-]?[0-9]?)/i', $phone);
    if ($IsWhat == 1) {
      return preg_replace('/(0[0-9]{2,3}[\-]?[2-9])[0-9]{3,4}([0-9]{3}[\-]?[0-9]?)/i', '$1****$2', $phone);
    } else {
      return preg_replace('/(1[358]{1}[0-9])[0-9]{4}([0-9]{4})/i', '$1****$2', $phone);
    }
  },
  /* 点击减号 */
  bindMinus: function () {
    var number = this.data.number;
    // 如果大于1时，才可以减  
    if (number > 1) {
      --number;
    }

    // 将数值与状态写回  
    this.setData({
      number: number,
      minusStatus: minusStatus
    });
    let _paymentAmount = this.data.number * this.data.obj.sell;
    this.setData({
      paymentAmount: _paymentAmount
    });
    // console.log("paymentAmount:", _paymentAmount)
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = number <= 1 ? 'disabled' : 'normal';

  },
  /* 点击加号 */
  bindPlus: function () {
    var number = this.data.number;
    ++number;
    this.setData({
      number: number,
      minusStatus: minusStatus
    });
    let _paymentAmount = this.data.number * this.data.obj.sell;
    this.setData({
      paymentAmount: _paymentAmount
    });
    console.log("paymentAmount:", _paymentAmount)
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = number < 1 ? 'disabled' : 'normal';
    // 将数值与状态写回  
    this.setData({
      number: number,
      minusStatus: minusStatus
    });
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var number = e.detail.value;
    // 将数值与状态写回  
    this.setData({
      number: number
    });
  },


  //微信支付入口
  confirmPayment: function (e) {
    let that = this
    let _parms = {
      userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId:this.data.userId,
      userName: app.globalData.userInfo.userName,
      payType:'2',
      skuId:this.data.obj.id,
      skuNum: this.data.number
    }
    Api.socreate(_parms).then((res) => {
      if(res.data.code == 0){
        that.payment(res.data.data)
      }
    })
    
  },
  payment:function(soid){  //调起微信支付
    let that = this
    let _parms = {
      soId: soid,
      openId: app.globalData.userInfo.openId,
    }
    Api.doUnifiedOrder(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
          success: function (res) {
            console.log('支付成功:', res)
            wx.showToast({
              title: '支付成功',
            })
            setTimeout(function () {
              wx.switchTab({
                url: '/pages/mine/mine',
              })
            }, 1500)
          },
          fail: function (res) {
            console.log(res)
            wx.showToast({
              title: '支付失败，请重新支付',
            })
          }
        })
      }
    })
  }
})  
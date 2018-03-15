import Api from '/../../../utils/config/api.js'
var app = getApp();
Page({
  data: {
    // input默认是1  
    number: 1,
    // 使用data数据对象设置样式名  
    minusStatus: 'disabled',
    paymentAmount: '',
    obj: []
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      obj: options,
      paymentAmount: options.sell
    })

    var summation = this.data.obj.sell
    // var indentId = this.data.obj.id
    // console.log('每一个总价:', this.data.obj.sell)
    function hidtel($phone) {
      $IsWhat = preg_match('/(0[0-9]{2,3}[\-]?[2-9][0-9]{6,7}[\-]?[0-9]?)/i', $phone);
      if ($IsWhat == 1) {
        return preg_replace('/(0[0-9]{2,3}[\-]?[2-9])[0-9]{3,4}([0-9]{3}[\-]?[0-9]?)/i', '$1****$2', $phone);
      } else {
        return preg_replace('/(1[358]{1}[0-9])[0-9]{4}([0-9]{4})/i', '$1****$2', $phone);
      }
    }

    //获取openid
    // getOpenId: function (code) {
    //   var that = this;
    //   wx.request({
    //     url: 'https://www.hbxq001.cn/wxpay/getOpenId',
    //     method: 'POST',
    //     header: {
    //       'content-type': 'application/x-www-form-urlencoded'
    //     },
    //     data: { 'code': code },
    //     success: function (res) {
    //       var openId = res.data.openid;
    //       that.xiadan(openId);
    //     }
    //   })
    //   console.log('获取到的openID:', openId)
    // },
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
    let that = this;
    let _parms = {
      // soId: this.data.obj.id,
      soId: '22',
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
  },
})  
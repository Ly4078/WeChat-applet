import Api from '/../../../utils/config/api.js'
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
    this.setData({
      obj: options,
      paymentAmount: options.sell
    })

    var summation = this.data.obj.sell
    // console.log('每一个ID:',obj)
    function hidtel($phone) {
      $IsWhat = preg_match('/(0[0-9]{2,3}[\-]?[2-9][0-9]{6,7}[\-]?[0-9]?)/i', $phone);
      if ($IsWhat == 1) {
        return preg_replace('/(0[0-9]{2,3}[\-]?[2-9])[0-9]{3,4}([0-9]{3}[\-]?[0-9]?)/i', '$1****$2', $phone);
      } else {
        return preg_replace('/(1[358]{1}[0-9])[0-9]{4}([0-9]{4})/i', '$1****$2', $phone);
      }
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
  // confirmPayment: function (res) {
  //   console.log("微信支付:", res)
  //   // let that = this;
  //   let paymentGetBack = {
  //     soId: '5',
  //     openId: '5'
  //   }
  //   Api.paymentPay(paymentGetBack).then((res) => {
  //     console.log("支付返回的数据:", res.data.data)
  //     this.setData({
  //       carousel: res.data.data
  //     })
  //     wx.requestPayment({
  //       'timeStamp': res.data.timestamp,
  //       'nonceStr': res.data.nonceStr,
  //       'package': 'prepay_id="+res.data.prepayId',
  //       'signType': 'MD5',
  //       'paySign': 'sign',
  //       'success': function (res) {
  //         console.log("支付成功");
  //       },
  //       'fail': function (res) {
  //       }
  //     })
  //   })
  // }
})  
import Api from '/../../../utils/config/api.js'
import MD5 from '/../../../utils/tools/md5.js'
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
  confirmPayment: function (res) {
    console.log("微信支付:", res)
    // let that = this;
    let paymentGetBack = {
      soId: '5',
      openId: '5'
    }


    Api.paymentPay(paymentGetBack).then((res) => {
      console.log("支付返回的数据:", res.data.data)
      this.setData({
        carousel: res.data.data
      })
      const _timeStamp = parseInt(new Date().getTime() / 1000) + ''; //时间戳

      let result = "";  //随机字符串    
      //暂时使用START   正确使用参考https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=4_3
      const sjdata = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
      for (var i = 0; i < 31; i++) {
        var r = Math.floor(Math.random() * 62);    
        result += sjdata[r];        
      }
      //  暂时使用END

     
      let stringA = 'appId = wxf91e2a026658e78e & nonceStr=' + result + '& package=prepay_id =' + res.data.prepayId + '& signType=MD5 & timeStamp=' + _timeStamp   // res.data.prepyId?   确定后填入prepay_id相应的值
      let stringSignTemp = stringA + "&key=192006250b4c09247ec02edce69f6a2d"  //确定key值后填写进去
      let sign = MD5.hexMD5(stringSignTemp)  //MD5加密  不可逆
      console.log("sign:",sign)
      // sign = sign.toUpperCase() = "9A0A8659F005D6984697E2CA0A9CF3B7" //注：MD5签名方式

      // sign = hash_hmac("sha256", stringSignTemp, key).toUpperCase() = "6A9AE1657590FD6257D693A078E1C3E4BB6BA4DC30B23E0EE2496E54170DACD6" 
      
      wx.requestPayment({
        'timeStamp': _timeStamp,
        'nonceStr': result,
        'package': 'prepay_id=' + res.data.prepayId,  //  res.data.prepayId错误
        'signType': 'MD5',
        'paySign': sign,   //sign值 待确认
        'success': function (res) {
          console.log("支付成功");
        },
        'fail': function (res) {
          console.log("支付失败")
        }
      })
    })
  }
})  
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import Api from '../../../../utils/config/api.js'
var utils = require('../../../../utils/util.js')
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    id: '',
    text: '',
    textLen: 0,
    imgNum: 0,
    phone: '',
    flag: true,
    explain: [{
        id: 0,
        headline: '无法打开小程序？',
      content: ['检查网络是否正常,如果在正常网络情况下打不开,请清理小程序“享7美食”再重新搜索进入，如果是新用户进入小程序首先允许授权，完成注册授权地理位置.即可打开。']
      },
      {
        id: 1,
        headline: '卡顿或界面加载慢？',
        content: ['确保手机性能是否良好及检查网络是否正常，如果在确保手机与正常网络情况下卡顿、数据加载不出来，请尝试退出小程序重新进入，若多次出现此情况，请点击“问题反馈与功能建议”以图文形式反馈给我们。']
      },
      {
        id: 2,
        headline: '新用免费兑换券如何领取？',
        content: ['新用户注册完成后可随时领取”新用户红包“，领取位置：小程序首页banner图第二张点击进入即可领取。']
      },
      {
        id: 3,
        headline: '定位不准确；或重新定位？',
        content: ['根据《享7美食服务范围》规定：目前只对“十堰市”、“武汉市”、“黄冈市”、“襄阳市”开放，其他城市“待开放”；进入小程序后如您在已开放城市将会自动选择对应城市，否则默认“十堰市”']
      },
      {
        id: 4,
        headline: '商家如何入驻？',
        content: ['根据《享7美食服务协议》规定：所有需要入驻的商家统一下载【享7美食】App进行入驻提交相关资质；快速下载【享7美食】App方式：一、关注”享7美食“公众号后进入公众号下载；二、在应用商店里搜索【享7商家】下载']
      },
      {
        id: 5,
        headline: '券票到哪里使用；如何核销？',
        content: [
          '享7美食平台共推出：1.平台券、2.拼菜砍价券、3.限量秒杀券、4.提蟹券。',
          '平台券：全平台通用，只要是“享7美食”商家且此商家有推出此优惠规则，即可核销使用，享受优化；',
          '拼菜砍价券与限量秒杀券：指定商家使用享受优惠（在哪个商家买的券就去哪个商家核销享优惠）'
        ]
      },
      {
        id: 6,
        headline: '拼菜砍价活动规则？',
        content:[
          '在平台内可根据自身当前位置选择中意菜品到此商家去享用。',
          '1.具体菜品有详细说明和店铺信息，点击右下角可发起砍价，砍价发起后60分钟内可以有效的砍价和购买，过期后可以重新发起新一轮砍价；',
          '2.发起人和帮砍人都可获得随机金币，成功购买后金币到账，金币可在金币商城免费兑换商品；',
          '3.查看发起的砍价菜，在【我的】-【我的砍菜】里查看邀请好友砍价和购买，购买完成后在【我的】-【优惠券】中查看，到相应的商家出示优惠券二维码使用。'
        ]
      },
      {
        id: 7,
        headline: '限量秒杀活动规则？',
        content:[
          '在平台内可根据自身当前位置选择中意菜品到此商家去享用。',
          '1.具体菜品有详细说明和店铺信息，点击右下角的“立即购买”或“发起邀请”，邀请发起后60分钟内可随意邀请两个新用户注册即可购买到此商家享用，过期后可以重新发起新一轮邀请；',
          '2.发起人邀请人和成功邀请的新用户都可获得随机金币，成功购买后金币到账，金币可在金币商城免费兑换商品；3.查看已经购买的秒杀券，在【我的】-【券包】--【优惠券】里查看邀请好友砍价和购买，购买完成后在【我的】-【优惠券】中查看，到相应的商家出示秒杀券二维码使用。'
        ]
      },
      {
        id: 8,
        headline: '订单在哪里查看？',
        content: ['所有通过小程序产生的订单均可在【我的】-【订单】-查看对应订单。']
      },
      {
        id: 9,
        headline: '如何查看物流？',
        content: ['查看物流信息，可到 券包-兑换记录 对应的兑换商品详情中查看物流！订单未发货前无法查看，物流信息会有部分延迟，准确物流信息请复制订单号到第三方平台查询物流']
      },
      {
        id: 10,
        headline: '是否支持退款？',
        content: ['享7美食平台目前支持砍价以及原价购买的商品退款功能，您可以在已完成订单中申请退款，退款会在1-5天内退还到您的微信账户。拼购类的商品目前支持在开团失败后，将在1-3小时内退还到您的微信账户，开团成功后无法退款。']
      },
      {
        id: 11,
        headline: '在哪里查看我的优惠券？',
        content: ['所有通过小程序产生的券票均可在【我的】-【订单】-查看对应订单。']
      },
      {
        id: 12,
        headline: '金币如何获得；有何作用？',
        content: [
          '1.金币是什么？',
          '金币是用户在享7美食平台，通过砍价、购买等行为获得的奖励，目前仅限于在享7美食平台使用；',
          '2.如何获得金币 ?',
          ' a) 使用优惠劵',
          ' b) 发起砍价并成功购买 ',
          ' c) 帮好友砍价',
          '3.如何使用金币 ? ',
          'a）兑换实物商品邮费到付',
          'a）兑换实物商品邮费到付',
          'b）兑换时请仔细核对收货信息，商品一经兑换，不支持收货信息修改，不支持退货、提现等',
          ' c）凡兑换的实物类奖品将在15个工作日内安排发货。',
        ]
        // content: '1.金币是什么？金币是用户在享7美食平台，通过砍价、购买等行为获得的奖励，目前仅限于在享7美食平台使用；2.如何获得金币 ? a) 使用优惠劵b) 发起砍价并成功购买 c) 帮好友砍价；3.如何使用金币 ? 金币可在享7平台商城中兑换商品 a）兑换实物商品邮费到付 b）兑换时请仔细核对收货信息，商品一经兑换，不支持收货信息修改，不支持退货、提现等 c）凡兑换的实物类奖品将在15个工作日内安排发货。'
      }
    ],
    imgArr: [{
      id: 1,
      url: '/images/icon/add.png'
    }]
  },
  onLoad: function(options) {
    this.setData({
      id: options.id
    });
  },
  onHide() {
    wx.hideLoading();
  },
  onUnload() {
    wx.hideLoading();
  },
  textInp(e) { //文字输入
    this.setData({
      text: e.detail.value,
      textLen: e.detail.value.length
    });
  },
  teleInp(e) { //电话号码
    this.setData({
      phone: e.detail.value
    });
  },
  addImg(e) { //上传图片
    if (e.target.id != 1 || !this.data.flag) {
      return false;
    }
    let that = this;
    wx.chooseImage({ //获取图片
      count: 1, // 默认9
      success: function(res) {
        wx.showLoading({
          title: '上传中...'
        })
        that.setData({
          flag: false
        });
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: that.data._build_url + 'img/upload',
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            "Authorization": app.globalData.token
          },
          success: function(res) {
            let imgArr = [],
              _data = {},
              imgNum = 0;
            imgArr = that.data.imgArr;
            _data = JSON.parse(res.data);
            imgArr.splice(imgArr.length - 1, 0, {
              id: _data.data.id,
              url: _data.data.smallPicUrl
            });
            if (imgArr.length > 4) {
              imgArr = imgArr.slice(0, imgArr.length - 1);
              imgNum = 4;
            } else {
              imgNum = imgArr.length - 1
            }
            that.setData({
              imgArr: imgArr,
              imgNum: imgNum
            });
            wx.hideLoading();
            that.setData({
              flag: true
            });
          }
        }, () => {
          that.setData({
            flag: true
          });
          wx.hideLoading();
        })
      }
    })
  },
  deleteImg(e) {   //删除图片
    let id = e.target.id;
    let flag = true;
    let imgArr = this.data.imgArr, arr = [];
    for (let i = 0; i < imgArr.length; i++) {
      if (id != imgArr[i].id) {
        arr.push(imgArr[i]);
      }
      if (imgArr[i].id == 1){
        flag = false;
      }
    }
    if (flag){
      arr.push({
        id:1,
        url:'/images/icon/add.png'
      })
    }
    this.setData({
      imgArr: arr,
      imgNum: arr.length - 1
    });
  },
  primary(e) { //提交
    if (!this.data.flag) {
      return false;
    }
    let imgArr = [],
      text = '',
      phone = '',
      _param = {},
      str = '',
      that = this;
    imgArr = this.data.imgArr;
    text = this.data.text;
    phone = this.data.phone;
    if (text.length < 10) {
      wx.showToast({
        title: '建议不足10个字',
        icon: 'none'
      })
      return false;
    }
    if (phone.length < 1) {
      wx.showToast({
        title: '请上传手机号或邮箱',
        icon: 'none'
      })
      return false;
    }
    if (phone.indexOf('.') == -1 && /^[0-9]*$/.test(phone) && !(/^1[34578]\d{9}$/.test(phone))) {
      wx.showToast({
        title: '手机号格式输入错误',
        icon: 'none'
      })
      return false;
    }
    if (phone.indexOf('.') != -1 && !(/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(phone))) {
      wx.showToast({
        title: '邮箱格式输入错误',
        icon: 'none'
      })
      return false;
    }
    for (let i = 0; i < imgArr.length; i++) {
      if (imgArr[i].id == 1) {
        imgArr.splice(i, 1);
      }
    }
    if (imgArr.length < 1) {
      wx.showToast({
        title: '请上传图片',
        icon: 'none'
      })
      return false;
    }
    wx.showLoading({
      title: '上传中...',
      icon: 'none'
    })
    for (let i = 0; i < imgArr.length; i++) {
      str += imgArr[i].id + ',';
    }
    str = str.substring(0, str.length - 1);
    _param = 'content=' + text + '&picIds=' + str + '&phone=' + phone;
    let _url = encodeURI(this.data._build_url + 'useropinion/add?' + _param);
    wx.request({
      url: _url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function(res) {
        console.log(res);
        if (res.data.code == 0) {
          wx.showToast({
            title: '上传成功',
            duration: 2000
          })
          that.setData({
            text: '',
            phone: '',
            flag: true,
            textLen: 0,
            imgNum: 0,
            imgArr: [{
              id: 1,
              url: '/images/icon/add.png'
            }]
          });
          wx.hideLoading();
          setTimeout(function(){
            wx.navigateBack({
              delta: 1
            })
          },2000)
        } else {
          wx.showToast({
            title: '上传失败',
            icon: 'none',
          })
        }
        wx.hideLoading();
      },
      fail: function (res) {
        wx.hideLoading();
      }
    });
  }
})
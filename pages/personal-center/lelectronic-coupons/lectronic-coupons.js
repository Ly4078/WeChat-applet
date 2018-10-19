// import Api from '../../../utils/config/config.js';
import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    qrCodeArr: [],     //二维码数组
    couponsArr: [],    //票券数组
    ticket:[],  //票券
    store:[],
    qrCodeFlag: true,   //二维码列表显示隐藏标识
    _skuNum: '',
    soid:'',  //点击的订单ID
    id:'',  //票券ID
    couponId: '',   //券Id
    isUsed: 0,   //是否使用
    goldNum: 0,   //金币数量
    ismoldel:false,
    redfirst:'1',
    timer:'',
    amount:'',
    isticket:false,
    isGold: false,
    frequency:0,
    shopodrder:{},
    istickts:false,
    isDish: false,
    isperson:false,
    ismodel:false,
    isHidden: false,   //是否隐藏使用须知
    shopId:'',
    optObj:{},
    molTxt:[
      '1.砍价菜品均为限量发售，售完即止；',
      '2.用户需在60分钟内邀请好友帮您砍价并成功支付；若超时，需要重新发起砍价申请； ',
      '3.支付成功后，一个月内均可进店使用，过期作废；',
      '4.每桌仅限使用一道砍价菜品，不可叠加使用；',
      '5.其他优惠等问题，以门店实际规定为准，购买后不支持退款、不兑现、不找零；',
      '6.最终解释权归享7平台所有。'
    ]
  },
  onLoad: function (options) {
    let that = this;
    this.setData({
      optObj:options
    })
    if (options.cfrom = 'ticket') {
      this.setData({
        isperson: true
      })
    } else {
      this.setData({
        isperson: false
      })
    }
    if (options.shopId){
      this.setData({
        shopId: options.shopId
      })
    }
    if (options.skuType) {     //优惠券：1平台券 2 商家券 3 食典券   4砍价券  5抢购券 6兑换券
      this.setData({
        skuType: options.skuType     //5，6隐藏 
      })
      if (options.skuType == 5 || options.skuType == 6) {
        this.setData({
          isHidden: true
        });
      }
    }
    if (options.tickType) {    //订单：1享七券 2 特色菜 3食典券 4砍价券 5商家套餐 6砍价菜 7抢购菜 8抢购券 9兑换菜 10兑换券
      this.setData({
        tickType: options.tickType    //8和10隐藏
      })
      if (options.tickType == 8 || options.tickType == 10) {
        this.setData({
          isHidden: true
        });
      }
    }
    if(options.pay== 'pay'){  //从商家订单支付跳转过来的
      this.getshopOrderList(options.soid);
    }else{
      if (options.myCount && options.myCount == 1) {
        wx.showLoading({
          title: '加载中',
        })
      }
      this.setData({
        id: options.id,
        soid: options.soid,
        myCount: options.myCount ? options.myCount : 0
      });
      if (options.cfrom) {
        this.setData({
          isticket: false
        })
        wx.setNavigationBarTitle({
          title: '订单详情'
        })
      } else {
        this.setData({
          isticket: true
        })
      }
      this.setData({
        isticket: true
      })
      this.getTicketInfo();
    }
  },

  onHide:function(){
    clearInterval(this.data.timer)
  },
  onUnload:function(){
    clearInterval(this.data.timer);
  },
  //关闭弹框
  closemodel:function(){
    this.setData({
      ismodel:false
    })
  },
  toshop:function(){
    wx.navigateTo({
      url: '../../index/merchant-particulars/merchant-particulars?shopid=' + this.data.store.id
    })
  },
  //二维码放大
  previewImg: function (e) {
    let that = this,
    idx = e.currentTarget.dataset.index;
    wx.previewImage({
      current: that.data.qrCodeArr[idx],     //当前图片地址
      urls: that.data.qrCodeArr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  getcodedetail: function () { //获取票券详情
    let that = this;
    let freq = this.data.frequency;
    ++freq
    this.setData({
      frequency: freq
    })
    if (freq == 20){
      clearInterval(that.data.timer)
    }
    wx.request({
      url: this.data._build_url + 'cp/get/' + this.data.couponId,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        let data = res.data;
        wx.hideLoading();
        if(res.data.code == 0){
          let arr = [],ticketArr=[];
          if (res.data.data){
            arr.push(res.data.data);

            for (let i = 0; i < arr.length; i++) {
              let Cts = "现金", Dis = '平台', Dis2 = '折扣';
              if (arr[i].skuName && arr[i].skuName.indexOf(Cts) > 0) {
                arr[i].cash = true
              }
              if (arr[i].skuName && arr[i].skuName.indexOf(Dis) > 0 || arr[i].skuName && arr[i].skuName.indexOf(Dis2) > 0) {
                arr[i].discount = true
              }
              ticketArr.push(arr[i]);
            }

            
            that.setData({
              ticket: ticketArr
            })
            if (res.data.data.isUsed == 0) {
              that.setData({
                isGold: true
              });
            }
            if (res.data.data.isUsed && res.data.data.isUsed != 0) {
              let _id = res.data.data.id;
              that.getgold(_id);
              clearInterval(that.data.timer);
              // that.setData({
              //   ismoldel: true
              // })
            }
            if (res.data && res.data.data.type == 3) {
              clearInterval(that.data.timer);
            }
          }
          
        }
      }
    });
  },
  getgold: function (_id){  //券核销完成后给金币
    if (this.data.isGold) {
      let _parms = {
        userId: app.globalData.userInfo.userId,
        id: _id,
        token: app.globalData.token
      };
      Api.getGold(_parms).then((res) => {
        if (res.data.code == 0) {
          this.setData({
            isGold: false
          });
          wx.showModal({
            title: '',
            showCancel: false,
            content: '已使用，获得' + res.data.data + '个金币',
            success: function (res) {
              if (res.confirm) {
                // console.log('用户点击确定')
              } else if (res.cancel) {
                // console.log('用户点击取消')
              }
            }
          })
        }
      });
    }
  },
  getredpacket:function () {//获取可领取的随机红包金额
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId,
      id: that.data.id,
      token: app.globalData.token
    }
    Api.redpacket(_parms).then((res) => {
      if (res.data.code == 0) {
        that.setData({
          amount:res.data.data
        })
      }
    })
  },
  getTicketInfo: function () { //获取平台订单详情
    let that = this;
    wx.request({
      url: that.data._build_url + 'so/getForOrder/' + that.data.soid,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        let _skuNum = res.data.data.coupons;
        for (let i = 0; i < _skuNum.length; i++) {
          let ncard = ''
          for (var n = 0; n < _skuNum[i].couponCode.length; n = n + 4) {
            ncard += _skuNum[i].couponCode.substring(n, n + 4) + " ";
          }
          _skuNum[i].couponCode = ncard.replace(/(\s*$)/g, "")
        }
        console.log("2222")
        let data = res.data;
        if (data.code == 0) {
         
          if (data.data.shopId){
            that.getshopInfo(data.data.shopId);
          }
          let imgsArr = [];
          if (that.data.myCount == 1) {
            let couponsArr = [];
            for (let i = 0; i < data.data.coupons.length; i++) {
              if (data.data.coupons[i].isUsed == 0) {
                couponsArr.push(data.data.coupons[i]);
              }
            }
            that.setData({
              couponsArr: couponsArr,
              couponId: data.data.coupons[0].couponId
            });
          } else {
            that.setData({
              couponsArr: data.data.coupons,
              couponId: data.data.coupons[0].couponId
            });
          }
          console.log("33333")
          for (let i = 0; i < that.data.couponsArr.length; i++) {
            imgsArr.push(that.data.couponsArr[i].qrcodeUrl);
          } console.log("4444")
           data.data.userName =  data.data.userName.substr(0, 3) + "****" +  data.data.userName.substr(7);
          console.log("55513123213")
           let _arr = data.data.createTime.split(' ');
           let _arr2 = _arr[0].split('-');
           _arr2[1] = _arr2[1]*1+3;
          console.log("13123123")
          console.log('_arr2:', _arr2)
           if (_arr2[1]>12){
             _arr2[0] = _arr2[0]*1+1;
             _arr2[1] = 12 -_arr2[1];
           }
          console.log("44441111")
           data.data.endTime = _arr2[0] + '-' + _arr2[1] + '-' + _arr2[2];
          let dip = "食典", _obj = data.data, Cts = "现金", Dis = '平台', Dis2 = '折扣',Barg="砍价", secKill = "抢购", crab = "兑换";
           if (_obj.skuName && _obj.skuName.indexOf(dip) > 0) {
             _obj.dips = true
           }
           if (_obj.skuName && _obj.skuName.indexOf(Cts) > 0) {
             _obj.cash = true
           }
          if (_obj.skuName && _obj.skuName.indexOf(Barg) > 0) {
            _obj.Barg = true
            let endTime = '', createTime = data.data.createTime.substring(0, data.data.createTime.indexOf(' ')), getMonth = '';
            endTime = new Date(createTime).setMonth(new Date(createTime).getMonth() + 1);
            endTime = new Date(endTime);
            getMonth = endTime.getMonth() + 1;
            _obj.endTime = endTime.getFullYear() + '-' + getMonth + '-' + endTime.getDate();
          }
          if (_obj.skuName && _obj.skuName.indexOf(Dis) > 0 || _obj.skuName && _obj.skuName.indexOf(Dis2) > 0) {
            _obj.discount = true
          }
          if (_obj.skuName && _obj.skuName.indexOf(secKill) > 0) {
            let endTime = '', createTime = data.data.createTime.substring(0, data.data.createTime.indexOf(' ')), getMonth = '';
            endTime = new Date(createTime).setDate(new Date(createTime).getDate() + 7);
            endTime = new Date(endTime);
            getMonth = endTime.getMonth() + 1;
            _obj.endTime = endTime.getFullYear() + '-' + getMonth + '-' + endTime.getDate();
          }
          console.log("666666666")
          if (_obj.skuName && _obj.skuName.indexOf(crab) > 0) {
            let endTime = '', createTime = data.data.createTime.substring(0, data.data.createTime.indexOf(' ')), getMonth = '';
            endTime = new Date(createTime).setDate(new Date(createTime).getDate() + 5);
            endTime = new Date(endTime);
            getMonth = endTime.getMonth() + 1;
            _obj.endTime = endTime.getFullYear() + '-' + getMonth + '-' + endTime.getDate();
          }
          console.log("555555")
          _obj.soAmount = _obj.soAmount.toFixed(2);
          that.setData({
            ticketInfo: _obj,
            qrCodeArr: imgsArr,
            _skuNum: _skuNum
          });
          // let dish = '食典';
          // if (that.data.ticketInfo.skuName.indexOf(dish) > 0) {
          //   that.setData({
          //     isDish: true
          //   });
          // }
        }
        that.getcodedetail();
        let int = setInterval(function () {
          that.getcodedetail();
        }, 2000);
        that.setData({
          timer: int
        });
      }
    });
  },
  //根据ID查询商家信息
  getshopInfo(val){
    let that = this;
    wx.request({
      url: this.data._build_url + 'shop/get/' + val,
      header: {
        "Authorization": app.globalData.token
      },
      header: {
        'content-type': 'application/json;Authorization'
      },
      success: function (res) {
        let _data = res.data.data;
        _data.address = _data.address.replace(/\-/g, "");
        that.setData({
          store: _data
        })
      }
    })
  },
  //点击更多收起按钮
  onclickMore: function () {
    this.setData({
      qrCodeFlag: !this.data.qrCodeFlag
    });
  },
  sublevelSum: function (event) {
    let that = this;
    if (this.data.ticketInfo.Barg){
      this.setData({
        ismodel: true
      })
    }else if (this.data.ticketInfo.dips){
      wx.navigateTo({
        url: '../../index/voucher-details/voucher-details?actId=actId&shidian=shidian&sell=' + that.data.ticketInfo.soAmount,
      })
    } else if (this.data.ticketInfo.cash) {  //现金
      wx.navigateTo({
        url: '../../index/voucher-details/voucher-details?id=' + that.data.ticketInfo.skuId + ' &sell=' + that.data.ticketInfo.unitPrice + '&inp=' + that.data.ticketInfo.coupons[0].couponAmount + '&rule=' + that.data.ticketInfo.coupons[0].promotionRules[0].ruleDesc + '&num=' + that.data.ticketInfo.skuNum
      })
    } else if (this.data.ticketInfo.discount){  //折扣
      wx.navigateTo({
        url: '../../index/voucher-details/voucher-details?cfrom=pack',
      })
    } else if (this.data.ticket[0].type == 3){
      
      
    }
  },
  
  
  clickmolbox:function(){  //关闭弹框
    if (this.data.redfirst == 2) {
      this.closemob();
    }
  },
  closemob: function () { //关闭弹框
    this.setData({
      ismoldel: false
    })
  },
  gowallet:function(){  //去钱包页面
    this.closemob();
    wx.redirectTo({
      url: '../myWallet/myWallet',
    })
  },
  clickcur:function(){ //点击货币图片，折包获取奖励
    let that = this;
    if (this.data.redfirst == 2){
      return false
    }
    this.setData({
      redfirst:2
    })
    that.getredpacket();
  },
   //获取商家订单信息
  getshopOrderList: function (soid) {      
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId,
      id:soid,
      soStatus:'2',
      token: app.globalData.token
    };

   
    Api.myorderForShop(_parms).then((res) => {
      if (res.data.code == 0 || res.data.code == 200){
        let dip = "食典", _obj = res.data.data.list[0];
      
        if (_obj.skuName && _obj.skuName.indexOf(dip) > 0) {
          _obj.dips = true
        }
        _obj.soAmount = _obj.soAmount.toFixed(2);
        this.setData({
          ticketInfo:_obj,
          isticket: false
        })
      }
    })
    // let dish = '食典';
    // if (that.data.ticketInfo.skuName.indexOf(dish) > 0) {
    //   that.setData({
    //     isDish: true
    //   });
    // }
  },
  tomyOrder:function(){ //去优惠券列表
    wx.redirectTo({
      url: '../my-discount/my-discount'
    })
  }
})





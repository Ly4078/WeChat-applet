// pages/index/search/search.js
import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    code: '',
    newamount: '',
    pay: '',
    ticketsinfo: [],
    hxData: {},
    okhx: true,
    _type: false,
    _code: '',
    isent: false,
    place: '券信息',
    tils: '顾客信息',
    customer:'',
    bond: '',
    isconfirm:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.ent) {
      this.setData({
        isent: true,
        okhx:false
      })
    }
    if (options.code) {
      this.gettickets(options.code)
    }
  },

  bindinputent: function (e) {  //实时获取输入的券码
    let _value = e.detail.value
    let actual = e.detail.value
    if (actual.length == 10) {
      this.gettickets(actual);
    }this.setData({
      _code: _value
    })
  },

  gettickets: function (val) {  //获取票券信息
    let that = this
    wx.request({
      url: this.data._build_url + 'cp/getByCode/' + val,
      success: function (res) {
        let _data = res.data;
        // console.log('_data:', _data)
        if (_data.code == 500){
          that.setData({
            _code: ''
          })
          wx.showToast({
            title: '券码错误，请重新输入！',
            mask: 'true',
            icon: 'none',
            duration: 3000
          })
        }else if (_data.code == 0) {
          if(!_data.data){
            wx.showToast({
              title:'券码错误，请重新输入！',
              mask: 'true',
              icon: 'none',
              duration: 3000
            })
            that.setData({
              _code: ''
            })
          }else{
            let _rele = _data.data.promotionRules[0].ruleDesc,userphone = res.data.data.userName;
            userphone = userphone.substr(0, 3) + "****" + userphone.substr(7);
            that.setData({
              ticketsinfo: _data.data,
              hxData: _data.data,
              okhx: true,
              customer: userphone,
              bond: res.data.data.skuName,
              newamount: res.data.data.couponAmount
            })
            let Cts = "现金", Dis = '折扣',Act = '活动';
            if (_data.data.skuName.indexOf(Cts) > 0) {
              // _data.data.discount = false
            }
            // if (_data.data.skuName.indexOf(Act) > 0) {
            //     let _parms = {
            //       shopId: app.globalData.userInfo.shopId,
            //       skuId:_data.data.skuId
            //     }
            //     Api.searchForShopIdNew(_parms).then((res) => {
            //       if (res.data.code == -1) {
            //         that.setData({
            //           _code: '',
            //           okhx: false,
            //           ticketsinfo: []
            //         })
            //         wx.showToast({
            //           title: res.data.message + ',不能核销此活动券 ',
            //           mask: 'true',
            //           icon: 'none',
            //           duration: 3000
            //         })
            //         setTimeout(function () {
            //           wx.switchTab({
            //             url: '../personal-center'
            //           })
            //         }, 3000)
            //       }
            //     })
            //   _data.data.discount = true;
            // }
            // if (that.data._type) {
            //   let _parms = {
            //     shopId: app.globalData.userInfo.shopId
            //   }
            //   Api.searchForShopId(_parms).then((res) => {
            //     if (res.data.code == -1) {
            //       that.setData({
            //         _code: '',
            //         ticketsinfo: []
            //       })
            //       wx.showToast({
            //         title: res.data.message + ',不能核销此活动券 ',
            //         mask: 'true',
            //         icon: 'none',
            //         duration: 3000,
            //         okhx: false,
            //       })
            //     } 
            //   })
            // } 
          }

        } else {
          wx.showToast({
            title: _data.message,
            icon: 'none',
            mask: 'true',
          }, 2000)
          that.setData({
            ticketsinfo:[]
          })
        }
      }
    })
  },


  confirm: function () {  //确认核销
    let that = this,_hxData = this.data.hxData;
    if (!this.data.isconfirm){
      return false
    }
    if (!this.data.okhx) {
      wx.showToast({
        title: '不符合核销条件，请重新输入',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      return false
    }
    this.setData({
      isconfirm:false
    })
    _hxData.shopAmount = this.data.amount;
    let _parms = {
      soId: _hxData.soId,	        //订单id	Long
      shopId: app.globalData.userInfo.shopId ? app.globalData.userInfo.shopId:"",	       //商家id	Long
      shopName: app.globalData.userInfo.shopName ? app.globalData.userInfo.shopName : "",	   //店铺名称	Date
      shopAmount: that.data.newamount,	   //消费总额	BigDecimal
      couponId: _hxData.id,   //电子券id	Long
      couponCode: _hxData.couponCode,	   //电子券code	String
      skuId: _hxData.skuId,	       //商品id	Long
      couponAmount: that.data.newamount,	//电子券面额	BigDecimal
      userId: _hxData.userId,	//消费人id	Long
      userName: _hxData.userName,  //消费人账号	String
      cashierId: app.globalData.userInfo.userId,	    //收银id	Long
      cashierName: app.globalData.userInfo.userName	    //收银账号	String
    }
    console.log("_parms:", _parms);
    // return false
    Api.hxadd(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          title: '核销成功',
          icon: 'none',
          complete: function() {
            setTimeout(function() {
              wx.switchTab({
                url: '../personal-center'
              })
            }, 1000);
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.message,
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../personal-center'
              })
            } else if (res.cancel) {
              wx.switchTab({
                url: '../personal-center'
              })
            }
          }
        })
      }
    })
  }
})
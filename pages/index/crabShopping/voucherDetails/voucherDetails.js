import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
import Public from '../../../../utils/public.js';
var QR = require("../../../../utils/qrcode.js");
var app = getApp();
var redbagTimer = null;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isshowlocation: false,
    id: '',
    isDue: '',
    detailType:'0',
    imagePath: '',//动态二维码图片链接
    sendType: '', // 0-均有/1-快递/2-门店
    isReceived: false, //是否被领取
    isExchange: false, //是否弹出兑换码
    giftTxt: '已被领取', //赠送文字,
    showSkeleton:true,
  },
  onLoad: function(options) {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({ windowHeight: res.windowHeight })
      },
    })
 
    this.setData({
      id: options.id,
      isDue: options.isDue,
      fromType: options.fromType || ''
    });
    if (options.shareId) {
      this.setData({
        shareId: options.shareId,
        oldVersionNo: options.versionNo
      });
    }
  },
  onHide:function(){
    wx.hideLoading();
    if (redbagTimer != null) {
      clearInterval(redbagTimer)
    }
  },
  onUnload() {
    wx.hideLoading();
    if (redbagTimer != null) {
      clearInterval(redbagTimer)
    }
  },
  onShow: function() {
    let _token = wx.getStorageSync('token') || "";
    let userInfo = wx.getStorageSync('userInfo') || {};
    let that = this;
    if (userInfo) {
      app.globalData.userInfo = userInfo;
    }
    if (_token.length > 5) {
      app.globalData.token = _token;
    }
    //判断是否新用户
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          if (app.globalData.userInfo.lat && app.globalData.userInfo.lng) {
            that.getorderCoupon();
            if (redbagTimer !=null ) {
              clearInterval(redbagTimer)
            }
            redbagTimer = setInterval(() => {
              that.getorderCoupon();
            }, 2000)
          } else {
            that.getlocation();
          }
        } else {
          that.authlogin();
        }
      } else { //是新用户，去注册页面
        wx.navigateTo({
          url: '/pages/init/init?isback=1'
        })
      }
    } else {
      this.findByCode();
    }
  },
  getorderCoupon: function(val) { //查询券详情
    let _this = this,url='';
    let userInfo = wx.getStorageSync("userInfo")
    wx.request({
      url: this.data._build_url + 'orderCoupon/getDetail?id=' + this.data.id + '&locationX=' + app.globalData.userInfo.lng + '&locationY=' + app.globalData.userInfo.lat,
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          wx.hideLoading();
          let data = res.data.data, userId = app.globalData.userInfo.userId;
          if (!_this.data.imagePath) {
            url = _this.data._build_url + 'orderCoupon/getByCode/' + res.data.data.couponCode;
            let size = _this.setCanvasSize();//动态设置画布大小 
            _this.createQrCode(url, "voucanvas", size.w, size.h);
          }
          _this.setData({
            piaodata:data,
            skuName: data.goodsSku.skuName,
            skuPic: data.goodsSku.skuPic,
            // qrcodeUrl: data.qrcodeUrl, //核销/二维码
            couponCode: data.couponCode, //核销号码
            remark: data.goodsSku.remark,
            expiryDate: data.expiryDate,
            sendType: data.goodsSku.sendType,
            isUsed: data.isUsed, //是否使用 0否/1是
            ownId: data.ownId, //券所有人
            bluk: data.goodsSku.bulk,
            piece: data.goodsSku.piece,
            formulaMode: data.deliveryTemplate ? data.deliveryTemplate.calculateType : '',
            versionNo: data.versionNo, //版本号
            realWeight: data.goodsSku.realWeight, //实际重量
            tempateId: data.goodsSku.deliveryTemplateId, //模板id
            showSkeleton:false,
            status: data.status
          });
          if (data.singleType == 2) {
            _this.setData({
              goodsNum: data.orderItemOuts[0].giftNum + data.orderItemOuts[0].goodsNum
            });
          }
          let giftTxt = _this.data.giftTxt;
          _this.setData({ isEnd: false })
          if(data.ownId != userInfo.id) {
            app.globalData.exchangeId = data.id
          }
          
          if (data.isUsed == 1) {
            app.globalData.exchangeId = data.id
            giftTxt = '已被使用';
            _this.setData({isEnd:true})
          } else if (data.status == 4) {
            giftTxt = '该票券退款中';
            _this.setData({ isEnd: true })
          } else if (data.status == 5) {
            giftTxt = '该票券已被退款';
            _this.setData({ isEnd: true })
          } else if (_this.data.isDue == 1) {
            giftTxt = '该票券已过期';
            _this.setData({ isEnd: true })
          }else{
            
          }
          try {
            if (data.goodsCategories[0].parent[0].id == '70' && data.isUsed == '0' && !_this.data.isEnd) {
              _this.setData({ detailType: '1' })
              wx.setNavigationBarTitle({
                title: '送红包贺卡',
              })
            } else {
              _this.setData({ detailType: '0' })
            }
          } catch (err) { }
          _this.setData({
            giftTxt: giftTxt
          });
          if (_this.data.shareId) { //从分享页进来
            if (_this.data.shareId == _this.data.ownId || _this.data.ownId == null) { //未被领取
              if (userId != _this.data.shareId) { //不是(所有人&&分享人)点开
                if (_this.data.oldVersionNo == data.versionNo) {
                  _this.getsendCoupon();
                } else {
                  _this.setData({
                    isReceived: true
                  })
                }
              }
            } else { //已被领取
              if (userId != _this.data.ownId) { //被别人领取
                _this.setData({
                  isReceived: true
                });
              }
            }
          } else { //从列表进来
            if (userId == _this.data.ownId) { //未被领取

            } else { //列表进来被领取
              _this.setData({
                isReceived: true
              });
            }
          }
          if (_this.data.sendType != 1) {
            //获取门店列表数据
            _this.storeData(data);
          }
          if (val == 1) {
            let isExchange = true;
            if (_this.data.isReceived || _this.data.isUsed == 1) {
              wx.showToast({
                title: '该券已被人领取',
                icon: 'none'
              })
              isExchange = false;
            }
            _this.setData({
              isExchange: isExchange
            });
          }
          if (val == 2) {
            if (_this.data.isReceived || _this.data.isUsed == 1) {
              wx.showToast({
                title: '该券已被人领取',
                icon: 'none'
              })
              return;
            }
            console.log('piaodata:', _this.data.piaodata)
            wx.navigateTo({
              url: '../express/express?weight=' + _this.data.realWeight + '&tempateId=' + _this.data.tempateId + '&id=' + _this.data.id + '&locationX=' + app.globalData.userInfo.lng + '&locationY=' + app.globalData.userInfo.lat + '&bluk=' + _this.data.bluk + '&piece=' + _this.data.piece + '&formulaMode=' + _this.data.formulaMode + "&shopId=" + _this.data.piaodata.shopId + "&couponCode=" + _this.data.piaodata.couponCode + "&couId=" + _this.data.piaodata.id
            })
          }

          // if (_this.data.fromType == 'employ' && !_this.data.isReceived && _this.data.isUsed == 0 && (_this.data.status == 0 || _this.data.status == null) && _this.data.isDue == 0 && (_this.data.sendType == 0 || _this.data.sendType == 2)){
          //   setTimeout( ()=>{
          //     _this.exchange();
          //     _this.setData({ fromType: '' })
          //   },250)
          // }
        }
      },
      complete: function() {
        _this.setData({
          showSkeleton: false
        })
        wx.hideLoading();
      }
    })
  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 686; //不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale * 0.9;
      var height = width;//canvas画布为正方形
      size.w = width/2;
      size.h = height/2;
    } catch (e) {
      // Do something when catch error
    }
    return size;
  },
  //生成二维码
  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH);
    setTimeout(() => { this.canvasToTempImage(); }, 1000);
  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'voucanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        console.log('resssss',res)
        that.setData({
          imagePath: tempFilePath
          // canvasHidden:true
        });
      },
      fail: function (res) {
      }
    });
  },

  getsendCoupon: function() { //领取提蟹券
    let _parms = {},
      _this = this,
      _value = "",
      url = "",
      _Url = "",
      _txt = "";
    _parms = {
      orderCouponCode: this.data.couponCode,
      sendUserId: this.data.ownId,
      versionNo: this.data.versionNo,//版本号传错了 需要传页面带过来参数的老版本号
      token: app.globalData.token
    };
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    url = _this.data._build_url + 'orderCoupon/sendVersionCoupon?' + _value;
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function(res) {
        if (res.data.code == 0) {
          wx.showModal({
            title: '提示',
            content: '领取成功',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                _this.getorderCoupon();
              } else if (res.cancel) {
              }
            }
          })
        } else {
          _this.setData({
            isReceived: true
          });
        }
      }
    })
  },
  onShareAppMessage: function() { //赠送好友转发、
  let that = this;
    if (that.data.detailType == '1') {
      let title = '恭喜发财，大吉大利！';
      var url = '/packageA/pages/redBagIndex/redbagDetail/index?shareId=' + app.globalData.userInfo.userId + '&versionNo=' + that.data.versionNo+ '&id=' + that.data.id + '&nickName=' + app.globalData.userInfo.nickName + '&iconUrl=' + app.globalData.userInfo.iconUrl + '&title=' + (that.data.redbagMsg ? that.data.redbagMsg :title);
      console.log(url)
        return {
          // title: that.data.redbagMsg ? that.data.redbagMsg:'恭喜发财，大吉大利！',
          title: '新春来贺喜，情藏红包里 ',
          imageUrl:'https://xqmp4-1256079679.file.myqcloud.com/15927505686_12312321312321312321312.png',
          path: url,
          success: function (res){
              
          }
        }
    }else{
      return {
        title: '送您一张「' + this.data.skuName + '」兑换券',
        // imageUrl: this.data.skuPic,
        imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/15927505686_share201811201231232.jpg',
        path: '/pages/index/crabShopping/voucherDetails/voucherDetails?id=' + this.data.id + '&shareId=' + app.globalData.userInfo.userId + '&versionNo=' + this.data.versionNo,
        success: function (res) {
          let flag = true;
          let piaosharelist = wx.getStorageSync('piaosharelist') ? wx.getStorageSync('piaosharelist') : [];
          for (let i = 0; i < piaosharelist.length; i++) {
            if (piaosharelist[i] == that.data.couponCode) {
              flag = false
            }
          }
          if (flag) {
            console.log(piaosharelist)
            piaosharelist.push(that.data.couponCode)
            wx.setStorageSync("piaosharelist", piaosharelist)
          }
        }
      }
    }
    
  },
  storeData(data) { //门店列表
    let storeList = [],
      salePointOuts = data.salePointOuts;
    if (salePointOuts.length > 0) {
      for (let i = 0; i < salePointOuts.length; i++) {
        storeList.push({
          salepointName: salePointOuts[i].salepointName,
          address: salePointOuts[i].address,
          distance: this.calculate(salePointOuts[i].distance),
          locationX: salePointOuts[i].locationX,
          locationY: salePointOuts[i].locationY,
          mobile: salePointOuts[i].mobile ? salePointOuts[i].mobile : salePointOuts[i].phone
        });
      }
    }
    try{
      if (data.shopOut.id != 0) {
        storeList.push({
          salepointName: data.shopOut.shopName,
          address: data.shopOut.address,
          distance: this.calculate(data.shopOut.distance),
          locationX: data.shopOut.locationX,
          locationY: data.shopOut.locationY,
          mobile: data.shopOut.mobile ? data.shopOut.mobile : data.shopOut.phone
        });
      }
    }catch(err){}
    this.setData({
      storeList: storeList
    });
  },
  calculate(val) { //计算距离
    if (val >= 1000) {
      val = (val / 1000).toFixed(2);
      val = val + 'km'
    } else {
      val = val + 'm';
    }
    return val;
  },
  express() { //跳转至快递配送
    let txtObj = wx.getStorageSync("txtObj");
    let that = this;
    if (txtObj.express) {
      if (txtObj.express.isOpen){
        that.getorderCoupon(2);
      }else{
        wx.showModal({
          title: '提示',
          content: txtObj.express.tips,
          success(res) {
            if (res.confirm) {
              that.getorderCoupon(2);
            } else if (res.cancel) {

            }
          }
        })
      }
      
    }else{
      that.getorderCoupon(2);
    }
   
  },
  toMyself:function(){//自己使用
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定兑换？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '兑换中...',
          })
          let url = that.data._build_url + "orderCoupon/useCouponForRedPacket?id=" + that.data.id + "&remark=" + (that.data.redbagMsg ? that.data.redbagMsg : '恭喜发财，大吉大利');
          let urls = encodeURI(url)
          wx.request({
            url: urls,
            method:'POST',
            header: {
              "Authorization": app.globalData.token
            },
            success: function (res) {
              if(res.data.code=='0' && res.data.data == '1') {
                app.globalData.exchangeId = that.data.id;
                wx.showModal({
                  title: '提示',
                  content: '兑换成功',
                  showCancel:false,
                  success(res) {
                    if (res.confirm) {
                      wx.navigateBack({
                        delta:1
                      })
                    }
                  }
                })
              }else{
                wx.showToast({
                  title: '兑换失败',
                  icon:"none"
                })
                that.onShow();
              }

            },
            fail:function(){

            },
            complete:function(){
              wx.hideLoading()
            }

          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
   

  },
  storeList() { //跳转至门店列表
    let storeList = '';
    if (this.data.storeList != []) {
      storeList = JSON.stringify(this.data.storeList)
    }
    wx.navigateTo({
      url: '../storeList/storeList?storeList=' + storeList
    })
  },
  exchange() { //点击兑换按钮
  wx.previewImage({
    urls: [this.data.imagePath],
  })
    // this.getorderCoupon(1);
  },
  infoDetail() {   //跳转至详细说明
    let url = '../getFailure/getFailure?onekey=voucher';
    try{
      if (this.data.piaodata.goodsCategories[0].parent[0].id == '70') {
        url = '/pages/index/crabShopping/getFailure/getFailure?onekey=redbagdesc'
      }
    }catch(err){}
    wx.navigateTo({
      url: url ,
    })
  },
  cancelQr() { //取消兑换
    this.setData({
      isExchange: false
    });
    this.getorderCoupon();
  },
  //跳转至首页
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  //通过code查询进入的用户信息，判断是否是新用户
  findByCode: function (val) {
    let _this = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            if (data.id) {
              app.globalData.userInfo.userId = data.id;
              app.globalData.userInfo.lat = data.locationX ? data.locationX : '';
              app.globalData.userInfo.lng = data.locationY ? data.locationY : '';
              for (let key in data) {
                app.globalData.userInfo[key] = data[key]
              }
              if (!data.mobile) { //是新用户，去注册页面
                wx.navigateTo({
                  url: '/pages/init/init?isback=1'
                  // url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
                })
              } else {
                if (app.globalData.token) {
                  _this.getorderCoupon();
                } else {
                  _this.authlogin();
                }
              }
            } else {
              wx.navigateTo({
                url: '/pages/init/init?isback=1'
              })
            }
          } else {
            _this.findByCode();
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
    let _this = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          if (app.globalData.userInfo.mobile) {
            if (app.globalData.userInfo.lat && app.globalData.userInfo.lng) {
              _this.getorderCoupon();
            } else {
              _this.getlocation();
            }
          }
        }
      }
    })
  },
  getlocation: function () { //获取用户位置
    let that = this,
      lat = '',
      lng = '';
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        that.getorderCoupon();
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其位置信息 
              that.setData({
                isshowlocation: true
              })
            } else {
              that.getlocation();
            }
          }
        })
      }
    })
  },
  redbagMsg:function(e){
    console.log(e.detail.value);
    this.setData({
      redbagMsg:e.detail.value
    })
  },
  todetailMsg: function () {
    wx.navigateTo({
      url:
        '/pages/index/crabShopping/getFailure/getFailure?onekey=redbagdesc',
    })
  },
})
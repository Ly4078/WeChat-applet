import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
import Public from '../../../../utils/public.js';
var app = getApp();

var village_LBS = function (that) {
  wx.getLocation({
    success: function (res) {
      let latitude = res.latitude;
      let longitude = res.longitude;
      that.requestCityName(latitude, longitude);
    },
  })
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    isshowlocation:false,
    actaddress: {}, //当前选中收货地址信息
    current: {}, //券详情
    payObj: {},
    txtObj:{},
    crabImgUrl: [], // 详情图列表
    isconvert: true,
    isshowticode:false,
    ismyqrcode:true,
    vouId: '', //券ID
    kaishi: '',
    isfrst: false,
    isshare: false, //是否是点击分享进来的
    versionNo:0,//分享上版本号
    shareId:'',//分享人ID
    isreceive: false, //券是否已经被领取
    isgift: true, //能否赠送券给其他人
    errmsg: '',
    _token:'',
    txtObj:{},
    postage: 0,
    qtype:"",
    remarks: '', //备注内容
    date: '', //默认日期
    threeLater: '', //三天后
    tenLater: '', //十天后
    shareimgs: [{
        name: "人气款",
        imgUrl: "https://xqmp4-1256079679.file.myqcloud.com/test12312a_3.0.png"
      },
      {
        name: "经典款",
        imgUrl: "https://xqmp4-1256079679.file.myqcloud.com/test12312a_3.5.png"
      },
      {
        name: "典藏款",
        imgUrl: "https://xqmp4-1256079679.file.myqcloud.com/test12312a_4.0.png"
      },
      {
        name: "尊享款",
        imgUrl: "https://xqmp4-1256079679.file.myqcloud.com/test12312a_4.5.png"
      },
      {
        name: "巨蟹款",
        imgUrl: "https://xqmp4-1256079679.file.myqcloud.com/test12312a_5.0.png"
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  
  onLoad: function(options) {
    console.log("options:", options)
    this.setData({
      vouId: options.id,
      qtype:options.type
    })
    if (options.isshare) {
      this.setData({
        isshare: options.isshare,
        shareId: options.shareId,
        versionNo: options.versionNo
      })
    }
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  //未领取情况下点击赠送好友 
  handGift: function() {
    wx.showToast({
      title: '不可赠送未领取的券',
      icon: 'none',
      duration: 3000
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let id = this.data.vouId,
      _skuName = this.data.current.styleName,
      _goodsSkuName = this.data.current.goodsSkuName,
      _type = this.data.qtype,
      _versionNo = this.data.current.versionNo,
      _mgsUrl = "",
      _shareimgs = this.data.shareimgs;
    for (let i = 0; i < _shareimgs.length; i++) {
      if (_skuName == _shareimgs[i].name) {
        _mgsUrl = _shareimgs[i].imgUrl;
      }
    }
    return {
      title: _goodsSkuName,
      imageUrl: _mgsUrl,
      path: '/pages/index/crabShopping/voucherDetails/voucherDetails?id=' + id + '&isshare=true&shareId=' + app.globalData.userInfo.userId + '&versionNo=' + _versionNo+'&type='+_type,
      success: function (res) { }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let _token = wx.getStorageSync('token') || "";
    let userInfo = wx.getStorageSync('userInfo') || {};
    let txtObj = wx.getStorageSync('txtObj') || {};
    
    if (userInfo) {
      app.globalData.userInfo = userInfo;
    }
    if (_token.length>5) {
      app.globalData.token = _token;
    }
    if (Object.keys(txtObj).length != 0) {
      this.setData({ txtObj });
      app.globalData.txtObj = txtObj;
    }
    let _day = 60 * 60 * 24 * 1000,
      _today = '',
      hours = '',
      _threeday = '',
      that = this,
      _tenday = '';
    _today = new Date();
    hours = _today.getHours();
    if (hours >= 17) {
      _threeday = _today.getTime() + _day * 4;
      _tenday = _today.getTime() + _day * 11;
    } else {
      _threeday = _today.getTime() + _day * 3;
      _tenday = _today.getTime() + _day * 10;
    }

    _threeday = new Date(_threeday);
    _tenday = new Date(_tenday);
    _today = utils.dateConv(_today, '-');
    _threeday = utils.dateConv(_threeday, '-');
    _tenday = utils.dateConv(_tenday, '-');
    this.setData({
      threeLater: _threeday,
      tenLater: _tenday,
      date: _threeday,
      actaddress: {},
      postage: 0
    })
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile){
        if (app.globalData.token) {
          this.getTXT();
          this.getorderCoupon();
        } else {
          this.authlogin();
        }
      } else { //是新用户，去注册页面
        wx.navigateTo({
          url: '/pages/init/init?isback=1'
        })
        // this.authlogin();
      }
    } else {
      this.findByCode();
    }
    if (this.data.isfrst) {
      this.frestrue();
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    app.globalData.Express = {};
  },
  getTXT:function(){  //查询配置文件
    let _crabImgUrl=[],that = this;

    if (Object.keys(this.data.txtObj).length != 0) {
      app.globalData.txtObj = that.data.txtObj;
      _crabImgUrl = that.data.txtObj.crabImgUrl;
      if(that.data.qtype == 1){
        _crabImgUrl.splice(1, 1);
        that.setData({
          crabImgUrl: _crabImgUrl
        })
      }else if(that.data.qtype == 2){
        _crabImgUrl.splice(0, 2);
        _crabImgUrl.splice(_crabImgUrl.length-1);
        that.setData({
          crabImgUrl: _crabImgUrl
        })
      }
    }else{
      wx.request({
        url: that.data._build_url + 'version.txt',
        header: {
          "Authorization": app.globalData.token
        },
        success: function (res) {
          wx.setStorageSync("txtObj", res.data);
          app.globalData.txtObj = res.data;
          _crabImgUrl = res.data.crabImgUrl;
          if (that.data.qtype == 1) {
            _crabImgUrl.splice(1, 1);
            that.setData({
              crabImgUrl: _crabImgUrl
            })
          } else if (that.data.qtype == 2) {
            _crabImgUrl.splice(0, 2);
            _crabImgUrl.splice(_crabImgUrl.length - 1);
            that.setData({
              crabImgUrl: _crabImgUrl
            })
          }
        }
      })
    }
  },
  //返回首页
  closemodel: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  //查询券详情
  getorderCoupon: function (val) {
    wx.showLoading({
      title: '数据加载中。。。',
    })
    let that = this,
      _crabImgUrl = [];
    wx.request({
      url: this.data._build_url + 'orderCoupon/get/' + this.data.vouId,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _data = res.data.data;
          if (_data) {
            _crabImgUrl = that.data.crabImgUrl;
            if (_data.goodsSku.realWeight != 0) {
              _crabImgUrl = _crabImgUrl.slice(2);
            }
            _data.sku = "公" + _data.maleWeight + " 母" + _data.femaleWeight + " 4对 " + _data.styleName + " | " + _data.goodsSku.otherMarkerPrice + "型";
            that.setData({
              current: _data,
              crabImgUrl: _crabImgUrl,
            })

            if (_data.isUsed == 1) {
              wx.showModal({
                title: '提示',
                showCancel: false,
                content: '此券已被使用',
                success: function (res) {
                  if (res.confirm) {
                    wx.switchTab({
                      url: '/pages/index/index'
                    })
                  }
                }
              })
            } else if (that.data.isshare) {
              console.log("ccccccccccc")
              if (that.data.shareId == app.globalData.userInfo.userId) {
                console.log("11111111")
                if (_data.ownId == app.globalData.userInfo.userId || !_data.ownId) {
                  console.log("11111111--111")
                  //自己点击自己发出的券,未被人领取，不做处理
                  if(that.data.qtype == 2){
                    that.setData({ ismyqrcode:true})
                  }
                  if (val == 1) {
                    console.log("11111111--222")
                    that.sendredeemNow();
                  }
                } else if (_data.ownId != app.globalData.userInfo.userId) {
                  console.log("222222-")
                  //自己点击自己发出的券,已被他人领取
                  if (that.data.qtype == 2) {
                    that.setData({ ismyqrcode: true })
                  }
                  if (val == 1) {
                    console.log("222222-1111111")
                    wx.showModal({
                      title: '提示',
                      content: '此券已被他人领取，不可再提货',
                      showCancel: false,
                      success: function (res) {
                        if (res.confirm) {
                          console.log('用户点击确定')
                        } else if (res.cancel) {
                          console.log('用户点击取消')
                        }
                      }
                    })
                  } else {
                    console.log("222222-222222222")
                    that.setData({
                      isreceive: true
                    })
                  }
                }
              } else if (!_data.ownId || _data.ownId == that.data.shareId) {
                console.log("333333")
                if (!val) {
                  console.log("333333--111111")
                  if (that.data.versionNo == _data.versionNo) {
                    that.getsendCoupon(); //自动领取
                  } else {
                    that.setData({
                      isreceive: true
                    })
                  }

                } else if (val == 1) {
                  console.log("333333--2222222")
                  wx.showModal({
                    title: '提示',
                    content: '此券已被他人领取，不可再提货',
                    showCancel: false,
                    success: function (res) {
                      if (res.confirm) {
                        console.log('用户点击确定')
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  })
                } else if (val = 3) {
                  that.getsendCoupon(val);
                }
              } else if (_data.ownId == app.globalData.userInfo.userId) {
                console.log("44444-")
                if (val == 1) {
                  console.log("44444-1111111")
                  that.sendredeemNow();
                }
              } else {
                console.log("5555555")
                if (val == 1) {
                  console.log("5555555--1111")
                  wx.showModal({
                    title: '提示',
                    content: '此券已被他人领取，不可再提货',
                    showCancel: false,
                    success: function (res) {
                      if (res.confirm) {
                        console.log('用户点击确定')
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  })
                } else {
                  console.log("666666-")
                  that.setData({
                    isreceive: true
                  })
                }
              }
            } else if (_data.ownId == app.globalData.userInfo.userId || !_data.ownId) {
              console.log("eeeeeee")
              if (val == 1) {
                that.sendredeemNow();
              }
            } else if (_data.ownId != app.globalData.userInfo.userId) {
              console.log("aaaaaa")
              if (val == 1) {
                wx.showModal({
                  title: '提示',
                  content: '此券已被他人领取，不可再提货',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }
            }
            // that.getcalculateCost();
          }
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },
  //通过code查询进入的用户信息，判断是否是新用户
  findByCode: function(val) {
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            if(data.id){
              app.globalData.userInfo.userId = data.id;
              app.globalData.userInfo.lat = data.locationX ? data.locationX:'';
              app.globalData.userInfo.lng = data.locationY ? data.locationY:'';
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              }
              if (!data.mobile) { //是新用户，去注册页面
                wx.navigateTo({
                  url: '/pages/init/init?isback=1'
                  // url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
                })
              } else {
                if (app.globalData.token) {
                  that.getTXT();
                  that.getorderCoupon();
                } else {
                  that.authlogin();
                }
              }
            }else{
              wx.navigateTo({
                url: '/pages/init/init?isback=1'
              })
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  authlogin: function () { //获取token
    let that = this;
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
            that.getTXT();
            that.getorderCoupon();
          } 
        }
      }
    })
  },

  //领取提蟹券
  getsendCoupon: function(val) {
    if(val){
      let _parms = {}, that = this, _value = "", url = "", _Url = "",_txt = "";
      _parms = {                                              
        orderCouponCode: this.data.current.couponCode,
        sendUserId: this.data.shareId,
        // receiveUserId: app.globalData.userInfo.userId,
        versionNo: this.data.current.versionNo,
        token: app.globalData.token
      };

      for (var key in _parms) {
        _value += key + "=" + _parms[key] + "&";
      }
      _value = _value.substring(0, _value.length - 1);
      console.log("_value:", _value)
      url = that.data._build_url + 'orderCoupon/sendVersionCoupon?' + _value;
      _Url = encodeURI(url);
      wx.request({
        url: _Url,
        header: {
          "Authorization": app.globalData.token
        },
        method: 'POST',
        success: function (res) {
          console.log('getsendCoupo1n', res)
          if (res.data.code == 0) {
            that.getorderCoupon("a");
            if(that.data.qtype == 1){
              _txt = '领取提蟹券成功';
            }else{
              _txt = '领取提货券成功';
            }
            wx.showModal({
              title: '提示',
              content: _txt,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          } else {
            that.setData({
              isreceive: true
            })
          }
        }
      })
    }else{
      this.getorderCoupon("3")
    }
  },
  //查询已有收货地址
  getAddressList: function(val) {
    let that = this;
    let _parms = {
      // userId: app.globalData.userInfo.userId,
      token: app.globalData.token
    }
    Api.AddressList(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data.list) {
        let _list = res.data.data.list,
          actList = {};
        for (let i = 0; i < _list.length; i++) {
          _list[i].address = _list[i].dictProvince + _list[i].dictCity + _list[i].dictCounty + _list[i].detailAddress;
        }
        this.setData({
          actaddress: _list[0]
        })
        app.globalData.Express = this.data.actaddress;
        // if (val) {
        this.getcalculateCost();
        // }
      } else {
        app.globalData.Express = {};
        this.setData({
          postage: 0
        })
      }
    })
  },
  // 选择收货地址
  additionSite: function() {
    wx.navigateTo({
      url: '../../../personal-center/shipping/shipping',
    })
  },
  //选择送达时间
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
  //跳转至首页
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  //查询提蟹券邮费
  getcalculateCost: function() {
    console.log("getcalculateCost:")
    let that = this;
    if (!this.data.current) {
      this.getDetailBySkuId('val');
      return;
    }
    if (!this.data.actaddress.id) {
      this.getAddressList('val');
      return;
    }
    let _weight = this.data.current.goodsSku.realWeight * 1,
      _obj = {}, _value = "", _parms={},url="",_Url="";
    _parms = {
      dictProvinceId: this.data.actaddress.dictProvinceId,
      dictCityId: this.data.actaddress.dictCityId,
      weight: _weight,
      tempateId: this.data.current.goodsSku.deliveryTemplateId
    };

    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    console.log("_value:", _value)
    url = this.data._build_url + 'deliveryCost/calculateCostForCoupon?' + _value;
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        console.log("resres:",res)
        if (res.data.code == 0) {
          _obj = that.data.current;
          if (res.data.data) {
            _obj.total = _obj.total * 1 + res.data.data;
            _obj.total = _obj.total.toFixed(2);
            console.log("_obj:", _obj)
            that.setData({
              errmsg: '',
              postage: res.data.data.toFixed(2)
            })
            console.log('11:', that.data.postage)
            that.setData({
              current: _obj
            })
          }
        } else {
          that.setData({
            errmsg: res.data.message,
            postage: ''
          })
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
    return
    Api.CostforCoupon(_parms).then((res) => {
      console.log("resrqe:",res)
      if (res.data.code == 0) {
        _obj = this.data.current;
        if (res.data.data) {
          _obj.total = _obj.total * 1 + res.data.data;
          _obj.total = _obj.total.toFixed(2);
          console.log("_obj:", _obj)
          this.setData({
            errmsg: '',
            postage: res.data.data.toFixed(2)
          })
          console.log('11:', this.data.postage)
          this.setData({
            current: _obj
          })
        }
      } else {
        this.setData({
          errmsg: res.data.message,
          postage: ''
        })
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //首次点击兑换
  frestrue: function() {
    if (app.globalData.Express.id) {
      this.setData({
        actaddress: app.globalData.Express
      });
      this.getcalculateCost();
    } else {
      if (app.globalData.userInfo.userId) {
        if (app.globalData.userInfo.mobile) {
          this.getAddressList();
        } else { //是新用户，去注册页面
          // wx.navigateTo({
          //   url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
          // })
        }
      } else {
        this.findByCode();
      }
    }
  },
  //打开地图导
  TencentMap: function () {
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        that.openmap();
        that.requestCityName(latitude, longitude);
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户位置信息
              that.setData({
                isshowlocation: true,
                isshowticode:false
              })
            } else {
              that.openmap();
            }
          }
        })
      }
    })
  },
  openSetting() {//打开授权设置界面
    let that = this;
    that.setData({
      isshowlocation: false
    })
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          village_LBS(that);
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  },
  openmap(){  //打开地图
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude,
          longitude = res.longitude,
          storeDetails = that.data.current.salePoint;
        wx.openLocation({
          longitude: storeDetails.locationX,
          latitude: storeDetails.locationY,
          scale: 18,
          name: storeDetails.shopName,
          address: storeDetails.address,
          success: function (res) {
            console.log('打开地图成功')
          },
          fail: function (res) {
            console.log("打开地图失败")
          }
        })
      }
    })
  },
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    app.globalData.userInfo.lat = lat;
    app.globalData.userInfo.lng = lng;
    if (app.globalData.userInfo.city) {
      
    } else {
      wx.request({
        url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: (res) => {
          if (res.data.status == 0) {
            let _city = res.data.result.address_component.city;
            if (_city == '十堰市' || _city == '武汉市') {
              app.globalData.userInfo.city = _city;
            } else {
              app.globalData.userInfo.city = '十堰市';
            }
            app.globalData.oldcity = app.globalData.userInfo.city;
            app.globalData.picker = res.data.result.address_component;
            let userInfo = app.globalData.userInfo;
            wx.setStorageSync('userInfo', userInfo);
            console.log('userInfo:', userInfo)
          }
        }
      })
    }
  },
  closemodal(){ //关闭弹框
    this.setData({ isshowticode:false});
    this.getorderCoupon();
  },
  //点击立即兑换  1
  submit: function(e) {
    let _formId = e.detail.formId;
    if (app.globalData.userInfo.mobile) { 
      this.getorderCoupon('1');
    } else {//是新用户，去注册页面
      // wx.navigateTo({
      //   url: '/pages/personal-center/securities-sdb/securities-sdb?back=1'
      // })
    }
    Public.addFormIdCache(_formId); 
  },
  //兑换提货  2
  sendredeemNow: function() {
    if (this.data.qtype == 2) {
      if (this.data.ismyqrcode) {
        this.setData({ isshowticode: true });
      } else {
        wx.showToast({
          title: '该提货券已被领取',
          icon: 'none'
        })
      }
      return
    }
    if (!this.data.isfrst) {
      this.setData({
        isfrst: true
      })
      this.frestrue();
    } else {
      if (this.data.errmsg) {
        wx.showToast({
          title: this.data.errmsg,
          icon: 'none'
        })
      } else {
        if (this.data.isconvert) {
          if (this.data.postage) {
            this.wxpayment()
            // this.updataUser();
          } else {
            this.seduseCoupon();
          }
        }
      }
    }
  },
  //执行立即兑换  3
  seduseCoupon: function() {
    let _parms = {}, that = this, _value="";
    console.log('postage:', this.data.postage)
    console.log('remarks:', this.data.remarks)
    _parms = {
        shopId: 0,
        shopName: '享7自营',
        sendTime: this.data.date,
        remark: this.data.remarks,
        id: this.data.current.id,
        // changerId: app.globalData.userInfo.userId,
        // changerName: app.globalData.userInfo.userName,
        sendAmount: this.data.postage
      };
     
    if (this.data.actaddress.id) {
      _parms.couponAddressId = this.data.actaddress.id
    } else {
      wx.showModal({
        title: '提示',
        content: '请选择或添加一个收货地址',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../../../personal-center/shipping/shipping',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return;
    }
    this.setData({
      isconvert: false
    });

    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    wx.request({
      url: that.data._build_url + 'orderCoupon/useCoupon?' + _value,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '兑换成功',
            icon: 'none',
            duration: 3000
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '../../../../pages/personal-center/voucher/exchangeDetails/exchangeDetails?id=' + that.data.current.id,
            })
            this.setData({
              isconvert: true,
              isfrst: false
            })
          }, 1500)
        } else {
          this.setData({
            isconvert: true,
            isfrst: false
          })
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
    return
    Api.useCoupon(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          title: '兑换成功',
          icon: 'none',
          duration: 3000
        })
        setTimeout(() => {
          wx.redirectTo({
            url: '../../../../pages/personal-center/voucher/exchangeDetails/exchangeDetails?id=' + that.data.current.id,
          })
          this.setData({
            isconvert: true,
            isfrst: false
          })
        }, 1500)
      } else {
        this.setData({
          isconvert: true,
          isfrst: false
        })
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //更新用户信息
  updataUser: function() {
    let that = this;
    wx.login({
      success: res => {
        if (res.code) {
          let _parms = {
            code: res.code,
            token: app.globalData.token
          }
          Api.getOpenId(_parms).then((res) => {
            if (res.data.code == 0) {
              app.globalData.userInfo.openId = res.data.data.openId;
              app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
              let _obj = {
                id: app.globalData.userInfo.userId,
                openId: app.globalData.userInfo.openId
              };
              Api.updateuser(_obj).then((res) => {
                if (res.data.code == 0) {
                  that.wxpayment()
                }
              })
            }
          })
        }
      }
    })
  },
  //调起微信支付
  wxpayment: function() {
    let _parms = {}, that = this, _value="",url="",_Url="";
    _parms = {
      orderCouponId: this.data.current.id,
      orderAddressId: this.data.actaddress.id,
      realWeight: this.data.current.goodsSku.realWeight,
      templateId: this.data.current.goodsSku.deliveryTemplateId,
      // userId: app.globalData.userInfo.userId,
      openId: app.globalData.userInfo.openId
    };
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    url = that.data._build_url + 'wxpay/orderCouponForSendAmount?' + _value;
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      method: 'POST',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            payObj: res.data.data
          })
          that.pay();
        } else {
          that.setData({
            isconvert: true
          })
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
  },
  //支付
  pay: function() {
    let _data = this.data.payObj,
      that = this;
    wx.requestPayment({
      'timeStamp': _data.timeStamp,
      'nonceStr': _data.nonceStr,
      'package': _data.package,
      'signType': 'MD5',
      'paySign': _data.paySign,
      success: function(res) {
        that.seduseCoupon();
      },
      fail: function(res) {
        wx.showToast({
          icon: 'none',
          title: '支付取消',
          duration: 3000
        })
      },
      complete: function(res) {
        that.setData({
          issoid: false
        })
      }
    })
  }
})
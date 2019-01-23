import Api from '../../../../utils/config/api.js';
var utils = require('../../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
import canvasShareImg from '../../../../utils/canvasShareImg.js';
var WxParse = require('../../../../utils/wxParse/wxParse.js');
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    issnap: false, //新用户
    isnew: false, //新用户
    showModal: false,
    id: '', //菜id
    picUrl: '',
    sooption: {},
    skuName: '',
    stockNum: '',
    sellNum: '',
    agioPrice: '',
    sellPrice: '',
    shopName: '',
    pattern: '',
    address: '',
    initiator: '', //发起人
    yuaninitiator: '', //发起人
    store_details: [],
    soData: {},
    inData: {},
    newList: [], //邀请新人列表
    timer: null, //倒计时
    countDown: '',
    isEnd: true, //是否结束
    isCreated: false, //是否创建菜品
    btnTxt: '发起邀请', //按钮文字
    peoPleNum: 0, //邀请人数
    article: '',
    actId: '',
    isopenimg: true,
    legends: [{
      name: '有效期',
      info: [
        '购买后3个月内使用有效'
      ]
    }],
    legend: []
  },
  onLoad: function(options) {
    let q = decodeURIComponent(options.q);
    app.globalData.currentScene.path = "pages/index/flashSaleHome/secKillDetail/secKillDetail";
    app.globalData.currentScene.query = options;
    let _this = this,
      _id = '',
      _categoryId='',
      _actId='',
      _shopId = '';
   
    if (q && q != 'undefined') {
      if (utils.getQueryString(q, 'flag') == 4) {
        _id = utils.getQueryString(q, 'id');
        _shopId = utils.getQueryString(q, 'shopId');
        _categoryId = utils.getQueryString(q, 'categoryId');
        _actId = utils.getQueryString(q, 'actId');
      }
      this.setData({
        id: _id,
        shopId: _shopId,
        categoryId: _categoryId,
        actId: _actId
      })
    } else {
      this.setData({
        sooption: options,
        id: options.id,
        shopId: options.shopId,
        initiator: options.initiator ? options.initiator : '', //发起人Id
        actId: options.actId ? options.actId : '',
        categoryId: options.categoryId ? options.categoryId : ''
      })
    }
    this.setData({
      timer: null
    });
    // this.init();
  },
  onShow: function() {
    this.init();
  },
  init(){
    let _this = this,
      that = this;
    clearInterval(_this.data.timer);
    this.setData({
      timer: null
    });

    if (app.globalData.userInfo.userId) {
      if (app.globalData.newcomer == 1) {
        // this.inviteNewUser();
        _this.authlogin();
      } else {
        if (app.globalData.userInfo.mobile) {
          if (app.globalData.token) {
            _this.shopDetail();
            _this.getDish(); //查询菜详情
            _this.isCreateFunc();
          } else {
            _this.authlogin();
          }
        } else { //是新用户，
          let _actId = this.data.actId ? this.data.actId : 44;
          wx.navigateTo({
            url:'/pages/init/init'
          })
        }
      }

    } else {
      _this.findByCode();
    }
  },
  onHide() {
    let _this = this;
    clearInterval(_this.data.timer);
    this.setData({
      timer: null
    });
  },
  onUnload() {
    let _this = this;
    clearInterval(_this.data.timer);
    this.setData({
      timer: null
    });
  },
  understand: function() {
    this.setData({
      showModal: !this.data.showModal
    })
  },
  seebigImg: function (e) {
    let that = this;
    let currentImg = e.currentTarget.dataset.img;
    let urls = [];
    for (let i = 0; i < that.data.soData.attachments.length; i++) {
      urls.push(that.data.soData.attachments[i].picUrl)
    }
    wx.previewImage({
      urls: urls,
      current: currentImg
    })
  },
  onPullDownRefresh: function() { //下拉刷新
    this.isCreateFunc();
  },
  //通过code查询进入的用户信息，判断是否是新用户
  findByCode: function() {
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            if (data.id) {
              app.globalData.userInfo.userId = data.id;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              }
              if (!data.mobile) { //是新用户，去注册页面
                let _actId = this.data.actId ? this.data.actId : 44;
                wx.reLaunch({
                  url: '/pages/init/init',
                })
              } else {
                that.authlogin();
              }
            } else {
              let _actId = this.data.actId ? this.data.actId : 44;
              wx.reLaunch({
                url: '/pages/init/init',
              })
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  //获取token
  authlogin: function(val) {
    let that = this;
    wx.request({
      url: this.data._build_url + 'auth/login?userName=' + app.globalData.userInfo.userName,
      method: "POST",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          that.shopDetail();
          that.getDish(); //查询菜详情
          that.isCreateFunc();
          if (app.globalData.newcomer == 1) {
            that.inviteNewUser();
          }
        }
      }
    })
  },
  //查询菜
  getDish() {
    let that = this,
      _parms = {},
      _Url = "",
      _value = '';
    _parms = {
      Id: this.data.id,
      shopId: this.data.shopId
    };
    if (app.globalData.userInfo.lng) {
      _parms.ocationX = app.globalData.userInfo.lng;
    }
    if (app.globalData.userInfo.lat) {
      _parms.locationY = app.globalData.userInfo.lat;
    }
    if (that.data.actId) {
      _parms.actId = this.data.actId
    } else {
      _parms.zanUserId = app.globalData.userInfo.userId
    }
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    if (this.data.actId) {
      _Url = this.data._build_url + 'goodsSku/selectDetailBySkuIdNew?' + _value;
    } else {
      _Url = this.data._build_url + 'sku/getQgc?' + _value;
    }
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'GET',
      success: function(res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0 && res.data.data) {
          let data = res.data.data,
            _RegExp = new RegExp('<p.*?>(.*?)<\/p>', 'i'),
            skuInfo = '',
            pattern = '',
            article = '',
            arr = that.data.legends,
            obj = {
              name: '使用规则',
              info: []
            };
          if (data.skuInfo) {
            skuInfo = data.skuInfo;
            skuInfo = skuInfo ? '1个小时内完成邀请并成功购买，逾期失效Œ' + skuInfo : '1个小时内完成邀请并成功购买，逾期失效';
            if (skuInfo.indexOf("Œ") != -1) {
              skuInfo = skuInfo.split('Œ');
              obj.info = skuInfo;
            } else {
              obj.info.push(skuInfo);
            }
            arr.push(obj);
            if (arr.length > 2) {
              arr.splice(1, 1);
            }
            that.setData({
              legend: arr
            })
          } else if (data.actGoodsSkuOut && data.actGoodsSkuOut.ruleDesc) {
            skuInfo = data.actGoodsSkuOut.ruleDesc;
            if (skuInfo.indexOf("Œ") != -1) {
              skuInfo = skuInfo.split('Œ');
              obj.info = skuInfo;
            } else {
              obj.info.push(skuInfo);
            }
            arr.push(obj);
            if (arr.length > 2) {
              arr.splice(1, 1);
            }
            that.setData({
              legend: arr
            })
          } else {
            that.setData({
              legend: that.data.legends
            })
          }
          if (data.goodsSpuOut && data.goodsSpuOut.goodsSpuDesc && data.goodsSpuOut.goodsSpuDesc.content) {
            article = data.goodsSpuOut.goodsSpuDesc.content;
            WxParse.wxParse('article', 'html', article, that, 0);
          }
          let imgUrl = data.picUrl ? data.picUrl : data.skuPic,
            _agioPrice = data.agioPrice ? data.agioPrice : data.actGoodsSkuOut.goodsPromotionRules.actAmount,
            _stockNum = '';
          if (data.actGoodsSkuOut && data.actGoodsSkuOut.skuId) {
            _stockNum = data.actGoodsSkuOut.stockNum
          } else {
            _stockNum = data.stockNum
          }
          try {
            if (data.attachments && data.attachments.length) {
              var obj = {};
              obj.picUrl = data.picUrl ? data.picUrl : data.skuPic;
              data.attachments.unshift(obj)
            } else {
              var obj = {};
              obj.picUrl = data.picUrl ? data.picUrl : data.skuPic;
              data.attachments = [];
              data.attachments.push(obj)
            }
          } catch (err) { }
          that.setData({
            pattern: pattern,
            soData: data,
            picUrl: imgUrl,
            skuName: data.skuName,
            stockNum: _stockNum,
            agioPrice: _agioPrice,
            sellPrice: data.sellPrice,
            sellNum: data.sellNum
          });
          //自定义分享图片中 绘制价格   公共方法utils.js/canvasShareImg.js  调用方法canvasShareImg()
          // parameter
          canvasShareImg(imgUrl, _agioPrice, data.sellPrice).then(function(res) {
            that.setData({
              shareImg: res
            })
          })
        }
      }
    })
  },
  //打开地图，已授权位置
  openmap: function() {
    let that = this,
      storeDetails = that.data.store_details;
    wx.openLocation({
      longitude: storeDetails.locationX,
      latitude: storeDetails.locationY,
      scale: 18,
      name: storeDetails.shopName,
      address: storeDetails.address,
      success: function(res) {},
      fail: function(res) {}
    })
  },
  // 电话号码功能
  calling: function() {
    let that = this,
      tell = "";
    tell = that.data.store_details.phone ? that.data.store_details.phone : that.data.store_details.mobile;
    if (tell) {
      wx.makePhoneCall({
        phoneNumber: tell,
        success: function() {
          console.log("拨打电话成功！")
        },
        fail: function() {
          console.log("拨打电话失败！")
        }
      })
    } else {
      wx.showToast({
        title: '商家没有设置联系电话',
      })
    }
  },
  //判断之前是否创建过，并查看邀请了多少人注册
  isCreateFunc() {
    let _parms = {}, _Url = "", _value="",that=this;
    _parms = {
      skuId: this.data.id,
      parentId: app.globalData.userInfo.userId
    };
    if(this.data.actId){
      _parms.actId= this.data.actId;
    }
    for (var key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    if (this.data.actId) {
      _Url = this.data._build_url + 'user/getGoodsSkuAndUserList?' + _value;
    } else {
      _Url = this.data._build_url + 'user/getNewUser?' + _value;
    }
    _Url = encodeURI(_Url);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let isCreated = false;
          if (res.data.data.length > 0 && res.data.data[0]) {
            isCreated = true;
            let data = res.data.data,
              newList = data[0].newUser ? data[0].newUser : [];
            if (newList.length > 2) {
              newList = newList.slice(0, 2);
            }
            that.getUserIcon(newList);
            that.setData({
              peoPleNum: data[0].peoPleNum ? data[0].peoPleNum : 0,
              btnTxt: '邀请好友'
            });
            that.countDownFunc(data[0].endTime);
          }
          that.setData({
            inData: res.data.data,
            isCreated: isCreated
          });
        }
      }
    });



    return
    Api.inviteNum(_parms).then((res) => {
      wx.stopPullDownRefresh();
      if (res.data.code == 0) {
        let isCreated = false;
        if (res.data.data.length > 0 && res.data.data[0]) {
          isCreated = true;
          let data = res.data.data,
            newList = data[0].newUser ? data[0].newUser : [];
          if (newList.length > 2) {
            newList = newList.slice(0, 2);
          }
          this.getUserIcon(newList);
          this.setData({
            peoPleNum: data[0].peoPleNum ? data[0].peoPleNum : 0,
            btnTxt: '邀请好友'
          });
          this.countDownFunc(data[0].endTime);
        }
        this.setData({
          inData: res.data.data,
          isCreated: isCreated
        });
      }
    })
  },
  //点击查看图文详情
  clickopen: function() {
    this.setData({
      isopenimg: !this.data.isopenimg
    })
  },
  //查询商家信息
  shopDetail() {
    let _this = this;
    wx.request({
      url: _this.data._build_url + 'shop/get/' + _this.data.shopId,
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0 && res.data.data) {
          let data = res.data.data;
          _this.setData({
            store_details: data,
            shopName: data.shopName,
            address: data.address
          });
        }
      }
    });
  },
  //发起秒杀菜
  createSecKill() {
    let _parms = {
      parentId: app.globalData.userInfo.userId,
      skuId: this.data.id,
      shopId: this.data.shopId,
      actId: this.data.actId,
      token: app.globalData.token
    };
    Api.createSecKill(_parms).then((res) => {
      if (res.data.code == 0 && res.data.data) {
        wx.showToast({
          title: '发起成功，快去邀请好友参与秒杀吧',
          icon: 'none',
          duration: 3000
        })
        this.setData({
          isCreated: true,
          btnTxt: '邀请好友'
        });
        this.countDownFunc(res.data.data.endTime);
        // this.onShareAppMessage();
      }
    })
  },
  //倒计时回调
  countDownFunc(endTime) {
    endTime = endTime.replace(/-/g, '/');
    let miliEndTime = new Date(endTime).getTime(),
      miliNow = new Date().getTime();
    if (miliEndTime > miliNow) {
      let minus = Math.floor((miliEndTime - miliNow) / 1000),
        hours = '',
        minutes = '',
        seconds = '',
        countDown = '',
        _this = this;
      this.setData({
        timer: setInterval(function() {
          if (minus == 0) {
            _this.setData({
              countDown: '',
              isEnd: true
            });
            minus = 0;
            clearInterval(_this.data.timer);
          } else {
            hours = Math.floor(minus / 3600); //时
            minutes = Math.floor(minus / 60); //分
            seconds = minus % 60; //秒
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            countDown = minutes + ':' + seconds;
            _this.setData({
              countDown: countDown,
              isEnd: false
            });
            minus--;
          }
        }, 1000)
      });
    }
  },
  getUserIcon(obj) { //获取用户头像
    let userArr = obj,
      _this = this;
    if (userArr && userArr[0]) {
      for (let i = 0; i < userArr.length; i++) {
        wx.request({ //从自己的服务器获取用户信息
          url: _this.data._build_url + 'user/get/' + userArr[i].id,
          header: {
            "Authorization": app.globalData.token
          },
          success: function(res) {
            wx.stopPullDownRefresh();
            if (res.data.code == 0) {
              if (res.data.data && res.data.data.iconUrl) {
                userArr[i].iconUrl = res.data.data.iconUrl;
                _this.setData({
                  newList: userArr
                });
              }
            }
          }
        })
      }
    }
  },
  toBuy() { //买菜
    let _this = this;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    if (this.data.stockNum <= 0) {
      wx.showToast({
        title: '该菜品已售罄',
        icon: 'none'
      })
      return false;
    }

    if (this.data.peoPleNum >= 2) {
      let sellPrice = this.data.agioPrice; //折后价

      let _soData = this.data.soData,
        _inData = this.data.inData[0];

      wx.navigateTo({
        url: '/pages/index/crabShopping/crabDetails/submitOrder/submitOrder?num=1&issku=3&flag=5&picUrl=' + _soData.skuPic + '&sellPrice=' + sellPrice + '&id=' + this.data.id + '&actId=' + this.data.actId + '&skuName=' + _soData.skuName + '&remark=' + _soData.remark + '&shopId=' + _soData.shopId + '&singleType=' + _soData.singleType + '&spuId=' + _soData.spuId + '&totleKey=' + _inData.totleKey + '&valueKey=' + _inData.valueKey
      })
    } else if (!this.data.isCreated) {
      wx.showModal({
        title: '是否发起邀请',
        complete(res) {
          if (res.confirm) {
            _this.createSecKill();
          }
        }
      })
    } else if (this.data.isCreated && this.data.peoPleNum < 2) {
      wx.showToast({
        title: '邀请2个新用户注册1元钱享美食,快去邀请吧',
        icon: 'none',
        duration: 3000
      });
    }
  },
  //跳转至商家主页
  toShopDetail() {
    wx.navigateTo({
      url: '../../merchant-particulars/merchant-particulars?shopid=' + this.data.shopId
    })
  },

  // 左下角返回首页
  returnHomeArrive: function() {
    wx.switchTab({
      url: '../../index',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  inviteOthers() { //点击邀请好友
    if (this.data.stockNum <= 0) {
      wx.showToast({
        title: '该菜品已售罄',
        icon: 'none'
      })
    } else {
      this.setData({
        yuaninitiator: this.data.initiator ? this.data.initiator : app.globalData.userInfo.userId
      })
      if (this.data.isCreated) {
        this.onShareAppMessage();
      } else {
        //创建一个秒杀菜
        this.createSecKill();
      }
    }
  },
  inviteNewUser() { //邀请新用户参与秒杀
    let _parms = {},
      that = this,
      url = "",
      _Url = "",
      _value = "";
    // let _actId = this.data.actId ? this.data.actId : 44;
    _parms = {
      parentId: that.data.initiator,
      skuId: that.data.id,
      shopId: that.data.shopId,
      newUser: app.globalData.userInfo.userId,
      token: app.globalData.token
    };
    if(this.data.actId){
      _parms.actId = this.data.actId;
    }
    for (let key in _parms) {
      _value += key + "=" + _parms[key] + "&";
    }
    _value = _value.substring(0, _value.length - 1);
    if(this.data.actId){
      url = that.data._build_url + 'user/updatePeopleNumNew?' + _value;
    }else{
      url = that.data._build_url + 'user/upPeopleNum?' + _value;
    }
   
    _Url = encodeURI(url);
    wx.request({
      url: _Url,
      header: {
        "Authorization": app.globalData.token
      },
      method: 'POST',
      success: function(res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          app.globalData.newcomer = 2;
        }
      }
    })
  },
  //分享给好友
  onShareAppMessage: function() {
    let that = this,
      _initiator = app.globalData.userInfo.userId,
      shareUrl = '';
    shareUrl = '/pages/index/flashSaleHome/secKillDetail/secKillDetail?back=1&initiator=' + _initiator + '&shopId=' + that.data.shopId + '&id=' + that.data.id + '&categoryId=' + that.data.categoryId;
    if (that.data.actId) {
      shareUrl += '&actId=' + that.data.actId
    };
    return {
      title: "2人秒杀仅需1元钱，" + that.data.skuName,
      imageUrl: that.data.shareImg,
      path: shareUrl,
      success: function(res) {

      },
      fail: function(res) {

      }
    }
  }
})
import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    issnap: false, //新用户
    isnew: false, //新用户
    // indicatorDots: true,  //是否显示面板指示点
    autoplay: true, //是否自动切换
    interval: 5000, //自动切换时间间隔
    duration: 1000, //滑动动画时长
    inputShowed: false,
    isguige: true, //是否点击规格详情
    isisbut: false, //是否显示底按钮
    issku: false, //是否是送货到家的菜
    isspecifi: false,
    inputVal: "",
    num: 1, //数量默认是1
    id: '', //商品id
    spuId: '', //判断是礼盒装还是斤装
    minusStatus: 'disabled', // 使用data数据对象设置样式名
    page: 1,
    _ruleDesc: '',
    specificationData: [],
    dhcListData: [],
    store_details: {},
    SelectedList: {},
    isAct: 0,
    city: '',
    shopId: '',
    greensID: '',
    isShop: false,
    array: [
      {
        placeName: '产地',
        place: '阳澄湖'
      },
      {
        placeName: '包装',
        place: '礼盒装'
      },
      {
        placeName: '规格',
        place: ''
      },
      {
        placeName: '邮费',
        place: '到付'
      }
    ],
    crabImgUrl: [], // 详情图列表
    ruleImg: '',
    legined: [
      {
        p1: '正品保障',
        p2: '正宗阳澄湖大闸蟹，上海直发，所有阳澄湖大闸蟹均由阳澄湖核心产区直供,只只佩戴防伪指环'
      }, {
        p1: '顺丰快递',
        p2: '顺丰极速送达'
      }, {
        p1: '发货时间',
        p2: '24小时之内发货,如果当天17：00后下单，从第二天开始计算'
      }
    ]
  },

  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...'
    })

    let _id = '',
      _spuId = '',
      _shopId = '',
      _greensID = '',
      isShop = false;
    let _crabImgUrl = [],
      _ruleImg = '',
      that = this;
    if (options.id) {
      _id = options.id;
    }
    if (options.spuId) {
      _spuId = options.spuId;
    }
    if (options.greensID) {
      _greensID = options.greensID;
      this.setData({
        issku: true,
        num: 2
      })
    } else {
      this.setData({
        issku: false
      })
    }
    if (options.shopId) {
      _shopId = options.shopId;
    }
    if (options.isShop) {
      isShop = options.isShop;
    }
    this.setData({
      id: _id ? _id : this.data.id,
      spuId: _spuId ? _spuId : this.data.spuId,
      shopId: _shopId ? _shopId : this.data.shopId,
      greensID: _greensID ? _greensID : this.data.greensID,
      isShop: isShop
    })


  },

  onShow: function() {
    let that = this;
    if (app.globalData.userInfo.userId) {
      if (app.globalData.userInfo.mobile) {
        if (app.globalData.token) {
          this.getTXT();
          this.crabInit();
        } else {
          this.authlogin();
        }
      } else {
        this.authlogin();
      }
    } else {
      this.findByCode();
    }
    // console.log(app.globalData)
  },
  findByCode: function () { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            app.globalData.userInfo.userId = data.id;
            for (let key in data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = data[key]
                }
              }
            }
            that.authlogin();//获取token
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
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          let _token = 'Bearer ' + res.data.data;
          app.globalData.token = _token;
          console.log("crab__token:", _token);
          that.getTXT();
          if (app.globalData.userInfo.mobile) {
            // that.getTXT();
          } 
        }
      }
    })
  },
  //初始化
  getTXT:function(){
    let _crabImgUrl = [],
      _ruleImg = '',
      that = this;
    app.globalData.Express = {};
    if (app.globalData.txtObj.crabImgUrl){
      _crabImgUrl = app.globalData.txtObj.crabImgUrl, _ruleImg = app.globalData.txtObj.ruleImg;
      that.setData({
        crabImgUrl: _crabImgUrl,
        ruleImg: _ruleImg
      })
      that.crabInit();
    }else{
      wx.request({
        url: this.data._build_url + 'version.txt',
        header: {
          "Authorization": app.globalData.token
        },
        success: function (res) {
          app.globalData.txtObj = res.data;
          _crabImgUrl = app.globalData.txtObj.crabImgUrl, _ruleImg = app.globalData.txtObj.ruleImg;
          that.setData({
            crabImgUrl: _crabImgUrl,
            ruleImg: _ruleImg
          })
          that.crabInit();
        }
      })
    }
  },
  crabInit: function() {
    console.log("crabInit")
    console.log('issku:', this.data.issku)
    if (this.data.issku) {
      let _crabImgUrl = this.data.crabImgUrl,
        _ruleImg = this.data.ruleImg;
      _crabImgUrl = _crabImgUrl.slice(2);
      _crabImgUrl.pop();
      _crabImgUrl.unshift(_ruleImg);
      this.setData({
        crabImgUrl: _crabImgUrl
      })
      this.bargainDetails();
    } else {
      this.getDetailBySkuId();
    }
  },
  bargainDetails: function() { //品质好店-->店铺详情--列表
    console.log('bargainDetails')
    let that = this, _array = [];
    // if (!app.globalData.userInfo.mobile) {
    //   wx.hideLoading();
    //   wx.navigateTo({
    //     url: '../../../../pages/personal-center/securities-sdb/securities-sdb?back=1'
    //   })
    // }else{
      let _parms = {
        shopId: this.data.shopId,
        zanUserId: app.globalData.userInfo.userId,
        isDeleted: 0,
        page: this.data.page,
        rows: 20,
        token: app.globalData.token
      };
      Api.dhcList(_parms).then((res) => { //列表
        console.log('dhcList:', res)
        wx.hideLoading();
        if (res.data.code == 0 && res.data.data.list) {
          let _obj = res.data.data.list[0];
          this.setData({
            SelectedList: _obj,
            shopId: _obj.shopId
          })
          if (_obj.shopId) {
            this.getShopInfo()
          }
          if (this.data.isShop) {
            let array = this.data.array;
            array[1].placeName = '品牌';
            array[1].place = '万蟹楼';
            array[2].place = _obj.skuName;
            array = array.slice(0, 3);
            this.setData({
              array: array
            });
          }
        }
      })
    // }
    
    
  },
  //查询商品朝夕相处列表 即同一商品不同规格列表
  geSkutlist: function() {
    let that = this,
      _parms = {},
      _array = [];
    if (!this.data.isspecifi) {
      _parms = {
        spuType: 10,
        page: this.data.page,
        rows: 20,
        spuId: this.data.spuId,
        token: app.globalData.token
      };
      Api.crabList(_parms).then((res) => { //查询同类规格列表
        if (res.data.code == 0) {
          let _list = res.data.data.list;
          let _obj = _list[0];
          for (let i = 0; i < _list.length; i++) {
            if (that.data.id == _list[i].id) {
              that.getDetailBySkuId();
            }
          }
          this.setData({
            specificationData: _list,
            isspecifi: true
          })
        }
      });
    }
    
    
  },
  //查询单个详情
  getDetailBySkuId: function(val) {
    console.log("getDetailBySkuId:")
    let _array = [],
      that = this,
      _crabImgUrl = this.data.crabImgUrl,
      _parms = {},
      _ruleImg = this.data.ruleImg;
    wx.hideLoading();
    if (this.data.isAct && !val) {
      console.log("isAct:")
    }else{
      _parms = {
        id: this.data.id,
        token: app.globalData.token
      }
      Api.DetailBySkuId(_parms).then((res) => {
        console.log("getDetailBySkuId:", res)
        if (res.data.code == 0) {
          let _obj = res.data.data,
            _crabImgUrl = this.data.crabImgUrl;
          for (let i = 0; i < _obj.goodsPromotionRules.length; i++) {
            if (_obj.goodsPromotionRules[i].ruleType == 2) {
              this.setData({
                _ruleDesc: _obj.goodsPromotionRules[i].ruleDesc
              })
            }
          };
          _array = this.data.array;
          if (_obj.spuId == 1 || _obj.spuId == 3) {
            _array[1].place = '散装';
            _array[3].place = '根据实际重量与发货距离,以物流公司统一计算价格为准';
            if (_obj.spuId == 3) {
              _array[1].place = '礼盒装';
            } else {
              _crabImgUrl = _crabImgUrl.slice(2);
            }
          } else if (_obj.spuId == 2) {
            _array[1].place = '礼盒装';
            _array[3].place = '顺丰包邮';
          }
          _array[2].place = _obj.skuName;


          let _arr = [];
          _arr.push(_obj);
          this.setData({
            SelectedList: _obj,
            specificationData: _arr,
            isAct: _obj.id,
            array: _array,
            crabImgUrl: _crabImgUrl,
            spuId: _obj.spuId
          })

          // this.geSkutlist();
        }
      })
    }
    
    
  },
  //弹窗里同种类选择不同规格
  chooseLike: function(e) {
    let id = e.currentTarget.id;
    this.setData({
      isAct: id,
      id: id
    });
    this.getDetailBySkuId('val');
  },
  //查询商家详情
  getShopInfo: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'shop/get/' + this.data.shopId,
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == 0) {
          let _data = res.data.data;
          if (_data) {
            _data.popNum = utils.million(_data.popNum);
            if (_data.address.indexOf('-') > 0) {
              _data.address = _data.address.replace(/-/g, "");
            }
            that.setData({
              store_details: _data,
              city: _data.city
            })
          }
        }
      }
    })
  },
  //点击商家主页面按钮，跳转到商家详情页
  handshopHome: function(e) {
    const shopid = e.currentTarget.id;
    wx.navigateTo({
      url: '../../merchant-particulars/merchant-particulars?shopid=' + shopid + '&flag=1'
    })
  },
  //打开地图导航
  openMap: function() {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        let storeDetails = that.data.store_details;
        wx.openLocation({
          longitude: storeDetails.locationX,
          latitude: storeDetails.locationY,
          scale: 18,
          name: storeDetails.shopName,
          address: storeDetails.address,
          success: function(res) {
            // console.log('打开地图成功')
          }
        })
      }
    })
  },

  //发起砍价
  initiateCut: function() {
    if (!app.globalData.userInfo.mobile) {
      wx.navigateTo({
        url: '../../../../pages/personal-center/securities-sdb/securities-sdb?back=1'
      })
    }else{
      let _parms = {
        // userId: app.globalData.userInfo.userId,
        skuId: this.data.SelectedList.id,
        token: app.globalData.token
      };
      Api.vegetables(_parms).then((res) => {
        if (res.data.code == 0) {
          if (res.data.data.length > 0) {
            this.setData({
              isbargain: true
            });
            this.toBargainList();
          } else {
            wx.navigateTo({
              url: 'crabShare/crabShare?refId=' + this.data.SelectedList.id + '&shopId=' + this.data.SelectedList.shopId + '&skuMoneyMin=' + this.data.SelectedList.agioPrice + '&skuMoneyOut=' + this.data.SelectedList.sellPrice
            })
          }
        }
      });
    }
    
  },
  //点击跳转至砍价列表
  toBargainList() {
    wx.showModal({
      title: '您已发起了砍价，是否查看状态',
      content: '',
      complete(e) {
        if (e.confirm) {
          wx.navigateTo({
            url: '../../bargainirg-store/pastTense/pastTense'
          });
        }
      }
    })
  },
  //显弹出框
  showModal: function() {
    let that = this;
    var animation = wx.createAnimation({ // 显示遮罩层
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation;
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true,
      isguige: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200);
  },
  //查询保证--显弹出框
  showmodalbz: function() {
    let that = this;
    const animation = wx.createAnimation({ // 显示遮罩层
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation;
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true,
      isguige: false,
      isbut: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200);
  },
  //隐藏对话框
  hideModal: function() {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      isbut: false
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },


  //分享给好友
  onShareAppMessage: function() {
    let userInfo = app.globalData.userInfo;
    if (this.data.issku) {
      return {
        title: this.data.SelectedList.skuName,
        path: '/pages/index/crabShopping/crabDetails/crabDetails?shopId=' + this.data.shopId + '&greensID=' + this.data.greensID + '&isShop=' + this.data.isShop,
        success: function(res) {}
      }
    } else {
      return {
        title: this.data.SelectedList.skuName,
        path: '/pages/index/crabShopping/crabDetails/crabDetails?spuId=' + this.data.spuId + '&id=' + this.data.SelectedList.id,
        success: function(res) {}
      }
    }
  },

  /* 点击减号地增减数量 */
  bindMinus: function() {
    let num = this.data.num;
    if (this.data.issku) {
      return
    }
    if (num > 1) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 点击加号 */
  bindPlus: function() {
    let num = this.data.num;
    if (this.data.issku) {
      return
    }
    num++;
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 输入框事件 */
  bindManual: function(e) {
    var num = e.detail.value;
    this.setData({
      num: num
    });
  },
  //立即购买
  originalPrice: function() {
    let _num = this.data.num,
      _issku = this.data.issku ? 1 : 2,
      _shopId = this.data.SelectedList.shopId;
    if (!app.globalData.userInfo.mobile) {
      wx.navigateTo({
        url: '../../../../pages/personal-center/securities-sdb/securities-sdb?back=1'
      })
    } else {
      if (!this.data.showModalStatus) {
        this.showModal();
      } else {
        this.setData({
          showModalStatus: false
        });
        wx.navigateTo({
          url: 'submitOrder/submitOrder?spuId=' + this.data.spuId + '&id=' + this.data.id + '&num=' + _num + '&issku=' + _issku + '&shopId=' + _shopId
        })
      }

    }
  },
  //点击弹框按钮
  closetel: function(e) {
    let id = e.target.id;
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  },

  // 左下角返回首页
  returnHomeArrive: function() {
    wx.switchTab({
      url: '../../index',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  }

})
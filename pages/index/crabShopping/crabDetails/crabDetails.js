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
    isguige: true,//是否点击规格详情
    isisbut: false,  //是否显示底按钮
    issku: false,//是否是送货到家的菜
    isspecifi: false,
    inputVal: "",
    num: 1, //数量默认是1
    id: '', //商品id
    spuId: '', //判断是礼盒装还是斤装
    minusStatus: 'disabled', // 使用data数据对象设置样式名
    page: 1,
    _ruleDesc:'',
    specificationData: [],
    dhcListData: [],
    store_details: {},
    SelectedList: {},
    isAct: 0,
    city: '',
    shopId: '',
    greensID: '',
    isShop: false,
    array: [{
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
    crabImgUrl: [],// 详情图列表
    legined: [
      {
        p1: '正品保障',
        p2: '正品保障，正宗阳澄湖到付'
      }, {
        p1: '顺丰快递',
        p2: '顺丰极速送达'
      }, {
        p1: '发货时间',
        p2: '24小时之内发货'
      },
    ]
  },

  onLoad: function (options) {
    console.log('optons:', options)

    let _id = '', _spuId = '', _shopId = '', _greensID = '', isShop = false;

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

  onShow: function () {
    wx.request({
      url: this.data._build_url + 'version.txt',
      success: function (res) {
        app.globalData.txtObj = res.data;
      }
    });
    let _crabImgUrl = app.globalData.txtObj.crabImgUrl, _ruleImg = app.globalData.txtObj.ruleImg;
    this.setData({
      crabImgUrl: _crabImgUrl
    })
    if (this.data.issku) {
      this.bargainDetails();
      _crabImgUrl = this.data.crabImgUrl;
      _crabImgUrl.shift();
      _crabImgUrl.shift();
      _crabImgUrl.pop();
      _crabImgUrl.unshift(_ruleImg);

      this.setData({
        crabImgUrl: _crabImgUrl
      })
    } else {
      // if (this.data.spuId) {
      //   this.geSkutlist();
      // } else {
      this.getDetailBySkuId();
      // }
    }

    if (this.data.shopId) {
      this.getShopInfo();
    }
  },

  bargainDetails: function () {   //品质好店-->店铺详情--列表
    if (!app.globalData.userInfo.mobile) {
      wx.navigateTo({
        url: '../../../../pages/personal-center/securities-sdb/securities-sdb?back=1'
      })
      return false
    }
    let that = this, _array = [];
    let _parms = {
      shopId: this.data.shopId,
      zanUserId: app.globalData.userInfo.userId,
      isDeleted: 0,
      page: this.data.page,
      rows: 20,
    };
    Api.dhcList(_parms).then((res) => {  //列表
      if (res.data.code == 0 && res.data.data.list) {
        let _obj = res.data.data.list[0];
        this.setData({
          SelectedList: _obj
        })
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
  },
  //查询商品朝夕相处列表 即同一商品不同规格列表
  geSkutlist: function () {

    if (this.data.isspecifi) { return }
    let that = this, _array = [];
    let _parms = {
      spuType: 10,
      page: this.data.page,
      rows: 20,
      spuId: this.data.spuId
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
  },
  //查询单个详情
  getDetailBySkuId: function (val) {
    if (this.data.isAct && !val) { return }
    let _array = [], that = this;
    Api.DetailBySkuId({ id: this.data.id }).then((res) => {
      if (res.data.code == 0) {
        let _obj = res.data.data, _crabImgUrl = this.data.crabImgUrl;
        for (let i = 0; i < _obj.goodsPromotionRules.length;i++){
          if (_obj.goodsPromotionRules[i].ruleType == 2){
            this.setData({
              _ruleDesc: _obj.goodsPromotionRules[i].ruleDesc
            })
          }
        };
        console.log('_ruleDesc:', this.data._ruleDesc)
        _array = this.data.array;
        if (_obj.spuId == 1) {
          _array[1].place = '散装';
          if (_crabImgUrl.length > 8) {
            _crabImgUrl.shift();
            _crabImgUrl.shift();
            that.setData({
              crabImgUrl: _crabImgUrl
            })
          }
        } else if (_obj.spuId == 2) {
          _array[1].place = '礼盒装';
        }
        _array[2].place = _obj.skuName;
        let _arr = [];
        _arr.push(_obj);
// 
        this.setData({
          SelectedList: _obj,
          specificationData: _arr,
          isAct: _obj.id,
          array: _array,
          spuId: _obj.spuId
        })
        // this.geSkutlist();
      }
    })
  },
  //弹窗里同种类选择不同规格
  chooseLike: function (e) {
    let id = e.currentTarget.id;
    this.setData({
      isAct: id,
      id: id
    });
    this.getDetailBySkuId('val');
  },
  //查询商家详情
  getShopInfo: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'shop/get/' + this.data.shopId,
      header: {
        'content-type': 'application/json;Authorization'
      },
      success: function (res) {
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
  handshopHome: function (e) {
    const shopid = e.currentTarget.id;
    wx.navigateTo({
      url: '../../merchant-particulars/merchant-particulars?shopid=' + shopid + '&flag=1'
    })
  },
  //打开地图导航
  openMap: function () {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        let storeDetails = that.data.store_details;
        wx.openLocation({
          longitude: storeDetails.locationX,
          latitude: storeDetails.locationY,
          scale: 18,
          name: storeDetails.shopName,
          address: storeDetails.address,
          success: function (res) {
            console.log('打开地图成功')
          }
        })
      }
    })
  },

  //发起砍价
  initiateCut: function () {
    if (!app.globalData.userInfo.mobile) {
      wx.navigateTo({
        url: '../../../../pages/personal-center/securities-sdb/securities-sdb?back=1'
      })
      return false
    }
    let _parms = {
      userId: app.globalData.userInfo.userId,
      skuId: this.data.SelectedList.id
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
  showModal: function () {
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
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200);
  },
  //查询保证--显弹出框
  showmodalbz: function () {
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
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200);
  },
  //隐藏对话框
  hideModal: function () {
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
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },


  //分享给好友
  onShareAppMessage: function () {
    let userInfo = app.globalData.userInfo;
    if (this.data.issku) {
      return {
        title: this.data.SelectedList.skuName,
        path: '/pages/index/crabShopping/crabDetails/crabDetails?shopId=' + this.data.shopId + '&greensID=' + this.data.greensID + '&isShop=' + this.data.isShop,
        success: function (res) { }
      }
    } else {
      return {
        title: this.data.SelectedList.skuName,
        path: '/pages/index/crabShopping/crabDetails/crabDetails?spuId=' + this.data.spuId + '&id=' + this.data.SelectedList.id,
        success: function (res) { }
      }
    }
  },

  /* 点击减号地增减数量 */
  bindMinus: function () {
    let num = this.data.num;
    if (this.data.issku) { return }
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
  bindPlus: function () {
    let num = this.data.num;
    if (this.data.issku) { return }
    num++;
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var num = e.detail.value;
    this.setData({
      num: num
    });
  },
  //立即购买
  originalPrice: function () {
    let _num = this.data.num, _issku = this.data.issku ? 1 : 2, _shopId = this.data.SelectedList.shopId;
    
    console.log('useriinfo:', app.globalData.userInfo);
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
  closetel: function (e) {
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
  returnHomeArrive: function () {
    wx.switchTab({
      url: '../../index',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }

})
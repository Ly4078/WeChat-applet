import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    // indicatorDots: true,  //是否显示面板指示点
    autoplay: true, //是否自动切换
    interval: 5000, //自动切换时间间隔
    duration: 1000, //滑动动画时长
    inputShowed: false,
    isguige:true,//是否点击规格详情
    isisbut:false,  //是否显示底按钮
    issku:false,//是否是送货到家的菜
    inputVal: "",
    num: 1, //数量默认是1
    id: '', //商品id
    spuId: '', //判断是礼盒装还是斤装
    minusStatus: 'disabled', // 使用data数据对象设置样式名
    page: 1,
    specificationData: [],
    dhcListData: [],
    store_details:{},
    SelectedList:{},
    isAct:0,
    city:'',    
    shopId: '',
    greensID: '',
    array: [{
        placeName: '产地',
        place: '阳澄湖'
      },
      {
        placeName: '包装',
        place: '礼盒装'
      },
      {
        placeName: '数量',
        place: '8只'
      },
      {
        placeName: '邮费',
        place: '到付'
      }
    ],
    photograph: [
      {
      print: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=666433332,3038005955&fm=26&gp=0.jpg'
      }, {
      print: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=666433332,3038005955&fm=26&gp=0.jpg'
      }, {
      print: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=666433332,3038005955&fm=26&gp=0.jpg'
    }],
    legined:[
      {
        p1:'正品保障',
        p2:'正品保障，正宗阳澄湖到付'
      }, {
        p1: '邮费到付',
        p2: '不包邮、邮费到付'
      }, {
        p1: '顺丰快递',
        p2: '顺风极速送达'
      }, {
        p1: '24小时发货',
        p2: '24小时发货'
      },
    ]
  },

  onLoad: function(options) {
    console.log('optons:',options)
    let _id = '', _spuId = '', _shopId = '', _greensID='';
    
    if (options.id) {
      _id = options.id;
    }
    if (options.spuId) {
      _spuId = options.spuId;
    }
    if (options.greensID) {
      _greensID = options.greensID;
      this.setData({
        issku:true,
        num:2
      })
    }else{
      this.setData({
        issku: false
      })
    }
    console.log("issku:", this.data.issku)
    if (options.shopId) {
      _shopId = options.shopId;
    }
    
    this.setData({
      id: _id ? _id:this.data.id,
      spuId: _spuId ? _spuId : this.data.spuId,
      shopId: _shopId ? _shopId : this.data.shopId,
      greensID: _greensID ? _greensID : this.data.greensID
    })

  },

  onShow: function() {
    if (this.data.issku){
      this.bargainDetails();
    }else{
      this.geSkutlist();
    }
    if(this.data.shopId){
      this.getShopInfo();
    }
  },

  bargainDetails:function(){   //品质好店-->店铺详情--列表
    let that = this;
    let _parms = {
      shopId: this.data.shopId,
      zanUserId: app.globalData.userInfo.userId,
      isDeleted: 0,
      page: this.data.page,
      rows: 8,
    };
    Api.dhcList(_parms).then((res) => {  //列表

      if (res.data.code == 0) {
        let _obj = res.data.data.list[0];
        if (_obj.unit){
          let str = _obj.unit;
          if (str.indexOf("盒") != -1) {
            _obj.isbox = 1;
          } else {
            _obj.isbox = 0;
          }
        }
        
        
        this.setData({
          SelectedList: _obj
        })
      }
      console.log('SelectedList:', this.data.SelectedList)
    })
  },
  geSkutlist:function(){
    let _parms = {
      spuType: 10,
      page: this.data.page,
      rows: 8,
      spuId: this.data.spuId
    };
    Api.crabList(_parms).then((res) => { //查询同类规格列表
      if (res.data.code == 0) {
        let _list = res.data.data.list;
        let _obj = _list[0];
        if (_obj.unit) {
          let str = _obj.unit;
          if (str.indexOf("盒") != -1) {
            _obj.isbox = 1;
          } else {
            _obj.isbox = 0;
          }
        }
        this.setData({
          specificationData: _list,
          SelectedList: _obj,
          isAct: _obj.id
        })
      }
    });
  },



  //查询商家详情
  getShopInfo: function() {
    let that = this;
    wx.request({
      url: that.data._build_url + 'shop/get/' + this.data.shopId,
      header: {
        'content-type': 'application/json;Authorization'
      },
      success: function(res) {
        if(res.data.code == 0){
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
            console.log('store_details:', that.data.store_details)
          }
        }
      }
    })
  },
  //点击商家主页面按钮，跳转到商家详情页
  handshopHome:function(e){
    const id = e.currentTarget.id;
    wx.navigateTo({
      url: '../../merchant-particulars/merchant-particulars?shopid=' + id + '&flag=1'
    })
  },
  //打开地图导航
  openMap:function(){
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
  initiateCut:function(){
    console.log('initiateCut')
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
  showmodalbz:function(){
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

  chooseLike: function(e) { //弹窗里同种类选择不同规格
    let id = e.currentTarget.id, _data = this.data.specificationData,actData={};
    for (let i = 0; i < _data.length;i++){
      if (id == _data[i].id){
        actData = _data[i]
      }
    }

    let _obj = actData;
    if (_obj.unit) {
      let str = _obj.unit;
      if (str.indexOf("盒") != -1) {
        _obj.isbox = 1;
      } else {
        _obj.isbox = 0;
      }
    }

    this.setData({
      SelectedList: _obj,
      isAct:id
    });
  },

  //分享给好友
  onShareAppMessage: function () {
    let userInfo = app.globalData.userInfo;
    console.log(' this.SelectedList:', this.data.SelectedList)
    return {
      title: this.data.SelectedList.skuName,
      path: '/pages/index/crabShopping/crabDetails/crabDetails?shopId=' + this.data.SelectedList.shopId + '&id=' + this.data.SelectedList.id,
      success: function (res) {

      },
      fail: function (res) {
        // 分享失败

      }
    }
  },

  /* 点击减号地增减数量 */
  bindMinus: function() {
    let num = this.data.num;
    if(this.data.issku){return}
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
    if (this.data.issku) { return }
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
  //原价购买
  originalPrice: function() {
    console.log('issku:', this.data.issku)
    console.log('this.data.SelectedList:', this.data.SelectedList)
    let _sellPrice = this.data.SelectedList.sellPrice,
      _num = this.data.num, 
      _id = this.data.SelectedList.id, 
      _shopId = this.data.SelectedList.shopId,
      _skuName = this.data.SelectedList.skuName;
    if(this.data.issku){  //品质好店付款
      wx.navigateTo({
        url: '../../order-for-goods/order-for-goods?shopId=' + this.data.shopId + '&skuName=' + _sellPrice + '元兑换券&sell=' + _sellPrice + '&skutype=4&dishSkuId=' + this.SelectedList.id + '&dishSkuName=' + _skuName + '&num='+_num+'&bargainType=1',
      })
    }else{  //送货到家提交订单
      let  _spuName = this.data.SelectedList.spuName ? this.data.SelectedList.spuName : this.data.SelectedList.skuName, _skuPic = this.data.SelectedList.skuPic ? this.data.SelectedList.skuPic : this.data.SelectedList.picUrl, _issku = this.data.issku ? 1 : 2,isbox = this.data.SelectedList.isbox;

      wx.navigateTo({
        url: 'submitOrder/submitOrder?skuName=' + _skuName + '&sellPrice=' + _sellPrice + '&spuName=' + _spuName + '&issku=' + _issku + '&num=' + _num + '&skuPic=' + _skuPic + '&isbox=' + isbox + '&id=' + _id + '&shopId=' + _shopId + '&spuId='+this.data.spuId,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
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
  },

})
import Api from '../../../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js')
var app = getApp()

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    detailsData:'',
    // indicatorDots: true,  //是否显示面板指示点
    autoplay: true,      //是否自动切换
    interval: 5000,       //自动切换时间间隔
    duration: 1000,       //滑动动画时长
    inputShowed: false,
    inputVal: "",
    num: 1,                //数量默认是1
    id:'',                //商品id
    spuId:'',            //判断是礼盒装还是斤装
    minusStatus: 'disabled', // 使用data数据对象设置样式名
    page: 1,
    specificationData:[],
    dhcListData:[], 
    diningtData:[],
    shopId:'',
    greensID:'',
    array:[
      {placeName:'产地',place:'阳澄湖'}, 
      {placeName: '包装',place: '礼盒装'}, 
      { placeName: '数量',place: '8只'}, 
      {placeName: '邮费',place: '到付'}
    ],
    photograph:[{
      print:'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=666433332,3038005955&fm=26&gp=0.jpg'
    }, {
        print: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=666433332,3038005955&fm=26&gp=0.jpg'
      }, {
        print: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=666433332,3038005955&fm=26&gp=0.jpg'
      }]
  },

  onLoad: function (options) {
    let _id = options.id;
    let _spuId = options.spuId
    let _shopId = options.shopId
    let _greensID = options.greensID
    
    this.setData({  
      id: _id,
      spuId: _spuId,
      shopId: _shopId,
      greensID: _greensID
    })
  },

  onShow: function () {
    this.DetailBySkuIdDetails();
    // this.bargainDetails();
    this.detailsListTails();
  },

  DetailBySkuIdDetails: function () {   //螃蟹商品详情
    let that = this;
    let _parms = {
      id:this.data.id
    };
    Api.DetailBySkuId(_parms).then((res) => {
      if (res.data.code == 0) {
        this.setData({
          detailsData: res.data.data,
        })
      }
    })
  },

  // bargainDetails:function(){   //品质好店-->店铺详情--列表
  //   let that = this;
  //   let _parms = {
  //     shopId: this.data.shopId,
  //     zanUserId: app.globalData.userInfo.userId,
  //     isDeleted: 0,
  //     page: this.data.page,
  //     rows: 8,
  //   };
  //   Api.dhcList(_parms).then((res) => {  //列表
  //     console.log("列表返回:", res.data.data.list[0].skuForTscOuts[0].id)
  //     if (res.data.code == 0) {
  //       this.setData({
  //         dhcListData: res.data.data.list.skuForTscOuts[0].id,
  //       })
  //     }
  //   })
  // },

  detailsListTails: function () {   //品质好店-->店铺详情
    console.log("aaa:", this.data.bargainDetails)
    let that = this;
    let _parms = {
      zanUserId: app.globalData.userInfo.userId,
      shopId: this.data.shopId,
      id: this.data.greensID
    };
    Api.detailsList(_parms).then((res) => {   //详情
      console.log("详情返回数据:", res.data.data)
      if (res.data.code == 0) {
        this.setData({
          diningtData: res.data.data,
        })
      }
    })
  },

  //显弹出框
  showModal: function () {
    var animation = wx.createAnimation({   // 显示遮罩层
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
    let that = this;
    let _parms = {
      spuType: 10,
      page: this.data.page,
      rows: 8,
      spuId: this.data.spuId
    };
    Api.crabList(_parms).then((res) => { //查询同类规格列表
      console.log("res:", res.data.data.list)
      if (res.data.code == 0) {
        this.setData({
          specificationData: res.data.data.list,
        })
      }
    });
  },

  chooseLike: function () { //弹窗里同种类选择不同规格
    this.DetailBySkuIdDetails();
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
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },

  /* 点击减号地增减数量 */
	bindMinus: function () {
    var num = this.data.num;
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
    var num = this.data.num;
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

  originalPrice:function(){
    wx.navigateTo({
      url: 'submitOrder/submitOrder',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  // 左下角返回首页
  returnHomeArrive: function () {
    wx.switchTab({
      url: '../../index',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  
})
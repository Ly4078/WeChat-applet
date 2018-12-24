import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
let app = getApp();
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
let requesting = false;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    nearbydatas: ['由近到远'],
    fooddatas: [],
    sortingdatas: ['全部','人气排序'],
    page: 1,
    shopCate:'',
    isclosure:false,
    isScroll: true,
    ismodel: false,
    isnearby: false,
    isfood: false,
    issorting: false,
    businessCate: '',
    browSort: '',
    searchValue:'',
    timer:null,
    posts_key:[],
    SkeletonData:['','','','','',''],
    pageTotal:1,
    _val:"",
    showSkeleton:true
  },

  onLoad: function (options) {
    console.log('options:', options)
    let that = this, _val = "";
    setTimeout(()=>{
      that.setData({
        showSkeleton:false
      })
    },5000);
    if (options.shopCate){
      this.setData({
        shopCate: options.shopCate
      })
    }
    if (options.cate) {
      this.data.businessCate = options.cate
    }
    let _token = wx.getStorageSync('token') || "";
    let userInfo = wx.getStorageSync('userInfo') || {};
    app.globalData.token = _token.length > 5 ? _token:"";
    app.globalData.userInfo = userInfo

    //在此函数中获取扫描普通链接二维码参数
    let q = decodeURIComponent(options.q)
    if (q) {
      if (utils.getQueryString(q, 'flag') == 1){
        _val = utils.getQueryString(q, 'shopCode');
      }
    }
    
    if(_val){
      this.setData({ _val})
    }
    this.setData({
      isclosure: true,
      isshowlocation: false
    })
  },
  onShow: function () {
    let that = this;
    if(!app.globalData.token){
      this.findByCode();
    }else{
      that.getData();
      that.getUserlocation();
      that.getfooddatas()
      if (that.data._val) {
        that.getshopInfo(_val);
      }
    }
  },

  // 初始化start
  findByCode: function () { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let _data = res.data.data;
            if (_data.id) {
              app.globalData.userInfo.userId = _data.id;
              for (let key in _data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = _data[key]
                  }
                }
              };
              app.globalData.userInfo.userName = _data.userName
              that.authlogin();
            }else{
              wx.navigateTo({
                url: '/pages/init/init?isback=1'
              })
            }
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
          wx.setStorageSync('token', _token);
          that.getData();
          that.getUserlocation();
          that.getfooddatas()
          if (that.data._val){
            that.getshopInfo(_val);
          }
        }
      }
    })
  },
  //通过shopcode查询商家信息
  getshopInfo: function (val) {
    let _parms = {
      code: val,
      token: app.globalData.token
    }
    Api.getByCode(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.navigateTo({
          url: '../merchant-particulars/merchant-particulars?shopid=' + res.data.data.id + '&flag=1'
        })
      }
    })
  },
  getfooddatas:function(){
    let that = this, _typeData=[],_children=[];
    wx.request({
      url: that.data._build_url + 'shopCategory/list?',
      method: "GET",
      data: {},
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if(res.data.code == 0){
          if(res.data.data.length>0){
            _typeData = res.data.data;
            for(let i in _typeData){
              if(_typeData[i].id == that.data.shopCate){
                for (let j in _typeData[i].children){
                  _children.push(_typeData[i].children[j].categoryName)
                }
                _children.unshift('全部');
                that.setData({
                  fooddatas:_children
                })
              }
            }
          }
        }
      }
    })
  },
  getData: function (types){
    let that = this, _parms = {};
    _parms = {
      locationX: app.globalData.userInfo.lng ? app.globalData.userInfo.lng : '110.77877',
      locationY: app.globalData.userInfo.lat ? app.globalData.userInfo.lat : '32.6226',
      city: app.globalData.userInfo.city ? app.globalData.userInfo.city : '十堰市',
      page: this.data.page ? this.data.page:1,
      rows: 8,
      token: app.globalData.token
    };
    if (this.data.shopCate) {//酒店 2    景点3   美食1
      _parms.shopCate = this.data.shopCate
    }
    if (this.data.businessCate) { //美食类别 
      _parms.businessCate = this.data.businessCate
    }
    if (this.data.browSort) { //综合排序
      _parms.browSort = this.data.browSort
    }
    if (this.data.searchValue){
      _parms.searchKey=this.data.searchValue
    }
    requesting = true
    if (this.data.businessCate == '川湘菜') {
      Api.listForChuangXiang(_parms).then((res) => {
        wx.stopPullDownRefresh();
        if(res.data.code == 0){
          if(res.data.data.list.length>0){
            let data = res.data;
            let posts = that.data.posts_key;
            let _data = data.data.list
            for (let i = 0; i < _data.length; i++) {
              _data[i].distance = utils.transformLength(_data[i].distance);
              _data[i].activity = _data[i].ruleDescs ? _data[i].ruleDescs.join(',') : '';
              posts.push(_data[i])
            }
            that.setData({
              posts_key: posts,
              pageTotal: Math.ceil(res.data.data.total / 8),
              loading: false,
              showSkeleton:false
            }, () => {
              requesting = false;
            })
          }
        }else{
          this.setData({
            loading: false
          })
          requesting = false;
        }
      },()=>{
        this.setData({
          loading: false
        })
        requesting = false;
      })
    } else {
      Api.shoplist(_parms).then((res) => {
        let that = this;
        wx.stopPullDownRefresh();
        if (res.data.code == 0){
          if(res.data.data.list && res.data.data.list.length>0){
            let posts = this.data.posts_key,_data = res.data.data.list;
            for (let i = 0; i < _data.length; i++) {
              _data[i].distance = utils.transformLength(_data[i].distance);
              _data[i].activity = _data[i].ruleDescs ? _data[i].ruleDescs.join(',') : '';
              if (_data[i].businessCate){
                _data[i].businessCate = _data[i].businessCate.split('/')[0].split(',')[0];
              }
              posts.push(_data[i]);
            }
            that.setData({
              posts_key: posts,
              pageTotal: Math.ceil(res.data.data.total / 8),
              loading: false,
              showSkeleton: false
            },()=>{
              this.setData({
                loading: false
              })
              requesting = false;
            })
          }else{
            this.setData({
              isclosure:false,
              loading: false,
              showSkeleton:false
            })
            requesting = false;
          }
        }
      },()=>{
        this.setData({
          loading: false
        })
        requesting = false;
      })
    }
  },
  onInputText: function (e) { //获取搜索框内的值
    let _value = e.detail.value, _this = this, ms = 0, _timer = null;
    clearInterval(this.data.timer);;
    _timer = setInterval(function () {
      ms += 50;
      if (ms == 100) {
        _this.setData({
          searchValue: _value
        })
        let _parms = {
          searchKey: _this.data.searchValue,
          locationX: app.globalData.userInfo.lng,
          locationY: app.globalData.userInfo.lat,
          city: app.globalData.userInfo.city,
          page: 1,
          rows: 8,
          token: app.globalData.token
        }
        Api.shoplist(_parms).then((res) => {
          if (res.data.code == 0) {
            if(res.data.data.list && res.data.data.list.length>0){
              let posts = [], _data =res.data.data.list;
              for (let i = 0; i < _data.length; i++) {
                _data[i].distance = utils.transformLength(_data[i].distance);
                _data[i].activity = _data[i].ruleDescs ? _data[i].ruleDescs.join(',') : '';
                _data[i].businessCate = _data[i].businessCate.split('/')[0].split(',')[0];
                posts.push(_data[i])
              }
              _this.setData({
                posts_key: posts
              })
            }else{
              _this.setData({
                searchValue: ''
              })
              wx.showToast({
                title: '未搜索到相关信息',
                icon: 'none',
                mask: true,
                duration: 2000
              })
            }
          }
        })
      }
    }, 500)
    _this.setData({
      timer: _timer
    });
   
  },

  //点击列表跳转详情
  onTouchItem: function (event) {
    let _distance = event.currentTarget.dataset.distance;
    wx.navigateTo({
      url: '../merchant-particulars/merchant-particulars?shopid=' + event.currentTarget.id
    })
  },
  getUserlocation: function () { //获取用户位置经纬度
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude,
          longitude = res.longitude;

        that.requestCityName(latitude, longitude);
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其位置信息          
              that.setData({
                isshowlocation: true
              })

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
        if (res.authSetting['scope.userLocation']) { //打开位置授权  
          wx.getLocation({
            success: function (res) {
              let latitude = res.latitude,
                longitude = res.longitude;
              that.requestCityName(latitude, longitude);
            },
          })
        } else {
          that.setData({
            isshowlocation: true
          })
        }
      }
    })
  },
  //获取城市
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    app.globalData.userInfo.lat = lat;
    app.globalData.userInfo.lng = lng;
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res.data.status == 0) {
          let _city = res.data.result.address_component.city;
          if (_city == '十堰市') {
            app.globalData.userInfo.city = _city;
          } else {
            app.globalData.userInfo.city = '十堰市';
          }
          app.globalData.oldcity = app.globalData.userInfo.city;
          wx.setStorageSync('userInfo', app.globalData.userInfo);
          that.setData({
            page:1
          })
          that.getData();
        }
      }
    })
  },
  onReachBottom: function () {  //用户上拉触底加载更多
    if (requesting){
      return false
    }
    if (this.data.pageTotal <= this.data.page){
      return
    }
    if (!this.data.isclosure){
      return false
    }
    let oldpage = this.data.page
    this.setData({
      page: this.data.page + 1,
      loading: true
    },()=>{
      this.getData(1)
    });
  },
  onPullDownRefresh: function () {
    if (requesting){
      return
    }
    this.setData({
      posts_key: [],
      page: 1,
      searchValue:''
    },()=>{
      this.getData();
      // this.getLocation();
    });
    
    
  },

  getLocation:function(){
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude, longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        // that.getData();
      }
    })
  },

  // 模态框 start
  openmodel: function (e) {  //打开模态框
    let id = e.currentTarget.id
    this.setData({
      ismodel: true,
      isScroll: false
    })
    if (id == 1) {
      this.setData({
        isnearby: true
      })
    } else if (id == 2) {
      this.setData({
        isfood: true
      })
    } else if (id == 3) {
      this.setData({
        issorting: true
      })
    }
  },
  closemodel: function () {  //关闭模态框
    this.setData({
      ismodel: false,
      isnearby: false,
      isfood: false,
      issorting: false,
      isScroll: true
    })
  },
  nearby: function () {  //附近
    this.setData({
      isnearby: true,
      isfood: false,
      issorting: false
    })
  },
  goodfood: function () {  //美食
    this.setData({
      isnearby: false,
      isfood: true,
      issorting: false
    })
  },
  sorting: function () {   //综合排序
    this.setData({
      isnearby: false,
      isfood: false,
      issorting: true
    })
  },
  clicknearby: function (ev) { //附近之一
    let id = ev.currentTarget.id, _data = this.data.nearbydatas, _value = '';
    for (let i = 0; i < _data.length; i++) {
      if (id == i) {
        _value = _data[i]
      }
    }
    this.setData({
      businessCate: '',
      browSort: '',
      posts_key: [],
      isclosure: true,
      page: 1
    })
    this.closemodel();
    this.getData();
    
  },
  clickfood: function (ev) { //美食之一
    let id = ev.currentTarget.id,_data = this.data.fooddatas,_value = '';
    for (let i = 0; i < _data.length; i++) {
      if (id == i) {
        _value = _data[i]
      }
    }
    if (id == 0) {
      _value = ''
    }
    this.setData({
      isclosure: true,
      businessCate: _value,
      posts_key: [],
      page:1
    })
    this.closemodel()
    this.getData()
  },
  clicksorting: function (ev) { //综合排序之一
    let id = ev.currentTarget.id
    let _data = this.data.sortingdatas;
    let _value = ''
    for (let i = 0; i < _data.length; i++) {
      if (id == i) {
        _value = _data[i]
      }
    }
    if (id == 0) {
      this.setData({
        browSort: '',
        isclosure: true,
        posts_key: [],
        page: 1
      })
    }else{
      this.setData({
        browSort: '2',
        posts_key: []
      })
    }
    this.closemodel()
    this.getData()
  },
  //图片加载出错，替换为默认图片
  imageError: function (e) {
    let id = e.target.id;
    let posts_key = this.data.posts_key;
    for (let i = 0; i < posts_key.length; i++) {
      if (posts_key[i].id == id) {
        posts_key[i].logoUrl = "/images/icon/morentu.png";
      }
    }
    this.setData({
      posts_key: posts_key
    });
  },
  onShareAppMessage: function (res) {
    return {
      title:'享7',
      imageUrl:'https://xq-1256079679.file.myqcloud.com/15927505686_1545389545_xiang7logo_0.png'
    }
  }
})
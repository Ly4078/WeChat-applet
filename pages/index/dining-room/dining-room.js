import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
let app = getApp()
let requesting = false;
Page({
  data: {
    posts_key: [],
    nearbydatas: ['由近到远'],
    fooddatas: ['全部', "自助餐", "湖北菜", "川菜", "湘菜", "粤菜", "咖啡厅", "小龙虾", "火锅", "海鲜", "烧烤", "江浙菜", "西餐", "料理", "其它美食"],
    sortingdatas: ['全部','人气排序'],
    page: 1,
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
    pageTotal:1
  },

  onLoad: function (options) {
    if (options.cate) {
      this.data.businessCate = options.cate
    }
    //在此函数中获取扫描普通链接二维码参数
    let q = decodeURIComponent(options.q)
    if (q) {
      if (utils.getQueryString(q, 'flag') == 1){
        console.log(utils.getQueryString(q, 'shopCode'))
        this.getshopInfo(utils.getQueryString(q, 'shopCode'));
      }
    }
    this.getData();
  },
  onShow: function () {
    this.setData({
      isclosure: true
    })
  },
  //通过shopcode查询商家信息
  getshopInfo: function (val) {
    let _parms = {
      code: val
    }
    Api.getByCode(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.navigateTo({
          url: '../merchant-particulars/merchant-particulars?shopid=' + res.data.data.id + '&flag=1'
        })
      }
    })
  },
  getData: function () {
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    })
    let _parms = {
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      city: app.globalData.userInfo.city,
      page: this.data.page ? this.data.page:1,
      rows: 8
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
        let that = this
        wx.stopPullDownRefresh();
        let data = res.data;
        if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
          let posts = this.data.posts_key;
          let _data = data.data.list
          for (let i = 0; i < _data.length; i++) {
            console.log("_data[i].distance:", _data[i].distance)
            _data[i].distance = utils.transformLength(_data[i].distance);
            _data[i].activity = _data[i].ruleDescs ? _data[i].ruleDescs.join(',') : '';
            posts.push(_data[i])
          }
          that.setData({
            posts_key: posts,
            pageTotal:Math.ceil(res.data.data.total /8)
          },()=>{
            requesting = false
            wx.hideLoading();
          })
        }else{
          requesting = false
          wx.hideLoading();
        }
      },()=>{
        requesting = false
        wx.hideLoading()
      })
    } else {
      Api.shoplist(_parms).then((res) => {
        let that = this
        let data = res.data;
        if (data.code == 0){
          wx.stopPullDownRefresh();
          if (data.data.list != null && data.data.list != "" && data.data.list != []) {
            wx.stopPullDownRefresh()
            let posts = this.data.posts_key;
            let _data = data.data.list
            for (let i = 0; i < _data.length; i++) {
              _data[i].distance = utils.transformLength(_data[i].distance);
              _data[i].activity = _data[i].ruleDescs ? _data[i].ruleDescs.join(',') : '';
              _data[i].businessCate = _data[i].businessCate.split('/')[0].split(',')[0];
              posts.push(_data[i])
            }
            that.setData({
              posts_key: posts,
              pageTotal: Math.ceil(res.data.data.total / 8)
            },()=>{
              requesting = false
              wx.hideLoading()
            })
          }else{
            this.setData({
              isclosure:false
            })
            requesting = false
            wx.hideLoading()
          }
        }
      },()=>{
        requesting = false
        wx.hideLoading()
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
          rows: 8
        }
        Api.shoplist(_parms).then((res) => {
          let data = res.data;
          if (data.code == 0) {
            if (data.data.list != null && data.data.list != "" && data.data.list != []) {
              let posts = [];
              let _data = data.data.list
              for (let i = 0; i < _data.length; i++) {
                _data[i].distance = utils.transformLength(_data[i].distance);
                _data[i].activity = _data[i].ruleDescs ? _data[i].ruleDescs.join(',') : '';
                _data[i].businessCate = _data[i].businessCate.split('/')[0].split(',')[0];
                posts.push(_data[i])
              }
              _this.setData({
                posts_key: posts
              },()=>{
                wx.hideLoading()
              })
            }else{
              _this.setData({
                searchValue: ''
              })
              wx.hideLoading()
              wx.showToast({
                title: '未搜索到相关信息',
                icon: 'none',
                mask: true,
                duration: 2000
              })
            }
          }else{
            wx.hideLoading()
          }
        },()=>{
          wx.hideLoading()
        })
      }
    }, 500)
    _this.setData({
      timer: _timer
    });
   
    // Api.shoplist(_parms).then((res) => {
    //   if (res.data.code == 0 && res.data.data.list != [] && res.data.data.list != '') {
    //     this.setData({
    //       posts_key: res.data.data.list
    //     });
    //   }
    // })
  },
  // onSearchInp: function () {
  //   let _parms = {
  //     searchKey: this.data.searchValue
  //   }
  //   Api.shoplist(_parms).then((res) => {
  //     this.setData({
  //       posts_key: res.data.data.list
  //     });
  //   })
  // },
  //点击列表跳转详情
  onTouchItem: function (event) {
    wx.navigateTo({
      url: '../merchant-particulars/merchant-particulars?shopid=' + event.currentTarget.id,
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
      page: this.data.page + 1
    },()=>{
      this.getData()
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
    console.log("nearby")
    this.setData({
      isnearby: true,
      isfood: false,
      issorting: false
    })
  },
  goodfood: function () {  //美食
    console.log("goodfood")
    this.setData({
      isnearby: false,
      isfood: true,
      issorting: false
    })
  },
  sorting: function () {   //综合排序
    console.log("sorting")
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
    let id = ev.currentTarget.id
    let _data = this.data.fooddatas
    let _value = ''
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
  //模态框 end
  // onPageScroll: function () {
  //   //创建节点选择器
  //   var query = wx.createSelectorQuery();
  //   query.select('.page_row').boundingClientRect()
  //   query.exec((res) => {
  //     console.log(res);
  //     // var listHeight = res[0].height; // 获取list高度
  //   })
  // }
})
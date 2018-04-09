import Api from '../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
var utils = require('../../utils/util.js')
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    food: [],
    page: 1,
    hotlive: [],
    flag: true,
    tect: '最新',
    isscelect: 1,
    ishotnew: false,
    isadd:false,
    sortype:'0',
    choicetype:'',
  },
  onLoad: function () {

  },
  onShow: function (options) {
    let that = this;

    getApp().globalData.article = []
    let _arr = ['idnum', 'text', 'ismodi', 'isIll', 'title', 'cover']
    for (let i = 0; i < _arr.length; i++) {
      wx.removeStorage({
        key: _arr[i]
      })
    }

    this.setData({
      ishotnew: false,
      food: [],
      page: 1,
      flag: true
    })
    this.getfood();
    wx.request({
      url: that.data._build_url + 'zb/list/',
      success: function (res) {
        that.setData({
          hotlive: res.data.data.list
        })
      }
    })
  },
  close:function(){
    this.setData({
      ishotnew:false
    })
  },
  getfood: function (_type, data) {
    let that = this
    wx.showLoading({
      title:'数据加载中。。。',
      mask:true
    })
    let _parms = {
      page: this.data.page,
      row: 8
    }
    if (this.data.choicetype) {
      _parms.choiceType = this.data.choicetype
    }
    if (this.data.sortype) {
      _parms.sortType = this.data.sortype
    }
    Api.topiclist(_parms).then((res) => {
      let _data = this.data.food
      if (res.data.code == 0){
        wx.hideLoading()
        if (res.data.data.list != null && res.data.data.list != "" && res.data.data.list != []) {
          let footList = res.data.data.list;
          for (let i = 0; i < footList.length; i++) {
            footList[i].summary = utils.uncodeUtf16(footList[i].summary);
            footList[i].content = utils.uncodeUtf16(footList[i].content);
            footList[i].timeDiffrence = utils.timeDiffrence(res.data.currentTime, footList[i].updateTime, footList[i].createTime)
            footList[i].content = JSON.parse(footList[i].content)
            if (footList[i].content[0].type != 'video'){
              footList[i].isimg = true
            }else{
              footList[i].isimg = false
              footList[i].clickvideo = false
            }
            _data.push(footList[i]);
          }
          this.setData({
            food: _data
          })
        } else {
          this.setData({
            flag: false
          });
        }
      }else{
        wx.hideLoading()
      }
      
      if (that.data.page == 1) {
        wx.stopPullDownRefresh();
      } else {
        wx.hideLoading();
      }
    })
  },
  bindended:function(e){  //视频播放完成
    const id = e.currentTarget.id
    let _data = this.data.food
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        _data[i].clickvideo = false
        this.setData({
          food: _data
        })
      }
    }
  },
  clickarticle: function (e) {  //点击某条文章
    const id = e.currentTarget.id
    this.setData({
      ishotnew: false
    })
    let _data = this.data.food
    let zan = ''
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan
        if (!_data[i].isimg){
          _data[i].clickvideo=true
          this.setData({
            food:_data
          })
          return false
        }else{
          for (let i = 0; i < _data.length; i++) {
            if (!_data[i].isimg) {
              _data[i].clickvideo = false
              this.setData({
                food: _data
              })
            }
          }
          wx.navigateTo({
            url: 'dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan
          })
        }
      }
    }
  },
  gotodetail(e){ //点击下边一排
    const id = e.currentTarget.id
    this.setData({
      ishotnew: false
    })
    let _data = this.data.food
    let zan = ''
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan
        _data[i].clickvideo = false
        this.setData({
          food: _data
        })
        wx.navigateTo({
          url: 'dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan
        })
      }
    }
  },
  clickadd(){
    this.setData({
      isadd: !this.data.isadd
    })
  },
  closemodel:function(){
    this.setData({
      isadd: false
    })
  },
  announceState: function (event) { // 跳转到编辑动态页面
    const id = event.currentTarget.id
    this.setData({
      ishotnew: false
    })
    wx.redirectTo({
      url: 'dynamic-state/dynamic-state?id='+ id,
    })
  },
  onReachBottom: function () {  //用户上拉触底
    let that = this
    if (this.data.flag) {
      wx.showLoading({
        title: '加载中..'
      })
      this.setData({
        ishotnew: false,
        page: this.data.page + 1
      });
      that.getfood();
    }
  },
  onPullDownRefresh: function () {  //用户下拉刷新
    let that = this;
    this.setData({
      ishotnew: false,
      food: [],
      page: 1,
      flag: true
    });
    this.getfood();
    wx.request({
      url: that.data._build_url + 'zb/list/',
      success: function (res) {
        that.setData({
          hotlive: res.data.data.list
        })
      }
    })
  },
  topall: function () {  //选择全部
    this.setData({
      ishotnew: false,
      food:[],
      page: 1,
      flag:true,
      isscelect: 1,
      choicetype:''
    })
    let _type = ''
    this.getfood()
  },
  topbus: function () {  //选择商家
    this.setData({
      ishotnew: false,
      food: [],
      page: 1,
      flag: true,
      isscelect: 2,
      choicetype:'2'
    })
    this.getfood()
  },
  topper: function () {  //选择个人
    this.setData({
      ishotnew: false,
      food: [],
      page: 1,
      flag: true,
      isscelect: 3,
      choicetype: '1'
    })
    this.getfood()
  },
  sect: function () {  //点击最新/最热
    let that = this
    this.setData({
      ishotnew: true
    })
    setTimeout(function () {
      that.setData({
        ishotnew: false
      })
    },2000)
  },
  mostnew: function () { //选择最新
    this.setData({
      ishotnew: false,
      food: [],
      sortype:'0',
      tect: '最新'
    })
    this.getfood()
  },
  mosthot: function () {  //选择最热
    this.setData({
      ishotnew: false,
      food: [],
      sortype: '1',
      tect: '最热'
    })
    this.getfood()
  }
})
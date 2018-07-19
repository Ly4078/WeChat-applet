import Api from '../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
var utils = require('../../utils/util.js');
var app = getApp();
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
    istouqu: false,
    sortype:'0',
    choicetype:'',
    placeholderFlag: true,
    issnap: false,  
    isshow:false,
    topUrl: ''
  },
  onShow: function () {
    if (app.globalData.isflag){
      this.setData({
        isshow:true
      })
    }else{
      this.setData({
        isshow: false
      })
    }
  },
  onPageScroll:function(){
    this.setData({
      isadd:false,
      ishotnew:false      
    })
  },
  onHide:function(){
    let _data = this.data.food
    for (let i = 0; i < _data.length; i++) {
      this.setData({
        food: _data
      })
    }
  },
  onLoad: function (options) {
    let that = this;
    if (!app.globalData.userInfo.unionId){
      wx.login({
        success: res => {
          if (res.code) {
            let _parms = {
              code: res.code
            }
            Api.getOpenId(_parms).then((res) => {
              app.globalData.userInfo.openId = res.data.data.openId;
              app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
              if (res.data.data.unionId) {
                app.globalData.userInfo.unionId = res.data.data.unionId;
                that.setData({
                  istouqu: false
                })
              } else {
                that.setData({
                  istouqu: true
                })
              }
            })
          }
        }
      })
    } else {
      that.setData({
        istouqu: false
      })
    }
    this.setData({
      sortype:'0',
      choicetype: '',
      isscelect:1
    })
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
    this.getcarousel();
  },
  againgetinfo: function () {
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        let _pars = {
          sessionKey: app.globalData.userInfo.sessionKey,
          ivData: res.iv,
          encrypData: res.encryptedData
        }
        Api.phoneAES(_pars).then((resv) => {
          if (resv.data.code == 0) {
            that.setData({
              istouqu: false
            })
            let _data = JSON.parse(resv.data.data);
            app.globalData.userInfo.unionId = _data.unionId;
          }
        })
      }
    })
  },
  getcarousel: function () {  //轮播图
    Api.hcllist().then((res) => {
      if (res.data.data) {
        let data = res.data.data;
        // this.setData({
        //   carousel: res.data.data
        // })
        for(let i = 0; i < data.length; i++) {
          let str = data[i].linkUrl;
          if (str.substring(str.indexOf('=') + 1, str.indexOf('&')) == '38') {
            this.setData({
              topUrl: data[i].imgUrl
            });
            return false;
          }
        }
      } 
    })
  },
  close:function(){
    this.setData({
      ishotnew:false
    })
  },
  getfood: function (_type, data) {
    let that = this;
    if (app.globalData.isflag) {
      wx.showLoading({
        title: '数据加载中。。。',
        mask: true
      })
      let _parms = {
        page: this.data.page,
        row: 8,
        topicType: 2
      }
      if (this.data.choicetype) {
        _parms.choiceType = this.data.choicetype
      }
      if (this.data.sortype) {
        _parms.sortType = this.data.sortype
      }
      Api.topiclist(_parms).then((res) => {
        let _data = this.data.food
        if (res.data.code == 0) {
          wx.hideLoading()
          if (res.data.data.list != null && res.data.data.list != "" && res.data.data.list != []) {
            let footList = res.data.data.list;
            for (let i = 0; i < footList.length; i++) {
              if (footList[i].topicType == 1) { // topicType  1文章  2视频
                footList[i].isimg = true;
              } else if (footList[i].topicType == 2){
                // footList[i].content = JSON.parse(footList[i].content);
                footList[i].isimg = false
                footList[i].clickvideo = false
              }
              // footList[i].summary = utils.uncodeUtf16(footList[i].summary);
              // footList[i].content = utils.uncodeUtf16(footList[i].content);
              // footList[i].timeDiffrence = utils.timeDiffrence(res.data.currentTime, footList[i].updateTime, footList[i].createTime)
              
              // footList[i].hitNum = utils.million(footList[i].hitNum)
              // footList[i].commentNum = utils.million(footList[i].commentNum)
              // footList[i].transNum = utils.million(footList[i].transNum)
              // if (!footList[i].nickName || footList[i].nickName == 'null') {
              //   footList[i].nickName = '';
              //   footList[i].userName = footList[i].userName.substr(0, 3) + "****" + footList[i].userName.substr(7);
              // }

              // if (footList[i].content[0].type != 'video' || footList[i].topicType == 1) { //文章
              //   footList[i].isimg = true
              // } else {  //视频
              //   footList[i].isimg = false
              //   footList[i].clickvideo = false
              // }
              if (footList[i].nickName == "null" || footList[i].nickName == "undefined") {
                footList[i].nickName = "";
              }
              var myreg = /^[1][3,4,5,7,8][0-9]{9}$/, phone = footList[i].userName;
              if (myreg.test(phone)) {
                footList[i].userName = phone.substring(0, 4) + '****' + phone.substring(phone.length - 3, phone.length);
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
        } else {
          wx.hideLoading()
        }
        this.placeholderFlag = this.data.food.length < 1 ? false : true;
        if (that.data.page == 1) {
          wx.stopPullDownRefresh();
        } else {
          wx.hideLoading();
        }
      })
    }
    
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
  videoplay: function (e) {  //点击某条文章
    const id = e.currentTarget.id;
    this.setData({
      ishotnew: false
    })
    let _data = this.data.food
    let zan = ''
    for (let i = 0; i < _data.length; i++) {
      _data[i].clickvideo = false
      this.setData({
        food: _data
      })
    }
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan;
        if (!_data[i].isimg){
          // _data[i].clickvideo=true
          // this.setData({
          //   food:_data
          // })
          wx.navigateTo({
            url: '../activityDetails/video-details/video-details?id=' + id + '&zan=' + zan + '&userId=' + _data[i].userId
          })
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
    let _data = this.data.food, video=false, zan = '';
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan;
        _data[i].clickvideo = false;
        if (_data[i].content[0].type == 'video') {
          video = true;
        }else{
          video = false;
        }
        this.setData({
          food: _data
        })
        if(video){  //视频
          wx.navigateTo({
            url: '../activityDetails/video-details/video-details?id=' + id + '&zan=' + zan
          })
        }else{ //文章
          wx.navigateTo({
            url: 'dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan
          })
        }
      }
    }
  },
  clickadd(){
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
    } else{
      this.setData({
        isadd: !this.data.isadd
      })
    }
  },
  closemodel:function(){
    this.setData({
      isadd: false
    })
  },
  announceState: function (event) { // 跳转到编辑动态页面
  
    const id = event.currentTarget.id;
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
  },
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
  }
})
import Api from '../../utils/config/api.js';
import {
  GLOBAL_API_DOMAIN
} from '/../../utils/config/config.js';
var utils = require('../../utils/util.js');
var app = getApp();
let requesting = false;
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    food: [],
    list:[],
    page: 1,
    hotlive: [],
    flag: true,
    tect: '最新',
    isscelect: 1,
    ishotnew: false,
    isadd: false,
    istouqu: false,
    sortype: '0',
    choicetype: '',
    placeholderFlag: true,
    issnap: false,
    isshow: false,
    topUrl: '',
    actId: ''
  },
  onShow: function() {
    if (app.globalData.isflag) {
      this.setData({
        isshow: true
      })
    } else {
      this.setData({
        isshow: false
      })
    }
  },
  onPageScroll: function() {
    this.setData({
      isadd: false,
      ishotnew: false
    })
  },
  onHide: function() {
    let _data = this.data.food
    for (let i = 0; i < _data.length; i++) {
      this.setData({
        food: _data
      })
    }
  },
  onLoad: function(options) {
    let that = this;
    if (!app.globalData.userInfo.unionId) {
      wx.login({
        success: res => {
          if (res.code) {
            let _parms = {
              code: res.code,
              token: app.globalData.token
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
      sortype: '0',
      choicetype: '',
      isscelect: 1
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
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        that.setData({
          hotlive: res.data.data.list
        })
      }
    })
    this.getcarousel();
  },
  againgetinfo: function() {
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function(res) {
        let _sessionKey = app.globalData.userInfo.sessionKey,
          _ivData = res.iv, _encrypData = res.encryptedData;
        _sessionKey = _sessionKey.replace(/\=/g, "%3d");
        _ivData = _ivData.replace(/\=/g, "%3d");
        _ivData = _ivData.replace(/\+/g, "%2b");
        _encrypData = _encrypData.replace(/\=/g, "%3d");
        _encrypData = _encrypData.replace(/\+/g, "%2b");
        _encrypData = _encrypData.replace(/\//g, "%2f");

        wx.request({
          url: that.data._build_url + 'auth/phoneAES?sessionKey=' + _sessionKey + '&ivData=' + _ivData + '&encrypData=' + _encrypData,
          header: {
            'content-type': 'application/json' // 默认值
          },
          method: 'POST',
          success: function (resv) {
            if (resv.data.code == 0) {
              that.setData({
                istouqu: false
              })
              let _data = JSON.parse(resv.data.data);
              app.globalData.userInfo.unionId = _data.unionId;
            }
          }
        })
      }
    })
  },
  getcarousel: function() { //轮播图
    Api.hcllist().then((res) => {
      if (res.data.data) {
        let data = res.data.data;
        for (let i = 0; i < data.length; i++) {
          if (data[i].sortNum == 4) {
            this.setData({
              topUrl: data[i].imgUrl
            });
            if (data[i].linkUrl.indexOf('&') >= 0) {
              let _linkUrl = data[i].linkUrl, _obj = {};
              let arr = _linkUrl.split("&");
              for (let i in arr) {
                let arr2 = arr[i].split("=");
                _obj[arr2[0]] = arr2[1];
                this.setData({
                  actId: _obj.actId
                });
              }
            }
            return false;
          }
        }
      }
    })
  },
  close: function() {
    this.setData({
      ishotnew: false
    })
  },
  tovideoact: function() { //去视频活动页面
    if (this.data.actId != '') {
      wx.navigateTo({
        url: '../activityDetails/video-list/video-list?id=38' ,
      })
    }
  },
  //查询列表数据
  getfood: function() {
    let that = this,_parms={};
    if (app.globalData.isflag) {
      let _parms = {
        page: this.data.page,
        row: 8,
        topicType: 2,
        token: app.globalData.token
      }
     
      if (this.data.choicetype) {
        _parms.choiceType = this.data.choicetype
      }
     
      if (this.data.sortype) {
        _parms.sortType = this.data.sortype
      }
      requesting = true;
      Api.topiclist(_parms).then((res) => {
        let _data = that.data.food;
        if (res.data.code == 0) {
          
          if (res.data.data.list && res.data.data.list.length>0) {
            let footList = res.data.data.list;
            if(footList.length>0){
              for (let i = 0; i < footList.length; i++) {
                if (footList[i].topicType == 1) { // topicType  1文章  2视频
                  footList[i].isimg = true;
                } else if (footList[i].topicType == 2) {
                  // footList[i].content = JSON.parse(footList[i].content);
                  footList[i].isimg = false
                  footList[i].clickvideo = false
                }
                footList[i].summary = utils.uncodeUtf16(footList[i].summary);
                if (footList[i].nickName == "null" || footList[i].nickName == "undefined") {
                  footList[i].nickName = "";
                }
                var myreg = /^[1][3,4,5,7,8][0-9]{9}$/,
                  phone = footList[i].userName;
                if (myreg.test(phone)) {
                  footList[i].userName = phone.substring(0, 4) + '****' + phone.substring(phone.length - 3, phone.length);
                }
                _data.push(footList[i]);
              }
            }
            
            this.setData({
              food: _data,
              pageTotal:Math.ceil(res.data.data.total / 8),
              loading: false
            },()=>{
              wx.hideLoading()
              requesting = false;
            })
           
          } else {
            this.setData({
              flag: false,
              loading: false
            });
            requesting = false;
            wx.hideLoading()
          }
        } else {
          wx.hideLoading()
          this.setData({
            loading: false
          });
          requesting = false;
        }
        this.placeholderFlag = this.data.food.length < 1 ? false : true;
        if (that.data.page == 1) {
          wx.stopPullDownRefresh();
        } else {
          wx.hideLoading();
        }
      },()=>{
        wx.hideLoading()
        requesting = false;
        this.setData({
          loading: false
        });

      })
    }
  },
  bindended: function(e) { //视频播放完成
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
  videoplay: function(e) { //点击某条文章
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
        if (!_data[i].isimg) {
          // _data[i].clickvideo=true
          // this.setData({
          //   food:_data
          // })
          wx.navigateTo({
            url: '../activityDetails/video-details/video-details?id=' + id + '&zan=' + zan + '&userId=' + _data[i].userId
          })
        } else {
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
  gotodetail(e) { //点击下边一排
    const id = e.currentTarget.id
    this.setData({
      ishotnew: false
    })
    let _data = this.data.food,
      video = false,
      zan = '';
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan;
        _data[i].clickvideo = false;
        if (_data[i].content[0].type == 'video') {
          video = true;
        } else {
          video = false;
        }
        this.setData({
          food: _data
        })
        if (video) { //视频
          wx.navigateTo({
            url: '../activityDetails/video-details/video-details?id=' + id + '&zan=' + zan
          })
        } else { //文章
          wx.navigateTo({
            url: 'dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan
          })
        }
      }
    }
  },
  clickadd() {
    if (app.globalData.userInfo.mobile == '' || app.globalData.userInfo.mobile == null) {
      this.setData({
        issnap: true
      })
    } else {
      this.setData({
        isadd: !this.data.isadd
      })
    }
  },
  closemodel: function() {
    this.setData({
      isadd: false
    })
  },
  announceState: function(event) { // 跳转到编辑动态页面

    const id = event.currentTarget.id;
    this.setData({
      ishotnew: false
    })
    wx.redirectTo({
      url: 'dynamic-state/dynamic-state?id=' + id,
    })
  },
  onReachBottom: function() { //用户上拉触底
    let that = this
    if (this.data.flag) {
      console.log(requesting)
      if (requesting){
        return
      }
      if (this.data.pageTotal <= this.data.page ){
        return
      }
      this.setData({
        ishotnew: false,
        page: this.data.page + 1,
        loading: true
      },()=>{
        that.getfood();
      });
      
    }
  },
  onPullDownRefresh: function() { //用户下拉刷新
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
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        that.setData({
          hotlive: res.data.data.list
        })
      }
    })
  },
  topall: function() { //选择全部
    this.setData({
      ishotnew: false,
      food: [],
      page: 1,
      flag: true,
      isscelect: 1,
      choicetype: ''
    })
    let _type = ''
    this.getfood()
  },
  topbus: function() { //选择商家
    this.setData({
      ishotnew: false,
      food: [],
      page: 1,
      flag: true,
      isscelect: 2,
      choicetype: '2'
    })
    this.getfood()
  },
  topper: function() { //选择个人
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
  sect: function() { //点击最新/最热
    let that = this
    this.setData({
      ishotnew: true
    })
    setTimeout(function() {
      that.setData({
        ishotnew: false
      })
    }, 2000)
  },
  mostnew: function() { //选择最新
    this.setData({
      ishotnew: false,
      food: [],
      sortype: '0',
      tect: '最新'
    })
    this.getfood()
  },
  mosthot: function() { //选择最热
    this.setData({
      ishotnew: false,
      food: [],
      sortype: '1',
      tect: '最热'
    })
    this.getfood()
  },
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
  }
})
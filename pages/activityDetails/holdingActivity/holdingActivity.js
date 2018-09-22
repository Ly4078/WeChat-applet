import Api from '../../../utils/config/api.js';
var utils = require('../../../utils/util.js');
import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
var app = getApp();


var village_LBS = function(that) {
  wx.getLocation({
    success: function(res) {
      console.log('vill_res:', res)
      let latitude = res.latitude,
        longitude = res.longitude;
      app.globalData.userInfo.lat = latitude;
      app.globalData.userInfo.lng = longitude;
      that.requestCityName(latitude, longitude);
    },
  })
}

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    // issnap: false, //新用户
    // isnew: false, //新用户
    isMpa: false,
    userId: '',
    id: '', //菜id
    shopId: '', //点击店Id
    postList: [{
        id: 0,
        name: '中商优品汇',
        place: '(中南店)',
        images: 'http://img.zcool.cn/community/01d3a75831f12aa801219c77f99003.jpg@1280w_1l_2o_100sh.jpg',
        locationX: '114.338306',
        locationY: '30.543187'
      },
      {
        id: 1,
        name: '中商优品汇',
        place: '(珞珈山店)',
        images: 'http://pic80.huitu.com/res/20160608/208798_20160608015617000200_1.jpg',
        locationX: '114.363386',
        locationY: '30.53937'
      },
      {
        id: 2,
        name: '中商平价',
        place: '(徐东店)',
        images: 'http://www.yiqiang-sw.com/Uploads/201608/579efbbf9f05d.jpg',
        locationX: '114.351814',
        locationY: '30.595577'
      },
      {
        id: 3,
        name: '中商平价',
        place: '(光谷店)',
        images: 'http://pic32.photophoto.cn/20140709/0013026497125511_b.jpg',
        locationX: '114.437057',
        locationY: '30.510551'
      },
      {
        id: 4,
        name: '中商平价',
        place: '(和平大道店)',
        images: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1537462197451&di=14abc4488db7800cc28ebe0f29a49ed4&imgtype=0&src=http%3A%2F%2Fqcloud.dpfile.com%2Fpc%2FWtyHGebB4mrDUQXoy9DxF9ocUmQ0RGE8WBW8dAr0DR_dWX5GDHu8EgNRQXfjASs3TYGVDmosZWTLal1WbWRW3A.jpg',
        locationX: '114.323489',
        locationY: '30.577027'
      }
    ],
    specification:[
      {
        numerical: 2,
        detailses: '邀请好友注册享7美食会员达到3人，可以在活动指定门店享7美食专区免费兑换领取2.5两阳澄湖公蟹1只，邀请注册人数达到6人兑换领取2只，以此类推！'
      },
      {
        numerical: 3,
        detailses: '兑换领取专区：享7美食专区-详细见各门店超市入口、出口及超市中享7美食指示牌'
      },
      {
        numerical: 4,
        detailses: ' 活动期间总兑换数量：共6060斤24200只大闸蟹，其中中秋/国庆/重阳三大节日每家门店兑换领取300只;其他日期每天每家门店兑换领取100只。'
      },
      {
        numerical: 5,
        detailses: '每天供货数量领完为止，先到先得。当日已完成邀请任务尚未领取到大闸蟹第二天也可以兑换，先到先得，领完为止。'
      },
      {
        numerical: 6,
        detailses: ' 根据门店现场活动指示牌到指定享7区域与享7工作人员进行任务核销并领取大闸蟹。'
      },
      {
        numerical: 7,
        detailses: '可在【享7美食】微信公众号查阅本次活动详情。'
      },
      {
        numerical: 8,
        detailses: '本次活动最终解释权归湖北享七网络科技有限公司。'
      },
    ],
    inviteNum: 0, //邀请人数
    crabNum: 0, //螃蟹数量
    isInvite: false, //是否邀请过
    _city: '',
    _lat: '',
    _lng: ''
  },
  onLoad: function(options) {
    this.setData({
      inviter: options.inviter ? options.inviter : app.globalData.userInfo.userId
    });
  },
  onShow: function() {
    if (app.globalData.userInfo.userId) {
      console.log("86行:==============show_userid:", app.globalData.userInfo.userId);
      if (!app.globalData.userInfo.mobile) { //是新用户，去注册页面
        wx.navigateTo({
          url: '/pages/personal-center/securities-sdb/securities-sdb?back=1&inviter=' + this.data.inviter
        })
      } else {
        //回调
        this.inquireNum();
      }
    } else {
      this.findByCode();
    }
  },
  createCrab() { //创建发起
    let _parms = {
      userId: app.globalData.userInfo.userId,
      type: 2
    };
    Api.createCrab(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showToast({
          title: '发起成功,点击邀请好友吧',
          icon: 'none',
          duration: 2500
        })
        this.setData({
          isInvite: true
        });
      } else {

      }
    });
  },
  inquireNum() { //查询邀请螃蟹人数
    let _parms = {
      userId: app.globalData.userInfo.userId
    };
    Api.inquireInviteNum(_parms).then((res) => {
      if (res.data.code == 0) {
        if (res.data.data) {
          let data = res.data.data;
          //邀请满7个可以领取一只螃蟹. 达到14个可以灵丘2只. 21个人3只  30个人4只.
          this.setData({
            isInvite: true,
            inviteNum: data.pullNum,
            crabNum: Math.floor(data.pullNum / 3)
          });
        }
      } else if (res.data.code == -1 && !res.data.data) {
        this.setData({
          isInvite: false,
          inviteNum: 0
        });
      }
    });
  },
  emptyNum() { //清空邀请螃蟹人数
    let _parms = {
      userId: app.globalData.userInfo.userId
    };
    Api.emptyInviteNum(_parms).then((res) => {
      if (res.data.code == 0) {
        this.inquireNum();
      } else {
        wx.showToast({
          title: '网络原因,兑换失败',
          icon: 'none'
        })
      }
    });
  },
  exchange() { //兑换螃蟹
    if (!app.globalData.userInfo.mobile) {
      this.closetel();
      return false
    }
    if (this.data.crabNum > 0) {
      let _this = this;
      wx.showModal({
        content: '是否兑换螃蟹?',
        complete(res) {
          if (res.confirm) {
            _this.emptyNum();
          }
        }
      })
    } else {
      wx.showToast({
        title: '您目前没有螃蟹可以兑换，每邀请3位新用户可兑换一只螃蟹',
        icon: 'none'
      })
    }
  },
  share() { //分享
    if (!app.globalData.userInfo.mobile) {
      this.closetel();
      return false
    } else {
      if (this.data.isInvite) {
        this.onShareAppMessage();
      } else {
        this.createCrab();
      }
    }
  },
  //分享给好友
  onShareAppMessage: function() {
    // this.data.inviter,
    return {
      title: '邀请好友，换大闸蟹',
      path: '/pages/activityDetails/holdingActivity/holdingActivity?inviter=' +  app.globalData.userInfo.userId,
      success: function(res) {}
    }
  },
  closetel: function(e) { //跳转至新用户注册页面
    // let id = e.target.id;
    // this.setData({
    //   issnap: false
    // })
    // if (id == 1) {
      wx.navigateTo({
        url: '/pages/personal-center/securities-sdb/securities-sdb?inviter=' + this.data.inviter + '&back=1'
      })
    // }
  },
  toIndex() {   //跳转至首页
    wx.switchTab({
      url: '../../index/index'
    })
  },
  onPullDownRefresh: function () {
    this.inquireNum();
  },
  findByCode: function() { //通过code查询进入的用户信息，判断是否是新用户
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            app.globalData.userInfo.userId = data.id;
            app.globalData.userInfo.lat = data.locationX;
            app.globalData.userInfo.lng = data.locationY;
            for (let key in data) {
              for (let ind in app.globalData.userInfo) {
                if (key == ind) {
                  app.globalData.userInfo[ind] = data[key]
                }
              }
            }

            if (!data.mobile) { //是新用户，去注册页面
              that.closetel();
            }
            let userInfo = app.globalData.userInfo;
            if (userInfo.userId && userInfo.lat && userInfo.lng && userInfo.city) {
              // 回调
            } else {
              // that.getlocation();
            }
          } else {
            that.findByCode();
          }
        })
      }
    })
  },
  //打开地图导航
  TencentMap: function(event) {
    this.setData({
      shopId: event.currentTarget.id
    });
    let that = this;
    if (event && event.type == 'tap') {
      this.setData({
        isMpa: true
      })
    } else {
      this.setData({
        isMpa: false
      })
    }
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        app.globalData.userInfo.lat = latitude;
        app.globalData.userInfo.lng = longitude;
        that.requestCityName(latitude, longitude);
      },
      fail: function(res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户位置信息
              wx.showModal({
                title: '提示',
                content: '授权获得更多功能和体验',
                showCancel: false,
                success: function(res) {
                  if (res.confirm) {
                    wx.openSetting({ //打开授权设置界面
                      success: (res) => {
                        if (res.authSetting['scope.userLocation']) {
                          village_LBS(that);
                        } else {
                          let latitude = '',
                            longitude = '';
                          that.requestCityName(latitude, longitude);
                        }
                      }
                    })
                  }
                }
              })
            } else {
              that.openmap();
            }
          }
        })
      }
    })


  },
  //获取城市
  requestCityName(lat, lng) { //获取当前城市
    let that = this;
    if (!lat && !lng) {
      this.TencentMap();
      return;
    }
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res.data.status == 0) {
          let _city = res.data.result.address_component.city;
          app.globalData.userInfo.city = _city;
          if (this.data.isMpa) {
            this.openmap();
          }

        }
      }
    })
  },
  //打开地图
  openmap: function() {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        let postList = that.data.postList;
        for (let i = 0; i < postList.length; i++) {
          if (postList[i].id == that.data.shopId) {
            console.log(postList[i].locationX)
            wx.openLocation({
              longitude: postList[i].locationX * 1,
              latitude: postList[i].locationY * 1,
              scale: 18,
              name: postList[i].name,
              address: postList[i].name + postList[i].place,
              success: function(res) {
              }
            })
          }
        }
      }
    })
  }
})
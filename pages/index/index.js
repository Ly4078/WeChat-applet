//index.js 
import Api from '/../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '/../../utils/config/config.js';
var utils = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    city: "",
    phone: '',
    verify: '', //输入的验证码
    verifyId: '',//后台返回的短信验证码
    veridyTime: '',//短信发送时间
    carousel: [],  //轮播图
    business: [], //商家列表，推荐餐厅
    actlist: [],  //热门活动
    hotlive: [],  //热门直播
    food: [],   //美食墙
    logs: [],
    topics: [],   //专题
    restaurant: [], //菜系专题
    service: [],  //服务专题
    alltopics: [],
    currentTab: 0,
    issnap: false,  //是否是临时用户
    isNew: false,   //是否新用户
    userGiftFlag: false,    //新用户礼包是否隐藏
    isphoneNumber: false,  //是否拿到手机号
    isfirst: false,
    item:'',
    selAddress:'',
    istouqu: false,
    isclose: false,
    goto: false,
    navbar: ['菜系专题', '服务专题'],
    sort: ['川湘菜','海鲜','火锅', '烧烤', '西餐', '自助餐', '聚会', '商务', '约会'],
    activityImg: '',   //活动图
    settime: null,
    rematime: '获取验证码',
    afirst: false,
    isclick: true,
    // 改版新增变量 
    _page: 1,
    posts_key: [],
    hotshop:[],
    bargainList:[],//砍价拼菜
    bargainListall:[],//拼菜砍价
    videolist:[],
    bannthree:[],
    actitem:'附近',
    isfile:false,
    navs: [
      {
        img: 'https://xqmp4-1256079679.file.myqcloud.com/text_701070039850928092.png',
        id: 1,
        name: '砍价'
      }, {
        img: '/images/icon/navcaiting.png',
        id: 2,
        name: '餐厅'
      // }, {
      //   img: '/images/icon/navruzhu.png',
      //   id: 3,
      //   name: '活动'
      }, {
        img: '/images/icon/navshiping.png',
        id: 4,
        name: '短视频'
      }, {
        img: '/images/icon/navhuodong.png',
        id: 5,
        name: '商家入驻'
      }
    ],
    navs2: [
      {
        img: 'https://xqmp4-1256079679.file.myqcloud.com/text_701070039850928092.png',
        id: 1,
        name: '砍价'
      }, {
        img: '/images/icon/navcaiting.png',
        id: 2,
        name: '餐厅'
      // }, {
      //   img: '/images/icon/navruzhu.png',
      //   id: 3,
      //   name: '活动'
      }, {
        img: '/images/icon/navshiping.png',
        id: 4,
        name: '微生活'
      }, {
        img: '/images/icon/navhuodong.png',
        id: 5,
        name: '商家入驻'
      }
    ],
    Res: [{
      img: '/images/icon/jxcanting.png',
      name: '精选餐厅',
      id: 1
    }],
    Vid: [{
      img: '/images/icon/duansp.png',
      name: '短视频',
      id: 2
    }],
    Vid2: [{
      img: '/images/icon/duansp.png',
      name: '微生活',
      id: 2
    }],
    Act: [{
      img: '/images/icon/home_sign.png',
      name: '热门活动',
      id: 3
    }],
    Bargain: [{
      img: '/images/icon/bargainImg.png',
      name: '拼菜砍价',
      id: 4
    }],
    fooddatas: ['附近', '人气', "自助餐", "湖北菜", "川菜", "湘菜", "粤菜", "咖啡厅", "小龙虾", "火锅", "海鲜", "烧烤", "江浙菜", "西餐", "料理", "其它美食"],
    ResThree: [
      {
        img: 'https://xq-1256079679.file.myqcloud.com/test_798888529104573275_0.8.jpg',
        id: 1,
        name: '享7券',
        dishtype: "湘菜",
        juli: '289',
        shopname: "恩施印像"
      }, {
        img: 'https://xq-1256079679.file.myqcloud.com/test_798888529104573275_0.8.jpg',
        id: 2,
        name: '餐厅',
        dishtype: "湘菜",
        juli: '289',
        shopname: "恩施印像"
      }, {
        img: 'https://xq-1256079679.file.myqcloud.com/test_798888529104573275_0.8.jpg',
        id: 3,
        name: '活动',
        dishtype: "湘菜",
        juli: '289',
        shopname: "恩施印像",
      }]
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...'
    });
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    });
    updateManager.onUpdateReady(function () {
      // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
      updateManager.applyUpdate()
    });
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
    });
    this.activityBanner();
    this.indexinit();
    this.getcarousel();
  },
  onShow: function () {
    let that = this;
    if (app.globalData.userInfo.city){
      this.setData({
        city: app.globalData.userInfo.city,
        posts_key: [],
        _page: 1
      })
    }
    wx.request({
      // url: this.data._build_url + 'act/flag', 
      url:'https://www.hbxq001.cn/version.txt',
      success: function (res) {
        if (res.data.flag == 0) { //0显示  
          app.globalData.isflag = true;
          that.setData({
            isfile:true
          })
        } else if (res.data.flag == 1) {  //1不显示
          app.globalData.isflag = false;
          that.setData({
            isfile: false
          })
        }
      }
    })
    // app.globalData.isflag = true;
    this.getmoredata();
  },
  indexinit: function () {
    let that = this, userInfo = app.globalData.userInfo;
    if (!app.globalData.userInfo.lat && !app.globalData.userInfo.lng && !app.globalData.userInfo.city) {
      this.getlocationsa();
    } else {
      this.setData({
        city: app.globalData.userInfo.city
      })
    }
    // this.getshoplist('附近',2);
   
    if (this.data.phone && this.data.veridyTime) {
      this.setData({
        userGiftFlag: false,
        isNew: true,
        isfirst: true,
        isphoneNumber: true
      })
    }
    if (userInfo.openId && userInfo.sessionKey && userInfo.unionId) {
      that.setData({
        istouqu: false
      })
      that.getmyuserinfo();
    } else {
      wx.login({
        success: res => {
          if (res.code) {
            let _parms = {
              code: res.code
            }

            // console.log("code:",res.code);
            // return false
            let that = this;
            Api.getOpenId(_parms).then((res) => {
              app.globalData.userInfo.openId = res.data.data.openId;
              app.globalData.userInfo.sessionKey = res.data.data.sessionKey;
              if (res.data.data.unionId) {
                app.globalData.userInfo.unionId = res.data.data.unionId;
                that.getmyuserinfo();
              } else {
                that.findByCode();
                wx.hideLoading();
              }
            })
          }
        }
      })
    }
  },
  onHide: function () {
    let that = this;
    clearInterval(that.data.settime)
    that.setData({
      userGiftFlag: false,
      isfirst: false,
      isNew: false
    });
  },
  // 点击One某个nav
  handnavOne(e) {
    let id = e.currentTarget.id;
    if (id == 1) { //砍菜
      // wx.navigateTo({
      //   url: 'consume-qibashare/consume-qibashare',
      // })
      wx.navigateTo({
        url: 'bargainirg-store/bargainirg-store',
      })
    } else if (id == 2) {  //餐厅
      wx.navigateTo({
        url: 'dining-room/dining-room',
      })
    } else if (id == 3) {  //活动
      wx.switchTab({
        url: '../activityDetails/activity-details',
      })
    } else if (id == 4) {  //短视频
      wx.switchTab({
        url: '../discover-plate/discover-plate',
      })
    } else if (id == 5) {  //商家入驻  APP下载
      wx.navigateTo({
        url: '../../pages/index/download-app/download?isshop=ind',
      })
    }
  },
  //点击某个“查看更多”
  handVeoRes(e) {
    let id = e.currentTarget.id,that = this;
    if (id == 1) {  //商家列表
      wx.navigateTo({
        url: 'dining-room/dining-room',
      })
    } else if (id == 2) {  //短视频
      wx.switchTab({
        url: '../discover-plate/discover-plate',
      })
    }else if(id ==3){ //活动列表
      wx.switchTab({
        url: '../activityDetails/activity-details',
      })
    }else if(id == 4){  //拼菜砍价列表
      wx.navigateTo({
        url: 'bargainirg-store/bargainirg-store',
      })
    }
  },
  //点击精选餐厅下的入驻图片
  handbaoming(e) {
    let id = e.currentTarget.id, ind = e.currentTarget.dataset.ind;
    let reg1 = new RegExp("shopId"), reg2 = new RegExp("topicId"), reg3 = new RegExp("actId"), reg4 = new RegExp("type");
    let arr = this.data.bannthree;
    if (id == 1) {
      let str = arr[0].linkUrl;
      if (str == "ruzhu"){  //进入下载APP页面
        wx.navigateTo({
          url: '../../pages/index/download-app/download?isshop=ind',
        })
      }else if (reg1.test(str)){  //进入某个店铺
        let _arr = str.split("=");
        wx.navigateTo({
          url: 'merchant-particulars/merchant-particulars?shopid=' + _arr[1]
        })
      } else if (reg3.test(str) && reg4.test(str)){  //进入某个活动页面
        let _arr = str.split("&");
        let arr1 = _arr[0].split('='), arr2 = _arr[1].split('=');
        if (arr2[1] == 1) {
          wx.navigateTo({
            url: '../activityDetails/onehundred-dish/onehundred-dish?actid=' + arr1[1],
          })
        } else if (arr2[1] == 2) {
          wx.navigateTo({
            url: '../activityDetails/video-list/video-list?id=' + arr[1],
          })
        }
      }
    } else if (id == 2) {
      let str = arr[1].linkUrl;
      if (reg2.test(str)) {  //去文章或视频详情页面
        let _arr = str.split("=");
        this.getoddtopic(_arr[1]);
      } else if (reg3.test(str) && reg4.test(str)){ //去某一活动页面
        let _arr = str.split("&");
        let arr1 = _arr[0].split('='), arr2 = _arr[1].split('=');
        if(arr2[1] == 1){
          wx.navigateTo({
            url: '../activityDetails/onehundred-dish/onehundred-dish?actid=' + arr1[1],
          })
        }else if(arr2[1] == 2){
          let _linkUrl = arr[1].linkUrl;
          let aarr = _linkUrl.split("&"), _obj = {};
          for (let i in aarr) {
            let arr2 = aarr[i].split("=");
            _obj[arr2[0]] = arr2[1];
          }
          wx.navigateTo({
            url: '../activityDetails/video-list/video-list?id=' + _obj.actId,
          })
        }
      }
    } else if (id == 3) {//点击商家广告位，进入指定商家页面
        let str = arr[2].linkUrl;
        if (reg1.test(str)) {
          let _arr = str.split("=");
          wx.navigateTo({
            url: 'merchant-particulars/merchant-particulars?shopid=' + _arr[1]
          })
        }
    }
  },
  //点击推荐的三个餐厅之一
  handResitem(e) {
    let shopid = e.currentTarget.id;
    wx.navigateTo({
      url: 'merchant-particulars/merchant-particulars?shopid=' + shopid
    })
  },

  //点击拼菜砍价之一
  candyDetails(e){
    let id = e.currentTarget.id, shopId = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: 'bargainirg-store/CandyDishDetails/CandyDishDetails?id=' + id + '&shopId=' + shopId
    })
  },
  //点击推荐短视频之一
  handViditem(e) {
    let id = e.currentTarget.id, _videolist = this.data.videolist,zan='',userid='';
    if (app.globalData.isflag){
      for (let i in _videolist) {
        if (id == _videolist[i].id) {
          zan = _videolist[i].zan;
          userid = _videolist[i].userId;
        }
      }
      wx.navigateTo({
        url: '../activityDetails/video-details/video-details?id=' + id + '&zan=' + zan + '&userId=' + userid,
      })
    }
    
  },
  //选择某个分类
  handfood(e) {
    let val = e.currentTarget.id;
    this.setData({
      actitem:val,
      _page:1
    })
    if(val == '全部'){
      this.getshoplist();
    }else{
      this.getshoplist(val);
    }
  },
  //选择某个商家 
  handdish(e) {
    let shopid = e.currentTarget.id;
    wx.navigateTo({
      url: 'merchant-particulars/merchant-particulars?shopid=' + shopid
    })
  },
  findByCode: function () {
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({ code: res.code }).then((res) => {
          if (res.data.code == 0) {
            if (res.data.data.unionId) {
              app.globalData.userInfo.unionId = res.data.data.unionId;
              that.getmyuserinfo();
            } else {
              wx.hideLoading();
              that.setData({
                istouqu: true
              })
            }
          } else {
            that.findByCode();
            wx.hideLoading();
            that.setData({
              istouqu: true
            })
          }
        })
      }
    })
  },
  againgetinfo: function () { //点击获取用户unionId
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
            that.getmyuserinfo();
          }
        })
      }
    })
  },
  getmyuserinfo: function () {
    let _parms = {
      openId: app.globalData.userInfo.openId,
      unionId: app.globalData.userInfo.unionId
    }, that = this;
    Api.addUserUnionId(_parms).then((res) => {
      if (res.data.data) {
        app.globalData.userInfo.userId = res.data.data;
        wx.request({  //从自己的服务器获取用户信息
          url: this.data._build_url + 'user/get/' + res.data.data,
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.code == 0) {
              let data = res.data.data;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              };
              that.isNewUser();
              that.getmoredata();
              if (data && data.mobile) {
                that.setData({
                  isfirst: false,
                  isNew: false
                })
              } else {
                that.setData({
                  isfirst: true,
                  isNew: true
                })
              }
            }
          }
        })
      }
    })
  },
  navbarTap: function (e) {// 专题推荐栏
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  onPullDownRefresh: function () { //下拉刷新
    this.getmoredata();
  },
  getmoredata: function () {  //获取更多数据
    this.getactlist();
    // this.getshoplist();
    this.gettopiclist();
    this.gettoplistFor();
    this.hotDishList();
    return false;



    this.gethotlive();
    this.getdata();
    this.getactlist();
    this.gettopic();
    
  },
  //获取动态
  gettopiclist: function (_type, data) {
    let that = this,vodeoarr=[];
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    })
    let _parms = {
      page: 1,
      row: 5,
      topicType:2
    }
    Api.topiclist(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.hideLoading()
        if (res.data.data.list != null && res.data.data.list != "" && res.data.data.list != []) {
          let footList = res.data.data.list;
          for (let i = 0; i < footList.length; i++) {
            footList[i].summary = utils.uncodeUtf16(footList[i].summary);
            footList[i].content = utils.uncodeUtf16(footList[i].content);
            footList[i].timeDiffrence = utils.timeDiffrence(res.data.currentTime, footList[i].updateTime, footList[i].createTime)
            if (footList[i].content) {
              footList[i].content = JSON.parse(footList[i].content)
            }
            footList[i].hitNum = utils.million(footList[i].hitNum)
            footList[i].commentNum = utils.million(footList[i].commentNum)
            footList[i].transNum = utils.million(footList[i].transNum)
            if (!footList[i].nickName || footList[i].nickName == 'null') {
              footList[i].nickName = '';
              footList[i].userName = footList[i].userName.substr(0, 3) + "****" + footList[i].userName.substr(7);
            }

            if (footList[i].content[0].type != 'video' || footList[i].topicType == 1) { //文章
              footList[i].isimg = true;
            } else {  //视频
              footList[i].isimg = false;
              footList[i].clickvideo = false;
              vodeoarr.push(footList[i]);  //视频
            }
            // _data.push(footList[i]);
          }
          vodeoarr = vodeoarr.slice(0, 3);
          for (let i in vodeoarr) {
            let _str = vodeoarr[i].title;
            if(_str.length>6){
              _str = _str.slice(0, 6);
              vodeoarr[i].title = _str + '...';
            }
          }
          this.setData({
            videolist: vodeoarr
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
  },
  getoddtopic: function (id) {  //获取单个文章内容数据
    let _parms = {
      id: id,
      zanUserId: app.globalData.userInfo.userId,
      zanUserName: app.globalData.userInfo.usrName,
      zanSourceType: '1'
    }
    Api.getTopicByZan(_parms).then((res) => {
      if (res.data.code == 0) {
        let _data = res.data.data;
        _data.summary = utils.uncodeUtf16(_data.summary)
        _data.content = utils.uncodeUtf16(_data.content)
        _data.timeDiffrence = utils.timeDiffrence(res.data.currentTime, _data.updateTime, _data.createTime)
        _data.content = JSON.parse(_data.content);
        _data.hitNum = utils.million(_data.hitNum)
        _data.zan = utils.million(_data.zan)
        let reg = /^1[34578][0-9]{9}$/, zan = _data.zan;
        if (reg.test(_data.userName)) {
          _data.userName = _data.userName.substr(0, 3) + "****" + _data.userName.substr(7);
        }

        if (_data[i].content[0].type == 'video' || _data[i].topicType == 2) { //视频
          wx.navigateTo({
            url: '../activityDetails/video-details/video-details?id=' + id + '&zan=' + zan,
          })
        } else if (_data[i].content[0].type == 'img' || _data[i].content[0].type == 'text' || _data[i].topicType == 1) { //文章
          wx.navigateTo({
            url: '../discover-plate/dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan,
          })
        }
      }
    })
  },
  //获取商家列表
  getshoplist(val,keys) {  
    let lat = '30.51597', lng = '114.34035';  //lat纬度   lng经度
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    })
    let _parms = {
      locationX: app.globalData.userInfo.lng ? app.globalData.userInfo.lng : lng,
      locationY: app.globalData.userInfo.lat ? app.globalData.userInfo.lat : lat,
      city: app.globalData.userInfo.city,
      page: this.data._page,
      rows: 8
    }
    if (val && val !='全部') { //美食类别 
      if(val == '人气'){
        _parms.browSort = 2
      }else if(val == '附近'){
        
      }else{
        _parms.businessCate = val;
      }
      
      this.setData({
        posts_key: []
      })
    }
    if (keys){
      _parms.browSort = 2
    }
    Api.shoplist(_parms).then((res) => {
      let that = this, data = res.data;
      wx.hideLoading();
      if (data.code == 0) {
        if (data.data.list != null && data.data.list != "" && data.data.list != []) {
          wx.stopPullDownRefresh()
          let posts = this.data.posts_key;
          let _data = data.data.list
          for (let i = 0; i < _data.length; i++) {
            let _arr = _data[i].businessCate.split('/');
            _data[i].inessCate = _arr[0];
            _data[i].distance = utils.transformLength(_data[i].distance);
            _data[i].activity = _data[i].ruleDescs ? _data[i].ruleDescs.join(',') : '';
            posts.push(_data[i])
          }
          that.setData({
            posts_key: posts
          })
          let _arrn = posts.slice(0, 3);
          let newarr = _arrn.concat();
          for (let i in newarr) {
            let _str = newarr[i].shopName;
            if(_str.length>7){
              _str = _str.slice(0, 7);
              newarr[i].shopName = _str + '...';
            }
          }
          that.setData({
            hotshop: newarr,
          });
        } else {
          this.setData({
            isclosure: false
          })
        }
      }
    })

  },
  //回到顶部
  toTop(){
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
    this.setData({
      _page:1
    })
  },
  onReachBottom: function () {  //用户上拉触底加载更多
    if (!app.globalData.userInfo.mobile) {
      return false
    }
    this.setData({
      _page:this.data._page+1
    })
    // this.getshoplist();
    this.hotDishList();
    if (!this.data.alltopics) {
      this.gettoplistFor()
    }
  },
  gettoplistFor: function () {  //加载分类数据
    let _list = [], _shop = [], that = this;
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    })
    Api.listForHomePage().then((res) => {
      if (res.data.code == 0) {
        _list = res.data.data;
        if (!_list) {
          that.gettoplistFor();
        }else{
          // bannthree
          let listarr = _list.slice(0, 3);
          that.setData({
            bannthree:listarr
          })
        }
        return false;
        let _parms = {
          locationX: app.globalData.userInfo.lng,
          locationY: app.globalData.userInfo.lat,
          browSort: 2,
          page: 1,
          rows: 5
        }
        Api.shoplistForHomePage(_parms).then((res) => {
          if (res.data.code == 0) {
            wx.hideLoading()
            let arr = [];
            _shop = res.data.data;
            for (let i = 0; i < _list.length; i++) {
              for (let j in _shop) {
                if (j == _list[i].type) {
                  let obj = {
                    img: _list[i],
                    cate: that.data.sort[i],
                    data: _shop[j]
                  }
                  arr.push(obj)
                }
              }
            };
            let [...newarr] = arr;
            that.setData({
              alltopics: newarr,
              restaurant: arr.slice(0, 6), //菜系专题
              service: arr.slice(6, arr.length)
            })
          } else {
            wx.hideLoading()
            wx.showToast({
              title: res.data.message,
              icon: 'none',
            })
          }
        });
      } else {
        this.gettoplistFor();
      }
    })
  },
  getlocationsa: function () {  //获取用户位置
    // console.log("getlocationsa")
    let that = this,lat = '', lng = ''
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        that.requestCityName(latitude, longitude);
      },
      fail: function (res) {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户信息或位置信息
              wx.showModal({
                title: '提示',
                content: '更多体验需要你授权位置信息',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({  //打开授权设置界面
                      success: (res) => {
                        if (res.authSetting['scope.userLocation']) {
                          wx.getLocation({
                            type: 'wgs84',
                            success: function (res) {
                              let latitude = res.latitude, longitude = res.longitude
                              app.globalData.userInfo.lat = latitude;
                              app.globalData.userInfo.lng = longitude;
                              that.requestCityName(latitude, longitude);
                              that.getlocationsa();
                            }
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  },
  requestCityName(lat, lng) {//获取当前城市
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
          app.globalData.userInfo.city = _city;
          this.setData({
            city: _city,
            alltopics: [],
            restaurant: [],
            service: []
          })
          // this.getmoredata();
          app.globalData.picker = res.data.result.address_component;
        }
      }
    })
  },
  getcarousel: function () {  //轮播图
    let that = this;
    if (!this.data.carousel) {
      return false
    }
    Api.hcllist().then((res) => {
      // console.log("carousel:",res.data.data)
      if (res.data.data) {
        this.setData({
          carousel: res.data.data
        })
      } else {
        this.getcarousel();
      }
    })
  },
  getdata: function () { // 获取推荐餐厅数据
    let lat = '30.51597', lng = '114.34035';
    let _parms = {
      locationX: app.globalData.userInfo.lng ? app.globalData.userInfo.lng : lng,
      locationY: app.globalData.userInfo.lat ? app.globalData.userInfo.lat : lat,
    }
    Api.shoptop(_parms).then((res) => {
      // console.log("businss:",res.data.data)
      if (res.data.data) {
        this.setData({
          business: res.data.data
        })
      } else {
        this.getdata();
      }
    })
  },
  gettopic: function () {  // 美食墙
    Api.topictop().then((res) => {
      // console.log("food:", res.data.data)
      if (res.data.data) {
        let _data = res.data.data;
        let reg = /^1[34578][0-9]{9}$/;
        for (let i = 0; i < _data.length; i++) {
          _data[i].summary = utils.uncodeUtf16(_data[i].summary);
          _data[i].content = utils.uncodeUtf16(_data[i].content);
          if (reg.test(_data[i].userName)) {
            _data[i].userName = _data[i].userName.substr(0, 3) + "****" + _data[i].userName.substr(7);
          }
          if (reg.test(_data[i].nickName)) {
            _data[i].nickName = _data[i].nickName.substr(0, 3) + "****" + _data[i].nickName.substr(7);
          }
        }
        this.setData({
          food: res.data.data
        })
        wx.hideLoading();
      } else {
        this.gettopic();
      };
    })
  },
  getactlist() {  //获取热门活动数据
    Api.actlist().then((res) => {
      // console.log("actlist:",res)
      if (res.data.data.list) {
        this.setData({
          actlist: res.data.data.list.slice(0, 10)
        })
      } else {
        this.getactlist();
      }
    })
  },
  gethotlive() {  //获取热门直播数据
    let that = this;
    wx.request({
      url: that.data._build_url + 'zb/top/',
      success: function (res) {
        // console.log("hotlive:",res.data.data)
        if (res.data.data) {
          that.setData({
            hotlive: res.data.data
          })
        } else {
          that.gethotlive();
        }
      }
    })
  },
  userLocation: function () {   // 用户定位
    wx.navigateTo({
      url: 'user-location/user-location',
    })
  },
  seekTap: function () {   //用户搜索
    wx.navigateTo({
      url: 'user-seek/user-seek',
    })
  },
  discountCoupon: function () {  //用户优惠券
    wx.navigateTo({
      url: '../personal-center/my-discount/my-discount',
    })
  },
  shopping: function () {
    wx.navigateTo({
      url: 'consume-qibashare/consume-qibashare',
    })
  },
  entertainment: function () {  //掌上生活
    wx.navigateTo({
      // url: '../../pages/personal-center/free-of-charge/free-of-charge?cfrom=index',
      url: '../../pages/index/download-app/download',
    })
  },
  activityBanner: function () {      //获取活动banner图
    let that = this;
    Api.activityImg().then((res) => {
      if (res.data.code == 0) {
        if (res.data.data && res.data.data[9] && res.data.data[9].imgUrl) {
          let imgUrl = res.data.data[9].imgUrl;
          if (imgUrl != '' && imgUrl != null && imgUrl != undefined) {
            that.setData({
              activityImg: imgUrl
            })
          }
        }
      }
    })
  },
  recommendCt: function (event) {  //跳转到商家列表页面
    wx.navigateTo({
      url: 'dining-room/dining-room',
    })
  },
  cateWall: function (event) {  //美食墙 查看更多
    wx.switchTab({
      url: '../discover-plate/discover-plate',
    })
  },
  preferential: function (event) {
    let id = event.currentTarget.id, _actlist = this.data.actlist,_obj={};
    // console.log('_actlist:', _actlist);
    for (let i in _actlist){
      if (id == _actlist[i].id){
        _obj = _actlist[i];
      }
    }
    
    wx.switchTab({
      url: '../activityDetails/activity-details',
    })
  },
  diningHhall: function (event) {  //跳转到商家（餐厅）内页
    const shopid = event.currentTarget.id;
    wx.navigateTo({
      url: 'merchant-particulars/merchant-particulars?shopid=' + shopid
    })
  },
  fooddetails: function (e) {  //跳转美食墙内页
    const id = e.currentTarget.id
    let _data = this.data.food
    let zan = ''
    for (let i = 0; i < _data.length; i++) {
      if (id == _data[i].id) {
        zan = _data[i].zan;
        _data[i].content = JSON.parse(_data[i].content);
        if (_data[i].content[0].type == 'video' || _data[i].topicType == 2) { //视频
          wx.navigateTo({
            url: '../activityDetails/video-details/video-details?id=' + id + '&zan=' + zan,
          })
        } else if (_data[i].content[0].type == 'img' || _data[i].content[0].type == 'text' || _data[i].topicType == 1) { //文章
          wx.navigateTo({
            url: '../discover-plate/dynamic-state/article_details/article_details?id=' + id + '&zan=' + zan,
          })
        }
      }
    }


  },
  detailOfTheActivity: function (event) { //跳转到活动内页
    const actid = event.currentTarget.id
    // console.log("actid:",actid)
    wx.navigateTo({
      url: '../activityDetails/details-like/details-like?actid=' + actid,
    })
  },
  tolive: function (ev) { //跳转到直播内页
    const liveid = ev.currentTarget.id
    // console.log("liveid:",liveid)
    // wx.navigateTo({
    //   url: 'test?liveid=' + liveid,
    // })
  },
  cctvwebview: function (event) {  //享7直播页面路径
    wx.showToast({
      title: "即将开发",
      icon: 'none',
    })
    // wx.navigateTo({
    //   url: './livepage/livepage'
    // })
  },
  toNewExclusive: function (e) {   //跳转至新人专享页面
    let id = e.currentTarget.id, _linkUrl = '', _type = '', _obj = {};
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        issnap: true
      })
      return false
    }
    for (let k in this.data.carousel) {
      if (id == this.data.carousel[k].id) {
        _linkUrl = this.data.carousel[k].linkUrl,
        _type = this.data.carousel[k].type
      }
    }

    if (_linkUrl.indexOf('&') >= 0){
      let arr = _linkUrl.split("&");
      for (let i in arr) {
        let arr2 = arr[i].split("=");
        _obj[arr2[0]] = arr2[1];
      }
    }
   
    if (_linkUrl == 'lingquan') {
      wx.navigateTo({
        url: 'new-exclusive/new-exclusive',
      })
    } else if (id == 1) {
      return false
      wx.navigateTo({
        url: '../personal-center/free-of-charge/free-of-charge?img=' + _linkUrl,
      })
    } else if ( _obj.type == 1) {  //十堰食典
      wx.navigateTo({
        url: '../activityDetails/onehundred-dish/onehundred-dish?actid=' + _obj.actId,
      })
    } else if (_obj.type == 2) {  //视频活动
      wx.navigateTo({
        url: '../activityDetails/video-list/video-list?id=' + _obj.actId,
      })
    } else if(_obj.type == 3) {  //店铺主页
      wx.navigateTo({
        url: 'merchant-particulars/merchant-particulars?shopid=' + _obj.shopId,
      })
    }
  },
  hotactivityHref: function (e) {     //热门活动跳转
    let _id = e.currentTarget.id,_obj={};
    let _actlist = this.data.actlist, _actName = '';
    for (let i = 0; i < _actlist.length; i++) {
      if (_id == _actlist[i].id) {
        _obj = _actlist[i];
        _actName = _actlist[i].actName
      }
    }
    if (_obj.type ==1){
      wx.navigateTo({
        url: '../activityDetails/onehundred-dish/onehundred-dish?actid='+_obj.id,
      })
    } else if (_obj.type == 2){
      wx.navigateTo({
        url: '../activityDetails/video-list/video-list?id=' + _obj.id,
      })
    }
    

    // wx.navigateTo({
    //   url: '../activityDetails/onehundred-dish/onehundred-dish?actid=37',
    // })


    // if (_id == 37) {
    //   wx.navigateTo({
    //     url: '../activityDetails/onehundred-dish/onehundred-dish?actid=' + _id
    //   })
    //   // } else if (_id == 35) {
    //   //   wx.navigateTo({
    //   //     url: '../activityDetails/hot-activity/hot-activity?id=' + _id + '&_actName=' + _actName
    //   //   })
    //   // } else if (_id == 36) {
    //   //   wx.navigateTo({
    //   //     url: '../activityDetails/hot-activity/hot-activity?id=' + _id
    //   //   })
    // } else {
    //   wx.navigateTo({
    //     url: '../activityDetails/details-like/details-like?actid=' + _id,
    //   })
    // }
  },
  clickimg: function (e) {  //点击专题图片 --某个分类
    let ind = e.currentTarget.id
    let arr = this.data.alltopics, cate = ''
    for (let i = 0; i < arr.length; i++) {
      if (ind == arr[i].img.id) {
        cate = arr[i].cate
      }
    }
    wx.navigateTo({
      url: 'dining-room/dining-room?cate=' + cate,
    })
  },
  clickcon: function (e) {  //點擊某一傢點
    let shopid = e.currentTarget.id;
    wx.navigateTo({
      url: 'merchant-particulars/merchant-particulars?shopid=' + shopid
    })
  },
  //监听页面分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '享7美食',
      path: 'pages/index/index',
      imageUrl: 'https://xq-1256079679.file.myqcloud.com/test_242386103115353639_0.8.jpg',
      success: function (res) {
        // 转发成功
        console.log("res:", res)
      },
      fail: function (res) {
        // 转发失败
        console.log("res:", res)
      }
    }
  },
  isNewUser: function () {   //判断是否新用户
    let that = this;
    let _parms = {
      userId: app.globalData.userInfo.userId
    };
    Api.isNewUser(_parms).then((res) => {
      if (res.data.code == 0) {
        that.setData({
          isNew: true
        })
      } else {
        that.setData({
          isNew: false
        })
      }
    })
  },
  userGiftCancle: function () {    //新用户领取代金券
    this.setData({
      userGiftFlag: false,
      isfirst: false,
      isNew: false,
      phone: '',
      veridyTime: ''
    })
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        getPhoneNumber: true
      })
    }
  },
  newUserToGet: function () {    //新用户跳转票券
    let that = this;
    if (!app.globalData.userInfo.mobile) {
      this.setData({
        isphoneNumber: true
      })
      return false
    }
    this.setData({
      isfirst: false
    })
    let _parms = {
      userId: app.globalData.userInfo.userId,
      userName: app.globalData.userInfo.userName,
      payType: '2',
      skuId: '8',
      skuNum: '1'
    }
    Api.getFreeTicket(_parms).then((res) => {
      if (res.data.code == 0) {
        this.userGiftCancle()
        wx.navigateTo({
          url: '../personal-center/my-discount/my-discount'
        })
      } else {
        that.setData({
          userGiftFlag: false,
          isfirst: false,
          isNew: false
        })
        wx.showToast({
          title: res.data.message,
          mask: 'true',
          icon: 'none',
          duration
        })
      }
    })
  },
  hotDishList() {  //拼价砍菜列表
    //browSort 0附近 1销量 2价格
    let _parms = {
      zanUserId: app.globalData.userInfo.userId,
      browSort: 2,
      locationX: app.globalData.userInfo.lng,
      locationY: app.globalData.userInfo.lat,
      page: this.data._page,
      rows: 10
    };
    Api.partakerList(_parms).then((res) => {
      if(res.data.code == 0){
        let _list = res.data.data.list, _oldData = this.data.bargainListall, arr = [];
        if (this.data._page == 1){
          this.setData({
            bargainList: _list.splice(0, 3)
          })
        }
        console.log("bargainList:", this.data.bargainList)
        arr = _oldData.concat(_list);
        this.setData({
          bargainListall: arr
        })
      }
    })
  },
  closebut: function () {
    this.setData({
      isphoneNumber: false
    })
  },
  closetel: function (e) {
    let id = e.target.id;
    clearInterval(this.data.settime)
    this.setData({
      issnap: false
    })
    if (id == 1) {
      wx.navigateTo({
        url: '/pages/personal-center/registered/registered'
      })
    }
  },
  numbindinput: function (e) {  //监听号码输入框
    let _value = e.detail.value
    if (!_value) {
      this.closephone()
    }
    let RegExp = /^[1][3,4,6,5,7,8,9][0-9]{9}$/;
    if (RegExp.test(_value)) {
      this.setData({
        isclose: true,
        phone: _value
      })
    } else {
      this.setData({
        isclose: false
      })
    }
  },

  closephone: function () {  //手机号置空
    clearInterval(this.data.settime)
    this.setData({
      phone: '',
      rematime: '获取验证码',
      isclick: true,
      goto: false,
      settime: null
    })
  },
  submitphone: function () {  //获取验证码
    let that = this, sett = null;
    if (!this.data.phone) {
      that.closephone();
      wx.showToast({
        title: '请正确输入手机号',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      return false
    }
    if (this.data.goto) {
      return false
    }
    let RegExp = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (RegExp.test(this.data.phone)) {
      this.setData({
        goto: true
      })
      if (this.data.settime) {
        clearInterval(that.data.settime)
      }
      let _parms = {
        shopMobile: that.data.phone,
        userId: app.globalData.userInfo.userId,
        userName: app.globalData.userInfo.userName
      }
      Api.sendForRegister(_parms).then((res) => {  //获取手机验证码
        if (res.data.code == 0) {
          // console.log('res.data.data:', res.data.data)
          that.setData({
            verifyId: res.data.data.verifyId,
            veridyTime: res.data.data.veridyTime,
            goto: false
          })
          sett = setInterval(function () {
            that.remaining();
          }, 1000)
          that.setData({
            settime: sett
          })
        }
      })
    } else {
      wx.showToast({
        title: '电话号码输入有误，请重新输入',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      this.setData({
        isclose: false,
        phone: ''
      })
    }
  },
  yzmbindblur: function (e) {  //监听获取输入的验证码
    let _value = e.detail.value
    this.setData({
      verify: _value
    })
  },
  remaining: function (val) {  //倒计时
    let _vertime = this.data.veridyTime.replace(/\-/ig, "\/"), rema = 60;
    rema = utils.reciprocal(_vertime);
    if (rema == 'no' || rema == 'yes' || !rema) {
      clearInterval(this.data.settime)
      this.setData({
        rematime: '获取验证码',
        isclick: true
      })
    } else {
      this.setData({
        rematime: rema
      })
    }
  },
  submitverify: function () {  //确定
    let that = this;
    if (this.data.phone && this.data.verify) {
      if (this.data.verify == this.data.verifyId) {
        that.setData({
          isphoneNumber: false
        })
        if (this.data.afirst) {
          return false
        }
        let _parms = {
          shopMobile: this.data.phone,
          SmsContent: this.data.verify,
          userId: app.globalData.userInfo.userId
        }
        if (app.globalData.userInfo.userName) {
          _parms.userName = app.globalData.userInfo.userName
        }
        if (!this.data.afirst) {
          that.setData({
            afirst: true
          })
        }
        Api.isVerify(_parms).then((res) => {
          if (res.data.code == 0) {
            app.globalData.userInfo.userId = res.data.data;
            that.setData({
              isNew: false,
              isfirst: false,
              userGiftFlag: false,
              phone: '',
              veridyTime: ''
            })
            wx.request({  //从自己的服务器获取用户信息
              url: this.data._build_url + 'user/get/' + res.data.data,
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                if (res.data.code == 0) {
                  let data = res.data.data;
                  let users = app.globalData.userInfo
                  for (let key in data) {
                    for (let ind in users) {
                      if (key == ind) {
                        users[ind] = data[key]
                      }
                    }
                  }
                  // if (data.mobile) {
                  //   that.newUserToGet();
                  // }

                  that.isNewUser();
                }
              }
            })
            that.setData({
              verifyId: ''
            })
          }
        })
      } else {
        wx.showToast({
          title: '验证码输入有误，请重新输入',
          icon: 'none',
          mask: 'true',
          duration: 2000
        })
      }
    } else if (!this.data.phone) {
      wx.showToast({
        title: '请输入电话号码，获取验证码',
        icon: 'none',
        mask: 'true',
        duration: 2000
      });
    } else if (!this.data.verify) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        mask: 'true',
        duration: 2000
      });
    }
  }
})




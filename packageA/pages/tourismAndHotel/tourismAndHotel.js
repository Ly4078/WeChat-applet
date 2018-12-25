import {
  GLOBAL_API_DOMAIN
} from '../../../utils/config/config.js';
import Countdown from '../../../utils/Countdown.js'
import Api from '../../../utils/config/api.js';
var app = getApp();
var requestTask = false
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    selected: true,
    shadowFlag: true, //活动详情,
    page:1,
    skeletonData:['','','','',''],
    showSkeleton:true,
    total:1,
    loading:false,
    endpage:1,
    endData:[],
    endtotal:1,
    fiexd:false
  },
  onLoad: function(options) {
    let that = this;
    var query = wx.createSelectorQuery();
    query.select('.maximumImg').boundingClientRect(function (qry) {
      console.log(qry)
      that.setData({
        bannerHeight: qry.height
      })
      var h = qry.height;//此处提示错误：不能获取null的height
    }).exec();

    this.setData({
      actid: options.id
    })
    
  },
  onPageScroll:function(e){
    if (e.scrollTop > this.data.bannerHeight){
      if (this.data.fiexd){
        return false
      }
      this.setData({
        fiexd:true
      })
    }else{
      if (!this.data.fiexd) {
        return false
      }
      this.setData({
        fiexd: false
      })
    }
  },
  onShow: function() {
    let that = this;
    if (!app.globalData.token) {
      that.findByCode();
    } else {
      that.getSingleList(that.data.actid, 'reset');
    }
  },
  findByCode: function () { //通过code查询用户信息
    let that = this;
    wx.login({
      success: res => {
        Api.findByCode({
          code: res.code
        }).then((res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            console.log(res)
            if (data.id) {
              app.globalData.userInfo.userId = data.id;
              for (let key in data) {
                for (let ind in app.globalData.userInfo) {
                  if (key == ind) {
                    app.globalData.userInfo[ind] = data[key]
                  }
                }
              }
              that.authlogin(); //获取token
            } else {
              if (!data.mobile) { //是新用户，去注册页面
                wx.navigateTo({
                  url: '/pages/init/init?isback=1'
                })
              } else {
                that.authlogin();
              }
            }
          } else {
            that.findByCode();
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
          let userInfo = wx.getStorageSync('userInfo') || {}
          userInfo.token = _token
          wx.setStorageSync("token", _token)
          wx.setStorageSync("userInfo", userInfo)
          that.getSingleList(that.data.actid, 'reset');
          if (app.globalData.userInfo.mobile) {

          } else {
            wx.navigateTo({
              url: '/pages/init/init?isback=1',
            })
          }
        }
      }
    })
  },
  getSingleList: function(actid,types) {
    let that = this;
    requestTask = true;
    wx.request({
      url: that.data._build_url + 'goodsSku/listForAct?actId=' + actid + '&rows=10&page=' + that.data.page,
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success: function(res) {
        if (res.data.code == '0') {
          if (res.data.data && res.data.data.list && res.data.data.list.length) {
            let _data = res.data.data.list
            for (let i = 0; i < _data.length; i++) {
              for (let j = 0; j < _data[i].goodsPromotionRules.length; j++) {
                if (_data[i].goodsPromotionRules[j].ruleType == '7') {
                  _data[i].goodsPromotionRules[0] = _data[i].goodsPromotionRules[j]
                }
              }
              try{
                _data[i].actGoodsSkuOut.stopTime = Countdown(_data[i].actGoodsSkuOut.dueTime)

              }catch(err){

              }
            }
            let arr = [];
            if (types == 'reset'){
              arr = _data
            }else{
              let dataList = that.data.dataList ? that.data.dataList:[];
              arr = dataList.concat(_data)
            }
            that.setData({
              dataList: arr,
              total: Math.ceil(res.data.data.total / 10),
              showSkeleton:false,
              loading:false
            })
            requestTask = false
          }else{
            requestTask = false
            that.setData({
              showSkeleton: false,
              loading: false})
          }
        }else{
          requestTask = false
          that.setData({
            showSkeleton: false,
            loading: false })
        }

      },
      fail: function(res) {
        requestTask = false
        that.setData({
          showSkeleton: false,
          loading: false })
      }
    })
  },
  getendList(actid, types){
    let that = this;
    wx.request({
      url: that.data._build_url +'goodsSku/listForEndAct?actId='+actid+'&rows=10&page='+that.data.endpage+'&groupState=2',
      method: 'get',
      header: {
        "Authorization": app.globalData.token
      },
      success(res){
        if(res.data.code == '0' && res.data.data) {
          let arr = [];
          let _data = res.data.data.list
          if (types == 'reset') {
            arr = _data
          } else {
            let endData = that.data.endData ? that.data.endData : [];
            arr = endData.concat(_data)
          }
          that.setData({
            endData: arr,
            endtotal: Math.ceil(res.data.data.total / 10),
            showSkeleton: false,
            loading: false
          })
          requestTask = false
        }else{
          wx.hideLoading()
          requestTask = false
          that.setData({loading: false})
        }
        
      },fail: function (res) {
        requestTask = false
        that.setData({ showSkeleton: false, loading: false })
      }
    })
  },
  onReachBottom:function(){
    let that = this;
    if (requestTask){
      return false
    } 
    if(that.data.selected){
      if (that.data.total <= that.data.page) {
        return
      }
      that.setData({
        page: that.data.page + 1,
        loading:true
      }, () => {
        that.getSingleList(that.data.actid);
      })
    }else{
      if (that.data.endtotal <= that.data.endpage) {
        return
      }
      that.setData({
        endpage: that.data.endpage + 1,
        loading: true
      }, () => {
        that.getendList(that.data.actid);
      })
    }
    
    
  },
  selected: function(e) {
    let that = this;
    let id = e.target.id;
    if(id == '2') {
      if(!that.data.endData.length){
        that.getendList(that.data.actid, 'reset');
      }        
    }else{
      if (!that.data.dataList.length) {
        that.getSingleList(that.data.actid,'reset');
      } 
    }
    this.setData({
      selected: e.target.id == 1 ? true : false
    })
  },
  // 遮罩层显示
  showShade: function() {
    this.setData({
      shadowFlag: false
    })
  },
  // 遮罩层隐藏
  conceal: function() {
    this.setData({
      shadowFlag: true
    })
  },
  //进入详情
  hoteDils: function(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let groupid = e.currentTarget.dataset.groupid;
    wx.navigateTo({
      url: 'touristHotelDils/touristHotelDils?id=' + id + '&actid=' + that.data.actid + '&groupid=' + groupid,
    })
  },
  onShareAppMessage: function() {
      return {
        title:'享7拼购',  imageUrl:'https://xq-1256079679.file.myqcloud.com/15927505686_1545388526_tuangou12321312321_0.png'
      }
  }
})
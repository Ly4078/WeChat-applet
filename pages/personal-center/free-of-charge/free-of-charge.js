import Api from '/../../../utils/config/api.js'
import { GLOBAL_API_DOMAIN } from '/../../../utils/config/config.js'
var utils = require('../../../utils/util.js')
var app = getApp()
Page({

  /**  free-of-charge
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,   //域名
    prompt: '入驻提示：商家需有具体餐饮实体店铺、有营业执照和许可证等方可申请入驻',
    userName: '',
    mobile: '',
    ztmobile: '',
    shopName: '',
    address: '',
    deaddress: '',
    businessCate: '',
    licensePic: '',
    healthPic: '',
    doorPic: '',
    locationX: '',
    locationY: '',
    city: '',
    index: 0,
    sortype: '',
    sort: ['商务', '聚会', '约会'],
    intype: '',
    isrepeat: false,
    isorder:true,
    img:'',
    totable:false,
    isindex:false,
    _shopid: app.globalData.userInfo.shopId
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (options.cfrom){
      this.setData({
        isindex:true
      })
    }
    if(options.img){
      this.setData({
        img:options.img,
        totable:true
      })
      wx.setNavigationBarTitle({
        title: '补贴说明'
      })
    }else if (app.globalData.userInfo.userType == 2 && app.globalData.userInfo.shopId){
      wx.setNavigationBarTitle({
        title: '商家入驻'
      })
      wx.showToast({
        title: '您已经入驻到享七美食了ฅ( ̳• ◡ • ̳)ฅ',
        mask:'true',
        icon:'none',
        duration:3000
      })
      setTimeout(function () {
        if (that.data.isindex){
          wx.switchTab({
            url: '../../../pages/index/index'
          })
        }else{
        wx.switchTab({
            url: '../../personal-center/personal-center'
          })
        }
      },3000)
    }else{
      wx.setNavigationBarTitle({
        title: '商家入驻'
      })
      this.searchByUserId()
    }
    wx.setStorage({
      key: 'cate',
      data: '',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    wx.getStorage({
      key: 'cate',
      success: function (res) {
        if (that.data.intype == 2) {
          that.setData({
            sortype: res.data
          })
        } else if (that.data.intype == 1) {
          that.setData({
            businessCate: res.data
          })
        }
      }
    })
    wx.getStorage({
      key: 'address',
      success: function (res) {
        let _res = res.data
        if (_res.address && _res.reg) {
          let _address = _res.reg + _res.address
          that.setData({
            address: _address,
            deaddress: _res.address,
          })
        }
        if (_res.lat) {
          that.setData({
            locationY: _res.lat
          })
        }
        if (_res.lng) {
          that.setData({
            locationX: _res.lng
          })
        }
        that.requestCityName(_res.lat, _res.lng)
        try {
          wx.removeStorageSync('address')
        } catch (e) {
          // Do something when catch error
        }
      }
    })

  },
  signtable:function(){
    this.setData({
      totable:false
    })
  },
  bindPickerChange: function (e) {
    let ind = e.detail.value
    for (let i = 0; i < this.data.sort.length; i++) {
      this.setData({
        sortype: this.data.sort[ind]
      })
    }
    this.setData({
      index: ind
    })
  },
  searchByUserId: function () {
    let _parms = {
      userId: app.globalData.userInfo.userId
    }
    Api.searchByUserId(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.setStorage({
          key: 'cate',
          data: '',
        })
        if (res.data.data == null) {
          return false
        }
        if (res.data.data.status == 0 || res.data.data.status == 1) {
          if (res.data.data && res.data.data.id) {
            let _content = ''
            if (res.data.data.status == 0) {
              _content = '您已经提交过申请'
            } else if (res.data.data.status == 1) {
              _content = '您的审批已通过'
            }
            wx.showToast({
              title: _content,
              mask: 'true',
              icon: 'none',
              duration: 3000
            })
            setTimeout(function () {
              wx.switchTab({
                url: '../../personal-center/personal-center'
              })
            }, 3000)
          }
        } else if (res.data.data.status == 2) {
          if (res.data.data && res.data.data.id) {
            wx.showModal({
              title: '提示',
              content: '您的审批未通过,请重新填写申请',
              success: function (res) {
                if (res.confirm) {
                } else if (res.cancel) {
                  wx.switchTab({
                    url: '../../personal-center/personal-center'
                  })
                }
              }
            })
          }
        }
      }
    })
  },
  opencate: function (e) {  //打开选择分类
    let _ind = e.currentTarget.id
    let _data = ''
    this.setData({
      intype: _ind
    })
    wx.navigateTo({
      url: '../free-of-charge/category/category?ind=' + _ind
    })
    if (_ind == 1) {
      _data = this.data.businessCate
    } else {
      _data = this.data.sortype
    }
    wx.setStorage({
      key: 'cate',
      data: _data
    })
  },
  blurname: function (e) {  //验证申请人必填
    let name = e.detail.value
    if (name) {
      this.setData({
        userName: name
      })
    } else {
      wx.showToast({
        title: '申请人必填',
        icon: 'none',
        duration: 1500
      })
    }
  },
  blurmobile: function (e) {  //验证手机号
    let Phone = e.detail.value
    let RegExp = /^((0\d{2,3}\d{7,8})|(1[1234567890]\d{9}))$/;
    if (RegExp.test(Phone) == false) {
      wx.showToast({
        title: '请正确输入号码',
        icon: 'none',
        duration: 1500
      })
      this.setData({
        mobile: ''
      })
    } else {
      this.setData({
        mobile: Phone
      })
    }
  },
  blurshop: function (e) {  //验证店铺名称必填
    let shop = e.detail.value
    let that = this
    if (shop) {
      let _parms = {
        shopName:shop
      }
      Api.searchByShopName(_parms).then((res) => {
        if (res.data.data) {
          that.setData({
            shopName: ''
          })
          wx.showToast({
            title: '此店名已存在，请重新输入',
            icon: 'none',
            mask: 'true',
            duration: 3000
          })
        } else {
          that.setData({
            shopName: shop,
            isrepeat: true
          })
        }
      })
    } else {
      wx.showToast({
        title: '店铺名称必填',
        icon: 'none',
        mask:'true',
        duration: 1500
      })
    }
  },
  getlocation: function () { //获取详细地址   
    let that = this
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) { // 用户未授受获取其用户信息或位置信息
          wx.showModal({
            title: '提示',
            content: '享7要你的位置信息，快去授权',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({  //打开授权设置界面
                  success: (res) => {
                    if (res.authSetting['scope.userLocation']) {
                      that.getchooseLocation()
                    }
                  }
                })
              }
            }
          })
        } else {
          that.getchooseLocation()
        }
      }
    })
  },
  bindbluradd: function (e) {  //修改地址
    let _address = e.detail.value
    this.setData({
      address: _address
    })
  },
  getchooseLocation() {  //地图选点
    let that = this
    wx.navigateTo({
      url: '../free-of-charge/get-address/get-address?deaddress=' + that.data.deaddress
    })
    // wx.chooseLocation({
    //   success: function (res) {
    //     that.requestCityName(res.latitude, res.longitude)
    //     that.setData({
    //       locationX: res.longitude,
    //       locationY: res.latitude
    //     })
    //   }
    // })
  },
  requestCityName: function (lat, lng) {//通过经纬度获取当前城市名称
    let that = this
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + "," + lng + "&key=4YFBZ-K7JH6-OYOS4-EIJ27-K473E-EUBV7",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res.data.status == 0) {
          that.setData({
            city: res.data.result.address_component.city
          });
        }
      }
    })
  },
  license: function () { //营业执照
    this.getchooseImage(1)
  },
  health: function () {  //卫生许可证
    this.getchooseImage(2)
  },
  door: function () {  //门头照
    this.getchooseImage(3)
  },
  getchooseImage(type) {  //获取图片地址
    let that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: that.data._build_url + 'img/upload',
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'userName': app.globalData.userInfo.userName
          },
          success: function (res) {
            let _data = JSON.parse(res.data)
            let _img = _data.data.smallPicUrl
            if (type == 1) {
              that.setData({
                licensePic: _img
              })
            } else if (type == 2) {
              that.setData({
                healthPic: _img
              })
            } else if (type == 3) {
              that.setData({
                doorPic: _img
              })
            }
          }
        })
      }
    })
  },
  protocol: function () {
    let type = 2
    wx.navigateTo({
      url: '../free-of-charge/category/category?type=' + type
    })
  },
  formSubmit: function (e) {  // 点击提交申请按钮
    let that = this
    if (!this.data.isrepeat) {
      that.setData({
        shopName: ''
      })
      wx.showToast({
        title: '此店名已存在，请重新输入',
        icon: 'none',
        mask: 'true',
        duration: 3000
      })
    }
    if (!this.data.userName || !this.data.mobile || !this.data.shopName || !this.data.address || !this.data.businessCate || !this.data.licensePic || !this.data.healthPic || !this.data.doorPic || !this.data.locationX || !this.data.locationY || !this.data.city || !this.data.sortype) {
      wx.showToast({
        title: '请正确填写完入住信息后提交',
        icon: 'none',
        mask: 'true',
        duration: 2000
      })
      return false
    };
    let _bauss = this.data.businessCate.toString()
    let _sortype = this.data.sortype.toString()
    _bauss = _bauss + '/' + _sortype
    let _parms = {
      userName: this.data.userName,
      mobile: this.data.mobile,
      shopName: this.data.shopName,
      address: this.data.address,
      businessCate: _bauss,
      licensePic: this.data.licensePic,
      healthPic: this.data.healthPic,
      doorPic: this.data.doorPic,
      locationX: this.data.locationX,
      locationY: this.data.locationY,
      city: this.data.city,
      userId: app.globalData.userInfo.userId
    }
    Api.merchantEnter(_parms).then((res) => {
      if (res.data.code == 0) {
        wx.showModal({
          title: '提示',
          content: '信息提交成功，等待审核',
          success: function (res) {
            try {
              wx.removeStorageSync('cate')
            } catch (e) {
              // Do something when catch error
            }
            if (res.confirm) {
              wx.switchTab({
                url: '../../personal-center/personal-center'
              })
            } else if (res.cancel) {
              wx.switchTab({
                url: '../../personal-center/personal-center'
              })
            }
          }
        })
      }
    })
  }
})
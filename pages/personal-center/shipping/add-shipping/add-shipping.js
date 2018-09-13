var address = require('../../../../utils/city.js');
import Api from '../../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../../utils/config/config.js';
var app = getApp();
var animation;
Page({

  /**
   * 页面的初始数据
   * 当前    provinces:所有省份
   * citys选择省对应的所有市,
   * areas选择市对应的所有区
   * provinces：当前被选中的省
   * city当前被选中的市
   * areas当前被选中的区
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    animationAddressMenu: {},
    addressMenuIsShow: false,
    isNew:false,
    value: [0, 0, 0],
    preId:0,
    provinces: [],
    citys: [],
    areas: [],
    items: [
      { name: 'CHN', value: '设置为默认地址', checked: 'true' }
    ],
    province: '',
    city: '',
    area: '',
    addId:'',
    chatName:'',
    mobile: '',
    mobileValue:'',
    // postal:'',//邮编
    areaInfo: '', //地区
    areaIds: [],//地区编码
    detailAddress:'',//详细地址
    isDefault:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 初始化动画变量
    if(options.isnew){
      this.setData({
        isNew: true
      })
    };
    if(options.id){
      this.setData({
        addId: options.id
      });
      this.getAddress();
    };
    var animation = wx.createAnimation({
      duration: 500,
      transformOrigin: "50% 50%",
      timingFunction: 'ease',
    })
    this.animation = animation;
    // 默认联动显示北京
    return
    var id = address.provinces[0].id
    this.setData({
      provinces: address.provinces,
      citys: address.citys[id],
      areas: address.areas[address.citys[id][0].id],
    })
  },
  onShow:function(){
    this.getprovince();
  },
  //监听页面卸载
  onUnload: function () {
    wx.navigateTo({
      // url: 'submitOrder/submitOrder'
      url: "../../../../pages/personal-center/shipping/shipping"
    })
  },
  //查询单个地址详情
  getAddress:function(){
    let that = this;
    Api.singleAddress({ Id: this.data.addId}).then((res)=>{
      if(res.data.code == 0){
        let _data = res.data.data,_arr =[];
        _arr.push(_data.dictProvinceId);
        _arr.push(_data.dictCityId);
        _arr.push(_data.dictCountyId);
        that.setData({
          chatName: _data.chatName,
          mobile: _data.mobile,
          mobileValue: _data.mobile,
          // postal: _data.postal,
          areaInfo: _data.dictProvince+',' +_data.dictCity+','+_data.dictCounty,
          areaIds: _arr,
          detailAddress: _data.detailAddress,
          isDefault: _data.isDefault,
        })
      }
    })
  },
  //查询省级数据
  getprovince:function(){
    let that = this;
    wx.request({
      url: this.data._build_url +'dict/findDictProvience',
      success: function (res) {
        if(res.data.code == 0){
          that.setData({
            provinces: res.data.data
          })
          that.getcity(res.data.data[0].id);
        }
      }
    })
  },
  //查询地市级数据 
  getcity: function (provinceId,val){
    let that = this;
    Api.findDictCity({ provinceId: provinceId}).then((res)=>{
      if(res.data.code ==0){
        that.setData({
          citys: res.data.data
        })
        if(val){
          that.getcounty(res.data.data[val].id, provinceId);
        }else{
          that.getcounty(res.data.data[0].id, provinceId);
        }
      }
    })
  },
  //查询县区级数据
  getcounty: function (id, provinceId){
    let that = this;
    let _parms = {
      provinceId: provinceId,
      cityId:id
    };
    Api.findDictCounty(_parms).then((res) => {
      if (res.data.code == 0) {
        that.setData({
          areas: res.data.data
        })
      }
    })
  },
  // 点击所在地区弹出选择框
  selectDistrict: function(e) {
    var that = this
    if (that.data.addressMenuIsShow) {
      return
    }
    that.startAddressAnimation(true)
  },

  // 处理省市县联动逻辑
  cityChange: function(e) {
    let _arr = e.detail.value;
    console.log('_arr:', _arr)
    this.getcity(_arr[0] + 1,_arr[1]);
    this.setData({
      preId: _arr[0],
      value:_arr
    });
    console.log('valu11e:', this.data.value)
  },
  // 点击地区选择确定按钮
  citySure: function (e) {
    let that = this, city = that.data.city, value = that.data.value;
    console.log('value:', value)
    that.startAddressAnimation(false)
    // 将选择的城市信息显示到输入框
    let _areaInfo = that.data.provinces[value[0]].provinceCname + ',' + that.data.citys[value[1]].cityCname + ',' + that.data.areas[value[2]].countyCname, _areaIds = [];
    _areaIds.push(that.data.provinces[value[0]].id);
    _areaIds.push(that.data.citys[value[1]].id);
    _areaIds.push(that.data.areas[value[2]].id);
    console.log('_areaIds:', _areaIds)
    that.setData({
      areaInfo: _areaInfo,
      areaIds: _areaIds
    })
  },
  // 点击地区选择取消按钮
  cityCancel: function (e) {
    this.startAddressAnimation(false)
  },
  hideCitySelected: function (e) {
    this.startAddressAnimation(false)
  },
  // 执行动画
  startAddressAnimation: function (isShow) {
    var that = this
    if (isShow) {
      that.animation.translateY(0 + 'vh').step()
    } else {
      that.animation.translateY(40 + 'vh').step()
    }
    that.setData({
      animationAddressMenu: that.animation.export(),
      addressMenuIsShow: isShow,
    })
  },
 
  //姓名失焦
  bindblurName:function(e){
    this.setData({
      chatName: e.detail.value
    })
  },
  //手机号失焦
  bindblurIpone: function(e) {
    let RegExp = /^[1][3456789][0-9]{9}$/, _value = e.detail.value;
    this.setData({
      mobileValue: _value
    });
    if (RegExp.test(_value)) { //校验手机号码 
      this.setData({
        mobile: _value
      });
      
    }else{
      this.setData({
        mobileValue:'',
        mobile: ''
      })
      wx.showToast({
        title: '手机号输入错误',
        icon: 'none'
      })
    }

  },
  //邮政编码失焦
  bindblurPostal:function(e){
    this.setData({
      postal: e.detail.value
    })
  },
  //详细地址失焦
  bindblurAddress:function(e){
    this.setData({
      detailAddress: e.detail.value
    })
  },
  //是否设置为默认地址
  checkboxChange: function (e) {
    if (e.detail.value[0] == 1) {
      this.setData({
        isDefault: 1
      })
    } else {
      this.setData({
        isDefault: 0
      })
    }
  },


  //点击确定保存按钮
  handAdd:function(){
    if (!this.data.chatName){
      wx.showToast({
        title: '请输入联系人姓名',
        icon: 'none'
      })
      return;
    }
    if (!this.data.mobile) {
      wx.showToast({
        title: '请输入联系人手机号',
        icon: 'none'
      })
      return;
    }
    // if (!this.data.postal) {
    //   wx.showToast({
    //     title: '请输入邮编',
    //     icon: 'none'
    //   })
    //   return;
    // }
    if (!this.data.areaIds) {
      wx.showToast({
        title: '请选择地区',
        icon: 'none'
      })
      return;
    }
    if (!this.data.detailAddress) {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none'
      })
      return;
    }
    let _parms = {
      userId: app.globalData.userInfo.userId,
      dictProvinceId: this.data.areaIds[0],
      dictCityId: this.data.areaIds[1],
      dictCountyId: this.data.areaIds[2],
      dictAreaId: '1',
      detailAddress: this.data.detailAddress,
      chatName: this.data.chatName,
      mobile: this.data.mobile,
      isDefault: this.data.isDefault
    }
    if(this.data.addId){ //更新
      _parms.id=this.data.addId;
      Api.upAddress(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '更新成功',
          });
          setTimeout(() => {
            wx.redirectTo({
              url: '../../shipping/shipping'
            })
          }, 1500)
        }
      })
    }else{  //新增
      Api.AddAddress(_parms).then((res) => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '保存成功',
            icon: 'none'
          });
          setTimeout(() => {
            wx.redirectTo({
              url: '../../shipping/shipping'
            })
          }, 1500)
        }
      })
    }
    
  },
  // 取消新增地址
  handColse: function() {
    wx.redirectTo({
      url: '../../shipping/shipping'
    })
  },
  //点击删除按钮
  handRemove: function() {
    let that = this;
    wx.showModal({
      title: '温馨提示',
      content: '您确定要删除地址?',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          Api.outAddress({id:that.data.addId}).then((res) => {
            if (res.data.code == 0) {
              wx.showToast({
                title: '删除成功',
              });
              setTimeout(() => {
                wx.redirectTo({
                  url: '../../shipping/shipping'
                })
              }, 1500)
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }

})
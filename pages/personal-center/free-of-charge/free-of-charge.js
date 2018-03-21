import Api from '/../../../utils/config/api.js'
Page({

  data: {
      isname:false,
      incontactInformation:false,
      instoreName:false,
      indetailedAddress:false,
      inperCapita:false
  },

  onLoad: function (options) {
    
  },
  //判断申请人姓名
  namebindblur(e){
    let name = e.detail.value;
    if(name){
      this.setData({
        isname:true,
      })
    }else{
      wx.showToast({
        title: '输入申请人名字',
        icon: 'succes',
        duration: 1000,
        mask: true
      })
    }
  },
  //判断联系方式
  information(e) {
    let contactInformation = e.detail.value;
    if (contactInformation) {
      
      this.setData({
        incontactInformation: true,
      })
    } else {
      wx.showToast({
        title: '输入正确电话号',
        icon: 'succes',
        duration: 1000,
        mask: true
      })
    }
  },
  //判断店铺名称
  namebindblurDetails(e) {
    let storeName = e.detail.value;
    if (storeName) {
      this.setData({
        instoreName: true,
      })
    } else {
      wx.showToast({
        title: '请输入店铺名称',
        icon: 'succes',
        duration: 1000,
        mask: true
      })
    }
  },
  //判断详细地址
  indetailedMinute(e) {
    let detailedAddress = e.detail.value;
    if (detailedAddress) {
      this.setData({
        indetailedAddress: true,
      })
    } else {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'succes',
        duration: 1000,
        mask: true
      })
    }
  },
  //判断人均消费
  inperFigure(e) {
    let perCapita = e.detail.value;
    if (perCapita) {
      this.setData({
        inperCapita: true,
      })
    } else {
      wx.showToast({
        title: '请输入人均消费',
        icon: 'succes',
        duration: 1000,
        mask: true
      })
    }
  },
  formSubmit: function (e) {
    let that = this;
    let arr = e.detail.value; 
    if (this.data.isname && this.data.incontactInformation && this.data.instoreName && this.data.indetailedAddress && this.data.inperCapita) {
      let _parms = {
        userName: arr.name, //申请人
        address: arr.location, //详细地址
        shopName: arr.storeName,//店铺名称
        perCapita: arr.perCapita, //人均消费
        mobile: arr.phone, //联系方式
      }
      Api.merchantEnter(_parms).then((res) => {
        wx.showToast({
          title: '提交成功',
          icon: 'loading',
          duration: 1500,
          mask: true
        })
        setTimeout(function () {
          wx.navigateBack({
            delta: 2
          })
        }, 1500)
      })
    }
  }
  
})
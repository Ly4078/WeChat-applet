import Api from '../../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _build_url: GLOBAL_API_DOMAIN,   //域名
    dish:'',
    Introduce:'',
    dishimg:'',
    videoUrl:'',
    posterImg: 'https://xq-1256079679.file.myqcloud.com/13971489895_wxf91e2a026658e78e.o6zAJs-7D9920jC4XTKdzt72lobs.8c2bHTeMhUqPe9b72c354166593f5a9afe09a27afe74_0.3.jpg'  //默认视频图片
  },
  dishbindblur:function(e){
    let _value = e.detail.value
    let arr = _value.split(" ");
    if (arr.length > 1) {
      _value = _value.replace(/\s+/g, "");
    }
    this.setData({
      dish:_value
    })
  },
  Intrbindblur:function(e){
    let _value = e.detail.value;
    this.setData({
      Introduce: _value
    })
  },
  getimg() {  //获取图片地址
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
            that.setData({
              dishimg:_img
            })
          }
        })
      }
    })
  },
  getvideo: function () {     //本地选择视频
    let _this = this;
    wx.chooseVideo({
      maxDuration: 15,
      success: function (res) {
        wx.uploadFile({
          url: _this.data._build_url + 'img/uploadMp4',
          filePath: res.tempFilePath,
          name: 'file',
          formData: {
            'userName': app.globalData.userInfo.userName
          },
          success: (res) => {
            wx.showToast({
              title: '上传中..',
              icon: 'loading',
              duration: 2000
            })
            let data = JSON.parse(res.data);
            if (data.code == 0) {
              wx.showToast({
                title: '上传成功',
                icon: 'success'
              })
              _this.setData({
                videoUrl: data.data.picUrl
              });
            } else {
              wx.showToast({
                title: '网络慢稍后再试',
                icon: 'none'
              })
            }
          }
        });
      }
    });
  },
  sumblit:function(){
    let that= this 
    if (!this.data.dish){
      wx.showToast({
        title: '请输入菜名',
        icon: 'none'
      })
    } else if (!this.data.Introduce){
      wx.showToast({
        title: '请输入菜品介绍',
        icon: 'none'
      })
    } else if (!this.data.videoUrl){
      wx.showToast({
        title: '请上传视频',
        icon: 'none'
      })
    } else if (!this.data.dishimg){
      wx.showToast({
        title: '请上传图片',
        icon: 'none'
      })
    }else{
      let _parms = {
        actId: '34',
        refId: app.globalData.userInfo.shopId,
        type: '2',
        shopVideo: this.data.videoUrl,
        skuName: this.data.dish,
        skuInfo: this.data.Introduce,
        picUrl: this.data.dishimg
      }
      Api.apply(_parms).then((res) => {
        let data = res.data;
        if (data.code == 0) {
          wx.showToast({
            title: '报名成功，等待审核',
            icon: 'none'
          })
          wx.navigateTo({
            url: '../hot-activity',
          })
        } else {
          wx.showToast({
            title: '系统繁忙',
            icon: 'none'
          })
        }
      });
    }
    
  }
})
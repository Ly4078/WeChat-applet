import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js')
var app = getApp()

Page({
  data: {
    img_url: '',
    // canIUse: wx.canIUse('button.open-type.getUserInfo'),
    _build_url: GLOBAL_API_DOMAIN,
    picUrl:'',
    pullNum:0
  },
  onLoad: function (options){
    console.log("options:", options)
    this.setData({
      userType: app.globalData.userInfo.userType
    })
   
   
  },
  onShow:function(){
    this.numberOfBargain(); //邀请人数
  },
  numberOfBargain:function(){
    let that = this, _userId = app.globalData.userInfo.userId;
    wx.request({
      url: 'https://www.xq0036.top/pullUser/get/' + _userId,
      success:function(res){
        if(res.data.code == 0){
          that.setData({
            picUrl: res.data.data.picUrl,
            img_url: res.data.data.picUrl,
            pullNum: res.data.data.pullNum
          });
        }
      }
    })
  },

  // 保存图片

  saveImgToPhotosAlbumTap: function () {
    let imgUrl = this.data.img_url;
    console.log('imgUrl:', imgUrl);
    wx.downloadFile({
      url: imgUrl,
      success: function (res) {
        console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            console.log('res;',res)
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1500
            })
          },
          fail: function (res) {
            console.log(res)
            console.log('fail')
          }
        })
      },
      fail: function () {
        console.log('fail')
      }
    })

  },
  onShareAppMessage: function () {
    return {
      title: '就差你了,一起来注册领享7劵吧',
      desc: '就差你了,一起来注册领享7劵吧',
      path: 'pages/personal-center/securities-sdb/securities-sdb?userId=' + app.globalData.userInfo.userId,
      imageUrl: 'https://xq-1256079679.file.myqcloud.com/test_242386103115353639_0.8.jpg',
    }
  }
})


import Api from '../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js';
var utils = require('../../../utils/util.js');
var app = getApp();
var QR = require("../../../utils/qrcode.js");
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    _data: 0,
    canvasHidden: false,
    maskHidden: true,
    imagePath: '',
    placeholder: 'https://www.xiang7.net/service?flag=6&userId='//默认二维码生成文本
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  
    var size = this.setCanvasSize();//动态设置画布大小
    var initUrl = this.data.placeholder + app.globalData.userInfo.userId;
    console.log("initUrl:", initUrl)
    this.createQrCode(initUrl, "mycanvas", size.w, size.h);
    this.getuserNUm();//邀请人数
  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 686;//不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale*0.9;
      var height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  createQrCode: function (url, canvasId, cavW, cavH) {
    console.log(url, canvasId, cavW, cavH)
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH);
    setTimeout(() => { this.canvasToTempImage(); }, 1000);

  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        that.setData({
          imagePath: tempFilePath,
          // canvasHidden:true
        });
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  //点击图片进行预览，长按保存分享图片
  previewImg: function (e) {
    var img = this.data.imagePath;
    console.log(img);
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    })
  },
  formSubmit: function (e) {
    var that = this;
    var url = e.detail.value.url;
    that.setData({
      maskHidden: false,
    });
    wx.showToast({
      title: '生成中...',
      icon: 'loading',
      duration: 2000
    });
    var st = setTimeout(function () {
      wx.hideToast()
      var size = that.setCanvasSize();
      //绘制二维码
      that.createQrCode(url, "mycanvas", size.w, size.h);
      that.setData({
        maskHidden: true
      });
      clearTimeout(st);
    }, 2000)
  },
  getuserNUm: function () {  //查询已邀请人数
    let that = this, userId = app.globalData.userInfo.userId;
    wx.request({
      url: this.data._build_url + '/pullUser/get/',
      header: {
        "Authorization": app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            _data: res.data.data.pullNum,
          });
        }
      }
    })
  },
  // 保存图片
  saveImgToPhotosAlbumTap: function () {
    let imgUrl = this.data.imagePath;
    console.log('imgUrl:', imgUrl)
    wx.downloadFile({
      url: imgUrl,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1500
            })
          },
          fail: function (res) {
            console.log(res)
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
      imageUrl: 'https://xqmp4-1256079679.file.myqcloud.com/text_56225273879281812.png',
    }
  }
})
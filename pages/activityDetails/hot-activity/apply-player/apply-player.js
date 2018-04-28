import Api from '../../../../utils/config/api.js';
import { GLOBAL_API_DOMAIN } from '../../../../utils/config/config.js';
var utils = require('../../../../utils/util.js');
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    imgsArr: [],     //上传的图片数组
    imgsIdArr: [],    //上传图片的Id
    videoUrl: "",   //视频地址
    posterImg: 'https://xq-1256079679.file.myqcloud.com/13971489895_wxf91e2a026658e78e.o6zAJs-7D9920jC4XTKdzt72lobs.8c2bHTeMhUqPe9b72c354166593f5a9afe09a27afe74_0.3.jpg'  //默认视频图片
  },
  onLoad: function (options) {

  },
  onShow: function () {

  },
  formSubmit: function (e) {    //form表单提交
    console.log(e);
  },
  chooseImg: function () {     //本地选择图片
    let _this = this;
    wx.chooseImage({
      count: 6,
      success: (res) => {
        console.log(res.tempFilePaths);
        _this.uploadImgs({
          tempFilePaths: res.tempFilePaths
        });
      },
      fail: function (res) {
        console.log(res)
      }
    });
  },
  uploadImgs: function (obj) {       //上传图片
    let _this = this, i = obj.idx ? obj.idx : 0;
    wx.uploadFile({
      url: _this.data._build_url + 'img/upload/multi',
      filePath: obj.tempFilePaths[i],
      name: 'file',
      formData: {
        // 'userName': app.globalData.userInfo.userName
        'userName': '15072329516'
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
          let imgs = _this.data.imgsArr, imgsId = _this.data.imgsIdArr;
          imgs.push(data.data[0].smallPicUrl);
          imgsId.push(data.data[0].id);
          _this.setData({
            imgsArr: imgs,     //图片数组
            imgsIdArr: imgsId     //图片id数组
          });
        } else {
          wx.showToast({
            title: '网络慢稍后再试',
            icon: 'none'
          })
        }
      },
      fail: (res) => {
        console.log('上传失败');
      },
      complete: (res) => {
        i++;
        if (i == obj.tempFilePaths.length) {
          console.log('上传完毕');
          console.log(_this.data.imgsArr);
          console.log(_this.data.imgsIdArr);
        } else {
          console.log('正在上传第' + i + '张');
          _this.uploadImgs({
            tempFilePaths: obj.tempFilePaths,
            idx: i
          });
        }
      }
    })
  },
  chooseVideo: function () {     //本地选择视频
    let _this = this;
    wx.chooseVideo({
      maxDuration: 15,
      success: function (res) {
        wx.uploadFile({
          url: _this.data._build_url + 'img/uploadMp4',
          filePath: res.tempFilePath,
          name: 'file',
          formData: {
            // 'userName': app.globalData.userInfo.userName
            'userName': '15072329516'
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
          },
          fail: (res) => {
            console.log(res);
          },
          complete: (res) => {

          }
        });
      },
      fail: function () {

      },
      conplete: function () {

      }
    });
  }
})
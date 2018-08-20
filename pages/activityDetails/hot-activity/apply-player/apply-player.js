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
    videoId: "",    //视频id
    percent: 0,
    isprogress:false,
    defaimg: ''
  },
  onLoad: function (options) {
    this.setData({
      actId: options.id,
      actName: options._actName
    });
  },
  onShow: function () {

  },
  formSubmit: function (e) {    //form表单提交
    let _this = this;
    let inpVal = e.detail.value;
    if (this.isNull(inpVal.name)) {
      wx.showToast({
        title: '请填写姓名',
        mask: 'true',
        duration: 2000,
        icon: 'none'
      })
      return false;
    }
    if (this.isNull(inpVal.sex)) {
      wx.showToast({
        title: '请填写性别',
        mask: 'true',
        duration: 2000,
        icon: 'none'
      })
      return false;
    }
    if (this.isNull(inpVal.age)) {
      wx.showToast({
        title: '请填写年龄',
        mask: 'true',
        duration: 2000,
        icon: 'none'
      })
      return false;
    }
    if (this.isNull(inpVal.height)) {
      wx.showToast({
        title: '请填写身高',
        mask: 'true',
        duration: 2000,
        icon: 'none'
      })
      return false;
    }
    if (this.isNull(inpVal.tele)) {
      wx.showToast({
        title: '请填写联系方式',
        icon: 'none'
      })
      return false;
    }
    if (this.isNull(inpVal.signText)) {
      wx.showToast({
        title: '请填写个性签名',
        mask: 'true',
        duration: 2000,
        icon: 'none'
      })
      return false;
    }
    if (!this.blurmobile(inpVal.tele)) {
      wx.showToast({
        title: '请填写正确的联系方式',
        mask: 'true',
        duration: 2000,
        icon: 'none'
      })
      return false;
    }
    if (this.isNull(this.data.imgsArr)) {
      wx.showToast({
        title: '请上传照片',
        mask: 'true',
        duration: 2000,
        icon: 'none'
      })
      return false;
    }
    if (this.isNull(this.data.videoUrl)) {
      wx.showToast({
        title: '请上传短视频',
        mask: 'true',
        duration: 2000,
        icon: 'none'
      })
      return false;
    }
    // inpVal.signText
    inpVal.signText = utils.utf16toEntities(inpVal.signText);
    let fileIds = this.data.imgsIdArr
    fileIds.push(this.data.videoId);
    this.setData({
      imgsIdArr: fileIds
    });
    let _parms = {
      actId: this.data.actId,     //活动id
      refId: app.globalData.userInfo.userId,
      type: 1,
      playerVideo: this.data.videoUrl,
      age: inpVal.age,
      height: inpVal.height,
      picIds: this.data.imgsIdArr,
      actUserName: inpVal.name,
      userInfo: inpVal.signText
    }
    Api.apply(_parms).then((res) => {
      let data = res.data;
      if(data.code == 0) {
        wx.showToast({
          title: '报名成功，返回活动首页查看',
          mask: 'true',
          duration: 2000,
          icon: 'none'
        })
        if (_this.data.actId == 37) {
          setTimeout(function () {
            wx.redirectTo({
              url: '../../onehundred-dish/onehundred-dish?actid=' + _this.data.actId + '&_actName=' + _this.data.actName + "&sortType=1" + "&switchTab=false"
            })
          }, 2000)
        } else {
          setTimeout(function () {
            wx.redirectTo({
              url: '../hot-activity?id=' + _this.data.actId + '&_actName=' + _this.data.actName
            })
          }, 2000)
        }
      } else {
        wx.showToast({
          title: data.message,
          mask: 'true',
          duration: 2000,
          icon: 'none'
        })
      }
    });
  },
  chooseImg: function () {     //本地选择图片
    let _this = this;
    wx.chooseImage({
      count: 6,
      success: (res) => {
        console.log(res);
        _this.uploadImgs({
          tempFilePaths: res.tempFilePaths
        });
        
      },
      fail: function (res) {
        
      }
    });
  },
  uploadImgs: function (obj) {       //上传图片
    let _this = this, i = obj.idx ? obj.idx : 0;
    wx.showLoading({
      title: '图片上传中...',
    })
    wx.uploadFile({
      url: _this.data._build_url + 'img/upload/multi',
      filePath: obj.tempFilePaths[i],
      name: 'file',
      formData: {
        'userName': app.globalData.userInfo.userName
      },
      success: (res) => {
        console.log(res);
        wx.hideLoading();
        let data = JSON.parse(res.data);
        if (data.code == 0) {
          wx.showToast({
            title: '上传成功',
            mask: 'true',
            duration: 2000,
            icon: 'none'
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
            title: data.message,
            mask: 'true',
            duration: 2000,
            icon: 'none'
          })
        }
      },
      fail: (res) => {
        wx.showToast({
          title: '上传失败',
          mask: 'true',
          duration: 2000,
          icon: 'none'
        })
      },
      complete: (res) => {
        i++;
        if (i == obj.tempFilePaths.length) {
          console.log('上传完毕');
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
    let _this = this, timer = null;
    
    wx.chooseVideo({
      maxDuration: 15,
      success: function (res) {
        
        _this.setData({
          isprogress: true
        })
        let videores = res;
        timer = setInterval(() => {
          let _per = _this.data.percent;
          if (_per == 99) {
            if (!_this.data.videoUrl && !_this.data.defaimg) {
              clearInterval(timer);
              setTimeout(() => {
                if (_this.data.videoUrl && _this.data.defaimg) {
                  _this.setData({
                    percent: 100
                  })
                } else {
                  _this.setData({
                    percent: 0,
                    isprogress: false
                  })
                  wx.showToast({
                    title: '上传失败，请重新上传',
                    duration: 2000,
                    mask: 'true',
                    icon: 'none'
                  })
                }
              }, 10000)
              return false
            }
          }
          _per += 1;
          _this.setData({
            percent: _per
          })
        }, 100)



        wx.uploadFile({
          url: _this.data._build_url + 'img/uploadMp4',
          filePath: res.tempFilePath,
          name: 'file',
          formData: {
            'userName': app.globalData.userInfo.userName
          },
          success: (res) => {
            wx.hideLoading();
            let data = JSON.parse(res.data);
            console.log('data:',data)
            if (data.code == 0) {
              _this.setData({
                percent: 100,
                isprogress: false
              })
              wx.showToast({
                title: '上传成功',
                mask: 'true',
                duration: 2000,
                icon: 'none'
              })
              _this.setData({
                videoUrl: data.data.picUrl,
                defaimg: data.datasmallPicUrl,
                videoId: data.data.id
              });
            } else {
              wx.showToast({
                title: data.message,
                mask: 'true',
                duration: 2000,
                icon: 'none'
              })
            }
          },
          fail: (res) => {
            _this.setData({
              percent: 0,
              isprogress: false
            })
            clearInterval(timer)
            wx.showToast({
              title: '上传失败',
              mask: 'true',
              duration: 2000,
              icon: 'none',
              duration: 2000
            })
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
  },
  blurmobile: function (phone) {     //验证手机号
    let RegExp = /^((0\d{2,3}\d{7,8})|(1[1234567890]\d{9}))$/;
    return RegExp.test(phone);
  },
  isNull: function(val) {      //判断是否为空
    let flag = false;
    if (val == null || val == undefined || val == "" || val == "null" || val == []) {
      flag = true;
    }
    return flag;
  }
})
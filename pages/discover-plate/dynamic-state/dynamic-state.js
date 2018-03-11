import { GLOBAL_API_DOMAIN } from '../../../utils/config/config.js'
import Api from '../../../utils/config/api.js'; 
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,   //域名
    article: app.globalData.article,   //获取全局变量
    isplus: true,
    issee:false,
    addind:'',
    num:0,
    title:'',  //标题
    coverimg: '',  //封面图片
    content: [],   //文章内容数据
    butt: ['预览','提交']
  },

  onLoad: function (options) {  // 生命周期函数--监听页面加载
    let that = this;
    var article = app.globalData.article;  //获取全局变量
    let _text = wx.getStorageSync('text'); //获取同步缓存数据
    wx.getStorage({
      key: 'title',
      success: function(res) {
        console.log("restitle:",res.data);
        that.setData({
          title: res.data
        })
      },
    })
    console.log("title11:",this.data.title)
    if (_text){
      let obj = {
          type: 'text',
          value: _text
        }
        article.push(obj);
    }
  
    wx.getStorage({
      key: 'cover',
      success: function(res) {
        if (res.data) {
          that.setData({
            coverimg: res.data
          })
        }
      }
    }),
    
    wx.getStorage({  //取出缓存
      key: 'content',
      success: function (res) {
        if (res.data) {
          let arr2 = res.data;
          article = article.concat(arr2)
        }
      }
    })

    this.setData({
      content: article
    })
  },
  onUnload: function () { //生命周期函数--监听页面卸载
    getApp().globalData.article = [];
    wx.setStorage({
      key: 'cover',
      data: ''
    })
    wx.setStorage({
      key: 'title',
      data: '',
    })
    wx.setStorage({
      key: 'text',
      data: '',
    })
  },
  onShow: function () {
  },
  bindblur: function (e) { //焦点离开标题框  获取框中value
    let that = this;
    let _title = e.detail.value
    console.log("_title:",_title)
    // wx.getStorage({
    //   key: 'title',
    //   success: function(res) {
    //     console.log("res:",res.data);
    //     if(res.data){
    //       that.setData({
    //         title: res.data
    //       })
    //     }
    //   },
    // })
    wx.setStorage({
      key: 'title',
      data: _title
    })
    that.setData({
      title: _title
    })
    // console.log("title:",this.data.title)
  },
  getcover: function () {  //获取封面图片
    this.getimg('b');
  },
  clickplus: function (e) {  //点击加号
    let ind = e.currentTarget.id;
    this.setData({
      isplus: false,
      addind:ind
    })
  },
  clickimg: function () {  //添加内容图片
    let that = this;
    this.setData({
      isplus: true
    })
    this.getimg('a')
  },
  clicktxt: function () {  //添加文字
    this.setData({
      isplus: true
    })
    wx.navigateTo({
      url: 'text_input/text_input'
    })
  },
  changepicture: function (e) {  //更换内容中的图片
    let that = this;
    let ind = e.currentTarget.id;
    if (this.data.content[ind].type == 'img') {
      this.getimg(ind)
    }
  },
  bindblurnote:function(e){  //图片简介输入
    let that = this;
    let ind = e.currentTarget.id;
    let _value = e.detail.value;
    let data = that.data.content;
    if(data[ind].type == 'img'){
      data[ind].txt = _value;
      that.setData({
        content: data
      })
    }
  },
  FormSubmit(e){  // 点击按钮
    let ind = e.currentTarget.id;
    console.log("ind:",ind)
    if (ind == 0) {  //  ['预览','提交']
      this.setData({
        issee:true
      })
      wx.showToast({
        title: '预览正在开发中。。。',
        icon: 'none',
        duration: 1500
      })
    }else{
      let sum = [];
      let _content = JSON.stringify(this.data.content);
      let _title = this.data.title;
      let _coverimg = this.data.coverimg;
      for(let i=0;i<this.data.content.length;i++){
        if(this.data.content[i].type == 'text'){
          if(this.data.content[i].value.length<200){
            let txt = this.data.content[i].value;
            sum.push(txt)
          }else{
            let txt = this.data.content[i].value.slice(0,200);
            sum.push(txt)
          }
        }
      }
      // wx.redirectTo({
      //   url: '../dynamic-state/dynamic-state'
      // })
      // wx.navigateBack({
      //   delta: 1
      // })
      if(!_title){
        wx.showToast({
          title: '请输入标题',
          icon: 'none',
          duration: 1500
        })
        return false
      }
      if(_content.length<3){
        wx.showToast({
          title: '请输入内容',
          icon: 'none',
          duration: 1500
        })
        return false
      }
      let _parms = {
        title: _title,
        content: _content,
        userId:'1',
        summary: sum[0],
        homePic: _coverimg,
        userName: app.globalData.userInfo.nickName,
        nickName: app.globalData.userInfo.nickName 
      }
      Api.topicadd(_parms).then((res) => {
        console.log("res:",res)
        if(res.data.code == 0){
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1500
          })
        }
        // setTimeout(function(){
          
        // },1500)
        
      })
    }
  },
  goback: function () {  //点击返回按钮  退出预览
    this.setData({
      issee: false
    })
  },
  getimg: function (type) {   // 获取图片  公用
    let that = this;
    wx.chooseImage({  //获取图片
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: that.data._build_url + 'img/upload',
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'userName': 'test'
          },
          success: function (res) {
            var article = getApp().globalData.article;  //获取全局变量
            let _data = res.data;
            _data = JSON.parse(_data);
            let _img = _data.data.smallPicUrl

            if (type == 'a') {  //添加内容图片
              let obj = {
                type: 'img',
                value: _img,
                txt:''
              }
              article.push(obj);
              that.setData({
                content: article
              })
            } else if (type == 'b') {  //添加封面图片
              wx.setStorage({
                key: 'cover',
                data: _img
              })
              that.setData({
                coverimg: _img
              })
            } else {
              let data = that.data.content;
              data[type].value = _img;
              that.setData({
                content: data
              })
            }
          },
          fail: function (res) {
            console.log("fail:", res)
          }
        })
      }
    })
  }

})
Page({
  data: {
    customerInfo: {
      species: [{
        images:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1533622068&di=9e8384f64c2987ab63d799630e1f0b37&imgtype=jpg&er=1&src=http%3A%2F%2Fimg5.duitang.com%2Fuploads%2Fitem%2F201509%2F06%2F20150906195306_vxLT2.jpeg',
        headline: '定制T恤(蓝色)',
        address: '湖北省武汉市硚口区人名西路302号明日财富大厦20层，迪吧拉亚公司研发部',
        consignee: '32',
      }, {
          images: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1533622068&di=9e8384f64c2987ab63d799630e1f0b37&imgtype=jpg&er=1&src=http%3A%2F%2Fimg5.duitang.com%2Fuploads%2Fitem%2F201509%2F06%2F20150906195306_vxLT2.jpeg',
        headline: '定制T恤(紫色)',
        address: '湖北省武汉市硚口区人名西路302号明日财富大厦20层，迪吧拉亚公司研发部',
        consignee: '543',
      }, {
          images: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1533622068&di=9e8384f64c2987ab63d799630e1f0b37&imgtype=jpg&er=1&src=http%3A%2F%2Fimg5.duitang.com%2Fuploads%2Fitem%2F201509%2F06%2F20150906195306_vxLT2.jpeg',
        headline: '定制T恤(蓝色)',
        address: '湖北省武汉市硚口区人名西路302号明日财富大厦20层，迪吧拉亚公司研发部',
        consignee: '876',
      }]
    }
  },
  onLoad: function(options) {

  },
  // 进入商品详情页面
  commodityDetails:function(){
    wx.navigateTo({
      url: 'commodityDetails/commodityDetails',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
})
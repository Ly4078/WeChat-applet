Page({
  data: {
    toView: 'food',
    category: [
      {
        id: 1,
        name: 'food'
      },
      {
        id: 2,
        name: 'life'
      },
      {
        id: 3,
        name: 'drunk'
      }
    ],
    classify: [
      {
        id: 1,
        icon: '/images/icon/morentu.png',
        name: '蟹类'
      },
      {
        id: 2,
        icon: '/images/icon/morentu.png',
        name: '蟹类'
      },
      {
        id: 3,
        icon: '/images/icon/morentu.png',
        name: '蟹类'
      },
      {
        id: 4,
        icon: '/images/icon/morentu.png',
        name: '蟹类'
      },
      {
        id: 4,
        icon: '/images/icon/morentu.png',
        name: '蟹类'
      },
      {
        id: 4,
        icon: '/images/icon/morentu.png',
        name: '蟹类'
      },
      {
        id: 4,
        icon: '/images/icon/morentu.png',
        name: '蟹类'
      },
      {
        id: 4,
        icon: '/images/icon/morentu.png',
        name: '蟹类'
      },
      {
        id: 4,
        icon: '/images/icon/morentu.png',
        name: '蟹类'
      },
      {
        id: 4,
        icon: '/images/icon/morentu.png',
        name: '蟹类'
      }
    ]
  },
  onLoad: function(options) {

  },
  onReady: function() {

  },
  onShow: function() {

  },
  scrollToView(e) {    //点击滚动
    let id = e.currentTarget.dataset.name, category = this.data.category;
    for (let i = 0; i < category.length; i++) {
      if (category[i].name == id) {
        this.setData({
          toView: category[i].name
        });
      }
    }
  }
})
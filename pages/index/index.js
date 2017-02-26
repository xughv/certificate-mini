var request = require('../../utils/request').request;

var app = getApp()
Page({
  data: {
    title: '',
    userInfo: {},
    chapters: []
  },
  onLoad: function () {
    var category = app.getCategory();
    console.log(category);
    if (!category) {
      wx.navigateTo({
        url: '../categorys/categorys'
      });
      return;
    }

    this.setData({ title: category.name });

    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })

    request({
      url: 'api/qbank/chapter/' + category._id,
      success: function(res) {
        that.setData({ chapters: res });
        res = res.map(item => {
          var done = wx.getStorageSync('cnt_done_' + item._id);
          if (!done) done = 0;

          var wrong = wx.getStorageSync('cnt_wrong_' + item._id);
          if (!wrong) wrong = 0;

          item.done = done;
          item.rate = Math.floor((1 - wrong / done) * 100);

          // console.log(done, item.rate );
          return item;
        });
        that.setData({ chapters: res });
      }
    });
  },
  onShow: function() {
    // console.log('show');
    var chapters = this.data.chapters.map(item => {
      var done = wx.getStorageSync('cnt_done_' + item._id);
      if (!done) done = 0;

      var wrong = wx.getStorageSync('cnt_wrong_' + item._id);
      if (!wrong) wrong = 0;

      item.done = done;
      item.rate = Math.floor((1 - wrong / done) * 100);
      // console.log(done, item.rate );
      return item;
    });
    this.setData({ chapters: chapters });
  },
  //事件处理函数
  handleWrongClick: function() {
    wx.navigateTo({
      url: '../wrong/wrong'
    })
  },
  handleChangeCategory: function(e) {
    wx.navigateTo({
      url: '../categorys/categorys'
    });
  },
  handleChapterClick: function(e) {
    if (!e.target.id) return;
    var id = e.target.id, total = 0, chapters = this.data.chapters;
    for (let i = 0; i < chapters.length; ++i) {
      if (chapters[i]._id === id) total = chapters[i].count;
    }
    wx.navigateTo({
      url: `../problems/problems?id=${id}&total=${total}`
    })
  }
})

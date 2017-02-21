var request = require('../../utils/request').request;
var pending = false;

Page({
  data: {
    chapterId: null,
    problems: [],
    problem: {
      problem: "",
      choices: [],
      answer: [],
      analysis: ''
    },
    index: 0,
    doneMax: 0,
    done: 0,
    total: 0,
    wrong: 0,
    answer: [],
    right: false,
    submitted: false
  },
  onLoad: function(option) {
    console.log(option);
    this.setData({ chapterId: option.id, total: option.total });

    // 总题数
    var done = wx.getStorageSync('cnt_done_' + option.id);
    if (done) {
      this.setData({ done: parseInt(done), doneMax: parseInt(done) });
    } else {
      done = 0;
    }

    // 错题数
    var wrong = wx.getStorageSync('cnt_wrong_' + option.id);
    if (wrong) {
      this.setData({ wrong: parseInt(wrong) });
    } else {
      wrong = 0;
    }

    var that = this;
    request({
      url: `api/qbank/problem/${option.id}/${done}`,
      success: function(res) {
        res = res.map(item => {
          var choices = item.choices;
          item.choices = [];
          for (var key in choices) {
            item.choices.push({ key: key, content: choices[key] });
          }
          return item;
        });

        if (res.length > 0) {
          that.setData({
            problems: res,
            problem: res[0]
          });
        } else {
          // TODO
        }
      }
    });
  },
  onUnload: function() {
    console.log(this.data.wrong);
    wx.setStorageSync('cnt_done_' + this.data.chapterId, this.data.done.toString());
    wx.setStorageSync('cnt_wrong_' + this.data.chapterId, this.data.wrong.toString());
  },
  checkboxChange: function(e) {
    this.setData({ answer: e.detail.value });
  },
  submit: function() {
    if (pending) return;
    // 答案对比
    var answer1 = this.data.answer;
    var answer2 = this.data.problem.answer;
    answer1.sort();
    answer2.sort();
    if (answer1.toString() === answer2.toString()) {
      this.setData({ right: true });
    } else {
      this.setData({ right: false });
    }

    var submitted = this.data.submitted;
    this.setData({ submitted: !submitted });
  },
  prev: function() {
    if (pending) return;

    var data = this.data;
    if (data.index > 0) {
      this.setData({ problem: data.problems[data.index - 1] });
    } else {
      // 获取题目
      if (data.done === 0) {
        wx.showModal({ title: '提示', content: '已到达第一题' });
        return;
      }

      pending = true;
      var that = this;
      request({
        url: `api/qbank/problem/prev/${data.chapterId}/${data.done - 1}`,
        success: function(res) {
          res = res.map(item => {
            var choices = item.choices;
            item.choices = [];
            for (var key in choices) {
              item.choices.push({ key: key, content: choices[key] });
            }
            return item;
          });
          if (res.length > 0) {
            that.setData({
              problems: [...res, ...data.problems],
              problem: res[res.length - 1],
              index: data.index + res.length - 1,
              done: data.done - 1
            });

          } else {
            // TODO
          }
          pending = false;
        }
      });
    }
    this.setData({
      index: data.index - 1,
      done: data.done - 1
    });
  },
  next: function() {
    if (pending) return;

    var data = this.data;

    if (data.done === data.doneMax && !data.right) {
      this.setData({ wrong: data.wrong + 1 });
    }

    if (data.problems.length > data.index + 1) {
      this.setData({ problem: data.problems[data.index + 1] });
    } else {
      // 获取题目
      if (data.done + 1 >= data.total) {
        this.setData({  done: data.done + 1 });
        wx.showModal({ title: '提示', content: '已到达最后一题' });
        return;
      }

      pending = true;
      var that = this;

      request({
        url: `api/qbank/problem/${data.chapterId}/${data.done + 1}`,
        success: function(res) {
          res = res.map(item => {
            var choices = item.choices;
            item.choices = [];
            for (var key in choices) {
              item.choices.push({ key: key, content: choices[key] });
            }
            return item;
          });
          if (res.length > 0) {
            that.setData({
              problems: [...data.problems, ...res],
              problem: res[0]
            });
          } else {
            // TODO
          }
          pending = false;
        }
      });
    }

    this.setData({
      submitted: !data.submitted,
      index: data.index + 1,
      done: data.done + 1,
      doneMax: data.doneMax > data.done + 1 ? data.doneMax : data.done + 1
    });
  }
})

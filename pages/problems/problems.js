var request = require('../../utils/request').request;
var attachAns = require('../../utils/util').attachAns;
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
    wrong: [],
    answer: [],
    right: false,
    submitted: true
  },
  onLoad: function(option) {
    console.log(option);
    this.setData({ chapterId: option.id, total: option.total });

    // 总题数
    var done = wx.getStorageSync('cnt_done_' + option.id);
    var doneMax;
    console.log(done, option.total);
    if (done) {
      done = parseInt(done);
      doneMax = done;
      // 全部完成时显示最后一题
      if (done >= option.total) done = option.total-1;
    } else {
      doneMax = done = 0;
    }
    this.setData({ done: parseInt(done), doneMax: parseInt(doneMax) });

    // 错题数
    var wrong = wx.getStorageSync('cnt_wrong_' + option.id);
    if (wrong) {
      wrong = parseInt(wrong);
    } else {
      wrong = 0;
    }
    this.setData({ wrong: parseInt(wrong) });

    console.log(done);
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
            problem: attachAns.call(that, res[0])
          });
        } else {
          // TODO
        }
      }
    });
  },
  onUnload: function() {
    var done = this.data.doneMax;
    if (this.data.submitted) done++;
    wx.setStorageSync('cnt_done_' + this.data.chapterId, done.toString());
    wx.setStorageSync('cnt_wrong_' + this.data.chapterId, this.data.wrong.toString());
  },
  onChange: function() {

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
      this.setData({
        right: false,
        wrong: this.data.wrong + 1
      });
    }

    wx.setStorageSync('prob_ans_' + this.data.problem._id, JSON.stringify(answer1));

    this.setData({ submitted: !this.data.submitted });
  },
  prev: function() {
    if (pending) return;

    var data = this.data;

    if (data.done === 0) {
      wx.showModal({ title: '提示', content: '已到达第一题' });
      return;
    }

    if (data.index > 0) {
      this.setData({
        problem: attachAns.call(this, data.problems[data.index - 1]),
        index: data.index - 1,
        done: data.done - 1
      });
    } else {
      // 获取题目
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
              problem: attachAns.call(that, res[res.length - 1]),
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
  },
  next: function() {
    if (pending) return;

    var data = this.data;

    // 获取题目
    if (data.done + 1 >= data.total) {
      if (data.done + 1 === data.total) {
        this.setData({
          done: data.done + 1,
          doneMax: data.doneMax > data.done + 1 ? data.doneMax : data.done + 1
        });
      }
      wx.showModal({ title: '提示', content: '已到达最后一题' });
      return;
    }

    if (data.problems.length > data.index + 1) {
      this.setData({ problem: attachAns.call(this, data.problems[data.index + 1]) });
    } else {
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
              problem: attachAns.call(that, res[0])
            });
          } else {
            // TODO
          }
          pending = false;
        }
      });
    }

    this.setData({
      index: data.index + 1,
      done: data.done + 1,
      doneMax: data.doneMax > data.done + 1 ? data.doneMax : data.done + 1
    });
  }
})

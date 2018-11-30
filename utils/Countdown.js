
let countDown = function (times) {
  // 获取当前时间，同时得到活动结束时间数组
  times = times.replace(/\-/g, "/")
  let newTime = new Date().getTime();
  let countDownArr = [];
  // 对结束时间进行处理渲染到页面
  let endTime = new Date(times).getTime();
  let obj = null;
  // 如果活动未结束，对时间进行处理
  if (endTime - newTime > 0) {
    let time = (endTime - newTime) / 1000;
    // 获取天、时、分、秒
    let day = parseInt(time / (60 * 60 * 24));
    let hou = parseInt(time % (60 * 60 * 24) / 3600);
    let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
    let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
    obj = {
      day: timeFormat(day),
      hou: timeFormat(hou),
      min: timeFormat(min),
      sec: timeFormat(sec),
      isEnd:false
    }
  } else {//活动已结束，全部设置为'00'
    obj = {
      day: '00',
      hou: '00',
      min: '00',
      sec: '00',
      isEnd:true
    }
  }
  countDownArr = obj
  // 渲染，然后每隔一秒执行一次倒计时函数
  return countDownArr
  // this.setData({ countDownList: countDownArr })
  // setTimeout(countDown, 1000);
}

function timeFormat(param) {//小于10的格式化函数
  return param < 10 ? '0' + param : param;
}

module.exports = countDown
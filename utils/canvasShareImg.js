var app = getApp();



let canvasShareImg = function(imgUrl,text1,text2){
  console.log('run')
  return new Promise((resolve, reject)=>{
  wx.downloadFile({
    url: imgUrl,
    success: function (res) {
      drawImage(res.tempFilePath, text1, text2);
      setTimeout(function () {
        canvasToImage(resolve)
      }, 500)
    }
  })
})
}

let drawImage = function (portraitPath,text1,text2) {
   //绘制canvas图片
   const ctx = wx.createCanvasContext('myCanvas')
   ctx.setFillStyle('#ffffff')
   ctx.fillRect(0, 0, 800, 642)
   ctx.drawImage(portraitPath, 0, 80, 800, 622)
   ctx.restore()
   ctx.setFillStyle('#FF0000')
   ctx.setFontSize(60)
  ctx.fillText('￥' + text1, 10, 50)
  console.log(text1.toString().length)
   ctx.setFillStyle('#cccccc')
   ctx.setFontSize(50)
  let text1Left = ((text1.toString().length+1) * 30+80);
  ctx.fillText('￥' + text2, text1Left, 50)
   ctx.moveTo(text1Left, 30)
    ctx.lineTo(text1Left + (text2.toString().length+1) *30+35, 30)
   ctx.strokeStyle = ('#cccccc');
   ctx.lineWidth = '5'
   ctx.fill();
   ctx.stroke()
   ctx.draw();
}

let canvasToImage = function (resolve) {
  wx.canvasToTempFilePath({
    x: 0,
    y: 0,
    width: 800,
    height: 642,
    destWidth: 800,
    destHeight: 642,
    canvasId: 'myCanvas',
    success: function (res) {
      return resolve(res.tempFilePath)
    },
    fail: function (err) {
    }
  })
}

module.exports = canvasShareImg
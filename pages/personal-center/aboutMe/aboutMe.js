Page({
  data: {
    markers: [{
      iconPath: "/images/icon/zuobiaosea.png",
      id: 0,
      latitude: 30.480270,
      longitude: 114.421820,
      width: 40,
      height: 40
    }],
    polyline: [{
      points: [{
        longitude: 113.3245211,
        latitude: 23.10229
      }, {
        longitude: 113.324520,
        latitude: 23.21229
      }],
      color: "#FF0000DD",
      width: 2,
      dottedLine: true
    }],
    // controls: [{
    //   id: 1,
    //   iconPath: "/images/icon/zuobiaodingwei.png",
    //   position: {
    //     left: 3,
    //     top: 300 - 50,
    //     width: 40,
    //     height: 40
    //   },
    //   clickable: true
    // }]
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  }
})
//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    config_res: "配网结果"
  },

  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  bindKeyInputSsid: function (e) {
    this.setData({
      ssid: e.detail.value
    })
  },
  bindKeyInputPwd: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  
  startConfig: function(e) {
    console.log("start config");
    const udp = wx.createUDPSocket()
    const locationPort = udp.bind()
    var object = {};
    var that = this;
    object['ssid'] = that.data.ssid;
    object['password'] = that.data.password;

    var json = JSON.stringify(object);//JSON.stringify()

    udp.send({
      address: '192.168.10.1',
      port: 20032,
      message: json
    })

    // receive
    udp.onListening(function(res){
      console.log('监听中...')
      console.log(res)
    })

    udp.onMessage(function(res){
      console.log(res)
      let unit8Arr = new Uint8Array(res.message.data);
      let encodedString = String.fromCharCode.apply(null, unit8Arr),
      decodedString = decodeURIComponent(escape((encodedString)));//没有这一步中文会乱码

      console.log('str===' + decodedString)
      var obj = JSON.parse(decodedString);
      var res_data;
      res_data = "type:" + obj.type + '\n';
      res_data = res_data + "mac:" +  obj .mac + '\n' ;
      that.setData({
        config_res: res_data
      })

    })
  }
})

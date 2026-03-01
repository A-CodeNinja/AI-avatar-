// pages/recharge/recharge.js
const app = getApp();

Page({
  data: {
    points: 0,
    selectedOption: null,
    rechargeOptions: [
      { id: 1, points: 50,   price: '4.9',  tag: '',     icon: '⚡' },
      { id: 2, points: 150,  price: '9.9',  tag: '推荐', icon: '🔥' },
      { id: 3, points: 600,  price: '29.9', tag: '',     icon: '💎' },
      { id: 4, points: 1500, price: '49.9', tag: '超值', icon: '👑' }
    ],
    isPaying: false
  },

  onLoad(options) {
    this.loadPoints();
  },

  onShow() {
    this.loadPoints();
  },

  loadPoints() {
    if (app.globalData.userInfo) {
      this.setData({ points: app.globalData.userInfo.points || 0 });
    }
  },

  selectOption(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedOption: this.data.selectedOption === id ? null : id
    });
  },

  async handlePay() {
    if (!this.data.selectedOption) {
      wx.showToast({ title: '请先选择充值套餐', icon: 'none' });
      return;
    }

    const selected = this.data.rechargeOptions.find(o => o.id === this.data.selectedOption);
    if (!selected) return;

    this.setData({ isPaying: true });

    try {
      // ⚠️ 接入微信支付：需要在云函数 createPayOrder 中生成预支付订单
      // 文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/payment.html
      const orderRes = await wx.cloud.callFunction({
        name: 'createPayOrder',
        data: {
          productId: selected.id,
          points:    selected.points,
          amount:    selected.price
        }
      });

      if (!orderRes.result || orderRes.result.code !== 0) {
        throw new Error(orderRes.result ? orderRes.result.msg : '创建订单失败');
      }

      const { payment } = orderRes.result;

      await wx.requestPayment({
        timeStamp: payment.timeStamp,
        nonceStr:  payment.nonceStr,
        package:   payment.package,
        signType:  payment.signType || 'RSA',
        paySign:   payment.paySign
      });

      // 支付成功：刷新积分
      wx.showToast({ title: `成功充值${selected.points}积分`, icon: 'success' });
      app.getUserInfo();
      this.loadPoints();

    } catch (err) {
      if (err.errMsg && err.errMsg.includes('cancel')) {
        wx.showToast({ title: '已取消支付', icon: 'none' });
      } else {
        console.error('充值失败', err);
        wx.showModal({
          title: '充值失败',
          content: err.message || '请稍后重试，若持续异常请联系客服',
          showCancel: false
        });
      }
    } finally {
      this.setData({ isPaying: false });
    }
  },

  goToPoints() {
    wx.switchTab({ url: '/pages/points/points' });
  },

  onShareAppMessage() {
    return {
      title: 'AI头像生成神器，快来试试！',
      path: '/pages/index/index'
    };
  }
});

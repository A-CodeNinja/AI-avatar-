Page({
  data: {
    content: '',
    contact: '',
    submitting: false
  },

  onInputContent(e) {
    this.setData({ content: (e.detail.value || '').trimStart() });
  },

  onInputContact(e) {
    this.setData({ contact: (e.detail.value || '').trim() });
  },

  async submitFeedback() {
    const content = (this.data.content || '').trim();
    const contact = (this.data.contact || '').trim();

    if (content.length < 5) {
      wx.showToast({ title: '反馈内容至少5个字', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'submitFeedback',
        data: { content, contact }
      });

      wx.hideLoading();
      if (!res.result || res.result.code !== 0) {
        throw new Error((res.result && res.result.msg) || '提交失败');
      }

      this.setData({ content: '', contact: '' });
      wx.showToast({ title: '提交成功，感谢反馈', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '提交失败，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  }
});

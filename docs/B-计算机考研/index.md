# 计算机考研

<div style="text-align: center; margin: 30px 0;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); color: white; max-width: 600px; margin: 0 auto;">
    <h2 style="margin-top: 0; font-size: 28px; font-weight: bold;">⏰ 考研倒计时</h2>
    <div id="countdown-target" style="font-size: 18px; margin: 10px 0; opacity: 0.9;">目标: 2026年12月19日</div>
    <div id="countdown-details" style="display: flex; justify-content: space-around; margin-top: 20px;">
      <div style="flex: 1; padding: 10px;">
        <div id="days" style="font-size: 36px; font-weight: bold;">0</div>
        <div style="font-size: 14px; opacity: 0.8;">天</div>
      </div>
      <div style="flex: 1; padding: 10px;">
        <div id="hours" style="font-size: 36px; font-weight: bold;">0</div>
        <div style="font-size: 14px; opacity: 0.8;">时</div>
      </div>
      <div style="flex: 1; padding: 10px;">
        <div id="minutes" style="font-size: 36px; font-weight: bold;">0</div>
        <div style="font-size: 14px; opacity: 0.8;">分</div>
      </div>
      <div style="flex: 1; padding: 10px;">
        <div id="seconds" style="font-size: 36px; font-weight: bold;">0</div>
        <div style="font-size: 14px; opacity: 0.8;">秒</div>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  // 设置考研目标日期（2026年12月19日 00:00:00）
  const examDate = new Date('2026-12-19T00:00:00').getTime();
  
  // 设置开始准备的日期（可以根据实际情况修改）
  const startDate = new Date('2024-01-01T00:00:00').getTime();
  
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = examDate - now;
  
    if (distance < 0) {
      document.getElementById('days').innerHTML = '0';
      document.getElementById('hours').innerHTML = '0';
      document.getElementById('minutes').innerHTML = '0';
      document.getElementById('seconds').innerHTML = '0';
      return;
    }
  
    // 计算时间
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
    // 更新显示
    document.getElementById('days').innerHTML = days;
    document.getElementById('hours').innerHTML = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerHTML = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerHTML = seconds.toString().padStart(2, '0');
  }
  
  // 初始更新
  updateCountdown();
  
  // 每秒更新
  setInterval(updateCountdown, 1000);
})();
</script>

# 计算机考研

<div style="text-align: center; margin: 30px 0;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); color: white; max-width: 600px; margin: 0 auto;">
    <h2 style="margin-top: 0; font-size: 28px; font-weight: bold;">⏰ 考研倒计时</h2>
    <div id="countdown-target" style="font-size: 18px; margin: 10px 0; opacity: 0.9;">目标: 2026年12月26日</div>
    <div id="countdown" style="font-size: 48px; font-weight: bold; margin: 20px 0; letter-spacing: 2px;">
      加载中...
    </div>
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
    <div id="progress-bar" style="margin-top: 20px; background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
      <div id="progress" style="height: 100%; background: rgba(255,255,255,0.8); width: 0%; transition: width 1s;"></div>
    </div>
    <div id="progress-text" style="margin-top: 10px; font-size: 14px; opacity: 0.8;">已准备: 0%</div>
  </div>
</div>

<script>
(function() {
  // 设置考研目标日期（2026年12月26日 00:00:00）
  const examDate = new Date('2026-12-26T00:00:00').getTime();
  
  // 设置开始准备的日期（可以根据实际情况修改）
  const startDate = new Date('2024-01-01T00:00:00').getTime();
  
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = examDate - now;
    
    if (distance < 0) {
      document.getElementById('countdown').innerHTML = '🎉 考试已开始！';
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
    
    // 更新主显示
    document.getElementById('countdown').innerHTML = `${days} 天`;
    
    // 计算进度
    const totalTime = examDate - startDate;
    const elapsed = now - startDate;
    const progress = Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
    
    document.getElementById('progress').style.width = progress.toFixed(2) + '%';
    document.getElementById('progress-text').innerHTML = `已准备: ${progress.toFixed(1)}%`;
  }
  
  // 初始更新
  updateCountdown();
  
  // 每秒更新
  setInterval(updateCountdown, 1000);
})();
</script>

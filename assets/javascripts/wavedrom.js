document$.subscribe(function() {
  if (typeof WaveDrom !== 'undefined') {
    WaveDrom.ProcessAll();
  }
})
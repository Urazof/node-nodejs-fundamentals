const progress = () => {
  const totalDuration = 5000; // 5 seconds
  const updateInterval = 100; // Update every 100ms
  const totalSteps = totalDuration / updateInterval;
  const barWidth = 30;

  let currentStep = 0;

  const drawProgress = (percent) => {
    const filled = Math.floor((barWidth * percent) / 100);
    const empty = barWidth - filled;
    const bar = '█'.repeat(filled) + ' '.repeat(empty);
    process.stdout.write(`\r[${bar}] ${percent}%`);
  };

  const timer = setInterval(() => {
    currentStep++;
    const percent = Math.floor((currentStep / totalSteps) * 100);

    drawProgress(percent);

    if (currentStep >= totalSteps) {
      clearInterval(timer);
      console.log('\nProgress complete!');
    }
  }, updateInterval);
};

progress();

const progress = () => {
  // Парсинг аргументов командной строки
  const args = process.argv.slice(2);
  let totalDuration = 5000; // По умолчанию 5 секунд

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--duration' && args[i + 1]) {
      totalDuration = parseInt(args[i + 1], 10) * 1000; // конвертируем в миллисекунды
    }
  }

  const updateInterval = 100; // Обновление каждые 100ms
  const totalSteps = totalDuration / updateInterval;
  const barWidth = 30;

  let currentStep = 0;

  const drawProgress = (percent) => {
    const filled = Math.floor((barWidth * percent) / 100);
    const empty = barWidth - filled;
    const bar = '█'.repeat(filled) + ' '.repeat(empty);
    process.stdout.write(`\r[${bar}] ${percent}%`);
  };

  // Показываем начальный прогресс сразу
  setImmediate(() => {
    drawProgress(0);
  });

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

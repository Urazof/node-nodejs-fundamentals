const progress = () => {
  // Парсинг аргументов командной строки
  const args = process.argv.slice(2);
  let totalDuration = 5000; // По умолчанию 5 секунд
  let color = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--duration' && args[i + 1]) {
      totalDuration = parseInt(args[i + 1], 10) * 1000; // конвертируем в миллисекунды
    }
    if (args[i] === '--color' && args[i + 1]) {
      color = args[i + 1];
    }
  }

  const updateInterval = 100; // Обновление каждые 100ms
  const totalSteps = totalDuration / updateInterval;
  const barWidth = 30;

  let currentStep = 0;

  // Конвертируем hex цвет в ANSI escape код
  const getColorCode = (hexColor) => {
    if (!hexColor) return '';

    // Удаляем # если есть
    const hex = hexColor.replace('#', '');

    // Конвертируем hex в RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // ANSI 24-bit RGB escape код
    return `\x1b[38;2;${r};${g};${b}m`;
  };

  const resetColor = '\x1b[0m';
  const colorCode = color ? getColorCode(color) : '';

  const drawProgress = (percent) => {
    const filled = Math.floor((barWidth * percent) / 100);
    const empty = barWidth - filled;
    const bar = '█'.repeat(filled) + ' '.repeat(empty);

    if (colorCode) {
      process.stdout.write(`\r${colorCode}[${bar}] ${percent}%${resetColor}`);
    } else {
      process.stdout.write(`\r[${bar}] ${percent}%`);
    }
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

// Состояние приложения
let currentAudioFile = null;
let currentAudioUrl = null;

// Элементы DOM
const uploadSection = document.getElementById("upload-section");
const resultsSection = document.getElementById("results-section");
const fileInput = document.getElementById("file-input");
const uploadArea = document.getElementById("upload-area");
const fileInfo = document.getElementById("file-info");
const fileName = document.getElementById("file-name");
const fileRemove = document.getElementById("file-remove");
const urlInput = document.getElementById("url-input");
const urlSubmit = document.getElementById("url-submit");
const urlStatus = document.getElementById("url-status");
const analyzeBtn = document.getElementById("analyze-btn");
const backBtn = document.getElementById("back-btn");
const audioPlayer = document.getElementById("audio-player");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Элементы видео-секции
const videoToggle = document.getElementById("video-toggle");
const videoWrapper = document.getElementById("video-wrapper");
const videoPlayer = document.getElementById("video-player");
const videoPlaceholder = document.getElementById("video-placeholder");
const videoUrlInput = document.getElementById("video-url-input");
const videoUrlSubmit = document.getElementById("video-url-submit");

// Управление видео-секцией
if (videoToggle && videoWrapper) {
  videoToggle.addEventListener("click", () => {
    videoWrapper.classList.toggle("collapsed");
    videoToggle.classList.toggle("collapsed");
  });
}

// Функция для преобразования YouTube URL в embed формат
function convertToEmbedUrl(url) {
  // YouTube обычная ссылка: https://www.youtube.com/watch?v=VIDEO_ID
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
  }

  // YouTube embed уже: https://www.youtube.com/embed/VIDEO_ID
  if (url.includes("youtube.com/embed/")) {
    return url.split("?")[0] + "?rel=0&modestbranding=1";
  }

  // Vimeo: https://vimeo.com/VIDEO_ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Vimeo embed уже: https://player.vimeo.com/video/VIDEO_ID
  if (url.includes("player.vimeo.com")) {
    return url;
  }

  return null;
}

// Загрузка видео по URL
if (videoUrlSubmit && videoUrlInput && videoPlayer && videoPlaceholder) {
  videoUrlSubmit.addEventListener("click", () => {
    const url = videoUrlInput.value.trim();

    if (!url) {
      alert("Введите URL видео");
      return;
    }

    const embedUrl = convertToEmbedUrl(url);

    if (embedUrl) {
      videoPlayer.src = embedUrl;
      videoPlaceholder.classList.add("hidden");
      videoUrlInput.value = "";
    } else {
      alert("Неподдерживаемый формат URL. Используйте YouTube или Vimeo ссылку.");
    }
  });

  // Поддержка Enter в поле ввода
  videoUrlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      videoUrlSubmit.click();
    }
  });
}

// Можно установить видео по умолчанию (раскомментируйте и укажите свой YouTube ID)
// Пример: https://www.youtube.com/watch?v=dQw4w9WgXcQ
// const defaultVideoId = "dQw4w9WgXcQ"; // Замените на реальный ID
// if (videoPlayer && videoPlaceholder) {
//   videoPlayer.src = `https://www.youtube.com/embed/${defaultVideoId}?rel=0&modestbranding=1`;
//   videoPlaceholder.classList.add("hidden");
// }

// Переключение табов
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabName = btn.getAttribute("data-tab");

    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    tabContents.forEach((content) => {
      content.classList.toggle("active", content.id === `tab-${tabName}`);
    });

    // Очистка при переключении
    if (tabName === "file") {
      urlInput.value = "";
      urlStatus.style.display = "none";
    } else {
      fileInput.value = "";
      fileInfo.style.display = "none";
      currentAudioFile = null;
    }

    updateAnalyzeButton();
  });
});

// Обработка drag & drop
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFileSelect(files[0]);
  }
});

// Обработка выбора файла
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleFileSelect(e.target.files[0]);
  }
});

function handleFileSelect(file) {
  // Проверка типа файла
  if (!file.type.startsWith("audio/")) {
    alert("Пожалуйста, выберите аудиофайл");
    return;
  }

  // Проверка размера (100 МБ)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("Файл слишком большой. Максимальный размер: 100 МБ");
    return;
  }

  currentAudioFile = file;
  fileName.textContent = file.name;
  fileInfo.style.display = "flex";
  updateAnalyzeButton();
}

// Удаление файла
fileRemove.addEventListener("click", () => {
  fileInput.value = "";
  fileInfo.style.display = "none";
  currentAudioFile = null;
  updateAnalyzeButton();
});

// Загрузка по URL
urlSubmit.addEventListener("click", async () => {
  const url = urlInput.value.trim();

  if (!url) {
    showUrlStatus("Введите URL", "error");
    return;
  }

  // Простая валидация URL
  try {
    new URL(url);
  } catch {
    showUrlStatus("Некорректный URL", "error");
    return;
  }

  urlSubmit.disabled = true;
  urlSubmit.textContent = "Проверяем...";
  showUrlStatus("Проверка ссылки...", "success");

  // Имитация проверки URL
  await new Promise((resolve) => setTimeout(resolve, 1000));

  currentAudioUrl = url;
  showUrlStatus("Ссылка успешно загружена", "success");
  urlSubmit.disabled = false;
  urlSubmit.textContent = "Загрузить";
  updateAnalyzeButton();
});

function showUrlStatus(message, type) {
  urlStatus.textContent = message;
  urlStatus.className = `url-status ${type}`;
  urlStatus.style.display = "block";
}

// Обновление состояния кнопки анализа
function updateAnalyzeButton() {
  const hasFile = currentAudioFile !== null;
  const hasUrl = currentAudioUrl !== null && urlInput.value.trim() !== "";
  analyzeBtn.disabled = !hasFile && !hasUrl;
}

// Анализ аудио
analyzeBtn.addEventListener("click", async () => {
  if (analyzeBtn.disabled) return;

  // Показываем индикатор загрузки
  analyzeBtn.querySelector(".btn-text").style.display = "none";
  analyzeBtn.querySelector(".btn-loader").style.display = "flex";
  analyzeBtn.disabled = true;

  try {
    // Имитация загрузки и анализа (в реальном приложении здесь будет API запрос)
    await simulateAnalysis();

    // Устанавливаем аудио для плеера
    if (currentAudioFile) {
      const audioUrl = URL.createObjectURL(currentAudioFile);
      audioPlayer.src = audioUrl;
    } else if (currentAudioUrl) {
      audioPlayer.src = currentAudioUrl;
    }

    // Показываем результаты
    displayResults();
    uploadSection.style.display = "none";
    resultsSection.style.display = "block";
  } catch (error) {
    alert("Ошибка при анализе: " + error.message);
  } finally {
    analyzeBtn.querySelector(".btn-text").style.display = "block";
    analyzeBtn.querySelector(".btn-loader").style.display = "none";
    analyzeBtn.disabled = false;
  }
});

// Имитация анализа (задержка + генерация мок-данных)
function simulateAnalysis() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockAnalysis());
    }, 3000);
  });
}

// Генерация мок-данных анализа
function generateMockAnalysis() {
  const duration = currentAudioFile
    ? Math.floor(Math.random() * 300 + 180) // 3-8 минут
    : Math.floor(Math.random() * 600 + 300); // 5-15 минут

  return {
    duration: duration,
    participants: Math.random() > 0.5 ? 2 : 3,
    transcription: `Это пример транскрипции звонка. В реальном приложении здесь будет полный текст разговора, 
    распознанный с помощью технологии распознавания речи. Транскрипция включает все реплики участников, 
    паузы и ключевые моменты обсуждения. Система анализирует интонацию, эмоциональную окраску речи 
    и выделяет важные темы для дальнейшего анализа.`,
    keyPoints: [
      "Обсуждение условий сотрудничества и сроков реализации проекта",
      "Согласование бюджета и этапов оплаты",
      "Определение ключевых контактов и ответственных лиц",
      "Планирование следующего шага - подготовка коммерческого предложения",
    ],
    sentiment: {
      positive: 65,
      neutral: 25,
      negative: 10,
    },
    quality: {
      clarity: 85,
      engagement: 78,
      professionalism: 92,
    },
    stats: {
      totalWords: Math.floor(Math.random() * 2000 + 1000),
      speakingTime: Math.floor(duration * 0.7),
      silenceTime: Math.floor(duration * 0.3),
      interruptions: Math.floor(Math.random() * 5),
    },
  };
}

// Отображение результатов
let analysisData = null;

function displayResults() {
  // Генерируем данные анализа
  analysisData = generateMockAnalysis();

  // Общая статистика
  const generalStats = document.getElementById("general-stats");
  generalStats.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Участников</span>
      <span class="stat-value">${analysisData.participants}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Всего слов</span>
      <span class="stat-value">${analysisData.stats.totalWords}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Прерываний</span>
      <span class="stat-value">${analysisData.stats.interruptions}</span>
    </div>
  `;

  // Длительность
  const durationStats = document.getElementById("duration-stats");
  const minutes = Math.floor(analysisData.duration / 60);
  const seconds = analysisData.duration % 60;
  durationStats.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Общая длительность</span>
      <span class="stat-value">${minutes}:${seconds.toString().padStart(2, "0")}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Время речи</span>
      <span class="stat-value">${Math.floor(analysisData.stats.speakingTime / 60)}:${(analysisData.stats.speakingTime % 60).toString().padStart(2, "0")}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Паузы</span>
      <span class="stat-value">${Math.floor(analysisData.stats.silenceTime / 60)}:${(analysisData.stats.silenceTime % 60).toString().padStart(2, "0")}</span>
    </div>
  `;

  // Транскрипция
  document.getElementById("transcription").textContent = analysisData.transcription;

  // Ключевые моменты
  const keyPoints = document.getElementById("key-points");
  keyPoints.innerHTML = analysisData.keyPoints
    .map((point) => `<div class="key-point">${point}</div>`)
    .join("");

  // Тональность
  const sentiment = document.getElementById("sentiment");
  sentiment.innerHTML = `
    <div class="sentiment-item">
      <span class="sentiment-label">Позитивная</span>
      <div class="sentiment-bar">
        <div class="sentiment-fill positive" style="width: ${analysisData.sentiment.positive}%"></div>
      </div>
      <span class="sentiment-value">${analysisData.sentiment.positive}%</span>
    </div>
    <div class="sentiment-item">
      <span class="sentiment-label">Нейтральная</span>
      <div class="sentiment-bar">
        <div class="sentiment-fill neutral" style="width: ${analysisData.sentiment.neutral}%"></div>
      </div>
      <span class="sentiment-value">${analysisData.sentiment.neutral}%</span>
    </div>
    <div class="sentiment-item">
      <span class="sentiment-label">Негативная</span>
      <div class="sentiment-bar">
        <div class="sentiment-fill negative" style="width: ${analysisData.sentiment.negative}%"></div>
      </div>
      <span class="sentiment-value">${analysisData.sentiment.negative}%</span>
    </div>
  `;

  // Метрики качества
  const qualityMetrics = document.getElementById("quality-metrics");
  qualityMetrics.innerHTML = `
    <div class="metric-item">
      <span class="metric-label">Чёткость речи</span>
      <div class="metric-bar">
        <div class="metric-fill" style="width: ${analysisData.quality.clarity}%"></div>
      </div>
      <span class="metric-value">${analysisData.quality.clarity}%</span>
    </div>
    <div class="metric-item">
      <span class="metric-label">Вовлечённость</span>
      <div class="metric-bar">
        <div class="metric-fill" style="width: ${analysisData.quality.engagement}%"></div>
      </div>
      <span class="metric-value">${analysisData.quality.engagement}%</span>
    </div>
    <div class="metric-item">
      <span class="metric-label">Профессионализм</span>
      <div class="metric-bar">
        <div class="metric-fill" style="width: ${analysisData.quality.professionalism}%"></div>
      </div>
      <span class="metric-value">${analysisData.quality.professionalism}%</span>
    </div>
  `;
}

// Возврат к загрузке
backBtn.addEventListener("click", () => {
  resultsSection.style.display = "none";
  uploadSection.style.display = "block";
  audioPlayer.pause();
  audioPlayer.src = "";
});

// Инициализация
updateAnalyzeButton();

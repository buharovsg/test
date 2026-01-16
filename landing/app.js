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

// Функция отправки аудиофайла на бэкенд и получения результатов анализа
async function analyzeAudioOnBackend() {
  const backendUrl = "https://webhook.aitechnic.ru/webhook/call-url";
  
  const formData = new FormData();
  
  // Добавляем файл или URL в зависимости от выбранного способа
  if (currentAudioFile) {
    formData.append("audio", currentAudioFile);
  } else if (currentAudioUrl) {
    formData.append("audio_url", currentAudioUrl);
  } else {
    throw new Error("Не выбран аудиофайл или URL");
  }

  const response = await fetch(backendUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}

// Анализ аудио
analyzeBtn.addEventListener("click", async () => {
  if (analyzeBtn.disabled) return;

  // Показываем индикатор загрузки
  analyzeBtn.querySelector(".btn-text").style.display = "none";
  analyzeBtn.querySelector(".btn-loader").style.display = "flex";
  analyzeBtn.disabled = true;

  try {
    // Отправляем аудио на бэкенд и получаем результаты
    const analysisResult = await analyzeAudioOnBackend();

    // Устанавливаем аудио для плеера
    if (currentAudioFile) {
      const audioUrl = URL.createObjectURL(currentAudioFile);
      audioPlayer.src = audioUrl;
    } else if (currentAudioUrl) {
      audioPlayer.src = currentAudioUrl;
    }

    // Показываем результаты анализа
    displayResults(analysisResult);
    uploadSection.style.display = "none";
    resultsSection.style.display = "block";
  } catch (error) {
    console.error("Ошибка при анализе:", error);
    alert("Ошибка при анализе: " + error.message);
  } finally {
    analyzeBtn.querySelector(".btn-text").style.display = "block";
    analyzeBtn.querySelector(".btn-loader").style.display = "none";
    analyzeBtn.disabled = false;
  }
});

// Мок-функции больше не нужны - используем реальные данные от бэкенда

// Отображение результатов анализа
function displayResults(backendData) {
  if (!backendData) {
    console.error("Нет данных для отображения");
    return;
  }

  // Извлекаем данные из ответа бэкенда
  const analysis = backendData.analysis || {};
  const transcript = backendData.transcript || {};
  const totals = analysis.totals || {};
  const summary = analysis.summary || {};
  const stages = analysis.stages || [];
  const duration = backendData.duration_seconds || 0;

  // Подсчитываем количество участников из транскрипции
  const transcriptText = transcript.text || "";
  const participants = transcriptText.match(/(?:Оператор|Клиент):/g) 
    ? [...new Set(transcriptText.match(/(?:Оператор|Клиент):/g))].length 
    : 2;

  // Подсчитываем количество слов
  const wordCount = transcriptText.split(/\s+/).filter(word => word.length > 0).length;

  // Общая статистика
  const generalStats = document.getElementById("general-stats");
  generalStats.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Участников</span>
      <span class="stat-value">${participants}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Всего слов</span>
      <span class="stat-value">${wordCount}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Общий балл</span>
      <span class="stat-value">${totals.points_earned_total || 0} / ${totals.max_points_overall || 100}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Оценка</span>
      <span class="stat-value">${totals.score_percent || 0}%</span>
    </div>
  `;

  // Длительность
  const durationStats = document.getElementById("duration-stats");
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  durationStats.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Общая длительность</span>
      <span class="stat-value">${minutes}:${seconds.toString().padStart(2, "0")}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Call ID</span>
      <span class="stat-value" style="font-size: 11px; font-family: monospace;">${backendData.call_id || "—"}</span>
    </div>
  `;

  // Транскрипция
  document.getElementById("transcription").textContent = transcriptText || "Транскрипция недоступна";

  // Ключевые моменты (используем рекомендации и сильные стороны)
  const keyPoints = document.getElementById("key-points");
  const allPoints = [
    ...(summary.strengths || []).map(s => `✅ ${s}`),
    ...(summary.recommendations || []).map(r => `💡 ${r}`),
    ...(summary.weaknesses || []).map(w => `⚠️ ${w}`)
  ];
  
  if (allPoints.length > 0) {
    keyPoints.innerHTML = allPoints
      .map((point) => `<div class="key-point">${point}</div>`)
      .join("");
  } else {
    keyPoints.innerHTML = '<div class="key-point">Нет данных для отображения</div>';
  }

  // Тональность (вычисляем на основе оценок этапов)
  const passedStages = stages.filter(s => s.status === "pass").length;
  const totalStages = stages.length;
  const sentimentPositive = totalStages > 0 ? Math.round((passedStages / totalStages) * 100) : 0;
  const sentimentNegative = 100 - sentimentPositive;

  const sentiment = document.getElementById("sentiment");
  sentiment.innerHTML = `
    <div class="sentiment-item">
      <span class="sentiment-label">Позитивная</span>
      <div class="sentiment-bar">
        <div class="sentiment-fill positive" style="width: ${sentimentPositive}%"></div>
      </div>
      <span class="sentiment-value">${sentimentPositive}%</span>
    </div>
    <div class="sentiment-item">
      <span class="sentiment-label">Нейтральная</span>
      <div class="sentiment-bar">
        <div class="sentiment-fill neutral" style="width: 0%"></div>
      </div>
      <span class="sentiment-value">0%</span>
    </div>
    <div class="sentiment-item">
      <span class="sentiment-label">Негативная</span>
      <div class="sentiment-bar">
        <div class="sentiment-fill negative" style="width: ${sentimentNegative}%"></div>
      </div>
      <span class="sentiment-value">${sentimentNegative}%</span>
    </div>
  `;

  // Метрики качества (на основе этапов)
  const clarityScore = stages.find(s => s.stage_code === "greeting")?.points_earned || 0;
  const engagementScore = stages.find(s => s.stage_code === "needs_identification")?.points_earned || 0;
  const professionalismScore = stages.find(s => s.stage_code === "complaint_handling")?.points_earned || 0;

  const qualityMetrics = document.getElementById("quality-metrics");
  qualityMetrics.innerHTML = `
    <div class="metric-item">
      <span class="metric-label">Приветствие</span>
      <div class="metric-bar">
        <div class="metric-fill" style="width: ${(clarityScore / 5) * 100}%"></div>
      </div>
      <span class="metric-value">${clarityScore}/5</span>
    </div>
    <div class="metric-item">
      <span class="metric-label">Выявление потребностей</span>
      <div class="metric-bar">
        <div class="metric-fill" style="width: ${(engagementScore / 25) * 100}%"></div>
      </div>
      <span class="metric-value">${engagementScore}/25</span>
    </div>
    <div class="metric-item">
      <span class="metric-label">Работа с жалобой</span>
      <div class="metric-bar">
        <div class="metric-fill" style="width: ${(professionalismScore / 25) * 100}%"></div>
      </div>
      <span class="metric-value">${professionalismScore}/25</span>
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

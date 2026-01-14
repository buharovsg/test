// Мок-данные для демонстрации
const mockDashboardData = {
  kpis: {
    total: { value: 1240, trend: "+18% к прошлому периоду", trendPositive: true },
    responseTime: {
      value: "17 мин",
      trend: "-9% (быстрее)",
      trendPositive: false,
    },
    csat: { value: "4.6 / 5", trend: "+0.2", trendPositive: true },
    resolution: { value: "82%", trend: "+5 п.п.", trendPositive: true },
  },
  activityByDay: [
    { date: "Пн", value: 40 },
    { date: "Вт", value: 52 },
    { date: "Ср", value: 68 },
    { date: "Чт", value: 75 },
    { date: "Пт", value: 64 },
    { date: "Сб", value: 38 },
    { date: "Вс", value: 29 },
  ],
  channels: {
    email: 540,
    chat: 420,
    call: 280,
  },
  conversations: [
    {
      client: "ООО «Альфа»",
      channel: "email",
      topic: "Вопрос по интеграции API",
      manager: "Иван Петров",
      status: "resolved",
      csat: 5,
      date: "2026-01-10 14:32",
    },
    {
      client: "ИП Смирнов",
      channel: "chat",
      topic: "Не приходит отчёт на почту",
      manager: "Анна Сергеева",
      status: "open",
      csat: null,
      date: "2026-01-11 09:05",
    },
    {
      client: "ООО «Бета»",
      channel: "call",
      topic: "Согласование условий SLA",
      manager: "Пётр Кузнецов",
      status: "resolved",
      csat: 4,
      date: "2026-01-11 15:47",
    },
    {
      client: "ООО «Гамма»",
      channel: "chat",
      topic: "Ошибка авторизации",
      manager: "Мария Орлова",
      status: "pending",
      csat: null,
      date: "2026-01-12 10:13",
    },
    {
      client: "ИП Иванова",
      channel: "email",
      topic: "Запрос коммерческого предложения",
      manager: "Иван Петров",
      status: "resolved",
      csat: 5,
      date: "2026-01-12 11:02",
    },
  ],
};

function initKpis() {
  const { kpis } = mockDashboardData;

  const map = {
    total: "kpi-total",
    responseTime: "kpi-response-time",
    csat: "kpi-csat",
    resolution: "kpi-resolution",
  };

  Object.entries(map).forEach(([key, elementId]) => {
    const kpi = kpis[key];
    const valueEl = document.getElementById(elementId);
    const trendEl = document.getElementById(`${elementId}-trend`);
    if (!kpi || !valueEl || !trendEl) return;

    valueEl.textContent = kpi.value;
    trendEl.textContent = kpi.trend;

    trendEl.classList.toggle("positive", !!kpi.trendPositive);
    trendEl.classList.toggle("negative", !kpi.trendPositive);
  });
}

function initConversationsTable() {
  const tbody = document.getElementById("conversations-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  mockDashboardData.conversations.forEach((item) => {
    const tr = document.createElement("tr");

    const statusLabel = {
      open: "Открыто",
      resolved: "Решено",
      pending: "В ожидании",
    }[item.status];

    const channelLabel = {
      email: "Email",
      chat: "Чат",
      call: "Звонок",
    }[item.channel];

    tr.innerHTML = `
      <td>${item.client}</td>
      <td><span class="badge channel-${item.channel}">${channelLabel}</span></td>
      <td>${item.topic}</td>
      <td>${item.manager}</td>
      <td><span class="badge status-${item.status}">${statusLabel}</span></td>
      <td>${
        item.csat != null
          ? `<span class="csat-pill">${item.csat} / 5</span>`
          : '<span class="csat-pill" style="opacity:0.6;">—</span>'
      }</td>
      <td>${item.date}</td>
    `;

    tbody.appendChild(tr);
  });
}

let activityChart;
let channelsChart;

function initCharts() {
  const activityCtx = document.getElementById("chart-activity");
  const channelsCtx = document.getElementById("chart-channels");

  if (activityCtx) {
    if (activityChart) activityChart.destroy();

    activityChart = new Chart(activityCtx, {
      type: "line",
      data: {
        labels: mockDashboardData.activityByDay.map((d) => d.date),
        datasets: [
          {
            label: "Обращения",
            data: mockDashboardData.activityByDay.map((d) => d.value),
            borderColor: "rgba(96, 165, 250, 0.9)",
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            tension: 0.35,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(75, 85, 99, 0.3)",
            },
            ticks: {
              color: "#9ca3af",
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(31, 41, 55, 0.8)",
            },
            ticks: {
              color: "#9ca3af",
            },
          },
        },
      },
    });
  }

  if (channelsCtx) {
    if (channelsChart) channelsChart.destroy();

    const values = mockDashboardData.channels;
    channelsChart = new Chart(channelsCtx, {
      type: "doughnut",
      data: {
        labels: ["Email", "Чат", "Звонки"],
        datasets: [
          {
            data: [values.email, values.chat, values.call],
            backgroundColor: [
              "rgba(96, 165, 250, 0.9)",
              "rgba(45, 212, 191, 0.9)",
              "rgba(248, 113, 113, 0.9)",
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#9ca3af",
              boxWidth: 12,
            },
          },
        },
      },
    });
  }
}

function initNavigation() {
  const navButtons = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewId = btn.getAttribute("data-view");
      if (!viewId) return;

      navButtons.forEach((b) => b.classList.remove("nav-item--active"));
      btn.classList.add("nav-item--active");

      views.forEach((view) => {
        view.classList.toggle(
          "view--active",
          view.id === `view-${viewId}`,
        );
      });
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initKpis();
  initConversationsTable();
  initCharts();
  initNavigation();
});


// ===== INTERVIEW DATA =====
const interviewQuestions = {
  "software-engineer": {
    beginner: [
      {
        question:
          "Apa perbedaan antara let, const, dan var dalam JavaScript? Berikan contoh penggunaannya.",
        category: "Fundamental",
        time: 120,
        tips: [
          "Jelaskan scope differences (block vs function)",
          "Diskusikan hoisting behavior",
          "Berikan contoh penggunaan praktis",
          "Sebutkan best practices modern",
        ],
      },
    ],
    intermediate: [
      {
        question:
          "Bisakah Anda menjelaskan konsep closure dalam JavaScript dan memberikan contoh praktis dalam pengembangan web modern?",
        category: "Advanced JS",
        time: 180,
        tips: [
          "Definisikan closure sebagai function + lexical environment",
          "Berikan contoh module pattern dan private variables",
          "Jelaskan use cases dalam event handlers",
          "Sebutkan memory considerations",
        ],
      },
      {
        question:
          "Bagaimana Anda akan mengoptimalkan performa website yang mengalami slow loading times?",
        category: "Performance",
        time: 240,
        tips: [
          "Diskusikan frontend optimizations (bundling, lazy loading)",
          "Sebutkan backend improvements (caching, DB queries)",
          "Pertimbangkan CDN dan image optimization",
          "Sebutkan monitoring tools yang digunakan",
        ],
      },
    ],
  },
  "data-scientist": {
    intermediate: [
      {
        question:
          "Jelaskan bias-variance tradeoff dalam machine learning dan bagaimana menanganinya?",
        category: "ML Theory",
        time: 180,
        tips: [
          "Definisikan bias dan variance dengan jelas",
          "Jelaskan tradeoff relationship dan overfitting/underfitting",
          "Sebutkan techniques untuk balance (regularization, cross-validation)",
          "Berikan contoh dalam model evaluation",
        ],
      },
    ],
  },
};

// ===== GLOBAL STATE =====
let currentInterview = {
  role: "software-engineer",
  difficulty: "intermediate",
  duration: 30,
  companyType: "tech",
  currentQuestion: 0,
  totalQuestions: 3,
  timer: null,
  timeRemaining: 30 * 60,
  isRecording: false,
  selectedRating: 0,
};

// ===== INITIALIZATION =====
function initializeApp() {
  initializeEventListeners();
  initializeRoleSelection();
  initializeRecording();
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Feather Icons
  feather.replace();

  // Initialize the application
  initializeApp();
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
  // Start Interview Button
  document
    .getElementById("start-interview")
    .addEventListener("click", startInterview);

  // Practice Mode Button
  document
    .getElementById("practice-mode")
    .addEventListener("click", practiceMode);

  // Recording Controls
  document
    .getElementById("start-recording")
    .addEventListener("click", startRecording);
  document
    .getElementById("stop-recording")
    .addEventListener("click", stopRecording);

  // Answer Controls
  document
    .getElementById("skip-question")
    .addEventListener("click", skipQuestion);
  document
    .getElementById("submit-answer")
    .addEventListener("click", submitAnswer);
  document
    .getElementById("next-question")
    .addEventListener("click", nextQuestion);

  // Settings Changes
  document
    .getElementById("difficulty")
    .addEventListener("change", updateSettings);
  document
    .getElementById("duration")
    .addEventListener("change", updateSettings);
  document
    .getElementById("company-type")
    .addEventListener("change", updateSettings);
}

// ===== ROLE SELECTION =====
function initializeRoleSelection() {
  const roleOptions = document.querySelectorAll(".role-option");

  roleOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remove active class from all options
      roleOptions.forEach((opt) => opt.classList.remove("active"));

      // Add active class to clicked option
      this.classList.add("active");

      // Update current role
      currentInterview.role = this.getAttribute("data-role");

      showToast(
        `Role ${this.querySelector("h4").textContent} dipilih`,
        "success"
      );
    });
  });
}

// ===== INTERVIEW FLOW =====
function startInterview() {
  showLoading("Mempersiapkan sesi interview...");

  setTimeout(() => {
    hideLoading();

    // Hide interview setup
    document.getElementById("interview").style.display = "none";

    // Show live interview
    document.getElementById("live-interview").style.display = "block";

    // Scroll to live interview
    document
      .getElementById("live-interview")
      .scrollIntoView({ behavior: "smooth" });

    // Initialize interview session
    initializeInterviewSession();

    showToast("Sesi interview dimulai! Semoga sukses!", "success");
  }, 2000);
}

function practiceMode() {
  showToast("Mode latihan diaktifkan! Tidak ada scoring.", "warning");
}

function initializeInterviewSession() {
  // Reset state
  currentInterview.currentQuestion = 0;
  currentInterview.timeRemaining = currentInterview.duration * 60;

  // Start timer
  startTimer();

  // Load first question
  loadQuestion();

  // Update progress
  updateProgress();
}

function loadQuestion() {
  const questions =
    interviewQuestions[currentInterview.role]?.[currentInterview.difficulty] ||
    interviewQuestions["software-engineer"]["intermediate"];

  if (questions && questions.length > 0) {
    const currentQ =
      questions[
        Math.min(currentInterview.currentQuestion, questions.length - 1)
      ];

    // Update UI
    document.getElementById("current-question").textContent = currentQ.question;
    document.querySelector(".question-number").textContent = `Pertanyaan ${
      currentInterview.currentQuestion + 1
    }/${currentInterview.totalQuestions}`;
    document.querySelector(".question-category").textContent =
      currentQ.category;

    // Update timer recommendation
    const min = Math.floor(currentQ.time / 60);
    const max = Math.ceil(currentQ.time / 60);
    document.querySelector(
      ".question-timer span"
    ).textContent = `⏰ Rekomendasi: ${min}-${max} menit`;

    // Update tips
    const tipsList = document.getElementById("tips-list");
    tipsList.innerHTML = "";
    currentQ.tips.forEach((tip) => {
      const li = document.createElement("li");
      li.textContent = tip;
      tipsList.appendChild(li);
    });

    // Reset answer area
    document.getElementById("answer-text").value = "";
    document.getElementById("submit-answer").style.display = "flex";
    document.getElementById("next-question").style.display = "none";
  }
}

function skipQuestion() {
  showToast("Pertanyaan dilewati", "warning");
  nextQuestion();
}

function submitAnswer() {
  const answerText = document.getElementById("answer-text").value;

  if (!answerText.trim() && !currentInterview.isRecording) {
    showToast("Silakan berikan jawaban atau rekam suara Anda", "error");
    return;
  }

  showLoading("Menganalisis jawaban Anda...");

  setTimeout(() => {
    hideLoading();
    showToast("Jawaban berhasil disubmit!", "success");

    // Show next question button
    document.getElementById("submit-answer").style.display = "none";
    document.getElementById("next-question").style.display = "flex";

    // Update progress
    updateProgress();
  }, 1500);
}

function nextQuestion() {
  currentInterview.currentQuestion++;

  if (currentInterview.currentQuestion < currentInterview.totalQuestions) {
    loadQuestion();
    showToast(
      `Pertanyaan ${currentInterview.currentQuestion + 1} dimuat`,
      "success"
    );
  } else {
    completeInterview();
  }
}

function completeInterview() {
  showLoading("Menyelesaikan interview dan menganalisis hasil...");

  setTimeout(() => {
    hideLoading();

    // Hide live interview
    document.getElementById("live-interview").style.display = "none";

    // Show results section
    document.getElementById("results").style.display = "block";

    // Scroll to results
    document.getElementById("results").scrollIntoView({ behavior: "smooth" });

    // Animate score results
    animateScoreResults();

    showToast("Interview selesai! Lihat hasil analisis Anda.", "success");
  }, 3000);
}

// ===== TIMER FUNCTIONS =====
function startTimer() {
  // Clear existing timer
  if (currentInterview.timer) {
    clearInterval(currentInterview.timer);
  }

  updateTimerDisplay();

  currentInterview.timer = setInterval(() => {
    currentInterview.timeRemaining--;

    if (currentInterview.timeRemaining <= 0) {
      clearInterval(currentInterview.timer);
      showToast("Waktu interview habis!", "warning");
      completeInterview();
      return;
    }

    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(currentInterview.timeRemaining / 60);
  const seconds = currentInterview.timeRemaining % 60;
  document.getElementById("timer").textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// ===== PROGRESS UPDATES =====
function updateProgress() {
  const progressPercent =
    ((currentInterview.currentQuestion + 1) / currentInterview.totalQuestions) *
    100;

  // Update progress bar
  document.getElementById("progress-fill").style.width = `${progressPercent}%`;

  // Update progress stats
  document.getElementById("questions-count").textContent = `${
    currentInterview.currentQuestion + 1
  }/${currentInterview.totalQuestions} Pertanyaan`;
  document.getElementById("progress-percent").textContent = `${Math.round(
    progressPercent
  )}% Selesai`;
}

// ===== RECORDING FUNCTIONS =====
function initializeRecording() {
  const startRecordingBtn = document.getElementById("start-recording");
  const stopRecordingBtn = document.getElementById("stop-recording");
  const recordingStatus = document.getElementById("recording-status");

  startRecordingBtn.addEventListener("click", function () {
    currentInterview.isRecording = true;

    // Show recording status
    recordingStatus.style.display = "flex";
    startRecordingBtn.style.display = "none";

    showToast("Rekaman dimulai...", "success");
  });

  stopRecordingBtn.addEventListener("click", function () {
    currentInterview.isRecording = false;

    // Hide recording status
    recordingStatus.style.display = "none";
    startRecordingBtn.style.display = "flex";

    showToast("Rekaman dihentikan. Jawaban tersimpan.", "success");
  });
}

function startRecording() {
  currentInterview.isRecording = true;

  // Show recording status
  document.getElementById("recording-status").style.display = "flex";
  document.getElementById("start-recording").style.display = "none";

  showToast("Rekaman dimulai...", "success");
}

function stopRecording() {
  currentInterview.isRecording = false;

  // Hide recording status
  document.getElementById("recording-status").style.display = "none";
  document.getElementById("start-recording").style.display = "flex";

  showToast("Rekaman dihentikan. Jawaban tersimpan.", "success");
}

// ===== RESULTS ANIMATION =====
function animateScoreResults() {
  // Animate overall score
  const scoreElement = document.getElementById("overall-score");
  animateCounter(scoreElement, 0, 7.8, 2000);

  // Animate metric bars with delay
  setTimeout(() => {
    document.getElementById("tech-progress").style.width = "85%";
    document.getElementById("comm-progress").style.width = "75%";
    document.getElementById("problem-progress").style.width = "80%";
    document.getElementById("confidence-progress").style.width = "70%";
  }, 500);
}

function animateCounter(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = start + progress * (end - start);
    element.textContent = value.toFixed(1);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// ===== SETTINGS UPDATE =====
function updateSettings() {
  currentInterview.difficulty = document.getElementById("difficulty").value;
  currentInterview.duration = parseInt(
    document.getElementById("duration").value
  );
  currentInterview.companyType = document.getElementById("company-type").value;
  currentInterview.timeRemaining = currentInterview.duration * 60;
}

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = "success") {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll(".toast");
  existingToasts.forEach((toast) => toast.remove());

  // Create new toast
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function showLoading(message = "Memproses...") {
  // Remove existing loading
  const existingLoading = document.querySelector(".loading-overlay");
  if (existingLoading) existingLoading.remove();

  const loading = document.createElement("div");
  loading.className = "loading-overlay";
  loading.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-message">${message}</div>
    `;

  document.body.appendChild(loading);
}

function hideLoading() {
  const loading = document.querySelector(".loading-overlay");
  if (loading) loading.remove();
}

function toggleStep(element) {
  element.classList.toggle("expanded");
}

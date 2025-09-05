const questions = [
  // E / I 관련 질문 (3개)
  {
    id: 1,
    text: "모르는 사람들과 어울리는 자리에 가면 금방 적응하는 편인가요?",
    yes: "E",
    no: "I",
  },
  {
    id: 2,
    text: "주말에 친구들과 약속을 잡는 것보다 혼자만의 시간을 더 선호하나요?",
    yes: "I",
    no: "E",
  },
  {
    id: 3,
    text: "처음 만나는 사람에게 먼저 말을 거는 편인가요?",
    yes: "E",
    no: "I",
  },

  // S / N 관련 질문 (3개)
  {
    id: 4,
    text: "새로운 일을 시작할 때 세부적인 방법보다 전체적인 방향을 먼저 떠올리나요?",
    yes: "N",
    no: "S",
  },
  {
    id: 5,
    text: "현재 경험하고 있는 구체적인 사실에 집중하는 편인가요?",
    yes: "S",
    no: "N",
  },
  {
    id: 6,
    text: "앞으로 일어날 수 있는 가능성을 상상하는 것을 즐기나요?",
    yes: "N",
    no: "S",
  },

  // T / F 관련 질문 (3개)
  {
    id: 7,
    text: "중요한 결정을 할 때 감정보다 논리를 더 우선시하나요?",
    yes: "T",
    no: "F",
  },
  {
    id: 8,
    text: "다른 사람의 고민을 들으면 그들의 감정을 먼저 공감하나요?",
    yes: "F",
    no: "T",
  },
  {
    id: 9,
    text: "문제를 해결할 때 사람보다는 결과가 더 중요하다고 생각하나요?",
    yes: "T",
    no: "F",
  },

  // J / P 관련 질문 (3개)
  {
    id: 10,
    text: "계획을 세운 뒤 그 계획대로 행동하는 것을 좋아하나요?",
    yes: "J",
    no: "P",
  },
  {
    id: 11,
    text: "여행을 갈 때 즉흥적으로 움직이는 것을 즐기나요?",
    yes: "P",
    no: "J",
  },
  {
    id: 12,
    text: "마감일이 다가오기 전에 미리 일을 끝내두는 편인가요?",
    yes: "J",
    no: "P",
  },
];


// 현재 질문의 인덱스 (0부터 시작)
let currentQuestionIndex = 0;

// 사용자의 답변을 저장할 배열
let answers = [];

// HTML 요소 가져오기
const questionElement = document.getElementById("question");
const questionNumberElement = document.getElementById("question-number");
const yesButton = document.getElementById("yes-button");
const noButton = document.getElementById("no-button");

// 질문 표시 함수
function showQuestion(index) {
  const question = questions[index];
  questionElement.textContent = question.text;
  questionNumberElement.textContent = `질문 ${index + 1}`;
}

// 답변 저장 함수
function saveAnswer(answer) {
  answers.push(answer);
}

// MBTI 결과 계산 함수
function calculateMBTI() {
  const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  answers.forEach((ans) => {
    counts[ans]++;
  });

  const ei = counts["E"] >= counts["I"] ? "E" : "I";
  const sn = counts["S"] >= counts["N"] ? "S" : "N";
  const tf = counts["T"] >= counts["F"] ? "T" : "F";
  const jp = counts["J"] >= counts["P"] ? "J" : "P";

  return ei + sn + tf + jp;
}

// 버튼 클릭 이벤트
yesButton.addEventListener("click", () => {
  saveAnswer(questions[currentQuestionIndex].yes);
  goToNextQuestion();
});

noButton.addEventListener("click", () => {
  saveAnswer(questions[currentQuestionIndex].no);
  goToNextQuestion();
});

// 다음 질문으로 이동하는 함수
function goToNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion(currentQuestionIndex);
  } else {
    // 마지막 질문까지 답변한 경우 → 결과 계산 & 저장 & 페이지 이동
    const result = calculateMBTI();
    console.log("MBTI 결과:", result);

    // 로컬스토리지에 결과 저장
    localStorage.setItem("mbti_result", result);

    // 결과 페이지로 이동
    window.location.href = "result.html";
  }
}

// 첫 번째 질문 표시
showQuestion(currentQuestionIndex);

const registerPage = document.querySelector('.register-page');
const waitingPage = document.querySelector('.waiting-page');
const questionPage = document.querySelector('.question-page');
const answeringPage = document.querySelector('.game-page');
const selectedPage = document.querySelector('.selected-page');
const correctPage = document.querySelector('.answer-page--correct');
const incorrectPage = document.querySelector('.answer-page--incorrect');
const resultPage = document.querySelector('.result-page');

const socket = io('http://10.8.200.119:8787/');

const getLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key));
}

const setLocalStorage = (key, value) => {
  const originalData = getLocalStorage(key);
  
}

const handlePage = (page) => {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('show-page'));
  page.classList.add('show-page');
}

const setUserDisplayOnPages = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userNameField = document.querySelectorAll('.user__name');
  const userIdField = document.querySelectorAll('.user__id');
  userNameField.forEach(elmt => elmt.textContent = user.name);
  userIdField.forEach(elmt => elmt.textContent = user.id);
}

const register = () => {
  const userName = document.querySelector('#user-name-input');
  const userId = document.querySelector('#user-id-input');
  const registerButton = document.querySelector('#register-button');

  const inputEvent = () => {
    if (userName.value !== '' && userId.value !== '') {
      registerButton.disabled = false;
    } else {
      registerButton.disabled = true;
    }
  }

  const registerEvent = () => {
    const user = {
      id: userId.value,
      name: userName.value
    }
    localStorage.setItem('user', JSON.stringify(user));
    setUserDisplayOnPages();
    const socketJoin = socket.emit('client.joinGame', user);
    if (socketJoin.disconnected) {
      alert('失去連線');
      return;
    }
    registerButton.disabled = true;
    document.querySelector('.hollow-dots-spinner').style.display = 'block';
  }

  handlePage(registerPage);
  /** 等待遊戲允許加入 */
  socket.on('client.waitForAllowJoinGame', () => {
    userName.disabled = false;
    userId.disabled = false;
  })
  userName.addEventListener('input', inputEvent);
  userId.addEventListener('input', inputEvent);
  registerButton.addEventListener('click', registerEvent);
}

const waitingForOtherUsers = () => {
  const userName = document.querySelector('.waiting-page__name');
  handlePage(waitingPage);
  userName.textContent = JSON.parse(localStorage.getItem('user')).name;
}

const question = () => {
  handlePage(questionPage);
}

const answering = (data) => {
  const { currentQuestNo, questionCount } = data;
  handlePage(answeringPage);
  showQuestionNumber(currentQuestNo, questionCount);
}

const answerSelected = (index) => {
  let answer = '';
  switch (ans) {
    case 0:
      answer = 'a';
      break;
    case 1:
      answer = 'b';
      break;
    case 2:
      answer = 'c';
      break;
    case 3:
      answer = 'd';
      break;
  }
}

const cardSelected = (cardIndex) => {
  const cardColors = ['rgb(247, 3, 32)', 'rgb(0, 94, 215)', 'rgb(226, 158, 6)', 'rgb(0, 145, 13)'];
  const cardIcons = ['spades', 'hearts', 'clubs', 'diamonds'];
  const card = document.querySelector('.selected-card');
  const cardIcon = document.querySelector('#card-icon');

  card.style.backgroundColor = cardColors[cardIndex];
  cardIcon.setAttribute('src', `assets/img/${cardIcons[cardIndex]}.png`);
  saveAnswer(5, cardIndex);
}

const saveAnswer = (count ,ans) => {
  const user = JSON.parse(localStorage.getItem('user'));
  let answers = new Object();
  if (user.answers) {
    answers = user.answers;
  }
  
  let answer = '';
  switch (ans) {
    case 0:
      answer = 'a';
      break;
    case 1:
      answer = 'b';
      break;
    case 2:
      answer = 'c';
      break;
    case 3:
      answer = 'd';
      break;
  }
  answers[count] = answer;
  user.answers = answers;
  localStorage.setItem('user', JSON.stringify(user));
  /** Client 提交答案 */
  socket.emit('client.submitAnswer', user);
}

const correctAns = () => {
  handlePage(correctPage);
}

const incorrectAns = () => {
  handlePage(incorrectPage);
}

const final = () => {
  handlePage(resultPage);
}

const showQuestionNumber =(current, all) => {
  const questionNo = document.querySelectorAll('.currentQuestNo');
  const questionAll = document.querySelectorAll('.question-count');
  questionNo.forEach(item => item.textContent = current);
  questionAll.forEach(item => item.textContent = all);
}

const showScore = (score) => {
  const scoreField = document.querySelectorAll('.score');
  scoreField.forEach(field => field.textContent = score);
}

const showRank = (rank) => {
  const rankField = document.querySelectorAll('.rank');
  rankField.forEach(field => field.textContent = rank);
}

const app = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    register();
  } else {
    socket.emit('client.connection', user.id);
  }

  /** Client 加入遊戲失敗 */
  socket.on('client.joinGameFail', () => {
    alert('加入失敗');
  })
  /** Client 加入遊戲後，等待遊戲開始 */
  socket.on('client.waitForGameToStart', waitingForOtherUsers);
  /** 遊戲開始後，等待題目顯示 */
  socket.on('client.waitForQuizToShow', question);
  /** 題目顯示後，Client 進入作答介面 */
  socket.on('client.showQuizOptions', data => {
    answering(data);
  });
  /** Client 提交答案後，進入答案等待頁 */
  socket.on('client.waitForQuizAnswer', () => handlePage(selectedPage));
  /** 顯示 Client 的答題結果 */
  socket.on('client.showQuizAnswer', result => {
    if (result === 'correct') {
      correctAns();
    } else {
      incorrectAns();
    }
  });

  // document.querySelector('#waiting-next-page').addEventListener('click', question);
  // document.querySelector('#question-next-page').addEventListener('click', answering);
  // document.querySelector('#correct-btn').addEventListener('click', correctAns);
  // document.querySelector('#incorrect-btn').addEventListener('click', incorrectAns);
  // document.querySelector('#next-btn1').addEventListener('click', question);
  // document.querySelector('#next-btn2').addEventListener('click', question);
}

window.addEventListener('DOMContentLoaded', app);
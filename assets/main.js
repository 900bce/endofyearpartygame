const registerPage = document.querySelector('.register-page');
const waitingPage = document.querySelector('.waiting-page');
const questionPage = document.querySelector('.question-page');
const answeringPage = document.querySelector('.game-page');
const selectedPage = document.querySelector('.selected-page');
const correctPage = document.querySelector('.answer-page--correct');
const incorrectPage = document.querySelector('.answer-page--incorrect');
const resultPage = document.querySelector('.result-page');

const socket = io('http://10.8.200.119:8787/');

let allowAnswer = false;

const storage = {
  get: key => {
    return localStorage.getItem(key);
  },
  set: (key, value) => {
    localStorage.setItem(key, value);
  }
}

const handlePage = (page) => {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('show-page'));
  page.classList.add('show-page');
}

const showScore = (score) => {
  const scoreField = document.querySelectorAll('.score');
  scoreField.forEach(field => field.textContent = score);
}

const showRank = (rank) => {
  const rankField = document.querySelectorAll('.rank');
  rankField.forEach(field => field.textContent = rank);
}

const setUserDisplayOnPages = () => {
  const user = JSON.parse(storage.get('user'));
  const userNameField = document.querySelectorAll('.user__name');
  const userIdField = document.querySelectorAll('.user__id');
  userNameField.forEach(elmt => elmt.textContent = user.name);
  userIdField.forEach(elmt => elmt.textContent = user.id);
}

const showQuestionNumber = (current, all) => {
  const questionNo = document.querySelectorAll('.currentQuestNo');
  const questionAll = document.querySelectorAll('.question-count');
  questionNo.forEach(item => item.textContent = current);
  questionAll.forEach(item => item.textContent = all);
}

const setSelectedCardStyle = (cardIndex) => {
  const cardColors = ['rgb(247, 3, 32)', 'rgb(0, 94, 215)', 'rgb(226, 158, 6)', 'rgb(0, 145, 13)'];
  const cardIcons = ['spades', 'hearts', 'clubs', 'diamonds'];
  const card = document.querySelector('.selected-card');
  const cardIcon = document.querySelector('#card-icon');
  card.style.backgroundColor = cardColors[cardIndex];
  cardIcon.setAttribute('src', `assets/img/${cardIcons[cardIndex]}.png`);
}

const answerSelected = (ans) => {
  if (!allowAnswer || storage.get('currentAnswer')) {
    return;
  }

  const finishAnsweringTime = Date.now();
  let answer = '';
  switch (ans) {
    case 0:
      answer = 'A';
      break;
    case 1:
      answer = 'B';
      break;
    case 2:
      answer = 'C';
      break;
    case 3:
      answer = 'D';
      break;
  }
  const startAnsweringTime = storage.get('startAnsweringTime');
  const speed = finishAnsweringTime - startAnsweringTime;
  const submitData = {
    questNo: storage.get('questNo'),
    playerId: JSON.parse(storage.get('user')).id,
    answer: answer,
    speed: speed
  }
  storage.set('currentAnswer', answer);
  /** Client 提交答案 */
  socket.emit('client.submitAnswer', submitData);
  setSelectedCardStyle(ans);
}

const showQuizAnswer = (data) => {
  if (!storage.get('user')) {
    return;
  }
  const userId = JSON.parse(storage.get('user')).id;
  const userData = data.players.find(player => player.id === userId);
  showScore(userData.score);
  showRank(userData.rank);
  if (data.currentQuestNo === data.questionCount) {
    handlePage(resultPage);
    return;
  }
  if (data.answer === storage.get('currentAnswer')) {
    handlePage(correctPage);
  } else {
    handlePage(incorrectPage);
  }
}

const showQuizOptions = (data) => {
  if (!storage.get('user')) {
    return;
  }

  allowAnswer = true;

  const { currentQuestNo, questionCount } = data;
  handlePage(answeringPage);
  const startAnsweringTime = Date.now();
  storage.set('startAnsweringTime', startAnsweringTime);
  showQuestionNumber(currentQuestNo, questionCount);
  storage.set('questNo', currentQuestNo);
  storage.set('totalQuestNum', questionCount);
  localStorage.removeItem('currentAnswer');
}

const waitingForOtherUsers = () => {
  if (!storage.get('user')) {
    return;
  }
  const userName = document.querySelector('.waiting-page__name');
  handlePage(waitingPage);
  userName.textContent = JSON.parse(storage.get('user')).name;
}

const waitForQuizToShow = () => {
  if (!storage.get('user')) {
    return;
  }
  handlePage(questionPage);
}

const waitForQuizAnswer = () => {
  if (!storage.get('user')) {
    return;
  }
  handlePage(selectedPage)
}

const initialRegisterPage = () => {
  const userNameInputField = document.querySelector('#user-name-input');
  const userIdInputField = document.querySelector('#user-id-input');
  const registerButton = document.querySelector('#register-button');
  const registerForm = document.querySelector('.register-form');
  const waitingConnectionMessage = document.querySelector('#waiting-connection-message');

  const inputEvent = () => {
    registerButton.disabled = userNameInputField.value === '' || userIdInputField.value === '';
  }

  const registerEvent = () => {
    if (!Boolean(storage.get('allowJoinGame'))) {
      return;
    }

    const user = {
      id: userIdInputField.value,
      name: userNameInputField.value
    };
    storage.set('user', JSON.stringify(user));
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
    waitingConnectionMessage.style.display = 'none';
    registerForm.style.display = 'block';
    userNameInputField.disabled = false;
    userIdInputField.disabled = false;
  });
  userNameInputField.addEventListener('input', inputEvent);
  userIdInputField.addEventListener('input', inputEvent);
  registerButton.addEventListener('click', registerEvent);
}

const app = () => {
  const user = JSON.parse(storage.get('user'));
  socket.emit('client.connection', user && user.id || '');
  initialRegisterPage();

  socket.on('client.connection', allowJoinGame => {
    const userNameInputField = document.querySelector('#user-name-input');
    const userIdInputField = document.querySelector('#user-id-input');
    userNameInputField.disabled = !allowJoinGame;
    userIdInputField.disabled = !allowJoinGame;
    storage.set('allowJoinGame', allowJoinGame);
  });

  /** Client 加入遊戲失敗 */
  socket.on('client.joinGameFail', () => alert('加入失敗'));
  /** Client 加入遊戲後，等待遊戲開始 */
  socket.on('client.waitForGameToStart', waitingForOtherUsers);
  /** 遊戲開始後，等待題目顯示 */
  socket.on('client.waitForQuizToShow', waitForQuizToShow);
  /** 題目顯示後，Client 進入作答介面 */
  socket.on('client.showQuizOptions', data => showQuizOptions(data));
  /** Client 提交答案失敗 */
  socket.on('client.submitAnswerFail', () => alert('提交答案失敗'));
  /** Client 提交答案後，進入答案等待頁 */
  socket.on('client.waitForQuizAnswer', waitForQuizAnswer);
  /** 顯示 Client 的答題結果 */
  socket.on('client.showQuizAnswer', recievedData => showQuizAnswer(recievedData));

  socket.on('client.destroy', () => {
    localStorage.clear();
    location.reload();
  });

  socket.on('disconnect', () => {
    location.reload();
  });
}

window.addEventListener('DOMContentLoaded', app);
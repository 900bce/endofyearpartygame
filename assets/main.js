const registerPage = document.querySelector('.register-page');
const waitingPage = document.querySelector('.waiting-page');
const questionPage = document.querySelector('.question-page');
const answeringPage = document.querySelector('.game-page');
const selectedPage = document.querySelector('.selected-page');
const correctPage = document.querySelector('.answer-page--correct');
const incorrectPage = document.querySelector('.answer-page--incorrect');
const resultPage = document.querySelector('.result-page');

const socket = io('http://localhost:8787');

let allowAnswer = false;

const storage = {
  get: key => {
    return localStorage.getItem(key);
  },
  set: (key, value) => {
    localStorage.setItem(key, value);
  },
  remove: key => localStorage.removeItem(key)
}

const handlePage = page => {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('show-page'));
  page.classList.add('show-page');
  const currentPage = setCurrentPage(page);
  storage.set('currentPage', currentPage);
}

const setCurrentPage = page => {
  switch (page) {
    case registerPage:
      return 'registerPage';
    case waitingPage:
      return 'waitingPage';
    case questionPage:
      return 'questionPage';
    case answeringPage:
      return 'answeringPage';
    case selectedPage:
      return 'selectedPage';
    case correctPage:
      return 'correctPage';
    case incorrectPage:
      return 'incorrectPage';
    case resultPage:
      return 'resultPage';
    default:
      return;
  }
}

const showScore = score => {
  const scoreField = document.querySelectorAll('.score');
  scoreField.forEach(field => field.textContent = score);
}

const showRank = rank => {
  const rankField = document.querySelectorAll('.rank');
  rankField.forEach(field => field.textContent = rank);
}

const showPlayerInfo = () => {
  const user = JSON.parse(storage.get('user'));
  const userNameField = document.querySelectorAll('.user__name');
  const userIdField = document.querySelectorAll('.user__id');
  const userName = document.querySelector('.waiting-page__name');
  userName.textContent = user.name;
  userNameField.forEach(elmt => elmt.textContent = user.name);
  userIdField.forEach(elmt => elmt.textContent = user.id);
}

const showQuestionNumber = (current, all) => {
  const questionNo = document.querySelectorAll('.currentQuestNo');
  const questionAll = document.querySelectorAll('.question-count');
  questionNo.forEach(item => item.textContent = current);
  questionAll.forEach(item => item.textContent = all);
}

/** 答題後答案卡的樣式 */
const setSelectedCardStyle = cardIndex => {
  const cardColors = ['rgb(247, 3, 32)', 'rgb(0, 94, 215)', 'rgb(226, 158, 6)', 'rgb(0, 145, 13)'];
  const cardIcons = ['spades', 'hearts', 'clubs', 'diamonds'];
  const card = document.querySelector('.selected-card');
  const cardIcon = document.querySelector('#card-icon');
  let index;
  switch(cardIndex) {
    case 'A':
      index = 0;
      break;
    case 'B':
      index = 1;
      break;
    case 'C':
      index = 2;
      break;
    case 'D':
      index = 3;
      break;
    default: 
      return;
  }
  card.style.backgroundColor = cardColors[index];
  cardIcon.setAttribute('src', `assets/img/${cardIcons[index]}.png`);
}

const answerSelected = ans => {
  if (!allowAnswer || storage.get('currentAnswer')) {
    alert('目前無法進行作答');
    return;
  }
  const finishAnsweringTime = Date.now();
  const startAnsweringTime = storage.get('startAnsweringTime');
  let speed = finishAnsweringTime - startAnsweringTime;
  if (speed > 15000) {
    speed = 15000;
  }
  const submitData = {
    questNo: storage.get('currentQuestNo'),
    playerId: JSON.parse(storage.get('user')).id,
    answer: ans,
    speed: speed
  }
  storage.set('currentAnswer', ans);
  /** Client 提交答案 */
  socket.emit('client.submitAnswer', submitData);
  setSelectedCardStyle(ans);
}

const showQuizAnswer = data => {
  if (!storage.get('user')) {
    return;
  }
  const userId = JSON.parse(storage.get('user')).id;
  const userData = data.players.find(player => player.id === userId);
  showScore(userData.score);
  showRank(userData.rank);
  storage.set('currentScore', userData.score);
  storage.set('currentRank', userData.rank);
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

const showQuizOptions = data => {
  if (!storage.get('user')) {
    return;
  }
  allowAnswer = true;

  const { currentQuestNo, questionCount } = data;
  const startAnsweringTime = Date.now();
  handlePage(answeringPage);
  showQuestionNumber(currentQuestNo, questionCount);
  storage.set('startAnsweringTime', startAnsweringTime);
  storage.set('currentQuestNo', currentQuestNo);
  storage.set('totalQuestNum', questionCount);
  storage.remove('currentAnswer');
}

const waitingForOtherUsers = () => {
  if (!storage.get('user')) {
    return;
  }
  handlePage(waitingPage);
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
  handlePage(selectedPage);
}

const showJoinForm = allowJoin => {
  const userNameInputField = document.querySelector('#user-name-input');
  const userIdInputField = document.querySelector('#user-id-input');
  userNameInputField.disabled = !allowJoin;
  userIdInputField.disabled = !allowJoin;
  storage.set('allowJoinGame', allowJoin);

  const registerForm = document.querySelector('.register-form');
  const waitingConnectionMessage = document.querySelector('#waiting-connection-message');
  waitingConnectionMessage.style.display = allowJoin ? 'none' : 'block';
  registerForm.style.display = allowJoin ? 'block' : 'none';
}

const renderRegisterPage = () => {
  const userNameInputField = document.querySelector('#user-name-input');
  const userIdInputField = document.querySelector('#user-id-input');
  const registerButton = document.querySelector('#register-button');

  const inputEvent = () => {
    registerButton.disabled = userNameInputField.value === '' || userIdInputField.value === '';
  }

  const registerEvent = () => {
    if (!JSON.parse(storage.get('allowJoinGame'))) {
      return;
    }

    const user = {
      id: userIdInputField.value,
      name: userNameInputField.value
    };
    const socketJoin = socket.emit('client.joinGame', user);
    if (socketJoin.disconnected) {
      alert('失去連線');
      return;
    }
    storage.set('user', JSON.stringify(user));
    showPlayerInfo();
    registerButton.disabled = true;
    document.querySelector('.hollow-dots-spinner').style.display = 'block';
  }

  handlePage(registerPage);
  userNameInputField.addEventListener('input', inputEvent);
  userIdInputField.addEventListener('input', inputEvent);
  registerButton.addEventListener('click', registerEvent);
}

const getLastStatusPage = () => {
  const lastStatus = storage.get('currentPage');
  switch(lastStatus) {
    case 'waitingPage': 
      return waitingPage;
    case 'questionPage': 
      return questionPage;
    case 'answeringPage': 
      return answeringPage;
    case 'selectedPage': 
      return selectedPage;
    case 'correctPage': 
      return correctPage;
    case 'incorrectPage': 
      return incorrectPage;
    case 'resultPage': 
      return resultPage;
    default:
      return registerPage;
  }
}

const returnToLastStatus = () => {
  if (!storage.get('currentPage')) {
    localStorage.clear();
    location.reload();
  }
  showPlayerInfo();
  showScore(storage.get('currentScore'));
  showRank(storage.get('currentRank'));
  showQuestionNumber(storage.get('currentQuestNo'), storage.get('totalQuestNum'));
  setSelectedCardStyle(storage.get('currentAnswer'));
  handlePage(getLastStatusPage());
}

const app = () => {
  const user = JSON.parse(storage.get('user'));
  /** 當 storage 中存在 user 資料時，自 storage 中回復先前遊戲資料 */
  if (!user) {
    renderRegisterPage();
  } else {
    returnToLastStatus();
  }

  /** 建立連線，向server發送user id */
  socket.on('connect', () => {
    socket.emit('client.connection', user && user.id || '');
  });
  /** 當連線建立時， */
  socket.on('client.connection', allowJoin => showJoinForm(allowJoin));
  /** 等待遊戲允許加入 */
  socket.on('client.waitForAllowJoinGame', () => showJoinForm(true));
  /** Client 加入遊戲失敗 */
  socket.on('client.joinGameFail', () => {
    alert(`員工編號 ${document.querySelector('#user-id-input').value} 已存在，請重新輸入`);
    localStorage.clear();
    location.reload();
  });
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
  /** 當server reload */
  socket.on('client.destroy', () => {
    localStorage.clear();
    location.reload();
  });
  socket.on('disconnect', () => {
    location.reload();
  });
}

window.addEventListener('DOMContentLoaded', app);
const ioUrl = 'http://210.63.38.218:18088';
// const ioUrl = 'http://localhost:8787';
// const ioUrl = 'http://10.8.200.119:8787';

let socket;
let allowAnswer = false;

const storage = {
  get: key => {
    return localStorage.getItem(key);
  },
  set: (key, value) => {
    localStorage.setItem(key, value);
  },
  remove: key => localStorage.removeItem(key),
  clear: () => {
    localStorage.clear();
    location.reload();
  }
}

const handlePageDOM = page => {
  return document.querySelector(`.${page}`);
}

const handlePageToShow = page => {
  if (!handlePageDOM(page)) {
    storage.set('currentPage', 'register-page');
    location.reload();
  }
  handlePageDOM(page).classList.add('show-page');
  storage.set('currentPage', page);
}

const handlePageSwitch = page => {
  if (!storage.get('user') && page !== 'register-page') {
    return;
  }
  const allPages = document.querySelectorAll('.page');
  allPages.forEach(page => page.classList.remove('show-page'));
  handlePageToShow(page);
}

const showScore = (score, rank) => {
  const scoreField = document.querySelectorAll('.score');
  const rankField = document.querySelectorAll('.rank');
  rankField.forEach(field => field.textContent = rank);
  scoreField.forEach(field => field.textContent = score);
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

/** 答題後答案卡片的樣式 */
const setSelectedCardStyle = cardIndex => {
  const cardColors = ['rgb(247, 3, 32)', 'rgb(0, 94, 215)', 'rgb(226, 158, 6)', 'rgb(0, 145, 13)'];
  const cardIcons = ['spades', 'hearts', 'clubs', 'diamonds'];
  const card = document.querySelector('.selected-card');
  const cardIcon = document.querySelector('#card-icon');
  let index;
  switch (cardIndex) {
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
  storage.set('currentAnswer', ans);
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
  /** Client 提交答案 */
  const submitAns = socket.emit('client.submitAnswer', submitData);
  if (submitAns.disconnected) {
    alert('失去連線');
    return;
  }
  setSelectedCardStyle(ans);
  handlePageSwitch('selected-page');
}

const showQuizAnswer = data => {
  if (!storage.get('user')) {
    return;
  }
  const userId = JSON.parse(storage.get('user')).id;
  const userData = data.players.find(player => player.id === userId);
  showScore(userData.score, userData.rank);
  storage.set('currentScore', userData.score);
  storage.set('currentRank', userData.rank);
  if (data.currentQuestNo === data.questionCount) {
    handlePageSwitch('result-page');
    return;
  }
  if (data.answer === storage.get('currentAnswer')) {
    handlePageSwitch('answer-page--correct');
  } else {
    handlePageSwitch('answer-page--incorrect');
  }
}

const showQuizOptions = data => {
  if (!storage.get('user')) {
    return;
  }

  allowAnswer = true;

  const { currentQuestNo, questionCount } = data;
  const startAnsweringTime = Date.now();
  handlePageSwitch('game-page');
  showQuestionNumber(currentQuestNo, questionCount);
  storage.set('startAnsweringTime', startAnsweringTime);
  storage.set('currentQuestNo', currentQuestNo);
  storage.set('totalQuestNum', questionCount);
  storage.remove('currentAnswer');
}

// const showJoinForm = () => {
//   const userNameInputField = document.querySelector('#user-name-input');
//   const userIdInputField = document.querySelector('#user-id-input');
//   userNameInputField.disabled = !allowJoin;
//   userIdInputField.disabled = !allowJoin;
//   storage.set('allowJoinGame', allowJoin);

//   const registerForm = document.querySelector('.register-form');
//   const waitingConnectionMessage = document.querySelector('#waiting-connection-message');
//   waitingConnectionMessage.style.display = allowJoin ? 'none' : 'block';
//   registerForm.style.display = allowJoin ? 'block' : 'none';
// }

const renderRegisterPage = () => {
  const userNameInputField = document.querySelector('#user-name-input');
  const userIdInputField = document.querySelector('#user-id-input');
  const registerButton = document.querySelector('#register-button');

  const inputEvent = () => {
    registerButton.disabled = userNameInputField.value === '' || userIdInputField.value === '';
  }

  const registerEvent = () => {
    // if (!JSON.parse(storage.get('allowJoinGame'))) {
    //   return;
    // }
    const user = {
      id: userIdInputField.value,
      name: userNameInputField.value
    };
    joinGame(user)
      .then(() => {
        showPlayerInfo();
        handlePageSwitch('waiting-page');
      })
      .catch(err => alert('失去連線'));
  }

  handlePageSwitch('register-page');
  userNameInputField.addEventListener('input', inputEvent);
  userIdInputField.addEventListener('input', inputEvent);
  registerButton.addEventListener('click', registerEvent);
}

const joinGame = user => (
  new Promise((resolve, reject) => {
    join(user);
    const connectionTimeout = setTimeout(reject, 10000);
    socket.on('client.joinGameFail', () => {
      clearTimeout(connectionTimeout);
      reject();
    });
    socket.on('client.waitForGameToStart', () => {
      clearTimeout(connectionTimeout);
      resolve();
    });
  })
)

// 最多重試次數
let count = 0;
const limit = 5;

const join = (user) => {
  count += 1;

  if (count > limit) {
    return;
  }

  storage.set('user', JSON.stringify(user));
  const socketJoin = socket.emit('client.joinGame', user);

  if (socketJoin.connected) {
    return;
  }

  socket.open();
  join(user);
}


const returnToLastStatus = () => {
  if (!storage.get('currentPage')) {
    storage.set('currentPage', 'register-page');
    location.reload();
  }
  showPlayerInfo();
  showScore(storage.get('currentScore'), storage.get('currentRank'));
  showQuestionNumber(storage.get('currentQuestNo'), storage.get('totalQuestNum'));
  setSelectedCardStyle(storage.get('currentAnswer'));
  handlePageSwitch(storage.get('currentPage'));
}

const app = () => {

  try {
    socket = io(ioUrl, { reconnectionAttempts: 3 });
  } catch (exception) {
    const registerForm = document.querySelector('.register-form');
    const waitingConnectionMessage = document.querySelector('#waiting-connection-message');
    waitingConnectionMessage.style.display = 'block';
    registerForm.style.display = 'none';
    document.querySelector(
      '.register-bottom__notice'
    ).innerHTML = `連線失敗<br>
      <button 
        onclick="location.reload()" 
        style="padding: .3rem .5rem; 
          font-size: 1.2rem;
          border-radius: 5px;
          border: none;" >
        重新連線
      </button>`;
    handlePageSwitch('register-page');
  }

  /** 當 storage 中存在 user 資料時，取出 storage 中先前遊戲資料以回復 */
  const user = JSON.parse(storage.get('user'));
  if (!user) {
    renderRegisterPage();
  } else {
    const registerForm = document.querySelector('.register-form');
    const waitingConnectionMessage = document.querySelector('#waiting-connection-message');
    waitingConnectionMessage.style.display = 'block';
    registerForm.style.display = 'none';
    document.querySelector('.register-bottom__notice').innerHTML = `
    <button 
      onclick="storage.clear()" 
      style="padding: .3rem .7rem; 
        font-size: 1.2rem;
        border-radius: 5px;
        border: none;" >
      重新連線
    </button>`;
    returnToLastStatus();
  }

  /** 建立連線，向server發送user id */
  socket.on('connect', () => {
    const socketConnection = socket.emit('client.connection', user && user.id || '');
    if (socketConnection.connected) {
      return;
    }
    alert('連線失敗');
  });

  socket.on('reconnect_attempt', attemptNumber => {
    const registerForm = document.querySelector('.register-form');
    const waitingConnectionMessage = document.querySelector('#waiting-connection-message');
    waitingConnectionMessage.style.display = 'block';
    registerForm.style.display = 'none';
    document.querySelector(
      '.register-bottom__notice'
    ).innerHTML = `連線中斷，正在嘗試重新連線 ${attemptNumber}`;
    handlePageSwitch('register-page');
  });

  socket.on('reconnect_failed', () => {
    const registerForm = document.querySelector('.register-form');
    const waitingConnectionMessage = document.querySelector('#waiting-connection-message');
    waitingConnectionMessage.style.display = 'block';
    registerForm.style.display = 'none';
    document.querySelector(
      '.register-bottom__notice'
    ).innerHTML = `連線失敗<br>
      <button 
        onclick="location.reload()" 
        style="padding: .3rem .5rem; 
          font-size: 1.2rem;
          border-radius: 5px;
          border: none;" >
        重新連線
      </button>`;
    handlePageSwitch('register-page');
  })

  /** 當連線建立時， */
  // socket.on('client.connection', () => showJoinForm());
  /** 等待遊戲允許加入 */
  // socket.on('client.waitForAllowJoinGame', () => showJoinForm(true));
  /** Client 加入遊戲失敗 */
  socket.on('client.joinGameFail', () => {
    alert(`員工編號 ${document.querySelector('#user-id-input').value} 已存在，請重新輸入`);
    storage.clear();
  });
  /** 遊戲開始後，等待題目顯示 */
  socket.on('client.waitForQuizToShow', () => handlePageSwitch('question-page'));
  /** 題目顯示後，Client 進入作答介面 */
  socket.on('client.showQuizOptions', data => showQuizOptions(data));
  /** Client 提交答案失敗 */
  socket.on('client.submitAnswerFail', () => alert('提交答案失敗'));
  /** 顯示 Client 的答題結果 */
  socket.on('client.showQuizAnswer', recievedData => showQuizAnswer(recievedData));
  /** 當server reload */
  socket.on('client.destroy', () => {
    storage.clear();
  });
  socket.on('disconnect', () => {
    location.reload();
  });
}

window.addEventListener('DOMContentLoaded', app);
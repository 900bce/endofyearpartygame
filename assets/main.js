const loginPage = document.querySelector('.login-page');
const waitingPage = document.querySelector('.waiting-page');
const questionPage = document.querySelector('.question-page');
const answeringPage = document.querySelector('.game-page');
const selectedPage = document.querySelector('.selected-page');
const correctPage = document.querySelector('.answer-page--correct');
const incorrectPage = document.querySelector('.answer-page--incorrect');

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

const login = () => {
  const userName = document.querySelector('#user-name-input');
  const userId = document.querySelector('#user-id-input');
  const loginButton = document.querySelector('#login-button');

  const inputEvent = () => {
    if (userName.value !== '' && userId.value !== '') {
      loginButton.disabled = false;
    } else {
      loginButton.disabled = true;
    }
  }

  const loginEvent = () => {
    const user = {
      name: userName.value,
      id: userId.value
    }
    localStorage.setItem('user', JSON.stringify(user));
    setUserDisplayOnPages();
    waiting();
  }

  handlePage(loginPage);
  userName.addEventListener('input', inputEvent);
  userId.addEventListener('input', inputEvent);
  loginButton.addEventListener('click', loginEvent);
}

const waiting = () => {
  const userName = document.querySelector('.waiting-page__name');

  handlePage(waitingPage);
  userName.textContent = JSON.parse(localStorage.getItem('user')).name;
}

const question = () => {
  handlePage(questionPage);
}

const answering = () => {
  handlePage(answeringPage);
  game();
}

const game = () => {
  const gameCard = document.querySelectorAll('.game-card');
  gameCard.forEach((card, index) => {
    card.addEventListener('click', () => {
      cardSelected(index);
    })
  })
}

const cardSelected = (cardIndex) => {
  const cardColors = ['rgb(247, 3, 32)', 'rgb(0, 94, 215)', 'rgb(226, 158, 6)', 'rgb(0, 145, 13)'];
  const cardIcons = ['spades', 'hearts', 'clubs', 'diamonds'];
  const card = document.querySelector('.selected-card');
  const cardIcon = document.querySelector('#card-icon');

  handlePage(selectedPage);
  card.style.backgroundColor = cardColors[cardIndex];
  cardIcon.setAttribute('src', `assets/img/${cardIcons[cardIndex]}.png`);
  saveAnswer(2, cardIndex);
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
}

const correctAns = () => {
  handlePage(correctPage);
}

const incorrectAns = () => {
  handlePage(incorrectPage);
}

const app = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    login();
  } else {
    login();
  }

  document.querySelector('#waiting-next-page').addEventListener('click', question);
  document.querySelector('#question-next-page').addEventListener('click', answering);
  document.querySelector('#correct-btn').addEventListener('click', correctAns);
  document.querySelector('#incorrect-btn').addEventListener('click', incorrectAns);
  document.querySelector('#next-btn1').addEventListener('click', question);
  document.querySelector('#next-btn2').addEventListener('click', question);
}

window.addEventListener('DOMContentLoaded', app);
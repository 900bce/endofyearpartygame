const appInitial = () => {
  const loginPage = document.querySelector('.login-page');
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

  const login = () => {
    const user = {
      name: userName.value,
      id: userId.value
    }
    localStorage.setItem('user', JSON.stringify(user));
    setUserDisplayOnPages(user.name, user.id);
    loginPage.classList.remove('show-page');
    waiting();
  }

  loginPage.classList.add('show-page');
  userName.addEventListener('input', inputEvent);
  userId.addEventListener('input', inputEvent);
  loginButton.addEventListener('click', login);
}

const setUserDisplayOnPages = (name, id) => {
  const userName = document.querySelectorAll('.user__name');
  const userId = document.querySelectorAll('.user__id');
  userName.forEach(elmt => elmt.textContent = name);
  userId.forEach(elmt => elmt.textContent = id);
}

const waiting = () => {
  const waitingPage = document.querySelector('.waiting-page');
  const userName = document.querySelector('.waiting-page__name');
  waitingPage.classList.add('show-page');
  userName.textContent = JSON.parse(localStorage.getItem('user')).name;

  const nextStep = document.querySelector('#waiting-next-page');
  nextStep.addEventListener('click', () => {
    waitingPage.classList.remove('show-page');
    question();
  })
}

const question = () => {
  const questionPage = document.querySelector('.question-page');
  questionPage.classList.add('show-page');

  const nextStep = document.querySelector('#question-next-page');
  nextStep.addEventListener('click', () => {
    questionPage.classList.remove('show-page');
    gameDisplay();
  });
}

const gameDisplay = () => {
  const gamePage = document.querySelector('.game-page');
  gamePage.classList.add('show-page');
  game();
}

const game = () => {
  const gameCard = document.querySelectorAll('.game-card');
  gameCard.forEach((card, index) => {
    card.addEventListener('click', () => {
      console.log(index);
    })
  })
}


window.addEventListener('DOMContentLoaded', appInitial);
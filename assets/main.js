const user = {
  name: '',
  id: ''
};

const appInitial = () => {
  const loginPage = document.querySelector('.login-page');
  const userName = document.querySelector('#user-name');
  const userId = document.querySelector('#user-id');
  const loginButton = document.querySelector('#login-button');

  const inputEvent = () => {
    if (userName.value !== '' && userId.value !== '') {
      loginButton.disabled = false;
    } else {
      loginButton.disabled = true;
    }
  }

  const login = () => {
    user.name = userName.value;
    user.id = userId.value;
    console.log(user);
  }

  loginPage.classList.add('show-page');
  userName.addEventListener('input', inputEvent);
  userId.addEventListener('input', inputEvent);
  loginButton.addEventListener('click', login);
}

window.addEventListener('DOMContentLoaded', appInitial);
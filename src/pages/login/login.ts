import HttpClient from '../../data/httpClient.js';
import { updateNavigation } from '../../scripts/dom.js';
import { User } from '../../models/user.js';

const form = document.querySelector<HTMLFormElement>('#login-form')!;
const registerLink = document.querySelector<HTMLAnchorElement>('#register-link')!;
const messageElement = document.querySelector<HTMLElement>('#login-message')!;

const initApp = async () => {
  updateNavigation();

  const user = getLoggedInUser();

  if (user) {
    location.href = getRedirectUrl();
    return;
  }

  registerLink.href = `../register/register.html?redirect=${encodeURIComponent(getRedirectUrl())}`;
};

const getLoggedInUser = (): User | undefined => {
  const savedUser = localStorage.getItem('westcoast-user');

  if (!savedUser) {
    return;
  }

  return JSON.parse(savedUser) as User;
};

const getRedirectUrl = () => {
  const redirectUrl = new URLSearchParams(location.search).get('redirect');
  return redirectUrl || '../courses/courses.html';
};

const handleSubmit = async (event: SubmitEvent) => {
  event.preventDefault();

  const formData = new FormData(form);
  const email = formData.get('email')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  const users = await new HttpClient<User[]>('users').listAll();
  const user = users.find((currentUser) =>
    currentUser.email === email && currentUser.password === password
  );

  if (!user) {
    displayMessage('Wrong email or password.', 'error');
    return;
  }

  localStorage.setItem('westcoast-user', JSON.stringify(user));
  displayMessage('Login successful. Redirecting...', 'success');

  setTimeout(() => {
    location.href = getRedirectUrl();
  }, 600);
};

const displayMessage = (message: string, type: string) => {
  messageElement.innerHTML = `
    <p class="auth-message auth-message--${type}">${message}</p>
  `;
};

document.addEventListener('DOMContentLoaded', initApp);
form.addEventListener('submit', handleSubmit);

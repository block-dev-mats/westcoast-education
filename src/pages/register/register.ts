import HttpClient from '../../data/httpClient.js';
import { updateNavigation } from '../../scripts/dom.js';
import { User } from '../../models/user.js';
import { validateRegisterForm } from './registerValidation.js';

const form = document.querySelector<HTMLFormElement>('#register-form')!;
const loginLink = document.querySelector<HTMLAnchorElement>('#login-link')!;
const messageElement = document.querySelector<HTMLElement>('#register-message')!;

const initApp = async () => {
  updateNavigation();

  const user = getLoggedInUser();

  if (user) {
    location.href = getRedirectUrl();
    return;
  }

  loginLink.href = `../login/login.html?redirect=${encodeURIComponent(getRedirectUrl())}`;
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
  const name = formData.get('name')?.toString() || '';
  const billingAddress = formData.get('billingAddress')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const phone = formData.get('phone')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  const validationError = validateRegisterForm({
    name,
    billingAddress,
    email,
    phone,
    password
  });

  if (validationError) {
    displayMessage(validationError, 'error');
    return;
  }

  const users = await new HttpClient<User[]>('users').listAll();
  const existingUser = users.find((currentUser) => currentUser.email === email);

  if (existingUser) {
    displayMessage('A user with that email already exists.', 'error');
    return;
  }

  const newUser: User = {
    name: name.trim(),
    billingAddress: billingAddress.trim(),
    email: email.trim(),
    phone: phone.trim(),
    password: password.trim()
  };

  const savedUser = await new HttpClient<User>('users').add(newUser);
  localStorage.setItem('westcoast-user', JSON.stringify(savedUser));
  displayMessage('Account created. Redirecting...', 'success');

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

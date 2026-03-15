export const createPageTitle = (text: string) => {
  const heading = document.createElement('h1');
  heading.textContent = text;
  heading.classList.add('page-title');
  return heading;
};

export const getAppElement = () => {
  return document.querySelector('#app');
};

export const renderIntro = (title: string, text: string) => {
  const app = getAppElement();

  if (!app) {
    return;
  }

  app.innerHTML = `
    <section class="hero">
      <h1 class="page-title">${title}</h1>
      <p class="page-text">${text}</p>
    </section>
  `;
};

export const createCourseCard = (content: string) => {
  const article = document.createElement('article');
  article.classList.add('course-card', 'surface');
  article.innerHTML = content;
  return article;
};

export const formatStudyMode = (studyMode: string[]) => {
  return studyMode.map((mode) => {
    if (mode === 'classroom') {
      return 'Classroom';
    }

    return 'Distance';
  }).join(' / ');
};

export const updateNavigation = () => {
  const savedUser = localStorage.getItem('westcoast-user');
  const registerLink = document.querySelector('a[href$="register/register.html"], a[href$="./register.html"]');
  const loginLink = document.querySelector('a[href$="login/login.html"], a[href$="./login.html"]') as HTMLAnchorElement | null;

  if (!savedUser) {
    return;
  }

  registerLink?.remove();

  if (!loginLink) {
    return;
  }

  loginLink.textContent = 'Logout';
  loginLink.href = '#';

  loginLink.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('westcoast-user');
    location.reload();
  });
};

import HttpClient from '../../data/httpClient.js';
import { createCourseCard, formatStudyMode, updateNavigation } from '../../scripts/dom.js';
import { Course } from '../../models/course.js';

const coursesGrid = document.querySelector('#courses-grid') as HTMLElement;
const coursesStatus = document.querySelector('#courses-status') as HTMLElement;
const coursesText = document.querySelector('#courses-text') as HTMLElement;

const initApp = async () => {
  updateNavigation();
  displayLoading();

  try {
    const courses = await loadCourses();
    displayCourses(courses);
  } catch (error) {
    displayError();
  }
};

const loadCourses = async (): Promise<Course[]> => {
  return await new HttpClient<Course[]>('courses').listAll();
};

const displayCourses = (courses: Course[]) => {
  coursesStatus.innerHTML = '';
  coursesText.textContent = 'Browse our current IT courses. Each course card leads to a details page where you can read more and book the course.';
  coursesGrid.innerHTML = '';

  courses.forEach((course) => {
    coursesGrid.appendChild(createCourseDisplay(course));
  });
};

const displayLoading = () => {
  coursesGrid.innerHTML = '';
  coursesText.textContent = 'Loading courses from the local API...';
  coursesStatus.innerHTML = `
    <div class="spinner">
      <span class="loader"></span>
    </div>
  `;
};

const createCourseDisplay = (course: Course) => {
  return createCourseCard(`
    <img
      class="course-card__image"
      src="./${course.image}"
      alt="${course.title}"
    />
    <div class="course-card__content">
      <div class="course-card__header">
        <p class="course-card__number">${course.courseNumber}</p>
        <h2>${course.title}</h2>
      </div>
      <p class="course-card__description">${course.description}</p>
      <div class="course-card__meta">
        <div>
          <span>Days</span>
          <strong>${course.days}</strong>
        </div>
        <div>
          <span>Study mode</span>
          <strong>${formatStudyMode(course.studyMode)}</strong>
        </div>
        <div>
          <span>Start date</span>
          <strong>${new Date(course.startDate).toLocaleDateString('sv-SE')}</strong>
        </div>
        <div>
          <span>Price</span>
          <strong>${course.price} kr</strong>
        </div>
      </div>
      <a class="course-card__link btn" href="../course/course-details.html?id=${course.id}">
        View course
      </a>
    </div>
  `);
};

const displayError = () => {
  coursesGrid.innerHTML = '';
  coursesStatus.innerHTML = '';
  coursesText.textContent = 'Could not load courses from the local API. Start json-server and try again.';
};

document.addEventListener('DOMContentLoaded', initApp);

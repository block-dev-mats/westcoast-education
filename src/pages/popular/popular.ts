import HttpClient from '../../data/httpClient.js';
import { Booking } from '../../models/booking.js';
import { createCourseCard, formatStudyMode, updateNavigation } from '../../scripts/dom.js';
import { Course } from '../../models/course.js';

const popularGrid = document.querySelector('#popular-grid') as HTMLElement;
const popularStatus = document.querySelector('#popular-status') as HTMLElement;
const popularText = document.querySelector('#popular-text') as HTMLElement;

const initApp = async () => {
  updateNavigation();
  displayLoading();

  try {
    const courses = await loadCourses();
    const bookings = await loadBookings();
    displayPopularCourses(getPopularCourses(courses, bookings));
  } catch (error) {
    displayError();
  }
};

const loadCourses = async (): Promise<Course[]> => {
  return await new HttpClient<Course[]>('courses').listAll();
};

const loadBookings = async (): Promise<Booking[]> => {
  return await new HttpClient<Booking[]>('bookings').listAll();
};

const getPopularCourses = (courses: Course[], bookings: Booking[]) => {
  return courses
    .map((course) => {
      const bookingCount = bookings.filter((booking) => booking.courseId === course.id).length;

      return {
        course,
        bookingCount
      };
    })
    .filter((item) => item.bookingCount > 0)
    .sort((firstItem, secondItem) => secondItem.bookingCount - firstItem.bookingCount);
};

const displayPopularCourses = (items: { course: Course; bookingCount: number }[]) => {
  popularStatus.innerHTML = '';
  popularText.textContent = 'A smaller selection of courses that are popular right now.';
  popularGrid.innerHTML = '';

  if (!items.length) {
    popularGrid.innerHTML = `
      <p class="popular-empty surface">There are no popular courses to show right now.</p>
    `;
    return;
  }

  items.forEach((item) => {
    popularGrid.appendChild(createPopularCourseDisplay(item.course, item.bookingCount));
  });
};

const displayLoading = () => {
  popularGrid.innerHTML = '';
  popularText.textContent = 'Loading popular courses from the local API...';
  popularStatus.innerHTML = `
    <div class="spinner">
      <span class="loader"></span>
    </div>
  `;
};

const createPopularCourseDisplay = (course: Course, bookingCount: number) => {
  return createCourseCard(`
    <div class="course-card__badge">${bookingCount} booked</div>
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
  popularGrid.innerHTML = '';
  popularStatus.innerHTML = '';
  popularText.textContent = 'Could not load popular courses from the local API.';
};

document.addEventListener('DOMContentLoaded', initApp);

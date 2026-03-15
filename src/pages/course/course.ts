import HttpClient from '../../data/httpClient.js';
import { formatStudyMode, updateNavigation } from '../../scripts/dom.js';
import { Booking } from '../../models/booking.js';
import { Course } from '../../models/course.js';
import { User } from '../../models/user.js';

const courseStatus = document.querySelector('#course-status') as HTMLElement;
const courseDetails = document.querySelector('#course-details') as HTMLElement;
const courseImage = document.querySelector('#course-image') as HTMLImageElement;
const courseNumber = document.querySelector('#course-number') as HTMLElement;
const courseTitle = document.querySelector('#course-title') as HTMLElement;
const courseDescription = document.querySelector('#course-description') as HTMLElement;
const courseDays = document.querySelector('#course-days') as HTMLElement;
const courseStudyMode = document.querySelector('#course-study-mode') as HTMLElement;
const courseStartDate = document.querySelector('#course-start-date') as HTMLElement;
const coursePrice = document.querySelector('#course-price') as HTMLElement;
const bookingForm = document.querySelector('#course-booking-form') as HTMLFormElement;
const bookingClassroom = document.querySelector('#booking-classroom') as HTMLInputElement;
const bookingDistance = document.querySelector('#booking-distance') as HTMLInputElement;

const initApp = async () => {
  updateNavigation();
  displayLoading();

  try {
    const courseId = location.search.split('=')[1];
    const course = await loadCourse(courseId);

    displayCourse(course);
  } catch (error) {
    displayError();
  }
};

const loadCourse = async (id: number | string): Promise<Course> => {
  return await new HttpClient<Course>('courses').find(id);
};

const displayCourse = (course: Course) => {
  const classroomAvailable = course.studyMode.includes('classroom');
  const distanceAvailable = course.studyMode.includes('distance');
  courseStatus.innerHTML = '';
  courseDetails.hidden = false;
  courseImage.src = `./${course.image}`;
  courseImage.alt = course.title;
  courseNumber.textContent = course.courseNumber;
  courseTitle.textContent = course.title;
  courseDescription.textContent = course.description;
  courseDays.textContent = course.days.toString();
  courseStudyMode.textContent = formatStudyMode(course.studyMode);
  courseStartDate.textContent = new Date(course.startDate).toLocaleDateString('sv-SE');
  coursePrice.textContent = `${course.price} kr`;
  bookingClassroom.disabled = !classroomAvailable;
  bookingDistance.disabled = !distanceAvailable;
  bookingClassroom.checked = classroomAvailable;
  bookingDistance.checked = !classroomAvailable && distanceAvailable;

  bookingForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const user = getLoggedInUser();

    if (!user || user.id === undefined) {
      location.href = `../login/login.html?redirect=${encodeURIComponent(`../course/course-details.html?id=${course.id}`)}`;
      return;
    }

    const bookingTypeElement = document.querySelector('input[name="bookingType"]:checked') as HTMLInputElement | null;

    if (!bookingTypeElement) {
      displayBookingMessage('No booking type is available for this course.', 'error');
      return;
    }

    if (!course.studyMode.includes(bookingTypeElement.value)) {
      displayBookingMessage('This booking type is not available for the selected course.', 'error');
      return;
    }

    const booking: Booking = {
      courseId: course.id,
      userId: user.id,
      bookingType: bookingTypeElement.value,
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      await new HttpClient<Booking>('bookings').add(booking);
      displayBookingMessage(`Booking confirmed for ${course.title}.`, 'success');
    } catch (error) {
      displayBookingMessage('Could not save the booking.', 'error');
    }
  });
};

const getLoggedInUser = (): User | undefined => {
  const savedUser = localStorage.getItem('westcoast-user');

  if (!savedUser) {
    return;
  }

  return JSON.parse(savedUser) as User;
};

const displayBookingMessage = (message: string, type: string) => {
  const messageElement = document.querySelector('#course-booking-message');

  if (!messageElement) {
    return;
  }

  messageElement.innerHTML = `
    <p class="course-booking__message course-booking__message--${type}">${message}</p>
  `;
};

const displayLoading = () => {
  courseDetails.hidden = true;
  courseStatus.innerHTML = `
    <section class="course-message surface">
      <h1 class="page-title">Course Details</h1>
      <p class="page-text">Loading course information from the local API...</p>
      <div class="spinner">
        <span class="loader"></span>
      </div>
    </section>
  `;
};

const displayError = () => {
  courseDetails.hidden = true;
  courseStatus.innerHTML = `
    <section class="course-message surface">
      <h1 class="page-title">Course not found</h1>
      <p class="page-text">
        The selected course could not be loaded from the local API.
      </p>
      <a class="course-details__button btn" href="../courses/courses.html">Back to courses</a>
    </section>
  `;
};

document.addEventListener('DOMContentLoaded', initApp);

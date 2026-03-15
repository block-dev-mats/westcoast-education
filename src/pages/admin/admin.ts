import HttpClient from '../../data/httpClient.js';
import { formatStudyMode, updateNavigation } from '../../scripts/dom.js';
import { Booking } from '../../models/booking.js';
import { Course } from '../../models/course.js';
import { User } from '../../models/user.js';

type NewCourse = Omit<Course, 'id'>;

const courseList = document.querySelector<HTMLElement>('#courses-list')!;
const courseSelectField = document.querySelector<HTMLElement>('#course-select-field')!;
const courseSelect = document.querySelector<HTMLSelectElement>('#course-select')!;
const bookingsList = document.querySelector<HTMLElement>('#bookings-list')!;
const adminMessage = document.querySelector<HTMLElement>('#admin-message')!;
const openCreateButton = document.querySelector<HTMLButtonElement>('#open-create-course')!;
const overlay = document.querySelector<HTMLElement>('#overlay')!;
const dialog = document.querySelector<HTMLElement>('#modal')!;
const modalTitle = document.querySelector<HTMLElement>('#modal-title')!;
const imageLabel = document.querySelector<HTMLElement>('#image-label')!;
const deleteButton = document.querySelector<HTMLButtonElement>('#delete-course')!;
const closeModalButton = document.querySelector<HTMLButtonElement>('#close-modal')!;
const cancelCourseButton = document.querySelector<HTMLButtonElement>('#cancel-course-form')!;
const saveCourseButton = document.querySelector<HTMLButtonElement>('#save-course')!;
const modalMessage = document.querySelector<HTMLElement>('#modal-message')!;
const form = document.querySelector<HTMLFormElement>('#course-form')!;
const titleInput = document.querySelector<HTMLInputElement>('#title')!;
const courseNumberInput = document.querySelector<HTMLInputElement>('#courseNumber')!;
const daysInput = document.querySelector<HTMLInputElement>('#days')!;
const priceInput = document.querySelector<HTMLInputElement>('#price')!;
const startDateInput = document.querySelector<HTMLInputElement>('#startDate')!;
const descriptionInput = document.querySelector<HTMLTextAreaElement>('#description')!;
const imageInput = document.querySelector<HTMLInputElement>('#image')!;
const classroomInput = document.querySelector<HTMLInputElement>('#studyMode-classroom')!;
const distanceInput = document.querySelector<HTMLInputElement>('#studyMode-distance')!;

let courses: Course[] = [];
let users: User[] = [];
let bookings: Booking[] = [];
let editCourseId: number | undefined;
let selectedCourseId: number | undefined;

const initApp = async () => {
  updateNavigation();
  attachEventHandlers();
  displayLoading();
  await loadData();
};

const attachEventHandlers = () => {
  openCreateButton.addEventListener('click', displayCreateCourseModal);
  closeModalButton.addEventListener('click', closeDialog);
  cancelCourseButton.addEventListener('click', closeDialog);
  overlay.addEventListener('click', closeDialog);
  courseSelect.addEventListener('change', () => {
    selectedCourseId = Number(courseSelect.value);
    displayBookings(selectedCourseId);
  });
  form.addEventListener('submit', saveCourse);
  deleteButton.addEventListener('click', deleteCourse);
};

const displayLoading = () => {
  courseList.innerHTML = `
    <div class="spinner">
      <span class="loader"></span>
    </div>
  `;

  bookingsList.innerHTML = `
    <div class="spinner">
      <span class="loader"></span>
    </div>
  `;
};

const loadData = async () => {
  try {
    courses = await new HttpClient<Course[]>('courses').listAll();
    users = await new HttpClient<User[]>('users').listAll();
    bookings = await new HttpClient<Booking[]>('bookings').listAll();

    if (!courses.find((course) => course.id === selectedCourseId)) {
      selectedCourseId = courses[0]?.id;
    }

    displayCourses();
    displayCourseOptions();
    displayBookings(selectedCourseId);
  } catch (error) {
    displayAdminMessage('The admin page could not load data from the local API.', 'error');
    courseList.innerHTML = '';
    bookingsList.innerHTML = '';
  }
};

const displayCourses = () => {
  courseList.innerHTML = '';

  if (!courses.length) {
    courseList.innerHTML = `
      <p class="admin-empty">No courses available.</p>
    `;
    return;
  }

  courses.forEach((course) => {
    const row = document.createElement('section');
    row.classList.add('admin-course-row');

    const editButton = document.createElement('button');
    editButton.classList.add('admin-course__edit');
    editButton.type = 'button';
    editButton.textContent = '✎';
    editButton.setAttribute('aria-label', `Edit ${course.title}`);
    editButton.dataset.courseId = course.id.toString();
    editButton.addEventListener('click', () => displayEditCourseModal(course.id));

    const content = document.createElement('div');
    content.classList.add('admin-course__content');

    const main = document.createElement('div');
    main.classList.add('admin-course__main');

    const heading = document.createElement('h3');
    heading.textContent = course.title;

    const number = document.createElement('p');
    number.textContent = course.courseNumber;

    main.appendChild(heading);
    main.appendChild(number);

    const meta = document.createElement('div');
    meta.classList.add('admin-course__meta');

    [
      `${course.days} days`,
      formatStudyMode(course.studyMode),
      new Date(course.startDate).toLocaleDateString('sv-SE'),
      `${course.price} kr`
    ].forEach((text) => {
      const span = document.createElement('span');
      span.textContent = text;
      meta.appendChild(span);
    });

    content.appendChild(main);
    content.appendChild(meta);
    row.appendChild(editButton);
    row.appendChild(content);
    courseList.appendChild(row);
  });
};

const displayCourseOptions = () => {
  courseSelect.innerHTML = '';
  courseSelectField.hidden = !courses.length;

  courses.forEach((course) => {
    const option = document.createElement('option');
    option.value = course.id.toString();
    option.textContent = course.title;

    if (course.id === selectedCourseId) {
      option.selected = true;
    }

    courseSelect.appendChild(option);
  });
};

const displayBookings = (courseId?: number) => {
  bookingsList.innerHTML = '';

  if (!courseId) {
    bookingsList.innerHTML = `
      <p class="admin-empty">No courses available.</p>
    `;
    return;
  }

  const selectedBookings = bookings.filter((booking) => booking.courseId === courseId);

  if (!selectedBookings.length) {
    bookingsList.innerHTML = `
      <p class="admin-empty">No bookings for this course yet.</p>
    `;
    return;
  }

  selectedBookings.forEach((booking) => {
    const user = users.find((currentUser) => currentUser.id === booking.userId);

    if (!user) {
      return;
    }

    const bookingCard = document.createElement('article');
    bookingCard.classList.add('booking-item');
    bookingCard.innerHTML = `
      <h3>${user.name}</h3>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone}</p>
      <p><strong>Booking type:</strong> ${booking.bookingType}</p>
    `;

    bookingsList.appendChild(bookingCard);
  });
};

const displayCreateCourseModal = () => {
  editCourseId = undefined;
  modalTitle.textContent = 'Add new course';
  imageLabel.textContent = 'Course image';
  saveCourseButton.textContent = 'Save course';
  deleteButton.hidden = true;
  form.reset();
  modalMessage.innerHTML = '';
  openDialog();
};

const displayEditCourseModal = (courseId: number) => {
  const course = courses.find((currentCourse) => currentCourse.id === courseId);

  if (!course) {
    return;
  }

  editCourseId = courseId;
  modalTitle.textContent = 'Edit course';
  imageLabel.textContent = 'Replace image';
  saveCourseButton.textContent = 'Save changes';
  deleteButton.hidden = false;
  modalMessage.innerHTML = '';
  populateForm(course);
  openDialog();
};

const populateForm = (course: Course) => {
  titleInput.value = course.title;
  courseNumberInput.value = course.courseNumber;
  daysInput.value = course.days.toString();
  priceInput.value = course.price.toString();
  startDateInput.value = course.startDate;
  descriptionInput.value = course.description;
  classroomInput.checked = course.studyMode.includes('classroom');
  distanceInput.checked = course.studyMode.includes('distance');
  imageInput.value = '';
};

const openDialog = () => {
  overlay.classList.add('show');
  dialog.classList.add('show');
};

const closeDialog = () => {
  overlay.classList.remove('show');
  dialog.classList.remove('show');
  modalMessage.innerHTML = '';
  form.reset();
  editCourseId = undefined;
};

const saveCourse = async (event: SubmitEvent) => {
  event.preventDefault();

  const studyMode: string[] = [];

  if (classroomInput.checked) {
    studyMode.push('classroom');
  }

  if (distanceInput.checked) {
    studyMode.push('distance');
  }

  if (!studyMode.length) {
    displayModalMessage('Select at least one study mode.', 'error');
    return;
  }

  try {
    const image = imageInput.files?.[0]
      ? await readImageAsDataUrl(imageInput.files[0])
      : courses.find((course) => course.id === editCourseId)?.image || '../../assets/images/courses/default-course.svg';

    if (editCourseId) {
      const currentCourse = courses.find((course) => course.id === editCourseId);

      if (!currentCourse) {
        return;
      }

      const updatedCourse: Course = {
        ...currentCourse,
        title: titleInput.value,
        courseNumber: courseNumberInput.value,
        days: Number(daysInput.value),
        price: Number(priceInput.value),
        studyMode,
        image,
        startDate: startDateInput.value,
        description: descriptionInput.value
      };

      await new HttpClient<Course>('courses').update(editCourseId, updatedCourse);
      closeDialog();
      await loadData();
      displayAdminMessage('Course updated successfully.', 'success');
      return;
    }

    const newCourse: NewCourse = {
      title: titleInput.value,
      courseNumber: courseNumberInput.value,
      days: Number(daysInput.value),
      price: Number(priceInput.value),
      studyMode,
      image,
      startDate: startDateInput.value,
      description: descriptionInput.value,
      isPopular: false
    };

    await new HttpClient<NewCourse>('courses').add(newCourse);
    closeDialog();
    await loadData();
    displayAdminMessage('Course saved successfully.', 'success');
  } catch (error) {
    displayModalMessage('Could not save the course.', 'error');
  }
};

const deleteCourse = async () => {
  const course = courses.find((currentCourse) => currentCourse.id === editCourseId);

  if (!course) {
    return;
  }

  const shouldDelete = confirm(`Delete ${course.title}?`);

  if (!shouldDelete) {
    return;
  }

  try {
    const selectedBookings = bookings.filter((booking) => booking.courseId === course.id);

    for (const booking of selectedBookings) {
      if (booking.id === undefined) {
        continue;
      }

      await new HttpClient<Booking>('bookings').delete(booking.id);
    }

    await new HttpClient<Course>('courses').delete(course.id);

    if (selectedCourseId === course.id) {
      selectedCourseId = undefined;
    }

    closeDialog();
    await loadData();
    displayAdminMessage('Course deleted successfully.', 'success');
  } catch (error) {
    displayModalMessage('Could not delete the course.', 'error');
  }
};

const readImageAsDataUrl = async (file: File): Promise<string> => {
  return await new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', () => {
      resolve(fileReader.result as string);
    });

    fileReader.addEventListener('error', () => {
      reject(new Error('Could not read image.'));
    });

    fileReader.readAsDataURL(file);
  });
};

const displayAdminMessage = (message: string, type: string) => {
  adminMessage.innerHTML = `
    <p class="admin-feedback admin-feedback--${type}">${message}</p>
  `;
};

const displayModalMessage = (message: string, type: string) => {
  modalMessage.innerHTML = `
    <p class="admin-feedback admin-feedback--${type}">${message}</p>
  `;
};

document.addEventListener('DOMContentLoaded', initApp);

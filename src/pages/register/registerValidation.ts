type RegisterFormData = {
  name: string;
  billingAddress: string;
  email: string;
  phone: string;
  password: string;
};

const phonePattern = /^[0-9+\-\s]{7,15}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isLengthBetween = (value: string, min: number, max: number) => value.length >= min && value.length <= max;

export const validateRegisterForm = (data: RegisterFormData) => {
  const name = data.name.trim();
  const billingAddress = data.billingAddress.trim();
  const email = data.email.trim();
  const phone = data.phone.trim();
  const password = data.password.trim();

  if (!isLengthBetween(name, 2, 50)) {
    return 'Name must be between 2 and 50 characters.';
  }

  if (!isLengthBetween(billingAddress, 5, 120)) {
    return 'Billing address must be between 5 and 120 characters.';
  }

  if (email.length > 100 || !emailPattern.test(email)) {
    return 'Enter a valid email address.';
  }

  if (!phonePattern.test(phone)) {
    return 'Enter a valid mobile phone number.';
  }

  if (!isLengthBetween(password, 6, 40)) {
    return 'Password must be between 6 and 40 characters.';
  }

  return null;
};

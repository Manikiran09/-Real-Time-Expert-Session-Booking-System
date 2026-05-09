export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9+\-\s()]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateBookingForm = (formData) => {
  const errors = {};

  if (!validateName(formData.clientName)) {
    errors.clientName = 'Name must be at least 2 characters';
  }

  if (!validateEmail(formData.clientEmail)) {
    errors.clientEmail = 'Please enter a valid email';
  }

  if (!validatePhone(formData.clientPhone)) {
    errors.clientPhone = 'Please enter a valid phone number';
  }

  if (!formData.bookingDate) {
    errors.bookingDate = 'Please select a date';
  }

  if (!formData.startTime) {
    errors.startTime = 'Please select a time slot';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const formatDate = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return '#FFA500';
    case 'Confirmed':
      return '#4CAF50';
    case 'Completed':
      return '#2196F3';
    case 'Cancelled':
      return '#F44336';
    default:
      return '#757575';
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending':
      return 'hourglass';
    case 'Confirmed':
      return 'check-circle';
    case 'Completed':
      return 'checkmark';
    case 'Cancelled':
      return 'close-circle';
    default:
      return 'info';
  }
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateRequired = (value) => {
  return value && value.trim().length > 0
}

export const validateBooking = (bookingData) => {
  const errors = {}

  if (!validateRequired(bookingData.userName)) {
    errors.userName = 'Name is required'
  }

  if (!validateEmail(bookingData.userEmail)) {
    errors.userEmail = 'Valid email is required'
  }

  if (!validatePhone(bookingData.userPhone)) {
    errors.userPhone = 'Valid phone number is required'
  }

  if (!bookingData.slotId) {
    errors.slotId = 'Please select a time slot'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

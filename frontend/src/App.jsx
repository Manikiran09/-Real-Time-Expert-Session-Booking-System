import React, { useEffect, useMemo, useRef, useState } from 'react';
import { expertsAPI, bookingsAPI } from './services/api';
import {
  disconnectSocket,
  initializeSocket,
  onBookingStatusUpdated,
  onSlotBooked,
  onSlotFreed,
  subscribeToBookings,
  subscribeToExpert,
  unsubscribeFromExpert,
} from './services/socket';
import {
  formatDate,
  formatTime,
  getStatusColor,
  validateBookingForm,
} from './utils/validators';
import RootNavigator from './navigation/RootNavigator';

const PAGE_SIZE = 8;

function App() {
  const [experts, setExperts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expertsLoading, setExpertsLoading] = useState(false);
  const [expertsError, setExpertsError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [expertLoading, setExpertLoading] = useState(false);
  const [expertError, setExpertError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState('');

  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [banner, setBanner] = useState({ type: '', message: '' });

  const [bookingsEmail, setBookingsEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState('');

  const bookingsEmailRef = useRef('');

  const selectedExpertPreview = useMemo(() => {
    return selectedExpert || experts.find((item) => item._id === selectedExpertId) || null;
  }, [experts, selectedExpert, selectedExpertId]);

  useEffect(() => {
    initializeSocket();

    const handleSlotBooked = (payload) => {
      if (payload.expertId === selectedExpertId) {
        loadExpert(payload.expertId, false);
      }
    };

    const handleSlotFreed = (payload) => {
      if (payload.expertId === selectedExpertId) {
        loadExpert(payload.expertId, false);
      }
    };

    const handleBookingStatus = () => {
      if (bookingsEmailRef.current) {
        loadBookings(bookingsEmailRef.current, false);
      }
    };

    onSlotBooked(handleSlotBooked);
    onSlotFreed(handleSlotFreed);
    onBookingStatusUpdated(handleBookingStatus);

    return () => {
      disconnectSocket();
    };
  }, [selectedExpertId]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadExperts(1);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    loadExperts(page, page !== 1);
  }, [page]);

  useEffect(() => {
    if (!selectedExpertId && experts.length > 0) {
      setSelectedExpertId(experts[0]._id);
    }
  }, [experts, selectedExpertId]);

  useEffect(() => {
    if (selectedExpertId) {
      loadExpert(selectedExpertId);
      subscribeToExpert(selectedExpertId);
      return () => unsubscribeFromExpert(selectedExpertId);
    }
    return undefined;
  }, [selectedExpertId]);

  async function loadCategories() {
    try {
      const response = await expertsAPI.getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  }

  async function loadExperts(pageNumber = 1, append = false) {
    try {
      setExpertsLoading(true);
      setExpertsError('');
      const response = await expertsAPI.getAllExperts(
        pageNumber,
        PAGE_SIZE,
        selectedCategory,
        searchTerm
      );
      const payload = response.data;
      setTotalPages(payload.pagination?.pages || 1);
      setPage(pageNumber);
      setExperts((current) => (append ? [...current, ...payload.data] : payload.data || []));
      if (!selectedExpertId && payload.data?.length > 0) {
        setSelectedExpertId(payload.data[0]._id);
      }
    } catch (error) {
      setExpertsError(error.response?.data?.message || error.message || 'Failed to load experts');
    } finally {
      setExpertsLoading(false);
    }
  }

  async function loadExpert(expertId, showLoader = true) {
    if (!expertId) {
      return;
    }

    try {
      if (showLoader) {
        setExpertLoading(true);
      }
      setExpertError('');
      const response = await expertsAPI.getExpertById(expertId);
      const expert = response.data.data;
      setSelectedExpert(expert);
      setSlotsByDate(expert.availableSlots || {});

      setSelectedBookingDate('');

      if (selectedSlot && !expert.availableSlots) {
        setSelectedSlot(null);
      }
    } catch (error) {
      setExpertError(error.response?.data?.message || error.message || 'Failed to load expert');
    } finally {
      if (showLoader) {
        setExpertLoading(false);
      }
    }
  }

  async function loadBookings(email, showLoader = true) {
    if (!email) {
      setBookingsError('Enter an email to load bookings.');
      return;
    }

    try {
      if (showLoader) {
        setBookingsLoading(true);
      }
      setBookingsError('');
      bookingsEmailRef.current = email;
      subscribeToBookings(email);
      const response = await bookingsAPI.getBookingsByEmail(email);
      setBookings(response.data.data || []);
    } catch (error) {
      setBookingsError(error.response?.data?.message || error.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      if (showLoader) {
        setBookingsLoading(false);
      }
    }
  }

  function showNotice(type, message) {
    setBanner({ type, message });
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(() => {
      setBanner({ type: '', message: '' });
    }, 3000);
  }

  function handleExpertSelect(expertId) {
    setSelectedExpertId(expertId);
    setSelectedSlot(null);
    setSelectedBookingDate('');
  }

  function handleBookingDateChange(value) {
    setSelectedBookingDate(value);
    setSelectedSlot(null);
    setFormErrors((current) => ({
      ...current,
      bookingDate: '',
      startTime: '',
    }));
  }

  function handleFormChange(field, value) {
    setBookingForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: '' }));
  }

  function handleSlotSelect(slot) {
    setSelectedSlot(slot);
    setSelectedBookingDate(slot?.date ? new Date(slot.date).toISOString().split('T')[0] : '');
    setFormErrors((current) => ({
      ...current,
      bookingDate: '',
      startTime: '',
    }));
  }

  async function handleBookingSubmit(event) {
    event.preventDefault();

    const validation = validateBookingForm({
      ...bookingForm,
      bookingDate: selectedSlot?.date,
      startTime: selectedSlot?.startTime,
      endTime: selectedSlot?.endTime,
    });

    if (!selectedExpertPreview) {
      showNotice('error', 'Select an expert first.');
      return;
    }

    if (!selectedSlot) {
      setFormErrors((current) => ({
        ...current,
        bookingDate: validation.errors.bookingDate || 'Please select a date',
        startTime: validation.errors.startTime || 'Please select a time slot',
      }));
      showNotice('error', 'Select an available time slot first.');
      return;
    }

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      showNotice('error', 'Please fix the highlighted fields.');
      return;
    }

    try {
      setBookingLoading(true);
      const response = await bookingsAPI.createBooking({
        expertId: selectedExpertPreview._id,
        timeSlotId: selectedSlot._id,
        clientName: bookingForm.clientName,
        clientEmail: bookingForm.clientEmail,
        clientPhone: bookingForm.clientPhone,
        bookingDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: bookingForm.notes,
      });

      if (response.data.success) {
        showNotice('success', response.data.message || 'Booking created successfully.');
        setBookingForm({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          notes: '',
        });
        setSelectedSlot(null);
        loadExpert(selectedExpertPreview._id, false);
        if (bookingForm.clientEmail) {
          setBookingsEmail(bookingForm.clientEmail);
          await loadBookings(bookingForm.clientEmail, false);
        }
      }
    } catch (error) {
      showNotice('error', error.response?.data?.message || error.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleCancelBooking(bookingId) {
    const confirmed = window.confirm('Cancel this booking?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await bookingsAPI.cancelBooking(bookingId);
      if (response.data.success) {
        showNotice('success', 'Booking cancelled successfully.');
        if (bookingsEmailRef.current) {
          loadBookings(bookingsEmailRef.current, false);
        }
      }
    } catch (error) {
      showNotice('error', error.response?.data?.message || error.message || 'Failed to cancel booking');
    }
  }

  const displayedExperts = experts;

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Real-Time Booking Platform</p>
          <h1>Expert Session Booking</h1>
          <p className="hero-copy">
            Search experts, inspect live slot availability, book a session, and watch updates arrive in real time.
          </p>
        </div>
      </header>

      {banner.message ? (
        <div className={`banner ${banner.type}`}>{banner.message}</div>
      ) : null}

      <RootNavigator
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        expertsError={expertsError}
        expertsLoading={expertsLoading}
        displayedExperts={displayedExperts}
        selectedExpertId={selectedExpertId}
        handleExpertSelect={handleExpertSelect}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        loadExperts={loadExperts}
        expertError={expertError}
        expertLoading={expertLoading}
        selectedExpert={selectedExpert}
        selectedExpertPreview={selectedExpertPreview}
        slotsByDate={slotsByDate}
        selectedSlot={selectedSlot}
        handleSlotSelect={handleSlotSelect}
        selectedBookingDate={selectedBookingDate}
        handleBookingDateChange={handleBookingDateChange}
        formatDate={formatDate}
        formatTime={formatTime}
        bookingForm={bookingForm}
        handleFormChange={handleFormChange}
        formErrors={formErrors}
        handleBookingSubmit={handleBookingSubmit}
        bookingLoading={bookingLoading}
        bookingsEmail={bookingsEmail}
        setBookingsEmail={setBookingsEmail}
        loadBookings={loadBookings}
        bookingsError={bookingsError}
        bookingsLoading={bookingsLoading}
        bookings={bookings}
        bookingsEmailRef={bookingsEmailRef}
        handleCancelBooking={handleCancelBooking}
        getStatusColor={getStatusColor}
      />
    </div>
  );
}

export default App;
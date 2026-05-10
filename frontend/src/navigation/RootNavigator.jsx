import React from 'react';
import ExpertListingScreen from '../screens/ExpertListingScreen';
import ExpertDetailScreen from '../screens/ExpertDetailScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';

function RootNavigator(props) {
  return (
    <>
      <main className="dashboard">
        <ExpertListingScreen
          categories={props.categories}
          selectedCategory={props.selectedCategory}
          setSelectedCategory={props.setSelectedCategory}
          searchTerm={props.searchTerm}
          setSearchTerm={props.setSearchTerm}
          expertsError={props.expertsError}
          expertsLoading={props.expertsLoading}
          displayedExperts={props.displayedExperts}
          selectedExpertId={props.selectedExpertId}
          handleExpertSelect={props.handleExpertSelect}
          page={props.page}
          totalPages={props.totalPages}
          setPage={props.setPage}
          loadExperts={props.loadExperts}
        />

        <ExpertDetailScreen
          expertError={props.expertError}
          expertLoading={props.expertLoading}
          selectedExpert={props.selectedExpert}
          selectedExpertPreview={props.selectedExpertPreview}
          slotsByDate={props.slotsByDate}
          selectedSlot={props.selectedSlot}
          handleSlotSelect={props.handleSlotSelect}
          selectedBookingDate={props.selectedBookingDate}
          handleBookingDateChange={props.handleBookingDateChange}
          formatDate={props.formatDate}
          formatTime={props.formatTime}
          bookingForm={props.bookingForm}
          handleFormChange={props.handleFormChange}
          formErrors={props.formErrors}
          handleBookingSubmit={props.handleBookingSubmit}
          bookingLoading={props.bookingLoading}
        />
      </main>

      <MyBookingsScreen
        bookingsEmail={props.bookingsEmail}
        setBookingsEmail={props.setBookingsEmail}
        loadBookings={props.loadBookings}
        bookingsError={props.bookingsError}
        bookingsLoading={props.bookingsLoading}
        bookings={props.bookings}
        bookingsEmailRef={props.bookingsEmailRef}
        handleCancelBooking={props.handleCancelBooking}
        formatDate={props.formatDate}
        formatTime={props.formatTime}
        getStatusColor={props.getStatusColor}
      />
    </>
  );
}

export default RootNavigator;

/**
 * CareWell Clinic - Soft & Calm Wellness Script
 * Doctor: Dr. Anjali Deshmukh, General Physician (MBBS, MD)
 * City: Pune, Maharashtra
 * Timings: Mon-Sat, 10 AM - 1 PM & 5 PM - 8 PM. Sunday closed.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Element Selectors ---
  const header = document.querySelector('.site-header');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer-actions .btn');

  // Appointment Modal Elements
  const appointmentModal = document.getElementById('appointmentModal');
  const openAppointmentBtns = document.querySelectorAll('[data-action="book-appointment"]');
  const closeAppointmentBtn = document.getElementById('closeModalBtn');
  const appointmentForm = document.getElementById('appointmentForm');
  const appointmentFormView = document.getElementById('appointmentFormView');
  const bookingSuccessView = document.getElementById('bookingSuccessView');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');

  // Call Dialog Elements
  const callDialog = document.getElementById('callDialog');
  const openCallBtns = document.querySelectorAll('[data-action="call-clinic"]');
  const closeCallBtn = document.getElementById('closeCallBtn');

  // Clinic Status Elements
  const clinicStatusBadge = document.getElementById('clinicStatusBadge');
  const clinicStatusNote = document.getElementById('clinicStatusNote');

  // Toast Element
  const toastNotice = document.getElementById('toastNotice');

  // ==========================================================================
  // 1. IntersectionObserver for Subtle Scroll Fade-Up Animations
  // Respects prefers-reduced-motion setting
  // ==========================================================================
  const initScrollAnimations = () => {
    const fadeElements = document.querySelectorAll('.fade-up');
    if (!fadeElements.length) return;

    // Check accessibility preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      fadeElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
  };

  initScrollAnimations();

  // ==========================================================================
  // 2. Sticky Navigation Bar & Subtle Shadow on Scroll
  // ==========================================================================
  const handleScroll = () => {
    if (window.scrollY > 15) {
      header?.classList.add('is-scrolled');
    } else {
      header?.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // ==========================================================================
  // 3. Mobile Hamburger Menu Toggle
  // ==========================================================================
  const toggleMobileMenu = (forceState) => {
    if (!hamburgerBtn || !mobileDrawer || !mobileOverlay) return;

    const shouldOpen = typeof forceState === 'boolean' 
      ? forceState 
      : !hamburgerBtn.classList.contains('is-active');

    hamburgerBtn.classList.toggle('is-active', shouldOpen);
    hamburgerBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    mobileDrawer.classList.toggle('is-visible', shouldOpen);
    mobileOverlay.classList.toggle('is-visible', shouldOpen);

    // Prevent background scrolling while mobile drawer is open
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  };

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleMobileMenu());
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', () => toggleMobileMenu(false));
  }

  // Close mobile drawer when any link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMobileMenu(false);
    });
  });

  // ==========================================================================
  // 4. Live Clinic Open/Closed Status (Pune Schedule)
  // Timings: Mon-Sat, 10 AM - 1 PM & 5 PM - 8 PM. Sunday closed.
  // ==========================================================================
  const updateClinicStatus = () => {
    if (!clinicStatusBadge || !clinicStatusNote) return;

    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeMinutes = hours * 60 + minutes;

    const morningStart = 10 * 60; // 10:00 AM
    const morningEnd = 13 * 60;   // 01:00 PM
    const eveningStart = 17 * 60; // 05:00 PM
    const eveningEnd = 20 * 60;   // 08:00 PM

    let isOpen = false;
    let badgeText = 'Closed Now';
    let noteText = '';

    if (day === 0) {
      isOpen = false;
      badgeText = 'Closed Today (Sunday)';
      noteText = 'Regular hours resume Monday at 10:00 AM';
    } else {
      if (currentTimeMinutes >= morningStart && currentTimeMinutes < morningEnd) {
        isOpen = true;
        badgeText = 'Open Now';
        noteText = 'Morning consultation until 1:00 PM';
      } else if (currentTimeMinutes >= eveningStart && currentTimeMinutes < eveningEnd) {
        isOpen = true;
        badgeText = 'Open Now';
        noteText = 'Evening consultation until 8:00 PM';
      } else if (currentTimeMinutes < morningStart) {
        isOpen = false;
        badgeText = 'Closed Now';
        noteText = 'Opens today at 10:00 AM (Morning Slot)';
      } else if (currentTimeMinutes >= morningEnd && currentTimeMinutes < eveningStart) {
        isOpen = false;
        badgeText = 'Closed (Afternoon Break)';
        noteText = 'Reopens today at 5:00 PM (Evening Slot)';
      } else {
        isOpen = false;
        badgeText = 'Closed for the Day';
        const nextDay = day === 6 ? 'Monday' : 'tomorrow';
        noteText = `Opens ${nextDay} at 10:00 AM`;
      }
    }

    clinicStatusBadge.className = `clinic-status-badge ${isOpen ? 'is-open' : 'is-closed'}`;
    clinicStatusBadge.innerHTML = `<span class="indicator-dot" aria-hidden="true"></span>${badgeText}`;
    clinicStatusNote.innerHTML = `<strong>Timings:</strong> Mon–Sat 10 AM–1 PM, 5 PM–8 PM · <span>${noteText}</span>`;
  };

  updateClinicStatus();
  setInterval(updateClinicStatus, 60000);

  // ==========================================================================
  // 5. Appointment Booking Modal
  // ==========================================================================
  const openModal = () => {
    if (!appointmentModal) return;
    toggleMobileMenu(false);
    appointmentModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Set minimum date to today
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
      const todayStr = new Date().toISOString().split('T')[0];
      dateInput.min = todayStr;
      if (!dateInput.value) {
        dateInput.value = todayStr;
      }
    }

    if (appointmentFormView) appointmentFormView.style.display = 'block';
    if (bookingSuccessView) bookingSuccessView.classList.remove('is-visible');
  };

  const closeModal = () => {
    if (!appointmentModal) return;
    appointmentModal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  openAppointmentBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeAppointmentBtn) {
    closeAppointmentBtn.addEventListener('click', closeModal);
  }

  if (appointmentModal) {
    appointmentModal.addEventListener('click', (e) => {
      if (e.target === appointmentModal) {
        closeModal();
      }
    });
  }

  // Handle Form Submission
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const patientName = document.getElementById('patientName')?.value.trim();
      const patientPhone = document.getElementById('patientPhone')?.value.trim();
      const appointmentDate = document.getElementById('appointmentDate')?.value;
      const appointmentSlot = document.getElementById('appointmentSlot')?.value;

      if (!patientName || !patientPhone || !appointmentDate || !appointmentSlot) {
        showToast('Please fill in all required fields.');
        return;
      }

      // Check if selected day is Sunday
      const selectedDateObj = new Date(appointmentDate + 'T00:00:00');
      if (selectedDateObj.getDay() === 0) {
        showToast('CareWell Clinic is closed on Sundays. Please choose Mon–Sat.');
        return;
      }

      const formattedDate = selectedDateObj.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const confirmedDetails = document.getElementById('confirmedDetails');
      if (confirmedDetails) {
        confirmedDetails.innerHTML = `
          <div><strong>Patient:</strong> ${patientName} (${patientPhone})</div>
          <div><strong>Doctor:</strong> Dr. Anjali Deshmukh (MBBS, MD)</div>
          <div><strong>Date:</strong> ${formattedDate}</div>
          <div><strong>Slot:</strong> ${appointmentSlot}</div>
          <div><strong>Location:</strong> CareWell Clinic, Pune</div>
        `;
      }

      if (appointmentFormView) appointmentFormView.style.display = 'none';
      if (bookingSuccessView) bookingSuccessView.classList.add('is-visible');

      showToast('Appointment request confirmed!');
    });
  }

  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', () => {
      closeModal();
      if (appointmentForm) appointmentForm.reset();
    });
  }

  // ==========================================================================
  // 6. Call Now Quick Dialog
  // ==========================================================================
  const openCallDialog = () => {
    if (!callDialog) return;
    toggleMobileMenu(false);
    callDialog.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeCallDialog = () => {
    if (!callDialog) return;
    callDialog.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  openCallBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCallDialog();
    });
  });

  if (closeCallBtn) {
    closeCallBtn.addEventListener('click', closeCallDialog);
  }

  if (callDialog) {
    callDialog.addEventListener('click', (e) => {
      if (e.target === callDialog) {
        closeCallDialog();
      }
    });
  }

  // ==========================================================================
  // 7. Global Keyboard Handling & Toast
  // ==========================================================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeCallDialog();
      toggleMobileMenu(false);
    }
  });

  function showToast(message) {
    if (!toastNotice) return;
    toastNotice.textContent = message;
    toastNotice.classList.add('is-active');

    setTimeout(() => {
      toastNotice.classList.remove('is-active');
    }, 3500);
  }

  // ==========================================================================
  // 9. Contact Page Form Validation & Handling (Item 4)
  // Fields: Name, Phone (10 digits), Email (optional), Message
  // ==========================================================================
  const contactForm = document.getElementById('contactForm');
  const contactSuccessBanner = document.getElementById('contactSuccessBanner');

  if (contactForm) {
    const nameInput = document.getElementById('contactName');
    const phoneInput = document.getElementById('contactPhone');
    const messageInput = document.getElementById('contactMessage');

    const nameError = document.getElementById('contactNameError');
    const phoneError = document.getElementById('contactPhoneError');
    const messageError = document.getElementById('contactMessageError');

    const clearError = (input, errorEl) => {
      input?.classList.remove('has-error');
      if (errorEl) {
        errorEl.classList.remove('is-visible');
        errorEl.textContent = '';
      }
    };

    const setError = (input, errorEl, msg) => {
      input?.classList.add('has-error');
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.add('is-visible');
      }
    };

    nameInput?.addEventListener('input', () => clearError(nameInput, nameError));
    phoneInput?.addEventListener('input', () => clearError(phoneInput, phoneError));
    messageInput?.addEventListener('input', () => clearError(messageInput, messageError));

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate Name
      const nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal) {
        setError(nameInput, nameError, 'Please enter your full name.');
        isValid = false;
      } else if (nameVal.length < 2) {
        setError(nameInput, nameError, 'Name must be at least 2 characters.');
        isValid = false;
      } else {
        clearError(nameInput, nameError);
      }

      // Validate Phone: must be 10 digits
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';
      const cleanPhone = phoneVal.replace(/[\s\-\(\)\+]/g, '');
      const isTenDigits = /^\d{10}$/.test(cleanPhone) || (/^91\d{10}$/.test(cleanPhone));
      if (!phoneVal) {
        setError(phoneInput, phoneError, 'Please enter your 10-digit phone number.');
        isValid = false;
      } else if (!isTenDigits) {
        setError(phoneInput, phoneError, 'Phone number must be exactly 10 digits (e.g. 9876543210).');
        isValid = false;
      } else {
        clearError(phoneInput, phoneError);
      }

      // Validate Message
      const messageVal = messageInput ? messageInput.value.trim() : '';
      if (!messageVal) {
        setError(messageInput, messageError, 'Please write your message or query.');
        isValid = false;
      } else if (messageVal.length < 5) {
        setError(messageInput, messageError, 'Please provide a little more detail (at least 5 characters).');
        isValid = false;
      } else {
        clearError(messageInput, messageError);
      }

      if (!isValid) {
        showToast('Please check the highlighted fields.');
        return;
      }

      // Show inline success message without reloading page
      contactForm.reset();
      if (contactSuccessBanner) {
        contactSuccessBanner.classList.add('is-visible');
        contactSuccessBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      showToast('Thank you, we will get back to you soon!');
    });
  }

  // ==========================================================================
  // 10. Dedicated Appointment Page Handler (appointment.html)
  // Time Slot Picker, Sunday Check, Past Slots Disabling, and WhatsApp Confirmation
  // ==========================================================================
  const pageBookingForm = document.getElementById('pageBookingForm');
  const pageBookingFormView = document.getElementById('pageBookingFormView');
  const pageSuccessCard = document.getElementById('pageSuccessCard');

  if (pageBookingForm) {
    const nameInput = document.getElementById('bookingName');
    const phoneInput = document.getElementById('bookingPhone');
    const serviceSelect = document.getElementById('bookingService');
    const dateInput = document.getElementById('bookingDate');
    const slotContainer = document.getElementById('slotPickerContainer');
    const selectedSlotInput = document.getElementById('selectedSlotValue');
    const dateWarning = document.getElementById('bookingDateWarning');

    const nameError = document.getElementById('bookingNameError');
    const phoneError = document.getElementById('bookingPhoneError');
    const serviceError = document.getElementById('bookingServiceError');
    const dateError = document.getElementById('bookingDateError');
    const slotError = document.getElementById('bookingSlotError');

    const slotButtons = document.querySelectorAll('.slot-pill-btn');
    const whatsappConfirmBtn = document.getElementById('whatsappConfirmBtn');

    // Set min date to today (past dates not allowed) using local timezone
    const nowLocal = new Date();
    const lYear = nowLocal.getFullYear();
    const lMonth = String(nowLocal.getMonth() + 1).padStart(2, '0');
    const lDay = String(nowLocal.getDate()).padStart(2, '0');
    const todayStr = `${lYear}-${lMonth}-${lDay}`;
    if (dateInput) {
      dateInput.min = todayStr;
    }

    // Helper to clear error
    const clearError = (input, errorEl) => {
      input?.classList.remove('has-error');
      if (errorEl) {
        errorEl.classList.remove('is-visible');
        errorEl.textContent = '';
      }
    };

    // Helper to set error
    const setError = (input, errorEl, msg) => {
      input?.classList.add('has-error');
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.add('is-visible');
      }
    };

    nameInput?.addEventListener('input', () => clearError(nameInput, nameError));
    phoneInput?.addEventListener('input', () => clearError(phoneInput, phoneError));
    serviceSelect?.addEventListener('change', () => clearError(serviceSelect, serviceError));

    // Handle Date Change: Sunday Rule & Past Slots on Current Day
    const handleDateChange = () => {
      if (!dateInput) return;
      clearError(dateInput, dateError);

      const val = dateInput.value;
      if (!val) {
        if (slotContainer) slotContainer.style.display = 'none';
        return;
      }

      // Check if selected day is Sunday (day 0)
      const selectedDate = new Date(val + 'T00:00:00');
      const dayOfWeek = selectedDate.getDay();

      if (dayOfWeek === 0) {
        if (dateWarning) {
          dateWarning.textContent = 'The clinic is closed on Sundays, please choose another day.';
          dateWarning.classList.add('is-visible');
        }
        if (slotContainer) slotContainer.style.display = 'none';
        if (selectedSlotInput) selectedSlotInput.value = '';
        slotButtons.forEach(btn => btn.classList.remove('is-selected'));
        return;
      }

      // Valid Mon-Sat date
      if (dateWarning) {
        dateWarning.classList.remove('is-visible');
      }

      // Reveal clickable slot picker
      if (slotContainer) {
        slotContainer.style.display = 'flex';
      }

      // If selected date is today, disable slots that have already passed
      const isToday = val === todayStr;
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTotalMin = currentHour * 60 + currentMin;

      slotButtons.forEach(btn => {
        const timeAttr = btn.getAttribute('data-time'); // e.g. "10:00", "17:30"
        if (!timeAttr) return;

        const [h, m] = timeAttr.split(':').map(Number);
        const slotTotalMin = h * 60 + m;

        // If today and slot total minutes is in the past, disable slot
        if (isToday && slotTotalMin <= currentTotalMin) {
          btn.disabled = true;
          btn.classList.add('is-disabled');
          if (btn.classList.contains('is-selected')) {
            btn.classList.remove('is-selected');
            if (selectedSlotInput) selectedSlotInput.value = '';
          }
        } else {
          btn.disabled = false;
          btn.classList.remove('is-disabled');
        }
      });
    };

    dateInput?.addEventListener('change', handleDateChange);

    // Click handler for pill time slot buttons
    slotButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled || btn.classList.contains('is-disabled')) return;

        // Clear slot errors
        if (slotContainer) slotContainer.classList.remove('has-error');
        if (slotError) {
          slotError.classList.remove('is-visible');
          slotError.textContent = '';
        }

        // Toggle selection
        slotButtons.forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');

        const slotLabel = btn.getAttribute('data-label') || btn.textContent.trim();
        if (selectedSlotInput) {
          selectedSlotInput.value = slotLabel;
        }
      });
    });

    // Handle Form Submit
    pageBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // 1. Name validation
      const nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal) {
        setError(nameInput, nameError, 'Please enter your full name.');
        isValid = false;
      } else if (nameVal.length < 2) {
        setError(nameInput, nameError, 'Name must be at least 2 characters.');
        isValid = false;
      } else {
        clearError(nameInput, nameError);
      }

      // 2. Phone validation (10 digits)
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';
      const cleanPhone = phoneVal.replace(/[\s\-\(\)\+]/g, '');
      const isTenDigits = /^\d{10}$/.test(cleanPhone) || (/^91\d{10}$/.test(cleanPhone));
      if (!phoneVal) {
        setError(phoneInput, phoneError, 'Please enter your 10-digit phone number.');
        isValid = false;
      } else if (!isTenDigits) {
        setError(phoneInput, phoneError, 'Phone number must be exactly 10 digits (e.g. 9876543210).');
        isValid = false;
      } else {
        clearError(phoneInput, phoneError);
      }

      // 3. Service validation
      const serviceVal = serviceSelect ? serviceSelect.value : '';
      if (!serviceVal) {
        setError(serviceSelect, serviceError, 'Please select a healthcare service.');
        isValid = false;
      } else {
        clearError(serviceSelect, serviceError);
      }

      // 4. Date validation
      const dateVal = dateInput ? dateInput.value : '';
      if (!dateVal) {
        setError(dateInput, dateError, 'Please choose an appointment date.');
        isValid = false;
      } else {
        const selDate = new Date(dateVal + 'T00:00:00');
        if (selDate.getDay() === 0) {
          setError(dateInput, dateError, 'The clinic is closed on Sundays, please choose another day.');
          isValid = false;
        } else {
          clearError(dateInput, dateError);
        }
      }

      // 5. Time Slot validation
      const slotVal = selectedSlotInput ? selectedSlotInput.value : '';
      if (!slotVal) {
        if (slotContainer) slotContainer.classList.add('has-error');
        if (slotError) {
          slotError.textContent = 'Please choose a preferred time slot.';
          slotError.classList.add('is-visible');
        }
        isValid = false;
      } else {
        if (slotContainer) slotContainer.classList.remove('has-error');
        if (slotError) slotError.classList.remove('is-visible');
      }

      if (!isValid) {
        showToast('Please complete all required fields.');
        return;
      }

      // Format Date for Summary
      const selectedDateObj = new Date(dateVal + 'T00:00:00');
      const formattedDate = selectedDateObj.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      // Update Summary Details
      const summaryName = document.getElementById('summaryPatientName');
      const summaryPhone = document.getElementById('summaryPatientPhone');
      const summaryService = document.getElementById('summaryService');
      const summaryDate = document.getElementById('summaryDate');
      const summaryTime = document.getElementById('summaryTime');

      if (summaryName) summaryName.textContent = nameVal;
      if (summaryPhone) summaryPhone.textContent = phoneVal;
      if (summaryService) summaryService.textContent = serviceVal;
      if (summaryDate) summaryDate.textContent = formattedDate;
      if (summaryTime) summaryTime.textContent = slotVal;

      // Set WhatsApp pre-filled confirmation link (Item 8)
      if (whatsappConfirmBtn) {
        const textMsg = encodeURIComponent(
          `Hello CareWell Clinic,\nI have booked an appointment with Dr. Anjali Deshmukh:\n` +
          `• Patient: ${nameVal}\n` +
          `• Phone: ${phoneVal}\n` +
          `• Service: ${serviceVal}\n` +
          `• Date: ${formattedDate}\n` +
          `• Time Slot: ${slotVal}\n` +
          `Please confirm my token.`
        );
        whatsappConfirmBtn.href = `https://wa.me/919876543210?text=${textMsg}`;
      }

      // Show confirmation card without page reload
      if (pageBookingFormView) pageBookingFormView.style.display = 'none';
      if (pageSuccessCard) {
        pageSuccessCard.classList.add('is-visible');
        pageSuccessCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      showToast('Appointment requested successfully!');
    });

    // Book another appointment button
    const bookAnotherBtn = document.getElementById('bookAnotherBtn');
    if (bookAnotherBtn) {
      bookAnotherBtn.addEventListener('click', () => {
        pageBookingForm.reset();
        slotButtons.forEach(b => b.classList.remove('is-selected'));
        if (selectedSlotInput) selectedSlotInput.value = '';
        if (slotContainer) slotContainer.style.display = 'none';
        if (pageSuccessCard) pageSuccessCard.classList.remove('is-visible');
        if (pageBookingFormView) pageBookingFormView.style.display = 'block';
      });
    }
  }

  // ==========================================================================
  // 8. Scroll Progress Bar & Back to Top Button
  // ==========================================================================
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const backToTopBtn = document.getElementById('backToTopBtn');

  const updateScrollProgressAndTopBtn = () => {
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    if (backToTopBtn) {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }
  };

  window.addEventListener('scroll', updateScrollProgressAndTopBtn, { passive: true });
  updateScrollProgressAndTopBtn();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================================================
  // 9. Smooth Anchor Link Scrolling & Mobile Drawer Auto-Close
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          toggleMobileMenu(false);
          targetElement.scrollIntoView({ behavior: 'smooth' });
          if (history.pushState) {
            history.pushState(null, '', targetId);
          }
        }
      }
    });
  });

  // ==========================================================================
  // 10. Scroll-Spy with IntersectionObserver
  // Highlights active nav link and updates URL hash without jumping
  // ==========================================================================
  const spySectionIds = ['home', 'services', 'about', 'contact', 'appointment'];
  const spySections = spySectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-menu .mobile-nav-link');
  const bookAppointmentNavBtn = document.querySelector('.header-actions .btn-primary');

  if (spySections.length > 0) {
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.id;
          
          // Update active class on nav links
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });

          // Highlight Book Appointment button if in appointment section
          if (bookAppointmentNavBtn) {
            if (currentId === 'appointment') {
              bookAppointmentNavBtn.classList.add('active');
            } else {
              bookAppointmentNavBtn.classList.remove('active');
            }
          }

          // Update URL hash without causing viewport jump
          if (window.location.hash !== `#${currentId}` && history.replaceState) {
            history.replaceState(null, '', `#${currentId}`);
          }
        }
      });
    };

    const spyObserver = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    spySections.forEach(section => spyObserver.observe(section));
  }

  // ==========================================================================
  // 11. FAQ Accordion Handler
  // ==========================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close other open FAQ items for clean accordion UX
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          const btn = other.querySelector('.faq-question-btn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('is-open', !isOpen);
      questionBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });
});

import api from "./axios";

function getMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.title ||
    error.message ||
    "Something went wrong"
  );
}

async function request(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (error) {
    console.log("Reception API Error:", error);
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    throw new Error(getMessage(error));
  }
}

export const receptionApi = {
  // Dashboard
  getDashboard() {
    return request(api.get("/api/Reception/dashboard"));
    },

    getDoctorSlots: (doctorId, date) =>
        api.get(`/api/Reception/doctors/${doctorId}/slots`, { params: { date } }).then(r => r.data),

  // Patients
  getPatients(search = "") {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return request(api.get(`/api/Reception/patients${query}`));
  },

  getPatient(id) {
    return request(api.get(`/api/Reception/patients/${id}`));
  },

  addPatient(payload) {
    return request(
      api.post("/api/Reception/patients", {
        fullName: payload.fullName?.trim(),
        phone: payload.phone?.trim(),
        email: payload.email?.trim(),
        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
      })
    );
  },

  // Doctors
  getAvailableDoctors() {
    return request(api.get("/api/Reception/doctors/available"));
  },

  // Appointments
  getAppointments(queryString = "") {
    const query = queryString ? `?${queryString}` : "";
    return request(api.get(`/api/Reception/appointments${query}`));
    },

    completeAppointment: (appointmentId) =>
        api.put(`/api/Reception/appointments/${appointmentId}/complete`).then(r => r.data),

    rescheduleAppointment: (appointmentId, payload) =>
        api.put(`/api/Reception/appointments/${appointmentId}/reschedule`, payload).then(r => r.data),

  bookAppointment(payload) {
    return request(
      api.post("/api/Reception/appointments", {
        patientId: Number(payload.patientId),
        doctorId: Number(payload.doctorId),
        appointmentDate: payload.appointmentDate,
        duration: payload.duration || "00:30:00",
        notes: payload.notes || null,
      })
    );
  },

  checkInAppointment(id) {
    return request(api.put(`/api/Reception/appointments/${id}/checkin`));
  },

  // Queue
  getQueue() {
    return request(api.get("/api/Reception/queue"));
  },

  // Payments
  getPayments(queryString = "") {
    const query = queryString ? `?${queryString}` : "";
    return request(api.get(`/api/Reception/payments${query}`));
  },

  getPayment(invoiceId) {
    return request(api.get(`/api/Reception/payments/${invoiceId}`));
  },

  createPaymentInvoice(payload) {
    return request(
      api.post("/api/Reception/payments", {
        patientId: Number(payload.patientId),
        appointmentId: payload.appointmentId ? Number(payload.appointmentId) : null,
        serviceName: payload.serviceName?.trim(),
        totalAmount: Number(payload.totalAmount),
        paidAmount: Number(payload.paidAmount || 0),
        notes: payload.notes || null,
      })
    );
  },

  markCashPayment(invoiceId, payload) {
    return request(
      api.post(`/api/Reception/payments/${invoiceId}/cash`, {
        amount: Number(payload.amount),
        method: payload.method,
        notes: payload.notes || null,
      })
    );
  },

  initiatePayment(invoiceId, payload) {
    return request(
      api.post(`/api/Reception/payments/${invoiceId}/pay`, {
        amount: Number(payload.amount),
        method: payload.method,
        notes: payload.notes || null,
      })
    );
  },
};
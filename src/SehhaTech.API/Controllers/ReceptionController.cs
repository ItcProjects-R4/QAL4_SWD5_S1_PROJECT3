using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SehhaTech.Infrastructure.Data;
using SehhaTech.Core.Models;

namespace SehhaTech.API.Controllers
{
    //[AllowAnonymous] ، // مؤقتًا للتجربة فقط بعدين هنرجعها
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReceptionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReceptionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public IActionResult GetDashboard()
        {
            return Ok(new
            {
                message = "Reception dashboard works"
            });
        }

        [HttpGet("patients")]
        public async Task<IActionResult> GetPatients()
        {
            var tenantId = (int)HttpContext.Items["TenantId"]!; 

            var patients = await _context.Patients
                .Where(p => p.TenantId == tenantId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.FullName,
                    p.Phone,
                    p.Email,
                    p.Gender,
                    p.DateOfBirth,
                    p.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                message = "Patients retrieved successfully",
                count = patients.Count,
                data = patients
            });
        }
        [HttpGet("patients/{id}")]
        public async Task<IActionResult> GetPatientById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid patient id"
                });
            }

            var tenantId = (int)HttpContext.Items["TenantId"]!; 

            var patient = await _context.Patients
                .Where(p => p.Id == id && p.TenantId == tenantId)
                .Select(p => new
                {
                    p.Id,
                    p.FullName,
                    p.Phone,
                    p.Email,
                    p.Gender,
                    p.DateOfBirth,
                    p.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (patient == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Patient not found"
                });
            }

            return Ok(new
            {
                success = true,
                message = "Patient retrieved successfully",
                data = patient
            });
        }
        [HttpPost("patients")]
        public async Task<IActionResult> AddPatient(CreatePatientRequest request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Request body is required"
                });
            }

            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Patient full name is required"
                });
            }

            if (request.FullName.Trim().Length < 3)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Patient full name must be at least 3 characters"
                });
            }

            if (string.IsNullOrWhiteSpace(request.Phone))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Patient phone is required"
                });
            }

            var phone = request.Phone.Trim();

            if (!phone.All(char.IsDigit))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Patient phone must contain digits only"
                });
            }

            if (phone.Length < 10 || phone.Length > 15)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Patient phone must be between 10 and 15 digits"
                });
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Patient email is required"
                });
            }

            var email = request.Email.Trim().ToLower();

            if (!email.Contains("@") || !email.Contains("."))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid email format"
                });
            }

            if (request.DateOfBirth == default)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Patient date of birth is required"
                });
            }

            if (request.DateOfBirth.Date >= DateTime.Today)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Date of birth must be in the past"
                });
            }

            if (request.DateOfBirth.Date < DateTime.Today.AddYears(-120))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid date of birth"
                });
            }

            if (string.IsNullOrWhiteSpace(request.Gender))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Patient gender is required"
                });
            }

            var gender = request.Gender.Trim();

            var allowedGenders = new[] { "Male", "Female" };

            if (!allowedGenders.Contains(gender, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Gender must be Male or Female"
                });
            }

            var tenantId = (int)HttpContext.Items["TenantId"]!; 

            var phoneExists = await _context.Patients
                .AnyAsync(p => p.TenantId == tenantId && p.Phone == phone);

            if (phoneExists)
            {
                return Conflict(new
                {
                    success = false,
                    message = "A patient with this phone number already exists"
                });
            }

            var emailExists = await _context.Patients
                .AnyAsync(p => p.TenantId == tenantId && p.Email == email);

            if (emailExists)
            {
                return Conflict(new
                {
                    success = false,
                    message = "A patient with this email already exists"
                });
            }

            var patient = new Patient
            {
                FullName = request.FullName.Trim(),
                Phone = phone,
                Email = email,
                DateOfBirth = request.DateOfBirth.Date,
                Gender = gender,
                TenantId = tenantId
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPatientById), new { id = patient.Id }, new
            {
                success = true,
                message = "Patient added successfully",
                data = new
                {
                    patient.Id,
                    patient.FullName,
                    patient.Phone,
                    patient.Email,
                    patient.Gender,
                    patient.DateOfBirth,
                    patient.CreatedAt
                }
            });
        }

        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments()
        {
            var tenantId = (int)HttpContext.Items["TenantId"]!; 

            var appointments = await _context.Appointments
                .Where(a => a.TenantId == tenantId)
                .OrderBy(a => a.AppointmentDate)
                .Select(a => new
                {
                    a.Id,
                    a.PatientId,
                    PatientName = a.Patient != null ? a.Patient.FullName : null,
                    a.DoctorId,
                    DoctorSpecialization = a.Doctor != null ? a.Doctor.Specialization : null,
                    a.AppointmentDate,
                    a.Duration,
                    Status = a.Status.ToString(),
                    a.Notes,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                message = "Appointments retrieved successfully",
                count = appointments.Count,
                data = appointments
            });
        }
        [HttpPost("appointments")]
        public async Task<IActionResult> BookAppointment(CreateAppointmentRequest request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Request body is required"
                });
            }

            if (request.PatientId <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Valid PatientId is required"
                });
            }

            if (request.DoctorId <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Valid DoctorId is required"
                });
            }

            if (request.AppointmentDate == default)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Appointment date is required"
                });
            }

            if (request.AppointmentDate <= DateTime.Now)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Appointment date must be in the future"
                });
            }

            if (request.Duration <= TimeSpan.Zero)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Appointment duration is required"
                });
            }

            if (request.Duration.TotalMinutes < 10 || request.Duration.TotalMinutes > 180)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Appointment duration must be between 10 and 180 minutes"
                });
            }

            var tenantId = (int)HttpContext.Items["TenantId"]!; 

            var patientExists = await _context.Patients
                .AnyAsync(p => p.Id == request.PatientId && p.TenantId == tenantId);

            if (!patientExists)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Patient not found"
                });
            }

            var doctorExists = await _context.Doctors
                .AnyAsync(d => d.Id == request.DoctorId && d.TenantId == tenantId && d.IsActive);

            if (!doctorExists)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Doctor not found or inactive"
                });
            }

            var appointmentStart = request.AppointmentDate;
            var appointmentEnd = request.AppointmentDate.Add(request.Duration);

            var hasConflict = await _context.Appointments
                .AnyAsync(a =>
                    a.TenantId == tenantId &&
                    a.DoctorId == request.DoctorId &&
                    a.Status != AppointmentStatus.Cancelled &&
                    appointmentStart < a.AppointmentDate.Add(a.Duration) &&
                    appointmentEnd > a.AppointmentDate);

            if (hasConflict)
            {
                return Conflict(new
                {
                    success = false,
                    message = "Doctor already has an appointment during this time"
                });
            }

            var appointment = new Appointment
            {
                TenantId = tenantId,
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                AppointmentDate = request.AppointmentDate,
                Duration = request.Duration,
                Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                Status = AppointmentStatus.Scheduled
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return StatusCode(201, new
            {
                success = true,
                message = "Appointment booked successfully",
                data = new
                {
                    appointment.Id,
                    appointment.PatientId,
                    appointment.DoctorId,
                    appointment.AppointmentDate,
                    appointment.Duration,
                    status = appointment.Status.ToString(),
                    appointment.Notes,
                    appointment.CreatedAt
                }
            });
        }
        [HttpPut("appointments/{id}/checkin")]
        public async Task<IActionResult> CheckInAppointment(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid appointment id"
                });
            }

            var tenantId = (int)HttpContext.Items["TenantId"]!; 

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId);

            if (appointment == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Appointment not found"
                });
            }

            if (appointment.Status == AppointmentStatus.Cancelled)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Cannot check in a cancelled appointment"
                });
            }

            if (appointment.Status == AppointmentStatus.Completed)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Cannot check in a completed appointment"
                });
            }

            if (appointment.Status == AppointmentStatus.Confirmed)
            {
                return Conflict(new
                {
                    success = false,
                    message = "Patient is already checked in"
                });
            }

            appointment.Status = AppointmentStatus.Confirmed;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Patient checked in successfully",
                data = new
                {
                    appointment.Id,
                    status = appointment.Status.ToString()
                }
            });
        }
        [HttpGet("queue")]
        public async Task<IActionResult> GetTodayQueue()
        {
            var tenantId = (int)HttpContext.Items["TenantId"]!;

            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            var queue = await _context.Appointments
                .Where(a =>
                    a.TenantId == tenantId &&
                    a.AppointmentDate >= today &&
                    a.AppointmentDate < tomorrow &&
                    a.Status != AppointmentStatus.Cancelled &&
                    a.Status != AppointmentStatus.Completed &&
                    a.Status != AppointmentStatus.NoShow)
                .OrderBy(a => a.AppointmentDate)
                .Select(a => new
                {
                    appointmentId = a.Id,

                    patient = new
                    {
                        id = a.PatientId,
                        fullName = a.Patient != null ? a.Patient.FullName : null,
                        phone = a.Patient != null ? a.Patient.Phone : null,
                        email = a.Patient != null ? a.Patient.Email : null
                    },

                    doctor = new
                    {
                        id = a.DoctorId,
                        specialization = a.Doctor != null ? a.Doctor.Specialization : null,
                        isActive = a.Doctor != null ? a.Doctor.IsActive : false
                    },

                    appointmentDate = a.AppointmentDate,
                    appointmentTime = a.AppointmentDate.ToString("HH:mm"),
                    duration = a.Duration,
                    status = a.Status.ToString(),
                    notes = a.Notes,
                    waitingMinutes = a.Status == AppointmentStatus.Confirmed
                        ? (int)Math.Max(0, (DateTime.Now - a.AppointmentDate).TotalMinutes)
                        : 0
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                message = queue.Any()
                    ? "Today queue retrieved successfully"
                    : "No patients in today's queue",
                date = today.ToString("yyyy-MM-dd"),
                count = queue.Count,
                data = queue
            });
        }

        [HttpGet("doctors/available")]
        public async Task<IActionResult> GetAvailableDoctors()
        {
            var tenantId = (int)HttpContext.Items["TenantId"]!; // Temporary for Swagger testing only

            var doctors = await _context.Doctors
                .Where(d => d.TenantId == tenantId && d.IsActive)
                .OrderBy(d => d.Specialization)
                .Select(d => new
                {
                    id = d.Id,
                    specialization = d.Specialization,
                    bio = d.Bio,
                    profileImageUrl = d.ProfileImageUrl,
                    isActive = d.IsActive,
                    user = d.User == null ? null : new
                    {
                        id = d.User.Id,
                        fullName = d.User.FullName,
                        email = d.User.Email,
                        profileImageUrl = d.User.ProfileImageUrl
                    }
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                message = doctors.Any()
                    ? "Available doctors retrieved successfully"
                    : "No available doctors found",
                count = doctors.Count,
                data = doctors
            });
        }


        //[HttpPost("test-doctor")]
        //public async Task<IActionResult> AddTestDoctor()
        //{
        //    var user = await _context.Users.FirstOrDefaultAsync();

        //    if (user == null)
        //    {
        //        return BadRequest(new
        //        {
        //            message = "No user found. Please register a user first."
        //        });
        //    }

        //    var doctor = new Doctor
        //    {
        //        TenantId = user.TenantId ?? 1,
        //        UserId = user.Id,
        //        Specialization = "General Medicine",
        //        Bio = "Test doctor",
        //        IsActive = true
        //    };

        //    _context.Doctors.Add(doctor);
        //    await _context.SaveChangesAsync();

        //    return Ok(new
        //    {
        //        message = "Test doctor added successfully",
        //        doctorId = doctor.Id,
        //        userId = user.Id,
        //        tenantId = doctor.TenantId
        //    });
        //}
   
    }


    public class CreatePatientRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
    }
    public class CreateAppointmentRequest
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan Duration { get; set; }
        public string? Notes { get; set; }
    }
}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SehhaTech.Core.DTOs.Portal;
using SehhaTech.Infrastructure.Services.Portal;

namespace SehhaTech.PatientPortal.API.Controllers;

[ApiController]
[Route("api/portal/bookings")]
public class BookingController : ControllerBase
{
    private readonly BookingService _bookingService;

    public BookingController(BookingService bookingService)
    {
        _bookingService = bookingService;
    }

    // POST /api/portal/bookings
    [HttpPost]
    [AllowAnonymous] // مؤقت - هيتغير لـ [Authorize] وقت الـ integration
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        // مؤقت - هيتغير لـ User.FindFirst("sub") وقت الـ integration
        var portalUserId = 1;

        var (success, message, data) = await _bookingService.BookSlotAsync(request, portalUserId);

        if (!success)
            return BadRequest(new { message });

        return Ok(new { message, data });
    }

    // GET /api/portal/bookings
    [HttpGet]
    [AllowAnonymous] // مؤقت
    public async Task<IActionResult> GetMyBookings()
    {
        // مؤقت
        var portalUserId = 1;

        var bookings = await _bookingService.GetMyBookingsAsync(portalUserId);
        return Ok(bookings);
    }

    // GET /api/portal/bookings/{id}
    [HttpGet("{id}")]
    [AllowAnonymous] // مؤقت
    public async Task<IActionResult> GetBookingById(int id)
    {
        // مؤقت
        var portalUserId = 1;

        var booking = await _bookingService.GetBookingByIdAsync(id, portalUserId);

        if (booking == null)
            return NotFound(new { message = "Booking not found." });

        return Ok(booking);
    }

    // PUT /api/portal/bookings/{id}/cancel
    [HttpPut("{id}/cancel")]
    [AllowAnonymous] // مؤقت
    public async Task<IActionResult> CancelBooking(
        int id, [FromBody] CancelBookingRequest request)
    {
        // مؤقت
        var portalUserId = 1;

        var (success, message) = await _bookingService.CancelBookingAsync(
            id, portalUserId, request.CancellationReason);

        if (!success)
            return BadRequest(new { message });

        return Ok(new { message });
    }
}
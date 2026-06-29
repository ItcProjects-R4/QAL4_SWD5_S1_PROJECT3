using Microsoft.AspNetCore.Mvc;

namespace SehhaTech.PatientPortal.API.Controllers
{
    [Route("errors/{code:int}")]
    [ApiController]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class ErrorsController : ControllerBase
    {
        public IActionResult Error(int code)
        {
            return code switch
            {
                StatusCodes.Status401Unauthorized => Unauthorized(new
                {
                    statusCode = 401,
                    message = "Unauthorized: Authentication is required or has failed."
                }),

                StatusCodes.Status403Forbidden => StatusCode(StatusCodes.Status403Forbidden, new
                {
                    statusCode = 403,
                    message = "Forbidden: You do not have permission to access this resource."
                }),

                _ => NotFound(new
                {
                    statusCode = 404,
                    message = "The requested endpoint or resource was not found."
                }),
            };
        }
    }
}

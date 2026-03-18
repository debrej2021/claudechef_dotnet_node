using Microsoft.AspNetCore.Mvc;

namespace ClaudeChef.Api.Features.Health;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new HealthResponse
    {
        Status = "ok",
        Environment = System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
        Timestamp = DateTime.UtcNow.ToString("o")
    });
}

using Microsoft.AspNetCore.Mvc;

namespace ClaudeChef.Api.Features.AiHealth;

[ApiController]
[Route("api/ai")]
public class AiHealthController(AiHealthHandler handler) : ControllerBase
{
    [HttpGet("health")]
    public IActionResult GetHealth() => Ok(handler.Handle());
}

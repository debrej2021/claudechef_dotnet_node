using Microsoft.AspNetCore.Mvc;

namespace ClaudeChef.Api.Features.GenerateRecipe;

[ApiController]
[Route("api/ai")]
public class GenerateRecipeController(
    GenerateRecipeHandler handler,
    GenerateRecipeValidator validator,
    ILogger<GenerateRecipeController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] GenerateRecipeRequest request, CancellationToken ct)
    {
        var (isValid, errorMessage) = validator.Validate(request);
        if (!isValid)
            return BadRequest(new { success = false, error = errorMessage });

        try
        {
            var response = await handler.HandleAsync(request, ct);
            return Ok(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled error generating recipe");
            return StatusCode(500, new { success = false, error = "Failed to generate recipe. Please try again." });
        }
    }
}

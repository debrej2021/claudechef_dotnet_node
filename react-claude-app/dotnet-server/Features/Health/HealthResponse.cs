namespace ClaudeChef.Api.Features.Health;

public class HealthResponse
{
    public string Status { get; init; } = "ok";
    public string Environment { get; init; } = "";
    public string Timestamp { get; init; } = "";
}

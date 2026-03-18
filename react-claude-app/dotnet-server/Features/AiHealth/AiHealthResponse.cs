using ClaudeChef.Api.Domain.Models;

namespace ClaudeChef.Api.Features.AiHealth;

public class AiHealthResponse
{
    public bool Success { get; init; }
    public AiProviderStatus? Data { get; init; }
}

using ClaudeChef.Api.Domain.Interfaces;

namespace ClaudeChef.Api.Features.AiHealth;

public class AiHealthHandler(IAiOrchestrator orchestrator)
{
    public AiHealthResponse Handle() => new()
    {
        Success = true,
        Data = orchestrator.GetStatus()
    };
}

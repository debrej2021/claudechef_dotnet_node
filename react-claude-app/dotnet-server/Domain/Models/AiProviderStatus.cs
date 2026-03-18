namespace ClaudeChef.Api.Domain.Models;

public record AiProviderStatus(
    string CurrentProvider,
    bool IsConfigured,
    string[] AvailableProviders,
    bool OpenAiConfigured,
    bool ClaudeConfigured,
    string Status);

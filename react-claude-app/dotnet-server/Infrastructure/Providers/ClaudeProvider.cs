using System.Text;
using System.Text.Json;
using ClaudeChef.Api.Configuration;
using ClaudeChef.Api.Domain.Interfaces;
using Microsoft.Extensions.Options;

namespace ClaudeChef.Api.Infrastructure.Providers;

public class ClaudeProvider(
    IHttpClientFactory httpClientFactory,
    IConfiguration config,
    IOptions<AiOptions> options,
    ILogger<ClaudeProvider> logger) : IAiProvider
{
    private const string ApiUrl = "https://api.anthropic.com/v1/messages";
    private const string AnthropicVersion = "2023-06-01";

    public string ProviderKey => "claude";
    public string ModelName => "claude-sonnet-4-6";
    public bool IsConfigured => !string.IsNullOrEmpty(config["CLAUDE_API_KEY"]);

    public async Task<(string recipe, int tokensUsed)> GenerateRecipeAsync(List<string> ingredients, CancellationToken ct)
    {
        var apiKey = config["CLAUDE_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
            throw new InvalidOperationException("Claude API key is not configured. Please set CLAUDE_API_KEY.");

        var timeoutSeconds = options.Value.TimeoutSeconds;
        logger.LogInformation("[Claude] Making request with {Timeout}s timeout...", timeoutSeconds);

        var requestBody = new
        {
            model = ModelName,
            max_tokens = 500,
            messages = new[] { new { role = "user", content = BuildPrompt(ingredients) } }
        };

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("x-api-key", apiKey);
        client.DefaultRequestHeaders.Add("anthropic-version", AnthropicVersion);

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        HttpResponseMessage response;
        try
        {
            response = await client.PostAsync(ApiUrl, content, cts.Token);
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            throw new TimeoutException($"Claude API request timed out after {timeoutSeconds}s");
        }

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogWarning("[Claude] API error {Status}: {Body}", (int)response.StatusCode, errorBody);
            throw (int)response.StatusCode switch
            {
                401 => new InvalidOperationException("Invalid Claude API key"),
                429 => new InvalidOperationException("Claude rate limit exceeded. Please try again later."),
                529 => new InvalidOperationException("Claude service currently overloaded."),
                404 => new InvalidOperationException($"Model not found: {ModelName}"),
                _ => new InvalidOperationException($"Claude API error {(int)response.StatusCode}: {response.ReasonPhrase}")
            };
        }

        var responseJson = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(responseJson);
        var root = doc.RootElement;

        var recipeText = root.GetProperty("content")[0].GetProperty("text").GetString() ?? "";
        ValidateQuality(recipeText);

        var usage = root.GetProperty("usage");
        var tokensUsed = usage.GetProperty("input_tokens").GetInt32() + usage.GetProperty("output_tokens").GetInt32();
        logger.LogInformation("[Claude] Recipe validated: {Len} chars, {Tokens} tokens", recipeText.Length, tokensUsed);

        return (recipeText, tokensUsed);
    }

    private static string BuildPrompt(List<string> ingredients) => $"""
        You are Chef Claude, a friendly cooking assistant.

        Create a concise recipe using the following ingredients:
        {string.Join(", ", ingredients)}

        Guidelines:
        - Prefer using only the listed ingredients
        - Additional ingredients should be OPTIONAL
        - Keep the recipe under 10 steps
        - Be creative but practical

        Format using markdown:

        ### Ingredients
        ### Instructions
        """;

    private static void ValidateQuality(string text)
    {
        if (text.Length < 100)
            throw new InvalidOperationException("Response too short to be a valid recipe");

        var lower = text.ToLower();
        if (!lower.Contains("ingredients") || (!lower.Contains("instructions") && !lower.Contains("steps")))
            throw new InvalidOperationException("Response missing required recipe sections");

        var errorPhrases = new[] { "error", "failed", "unable", "cannot", "sorry, i" };
        if (errorPhrases.Any(p => lower.TrimStart().StartsWith(p)))
            throw new InvalidOperationException("Response appears to be an error message");
    }
}

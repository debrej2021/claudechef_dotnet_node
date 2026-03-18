using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ClaudeChef.Api.Configuration;
using ClaudeChef.Api.Domain.Interfaces;
using Microsoft.Extensions.Options;

namespace ClaudeChef.Api.Infrastructure.Providers;

public class OpenAiProvider(
    IHttpClientFactory httpClientFactory,
    IConfiguration config,
    IOptions<AiOptions> options,
    ILogger<OpenAiProvider> logger) : IAiProvider
{
    private const string ApiUrl = "https://api.openai.com/v1/chat/completions";

    public string ProviderKey => "openai";
    public string ModelName => "gpt-4o-mini";
    public bool IsConfigured => !string.IsNullOrEmpty(config["OPENAI_API_KEY"]);

    public async Task<(string recipe, int tokensUsed)> GenerateRecipeAsync(List<string> ingredients, CancellationToken ct)
    {
        var apiKey = config["OPENAI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
            throw new InvalidOperationException("OpenAI API key is not configured. Please set OPENAI_API_KEY.");

        var timeoutSeconds = options.Value.TimeoutSeconds;
        logger.LogInformation("[OpenAI] Making request with {Timeout}s timeout...", timeoutSeconds);

        var requestBody = new
        {
            model = ModelName,
            messages = new[] { new { role = "user", content = BuildPrompt(ingredients) } },
            max_tokens = 500,
            temperature = 0.7
        };

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        HttpResponseMessage response;
        try
        {
            response = await client.PostAsync(ApiUrl, content, cts.Token);
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            throw new TimeoutException($"OpenAI API request timed out after {timeoutSeconds}s");
        }

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogWarning("[OpenAI] API error {Status}: {Body}", (int)response.StatusCode, errorBody);
            throw (int)response.StatusCode switch
            {
                401 => new InvalidOperationException("Invalid OpenAI API key"),
                429 => new InvalidOperationException("OpenAI rate limit exceeded. Please try again later."),
                503 => new InvalidOperationException("OpenAI service currently unavailable."),
                _ => new InvalidOperationException($"OpenAI API error {(int)response.StatusCode}: {response.ReasonPhrase}")
            };
        }

        var responseJson = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(responseJson);
        var root = doc.RootElement;

        var recipeText = root.GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "";

        ValidateQuality(recipeText);

        var tokensUsed = root.GetProperty("usage").GetProperty("total_tokens").GetInt32();
        logger.LogInformation("[OpenAI] Recipe validated: {Len} chars, {Tokens} tokens", recipeText.Length, tokensUsed);

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

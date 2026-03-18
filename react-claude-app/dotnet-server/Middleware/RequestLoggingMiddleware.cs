using System.Diagnostics;
using System.Text.Json;

namespace ClaudeChef.Api.Middleware;

public class RequestLoggingMiddleware(ILogger<RequestLoggingMiddleware> logger) : IMiddleware
{
    private const int MaxBodyLength = 4096;

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var sw = Stopwatch.StartNew();
        var method = context.Request.Method;
        var path = context.Request.Path + context.Request.QueryString;

        // Swap response stream with a buffer so we can capture the body
        var originalBody = context.Response.Body;
        using var buffer = new MemoryStream();
        context.Response.Body = buffer;

        try
        {
            await next(context);
        }
        finally
        {
            sw.Stop();

            buffer.Position = 0;
            var rawBody = await new StreamReader(buffer).ReadToEndAsync();
            var responseBody = rawBody.Length > MaxBodyLength
                ? rawBody[..MaxBodyLength] + " ... [truncated]"
                : rawBody;

            var headers = context.Response.Headers
                .ToDictionary(h => h.Key, h => h.Value.ToString());

            logger.LogInformation(
                "API | {Method} {Path} | {StatusCode} | {ElapsedMs}ms | Headers: {Headers} | Body: {Body}",
                method,
                path,
                context.Response.StatusCode,
                sw.ElapsedMilliseconds,
                JsonSerializer.Serialize(headers),
                responseBody);

            // Copy buffered response back to the real stream
            buffer.Position = 0;
            await buffer.CopyToAsync(originalBody);
            context.Response.Body = originalBody;
        }
    }
}

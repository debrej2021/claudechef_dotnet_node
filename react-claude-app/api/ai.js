export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { ingredients } = req.body

  const prompt = `
You are Chef Claude, a friendly cooking assistant.

Create a concise recipe using the following ingredients:
${ingredients.join(", ")}

Guidelines:
- Prefer using only the listed ingredients
- Additional ingredients should be OPTIONAL
- Keep the recipe under 10 steps

Format using markdown:

### Ingredients
### Instructions
`

  try {

    const gptCall = fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300
      })
    })

    const claudeCall = fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    })

    const [gptRes, claudeRes] = await Promise.allSettled([
      gptCall,
      claudeCall
    ])

    let responses = []

    if (gptRes.status === "fulfilled") {
      const data = await gptRes.value.json()
      responses.push({
        model: "gpt",
        text: data.choices?.[0]?.message?.content
      })
    }

    if (claudeRes.status === "fulfilled") {
      const data = await claudeRes.value.json()
      responses.push({
        model: "claude",
        text: data.content?.[0]?.text
      })
    }

    res.status(200).json({
      answers: responses
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: "AI orchestration failed"
    })
  }
}
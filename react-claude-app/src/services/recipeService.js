export async function getRecipeFromAI(ingredients) {

    try {

        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                input: `
You are Chef Claude, a friendly cooking assistant.

Create a concise recipe using the following ingredients:
${ingredients.join(", ")}

Guidelines:
- Prefer using only the listed ingredients
- Additional ingredients should be OPTIONAL
- Keep the recipe under 10 steps
- Format using markdown sections:

### Ingredients
### Instructions
`
            })
        })

        const data = await response.json()

        console.log("AI response:", data)

        return data.output[0].content[0].text

    } catch (error) {

        console.error("AI API error:", error)

        return "Sorry, Chef Claude is having trouble generating a recipe right now."

    }
}
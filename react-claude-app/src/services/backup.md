export async function getRecipeFromAI(ingredients) {

  const prompt = `
Create a recipe using these ingredients:
${ingredients.join(", ")}

Return:
Ingredients list
Cooking steps
Keep under 10 steps.
`

  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  })

  const data = await response.json()

  // pick best answer
  if (data.answers && data.answers.length > 0) {
    return data.answers[0].text
  }

  return "Recipe generation failed."
}
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



// If both models responded, ask GPT to judge
if (responses.length === 2) {

  const judgePrompt = `
You are an expert cooking judge.

Two AI models generated recipes.

Recipe A:
${responses[0].text}

Recipe B:
${responses[1].text}

Evaluate which recipe is:
- clearer
- more realistic
- easier to follow

Respond ONLY with:
A
or
B
`

  const judgeRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: judgePrompt }],
      max_tokens: 10
    })
  })

  const judgeData = await judgeRes.json()
  const verdict = judgeData.choices?.[0]?.message?.content?.trim()

  const best =
    verdict === "B"
      ? responses[1].text
      : responses[0].text

  return res.status(200).json({
    bestRecipe: best,
    allResponses: responses
  })
}

// fallback if only one model worked
return res.status(200).json({
  bestRecipe: responses[0]?.text || "No recipe generated",
  allResponses: responses
})
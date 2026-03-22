const BASE_URL = "https://petcareback-ketp.onrender.com"

export const donateToCampaign = async (campaignId, data) => {
  const response = await fetch(`${BASE_URL}/campaigns/${campaignId}/donate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Error creating donation")
  }

  return response.json()
}
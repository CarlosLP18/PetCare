const BASE_URL = "https://petcareback-ketp.onrender.com"

export const getCampaigns = async () => {
  const response = await fetch(`${BASE_URL}/campaigns`)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Error fetching campaigns")
  }

  return response.json()
}

export const createCampaign = async (data) => {
  const response = await fetch(`${BASE_URL}/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Error creating Campaign")
  }

  return response.json()
}

export const getCampaingsbyId = async (id) => {
  const response = await fetch(`${BASE_URL}/campaigns/${id}`)
  if (!response) throw new Error("Error to get Campaign nro {{id}} ")
  return response.json()
}

export const getCampaignAIReview = async (campaignId) => {
  const response = await fetch(`${BASE_URL}/campaigns/${campaignId}/ai-review`)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Error fetching AI review")
  }

  return response.json()
}

export const donateToCampaign = async (id, data) => {
  const response = await fetch(`${BASE_URL}/campaigns/${id}/donate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Error fetching AI review")
  }

  return response.json()
}
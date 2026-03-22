import { useState } from "react"
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  VStack,
  Badge,
  Progress,
  Textarea,
} from "@chakra-ui/react"
import { donateToCampaign } from "../api/campaigns"

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )
}

const presetAmounts = [10, 25, 50, 100, 250]

const speciesLabels = {
  dog: "Dog",
  cat: "Cat",
  bird: "Bird",
  rabbit: "Rabbit",
  reptile: "Reptile",
  other: "Other",
}

export default function DonationModal({
  campaign,
  isOpen,
  onClose,
  onDonationSuccess,
}) {
  const [selectedAmount, setSelectedAmount] = useState(25)
  const [customAmount, setCustomAmount] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [message, setMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [donated, setDonated] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen || !campaign) return null

  const goalAmount = Number(campaign.goal_amount) || 0
  const raisedAmount = Number(campaign.total_raised || 0)
  const progress = goalAmount > 0 ? (raisedAmount / goalAmount) * 100 : 0
  const finalAmount = isCustom ? Number(customAmount) || 0 : selectedAmount

  const resetModalState = () => {
    setSelectedAmount(25)
    setCustomAmount("")
    setIsCustom(false)
    setMessage("")
    setIsAnonymous(false)
    setLoading(false)
    setDonated(false)
    setError("")
  }

  const handleClose = () => {
    resetModalState()
    onClose?.()
  }

  const handleDonate = async () => {
    if (finalAmount < 1) {
      setError("The minimum donation amount is $1.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const payload = {
        amount: finalAmount,
        message: message.trim() || null,
        is_anonymous: isAnonymous,
      }

      const response = await donateToCampaign(campaign.id, payload)

      console.log("Donation created:", response)

      setDonated(true)
      onDonationSuccess?.()
    } catch (err) {
      console.error(err)
      setError(err.message || "Error processing donation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      position="fixed"
      inset="0"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="1000"
      p={4}
      onClick={handleClose}
    >
      <Box
        bg="white"
        borderRadius="2xl"
        maxW="500px"
        w="full"
        maxH="90vh"
        overflow="auto"
        onClick={(e) => e.stopPropagation()}
      >
        {donated ? (
          <VStack p={8} gap={4} textAlign="center">
            <Box color="teal.500">
              <CheckIcon />
            </Box>

            <Heading size="lg" color="gray.800">
              Thank You!
            </Heading>

            <Text color="gray.600">
              Your donation of ${finalAmount} was successfully registered for{" "}
              {campaign.pet_name}.
            </Text>

            <Button colorPalette="teal" onClick={handleClose} mt={4}>
              Close
            </Button>
          </VStack>
        ) : (
          <>
            <Box position="relative">
              <Image
                src={campaign.images?.[0] || "/placeholder-pet.jpg"}
                alt={campaign.pet_name || "Pet campaign"}
                h="180px"
                w="full"
                objectFit="cover"
              />
            </Box>

            <VStack p={6} gap={5} align="stretch">
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading size="md" color="gray.800">
                    Help {campaign.pet_name || "this pet"}
                  </Heading>
                  <Badge colorPalette="teal">
                    {speciesLabels[campaign.pet_species] ||
                      campaign.pet_species ||
                      "Other"}
                  </Badge>
                </Flex>

                <Text fontSize="sm" color="gray.600">
                  {campaign.title}
                </Text>
              </Box>

              <Box>
                <Flex justify="space-between" mb={2} fontSize="sm">
                  <Text fontWeight="bold" color="teal.600">
                    ${raisedAmount.toLocaleString("en-US")} raised
                  </Text>
                  <Text color="gray.500">
                    ${goalAmount.toLocaleString("en-US")} goal
                  </Text>
                </Flex>

                <Progress.Root
                  value={progress}
                  size="sm"
                  colorPalette="teal"
                  borderRadius="full"
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={3} color="gray.700">
                  Select donation amount
                </Text>

                <Flex flexWrap="wrap" gap={2}>
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={
                        !isCustom && selectedAmount === amount ? "solid" : "outline"
                      }
                      colorPalette="teal"
                      size="sm"
                      onClick={() => {
                        setSelectedAmount(amount)
                        setIsCustom(false)
                      }}
                    >
                      ${amount}
                    </Button>
                  ))}

                  <Button
                    variant={isCustom ? "solid" : "outline"}
                    colorPalette="teal"
                    size="sm"
                    onClick={() => setIsCustom(true)}
                  >
                    Custom
                  </Button>
                </Flex>
              </Box>

              {isCustom && (
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Enter custom amount
                  </Text>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="1"
                    step="0.01"
                  />
                </Box>
              )}

              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Optional message
                </Text>
                <Textarea
                  placeholder="Write a support message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Box>

              <Box>
                <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <Text fontSize="sm" color="gray.700">
                    Donate anonymously
                  </Text>
                </label>
              </Box>

              {error && (
                <Box
                  bg="red.50"
                  borderWidth="1px"
                  borderColor="red.200"
                  p={3}
                  borderRadius="lg"
                >
                  <Text fontSize="sm" color="red.600">
                    {error}
                  </Text>
                </Box>
              )}

              <Box bg="teal.50" p={4} borderRadius="lg">
                <Text fontSize="sm" color="teal.800">
                  Your ${finalAmount} donation will help cover this pet&apos;s
                  treatment and medical care.
                </Text>
              </Box>

              <Button
                colorPalette="teal"
                size="lg"
                w="full"
                onClick={handleDonate}
                disabled={loading || finalAmount <= 0}
              >
                <HeartIcon />
                <Text ml={2}>
                  {loading ? "Processing..." : `Donate $${finalAmount}`}
                </Text>
              </Button>
            </VStack>
          </>
        )}
      </Box>
    </Box>
  )
}
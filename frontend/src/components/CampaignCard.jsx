import { Box, Image, Text, Button, Flex, VStack, Badge, Progress } from "@chakra-ui/react"

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
  )
}

const speciesLabels = {
  dog: "Dog",
  cat: "Cat",
  bird: "Bird",
  bunny: "Bunny",
  reptile: "Reptile",
  other: "Other",
}

const calculateDaysLeft = (deadline) => {
  if (!deadline) return 0

  const today = new Date()
  const endDate = new Date(deadline)

  today.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)

  const diffTime = endDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

export default function CampaignCard({ campaign, onDonate }) {
  const goalAmount = Number(campaign.goal_amount) || 0
  const raisedAmount = Number(campaign.raised_amount) || 0
  const progress = goalAmount > 0 ? (raisedAmount / goalAmount) * 100 : 0
  const daysLeft = calculateDaysLeft(campaign.deadline)

  return (
    <Box
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="md"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
    >
      <Box position="relative">
        <Image
          src={campaign.images || "/placeholder-pet.jpg"}
          alt={campaign.pet_name || "Pet campaign"}
          h="200px"
          w="full"
          objectFit="cover"
        />

        {campaign.diagnosis && (
          <Badge
            position="absolute"
            top={3}
            right={3}
            colorPalette="red"
            variant="solid"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            Medical Case
          </Badge>
        )}
      </Box>

      <VStack p={5} align="stretch" gap={4}>
        <Box>
          <Flex justify="space-between" align="center" mb={1} gap={2}>
            <Text fontWeight="bold" fontSize="lg" color="gray.800">
              {campaign.pet_name || "Unnamed pet"}
            </Text>

            <Badge colorPalette="teal" variant="subtle">
              {speciesLabels[campaign.pet_species] || campaign.pet_species || "Other"}
            </Badge>
          </Flex>

          {campaign.pet_breed && (
            <Text color="gray.500" fontSize="sm">
              Breed: {campaign.pet_breed}
            </Text>
          )}

          {campaign.pet_age_years && (
            <Text color="gray.500" fontSize="sm">
              Age: {campaign.pet_age_years} years
            </Text>
          )}
        </Box>

        <Text fontSize="md" fontWeight="semibold" color="gray.700" lineClamp={2}>
          {campaign.title}
        </Text>

        <Text fontSize="sm" color="gray.600" lineClamp={3}>
          {campaign.story}
        </Text>

        {campaign.diagnosis && (
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1}>
              Diagnosis
            </Text>
            <Text fontSize="sm" color="gray.700" fontWeight="medium">
              {campaign.diagnosis}
            </Text>
          </Box>
        )}

        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold" color="teal.600">
              ${raisedAmount.toLocaleString("en-US")}
            </Text>
            <Text color="gray.500" fontSize="sm">
              of ${goalAmount.toLocaleString("en-US")}
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

        <Flex justify="space-between" fontSize="sm" color="gray.500" wrap="wrap" gap={2}>
          <Flex align="center" gap={1}>
            <ClockIcon />
            <Text>{daysLeft} days left</Text>
          </Flex>

          {campaign.vet_name && (
            <Text>Vet: {campaign.vet_name}</Text>
          )}
        </Flex>

        {campaign.vet_clinic && (
          <Text fontSize="sm" color="gray.500">
            Clinic: {campaign.vet_clinic}
          </Text>
        )}

        {campaign.medical_documents && (
          <Text fontSize="xs" color="gray.500">
            Medical documents attached
          </Text>
        )}

        <Button
          colorPalette="teal"
          w="full"
          onClick={() => onDonate?.(campaign)}
        >
          Donate Now
        </Button>
      </VStack>
    </Box>
  )
}
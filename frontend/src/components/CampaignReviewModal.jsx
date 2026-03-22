import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Spinner,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react"

const getDecisionColor = (decision) => {
  const normalized = String(decision || "").toLowerCase()

  if (normalized.includes("approve")) return "green"
  if (normalized.includes("reject")) return "red"
  if (normalized.includes("review")) return "orange"
  return "gray"
}

export default function CampaignReviewModal({
  isOpen,
  onClose,
  campaign,
  loading,
  reviewResult,
  error,
}) {
  if (!isOpen) return null

  const decisionColor = getDecisionColor(reviewResult?.final_decision)

  return (
    <Box
      position="fixed"
      inset="0"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="1400"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="2xl"
        w="full"
        maxW="700px"
        p={6}
        boxShadow="xl"
        maxH="90vh"
        overflowY="auto"
      >
        <VStack align="stretch" gap={5}>
          <Heading size="md">AI Campaign Review</Heading>

          <Text color="gray.600">
            Campaign: <strong>{campaign?.title || "New campaign"}</strong>
          </Text>

          {loading && (
            <VStack py={6} gap={3}>
              <Spinner size="lg" color="teal.500" />
              <Text color="gray.700">
                The AI agents are reviewing your campaign...
              </Text>
            </VStack>
          )}

          {!loading && error && (
            <Box>
              <Text color="red.600" fontWeight="bold" mb={2}>
                Review failed
              </Text>
              <Text color="gray.700">{error}</Text>
            </Box>
          )}

          {!loading && !error && reviewResult && (
            <>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Box p={4} borderWidth="1px" borderRadius="lg">
                  <Text fontSize="sm" color="gray.500">Score</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                    {reviewResult.score ?? "-"}
                  </Text>
                </Box>

                <Box p={4} borderWidth="1px" borderRadius="lg">
                  <Text fontSize="sm" color="gray.500">Flag</Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {reviewResult.flag || "-"}
                  </Text>
                </Box>

                <Box p={4} borderWidth="1px" borderRadius="lg">
                  <Text fontSize="sm" color="gray.500">Final Decision</Text>
                  <Badge colorPalette={decisionColor} fontSize="sm" px={2} py={1}>
                    {reviewResult.final_decision || "No decision"}
                  </Badge>
                </Box>
              </SimpleGrid>

              <Box p={4} borderWidth="1px" borderRadius="lg">
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Summary
                </Text>
                <Text color="gray.700">
                  {reviewResult.summary || "No summary provided."}
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Box p={4} borderWidth="1px" borderRadius="lg">
                  <Text fontSize="sm" color="gray.500">Welfare Vote</Text>
                  <Text fontWeight="bold">{reviewResult.welfare_vote || "-"}</Text>
                </Box>

                <Box p={4} borderWidth="1px" borderRadius="lg">
                  <Text fontSize="sm" color="gray.500">Finance Vote</Text>
                  <Text fontWeight="bold">{reviewResult.finance_vote || "-"}</Text>
                </Box>

                <Box p={4} borderWidth="1px" borderRadius="lg">
                  <Text fontSize="sm" color="gray.500">Fraud Vote</Text>
                  <Text fontWeight="bold">{reviewResult.fraud_vote || "-"}</Text>
                </Box>
              </SimpleGrid>

              <Box p={4} borderWidth="1px" borderRadius="lg">
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Decision Reason
                </Text>
                <Text color="gray.700">
                  {reviewResult.decision_reason || "No reason provided."}
                </Text>
              </Box>
            </>
          )}

          <Button colorPalette="teal" alignSelf="flex-end" onClick={onClose}>
            Close
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}
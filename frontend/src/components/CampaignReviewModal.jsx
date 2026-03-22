import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Spinner,
  Badge,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react"

const flagLabels = {
  vet_clinic_unverified: "Veterinary clinic could not be verified",
  medical_docs_missing: "Medical documents are missing",
  suspicious_goal_amount: "Requested goal amount looks unusual",
  inconsistent_story: "Story has inconsistencies",
  duplicate_campaign_signal: "Possible duplicate campaign detected",
}

const getVoteLabel = (vote) => {
  if (vote === "approve") return "Approved"
  if (vote === "reject") return "Rejected"
  return "Pending"
}

const getVoteColor = (vote) => {
  if (vote === "approve") return "green"
  if (vote === "reject") return "red"
  return "gray"
}

const getFinalDecision = (reviewResult) => {
  if (!reviewResult) return null
  if (reviewResult.fraud_vote === "reject") return "reject"
  return reviewResult.final_decision
}

const getDecisionColor = (decision) => {
  if (decision === "approve") return "green"
  if (decision === "reject") return "red"
  return "gray"
}

export default function CampaignReviewModal({
  isOpen,
  onClose,
  campaign,
  loading,
  reviewResult,
  error,
  timedOut,
}) {
  if (!isOpen) return null

  const flags = reviewResult?.flags || []
  const finalDecision = getFinalDecision(reviewResult)
  const decisionColor = getDecisionColor(finalDecision)
  const scorePercent =
    typeof reviewResult?.score === "number"
      ? Math.round(reviewResult.score * 100)
      : null

  const isProcessing =
    !error &&
    !timedOut &&
    (loading || !reviewResult || reviewResult.final_decision === null)

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
        maxW="720px"
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

          {isProcessing && (
            <VStack py={6} gap={3}>
              <Spinner size="lg" color="teal.500" />
              <Text color="gray.700">
                The AI agents are still processing this campaign...
              </Text>
            </VStack>
          )}

          {!loading && timedOut && !error && (
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              borderColor="orange.200"
              bg="orange.50"
            >
              <Text color="orange.700" fontWeight="bold" mb={2}>
                Review still processing
              </Text>
              <Text color="gray.700">
                The AI agents did not return a final decision in time. Please
                check again later.
              </Text>
            </Box>
          )}

          {!isProcessing && error && (
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              borderColor="red.200"
              bg="red.50"
            >
              <Text color="red.600" fontWeight="bold" mb={2}>
                Review failed
              </Text>
              <Text color="gray.700">{error}</Text>
            </Box>
          )}

          {!isProcessing && !error && !timedOut && reviewResult && (
            <>
              <Box p={4} borderWidth="1px" borderRadius="lg">
                <Heading size="sm" mb={2}>
                  AI Analysis — Score: {scorePercent ?? "-"}%
                </Heading>

                {flags.length > 0 ? (
                  <Flex gap={2} wrap="wrap" mt={2}>
                    {flags.map((flag) => (
                      <Badge
                        key={flag}
                        colorPalette="orange"
                        variant="subtle"
                        px={2}
                        py={1}
                      >
                        {flagLabels[flag] || flag}
                      </Badge>
                    ))}
                  </Flex>
                ) : (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    No warning flags detected.
                  </Text>
                )}
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Box p={4} borderWidth="1px" borderRadius="lg">
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    🐾 Welfare
                  </Text>
                  <Badge colorPalette={getVoteColor(reviewResult.welfare_vote)}>
                    {getVoteLabel(reviewResult.welfare_vote)}
                  </Badge>
                </Box>

                <Box p={4} borderWidth="1px" borderRadius="lg">
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    💰 Finance
                  </Text>
                  <Badge colorPalette={getVoteColor(reviewResult.finance_vote)}>
                    {getVoteLabel(reviewResult.finance_vote)}
                  </Badge>
                </Box>

                <Box p={4} borderWidth="1px" borderRadius="lg">
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    🔍 Fraud
                  </Text>
                  <Badge colorPalette={getVoteColor(reviewResult.fraud_vote)}>
                    {getVoteLabel(reviewResult.fraud_vote)}
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

              <Box p={4} borderWidth="1px" borderRadius="lg">
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Final Verdict
                </Text>

                <Badge
                  colorPalette={decisionColor}
                  fontSize="sm"
                  px={2}
                  py={1}
                  mb={3}
                >
                  {finalDecision === "approve"
                    ? "APPROVED"
                    : finalDecision === "reject"
                    ? "REJECTED"
                    : "PROCESSING"}
                </Badge>

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
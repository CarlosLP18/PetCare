import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  SimpleGrid,
  Flex,
  VStack,
} from '@chakra-ui/react'
import Introduction from '../components/Introduction'
import Stats from '../components/Stats'
import CampaignCard from '../components/CampaignCard'
import DonationModal from '../components/DonationModal'
import { getCampaigns } from '../api/campaigns'

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const data = await getCampaigns()
      setCampaigns(data)
    } catch (error) {
      console.error("Error loading campaigns:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter((campaign) => {
    const term = searchTerm.toLowerCase()

    return (
      (campaign.pet_name || '').toLowerCase().includes(term) ||
      (campaign.title || '').toLowerCase().includes(term) ||
      (campaign.pet_species || '').toLowerCase().includes(term) ||
      (campaign.diagnosis || '').toLowerCase().includes(term)
    )
  })

  const handleDonate = (campaign) => {
    setSelectedCampaign(campaign)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCampaign(null)
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Introduction />
      <Stats />

      <Box py={16} id="campaigns">
        <Container maxW="1200px">
          <VStack gap={8} align="stretch">
            <Box textAlign="center">
              <Heading size="xl" color="gray.800" mb={3}>
                Active Campaigns
              </Heading>
              <Text color="gray.600" maxW="600px" mx="auto">
                Browse campaigns from verified pet owners and shelters.
                Every donation helps provide critical medical supplies to pets in need.
              </Text>
            </Box>

            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={4}
              justify="center"
              align={{ base: 'stretch', md: 'center' }}
            >
              <Box position="relative" w={{ base: 'full', md: '300px' }}>
                <Box
                  position="absolute"
                  left={3}
                  top="50%"
                  transform="translateY(-50%)"
                  color="gray.400"
                >
                  <SearchIcon />
                </Box>
                <Input
                  placeholder="Search by pet name, title, species or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  pl={10}
                  bg="white"
                />
              </Box>
            </Flex>

            {loading ? (
              <Box textAlign="center" py={12}>
                <Text color="gray.500" fontSize="lg">
                  Loading campaigns...
                </Text>
              </Box>
            ) : filteredCampaigns.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onDonate={handleDonate}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Box textAlign="center" py={12}>
                <Text color="gray.500" fontSize="lg">
                  No campaigns found matching your search.
                </Text>
                <Button
                  mt={4}
                  colorPalette="teal"
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              </Box>
            )}
          </VStack>
        </Container>
      </Box>

      <DonationModal
        campaign={selectedCampaign}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDonationSuccess={loadCampaigns}
      />
    </Box>
  )
}
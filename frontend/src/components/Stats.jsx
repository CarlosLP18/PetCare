import { Box, Container, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { stats } from '../data/campaigns'

function formatNumber(num) {
  return num.toLocaleString('en-US')
}

function DollarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
    </svg>
  )
}

function PawIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
  )
}

function CampaignIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  )
}

const statItems = [
  { icon: <DollarIcon />, value: `$${formatNumber(stats.totalRaised)}`, label: 'Total Raised', color: 'teal.500' },
  { icon: <PawIcon />, value: formatNumber(stats.petsHelped), label: 'Pets Helped', color: 'pink.500' },
  { icon: <CampaignIcon />, value: stats.activeCampaigns.toString(), label: 'Active Campaigns', color: 'orange.500' },
  { icon: <UsersIcon />, value: formatNumber(stats.donors), label: 'Generous Donors', color: 'blue.500' },
]

export default function Stats() {
  return (
    <Box bg="gray.50" py={16}>
      <Container maxW="1200px">
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={8}>
          {statItems.map((stat, index) => (
            <VStack 
              key={index}
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="sm"
              gap={3}
            >
              <Box color={stat.color}>
                {stat.icon}
              </Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                {stat.value}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {stat.label}
              </Text>
            </VStack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}

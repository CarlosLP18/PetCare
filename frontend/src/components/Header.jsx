import { Box, Container, Flex, Text, Button, HStack, Image } from '@chakra-ui/react'
import PetCareLogo from '../assets/PetCare.svg'
import { Link as RouterLink } from 'react-router-dom'

function PawIcon() {
  return (
    <Image
      src = {PetCareLogo}
      alt = "PetCare"
      boxSize="50px" 
      objectFit="contain"
    />
  )
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  )
}

export default function Header() {
  return (
    <Box 
      as="header" 
      bg="white" 
      borderBottom="1px solid" 
      borderColor="gray.200"
      position="sticky"
      top="0"
      zIndex="100"
    >
      <Container maxW="1200px" py={4}>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={2}>
            <Box color="teal.500">
              <PawIcon />
            </Box>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              PetCare
            </Text>
          </Flex>
          
          <HStack gap={6} display={{ base: 'none', md: 'flex' }}>
            <Text 
              color="gray.600" 
              cursor="pointer" 
              _hover={{ color: 'teal.500' }}
              fontWeight="medium"
            >
              Browse Campaigns
            </Text>
            <Text 
              color="gray.600" 
              cursor="pointer" 
              _hover={{ color: 'teal.500' }}
              fontWeight="medium"
            >
              How It Works
            </Text>
            <Text 
              color="gray.600" 
              cursor="pointer" 
              _hover={{ color: 'teal.500' }}
              fontWeight="medium"
            >
              Success Stories
            </Text>
          </HStack>

          <HStack gap={3}>
            <Button 
              variant="outline" 
              colorPalette="teal"
              size="sm"
              display={{ base: 'none', sm: 'flex' }}
              as={RouterLink}
              to="/create-campaign"
            >
              Start Campaign
            </Button>
            <Button 
              colorPalette="teal"
              size="sm"
            >
              <HeartIcon />
              <Text ml={1}>Donate</Text>
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}

import { Box, Container, Heading, Text, Button, Flex, VStack } from '@chakra-ui/react'

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

export default function Introduction() {
  return (
    <Box 
      bg="linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #5eead4 100%)"
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity="0.1"
        bg={`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}
      />
      
      <Container maxW="1200px" position="relative">
        <VStack gap={6} textAlign="center" maxW="800px" mx="auto">
          <Heading 
            as="h1" 
            size={{ base: '2xl', md: '4xl' }}
            color="white"
            fontWeight="bold"
            lineHeight="1.2"
          >
            Help Pets Get the Medical Care They Deserve
          </Heading>
          
          <Text 
            fontSize={{ base: 'lg', md: 'xl' }} 
            color="white"
            opacity="0.95"
            maxW="600px"
          >
            Join our community of animal lovers making a difference. 
            Every donation brings hope and healing to pets in need.
          </Text>
          
          <Flex 
            gap={4} 
            mt={4}
            direction={{ base: 'column', sm: 'row' }}
            w={{ base: 'full', sm: 'auto' }}
          >
            <Button 
              size="lg"
              bg="white"
              color="teal.600"
              _hover={{ bg: 'gray.100' }}
              px={8}
            >
              <HeartIcon />
              <Text ml={2}>Donate Now</Text>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              color="white"
              borderColor="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              px={8}
            >
              <SearchIcon />
              <Text ml={2}>Browse Campaigns</Text>
            </Button>
          </Flex>
          
          <Flex 
            gap={{ base: 6, md: 12 }} 
            mt={8}
            color="white"
            direction={{ base: 'column', sm: 'row' }}
          >
            <VStack gap={0}>
              <Text fontSize="3xl" fontWeight="bold">100%</Text>
              <Text fontSize="sm" opacity="0.9">Goes to Pets</Text>
            </VStack>
            <VStack gap={0}>
              <Text fontSize="3xl" fontWeight="bold">24/7</Text>
              <Text fontSize="sm" opacity="0.9">Emergency Support</Text>
            </VStack>
            <VStack gap={0}>
              <Text fontSize="3xl" fontWeight="bold">Verified</Text>
              <Text fontSize="sm" opacity="0.9">Vet Partners</Text>
            </VStack>
          </Flex>
        </VStack>
      </Container>
    </Box>
  )
}

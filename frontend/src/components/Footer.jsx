import { Box, Container, Flex, Text, VStack, Input, Button, SimpleGrid, HStack } from '@chakra-ui/react'

function PawIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  )
}

const footerLinks = {
  'About': ['Our Mission', 'How It Works', 'Success Stories', 'Partners'],
  'Support': ['Help Center', 'Contact Us', 'FAQs', 'Community'],
  'Legal': ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Donate Policy']
}

export default function Footer() {
  return (
    <Box as="footer" bg="gray.900" color="white" py={16}>
      <Container maxW="1200px">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={10} mb={12}>
          <VStack align="start" gap={4}>
            <Flex align="center" gap={2}>
              <Box color="teal.400">
                <PawIcon />
              </Box>
              <Text fontSize="xl" fontWeight="bold">PawFund</Text>
            </Flex>
            <Text fontSize="sm" color="gray.400" lineHeight="tall">
              Connecting compassionate donors with pets in need of medical care. 
              Every donation makes a difference.
            </Text>
            <HStack gap={3} color="gray.400">
              <Box cursor="pointer" _hover={{ color: 'teal.400' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </Box>
              <Box cursor="pointer" _hover={{ color: 'teal.400' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Box>
              <Box cursor="pointer" _hover={{ color: 'teal.400' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.408.593 24 1.324 24h11.494v-9.294H9.689v-3.621h3.129V8.41c0-3.099 1.894-4.785 4.659-4.785 1.325 0 2.464.097 2.796.141v3.24h-1.921c-1.5 0-1.792.721-1.792 1.771v2.311h3.584l-.465 3.63H16.56V24h6.115c.733 0 1.325-.592 1.325-1.324V1.324C24 .593 23.408 0 22.676 0z"/>
                </svg>
              </Box>
            </HStack>
          </VStack>

          {Object.entries(footerLinks).map(([title, links]) => (
            <VStack key={title} align="start" gap={3}>
              <Text fontWeight="semibold" fontSize="sm" color="gray.300" textTransform="uppercase" letterSpacing="wide">
                {title}
              </Text>
              {links.map((link) => (
                <Text 
                  key={link} 
                  fontSize="sm" 
                  color="gray.400" 
                  cursor="pointer"
                  _hover={{ color: 'teal.400' }}
                >
                  {link}
                </Text>
              ))}
            </VStack>
          ))}
        </SimpleGrid>

        <Box borderTop="1px solid" borderColor="gray.800" pt={8}>
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align={{ base: 'start', md: 'center' }}
            gap={4}
          >
            <VStack align={{ base: 'start', md: 'start' }} gap={2}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.300">
                Subscribe to our newsletter
              </Text>
              <Flex gap={2} w={{ base: 'full', md: 'auto' }}>
                <Input 
                  placeholder="Enter your email" 
                  size="sm"
                  bg="gray.800"
                  border="none"
                  _placeholder={{ color: 'gray.500' }}
                  w={{ base: 'full', md: '250px' }}
                />
                <Button colorPalette="teal" size="sm">
                  Subscribe
                </Button>
              </Flex>
            </VStack>
            
            <Text fontSize="sm" color="gray.500">
              Made with <Box as="span" color="red.400" display="inline"><HeartIcon /></Box> for pets everywhere
            </Text>
          </Flex>
        </Box>
      </Container>
    </Box>
  )
}

import { Box, Heading, Stack, Text } from "@chakra-ui/react"

type ArticleHeaderProps = {
  title: string
  description?: string
  pubDate?: string
  updatedDate?: string
}

export function ArticleHeader({ title, description, pubDate, updatedDate }: ArticleHeaderProps) {
  return (
    <Stack as="header" gap="3" align="start" textAlign="left" w="full">
      {pubDate && (
        <Text color="gray.500" fontWeight="600">
          {pubDate}
        </Text>
      )}
      {updatedDate && (
        <Text color="gray.500" fontSize="sm" fontStyle="italic">
          最后更新于 {updatedDate}
        </Text>
      )}
      <Heading
        as="h1"
        fontSize={{ base: "4xl", md: "6xl" }}
        fontWeight="700"
        lineHeight={{ base: 1.2, md: 1.15 }}
        letterSpacing="tight"
      >
        {title}
      </Heading>
      <Box h="3px" w={{ base: "5rem", md: "6.5rem" }} rounded="full" bg="cyan.200" />
    </Stack>
  )
}
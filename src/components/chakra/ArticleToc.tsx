import { Box, Link, Stack, Text } from "@chakra-ui/react"

export type ArticleTocHeading = {
  depth: number
  slug: string
  text: string
}

type ArticleTocProps = {
  headings: ArticleTocHeading[]
}

export function ArticleToc({ headings }: ArticleTocProps) {
  const items = headings.filter((heading) => heading.depth === 2 || heading.depth === 3)

  if (items.length === 0) {
    return null
  }

  return (
    <Box
      as="nav"
      aria-label="文章目录"
      data-toc
      rounded="xl"
      bg="white"
      maxH="calc(100vh - var(--site-header-offset) - 4rem)"
      overflowX="hidden"
      display="flex"
      flexDirection="column"
      px="5"
      pt="4"
      pb="5"
    >
      <Text fontSize="sm" fontWeight="700" letterSpacing="wide" color="gray.500">
        目录
      </Text>

      <Box
        mt="3"
        flex="1"
        minH="0"
        overflowY="auto"
        overflowX="hidden"
        overscrollBehavior="contain"
        css={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Stack gap="2">
          {items.map((heading) => (
            <Link
              key={heading.slug}
              href={`#${heading.slug}`}
              data-toc-link={heading.slug}
              display="block"
              ps={heading.depth === 3 ? "4" : "0"}
              color={heading.depth === 2 ? "gray.700" : "gray.600"}
              fontSize={heading.depth === 2 ? "sm" : "xs"}
              fontWeight={heading.depth === 2 ? "600" : "500"}
              lineHeight="1.6"
              transition="color 0.2s ease, font-weight 0.2s ease"
              _hover={{ color: "cyan.700", textDecoration: "none" }}
              _currentPage={{ color: "cyan.700", fontWeight: "700" }}
              css={{
                '&[aria-current="location"]': {
                  color: 'var(--chakra-colors-cyan-700)',
                  fontWeight: 700,
                },
              }}
            >
              {heading.text}
            </Link>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
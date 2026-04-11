import { Box, Link, Stack, Text } from "@chakra-ui/react"

export type ArticlePostListItem = {
  id: string
  title: string
}

type ArticlePostListProps = {
  posts: ArticlePostListItem[]
  currentPostId?: string
}

export function ArticlePostList({ posts, currentPostId }: ArticlePostListProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <Box
      as="nav"
      aria-label="文章列表"
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
        文章
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
        <Stack gap="1.5">
          {posts.map((post) => {
            const isCurrent = post.id === currentPostId

            return (
              <Link
                key={post.id}
                href={`/blog/${post.id}/`}
                aria-current={isCurrent ? "page" : undefined}
                display="block"
                color="gray.700"
                fontSize="sm"
                fontWeight="600"
                lineHeight="1.6"
                transition="color 0.2s ease, font-weight 0.2s ease"
                _hover={{ color: "cyan.700", textDecoration: "none" }}
                css={{
                  '&[aria-current="page"]': {
                    color: 'var(--chakra-colors-cyan-700)',
                    fontWeight: 700,
                  },
                }}
              >
                {post.title}
              </Link>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}
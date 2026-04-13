import { Box, Link, Stack, Text } from "@chakra-ui/react"

export type ArticlePostListItem = {
  href: string
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
      bg="var(--site-surface)"
      borderWidth="1px"
      borderColor="var(--site-border)"
      maxH="calc(100vh - var(--site-header-offset) - 4rem)"
      overflowX="hidden"
      display="flex"
      flexDirection="column"
      px="5"
      pt="4"
      pb="5"
    >
      <Text fontSize="sm" fontWeight="700" letterSpacing="wide" color="var(--site-subtle-fg)">
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
                href={post.href}
                aria-current={isCurrent ? "page" : undefined}
                display="block"
                color="var(--article-fg)"
                fontSize="sm"
                fontWeight="600"
                lineHeight="1.6"
                transition="color 0.2s ease, font-weight 0.2s ease"
                _hover={{ color: "var(--site-accent)", textDecoration: "none" }}
                css={{
                  '&[aria-current="page"]': {
                    color: 'var(--site-accent)',
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
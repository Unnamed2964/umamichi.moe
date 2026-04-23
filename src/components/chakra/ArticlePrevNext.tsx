import { Box, Link, Stack, Text } from "@chakra-ui/react"

export type AdjacentArticleLink = {
  href: string
  title: string
}

type ArticlePrevNextProps = {
  previousPost?: AdjacentArticleLink
  nextPost?: AdjacentArticleLink
}

function ArticleNavCard({
  href,
  title,
  direction,
}: AdjacentArticleLink & { direction: "previous" | "next" }) {
  const isNext = direction === "next"

  return (
    <Link
      href={href}
      display="block"
      w="full"
      maxW={{ base: "full", md: "22rem" }}
      rounded="2xl"
      borderWidth="1px"
      borderColor="var(--site-sidebar-border)"
      bg="white"
      px={{ base: "4", md: "5" }}
      py="3.5"
      transition="background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease"
      _hover={{
        textDecoration: "none",
        borderColor: "var(--site-accent)",
        bg: "white",
      }}
    >
      <Stack gap="1" align={isNext ? "end" : "start"} textAlign={isNext ? "right" : "left"}>
        <Text fontSize="xs" fontWeight="600" color="var(--site-subtle-fg)">
          {isNext ? "下一篇" : "上一篇"}
        </Text>
        <Text fontSize="sm" fontWeight="700" lineHeight="1.5" color="var(--site-fg)">
          {title}
        </Text>
      </Stack>
    </Link>
  )
}

export function ArticlePrevNext({ previousPost, nextPost }: ArticlePrevNextProps) {
  if (!previousPost && !nextPost) {
    return null
  }

  return (
    <Stack as="nav" aria-label="上一篇和下一篇" gap="3" pt="6" borderTopWidth="1px" borderColor="var(--site-border)">
      <Box display="flex" gap="3" flexDirection={{ base: "column", md: "row" }}>
        <Box flex="1" display="flex" justifyContent="flex-start">
          {previousPost ? <ArticleNavCard {...previousPost} direction="previous" /> : null}
        </Box>
        <Box flex="1" display="flex" justifyContent={{ base: "flex-start", md: "flex-end" }}>
          {nextPost ? <ArticleNavCard {...nextPost} direction="next" /> : null}
        </Box>
      </Box>
    </Stack>
  )
}
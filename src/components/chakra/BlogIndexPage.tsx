import {
  Flex,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
} from "@chakra-ui/react"
import { SiteFrame } from "./SiteFrame"

type BlogCard = {
  id: string
  title: string
  pubDate: string
  heroImage?: {
    src: string
  }
}

type BlogIndexPageProps = {
  posts: BlogCard[]
}

export function BlogIndexPage({ posts }: BlogIndexPageProps) {
  return (
    <SiteFrame currentPath="/blog" mainMaxW="4xl">
      <Stack gap="8" fontSize="var(--site-content-font-size)" lineHeight="var(--site-content-line-height)">
        <Stack gap="3">
          <Text
            display="inline-flex"
            px="3"
            py="1"
            rounded="full"
            bg="cyan.50"
            color="cyan.800"
            fontSize="sm"
            fontWeight="700"
            letterSpacing="wide"
            maxW="9rem"
          >
            Blog Archive
          </Text>
          <Text as="h1" fontSize={{ base: "2.4em", md: "2.8em" }} fontWeight="700" lineHeight={{ base: 1.2, md: 1.15 }} letterSpacing="tight">
            Writing and notes
          </Text>
          <Text color="gray.600">
            A list of posts published on the site, newest first.
          </Text>
        </Stack>
        

        <Stack gap="0" borderTopWidth="1px" borderColor="blackAlpha.100">
          {posts.map((post) => (
            <LinkBox
              key={post.id}
              as="article"
              borderBottomWidth="1px"
              borderColor="blackAlpha.100"
              py="2"
              transition="background-color 0.2s ease"
              _hover={{ bg: "blackAlpha.50" }}
            >
              <Flex align="center" gap="4" minH="1.75em">
                <Text
                  as="h2"
                  flex="1"
                  minW="0"
                  fontSize={{ base: "1.02em", md: "1.08em" }}
                  fontWeight="500"
                  lineHeight="1.4"
                  letterSpacing="tight"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  <LinkOverlay href={`/blog/${post.id}/`}>{post.title}</LinkOverlay>
                </Text>
                <Text
                  flexShrink={0}
                  color="gray.500"
                  fontSize="0.92em"
                  fontWeight="600"
                  lineHeight="1.4"
                  whiteSpace="nowrap"
                >
                  {post.pubDate}
                </Text>
              </Flex>
            </LinkBox>
          ))}
        </Stack>
      </Stack>
    </SiteFrame>
  )
}
import {
  Box,
  Flex,
  Heading,
  Image,
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
    <SiteFrame currentPath="/blog" mainMaxW="5xl">
      <Stack gap="8">
        <Stack gap="3" maxW="36rem">
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
            textTransform="uppercase"
          >
            Blog archive
          </Text>
          <Heading as="h1" size="2xl" letterSpacing="tight">
            Writing and notes
          </Heading>
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
              py={{ base: 5, md: 6 }}
              transition="background-color 0.2s ease"
              _hover={{ bg: "blackAlpha.50" }}
            >
              <Flex align={{ base: "start", md: "center" }} gap={{ base: 4, md: 6 }}>
                {post.heroImage ? (
                  <Image
                    src={post.heroImage.src}
                    alt=""
                    flexShrink={0}
                    w={{ base: "96px", md: "128px" }}
                    h={{ base: "72px", md: "88px" }}
                    objectFit="cover"
                    rounded="lg"
                  />
                ) : (
                  <Box
                    flexShrink={0}
                    w={{ base: "96px", md: "128px" }}
                    h={{ base: "72px", md: "88px" }}
                    rounded="lg"
                    bg="gray.100"
                  />
                )}

                <Stack gap="2" flex="1" minW="0">
                  <Text color="gray.500" fontSize="sm" fontWeight="600">
                    {post.pubDate}
                  </Text>
                  <Heading as="h2" size={{ base: "md", md: "lg" }} letterSpacing="tight">
                    <LinkOverlay href={`/blog/${post.id}/`}>{post.title}</LinkOverlay>
                  </Heading>
                </Stack>
              </Flex>
            </LinkBox>
          ))}
        </Stack>
      </Stack>
    </SiteFrame>
  )
}
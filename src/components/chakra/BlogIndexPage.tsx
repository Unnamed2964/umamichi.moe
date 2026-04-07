import {
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
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
    <SiteFrame currentPath="/blog" mainMaxW="6xl">
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

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="8">
          {posts.map((post, index) => (
            <LinkBox
              key={post.id}
              as="article"
              borderWidth="1px"
              borderColor="blackAlpha.100"
              bg="white"
              rounded="3xl"
              overflow="hidden"
              boxShadow={index === 0 ? "lg" : "sm"}
              gridColumn={index === 0 ? { base: "span 1", md: "span 2" } : undefined}
              transition="transform 0.2s ease, box-shadow 0.2s ease"
              _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
            >
              {post.heroImage && (
                <Image
                  src={post.heroImage.src}
                  alt=""
                  w="full"
                  h={index === 0 ? { base: "220px", md: "320px" } : "220px"}
                  objectFit="cover"
                />
              )}
              <Stack gap="3" p={{ base: 5, md: 6 }}>
                <Text color="gray.500" fontSize="sm" fontWeight="600">
                  {post.pubDate}
                </Text>
                <Heading as="h2" size={index === 0 ? "xl" : "lg"} letterSpacing="tight">
                  <LinkOverlay href={`/blog/${post.id}/`}>{post.title}</LinkOverlay>
                </Heading>
              </Stack>
            </LinkBox>
          ))}
        </SimpleGrid>
      </Stack>
    </SiteFrame>
  )
}
import { Heading, Link, Stack, Text } from "@chakra-ui/react"
import { SiteFrame } from "./SiteFrame"

export function HomePage() {
  return (
    <SiteFrame currentPath="/" mainMaxW="4xl">
      <Stack gap="6" align="start">
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
            textTransform="uppercase"
          >
            Personal site
          </Text>
          <Heading as="h1" size="3xl" letterSpacing="tight" maxW="12ch">
            This blog is under construction
          </Heading>
        </Stack>

        <Text fontSize={{ base: "lg", md: "xl" }} color="gray.700" maxW="44rem">
          Welcome to my blog. If you want to generate a Shanghai Metro lineid block
          referenced from a real shot of the Line 9 onboard map, visit{" "}
          <Link href="https://shmetro-idblock.umamichi.moe/" color="cyan.700">
            this tool
          </Link>
          .
        </Text>
      </Stack>
    </SiteFrame>
  )
}
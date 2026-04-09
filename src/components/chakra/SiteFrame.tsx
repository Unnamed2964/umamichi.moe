import type { PropsWithChildren } from "react"
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react"
import { FaGithub, FaXTwitter } from "react-icons/fa6"
import { Provider } from "../ui/provider"
import { SITE_TITLE } from "../../consts"

export const SITE_MAIN_MAX_W = "3xl"

type SiteFrameProps = PropsWithChildren<{
  currentPath: string
}>

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "文章" },
  { href: "/tools", label: "工具" },
  { href: "/friends", label: "友情链接" },
  { href: "/about", label: "关于" },
]

function isActiveLink(href: string, currentPath: string) {
  if (href === "/") {
    return currentPath === "/"
  }

  return currentPath === href || currentPath.startsWith(`${href}/`)
}

export function SiteFrame({ children, currentPath }: SiteFrameProps) {
  return (
    <Provider>
      <Box minH="100vh" bg="white">
        <Box
          as="header"
          position="sticky"
          top="0"
          zIndex="10"
          borderBottomWidth="1px"
          borderColor="blackAlpha.100"
          bg="white"
        >
          <Container maxW="6xl" px={{ base: 4, md: 6 }}>
            <Stack gap={{ base: 3, md: 0 }} py={{ base: 3, md: 0 }}>
              <Flex minH={{ base: "auto", md: "72px" }} direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }} justify="space-between" gap={{ base: 3, md: 6 }}>
                <Heading as="h1" size="lg" letterSpacing="tight" textAlign={{ base: "center", md: "left" }}>
                  <Link href="/" _hover={{ textDecoration: "none", color: "cyan.700" }}>
                    {SITE_TITLE}
                  </Link>
                </Heading>

                <Flex
                  flex="1"
                  align="center"
                  justify={{ base: "center", md: "space-between" }}
                  gap={{ base: 3, md: 6 }}
                  direction={{ base: "column", sm: "row" }}
                >
                  <HStack gap={{ base: 1, md: 2 }} flexWrap="wrap" justify={{ base: "center", sm: "flex-start" }}>
                    {navItems.map((item) => {
                      const active = isActiveLink(item.href, currentPath)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          px="3"
                          py="2"
                          rounded="full"
                          fontWeight={active ? "700" : "500"}
                          bg={active ? "cyan.50" : "transparent"}
                          color={active ? "cyan.700" : "gray.700"}
                          _hover={{ textDecoration: "none", bg: "blackAlpha.50" }}
                        >
                          {item.label}
                        </Link>
                      )
                    })}
                  </HStack>

                  <HStack gap="4" color="gray.600" fontSize="sm" justify="center" flexShrink={0}>
                    <Link
                      href="https://twitter.com/Umamichiz"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="X"
                      display="inline-flex"
                      alignItems="center"
                      _hover={{ color: "cyan.700" }}
                    >
                      <Icon as={FaXTwitter} boxSize="5" />
                    </Link>
                    <Link
                      href="https://github.com/Unnamed2964"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub"
                      display="inline-flex"
                      alignItems="center"
                      _hover={{ color: "cyan.700" }}
                    >
                      <Icon as={FaGithub} boxSize="5" />
                    </Link>
                  </HStack>
                </Flex>
              </Flex>
            </Stack>
          </Container>
        </Box>

        <Container
          as="main"
          maxW={SITE_MAIN_MAX_W}
          px={{ base: 4, md: 6 }}
          py={{ base: 10, md: 14 }}
          css={{
            "--site-content-font-size": "var(--chakra-font-sizes-md)",
            "--site-content-line-height": "var(--chakra-line-heights-tall)",
            "@media screen and (min-width: 48rem)": {
              "--site-content-font-size": "var(--chakra-font-sizes-lg)",
            },
          }}
        >
          {children}
        </Container>

        <Box
          as="footer"
          mt="16"
          borderTopWidth="1px"
          borderColor="blackAlpha.100"
          bg="white"
        >
          <Container maxW="6xl" px={{ base: 4, md: 6 }} py="10">
            <Stack gap="2" align="center" textAlign="center">
              <Text
                color="gray.600"
                fontSize="lg"
                display="inline-flex"
                alignItems="center"
                gap="1"
                flexWrap="wrap"
                justifyContent="center"
              >
                <Box as="span">© {new Date().getFullYear()} Umamichi/Unnamed2964.</Box>
                <Box as="span">Powered by</Box>
                <Link href="https://astro.build/" target="_blank" rel="noreferrer" color="cyan.700">
                  Astro
                </Link>
                <Box as="span">and</Box>
                <Link href="https://chakra-ui.com/" target="_blank" rel="noreferrer" color="cyan.700">
                  Chakra UI
                </Link>
              </Text>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Provider>
  )
}
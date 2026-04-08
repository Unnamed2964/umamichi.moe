import type { PropsWithChildren } from "react"
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Provider } from "../ui/provider"
import { SITE_TITLE } from "../../consts"

type SiteFrameProps = PropsWithChildren<{
  currentPath: string
  mainMaxW?: string
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

export function SiteFrame({ children, currentPath, mainMaxW = "6xl" }: SiteFrameProps) {
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
            <Flex minH="72px" align="center" justify="space-between" gap="6" wrap="wrap">
              <Heading as="h1" size="xl" letterSpacing="tight">
                <Link href="/" _hover={{ textDecoration: "none", color: "cyan.700" }}>
                  {SITE_TITLE}
                </Link>
              </Heading>

              <HStack gap={{ base: 1, md: 2 }} flexWrap="wrap">
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

              <HStack gap="4" color="gray.600" fontSize="sm">
                <Link href="https://twitter.com/Umamichiz" target="_blank" rel="noreferrer">
                  X
                </Link>
                <Link href="https://github.com/Unnamed2964" target="_blank" rel="noreferrer">
                  GitHub
                </Link>
              </HStack>
            </Flex>
          </Container>
        </Box>

        <Container
          as="main"
          maxW={mainMaxW}
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
              <Text color="gray.600" fontSize="lg">
                © {new Date().getFullYear()} Umamichi/Unnamed2964. All rights reserved. <del>😈Most lefts and centers also reserved.</del>
              </Text>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Provider>
  )
}
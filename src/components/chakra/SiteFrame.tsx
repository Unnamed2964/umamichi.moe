import { type PropsWithChildren, useEffect, useState } from "react"
import {
  Box,
  CloseButton,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react"
import { FaBars, FaGithub, FaXTwitter } from "react-icons/fa6"
import { Provider } from "../ui/provider"
import { SITE_TITLE } from "../../consts"

export const SITE_MAIN_MAX_W = "4xl"
export const SITE_MAIN_HALF_W = `calc(var(--chakra-sizes-${SITE_MAIN_MAX_W}) / 2)`

type SiteFrameProps = PropsWithChildren<{
  currentPath: string
}>

type NavIconKind =
  | "normal"
  | "transfer"
  | "transfer-and-out-of-station-transfer"
  | "out-of-station-transfer"
  | "out-of-station-transfer-and-out-of-station-transfer"

const navItems: ReadonlyArray<{
  href: string
  label: string
  icon: NavIconKind
}> = [
  { href: "/", label: "首页", icon: "normal" },
  { href: "/blog", label: "文章", icon: "normal" },
  { href: "/tools", label: "工具", icon: "transfer" },
  { href: "/friends", label: "友情链接", icon: "out-of-station-transfer-and-out-of-station-transfer" },
  { href: "/about", label: "关于", icon: "normal" },
]

function MetroNavIcon({ kind, active }: { kind: NavIconKind; active: boolean }) {
  const scale = 0.16
  const baselineHeight = 100
  const accent = active ? "var(--chakra-colors-cyan-700)" : "var(--chakra-colors-cyan-500)"
  const iconStyle = {
    display: "block",
    overflow: "visible",
  } as const

  if (kind === "normal") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 43 100"
        width={43 * scale}
        height={baselineHeight * scale}
        focusable="false"
        style={iconStyle}
      >
        <path
          d="M 120,100 H 77 V 0 H 120 Z"
          transform="translate(-77 0)"
          fill={accent}
          fillRule="evenodd"
        />
      </svg>
    )
  }

  if (kind === "transfer") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 47 100"
        width={47 * scale}
        height={baselineHeight * scale}
        focusable="false"
        style={iconStyle}
      >
        <path
          d="m 164,4 c 11,0 20,9 20,20 v 53 c 0,11 -9,20 -20,20 -11,0 -20,-9 -20,-20 v -53 c 0,-11 9,-20 20,-20 z"
          transform="translate(-140.5 -0.5)"
          stroke={accent}
          strokeWidth="7"
          strokeMiterlimit="8"
          fill="white"
          fillRule="evenodd"
        />
      </svg>
    )
  }

  return (
    <svg
      aria-hidden="true"
      viewBox={
        kind === "transfer-and-out-of-station-transfer"
          ? "0 0 39 100"
          : kind === "out-of-station-transfer"
            ? "0 0 49 100"
            : "0 0 33 100"
      }
      width={
        kind === "transfer-and-out-of-station-transfer"
          ? 39 * scale
          : kind === "out-of-station-transfer"
            ? 49 * scale
            : 33 * scale
      }
      height={baselineHeight * scale}
      focusable="false"
      style={iconStyle}
    >
      {kind === "transfer-and-out-of-station-transfer" ? (
        <>
          <path
            d="m 35,99 c -9,0 -16,-7 -16,-16 v -17 c 0,-9 7,-16 16,-16 9,0 16,7 16,16 v 17 c 0,9 -7,16 -16,16 z"
            transform="translate(-15.5 -2.5)"
            stroke={accent}
            strokeWidth="7"
            strokeMiterlimit="8"
            fill="white"
            fillRule="evenodd"
          />
          <path
            d="m 35,38 c -8,0 -15,-7 -15,-16 0,-8 7,-15 15,-15 9,0 16,7 16,15 0,9 -7,16 -16,16 z"
            transform="translate(-15.5 -2.5)"
            stroke={accent}
            strokeWidth="7"
            strokeMiterlimit="8"
            fill="white"
            fillRule="evenodd"
          />
        </>
      ) : kind === "out-of-station-transfer" ? (
        <>
          <path
            d="m 229,4 c 11,0 21,10 21,20 0,11 -10,21 -21,21 -11,0 -21,-10 -21,-21 0,-10 10,-20 21,-20 z"
            transform="translate(-204.5 0.5)"
            stroke={accent}
            strokeWidth="7"
            strokeMiterlimit="8"
            fill="white"
            fillRule="evenodd"
          />
          <path
            d="m 229,55 c 11,0 21,10 21,20 0,11 -10,21 -21,21 -11,0 -21,-10 -21,-21 0,-10 10,-20 21,-20 z"
            transform="translate(-204.5 0.5)"
            stroke={accent}
            strokeWidth="7"
            strokeMiterlimit="8"
            fill="white"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="m 294,4 c 7,0 13,6 13,13 0,8 -6,14 -13,14 -7,0 -13,-6 -13,-14 0,-7 6,-13 13,-13 z"
            transform="translate(-277.5 -3.5)"
            stroke={accent}
            strokeWidth="7"
            strokeMiterlimit="8"
            fill="white"
            fillRule="evenodd"
          />
          <path
            d="m 294,39 c 7,0 13,6 13,13 0,8 -6,14 -13,14 -7,0 -13,-6 -13,-14 0,-7 6,-13 13,-13 z"
            transform="translate(-277.5 -3.5)"
            stroke={accent}
            strokeWidth="7"
            strokeMiterlimit="8"
            fill="white"
            fillRule="evenodd"
          />
          <path
            d="m 294,74 c 7,0 13,6 13,13 0,7 -6,13 -13,13 -7,0 -13,-6 -13,-13 0,-7 6,-13 13,-13 z"
            transform="translate(-277.5 -3.5)"
            stroke={accent}
            strokeWidth="7"
            strokeMiterlimit="8"
            fill="white"
            fillRule="evenodd"
          />
        </>
      )}
    </svg>
  )
}

function isActiveLink(href: string, currentPath: string) {
  if (href === "/") {
    return currentPath === "/"
  }

  return currentPath === href || currentPath.startsWith(`${href}/`)
}

export function SiteFrame({ children, currentPath }: SiteFrameProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [currentPath])

  return (
    <Provider>
      <Box minH="100vh" bg="white">
        <Box
          as="header"
          data-site-header
          position="sticky"
          top="0"
          zIndex="10"
          borderBottomWidth="1px"
          borderColor="blackAlpha.100"
          bg="white"
        >
          <Container maxW="6xl" px={{ base: 4, md: 6 }}>
            <Stack gap={{ base: 3, md: 0 }} py={{ base: 3, md: 0 }}>
              <Flex
                minH={{ base: "auto", md: "72px" }}
                direction={{ base: "row", md: "row" }}
                align="center"
                justify="space-between"
                gap={{ base: 3, md: 6 }}
              >
                <HStack display={{ base: "flex", md: "none" }} gap="3" flex="1" justify="flex-start" minW="0">
                  <IconButton
                    aria-label={isMobileMenuOpen ? "关闭菜单" : "打开菜单"}
                    variant="ghost"
                    rounded="full"
                    size="sm"
                    bg="white"
                    color="gray.700"
                    _hover={{ bg: "blackAlpha.50" }}
                    _active={{ bg: "blackAlpha.100" }}
                    onClick={() => setIsMobileMenuOpen((open) => !open)}
                  >
                    <Icon as={FaBars} boxSize="4" />
                  </IconButton>

                  <Heading
                    as="h1"
                    size="lg"
                    letterSpacing="tight"
                    textAlign="left"
                    flex="1"
                    minW="0"
                  >
                    <Link href="/" _hover={{ textDecoration: "none", color: "cyan.700" }}>
                      {SITE_TITLE}
                    </Link>
                  </Heading>
                </HStack>

                <Heading as="h1" size="lg" letterSpacing="tight" textAlign="left" flex="0 0 auto" display={{ base: "none", md: "block" }}>
                  <Link href="/" _hover={{ textDecoration: "none", color: "cyan.700" }}>
                    {SITE_TITLE}
                  </Link>
                </Heading>

                <Flex
                  flex="1"
                  align="center"
                  justify="space-between"
                  gap={{ base: 3, md: 6 }}
                  direction="row"
                  display={{ base: "none", md: "flex" }}
                >
                  <HStack gap={{ base: 1, md: 2 }} flexWrap="wrap" justify="flex-start">
                    {navItems.map((item) => {
                      const active = isActiveLink(item.href, currentPath)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          display="inline-flex"
                          alignItems="center"
                          gap="2"
                          px="3"
                          py="2"
                          rounded="full"
                          fontWeight={active ? "700" : "500"}
                          bg={active ? "cyan.50" : "transparent"}
                          color={active ? "cyan.700" : "gray.700"}
                          _hover={{ textDecoration: "none", bg: "blackAlpha.50" }}
                        >
                          <Box
                            as="span"
                            display="inline-flex"
                            alignItems="flex-end"
                            justifyContent="center"
                            flexShrink={0}
                            minH="16px"
                            lineHeight="0"
                          >
                            <MetroNavIcon kind={item.icon} active={active} />
                          </Box>
                          <Box as="span">{item.label}</Box>
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

        <Box
          as="nav"
          aria-label="移动端菜单"
          position="fixed"
          inset="0"
          zIndex="20"
          bg="white"
          display={{ base: isMobileMenuOpen ? "block" : "none", md: "none" }}
        >
          <Container maxW="6xl" px="4" py="4" minH="100dvh">
            <Flex direction="column" minH="calc(100dvh - 2rem)">
              <Flex align="center" justify="flex-start" gap="3">
                <CloseButton
                  aria-label="关闭菜单"
                  size="sm"
                  rounded="full"
                  color="gray.700"
                  bg="white"
                  _hover={{ bg: "blackAlpha.50" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                />

                <Heading as="p" size="lg" letterSpacing="tight" textAlign="left">
                  {SITE_TITLE}
                </Heading>
              </Flex>

              <Flex flex="1" align="flex-start" justify="flex-start" px="2" pt="8">
                <Stack as="ul" listStyleType="none" gap="3" w="full" maxW="sm" p="0" m="0" align="flex-start">
                  {navItems.map((item) => {
                    const active = isActiveLink(item.href, currentPath)
                    return (
                      <Box as="li" key={item.href}>
                        <Link
                          href={item.href}
                          display="inline-flex"
                          alignItems="center"
                          gap="2"
                          px="3"
                          py="2"
                          rounded="full"
                          fontWeight={active ? "700" : "500"}
                          bg={active ? "cyan.50" : "transparent"}
                          color={active ? "cyan.700" : "gray.700"}
                          _hover={{ textDecoration: "none", bg: "blackAlpha.50" }}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Box
                            as="span"
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                            minW="20px"
                            lineHeight="0"
                            transform="rotate(90deg)"
                            transformOrigin="center"
                          >
                            <MetroNavIcon kind={item.icon} active={active} />
                          </Box>
                          <Box as="span">{item.label}</Box>
                        </Link>
                      </Box>
                    )
                  })}
                </Stack>
              </Flex>

              <HStack gap="4" justify="center" color="gray.600" pb="2">
                <Link
                  href="https://twitter.com/Umamichiz"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="10"
                  rounded="full"
                  borderWidth="1px"
                  borderColor="blackAlpha.200"
                  _hover={{ color: "cyan.700", bg: "blackAlpha.50", textDecoration: "none" }}
                >
                  <Icon as={FaXTwitter} boxSize="4" />
                </Link>
                <Link
                  href="https://github.com/Unnamed2964"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="10"
                  rounded="full"
                  borderWidth="1px"
                  borderColor="blackAlpha.200"
                  _hover={{ color: "cyan.700", bg: "blackAlpha.50", textDecoration: "none" }}
                >
                  <Icon as={FaGithub} boxSize="4" />
                </Link>
              </HStack>
            </Flex>
          </Container>
        </Box>

        <Container
          as="main"
          maxW={SITE_MAIN_MAX_W}
          px={{ base: 6, md: 8 }}
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
                fontSize={{ base: "md", md: "lg" }}
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
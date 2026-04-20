import type { ComponentProps, PropsWithChildren } from "react"
import {
  Box,
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
import { LuMoon, LuSun } from "react-icons/lu"
import { Provider } from "../ui/provider"
import { SITE_TITLE } from "../../consts"
import type { NavIconKind, TopLevelNavItem } from "../../lib/docs"

export const SITE_MAIN_MAX_W = "4xl"
export const SITE_MAIN_HALF_W = `calc(var(--chakra-sizes-${SITE_MAIN_MAX_W}) / 2)`

type SiteFrameProps = PropsWithChildren<{
  currentPath: string
  navItems: TopLevelNavItem[]
}>

function MetroNavIcon({ kind, active }: { kind: NavIconKind; active: boolean }) {
  const height = 16
  const accent = active ? "var(--site-accent)" : "var(--chakra-colors-cyan-500)"
  const iconStyle = {
    display: "block",
    overflow: "visible",
  } as const

  if (kind === "normal") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 43 100"
        height={height}
        focusable="false"
        style={iconStyle}
      >
        <path
          d="M 43,100 H 0 V 0 H 43 Z"
          fill={accent}
          fillRule="evenodd"
        />
      </svg>
    )
  } else if (kind === "transfer") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 47 100"
        height={height}
        focusable="false"
        style={iconStyle}
      >
        <path
          d="m 23.5,3.5 c 11,0 20,9 20,20 v 53 c 0,11 -9,20 -20,20 -11,0 -20,-9 -20,-20 v -53 c 0,-11 9,-20 20,-20 z"
          stroke={accent}
          strokeWidth="7"
          strokeMiterlimit="8"
          fill="white"
          fillRule="evenodd"
        />
      </svg>
    )
  } else if (kind === "transfer-and-out-of-station-transfer") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 39 100"
        height={height}
        focusable="false"
        style={iconStyle}
      >
        <path
          d="m 19.5,96.5 c -9,0 -16,-7 -16,-16 v -17 c 0,-9 7,-16 16,-16 9,0 16,7 16,16 v 17 c 0,9 -7,16 -16,16 z"
          stroke={accent}
          strokeWidth="7"
          strokeMiterlimit="8"
          fill="white"
          fillRule="evenodd"
        />
        <path
          d="m 19.5,35.5 c -8,0 -15,-7 -15,-16 0,-8 7,-15 15,-15 9,0 16,7 16,15 0,9 -7,16 -16,16 z"
          stroke={accent}
          strokeWidth="7"
          strokeMiterlimit="8"
          fill="white"
          fillRule="evenodd"
        />
      </svg>
    )
  } else if (kind === "out-of-station-transfer") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 49 100"
        height={height}
        focusable="false"
        style={iconStyle}
      >
        <path
          d="m 24.5,4.5 c 11,0 21,10 21,20 0,11 -10,21 -21,21 -11,0 -21,-10 -21,-21 0,-10 10,-20 21,-20 z"
          stroke={accent}
          strokeWidth="7"
          strokeMiterlimit="8"
          fill="white"
          fillRule="evenodd"
        />
        <path
          d="m 24.5,55.5 c 11,0 21,10 21,20 0,11 -10,21 -21,21 -11,0 -21,-10 -21,-21 0,-10 10,-20 21,-20 z"
          stroke={accent}
          strokeWidth="7"
          strokeMiterlimit="8"
          fill="white"
          fillRule="evenodd"
        />
      </svg>
    )
  } else if (kind === "out-of-station-transfer-and-out-of-station-transfer") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 33 100"
        height={height}
        focusable="false"
        style={iconStyle}
      >
        <path
          d="m 16.5,0.5 c 7,0 13,6 13,13 0,8 -6,14 -13,14 -7,0 -13,-6 -13,-14 0,-7 6,-13 13,-13 z"
          stroke={accent}
          strokeWidth="7"
          strokeMiterlimit="8"
          fill="white"
          fillRule="evenodd"
        />
        <path
          d="m 16.5,35.5 c 7,0 13,6 13,13 0,8 -6,14 -13,14 -7,0 -13,-6 -13,-14 0,-7 6,-13 13,-13 z"
          stroke={accent}
          strokeWidth="7"
          strokeMiterlimit="8"
          fill="white"
          fillRule="evenodd"
        />
        <path
          d="m 16.5,70.5 c 7,0 13,6 13,13 0,7 -6,13 -13,13 -7,0 -13,-6 -13,-13 0,-7 6,-13 13,-13 z"
          stroke={accent}
          strokeWidth="7"
          strokeMiterlimit="8"
          fill="white"
          fillRule="evenodd"
        />
      </svg>
    )
  }

  throw new Error(`Unknown MetroNavIcon kind: ${kind}`)
}

function isActiveLink(href: string, currentPath: string) {
  if (href === "/") {
    return currentPath === "/"
  }

  return currentPath === href || currentPath.startsWith(`${href}/`)
}

function ThemeToggleButton(props: Omit<ComponentProps<typeof IconButton>, "aria-label">) {
  return (
    <IconButton
      data-site-theme-toggle
      variant="ghost"
      aria-label="切换主题"
      size="sm"
      {...props}
      css={{
        _icon: {
          width: "5",
          height: "5",
        },
      }}
    >
      <Box as="span" data-site-theme-icon="light" aria-hidden="true">
        <Icon as={LuSun} boxSize="5" />
      </Box>
      <Box as="span" data-site-theme-icon="dark" aria-hidden="true">
        <Icon as={LuMoon} boxSize="5" />
      </Box>
    </IconButton>
  )
}

export function SiteFrame({ children, currentPath, navItems }: SiteFrameProps) {
  return (
    <Provider>
      <Box minH="100vh" bg="var(--site-bg)" color="var(--site-fg)">
        <Box
          as="header"
          data-site-header
          position="sticky"
          top="0"
          zIndex="10"
          borderBottomWidth="1px"
          borderColor="var(--site-border)"
          bg="var(--site-surface)"
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
                {/* Mobile top bar */}
                <HStack display={{ base: "flex", md: "none" }} gap="3" flex="1" justify="flex-start" minW="0">
                  <IconButton
                    data-site-menu-toggle
                    aria-label="打开菜单"
                    aria-controls="site-mobile-menu"
                    aria-expanded="false"
                    variant="ghost"
                    rounded="full"
                    size="sm"
                    bg="var(--site-surface)"
                    color="var(--site-fg)"
                    _hover={{ bg: "var(--site-hover-bg)" }}
                    _active={{ bg: "var(--site-active-bg)" }}
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
                    <Link href="/" _hover={{ textDecoration: "none", color: "var(--site-accent)" }}>
                      {SITE_TITLE}
                    </Link>
                  </Heading>
                </HStack>

                <ThemeToggleButton
                  display={{ base: "inline-flex", md: "none" }}
                  rounded="full"
                  color="var(--site-fg)"
                  _hover={{ bg: "var(--site-hover-bg)" }}
                  _active={{ bg: "var(--site-active-bg)" }}
                />

                <Heading as="h1" size="lg" letterSpacing="tight" textAlign="left" flex="0 0 auto" display={{ base: "none", md: "block" }}>
                  <Link href="/" _hover={{ textDecoration: "none", color: "var(--site-accent)" }}>
                    {SITE_TITLE}
                  </Link>
                </Heading>

                {/* Desktop navigation and utilities */}
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
                          key={item.folderPath}
                          href={item.href}
                          display="inline-flex"
                          alignItems="center"
                          gap="2"
                          px="3"
                          py="2"
                          rounded="full"
                          fontWeight={active ? "700" : "500"}
                          bg={active ? "var(--site-nav-active-bg)" : "transparent"}
                          color={active ? "var(--site-accent)" : "var(--site-fg)"}
                          _hover={{ textDecoration: "none", bg: "var(--site-hover-bg)" }}
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

                  <HStack gap="2" color="var(--site-muted-fg)" fontSize="sm" justify="center" flexShrink={0}>
                    <ThemeToggleButton
                      rounded="full"
                      color="var(--site-fg)"
                      _hover={{ bg: "var(--site-hover-bg)" }}
                      _active={{ bg: "var(--site-active-bg)" }}
                    />
                    <Link
                      href="https://twitter.com/Umamichiz"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="X"
                      display="inline-flex"
                      alignItems="center"
                      _hover={{ color: "var(--site-accent)" }}
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
                      _hover={{ color: "var(--site-accent)" }}
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
          id="site-mobile-menu"
          aria-label="移动端菜单"
          aria-hidden="true"
          data-site-mobile-menu
          position="fixed"
          inset="0"
          zIndex="20"
          bg="var(--site-surface)"
          display={{ base: "block", md: "none" }}
          hidden
        >
          <Container maxW="6xl" px="4" py="4" minH="100dvh">
            {/* Mobile hamburger menu content */}
            <Flex direction="column" minH="calc(100dvh - 2rem)">
              <Flex align="center" justify="flex-start" gap="3">
                <IconButton
                  data-site-menu-close
                  aria-label="关闭菜单"
                  variant="ghost"
                  size="sm"
                  rounded="full"
                  color="var(--site-fg)"
                  bg="var(--site-surface)"
                  _hover={{ bg: "var(--site-hover-bg)" }}
                >
                  <Icon as={FaBars} boxSize="4" />
                </IconButton>

                <Heading as="p" size="lg" letterSpacing="tight" textAlign="left">
                  {SITE_TITLE}
                </Heading>
              </Flex>

              <Flex flex="1" align="flex-start" justify="flex-start" px="2" pt="8">
                <Stack as="ul" listStyleType="none" gap="3" w="full" maxW="sm" p="0" m="0" align="flex-start">
                  {navItems.map((item) => {
                    const active = isActiveLink(item.href, currentPath)
                    return (
                      <Box as="li" key={item.folderPath}>
                        <Link
                          data-site-menu-link
                          href={item.href}
                          display="inline-flex"
                          alignItems="center"
                          gap="2"
                          px="3"
                          py="2"
                          rounded="full"
                          fontWeight={active ? "700" : "500"}
                          bg={active ? "var(--site-nav-active-bg)" : "transparent"}
                          color={active ? "var(--site-accent)" : "var(--site-fg)"}
                          _hover={{ textDecoration: "none", bg: "var(--site-hover-bg)" }}
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

              <HStack gap="4" justify="center" color="var(--site-muted-fg)" pb="2">
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
                  borderColor="var(--site-border-strong)"
                  _hover={{ color: "var(--site-accent)", bg: "var(--site-hover-bg)", textDecoration: "none" }}
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
                  borderColor="var(--site-border-strong)"
                  _hover={{ color: "var(--site-accent)", bg: "var(--site-hover-bg)", textDecoration: "none" }}
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
          borderColor="var(--site-border)"
          bg="var(--site-bg)"
        >
          <Container maxW="6xl" px={{ base: 4, md: 6 }} py="10">
            <Stack gap="2" align="center" textAlign="center">
              <Text
                color="var(--site-muted-fg)"
                fontSize={{ base: "md", md: "lg" }}
                display="inline-flex"
                alignItems="center"
                gap="1"
                flexWrap="wrap"
                justifyContent="center"
              >
                <Box as="span">© {new Date().getFullYear()} Umamichi/Unnamed2964.</Box>
                <Box as="span">Powered by</Box>
                <Link href="https://astro.build/" target="_blank" rel="noreferrer" color="var(--site-accent)">
                  Astro
                </Link>
                <Box as="span">and</Box>
                <Link href="https://chakra-ui.com/" target="_blank" rel="noreferrer" color="var(--site-accent)">
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

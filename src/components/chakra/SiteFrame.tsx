import type { ComponentProps, ComponentType, PropsWithChildren, SVGProps } from "react"
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
import NormalNavIcon from "../../assets/metro-nav/normal.svg?react"
import TransferNavIcon from "../../assets/metro-nav/transfer.svg?react"
import TransferAndOutOfStationTransferNavIcon from "../../assets/metro-nav/transfer-and-out-of-station-transfer.svg?react"
import OutOfStationTransferNavIcon from "../../assets/metro-nav/out-of-station-transfer.svg?react"
import OutOfStationTransferAndOutOfStationTransferNavIcon from "../../assets/metro-nav/out-of-station-transfer-and-out-of-station-transfer.svg?react"

export const SITE_MAIN_MAX_W = "4xl"
export const SITE_MAIN_HALF_W = `calc(var(--chakra-sizes-${SITE_MAIN_MAX_W}) / 2)`

type SiteFrameProps = PropsWithChildren<{
  currentPath: string
  navItems: TopLevelNavItem[]
}>

type MetroNavIconTone = "past" | "current" | "future"
type MetroNavSvgComponent = ComponentType<SVGProps<SVGSVGElement>>

const METRO_NAV_ICONS: Record<NavIconKind, MetroNavSvgComponent> = {
  normal: NormalNavIcon,
  transfer: TransferNavIcon,
  "transfer-and-out-of-station-transfer": TransferAndOutOfStationTransferNavIcon,
  "out-of-station-transfer": OutOfStationTransferNavIcon,
  "out-of-station-transfer-and-out-of-station-transfer": OutOfStationTransferAndOutOfStationTransferNavIcon,
}

function MetroNavIcon({ kind, tone }: { kind: NavIconKind; tone: MetroNavIconTone }) {
  const height = (8 / 43) * 100
  const color = tone === "future"
    ? "var(--site-nav-future-icon)"
    : "var(--site-nav-running-line-bg)"
  const NavIcon = METRO_NAV_ICONS[kind]
  const iconStyle = {
    display: "block",
    overflow: "visible",
    color,
  } as const

  return (
    <NavIcon
      aria-hidden="true"
      height={height}
      focusable="false"
      style={iconStyle}
    />
  )
}

function isActiveLink(href: string, currentPath: string) {
  if (href === "/") {
    return currentPath === "/"
  }

  const normalizedHref = href.replace(/\/+$/, "")
  const normalizedCurrentPath = currentPath.replace(/\/+$/, "")

  return normalizedCurrentPath === normalizedHref || normalizedCurrentPath.startsWith(`${normalizedHref}/`)
}

function getMetroNavIconTone(index: number, activeNavIndex: number): MetroNavIconTone {
  return index === activeNavIndex
    ? "current"
    : activeNavIndex !== -1 && index > activeNavIndex
      ? "future"
      : "past"
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
  const activeNavIndex = navItems.findIndex((item) => isActiveLink(item.href, currentPath))

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
          borderColor="var(--site-header-border)"
          bg="var(--site-header-bg)"
          className="vt-header"
        >
          <div className="navbar-running-line" data-nav-running-line aria-hidden="true"></div>
          {navItems.map((item, index) => {
            const tone = getMetroNavIconTone(index, activeNavIndex)

            return (
              <Box
                as="span"
                key={item.folderPath}
                data-nav-icon
                data-nav-icon-current={tone === "current" ? true : undefined}
                aria-hidden="true"
                position="absolute"
                left="0"
                top="0"
                zIndex="1"
                display={{ base: "none", md: "inline-flex" }}
                lineHeight="0"
                pointerEvents="none"
              >
                <MetroNavIcon kind={item.icon} tone={tone} />
              </Box>
            )
          })}

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

                {/* Desktop top bar */}
                <Heading as="h1" size="lg" letterSpacing="tight" textAlign="left" flex="0 0 auto" display={{ base: "none", md: "block" }}>
                  <Link href="/" _hover={{ textDecoration: "none", color: "var(--site-accent)" }}>
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
                  <HStack as="nav" aria-label="主导航" gap={{ base: 1, md: 2 }} flexWrap="wrap" justify="flex-start">
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
                          bg="transparent"
                          textDecoration="none"
                          color={active ? "var(--site-accent)" : "var(--site-fg)"}
                          _hover={{
                            textDecoration: "underline",
                            textDecorationColor: "currentColor",
                            textUnderlineOffset: "0.2em",
                            textDecorationThickness: "1px",
                            bg: "transparent",
                          }}
                          data-nav-item
                          data-nav-active-item={ active ? true : undefined }
                          aria-current={active ? "page" : undefined}
                        >
                          <Box as="span">{item.label}</Box>
                        </Link>
                      )
                    })}
                  </HStack>

                  <HStack gap="2" color="var(--site-fg)" fontSize="sm" justify="center" flexShrink={0}>
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
                      justifyContent="center"
                      boxSize="8"
                      rounded="full"
                      color="var(--site-fg)"
                      _hover={{ bg: "var(--site-hover-bg)", textDecoration: "none" }}
                      _active={{ bg: "var(--site-active-bg)" }}
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
                      justifyContent="center"
                      boxSize="8"
                      rounded="full"
                      color="var(--site-fg)"
                      _hover={{ bg: "var(--site-hover-bg)", textDecoration: "none" }}
                      _active={{ bg: "var(--site-active-bg)" }}
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
          data-site-mobile-dimmer
          position="fixed"
          inset="0"
          zIndex="15"
          display={{ base: "block", md: "none" }}
          aria-hidden="true"
        />

        <Box
          as="nav"
          id="site-mobile-menu"
          aria-label="移动端菜单"
          aria-hidden="true"
          data-site-mobile-menu
          position="fixed"
          top="0"
          left="0"
          bottom="0"
          w="50vw"
          maxW="30rem"
          zIndex="20"
          bg="var(--site-bg)"
          borderRightWidth="1px"
          borderColor="var(--site-header-border)"
          display={{ base: "block", md: "none" }}
        >
          <div className="mobile-navbar-running-line" data-mobile-nav-running-line aria-hidden="true"></div>
          {navItems.map((item, index) => {
            const tone = getMetroNavIconTone(index, activeNavIndex)

            return (
              <Box
                as="span"
                key={item.folderPath}
                data-mobile-nav-icon
                aria-hidden="true"
                position="absolute"
                left="0"
                top="0"
                zIndex="1"
                display={{ base: "inline-flex", md: "none" }}
                lineHeight="0"
                pointerEvents="none"
              >
                <Box as="span" display="inline-flex" lineHeight="0" transform="rotate(-90deg)" transformOrigin="right center">
                  <MetroNavIcon kind={item.icon} tone={tone} />
                </Box>
              </Box>
            )
          })}

          <Container maxW="none" px="4" py="4" minH="100dvh" position="relative" zIndex="2">
            {/* Mobile hamburger menu content */}
            <Flex direction="column" minH="calc(100dvh - 2rem)">
              <Flex as="header" align="center" justify="flex-start" gap="3">
                <IconButton
                  data-site-menu-close
                  aria-label="关闭菜单"
                  variant="ghost"
                  size="sm"
                  rounded="full"
                  color="var(--site-fg)"
                  _hover={{ bg: "var(--site-hover-bg)" }}
                  _active={{ bg: "var(--site-active-bg)" }}
                >
                  <Icon as={FaBars} boxSize="4" />
                </IconButton>
              </Flex>

              <Flex data-mobile-nav-list flex="1" align="flex-start" justify="flex-end" px="2" pt="8">
                <Stack as="ul" listStyleType="none" gap="3" w="full" maxW="sm" p="0" m="0" align="flex-end">
                  {navItems.map((item) => {
                    const active = isActiveLink(item.href, currentPath)
                    return (
                      <Box as="li" key={item.folderPath} w="full">
                        <Link
                          data-site-menu-link
                          data-mobile-nav-item
                          data-mobile-nav-active-item={ active ? true : undefined }
                          href={item.href}
                          display="flex"
                          w="full"
                          justifyContent="flex-end"
                          alignItems="center"
                          gap="2"
                          px="3"
                          py="2"
                          rounded="full"
                          fontWeight={active ? "700" : "500"}
                          bg="transparent"
                          textAlign="right"
                          textDecoration="none"
                          color={active ? "var(--site-accent)" : "var(--site-fg)"}
                          _hover={{
                            textDecoration: "underline",
                            textDecorationColor: "currentColor",
                            textUnderlineOffset: "0.2em",
                            textDecorationThickness: "1px",
                            bg: "transparent",
                          }}
                          aria-current={active ? "page" : undefined}
                        >
                          <Box as="span">{item.label}</Box>
                        </Link>
                      </Box>
                    )
                  })}
                </Stack>
              </Flex>

              <HStack as="footer" gap="2" justify="center" color="var(--site-fg)" pb="2">
                <Link
                  href="https://twitter.com/Umamichiz"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="8"
                  rounded="full"
                  color="var(--site-fg)"
                  _hover={{ bg: "var(--site-hover-bg)", textDecoration: "none" }}
                  _active={{ bg: "var(--site-active-bg)" }}
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
                  justifyContent="center"
                  boxSize="8"
                  rounded="full"
                  color="var(--site-fg)"
                  _hover={{ bg: "var(--site-hover-bg)", textDecoration: "none" }}
                  _active={{ bg: "var(--site-active-bg)" }}
                >
                  <Icon as={FaGithub} boxSize="5" />
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
          className="vt-footer"
          data-astro-transition-persist="footer"
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

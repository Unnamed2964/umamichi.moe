import type { PropsWithChildren } from "react"
import { Box, Heading, Image, Stack, Text } from "@chakra-ui/react"
import { SiteFrame } from "./SiteFrame"

type ArticleLayoutProps = PropsWithChildren<{
  currentPath: string
  title: string
  pubDate: string
  updatedDate?: string
  heroImage?: {
    src: string
  }
}>

export function ArticleLayout({
  children,
  currentPath,
  title,
  pubDate,
  updatedDate,
  heroImage,
}: ArticleLayoutProps) {
  return (
    <SiteFrame currentPath={currentPath} mainMaxW="5xl">
      <Stack as="article" gap="10">
        {heroImage && (
          <Box overflow="hidden" rounded="3xl" boxShadow="lg">
            <Image src={heroImage.src} alt="" w="full" maxH="32rem" objectFit="cover" />
          </Box>
        )}

        <Stack gap="6" maxW="42rem" mx="auto" w="full">
          <Stack gap="2" textAlign="center">
            <Text color="gray.500" fontWeight="600">
              {pubDate}
            </Text>
            {updatedDate && (
              <Text color="gray.500" fontSize="sm" fontStyle="italic">
                Last updated on {updatedDate}
              </Text>
            )}
            <Heading as="h1" size="2xl" letterSpacing="tight">
              {title}
            </Heading>
          </Stack>

          <Box h="1px" bg="blackAlpha.200" />

          <Box
            color="gray.700"
            className="prose"
            css={{
              fontSize: "1.05rem",
              lineHeight: 1.85,
              "& > :first-child": { marginTop: 0 },
              "& p": { marginBottom: "1.75rem" },
              "& h2": {
                marginTop: "3.5rem",
                marginBottom: "1rem",
                fontSize: "2rem",
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.03em",
                color: "#111827",
              },
              "& h3": {
                marginTop: "2.75rem",
                marginBottom: "0.9rem",
                fontSize: "1.55rem",
                fontWeight: 750,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                color: "#172554",
              },
              "& h4": {
                marginTop: "2.25rem",
                marginBottom: "0.75rem",
                fontSize: "1.2rem",
                fontWeight: 700,
                lineHeight: 1.3,
                color: "#1f2937",
              },
              "& ul, & ol": { paddingInlineStart: "1.5rem", marginBottom: "1.75rem" },
              "& li": { marginBottom: "0.5rem" },
              "& a": {
                color: "#0f766e",
                textDecoration: "underline",
                textUnderlineOffset: "0.18em",
              },
              "& strong": {
                fontWeight: 800,
                color: "#111827",
              },
              "& blockquote": {
                marginBlock: "2rem",
                paddingInline: "1.25rem",
                borderLeft: "4px solid #67e8f9",
                color: "#334155",
                fontSize: "1.1rem",
                fontStyle: "italic",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
              },
              "& :not(pre) > code": {
                paddingInline: "0.35rem",
                paddingBlock: "0.15rem",
                borderRadius: "0.35rem",
                fontSize: "0.92em",
                color: "#155e75",
                backgroundColor: "rgba(207, 250, 254, 0.9)",
              },
              "& pre": {
                overflowX: "auto",
                marginBlock: "2rem",
                padding: "1.25rem",
                borderRadius: "1rem",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                backgroundColor: "#0f172a",
                color: "#e2e8f0",
              },
              "& pre code": {
                backgroundColor: "transparent",
                color: "inherit",
                padding: 0,
              },
              "& hr": {
                marginBlock: "2.5rem",
                border: "0",
                borderTop: "1px solid rgba(15, 23, 42, 0.12)",
              },
              "& img": { borderRadius: "16px", boxShadow: "var(--box-shadow)" },
            }}
          >
            {children}
          </Box>
        </Stack>
      </Stack>
    </SiteFrame>
  )
}
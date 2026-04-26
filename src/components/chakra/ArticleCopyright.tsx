import { Box, Link, Stack, Text } from "@chakra-ui/react"
import { COPYRIGHT_CC_LICENSES, type CopyrightConfig } from "../../lib/copyright"

type ArticleCopyrightProps = {
  copyright?: CopyrightConfig
}

export function ArticleCopyright({ copyright }: ArticleCopyrightProps) {
  if (!copyright) {
    return null
  }

  const ccLicense = copyright.kind === "cc" ? COPYRIGHT_CC_LICENSES[copyright.license] : undefined

  return (
    <Stack as="section" aria-labelledby="article-copyright-heading" gap="3" pt="6">
      <Box
        rounded="xl"
        borderWidth="1px"
        borderColor="var(--site-sidebar-border)"
        bg="var(--site-sidebar-bg)"
        px={{ base: "4", md: "5" }}
        py="4"
      >
        <Stack gap="2.5">
          <Text id="article-copyright-heading" fontSize="sm" fontWeight="700" color="var(--site-fg)">
            版权声明
          </Text>

          {ccLicense ? (
            <Stack gap="2.5" align="start">
              <Link href={ccLicense.href} target="_blank" rel="noreferrer" display="inline-flex" _hover={{ textDecoration: "none" }}>
                <Box
                  as="img"
                  src={ccLicense.badgeSrc}
                  alt={`${ccLicense.label} 官方徽章`}
                  h="31px"
                  w="88px"
                />
              </Link>

              <Text fontSize="sm" lineHeight="1.7" color="var(--site-fg)">
                本文采用{" "}
                <Link href={ccLicense.href} target="_blank" rel="noreferrer" color="var(--site-accent)">
                  {ccLicense.label}
                </Link>{" "}
                许可协议。使用本文内容时，请依照协议要求注明作者与出处。
              </Text>
            </Stack>
          ) : (
            <Text fontSize="sm" lineHeight="1.7" color="var(--site-fg)">
              {copyright.statement ?? "本文著作权归作者所有。未经作者明确许可，不得转载、摘编、改编或以其他形式公开发布。"}
            </Text>
          )}

          <Text fontSize="xs" color="var(--site-subtle-fg)">
            {copyright.kind === "cc"
              ? "如另有说明，以对应说明为准。"
              : "如需授权，请先与作者联系。"}
          </Text>
        </Stack>
      </Box>
    </Stack>
  )
}
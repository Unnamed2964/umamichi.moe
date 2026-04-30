import { Box, HStack, Icon, Link, chakra } from "@chakra-ui/react"
import { FaGithub } from "react-icons/fa6"
import { LuChevronDown, LuCopy } from "react-icons/lu"

type ArticleSourceActionsProps = {
  sourceMarkdown: string
  sourceUrl: string
}

export default function ArticleSourceActions({ sourceMarkdown, sourceUrl }: ArticleSourceActionsProps) {
  return (
    <Box data-article-source-tools position="relative" w="full">
      <HStack gap="0" align="stretch" w="full">
        <Link
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          display="inline-flex"
          alignItems="center"
          gap="2"
          flex="1"
          minW="0"
          minH="10"
          px="3.5"
          borderWidth="1px"
          borderColor="var(--site-sidebar-border)"
          borderRightWidth="0"
          roundedLeft="xl"
          roundedRight="none"
          fontSize="sm"
          fontWeight="500"
          color="var(--site-fg)"
          bg="var(--site-surface)"
          lineHeight="1.4"
          whiteSpace="nowrap"
          _hover={{ bg: "var(--site-hover-bg)", textDecoration: "none" }}
        >
          <Icon as={FaGithub} boxSize="4" flexShrink={0} />
          <Box as="span">GitHub 源文件</Box>
        </Link>

        <chakra.button
          type="button"
          data-article-source-menu-toggle
          aria-label="展开 Markdown 操作"
          aria-haspopup="menu"
          aria-expanded="false"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          minW="10"
          px="3"
          borderWidth="1px"
          borderColor="var(--site-sidebar-border)"
          roundedLeft="none"
          roundedRight="xl"
          bg="var(--site-surface)"
          cursor="pointer"
          fontSize="sm"
          fontWeight="500"
          color="var(--site-fg)"
          transition="background-color 0.2s ease, color 0.2s ease"
          _hover={{ bg: "var(--site-hover-bg)" }}
          _active={{ bg: "var(--site-active-bg)" }}
        >
          <Icon as={LuChevronDown} boxSize="4" flexShrink={0} />
        </chakra.button>
      </HStack>

      <Box
        data-article-source-menu
        role="menu"
        hidden
        position="absolute"
        top="calc(100% + 0.375rem)"
        left="0"
        w="full"
        borderWidth="1px"
        borderColor="var(--site-sidebar-border)"
        rounded="xl"
        bg="var(--site-surface)"
        overflow="hidden"
        zIndex="2"
      >
        <chakra.button
          type="button"
          data-article-copy-markdown
          role="menuitem"
          display="flex"
          alignItems="center"
          gap="2"
          w="full"
          px="3.5"
          py="2.5"
          bg="transparent"
          textAlign="left"
          fontSize="sm"
          color="var(--site-fg)"
          fontWeight="500"
          cursor="pointer"
          transition="background-color 0.2s ease"
          _hover={{ bg: "var(--site-hover-bg)" }}
          _active={{ bg: "var(--site-active-bg)" }}
        >
          <Icon as={LuCopy} boxSize="4" flexShrink={0} />
          <Box as="span">复制 Markdown</Box>
        </chakra.button>
      </Box>

      <chakra.textarea
        data-article-markdown-source
        readOnly
        value={sourceMarkdown}
        tabIndex={-1}
        aria-hidden="true"
        position="absolute"
        opacity="0"
        pointerEvents="none"
        w="0"
        h="0"
      />
    </Box>
  )
}
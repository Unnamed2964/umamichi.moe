import { Link, Wrap } from "@chakra-ui/react"

export type ArticleTag = {
  label: string
  href: string
}

type ArticleTagsProps = {
  tags?: ArticleTag[]
}

export function ArticleTags({ tags = [] }: ArticleTagsProps) {
  if (tags.length === 0) {
    return null
  }

  return (
    <Wrap gap="2">
      {tags.map((tag) => (
        <Link
          key={tag.href}
          href={tag.href}
          data-site-button
          rounded="full"
          bg="var(--site-button-bg)"
          px="3"
          py="1"
          fontSize="sm"
          fontWeight="600"
          color="var(--site-button-fg)"
          transition="background-color 0.2s ease, color 0.2s ease"
          _hover={{
            bg: "var(--site-button-hover-bg)",
            textDecoration: "none",
          }}
          _active={{ bg: "var(--site-button-active-bg)" }}
        >
          #{tag.label}
        </Link>
      ))}
    </Wrap>
  )
}
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
          rounded="full"
          borderWidth="1px"
          borderColor="var(--site-border)"
          bg="var(--site-surface)"
          px="3"
          py="1"
          fontSize="sm"
          fontWeight="600"
          color="var(--site-subtle-fg)"
          transition="all 0.2s ease"
          _hover={{
            color: "var(--site-accent)",
            borderColor: "var(--site-accent)",
            textDecoration: "none",
          }}
        >
          #{tag.label}
        </Link>
      ))}
    </Wrap>
  )
}
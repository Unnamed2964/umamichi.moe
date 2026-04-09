import type { PropsWithChildren } from "react"
import { Box } from "@chakra-ui/react"

export function ArticleContent({ children }: PropsWithChildren) {
  return (
    <Box
      color="gray.700"
      className="prose"
      fontSize="var(--site-content-font-size)"
      lineHeight="var(--site-content-line-height)"
      css={{
        wordBreak: "break-word",
        "& > :first-of-type": { marginTop: 0 },
        "& > :last-child": { marginBottom: 0 },
        "& p": { marginTop: 0, marginBottom: "1rem" },
        "& h1": {
          marginTop: "1.4em",
          marginBottom: "1rem",
          paddingBottom: "0.35em",
          fontSize: "2.2em",
          fontWeight: 700,
          lineHeight: 1.24,
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "var(--chakra-colors-border-muted)",
        },
        "& h2": {
          marginTop: "1.32em",
          marginBottom: "1rem",
          paddingBottom: "0.3em",
          fontSize: "1.95em",
          fontWeight: 600,
          lineHeight: 1.32,
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "var(--chakra-colors-border-muted)",
        },
        "& h3": {
          marginTop: "1.26em",
          marginBottom: "1rem",
          fontSize: "1.65em",
          fontWeight: 600,
          lineHeight: 1.42,
        },
        "& h4": {
          marginTop: "1.2em",
          marginBottom: "1rem",
          fontSize: "1.38em",
          fontWeight: 600,
          lineHeight: 1.52,
        },
        "& h5, & h6": {
          marginTop: "1.12em",
          marginBottom: "1rem",
          fontSize: "1.18em",
          fontWeight: 600,
          lineHeight: 1.625,
        },
        "& ul, & ol": {
          marginTop: 0,
          marginBottom: "1rem",
          paddingInlineStart: "2em",
          listStylePosition: "outside",
        },
        "& ul": {
          listStyleType: "disc",
        },
        "& ol": {
          listStyleType: "decimal",
        },
        "& ul ul": {
          marginTop: "0.35rem",
          marginBottom: 0,
          listStyleType: "circle",
        },
        "& ul ul ul": {
          listStyleType: "square",
        },
        "& ol ol": {
          marginTop: "0.35rem",
          marginBottom: 0,
          listStyleType: "lower-alpha",
        },
        "& ol ol ol": {
          listStyleType: "lower-roman",
        },
        "& ul ol, & ol ul": {
          marginTop: "0.35rem",
          marginBottom: 0,
        },
        "& li": { marginTop: "0.25em" },
        "& li > p": { marginTop: "0.25em", marginBottom: "0.25em" },
        "& li::marker": {
          color: "var(--chakra-colors-fg-muted)",
        },
        "& .contains-task-list": {
          paddingInlineStart: 0,
          listStyle: "none",
        },
        "& .task-list-item": {
          listStyle: "none",
        },
        "& .task-list-item::marker": {
          content: '\"\"',
        },
        "& .task-list-item input": {
          marginInlineEnd: "0.6em",
          verticalAlign: "middle",
        },
        "& a": {
          color: "cyan.700",
          textDecoration: "none",
        },
        "& a:hover": {
          color: "cyan.800",
          textDecoration: "underline",
        },
        "& strong": {
          fontWeight: 600,
        },
        "& table": {
          display: "block",
          width: "max-content",
          maxWidth: "100%",
          overflowX: "auto",
          marginTop: 0,
          marginBottom: "1rem",
          borderSpacing: 0,
          borderCollapse: "collapse",
        },
        "& th, & td": {
          padding: "6px 13px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "var(--chakra-colors-border-muted)",
        },
        "& tr": {
          backgroundColor: "var(--chakra-colors-bg)",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "var(--chakra-colors-border-muted)",
        },
        "& tr:nth-of-type(2n)": {
          backgroundColor: "var(--chakra-colors-bg-subtle)",
        },
        "& blockquote": {
          marginTop: 0,
          marginBottom: "1rem",
          paddingInline: "1em",
          color: "var(--chakra-colors-fg-muted)",
          borderLeftWidth: "0.25em",
          borderLeftStyle: "solid",
          borderLeftColor: "var(--chakra-colors-border-muted)",
        },
        "& blockquote > :first-of-type": {
          marginTop: 0,
        },
        "& blockquote > :last-child": {
          marginBottom: 0,
        },
        "& :not(pre) > code": {
          padding: "0.2em 0.4em",
          margin: 0,
          borderRadius: "6px",
          fontSize: "0.875em",
          backgroundColor: "var(--chakra-colors-bg-muted)",
        },
        "& pre": {
          overflowX: "auto",
          marginTop: 0,
          marginBottom: "1rem",
          padding: "16px",
          borderRadius: "6px",
          fontSize: "0.9em",
          lineHeight: 1.45,
          backgroundColor: "var(--chakra-colors-bg-subtle)",
        },
        "& pre code": {
          backgroundColor: "transparent",
          color: "inherit",
          padding: 0,
          fontSize: "inherit",
        },
        "& hr": {
          height: "0.25em",
          margin: "24px 0",
          border: "0",
          backgroundColor: "var(--chakra-colors-border-muted)",
        },
        "& img": {
          maxWidth: "100%",
          borderRadius: "6px",
        },
      }}
    >
      {children}
    </Box>
  )
}
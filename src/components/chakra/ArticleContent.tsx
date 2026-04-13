import type { PropsWithChildren } from "react"
import { Box } from "@chakra-ui/react"

export function ArticleContent({ children }: PropsWithChildren) {
  return <Box className="article-content">{children}</Box>
}
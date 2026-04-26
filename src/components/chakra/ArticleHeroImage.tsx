import { Box, Image } from "@chakra-ui/react"

type ArticleHeroImageProps = {
  src: string
}

export function ArticleHeroImage({ src }: ArticleHeroImageProps) {
  return (
    <Box overflow="hidden">
      <Image src={src} alt="" w="full" maxH="20rem" objectFit="cover" />
    </Box>
  )
}
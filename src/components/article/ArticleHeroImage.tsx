type ArticleHeroImageProps = {
	src: string;
};

export function ArticleHeroImage({ src }: ArticleHeroImageProps) {
	return (
		<figure className="article-hero">
			<img className="article-hero__image" src={src} alt="" />
		</figure>
	);
}

import { COPYRIGHT_CC_LICENSES, type CopyrightConfig } from '../../lib/copyright';

type ArticleCopyrightProps = {
	copyright?: CopyrightConfig;
};

export function ArticleCopyright({ copyright }: ArticleCopyrightProps) {
	if (!copyright) {
		return null;
	}

	const ccLicense = copyright.kind === 'cc' ? COPYRIGHT_CC_LICENSES[copyright.license] : undefined;

	return (
		<section className="article-copyright" aria-labelledby="article-copyright-heading">
			<div className="article-copyright__panel">
				<h2 id="article-copyright-heading" className="article-copyright__heading">
					版权声明
				</h2>

				{ccLicense ? (
					<div className="article-copyright__content">
						<a
							href={ccLicense.href}
							target="_blank"
							rel="noreferrer"
							className="article-copyright__badge-link"
						>
							<img
								className="article-copyright__badge"
								src={ccLicense.badgeSrc}
								alt={`${ccLicense.label} 官方徽章`}
								width={88}
								height={31}
							/>
						</a>

						<p className="article-copyright__body">
							本文采用{' '}
							<a href={ccLicense.href} target="_blank" rel="noreferrer" className="article-copyright__link">
								{ccLicense.label}
							</a>{' '}
							许可协议。使用本文内容时，请依照协议要求注明作者与出处。
						</p>
					</div>
				) : (
					<p className="article-copyright__body">
						{copyright.statement ??
							'本文著作权归作者所有。未经作者明确许可，不得转载、摘编、改编或以其他形式公开发布。'}
					</p>
				)}

				<p className="article-copyright__footnote">
					{copyright.kind === 'cc'
						? '如另有说明，以对应说明为准。'
						: '如需授权，请先与作者联系。'}
				</p>
			</div>
		</section>
	);
}

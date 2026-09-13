import Giscus from '@giscus/react';
import { useEffect, useState } from 'react';
import { getGiscusThemeUrl } from '../lib/giscus-theme';
import { isAppearanceChangeForSubscribers, type SiteAppearanceChangeDetail } from '../lib/site-events';
import { getGiscusConfig } from '../lib/site-config';

export default function ArticleComments() {
	const giscus = getGiscusConfig();
	const [giscusTheme, setGiscusTheme] = useState<string | null>(null);

	useEffect(() => {
		if (!giscus) {
			return;
		}

		const syncGiscusTheme = () => setGiscusTheme(getGiscusThemeUrl());

		syncGiscusTheme();
		const onAppearanceChange = (event: CustomEvent<SiteAppearanceChangeDetail>) => {
			if (!isAppearanceChangeForSubscribers(event.detail.reason)) {
				return;
			}

			syncGiscusTheme();
		};

		document.addEventListener('site:appearance-change', onAppearanceChange);

		return () => {
			document.removeEventListener('site:appearance-change', onAppearanceChange);
		};
	}, [giscus]);

	if (!giscus) {
		return null;
	}

	return (
		<section aria-label="评论区" data-out-of-site-ugc="giscus" style={{ marginTop: '3rem' }}>
			{giscusTheme && (
				<Giscus
					repo={giscus.repo as `${string}/${string}`}
					repoId={giscus.repoId}
					category={giscus.category}
					categoryId={giscus.categoryId}
					mapping={(giscus.mapping ?? 'pathname') as 'pathname'}
					strict={(giscus.strict ?? '0') as '0' | '1'}
					reactionsEnabled={(giscus.reactionsEnabled ?? '1') as '0' | '1'}
					emitMetadata={(giscus.emitMetadata ?? '0') as '0' | '1'}
					inputPosition={giscus.inputPosition ?? 'top'}
					theme={giscusTheme}
					lang={giscus.lang ?? 'zh-CN'}
					loading={(giscus.loading ?? 'eager') as 'eager' | 'lazy'}
				/>
			)}
		</section>
	);
}

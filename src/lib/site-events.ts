import type { ResolvedTheme, SiteAppearanceState, ThemePreference } from './site-appearance';

export type AppearanceChangeReason = 'user' | 'system' | 'navigation';

export type SiteAppearanceChangeDetail = SiteAppearanceState & {
	reason: AppearanceChangeReason;
};

declare global {
	interface DocumentEventMap {
		'site:appearance-change': CustomEvent<SiteAppearanceChangeDetail>;
		'site:nav-layout-change': Event;
	}
}

export function isAppearanceChangeForSubscribers(reason: AppearanceChangeReason): boolean {
	return reason === 'user' || reason === 'system';
}

export function dispatchSiteAppearanceChange(
	state: SiteAppearanceState,
	reason: AppearanceChangeReason,
): void {
	document.dispatchEvent(
		new CustomEvent('site:appearance-change', {
			detail: {
				...state,
				reason,
			},
		}),
	);
}

export function dispatchSiteNavLayoutChange(): void {
	document.dispatchEvent(new Event('site:nav-layout-change'));
}

export type { ThemePreference, ResolvedTheme, SiteAppearanceState };

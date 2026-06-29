import { FloatingMenu } from '@umamichi-ui/common-components/menu';
import {
	applySitePalette,
	paletteManifest,
} from '../lib/site-palette';

type PaletteDropdownProps = {
	className?: string;
	wrapClassName?: string;
};

function PaletteMenuLabel({ swatch, text }: { swatch: string; text: string }) {
	return (
		<span className="site-palette-menu-item">
			<span
				className="site-palette-menu-item__swatch"
				style={{ background: swatch }}
				aria-hidden="true"
			/>
			<span>{text}</span>
		</span>
	);
}

function PaletteIcon() {
	return (
		<svg
			className="site-palette-icon"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
			<circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
			<circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
			<circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
			<circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
		</svg>
	);
}

export default function PaletteDropdown({ className, wrapClassName }: PaletteDropdownProps) {
	const items = [
		{
			kind: 'item' as const,
			id: 'default',
			label: (
				<PaletteMenuLabel swatch={paletteManifest.default.swatch} text={paletteManifest.default.label} />
			),
			title: paletteManifest.default.intro,
			onSelect: () => applySitePalette(null),
		},
		...paletteManifest.palettes.map((palette) => ({
			kind: 'item' as const,
			id: palette.id,
			label: <PaletteMenuLabel swatch={palette.swatch} text={palette.label} />,
			title: palette.intro,
			onSelect: () => applySitePalette(palette.id),
		})),
	];

	const wrapClasses = ['dropdown-menu', 'site-header__palette-dropdown', wrapClassName]
		.filter(Boolean)
		.join(' ');

	return (
		<FloatingMenu
			menuAriaLabel="选择主题色板"
			items={items}
			triggerVariant="icon"
			wrapClassName={wrapClasses}
			triggerClassName={[
				'site-icon-button',
				'dropdown-menu-trigger',
				'dropdown-menu-trigger--icon',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			triggerAriaLabel="选择主题色板"
			triggerIcon={<PaletteIcon />}
		/>
	);
}

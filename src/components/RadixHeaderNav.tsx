import * as NavigationMenu from '@radix-ui/react-navigation-menu';

type NavItem = {
	href: string;
	label: string;
};

type Props = {
	currentPath: string;
	items: NavItem[];
};

function isActivePath(currentPath: string, href: string) {
	if (href === '/') {
		return currentPath === '/';
	}

	return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function RadixHeaderNav({ currentPath, items }: Props) {
	return (
		<NavigationMenu.Root className="nav-menu-root">
			<NavigationMenu.List className="nav-menu-list">
				{items.map((item) => {
					const active = isActivePath(currentPath, item.href);

					return (
						<NavigationMenu.Item key={item.href}>
							<NavigationMenu.Link
								href={item.href}
								className={`nav-menu-link${active ? ' active' : ''}`}
								data-active={active ? '' : undefined}
							>
								{item.label}
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					);
				})}
				<NavigationMenu.Indicator className="nav-menu-indicator" />
			</NavigationMenu.List>
		</NavigationMenu.Root>
	);
}
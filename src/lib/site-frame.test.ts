import { describe, expect, it } from 'vitest';
import { getActiveNavIndex, isActiveLink, normalizeNavPath } from './site-frame';

describe('normalizeNavPath', () => {
	it('strips trailing slashes and maps root to /', () => {
		expect(normalizeNavPath('/blog/')).toBe('/blog');
		expect(normalizeNavPath('/')).toBe('/');
		expect(normalizeNavPath('///')).toBe('/');
	});

	it('decodes percent-encoded segments', () => {
		expect(normalizeNavPath('/blog/shanghai-jeju%20hsr/')).toBe('/blog/shanghai-jeju hsr');
		expect(normalizeNavPath('/blog/shanghai-jeju hsr/')).toBe('/blog/shanghai-jeju hsr');
	});
});

describe('isActiveLink', () => {
	it('matches exact paths ignoring trailing slashes', () => {
		expect(isActiveLink('/blog/', '/blog')).toBe(true);
		expect(isActiveLink('/blog/', '/blog/')).toBe(true);
		expect(isActiveLink('/', '/')).toBe(true);
		expect(isActiveLink('/', '/blog/')).toBe(false);
	});

	it('matches ancestor folders for nested paths', () => {
		expect(isActiveLink('/blog/', '/blog/post/')).toBe(true);
		expect(
			isActiveLink(
				'/blog/shanghai-jeju hsr/',
				'/blog/shanghai-jeju hsr/shanghai-jeju-hsr-imaginary-yuanbao-dialogue/',
			),
		).toBe(true);
	});

	it('matches when pathname is percent-encoded and href has a literal space', () => {
		expect(isActiveLink('/blog/shanghai-jeju hsr/', '/blog/shanghai-jeju%20hsr/')).toBe(true);
		expect(
			isActiveLink(
				'/blog/shanghai-jeju hsr/',
				'/blog/shanghai-jeju%20hsr/shanghai-jeju-hsr-imaginary-yuanbao-dialogue/',
			),
		).toBe(true);
	});

	it('does not match unrelated siblings', () => {
		expect(isActiveLink('/blog/foo/', '/blog/food/')).toBe(false);
		expect(isActiveLink('/blog/shanghai-jeju hsr/', '/blog/other/')).toBe(false);
	});
});

describe('getActiveNavIndex', () => {
	it('finds the active top-level item with encoded current paths', () => {
		const navItems = [{ href: '/' }, { href: '/blog/' }, { href: '/about/' }];
		expect(getActiveNavIndex(navItems, '/blog/shanghai-jeju%20hsr/')).toBe(1);
	});
});

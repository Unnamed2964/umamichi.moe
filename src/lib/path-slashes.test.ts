import { describe, expect, it } from 'vitest';
import { stripEdgeSlashes, stripLeadingSlashes, stripTrailingSlashes } from './path-slashes.mjs';

describe('path-slashes', () => {
	it('strips trailing slashes', () => {
		expect(stripTrailingSlashes('/foo/bar///')).toBe('/foo/bar');
		expect(stripTrailingSlashes('///')).toBe('');
		expect(stripTrailingSlashes('plain')).toBe('plain');
	});

	it('strips leading slashes', () => {
		expect(stripLeadingSlashes('///foo/bar')).toBe('foo/bar');
		expect(stripLeadingSlashes('///')).toBe('');
	});

	it('strips both edges', () => {
		expect(stripEdgeSlashes('//foo/bar//')).toBe('foo/bar');
		expect(stripEdgeSlashes('/')).toBe('');
	});
});

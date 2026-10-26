import { describe, expect, it } from 'vitest';
// @ts-expect-error The rehype plugin is a build-time .mjs script without TS declarations.
import rehypeWrapMermaidSource from '../../scripts/rehype-wrap-mermaid-source.mjs';

describe('rehypeWrapMermaidSource', () => {
	it('stores Mermaid source in a hidden pre instead of a script element', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'element',
					tagName: 'pre',
					properties: {},
					children: [
						{
							type: 'element',
							tagName: 'code',
							properties: { className: ['language-mermaid'] },
							children: [{ type: 'text', value: 'flowchart TD\n  A --> B' }],
						},
					],
				},
			],
		};

		rehypeWrapMermaidSource()(tree);

		expect(tree.children[0]).toMatchObject({
			type: 'element',
			tagName: 'div',
			properties: {
				className: ['article-copyable-block'],
				dataCopyKind: 'mermaid',
			},
			children: [
				{
					type: 'element',
					tagName: 'pre',
					properties: {
						className: ['article-copy-source'],
						hidden: true,
						ariaHidden: 'true',
					},
					children: [{ type: 'text', value: 'flowchart TD\n  A --> B' }],
				},
				{
					type: 'element',
					tagName: 'pre',
				},
			],
		});
		expect(JSON.stringify(tree)).not.toContain('"tagName":"script"');
	});
});

import { describe, expect, it } from 'vitest';
import rehypeWrapMermaidSource from '../../scripts/rehype-wrap-mermaid-source.mjs';

describe('rehypeWrapMermaidSource', () => {
	it('stores mermaid source in a hidden textarea', () => {
		const tree: any = {
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
							children: [{ type: 'text', value: 'flowchart TD\n  a --> b\n' }],
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
					tagName: 'textarea',
					properties: {
						className: ['article-copy-source'],
						hidden: true,
						readOnly: true,
					},
					children: [{ type: 'text', value: 'flowchart TD\n  a --> b\n' }],
				},
				{
					type: 'element',
					tagName: 'pre',
				},
			],
		});
	});
});

import { toText } from 'hast-util-to-text';
import { visitParents } from 'unist-util-visit-parents';

const NON_WHITESPACE_PATTERN = /\w/;

function getClassNames(element) {
	let className = element.properties?.className;

	if (typeof className === 'string') {
		className = className.split(/\s+/);
	}

	if (!Array.isArray(className)) {
		return [];
	}

	return className;
}

function isMermaidPreCode(code, pre) {
	if (!getClassNames(code).includes('language-mermaid')) {
		return false;
	}

	for (const child of pre.children) {
		if (child.type === 'text') {
			if (NON_WHITESPACE_PATTERN.test(child.value)) {
				return false;
			}
		} else if (child !== code) {
			return false;
		}
	}

	return true;
}

export default function rehypeWrapMermaidSource() {
	return function transformer(tree) {
		const instances = [];

		visitParents(tree, 'element', (node, ancestors) => {
			if (node.tagName !== 'code') {
				return;
			}

			const pre = ancestors.at(-1);

			if (!pre || pre.type !== 'element' || pre.tagName !== 'pre') {
				return;
			}

			if (!isMermaidPreCode(node, pre)) {
				return;
			}

			const container = ancestors.at(-2);

			if (!container || !Array.isArray(container.children)) {
				return;
			}

			if (
				container.type === 'element'
				&& container.tagName === 'div'
				&& getClassNames(container).includes('article-copyable-block')
			) {
				return;
			}

			instances.push({ pre, container, code: node });
		});

		for (const { pre, container, code } of instances) {
			const preIndex = container.children.indexOf(pre);

			if (preIndex < 0) {
				continue;
			}

			const diagram = toText(code, { whitespace: 'pre' });

			container.children[preIndex] = {
				type: 'element',
				tagName: 'div',
				properties: {
					className: ['article-copyable-block'],
					dataCopyKind: 'mermaid',
				},
				children: [
					{
						type: 'element',
						tagName: 'script',
						properties: {
							type: 'text/plain',
							className: ['article-copy-source'],
							hidden: true,
						},
						children: [{ type: 'text', value: diagram }],
					},
					pre,
				],
			};
		}
	};
}

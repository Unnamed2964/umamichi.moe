import { useOverlayPresence, withOverlayOpen } from '@umamichi-ui/common-components/presence';
import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { LuList, LuX } from 'react-icons/lu';
import type { ArticleTocHeading } from '../../lib/article-toc';
import { filterArticleTocHeadings } from '../../lib/article-toc';
import { ArticleTocLinks } from './ArticleToc';

type ArticleMobileTocProps = {
	headings: ArticleTocHeading[];
};

const DESKTOP_TOC_MQ = '(min-width: 80rem)';

export default function ArticleMobileToc({ headings }: ArticleMobileTocProps) {
	const items = filterArticleTocHeadings(headings);
	const titleId = useId();
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const { mounted, isOpen, overlayRef } = useOverlayPresence(open);

	useEffect(() => {
		if (items.length === 0) {
			return;
		}

		const media = window.matchMedia(DESKTOP_TOC_MQ);
		const onChange = () => {
			if (media.matches) {
				setOpen(false);
			}
		};

		media.addEventListener('change', onChange);
		return () => media.removeEventListener('change', onChange);
	}, [items.length]);

	useEffect(() => {
		if (!open) {
			delete document.documentElement.dataset.mobileTocOpen;
			return;
		}

		document.documentElement.dataset.mobileTocOpen = 'true';
		const previousOverflow = document.documentElement.style.overflow;
		document.documentElement.style.overflow = 'hidden';

		return () => {
			delete document.documentElement.dataset.mobileTocOpen;
			document.documentElement.style.overflow = previousOverflow;
		};
	}, [open]);

	useEffect(() => {
		if (!mounted) {
			return;
		}

		window.dispatchEvent(new Event('site:toc-refresh'));
		return () => {
			window.dispatchEvent(new Event('site:toc-refresh'));
		};
	}, [mounted]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		closeButtonRef.current?.focus();
	}, [isOpen]);

	useEffect(() => {
		if (!open) {
			return;
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				setOpen(false);
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [open]);

	useEffect(() => {
		const hideForViewTransition = () => {
			setOpen(false);
			document.documentElement.dataset.mobileTocVtHide = 'true';
			delete document.documentElement.dataset.mobileTocOpen;
			document.documentElement.style.overflow = '';
		};

		const showAfterViewTransition = () => {
			const reveal = () => {
				if (document.documentElement.hasAttribute('data-astro-transition')) {
					return false;
				}
				delete document.documentElement.dataset.mobileTocVtHide;
				return true;
			};

			if (reveal()) {
				return;
			}

			const observer = new MutationObserver(() => {
				if (reveal()) {
					observer.disconnect();
				}
			});
			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['data-astro-transition'],
			});
			window.setTimeout(() => {
				observer.disconnect();
				delete document.documentElement.dataset.mobileTocVtHide;
			}, 1000);
		};

		document.addEventListener('astro:before-preparation', hideForViewTransition);
		document.addEventListener('astro:after-swap', showAfterViewTransition);
		return () => {
			document.removeEventListener('astro:before-preparation', hideForViewTransition);
			document.removeEventListener('astro:after-swap', showAfterViewTransition);
			delete document.documentElement.dataset.mobileTocVtHide;
		};
	}, []);

	if (items.length === 0) {
		return null;
	}

	const close = () => setOpen(false);

	const sheet =
		mounted &&
		createPortal(
			<div
				ref={overlayRef as RefObject<HTMLDivElement>}
				className={withOverlayOpen('article-mobile-toc-backdrop', isOpen)}
				role="presentation"
				onClick={(event) => {
					if (event.target === event.currentTarget) {
						close();
					}
				}}
			>
				<div
					className="article-mobile-toc-sheet"
					role="dialog"
					aria-modal="true"
					aria-labelledby={titleId}
					data-mobile-toc-sheet
					onClick={(event) => event.stopPropagation()}
				>
					<header className="article-mobile-toc-sheet__header">
						<p id={titleId} className="article-mobile-toc-sheet__title">
							目录
						</p>
						<button
							ref={closeButtonRef}
							type="button"
							className="article-mobile-toc-sheet__close site-icon-button"
							aria-label="关闭目录"
							onClick={close}
						>
							<LuX aria-hidden="true" focusable="false" />
						</button>
					</header>

					<nav
						aria-label="文章目录"
						data-toc
						className="article-mobile-toc-sheet__nav"
						onClick={(event) => {
							const link = (event.target as HTMLElement).closest('[data-toc-link]');
							if (link) {
								close();
							}
						}}
					>
						<div className="article-mobile-toc-sheet__scroll">
							<ArticleTocLinks headings={items} />
						</div>
					</nav>
				</div>
			</div>,
			document.body,
		);

	return (
		<div className="article-mobile-toc">
			<button
				type="button"
				className="article-mobile-toc-fab"
				aria-label="打开文章目录"
				aria-expanded={open}
				aria-haspopup="dialog"
				onClick={() => setOpen(true)}
			>
				<LuList className="article-mobile-toc-fab__icon" aria-hidden="true" focusable="false" />
				<span>目录</span>
			</button>
			{sheet}
		</div>
	);
}

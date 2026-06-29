const INIT_KEY = '__siteViewTransitionLifecycleInit';

type LifecycleCallback = () => void;
type TransitionEventCallback = (event: Event) => void;

const afterSwapCallbacks = new Set<LifecycleCallback>();
const beforePreparationCallbacks = new Set<TransitionEventCallback>();
const beforeSwapCallbacks = new Set<TransitionEventCallback>();

declare global {
	interface Window {
		[INIT_KEY]?: boolean;
		__siteRegisterAfterSwap?: (callback: LifecycleCallback, runImmediately?: boolean) => () => void;
		__siteRegisterBeforePreparation?: (callback: TransitionEventCallback) => () => void;
	}
}

export function onAfterSwap(callback: LifecycleCallback): () => void {
	afterSwapCallbacks.add(callback);
	return () => afterSwapCallbacks.delete(callback);
}

export function onBeforePreparation(callback: TransitionEventCallback): () => void {
	beforePreparationCallbacks.add(callback);
	return () => beforePreparationCallbacks.delete(callback);
}

export function onBeforeSwap(callback: TransitionEventCallback): () => void {
	beforeSwapCallbacks.add(callback);
	return () => beforeSwapCallbacks.delete(callback);
}

export function registerAfterSwap(callback: LifecycleCallback, runImmediately = true): () => void {
	const unregister = onAfterSwap(callback);

	if (runImmediately) {
		callback();
	}

	return unregister;
}

export function initViewTransitionLifecycle(): void {
	if (window[INIT_KEY]) {
		return;
	}

	window[INIT_KEY] = true;

	window.__siteRegisterAfterSwap = registerAfterSwap;
	window.__siteRegisterBeforePreparation = onBeforePreparation;

	document.addEventListener('astro:after-swap', () => {
		for (const callback of afterSwapCallbacks) {
			callback();
		}
	});

	document.addEventListener('astro:before-preparation', (event) => {
		for (const callback of beforePreparationCallbacks) {
			callback(event);
		}
	});

	document.addEventListener('astro:before-swap', (event) => {
		for (const callback of beforeSwapCallbacks) {
			callback(event);
		}
	});
}

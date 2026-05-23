import { initWindowsPhoneMotionNavigation, suppressMotionTemporarily } from '@umamichi-ui/windows-phone-motion/navigation';

export function initSiteWindowsPhoneMotion() {
	initWindowsPhoneMotionNavigation({ activateFeather: true });
}

export { suppressMotionTemporarily };

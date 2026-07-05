import { useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";

function clamp(number: number, a: number, b: number) {
	const min = Math.min(a, b);
	const max = Math.max(a, b);
	return Math.min(Math.max(number, min), max);
}

const useHeader = () => {
	const headerRef = useRef<HTMLDivElement>(null);
	const avatarRef = useRef<HTMLDivElement>(null);
	const isInitial = useRef(true);

	const location = useLocation();
	// All routes are /{lang}/... so the home page is /{lang} or /{lang}/ (never bare /)
	const isHomePage = /^\/(en|vi)\/?$/.test(location.pathname);

	// Helper functions for manipulating CSS properties
	const setProperty = useCallback((property: string, value: string) => {
		document.documentElement.style.setProperty(property, value);
	}, []);

	const removeProperty = useCallback((property: string) => {
		document.documentElement.style.removeProperty(property);
	}, []);

	// Update header styles on scroll
	const updateHeaderStyles = useCallback(() => {
		if (!headerRef.current) return;

		const { top, height } = headerRef.current.getBoundingClientRect();
		const downDelay = avatarRef.current?.offsetTop ?? 0;
		const scrollY = clamp(
			window.scrollY,
			0,
			document.body.scrollHeight - window.innerHeight,
		);

		if (isInitial.current) {
			setProperty("--header-position", "sticky");
		}

		setProperty("--content-offset", `${downDelay}px`);

		if (isInitial.current || scrollY < downDelay) {
			setProperty("--header-height", `${downDelay + height}px`);
			setProperty("--header-mb", `${-downDelay}px`);
		} else {
			setProperty("--header-height", `${scrollY + height}px`);
			setProperty("--header-mb", `${-scrollY}px`);
		}

		if (top === 0 && scrollY > 0 && scrollY >= downDelay) {
			setProperty("--header-inner-position", "fixed");
			removeProperty("--header-top");
			removeProperty("--avatar-top");
		} else {
			removeProperty("--header-inner-position");
			setProperty("--header-top", "0px");
			setProperty("--avatar-top", "0px");
		}
	}, [setProperty, removeProperty]);

	// Update avatar styles based on scroll position
	const updateAvatarStyles = useCallback(() => {
		if (!isHomePage || !avatarRef.current) return;

		const downDelay = avatarRef.current.offsetTop ?? 0;
		const fromScale = 1;
		const toScale = 36 / 64;
		const fromX = 0;
		const toX = 2 / 16;

		const scrollY = downDelay - window.scrollY;

		let scale = (scrollY * (fromScale - toScale)) / downDelay + toScale;
		scale = clamp(scale, fromScale, toScale);

		let x = (scrollY * (fromX - toX)) / downDelay + toX;
		x = clamp(x, fromX, toX);

		setProperty(
			"--avatar-image-transform",
			`translate3d(${x}rem, 0, 0) scale(${scale})`,
		);

		const borderScale = 1 / (toScale / scale);
		const borderX = (-toX + x) * borderScale;
		const borderTransform = `translate3d(${borderX}rem, 0, 0) scale(${borderScale})`;

		setProperty("--avatar-border-transform", borderTransform);
		setProperty("--avatar-border-opacity", scale === toScale ? "1" : "0");
	}, [isHomePage, setProperty]);

	// Combined update function
	const updateStyles = useCallback(() => {
		updateHeaderStyles();
		updateAvatarStyles();
		isInitial.current = false;
	}, [updateHeaderStyles, updateAvatarStyles]);

	useEffect(() => {
		updateStyles();

		window.addEventListener("scroll", updateStyles, { passive: true });
		window.addEventListener("resize", updateStyles);

		return () => {
			window.removeEventListener("scroll", updateStyles);
			window.removeEventListener("resize", updateStyles);
		};
	}, [updateStyles]);

	return {
		isHomePage,
		headerRef,
		avatarRef,
	};
};

export default useHeader;

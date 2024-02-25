export const measureTime = (id: string) => {
	const t0 = performance.now();
	let race = false;
	const log = () => {
		const t1 = performance.now();
		const diff = t1 - t0;
		console.info(`  ⧖ \u001b[32m${id}\u001b[0m \u001b[90mtook\u001b[0m \u001b[93m${Math.round(diff)}ms\u001b[0m`);
		return diff;
	};
	function f() {
		if (race) return;
		race = true;
		return log();
	}
	// @ts-expect-error attach dispose
	f[Symbol.dispose] = () => {
		if (race) return;
		race = true;
		log();
	};
	return f;
};

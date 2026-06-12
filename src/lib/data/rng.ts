/* =========================================================================
   Therra — Seeded PRNG
   -------------------------------------------------------------------------
   Deterministic randomness so the demo dataset is byte-identical on every
   load (no Date.now() / Math.random()). xmur3 hashes a string seed into a
   32-bit state; mulberry32 turns that into a uniform stream; gaussian() adds
   Box–Muller normal noise. Each asset seeds its own stream from its id so
   adding/removing one asset never reshuffles the others.
   ========================================================================= */

/** Hash a string seed → 32-bit unsigned integer (xmur3). */
export function xmur3(str: string): () => number {
	let h = 1779033703 ^ str.length
	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
		h = (h << 13) | (h >>> 19)
	}
	return () => {
		h = Math.imul(h ^ (h >>> 16), 2246822507)
		h = Math.imul(h ^ (h >>> 13), 3266489909)
		h ^= h >>> 16
		return h >>> 0
	}
}

/** Uniform [0,1) generator from a 32-bit seed (mulberry32). */
export function mulberry32(seed: number): () => number {
	let a = seed >>> 0
	return () => {
		a |= 0
		a = (a + 0x6d2b79f5) | 0
		let t = Math.imul(a ^ (a >>> 15), 1 | a)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

export interface Rng {
	/** Uniform [0,1). */
	next: () => number
	/** Uniform float in [lo, hi). */
	range: (lo: number, hi: number) => number
	/** Integer in [lo, hi] inclusive. */
	int: (lo: number, hi: number) => number
	/** Normal sample with the given mean / standard deviation. */
	gaussian: (mean: number, sd: number) => number
	/** Pick one element. */
	pick: <T>(xs: readonly T[]) => T
}

/** Build a self-contained RNG from a string seed. */
export function makeRng(seed: string): Rng {
	const next = mulberry32(xmur3(seed)())
	const range = (lo: number, hi: number) => lo + (hi - lo) * next()
	return {
		next,
		range,
		int: (lo: number, hi: number) => Math.floor(range(lo, hi + 1)),
		gaussian: (mean: number, sd: number) => {
			// Box–Muller; guard against log(0).
			const u1 = Math.max(next(), 1e-9)
			const u2 = next()
			return (
				mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
			)
		},
		pick: <T>(xs: readonly T[]): T => {
			const v = xs[Math.floor(next() * xs.length)]
			if (v === undefined) throw new Error('pick() from empty array')
			return v
		},
	}
}

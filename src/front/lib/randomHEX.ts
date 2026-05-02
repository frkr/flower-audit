const LOOKUP_TABLE = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

// # !IMPORTANT! Use this with size 16 for ALL TABLE RECORDS ID.
// This function generates a 128-character hex string from a SHA-512 hash of 'size' random bytes.
export default async function (size = 16) {
	const bytes = new Uint8Array(
		await crypto.subtle.digest("sha-512", crypto.getRandomValues(new Uint8Array(size)))
	);
	
	let hex = "";
	for (let i = 0; i < bytes.length; i++) {
		hex += LOOKUP_TABLE[bytes[i]];
	}
	return hex;
}

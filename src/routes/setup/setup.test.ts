import { describe, it, expect } from "vitest";
import { isSecret, maskValue } from "./setup";

describe("Setup Masking Logic", () => {
	it("should identify secret names correctly", () => {
		expect(isSecret("api_secret")).toBe(true);
		expect(isSecret("SECRET_KEY")).toBe(true);
		expect(isSecret("google_client_secret")).toBe(true);
		expect(isSecret("normal_field")).toBe(false);
	});

	it("should mask secrets with exactly 8 asterisks", () => {
		const emptyLabel = "Empty";
		expect(maskValue("api_secret", "short", emptyLabel)).toBe("********");
		expect(maskValue("api_secret", "very_long_secret_value_here", emptyLabel)).toBe("********");
		expect(maskValue("api_secret", "exactly8", emptyLabel)).toBe("********");
	});

	it("should not mask non-secret values", () => {
		const emptyLabel = "Empty";
		expect(maskValue("normal_field", "some_value", emptyLabel)).toBe("some_value");
	});

	it("should return empty label for empty values", () => {
		const emptyLabel = "Empty";
		expect(maskValue("api_secret", "", emptyLabel)).toBe(emptyLabel);
		expect(maskValue("normal_field", "", emptyLabel)).toBe(emptyLabel);
	});
});

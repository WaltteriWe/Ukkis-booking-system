import {
  validateSlugFormat,
  validatePackageDifficulty,
  validatePackagePrice,
  validatePackageCapacity,
} from "./packageController";

describe("packageController", () => {
  describe("validateSlugFormat", () => {
    test("accepts valid slugs", () => {
      expect(validateSlugFormat("northern-lights")).toBe(true);
      expect(validateSlugFormat("safari-2024")).toBe(true);
      expect(validateSlugFormat("ice-fishing-tour")).toBe(true);
      expect(validateSlugFormat("abc")).toBe(true);
    });

    test("rejects slugs that are too short", () => {
      expect(validateSlugFormat("ab")).toBe(false);
      expect(validateSlugFormat("a")).toBe(false);
      expect(validateSlugFormat("")).toBe(false);
    });

    test("rejects slugs with uppercase letters", () => {
      expect(validateSlugFormat("Northern-Lights")).toBe(false);
      expect(validateSlugFormat("SAFARI")).toBe(false);
    });

    test("rejects slugs with special characters", () => {
      expect(validateSlugFormat("safari_tour")).toBe(false);
      expect(validateSlugFormat("safari tour")).toBe(false);
      expect(validateSlugFormat("safari.tour")).toBe(false);
      expect(validateSlugFormat("safari/tour")).toBe(false);
    });

    test("rejects null or undefined slugs", () => {
      expect(validateSlugFormat(null as any)).toBe(false);
      expect(validateSlugFormat(undefined as any)).toBe(false);
    });
  });

  describe("validatePackageDifficulty", () => {
    test("accepts valid difficulty levels", () => {
      expect(validatePackageDifficulty("Easy")).toBe(true);
      expect(validatePackageDifficulty("Moderate")).toBe(true);
      expect(validatePackageDifficulty("Advanced")).toBe(true);
    });

    test("rejects invalid difficulty levels", () => {
      expect(validatePackageDifficulty("easy")).toBe(false); // case sensitive
      expect(validatePackageDifficulty("Hard")).toBe(false);
      expect(validatePackageDifficulty("Beginner")).toBe(false);
      expect(validatePackageDifficulty("")).toBe(false);
    });

    test("rejects non-string values", () => {
      expect(validatePackageDifficulty(123 as any)).toBe(false);
      expect(validatePackageDifficulty(null as any)).toBe(false);
      expect(validatePackageDifficulty(undefined as any)).toBe(false);
    });
  });

  describe("validatePackagePrice", () => {
    test("accepts valid prices", () => {
      expect(validatePackagePrice(100)).toBe(true);
      expect(validatePackagePrice(50.5)).toBe(true);
      expect(validatePackagePrice(0.01)).toBe(true);
      expect(validatePackagePrice(9999.99)).toBe(true);
    });

    test("rejects zero or negative prices", () => {
      expect(validatePackagePrice(0)).toBe(false);
      expect(validatePackagePrice(-1)).toBe(false);
      expect(validatePackagePrice(-100.5)).toBe(false);
    });

    test("rejects non-finite numbers", () => {
      expect(validatePackagePrice(Infinity)).toBe(false);
      expect(validatePackagePrice(-Infinity)).toBe(false);
      expect(validatePackagePrice(NaN)).toBe(false);
    });
  });

  describe("validatePackageCapacity", () => {
    test("accepts valid capacities", () => {
      expect(validatePackageCapacity(1)).toBe(true);
      expect(validatePackageCapacity(8)).toBe(true);
      expect(validatePackageCapacity(20)).toBe(true);
      expect(validatePackageCapacity(50)).toBe(true);
    });

    test("rejects zero or negative capacities", () => {
      expect(validatePackageCapacity(0)).toBe(false);
      expect(validatePackageCapacity(-1)).toBe(false);
    });

    test("rejects capacities over 50", () => {
      expect(validatePackageCapacity(51)).toBe(false);
      expect(validatePackageCapacity(100)).toBe(false);
    });

    test("rejects non-integer capacities", () => {
      expect(validatePackageCapacity(8.5)).toBe(false);
      expect(validatePackageCapacity(10.1)).toBe(false);
    });

    test("rejects non-numeric values", () => {
      expect(validatePackageCapacity(NaN)).toBe(false);
      expect(validatePackageCapacity(Infinity)).toBe(false);
    });
  });
});

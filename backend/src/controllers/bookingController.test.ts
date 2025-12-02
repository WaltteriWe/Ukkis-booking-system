import {
  calculateTotalPrice,
  extractDateTimeFromNotes,
  validateGearSizes,
} from "./bookingController";

describe("bookingController", () => {
  describe("calculateTotalPrice", () => {
    test("calculates price correctly", () => {
      expect(calculateTotalPrice(100, 3)).toBe(300);
      expect(calculateTotalPrice(50.5, 2)).toBe(101);
    });

    test("handles zero participants", () => {
      expect(calculateTotalPrice(100, 0)).toBe(0);
    });

    test("handles decimal base prices", () => {
      expect(calculateTotalPrice(99.99, 2)).toBe(199.98);
    });

    test("handles large numbers", () => {
      expect(calculateTotalPrice(1000, 10)).toBe(10000);
    });
  });

  describe("extractDateTimeFromNotes", () => {
    test("extracts date and time from valid notes", () => {
      const notes = "Date: 2025-12-01 Time: 14:30";
      const result = extractDateTimeFromNotes(notes);
      expect(result.bookingDate).toBe("2025-12-01");
      expect(result.bookingTime).toBe("14:30");
    });

    test("extracts only date when time is missing", () => {
      const notes = "Date: 2025-12-01";
      const result = extractDateTimeFromNotes(notes);
      expect(result.bookingDate).toBe("2025-12-01");
      expect(result.bookingTime).toBeNull();
    });

    test("extracts only time when date is missing", () => {
      const notes = "Time: 14:30";
      const result = extractDateTimeFromNotes(notes);
      expect(result.bookingDate).toBeNull();
      expect(result.bookingTime).toBe("14:30");
    });

    test("returns null values for notes without date/time", () => {
      const notes = "Just some random notes";
      const result = extractDateTimeFromNotes(notes);
      expect(result.bookingDate).toBeNull();
      expect(result.bookingTime).toBeNull();
    });

    test("returns null values for empty notes", () => {
      const result = extractDateTimeFromNotes("");
      expect(result.bookingDate).toBeNull();
      expect(result.bookingTime).toBeNull();
    });

    test("returns null values for undefined notes", () => {
      const result = extractDateTimeFromNotes(undefined);
      expect(result.bookingDate).toBeNull();
      expect(result.bookingTime).toBeNull();
    });

    test("handles complex notes with date and time embedded", () => {
      const notes =
        "Customer requested Date: 2025-11-30 and Time: 09:00 for the tour";
      const result = extractDateTimeFromNotes(notes);
      expect(result.bookingDate).toBe("2025-11-30");
      expect(result.bookingTime).toBe("09:00");
    });
  });

  describe("validateGearSizes", () => {
    test("returns true for valid gear sizes", () => {
      const gearSizes = {
        participant1: {
          name: "John Doe",
          overalls: "M",
          boots: "42",
          gloves: "L",
          helmet: "M",
        },
      };
      expect(validateGearSizes(gearSizes)).toBe(true);
    });

    test("returns true for multiple participants with valid gear", () => {
      const gearSizes = {
        participant1: {
          name: "John",
          overalls: "M",
          boots: "42",
          gloves: "L",
          helmet: "M",
        },
        participant2: {
          name: "Jane",
          overalls: "S",
          boots: "38",
          gloves: "M",
          helmet: "S",
        },
      };
      expect(validateGearSizes(gearSizes)).toBe(true);
    });

    test("returns false when gear is missing required fields", () => {
      const gearSizes = {
        participant1: {
          name: "John",
          overalls: "M",
          boots: "42",
          // missing gloves and helmet
        },
      };
      expect(validateGearSizes(gearSizes)).toBe(false);
    });

    test("returns true for undefined gear sizes", () => {
      expect(validateGearSizes(undefined)).toBe(true);
    });

    test("returns true for null gear sizes", () => {
      expect(validateGearSizes(null)).toBe(true);
    });

    test("returns false when any participant has incomplete gear", () => {
      const gearSizes = {
        participant1: {
          name: "John",
          overalls: "M",
          boots: "42",
          gloves: "L",
          helmet: "M",
        },
        participant2: {
          name: "Jane",
          overalls: "S",
          // missing boots, gloves, helmet
        },
      };
      expect(validateGearSizes(gearSizes)).toBe(false);
    });
  });
});

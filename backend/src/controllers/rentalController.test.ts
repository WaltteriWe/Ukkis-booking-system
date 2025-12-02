import {
  validateRentalTimeRange,
  calculateRentalDuration,
  calculateRentalPrice,
  isTimeRangeOverlapping,
} from "./rentalController";

describe("rentalController", () => {
  describe("validateRentalTimeRange", () => {
    test("returns true when start is before end", () => {
      const start = new Date("2025-12-01 10:00");
      const end = new Date("2025-12-01 14:00");
      expect(validateRentalTimeRange(start, end)).toBe(true);
    });

    test("returns false when start equals end", () => {
      const time = new Date("2025-12-01 10:00");
      expect(validateRentalTimeRange(time, time)).toBe(false);
    });

    test("returns false when start is after end", () => {
      const start = new Date("2025-12-01 14:00");
      const end = new Date("2025-12-01 10:00");
      expect(validateRentalTimeRange(start, end)).toBe(false);
    });

    test("works across different days", () => {
      const start = new Date("2025-12-01 23:00");
      const end = new Date("2025-12-02 02:00");
      expect(validateRentalTimeRange(start, end)).toBe(true);
    });
  });

  describe("calculateRentalDuration", () => {
    test("calculates duration in hours correctly", () => {
      const start = new Date("2025-12-01 10:00");
      const end = new Date("2025-12-01 14:00");
      expect(calculateRentalDuration(start, end)).toBe(4);
    });

    test("calculates half-hour durations", () => {
      const start = new Date("2025-12-01 10:00");
      const end = new Date("2025-12-01 10:30");
      expect(calculateRentalDuration(start, end)).toBe(0.5);
    });

    test("calculates multi-day durations", () => {
      const start = new Date("2025-12-01 10:00");
      const end = new Date("2025-12-02 10:00");
      expect(calculateRentalDuration(start, end)).toBe(24);
    });

    test("returns zero for same time", () => {
      const time = new Date("2025-12-01 10:00");
      expect(calculateRentalDuration(time, time)).toBe(0);
    });

    test("handles 15-minute intervals", () => {
      const start = new Date("2025-12-01 10:00");
      const end = new Date("2025-12-01 10:15");
      expect(calculateRentalDuration(start, end)).toBe(0.25);
    });
  });

  describe("calculateRentalPrice", () => {
    test("calculates price correctly", () => {
      expect(calculateRentalPrice(50, 4)).toBe(200);
    });

    test("handles fractional hours", () => {
      expect(calculateRentalPrice(50, 2.5)).toBe(125);
    });

    test("handles zero hours", () => {
      expect(calculateRentalPrice(50, 0)).toBe(0);
    });

    test("handles decimal hourly rates", () => {
      expect(calculateRentalPrice(49.99, 3)).toBe(149.97);
    });

    test("handles large values", () => {
      expect(calculateRentalPrice(100, 24)).toBe(2400);
    });
  });

  describe("isTimeRangeOverlapping", () => {
    test("detects overlapping ranges", () => {
      const start1 = new Date("2025-12-01 10:00");
      const end1 = new Date("2025-12-01 14:00");
      const start2 = new Date("2025-12-01 12:00");
      const end2 = new Date("2025-12-01 16:00");

      expect(isTimeRangeOverlapping(start1, end1, start2, end2)).toBe(true);
    });

    test("detects when first range contains second", () => {
      const start1 = new Date("2025-12-01 10:00");
      const end1 = new Date("2025-12-01 16:00");
      const start2 = new Date("2025-12-01 12:00");
      const end2 = new Date("2025-12-01 14:00");

      expect(isTimeRangeOverlapping(start1, end1, start2, end2)).toBe(true);
    });

    test("detects when second range contains first", () => {
      const start1 = new Date("2025-12-01 12:00");
      const end1 = new Date("2025-12-01 14:00");
      const start2 = new Date("2025-12-01 10:00");
      const end2 = new Date("2025-12-01 16:00");

      expect(isTimeRangeOverlapping(start1, end1, start2, end2)).toBe(true);
    });

    test("returns false for non-overlapping ranges", () => {
      const start1 = new Date("2025-12-01 10:00");
      const end1 = new Date("2025-12-01 12:00");
      const start2 = new Date("2025-12-01 14:00");
      const end2 = new Date("2025-12-01 16:00");

      expect(isTimeRangeOverlapping(start1, end1, start2, end2)).toBe(false);
    });

    test("returns false for adjacent ranges (end1 = start2)", () => {
      const start1 = new Date("2025-12-01 10:00");
      const end1 = new Date("2025-12-01 12:00");
      const start2 = new Date("2025-12-01 12:00");
      const end2 = new Date("2025-12-01 14:00");

      expect(isTimeRangeOverlapping(start1, end1, start2, end2)).toBe(false);
    });

    test("handles ranges on different days", () => {
      const start1 = new Date("2025-12-01 10:00");
      const end1 = new Date("2025-12-02 10:00");
      const start2 = new Date("2025-12-01 20:00");
      const end2 = new Date("2025-12-02 02:00");

      expect(isTimeRangeOverlapping(start1, end1, start2, end2)).toBe(true);
    });
  });
});

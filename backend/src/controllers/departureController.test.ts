import {
  calculateAvailableSeats,
  isDateInRange,
  calculateBookedSeats,
  isDepartureAvailable,
} from "./departureController";

describe("departureController", () => {
  describe("calculateAvailableSeats", () => {
    test("calculates available seats correctly", () => {
      expect(calculateAvailableSeats(10, 3)).toBe(7);
      expect(calculateAvailableSeats(20, 15)).toBe(5);
    });

    test("returns zero when fully booked", () => {
      expect(calculateAvailableSeats(10, 10)).toBe(0);
    });

    test("returns zero when overbooked", () => {
      expect(calculateAvailableSeats(10, 12)).toBe(0);
    });

    test("returns full capacity when no bookings", () => {
      expect(calculateAvailableSeats(10, 0)).toBe(10);
    });
  });

  describe("isDateInRange", () => {
    const testDate = new Date("2025-12-15");
    const earlyDate = new Date("2025-12-10");
    const lateDate = new Date("2025-12-20");

    test("returns true when date is in range", () => {
      expect(isDateInRange(testDate, earlyDate, lateDate)).toBe(true);
    });

    test("returns true when only from is specified and date is after", () => {
      expect(isDateInRange(testDate, earlyDate, undefined)).toBe(true);
    });

    test("returns true when only to is specified and date is before", () => {
      expect(isDateInRange(testDate, undefined, lateDate)).toBe(true);
    });

    test("returns true when no range is specified", () => {
      expect(isDateInRange(testDate, undefined, undefined)).toBe(true);
    });

    test("returns false when date is before from", () => {
      expect(isDateInRange(earlyDate, testDate, lateDate)).toBe(false);
    });

    test("returns false when date is after to", () => {
      expect(isDateInRange(lateDate, earlyDate, testDate)).toBe(false);
    });

    test("returns true for boundary dates", () => {
      expect(isDateInRange(testDate, testDate, lateDate)).toBe(true);
      expect(isDateInRange(testDate, earlyDate, testDate)).toBe(true);
    });
  });

  describe("calculateBookedSeats", () => {
    test("calculates total booked seats", () => {
      const bookings = [{ participants: 3 }, { participants: 5 }, { participants: 2 }];
      expect(calculateBookedSeats(bookings)).toBe(10);
    });

    test("returns zero for empty bookings", () => {
      expect(calculateBookedSeats([])).toBe(0);
    });

    test("handles single booking", () => {
      const bookings = [{ participants: 7 }];
      expect(calculateBookedSeats(bookings)).toBe(7);
    });

    test("handles large number of bookings", () => {
      const bookings = Array(50).fill({ participants: 2 });
      expect(calculateBookedSeats(bookings)).toBe(100);
    });
  });

  describe("isDepartureAvailable", () => {
    test("returns true when seats are available", () => {
      expect(isDepartureAvailable(10, 5)).toBe(true);
      expect(isDepartureAvailable(10, 9)).toBe(true);
      expect(isDepartureAvailable(20, 0)).toBe(true);
    });

    test("returns false when fully booked", () => {
      expect(isDepartureAvailable(10, 10)).toBe(false);
    });

    test("returns false when overbooked", () => {
      expect(isDepartureAvailable(10, 12)).toBe(false);
    });

    test("returns true for edge case with one seat left", () => {
      expect(isDepartureAvailable(10, 9)).toBe(true);
    });
  });
});

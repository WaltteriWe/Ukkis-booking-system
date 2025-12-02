import { hashPassword, signToken } from "./adminController";

describe("adminController", () => {
  describe("hashPassword", () => {
    test("returns same hash when password and salt are same", () => {
      const salt = "abc123";
      const first = hashPassword("password", salt);
      const second = hashPassword("password", salt);

      expect(first.salt).toBe(salt);
      expect(first.hash).toBe(second.hash);
    });

    test("returns different hash when passwords are different", () => {
      const salt = "abc123";
      const one = hashPassword("password1", salt);
      const two = hashPassword("password2", salt);

      expect(one.hash).not.toBe(two.hash);
    });

    test("generates random salt when not provided", () => {
      const one = hashPassword("password");
      const two = hashPassword("password");

      expect(one.salt).toBeDefined();
      expect(two.salt).toBeDefined();
      expect(one.salt).not.toBe(two.salt);
    });
  });

  describe("signToken", () => {
    test("creates token with adminId in base64", () => {
      process.env.ADMIN_TOKEN_SECRET = "test-secret";
      const token = signToken(123);

      const parts = token.split(".");
      expect(parts.length).toBe(2);

      // Verify signature exists
      const signature = parts[0];
      expect(signature.length).toBeGreaterThan(0);

      // Verify the second part is base64-encoded adminId
      const base64Id = parts[1];
      const decodedId = Buffer.from(base64Id, "base64").toString("utf8");
      expect(decodedId).toBe("123");
    });
  });
});

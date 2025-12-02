# Unit Testing Setup for Ukkis Booking System

## Current Status ✅

**Working:**

- Basic unit tests for `adminController` pure functions
- 4 tests passing: 3 for `hashPassword`, 1 for `signToken`
- Run tests with: `npm test`
- Tests execute in ~5 seconds

**Limitations:**

- Database operation testing blocked by architectural constraints
- Only pure functions (no Prisma dependencies) can be tested without refactoring

## Overview

This project has a basic testing setup using Jest and ts-jest. Currently, only pure functions without database dependencies can be tested due to how controllers instantiate Prisma Client at the module level.

## What's Been Done

### 1. Jest Configuration (`jest.config.js`)

- ✅ Configured ts-jest for TypeScript support
- ✅ Added coverage settings (collectCoverageFrom, coverageDirectory, coverageReporters)
- ✅ Configured automatic mock cleanup (clearMocks, resetMocks, restoreMocks)
- ✅ Set test environment to Node.js

### 2. Package.json Scripts

- ✅ `npm test` - Run all tests
- ✅ `npm run test:watch` - Run tests in watch mode
- ✅ `npm run test:coverage` - Run tests with coverage report
- ✅ `npm run test:verbose` - Run tests with detailed output

### 3. Test Files

- ✅ `adminController.test.ts` - **4 passing tests** for pure functions
  - Tests `hashPassword` function (consistency, different passwords, random salt)
  - Tests `signToken` function (base64 encoding, token structure)

### 4. Controller Modifications

- ✅ Exported helper functions from `adminController.ts`:
  - `export function hashPassword(password, salt?)` - now testable
  - `export function signToken(adminId)` - now testable

### 5. Prisma Client

- ✅ Regenerated to latest version (v6.19.0)

## The Core Problem

**Why can't we test database operations?**

All controllers instantiate Prisma Client at the module level:

```typescript
// In every controller file
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); // ❌ Executed immediately when module loads

export async function getPackages() {
  return prisma.package.findMany(); // Can't mock this!
}
```

Jest's mocking system cannot intercept this because:

1. `new PrismaClient()` runs **before** any test code
2. The `prisma` variable is a module-level singleton
3. Jest's `jest.mock()` can't replace already-instantiated objects

**Result:** All attempts to mock Prisma methods return `undefined`, causing tests to fail with errors like:

```
TypeError: Cannot read properties of undefined (reading 'findMany')
```

## Two Paths Forward

You have two options for expanding test coverage:

### Option A: Test Pure Functions Only (Quick & Easy) ✅

**What it means:**

- Extract business logic into pure functions that don't touch the database
- Test only these extracted functions
- Leave database operations untested

**Example:**

```typescript
// Extract validation logic
export function validateBookingData(data: any) {
  if (!data.email) throw new Error("Email required");
  if (!data.numberOfPeople || data.numberOfPeople < 1)
    throw new Error("Invalid count");
  return true;
}

// Test the validator
test("validates booking data", () => {
  expect(() => validateBookingData({})).toThrow("Email required");
  expect(
    validateBookingData({ email: "test@test.com", numberOfPeople: 2 })
  ).toBe(true);
});
```

**Pros:**

- ✅ No refactoring needed
- ✅ Quick to implement
- ✅ Tests actual business logic

**Cons:**

- ❌ Limited coverage (~20-30% of code)
- ❌ Database operations remain untested
- ❌ Integration issues may slip through

**Current Status:** This is what we have now with `hashPassword` and `signToken` tests.

---

### Option B: Refactor for Dependency Injection (Comprehensive) 🔄

**What it means:**

- Change controllers to accept Prisma Client as a parameter
- Allows tests to inject mock Prisma instances
- Enables full unit test coverage

**Example:**

```typescript
// Refactored controller
export async function getPackages(
  filters: { activeOnly?: boolean },
  prisma: PrismaClient = new PrismaClient() // Default for production
) {
  return prisma.package.findMany({
    where: filters.activeOnly ? { active: true } : undefined,
  });
}

// Test with mock
test("returns active packages only", async () => {
  const mockPrisma = {
    package: {
      findMany: jest
        .fn()
        .mockResolvedValue([{ id: 1, name: "Test", active: true }]),
    },
  } as any;

  const result = await getPackages({ activeOnly: true }, mockPrisma);

  expect(result).toHaveLength(1);
  expect(mockPrisma.package.findMany).toHaveBeenCalledWith({
    where: { active: true },
  });
});
```

**Pros:**

- ✅ Full test coverage possible (80-90%+)
- ✅ All database operations testable
- ✅ Better code design (dependency injection)
- ✅ Easier to test edge cases

**Cons:**

- ❌ Requires refactoring all controllers
- ❌ Changes to route handlers needed

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- adminController.test.ts
```

### Watch Mode (Auto-rerun on changes)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

Opens a coverage report showing which lines are tested. Report saved to `backend/coverage/`.

---

## Recommended Next Steps

### If You Choose Option A (Pure Functions Only):

1. **Identify testable logic** in each controller:

   - Validation functions
   - Data transformation functions
   - Business rule calculators
   - Formatters/parsers

2. **Extract and export them:**

   ```typescript
   // In packageController.ts
   export function validatePackageSlug(slug: string) {
     if (!slug || slug.length < 3) throw new Error("Invalid slug");
     if (!/^[a-z0-9-]+$/.test(slug))
       throw new Error("Slug must be lowercase alphanumeric");
     return true;
   }
   ```

3. **Write tests:**

   ```typescript
   test("validates package slug format", () => {
     expect(() => validatePackageSlug("ab")).toThrow("Invalid slug");
     expect(() => validatePackageSlug("Invalid_Slug")).toThrow(
       "lowercase alphanumeric"
     );
     expect(validatePackageSlug("valid-slug-123")).toBe(true);
   });
   ```

4. **Iterate** through all controllers extracting testable logic.

**Estimated time:** 1-2 hours  
**Expected coverage:** 20-30% of codebase

---

### If You Choose Option B (Dependency Injection):

1. **Refactor one controller** as a prototype (suggest starting with `packageController.ts`)

2. **Update the controller:**

   ```typescript
   // Before
   import { PrismaClient } from "@prisma/client";
   const prisma = new PrismaClient();

   export async function getPackages(filters: any) {
     return prisma.package.findMany({ where: filters });
   }

   // After
   import { PrismaClient } from "@prisma/client";
   const defaultPrisma = new PrismaClient();

   export async function getPackages(
     filters: any,
     prisma: PrismaClient = defaultPrisma
   ) {
     return prisma.package.findMany({ where: filters });
   }
   ```

3. **Update route handlers:**

   ```typescript
   // In packageRoutes.ts - add default prisma instance
   router.get("/", async (req, reply) => {
     const packages = await getPackages(req.query); // Works same as before
     reply.send(packages);
   });
   ```

4. **Write comprehensive tests:**

   ```typescript
   const mockPrisma = {
     package: {
       findMany: jest.fn().mockResolvedValue([{ id: 1, name: "Test" }]),
     },
   } as any;

   test("filters active packages", async () => {
     await getPackages({ active: true }, mockPrisma);
     expect(mockPrisma.package.findMany).toHaveBeenCalledWith({
       where: { active: true },
     });
   });
   ```

5. **Repeat for remaining controllers:**
   - `bookingController.ts`
   - `departureController.ts`
   - `rentalController.ts`
   - `paymentController.ts`
   - `contactController.ts`

**Estimated time:** 2-4 hours  
**Expected coverage:** 80-90% of codebase

---

## Current Test Results

```
Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        ~5s
```

**Passing Tests:**

- ✅ `hashPassword` returns consistent hash with same inputs
- ✅ `hashPassword` returns different hash for different passwords
- ✅ `hashPassword` generates random salt when not provided
- ✅ `signToken` creates properly formatted token with base64-encoded admin ID

---

## Summary

You have a working test setup with 4 passing tests for pure functions. To expand coverage, you need to decide:

- **Option A:** Quick wins by extracting and testing pure functions (~20-30% coverage, 1-2 hours)
- **Option B:** Full coverage by refactoring for dependency injection (~80-90% coverage, 2-4 hours)

Both approaches are valid. Option A gives you immediate value with minimal changes. Option B provides comprehensive testing but requires architectural updates.

**Current recommendation:** Start with Option A to get familiar with the testing workflow, then consider Option B if you need higher coverage or plan to expand the project significantly.

- **Option A (Simpler)**: Test pure functions only (utility functions, validators, formatters)
- **Option B (Better)**: Refactor to use dependency injection for full integration testing

3. **Add More Unit Tests for Pure Functions**:

   - Validation functions
   - Data transformation functions
   - Utility functions

4. **Consider Integration Tests**:
   For database operations, consider integration tests with a test database instead of mocking:
   ```typescript
   // Use a test database
   process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
   ```

## Example: Testing Pure Functions

Here's what works well with unit testing:

```typescript
// In your controller file
export function calculateTotalPrice(
  basePrice: number,
  participants: number,
  discount?: number
) {
  const subtotal = basePrice * participants;
  const discountAmount = discount ? subtotal * (discount / 100) : 0;
  return subtotal - discountAmount;
}

// In test file
describe("calculateTotalPrice", () => {
  test("calculates price without discount", () => {
    expect(calculateTotalPrice(100, 3)).toBe(300);
  });

  test("calculates price with discount", () => {
    expect(calculateTotalPrice(100, 3, 10)).toBe(270); // 10% off
  });
});
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Dependency Injection Pattern](https://en.wikipedia.org/wiki/Dependency_injection)

---

**Need help?** If you want to proceed with Option B (dependency injection refactoring) or need guidance extracting testable functions for Option A, just ask!

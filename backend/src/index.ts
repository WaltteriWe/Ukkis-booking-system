// Using relative import to shared directory

import { Test } from "../shared/types";

const testObject: Test = {
  id: '1',
  name: 'Test User',
  age: 25,
};

console.log('Backend starting...');
console.log('Test object:', testObject);
// TODO: Add Fastify server when ready
---
description: React Hook Guidelines for maintaining clean and reusable code
applyTo: 'frontend/src/**/*.tsx'
---

# React Custom Hook Rules

## When to Create Custom Hooks

Extract logic into custom hooks in `frontend/src/hooks/` when:

1. **Reusable State Logic**: Multiple pieces of related state are managed together
2. **Complex Logic**: Component has inline logic that makes it harder to read (>50 lines of logic)
3. **Side Effects**: Logic involves API calls, subscriptions, event listeners, or timers
4. **Multiple Components**: Same logic pattern is needed across different components
5. **Testing**: Logic should be testable in isolation from UI

## Hook Structure Guidelines

- **Location**: Place all custom hooks in `frontend/src/hooks/`
- **Naming**: Prefix with `use` (e.g., `useSnowmobileSelection`, `useAuth`)
- **Single Responsibility**: Each hook should handle one specific concern
- **Return Values**: Return an object with clearly named properties and methods
- **Documentation**: Include brief JSDoc comments for complex hooks

## Examples of When to Extract

### ✅ SHOULD Extract to Hook:
- Form state management with validation
- Data fetching with loading/error states
- Complex filtering or sorting logic
- Local storage synchronization
- WebSocket connections
- Polling/interval-based updates

### ❌ DON'T Need a Hook:
- Single useState for simple UI state (modal open/closed)
- One-time data fetching in a single component
- Simple derived values (can use useMemo)
- Component-specific rendering logic

## Component Guidelines

- **Components**: Should focus primarily on UI rendering and user interactions
- **Separation**: Keep business logic, API calls, and complex state in hooks
- **Readability**: If a component file exceeds 300 lines, consider extracting hooks

## Example Pattern

```typescript
// ✅ Good: Logic extracted to hook
const useDataManager = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const loadData = async () => {
    setLoading(true);
    const result = await fetchData();
    setData(result);
    setLoading(false);
  };
  
  return { data, loading, loadData };
};

// Component uses hook
const MyComponent = () => {
  const { data, loading, loadData } = useDataManager();
  // Focus on rendering
};
```

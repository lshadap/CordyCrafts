# Testing Patterns

**Analysis Date:** 2026-05-06

## Test Framework

**Status:** No test framework configured

- No test runner installed (Jest, Vitest, Mocha, etc.)
- No test files present in codebase
- No test configuration files (jest.config.js, vitest.config.ts, etc.)

**Current state:** Testing is manual/browser-based only.

## Test File Organization

**No testing structure exists.** If testing is added in future, follow these patterns based on the existing component structure:

**Proposed test locations** (if added):
- `primitives.test.jsx` — tests for Icon, Logo, Button, CircleBadge, Overline, StitchDivider
- `hero.test.jsx` — tests for Nav, Hero, Categories, CategoryTile
- `products.test.jsx` — tests for cart store, useCart hook, ProductCard, ProductGrid, ClassCard, ClassesGrid
- `sections.test.jsx` — tests for About, Newsletter, Footer, CartDrawer, BookingModal, WhatsAppIcon

**Naming:**
- Test files co-located with source (same directory as `.jsx` files)
- Use `.test.jsx` or `.spec.jsx` suffix

## Test Structure (Proposed Pattern)

If a test framework were added (e.g., Vitest), tests would likely follow this pattern:

```javascript
describe('ProductCard', () => {
  it('renders product name and price', () => {
    // Arrange: set up product data
    const product = { sku: 'p01', name: 'Test Item', price: 100, img: 'test.svg', cat: 'Test' };
    
    // Act: render component
    // const { getByText } = render(<ProductCard p={product} accent="#f08a8a" />);
    
    // Assert: check rendered output
    // expect(getByText('Test Item')).toBeInTheDocument();
    // expect(getByText('₹100')).toBeInTheDocument();
  });

  it('adds item to cart on "Add" button click', () => {
    // Test relies on useCart hook behavior
  });

  it('shows "Added" state after button click', () => {
    // Test hover state and immediate feedback
  });
});

describe('useCart', () => {
  it('adds items to cart', () => {
    // const { result } = renderHook(() => useCart());
    // act(() => { result.current.add({ sku: 'p01', ... }); });
    // expect(result.current.count()).toBe(1);
  });

  it('notifies listeners on state change', () => {
    // Test pub-sub notification system
  });

  it('persists cart count to window.cartCount', () => {
    // Verify side effect on cart mutation
  });
});
```

## Mocking

**Current pattern:** No mocking framework in use

**Manual mocking approaches used in code:**

1. **Window object for global state:**
   ```javascript
   window.cart = cart;
   window.cartCount = this.count();
   window.TWEAKS = { ... };
   window.openCart = () => setCartOpen(true);
   ```

2. **Pub-sub for observer pattern (manual event system):**
   ```javascript
   const cartListeners = new Set();
   const cart = {
     _notify() {
       cartListeners.forEach(fn => fn());
     }
   };
   ```

**What to Mock (if tests added):**
- Window globals: `window.cart`, `window.openCart()`, `window.TWEAKS`
- React hooks: Mock `React.useState`, `React.useEffect` if testing cart logic in isolation
- Image sources: Use placeholder SVG paths (already done — images are SVG files)

**What NOT to Mock:**
- React component rendering (use actual React renderer)
- CSS transitions/animations (skip in unit tests, test in E2E)
- Inline style calculations (too tightly coupled to implementation)

## Coverage

**Requirements:** None enforced

- No coverage thresholds configured
- No coverage reports generated

**If coverage reporting is added:**

```bash
# Hypothetical command to generate coverage
npm run test:coverage
# Output: coverage/ directory with LCOV reports
```

**Target areas for coverage (if implemented):**
- Cart store operations: `add()`, `remove()`, `setQty()`, `clear()`, `count()`, `total()`
- Form validation: cart drawer, booking modal form submission guards
- Price calculations: `inr()` formatting, quantity × price math
- State transitions: cart drawer stages (cart → form → done)

## Test Types

**Unit Tests (Proposed):**

- **Primitives:** Icon paths render correctly, Button variants apply correct styles
- **Cart store:** add/remove/clear operations, count/total calculations
- **Utilities:** `inr()` formats prices correctly with Indian locale
- **Hooks:** `useCart()` subscribes/unsubscribes to listeners

**Integration Tests (Proposed):**

- ProductCard + useCart: Adding item updates cart and NavBar count
- CartDrawer stages: transition from cart → form → done with valid input
- BookingModal: Form fields validate and send booking request
- Newsletter: Email submission sets `done` state and resets input

**E2E Tests (Not currently used):**

- If added, would test user flows: browse → add to cart → checkout flow
- Would verify WhatsApp message construction and delivery

## Async Testing (Proposed Pattern)

If tests were added, async patterns would likely look like:

```javascript
// Form submission (preventDefault + state update)
it('submits form with valid data', async () => {
  // Simulate form input
  // fireEvent.change(phoneInput, { target: { value: '9876543210' } });
  // fireEvent.click(submitButton);
  // await waitFor(() => expect(stage).toBe('done'));
});

// setTimeout in ProductCard feedback
it('shows "Added" state for 1.4 seconds', async () => {
  // const { rerender } = render(<ProductCard {...props} />);
  // fireEvent.click(addButton);
  // expect(addButton.textContent).toContain('Added');
  // await act(() => new Promise(resolve => setTimeout(resolve, 1500)));
  // expect(addButton.textContent).toContain('Add');
});

// Effect cleanup (cartListeners)
it('unsubscribes listener on unmount', () => {
  // const { unmount } = render(<ComponentUsingCart />);
  // expect(cartListeners.size).toBe(1);
  // unmount();
  // expect(cartListeners.size).toBe(0);
});
```

## Common Test Patterns (Proposed)

**State updates:**
```javascript
// Testing that form updates work
it('updates form name on input change', () => {
  // fireEvent.change(nameInput, { target: { value: 'Alice' } });
  // expect(form.name).toBe('Alice');
});

// Testing cart mutations
it('increments quantity when already in cart', () => {
  // const item = { sku: 'p01', qty: 1 };
  // cart.add(item);
  // cart.add({ sku: 'p01', qty: 1 });
  // expect(cart.items[0].qty).toBe(2);
});
```

**Event handling:**
```javascript
// Testing click handlers
it('clears cart when clear() is called', () => {
  // cart.add({ sku: 'p01', ... });
  // cart.clear();
  // expect(cart.items).toEqual([]);
});

// Testing form submission
it('prevents default and validates on submit', () => {
  // const mockPreventDefault = jest.fn();
  // submit({ preventDefault: mockPreventDefault });
  // expect(mockPreventDefault).toHaveBeenCalled();
});
```

**Error/boundary testing:**
```javascript
// Testing component nullability
it('returns null when required prop is missing', () => {
  // const { container } = render(<BookingModal klass={null} onClose={() => {}} accent="#f08a8a" />);
  // expect(container.firstChild).toBeNull();
});

// Testing input bounds
it('enforces min/max seat counts', () => {
  // Seats cannot go below 1 or above klass.seats
  // expect(Math.max(1, form.seats - 1)).toBeGreaterThanOrEqual(1);
});
```

## Manual Testing Checklist (Current Approach)

Since no automated tests exist, manual verification is the current QA method:

**Cart functionality:**
- [ ] Add item to cart → cart count increments
- [ ] Quantity adjustment (±) in drawer works
- [ ] Remove item → removed from cart
- [ ] Cart persists across page sections

**Forms:**
- [ ] Required fields show validation feedback
- [ ] Phone number sanitizes non-digit characters
- [ ] Form submission resets state and shows success stage
- [ ] Back button returns to previous stage

**Styling & responsive:**
- [ ] Components render with correct colors/fonts
- [ ] Hover states trigger (box shadow, scale, color change)
- [ ] Mobile layout stacks appropriately

**Data integrity:**
- [ ] Prices display in INR format with `inr()` function
- [ ] Product data (PRODUCTS, CLASSES) arrays are complete
- [ ] Class availability shows correct max seats

---

*Testing analysis: 2026-05-06*

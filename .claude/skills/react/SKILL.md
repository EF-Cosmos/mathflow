```markdown
---
name: react
description: React framework for building user interfaces. Use for React components, hooks, state management, JSX, and modern frontend development.
---

# React Skill

React framework for building user interfaces. Use for React components, hooks, state management, JSX, and modern frontend development.

## When to Use This Skill

This skill should be triggered when:
- **Writing or debugging React components** (functional components, JSX syntax)
- **Implementing or explaining Hooks** (useState, useEffect, useContext, custom hooks)
- **Managing application state** (Context API, reducers, state lifting)
- **Handling user interactions** (events, forms, synthetic events)
- **Optimizing performance** (memo, useCallback, useMemo, code splitting)
- **Integrating with external systems** (browser APIs, subscriptions, effects)
- **Setting up a React environment** (Vite, Next.js, React Router)
- **Learning React concepts** (component lifecycle, rendering, virtual DOM)

## Quick Reference

### 1. Functional Component & State
The foundation of React: a JavaScript function returning JSX, using `useState` to manage local data.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

### 2. Handling Effects
Synchronize components with external systems using `useEffect`. Dependencies control when it re-runs.

```jsx
import { useEffect, useState } from 'react';

function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    
    // Cleanup function: disconnects when component unmounts or roomId changes
    return () => connection.disconnect();
  }, [roomId]); // Only re-run if roomId changes

  return <ul>{messages.map(m => <li key={m.id}>{m.text}</li>)}</ul>;
}
```

### 3. Context for Global State
Pass data deeply without prop-drilling using `createContext` and `useContext`.

```jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}

function Page() {
  const theme = useContext(ThemeContext); // Reads "dark"
  return <div className={theme}>Hello</div>;
}
```

### 4. Conditional Rendering
Render different UI based on state using JavaScript logic inside JSX.

```jsx
function Item({ itemName, isPacked }) {
  return (
    <li>
      {isPacked ? (
        <del>{itemName + " ✔"}</del>
      ) : (
        itemName
      )}
    </li>
  );
}
```

### 5. Rendering Lists
Use `map` to transform arrays into components. Always provide a unique `key`.

```jsx
const products = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" }
];

function List() {
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          {product.name}
        </li>
      ))}
    </ul>
  );
}
```

### 6. Lifting State Up
Share state between sibling components by moving it to their common parent.

```jsx
function Panel({ children, isActive, onShow }) {
  return (
    <section className="panel">
      {isActive ? (
        <p>{children}</p>
      ) : (
        <button onClick={onShow}>Show</button>
      )}
    </section>
  );
}

// Parent manages the active state
function Accordion() {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <>
      <Panel isActive={activeIndex === 0} onShow={() => setActiveIndex(0)}>
        First panel
      </Panel>
      <Panel isActive={activeIndex === 1} onShow={() => setActiveIndex(1)}>
        Second panel
      </Panel>
    </>
  );
}
```

### 7. Controlled Components
Form elements where React state is the "single source of truth".

```jsx
function Form() {
  const [name, setName] = useState("");

  return (
    <form onSubmit={e => { e.preventDefault(); alert(name); }}>
      <label>
        Name: 
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 8. Custom Hooks
Extract component logic into reusable functions. Must start with "use".

```jsx
import { useState, useEffect } from 'react';

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
}

function StatusBar() {
  const isOnline = useOnlineStatus();
  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;
}
```

### 9. Performance Optimization
Prevent unnecessary re-renders using `memo` and `useCallback`.

```jsx
import { memo, useCallback, useState } from 'react';

const HeavyComponent = memo(function ({ onClick }) {
  // Only re-renders if onClick changes
  console.log("Rendering HeavyComponent...");
  return <button onClick={onClick}>Click Me</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  
  // Function identity stays stable unless dependencies change
  const handleClick = useCallback(() => {
    console.log("Clicked!");
  }, []); 

  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <HeavyComponent onClick={handleClick} />
    </>
  );
}
```

### 10. Refs for DOM Access
Access DOM nodes directly using `useRef`.

```jsx
import { useRef } from 'react';

function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>Focus the input</button>
    </>
  );
}
```

## Reference Files

This skill includes comprehensive documentation in `references/`:

- **api.md** - Detailed API references for Hooks (useDeferredValue, useInsertionEffect, useSyncExternalStore, useTransition) and React DOM APIs.
- **components.md** - Documentation for built-in components (`<Profiler>`, `<StrictMode>`, `memo`) and React DOM components (common, form, SVG).
- **getting_started.md** - Installation guides, the Tic-Tac-Toe tutorial, and setup instructions.
- **hooks.md** - In-depth documentation for Hooks like `useCallback` and `useEffect`, including usage patterns and caveats.
- **other.md** - Conceptual guides on "Describing the UI", "Escape Hatches" (refs, effects), and "Creating a React App" (frameworks like Next.js).
- **state.md** - State management references (`useActionState`, `createContext`, `use`) and guides on managing state flow.

Use `view` to read specific reference files when detailed information is needed.

## Working with This Skill

### For Beginners
1. Start with **getting_started.md** to set up your environment.
2. Read the **Tic-Tac-Toe tutorial** to understand components, props, and state.
3. Use the **Quick Reference** examples above to practice basic syntax.

### For Debugging
1. Check **hooks.md** if you are having trouble with `useEffect` dependencies or re-rendering logic.
2. Look at **components.md** for specific component behaviors (e.g., `<StrictMode>` double-invocation).
3. Consult **state.md** for issues related to state management and context.

### For Advanced Features
1. Review **api.md** for advanced hooks like `useSyncExternalStore` or `useTransition`.
2. Check **other.md** for performance optimization strategies and integration with external systems.

## Key Concepts

- **Components**: The building blocks of UI. Functions that return JSX.
- **JSX**: A syntax extension for JavaScript that looks like HTML.
- **Props**: Read-only data passed from parent to child components.
- **State**: Mutable data managed within a component (using `useState`).
- **Side Effects**: Interactions with the outside world (network, DOM), handled by `useEffect`.
- **Rendering**: The process of React calling your components to determine what to show on screen.

## Resources

### references/
Organized documentation extracted from official sources. These files contain:
- Detailed explanations
- Code examples with language annotations
- Links to original documentation
- Table of contents for quick navigation

### scripts/
Add helper scripts here for common automation tasks.

### assets/
Add templates, boilerplate, or example projects here.

## Notes

- This skill was automatically generated from official documentation
- Reference files preserve the structure and examples from source docs
- Code examples include language detection for better syntax highlighting
- Quick reference patterns are extracted from common usage examples in the docs

## Updating

To refresh this skill with updated documentation:
1. Re-run the scraper with the same configuration
2. The skill will be rebuilt with the latest information
```
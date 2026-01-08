# React - Api

**Pages:** 53

---

## React Reference Overview

**URL:** https://react.dev/reference/react

**Contents:**
- React Reference Overview
- React
- React DOM
- React Compiler
- ESLint Plugin React Hooks
- Rules of React
- Legacy APIs

This section provides detailed reference documentation for working with React. For an introduction to React, please visit the Learn section.

The React reference documentation is broken down into functional subsections:

Programmatic React features:

React DOM contains features that are only supported for web applications (which run in the browser DOM environment). This section is broken into the following:

The React Compiler is a build-time optimization tool that automatically memoizes your React components and values:

The ESLint plugin for React Hooks helps enforce the Rules of React:

React has idioms — or rules — for how to express patterns in a way that is easy to understand and yields high-quality applications:

---

## React DOM APIs

**URL:** https://react.dev/reference/react-dom

**Contents:**
- React DOM APIs
- APIs
- Resource Preloading APIs
- Entry points
- Removed APIs

The react-dom package contains methods that are only supported for the web applications (which run in the browser DOM environment). They are not supported for React Native.

These APIs can be imported from your components. They are rarely used:

These APIs can be used to make apps faster by pre-loading resources such as scripts, stylesheets, and fonts as soon as you know you need them, for example before navigating to another page where the resources will be used.

React-based frameworks frequently handle resource loading for you, so you might not have to call these APIs yourself. Consult your framework’s documentation for details.

The react-dom package provides two additional entry points:

These APIs were removed in React 19:

---

## useDeferredValue

**URL:** https://react.dev/reference/react/useDeferredValue

**Contents:**
- useDeferredValue
- Reference
  - useDeferredValue(value, initialValue?)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Showing stale content while fresh content is loading
  - Note
      - Deep Dive

useDeferredValue is a React Hook that lets you defer updating a part of the UI.

Call useDeferredValue at the top level of your component to get a deferred version of that value.

See more examples below.

When an update is inside a Transition, useDeferredValue always returns the new value and does not spawn a deferred render, since the update is already deferred.

The values you pass to useDeferredValue should either be primitive values (like strings and numbers) or objects created outside of rendering. If you create a new object during rendering and immediately pass it to useDeferredValue, it will be different on every render, causing unnecessary background re-renders.

When useDeferredValue receives a different value (compared with Object.is), in addition to the current render (when it still uses the previous value), it schedules a re-render in the background with the new value. The background re-render is interruptible: if there’s another update to the value, React will restart the background re-render from scratch. For example, if the user is typing into an input faster than a chart receiving its deferred value can re-render, the chart will only re-render after the user stops typing.

useDeferredValue is integrated with <Suspense>. If the background update caused by a new value suspends the UI, the user will not see the fallback. They will see the old deferred value until the data loads.

useDeferredValue does not by itself prevent extra network requests.

There is no fixed delay caused by useDeferredValue itself. As soon as React finishes the original re-render, React will immediately start working on the background re-render with the new deferred value. Any updates caused by events (like typing) will interrupt the background re-render and get prioritized over it.

The background re-render caused by useDeferredValue does not fire Effects until it’s committed to the screen. If the background re-render suspends, its Effects will run after the data loads and the UI updates.

Call useDeferredValue at the top level of your component to defer updating some part of your UI.

During the initial render, the deferred value will be the same as the value you provided.

During updates, the deferred value will “lag behind” the latest value. In particular, React will first re-render without updating the deferred value, and then try to re-render with the newly received value in the background.

Let’s walk through an example to see when this is useful.

This example assumes you use a Suspense-enabled data source:

Learn more about Suspense and its limitations.

In this example, the SearchResults component suspends while fetching the search results. Try typing "a", waiting for the results, and then editing it to "ab". The results for "a" get replaced by the loading fallback.

A common alternative UI pattern is to defer updating the list of results and to keep showing the previous results until the new results are ready. Call useDeferredValue to pass a deferred version of the query down:

The query will update immediately, so the input will display the new value. However, the deferredQuery will keep its previous value until the data has loaded, so SearchResults will show the stale results for a bit.

Enter "a" in the example below, wait for the results to load, and then edit the input to "ab". Notice how instead of the Suspense fallback, you now see the stale result list until the new results have loaded:

You can think of it as happening in two steps:

First, React re-renders with the new query ("ab") but with the old deferredQuery (still "a"). The deferredQuery value, which you pass to the result list, is deferred: it “lags behind” the query value.

In the background, React tries to re-render with both query and deferredQuery updated to "ab". If this re-render completes, React will show it on the screen. However, if it suspends (the results for "ab" have not loaded yet), React will abandon this rendering attempt, and retry this re-render again after the data has loaded. The user will keep seeing the stale deferred value until the data is ready.

The deferred “background” rendering is interruptible. For example, if you type into the input again, React will abandon it and restart with the new value. React will always use the latest provided value.

Note that there is still a network request per each keystroke. What’s being deferred here is displaying results (until they’re ready), not the network requests themselves. Even if the user continues typing, responses for each keystroke get cached, so pressing Backspace is instant and doesn’t fetch again.

In the example above, there is no indication that the result list for the latest query is still loading. This can be confusing to the user if the new results take a while to load. To make it more obvious to the user that the result list does not match the latest query, you can add a visual indication when the stale result list is displayed:

With this change, as soon as you start typing, the stale result list gets slightly dimmed until the new result list loads. You can also add a CSS transition to delay dimming so that it feels gradual, like in the example below:

You can also apply useDeferredValue as a performance optimization. It is useful when a part of your UI is slow to re-render, there’s no easy way to optimize it, and you want to prevent it from blocking the rest of the UI.

Imagine you have a text field and a component (like a chart or a long list) that re-renders on every keystroke:

First, optimize SlowList to skip re-rendering when its props are the same. To do this, wrap it in memo:

However, this only helps if the SlowList props are the same as during the previous render. The problem you’re facing now is that it’s slow when they’re different, and when you actually need to show different visual output.

Concretely, the main performance problem is that whenever you type into the input, the SlowList receives new props, and re-rendering its entire tree makes the typing feel janky. In this case, useDeferredValue lets you prioritize updating the input (which must be fast) over updating the result list (which is allowed to be slower):

This does not make re-rendering of the SlowList faster. However, it tells React that re-rendering the list can be deprioritized so that it doesn’t block the keystrokes. The list will “lag behind” the input and then “catch up”. Like before, React will attempt to update the list as soon as possible, but will not block the user from typing.

In this example, each item in the SlowList component is artificially slowed down so that you can see how useDeferredValue lets you keep the input responsive. Type into the input and notice that typing feels snappy while the list “lags behind” it.

This optimization requires SlowList to be wrapped in memo. This is because whenever the text changes, React needs to be able to re-render the parent component quickly. During that re-render, deferredText still has its previous value, so SlowList is able to skip re-rendering (its props have not changed). Without memo, it would have to re-render anyway, defeating the point of the optimization.

There are two common optimization techniques you might have used before in this scenario:

While these techniques are helpful in some cases, useDeferredValue is better suited to optimizing rendering because it is deeply integrated with React itself and adapts to the user’s device.

Unlike debouncing or throttling, it doesn’t require choosing any fixed delay. If the user’s device is fast (e.g. powerful laptop), the deferred re-render would happen almost immediately and wouldn’t be noticeable. If the user’s device is slow, the list would “lag behind” the input proportionally to how slow the device is.

Also, unlike with debouncing or throttling, deferred re-renders done by useDeferredValue are interruptible by default. This means that if React is in the middle of re-rendering a large list, but the user makes another keystroke, React will abandon that re-render, handle the keystroke, and then start rendering in the background again. By contrast, debouncing and throttling still produce a janky experience because they’re blocking: they merely postpone the moment when rendering blocks the keystroke.

If the work you’re optimizing doesn’t happen during rendering, debouncing and throttling are still useful. For example, they can let you fire fewer network requests. You can also use these techniques together.

**Examples:**

Example 1 (javascript):
```javascript
const deferredValue = useDeferredValue(value)
```

Example 2 (javascript):
```javascript
import { useState, useDeferredValue } from 'react';function SearchPage() {  const [query, setQuery] = useState('');  const deferredQuery = useDeferredValue(query);  // ...}
```

Example 3 (javascript):
```javascript
import { useState, useDeferredValue } from 'react';function SearchPage() {  const [query, setQuery] = useState('');  const deferredQuery = useDeferredValue(query);  // ...}
```

Example 4 (jsx):
```jsx
export default function App() {  const [query, setQuery] = useState('');  const deferredQuery = useDeferredValue(query);  return (    <>      <label>        Search albums:        <input value={query} onChange={e => setQuery(e.target.value)} />      </label>      <Suspense fallback={<h2>Loading...</h2>}>        <SearchResults query={deferredQuery} />      </Suspense>    </>  );}
```

---

## useInsertionEffect

**URL:** https://react.dev/reference/react/useInsertionEffect

**Contents:**
- useInsertionEffect
  - Pitfall
- Reference
  - useInsertionEffect(setup, dependencies?)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Injecting dynamic styles from CSS-in-JS libraries
      - Deep Dive

useInsertionEffect is for CSS-in-JS library authors. Unless you are working on a CSS-in-JS library and need a place to inject the styles, you probably want useEffect or useLayoutEffect instead.

useInsertionEffect allows inserting elements into the DOM before any layout Effects fire.

Call useInsertionEffect to insert styles before any Effects fire that may need to read layout:

See more examples below.

setup: The function with your Effect’s logic. Your setup function may also optionally return a cleanup function. When your component is added to the DOM, but before any layout Effects fire, React will run your setup function. After every re-render with changed dependencies, React will first run the cleanup function (if you provided it) with the old values, and then run your setup function with the new values. When your component is removed from the DOM, React will run your cleanup function.

optional dependencies: The list of all reactive values referenced inside of the setup code. Reactive values include props, state, and all the variables and functions declared directly inside your component body. If your linter is configured for React, it will verify that every reactive value is correctly specified as a dependency. The list of dependencies must have a constant number of items and be written inline like [dep1, dep2, dep3]. React will compare each dependency with its previous value using the Object.is comparison algorithm. If you don’t specify the dependencies at all, your Effect will re-run after every re-render of the component.

useInsertionEffect returns undefined.

Traditionally, you would style React components using plain CSS.

Some teams prefer to author styles directly in JavaScript code instead of writing CSS files. This usually requires using a CSS-in-JS library or a tool. There are three common approaches to CSS-in-JS:

If you use CSS-in-JS, we recommend a combination of the first two approaches (CSS files for static styles, inline styles for dynamic styles). We don’t recommend runtime <style> tag injection for two reasons:

The first problem is not solvable, but useInsertionEffect helps you solve the second problem.

Call useInsertionEffect to insert the styles before any layout Effects fire:

Similarly to useEffect, useInsertionEffect does not run on the server. If you need to collect which CSS rules have been used on the server, you can do it during rendering:

Read more about upgrading CSS-in-JS libraries with runtime injection to useInsertionEffect.

If you insert styles during rendering and React is processing a non-blocking update, the browser will recalculate the styles every single frame while rendering a component tree, which can be extremely slow.

useInsertionEffect is better than inserting styles during useLayoutEffect or useEffect because it ensures that by the time other Effects run in your components, the <style> tags have already been inserted. Otherwise, layout calculations in regular Effects would be wrong due to outdated styles.

**Examples:**

Example 1 (unknown):
```unknown
useInsertionEffect(setup, dependencies?)
```

Example 2 (typescript):
```typescript
import { useInsertionEffect } from 'react';// Inside your CSS-in-JS libraryfunction useCSS(rule) {  useInsertionEffect(() => {    // ... inject <style> tags here ...  });  return rule;}
```

Example 3 (jsx):
```jsx
// In your JS file:<button className="success" />// In your CSS file:.success { color: green; }
```

Example 4 (jsx):
```jsx
// Inside your CSS-in-JS librarylet isInserted = new Set();function useCSS(rule) {  useInsertionEffect(() => {    // As explained earlier, we don't recommend runtime injection of <style> tags.    // But if you have to do it, then it's important to do in useInsertionEffect.    if (!isInserted.has(rule)) {      isInserted.add(rule);      document.head.appendChild(getStyleForRule(rule));    }  });  return rule;}function Button() {  const className = useCSS('...');  return <div className={className} />;}
```

---

## useSyncExternalStore

**URL:** https://react.dev/reference/react/useSyncExternalStore

**Contents:**
- useSyncExternalStore
- Reference
  - useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Subscribing to an external store
  - Note
  - Subscribing to a browser API

useSyncExternalStore is a React Hook that lets you subscribe to an external store.

Call useSyncExternalStore at the top level of your component to read a value from an external data store.

It returns the snapshot of the data in the store. You need to pass two functions as arguments:

See more examples below.

subscribe: A function that takes a single callback argument and subscribes it to the store. When the store changes, it should invoke the provided callback, which will cause React to re-call getSnapshot and (if needed) re-render the component. The subscribe function should return a function that cleans up the subscription.

getSnapshot: A function that returns a snapshot of the data in the store that’s needed by the component. While the store has not changed, repeated calls to getSnapshot must return the same value. If the store changes and the returned value is different (as compared by Object.is), React re-renders the component.

optional getServerSnapshot: A function that returns the initial snapshot of the data in the store. It will be used only during server rendering and during hydration of server-rendered content on the client. The server snapshot must be the same between the client and the server, and is usually serialized and passed from the server to the client. If you omit this argument, rendering the component on the server will throw an error.

The current snapshot of the store which you can use in your rendering logic.

The store snapshot returned by getSnapshot must be immutable. If the underlying store has mutable data, return a new immutable snapshot if the data has changed. Otherwise, return a cached last snapshot.

If a different subscribe function is passed during a re-render, React will re-subscribe to the store using the newly passed subscribe function. You can prevent this by declaring subscribe outside the component.

If the store is mutated during a non-blocking Transition update, React will fall back to performing that update as blocking. Specifically, for every Transition update, React will call getSnapshot a second time just before applying changes to the DOM. If it returns a different value than when it was called originally, React will restart the update from scratch, this time applying it as a blocking update, to ensure that every component on screen is reflecting the same version of the store.

It’s not recommended to suspend a render based on a store value returned by useSyncExternalStore. The reason is that mutations to the external store cannot be marked as non-blocking Transition updates, so they will trigger the nearest Suspense fallback, replacing already-rendered content on screen with a loading spinner, which typically makes a poor UX.

For example, the following are discouraged:

Most of your React components will only read data from their props, state, and context. However, sometimes a component needs to read some data from some store outside of React that changes over time. This includes:

Call useSyncExternalStore at the top level of your component to read a value from an external data store.

It returns the snapshot of the data in the store. You need to pass two functions as arguments:

React will use these functions to keep your component subscribed to the store and re-render it on changes.

For example, in the sandbox below, todosStore is implemented as an external store that stores data outside of React. The TodosApp component connects to that external store with the useSyncExternalStore Hook.

When possible, we recommend using built-in React state with useState and useReducer instead. The useSyncExternalStore API is mostly useful if you need to integrate with existing non-React code.

Another reason to add useSyncExternalStore is when you want to subscribe to some value exposed by the browser that changes over time. For example, suppose that you want your component to display whether the network connection is active. The browser exposes this information via a property called navigator.onLine.

This value can change without React’s knowledge, so you should read it with useSyncExternalStore.

To implement the getSnapshot function, read the current value from the browser API:

Next, you need to implement the subscribe function. For example, when navigator.onLine changes, the browser fires the online and offline events on the window object. You need to subscribe the callback argument to the corresponding events, and then return a function that cleans up the subscriptions:

Now React knows how to read the value from the external navigator.onLine API and how to subscribe to its changes. Disconnect your device from the network and notice that the component re-renders in response:

Usually you won’t write useSyncExternalStore directly in your components. Instead, you’ll typically call it from your own custom Hook. This lets you use the same external store from different components.

For example, this custom useOnlineStatus Hook tracks whether the network is online:

Now different components can call useOnlineStatus without repeating the underlying implementation:

If your React app uses server rendering, your React components will also run outside the browser environment to generate the initial HTML. This creates a few challenges when connecting to an external store:

To solve these issues, pass a getServerSnapshot function as the third argument to useSyncExternalStore:

The getServerSnapshot function is similar to getSnapshot, but it runs only in two situations:

This lets you provide the initial snapshot value which will be used before the app becomes interactive. If there is no meaningful initial value for the server rendering, omit this argument to force rendering on the client.

Make sure that getServerSnapshot returns the same exact data on the initial client render as it returned on the server. For example, if getServerSnapshot returned some prepopulated store content on the server, you need to transfer this content to the client. One way to do this is to emit a <script> tag during server rendering that sets a global like window.MY_STORE_DATA, and read from that global on the client in getServerSnapshot. Your external store should provide instructions on how to do that.

This error means your getSnapshot function returns a new object every time it’s called, for example:

React will re-render the component if getSnapshot return value is different from the last time. This is why, if you always return a different value, you will enter an infinite loop and get this error.

Your getSnapshot object should only return a different object if something has actually changed. If your store contains immutable data, you can return that data directly:

If your store data is mutable, your getSnapshot function should return an immutable snapshot of it. This means it does need to create new objects, but it shouldn’t do this for every single call. Instead, it should store the last calculated snapshot, and return the same snapshot as the last time if the data in the store has not changed. How you determine whether mutable data has changed depends on your mutable store.

This subscribe function is defined inside a component so it is different on every re-render:

React will resubscribe to your store if you pass a different subscribe function between re-renders. If this causes performance issues and you’d like to avoid resubscribing, move the subscribe function outside:

Alternatively, wrap subscribe into useCallback to only resubscribe when some argument changes:

**Examples:**

Example 1 (javascript):
```javascript
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

Example 2 (javascript):
```javascript
import { useSyncExternalStore } from 'react';import { todosStore } from './todoStore.js';function TodosApp() {  const todos = useSyncExternalStore(todosStore.subscribe, todosStore.getSnapshot);  // ...}
```

Example 3 (jsx):
```jsx
const LazyProductDetailPage = lazy(() => import('./ProductDetailPage.js'));function ShoppingApp() {  const selectedProductId = useSyncExternalStore(...);  // ❌ Calling `use` with a Promise dependent on `selectedProductId`  const data = use(fetchItem(selectedProductId))  // ❌ Conditionally rendering a lazy component based on `selectedProductId`  return selectedProductId != null ? <LazyProductDetailPage /> : <FeaturedProducts />;}
```

Example 4 (javascript):
```javascript
import { useSyncExternalStore } from 'react';import { todosStore } from './todoStore.js';function TodosApp() {  const todos = useSyncExternalStore(todosStore.subscribe, todosStore.getSnapshot);  // ...}
```

---

## useTransition

**URL:** https://react.dev/reference/react/useTransition

**Contents:**
- useTransition
- Reference
  - useTransition()
    - Parameters
    - Returns
  - startTransition(action)
  - Note
    - Functions called in startTransition are called “Actions”.
    - Parameters
    - Returns

useTransition is a React Hook that lets you render a part of the UI in the background.

Call useTransition at the top level of your component to mark some state updates as Transitions.

See more examples below.

useTransition does not take any parameters.

useTransition returns an array with exactly two items:

The startTransition function returned by useTransition lets you mark an update as a Transition.

The function passed to startTransition is called an “Action”. By convention, any callback called inside startTransition (such as a callback prop) should be named action or include the “Action” suffix:

startTransition does not return anything.

useTransition is a Hook, so it can only be called inside components or custom Hooks. If you need to start a Transition somewhere else (for example, from a data library), call the standalone startTransition instead.

You can wrap an update into a Transition only if you have access to the set function of that state. If you want to start a Transition in response to some prop or a custom Hook value, try useDeferredValue instead.

The function you pass to startTransition is called immediately, marking all state updates that happen while it executes as Transitions. If you try to perform state updates in a setTimeout, for example, they won’t be marked as Transitions.

You must wrap any state updates after any async requests in another startTransition to mark them as Transitions. This is a known limitation that we will fix in the future (see Troubleshooting).

The startTransition function has a stable identity, so you will often see it omitted from Effect dependencies, but including it will not cause the Effect to fire. If the linter lets you omit a dependency without errors, it is safe to do. Learn more about removing Effect dependencies.

A state update marked as a Transition will be interrupted by other state updates. For example, if you update a chart component inside a Transition, but then start typing into an input while the chart is in the middle of a re-render, React will restart the rendering work on the chart component after handling the input update.

Transition updates can’t be used to control text inputs.

If there are multiple ongoing Transitions, React currently batches them together. This is a limitation that may be removed in a future release.

Call useTransition at the top of your component to create Actions, and access the pending state:

useTransition returns an array with exactly two items:

To start a Transition, pass a function to startTransition like this:

The function passed to startTransition is called the “Action”. You can update state and (optionally) perform side effects within an Action, and the work will be done in the background without blocking user interactions on the page. A Transition can include multiple Actions, and while a Transition is in progress, your UI stays responsive. For example, if the user clicks a tab but then changes their mind and clicks another tab, the second click will be immediately handled without waiting for the first update to finish.

To give the user feedback about in-progress Transitions, the isPending state switches to true at the first call to startTransition, and stays true until all Actions complete and the final state is shown to the user. Transitions ensure side effects in Actions to complete in order to prevent unwanted loading indicators, and you can provide immediate feedback while the Transition is in progress with useOptimistic.

In this example, the updateQuantity function simulates a request to the server to update the item’s quantity in the cart. This function is artificially slowed down so that it takes at least a second to complete the request.

Update the quantity multiple times quickly. Notice that the pending “Total” state is shown while any requests are in progress, and the “Total” updates only after the final request is complete. Because the update is in an Action, the “quantity” can continue to be updated while the request is in progress.

This is a basic example to demonstrate how Actions work, but this example does not handle requests completing out of order. When updating the quantity multiple times, it’s possible for the previous requests to finish after later requests causing the quantity to update out of order. This is a known limitation that we will fix in the future (see Troubleshooting below).

For common use cases, React provides built-in abstractions such as:

These solutions handle request ordering for you. When using Transitions to build your own custom hooks or libraries that manage async state transitions, you have greater control over the request ordering, but you must handle it yourself.

You can expose an action prop from a component to allow a parent to call an Action.

For example, this TabButton component wraps its onClick logic in an action prop:

Because the parent component updates its state inside the action, that state update gets marked as a Transition. This means you can click on “Posts” and then immediately click “Contact” and it does not block user interactions:

When exposing an action prop from a component, you should await it inside the transition.

This allows the action callback to be either synchronous or asynchronous without requiring an additional startTransition to wrap the await in the action.

You can use the isPending boolean value returned by useTransition to indicate to the user that a Transition is in progress. For example, the tab button can have a special “pending” visual state:

Notice how clicking “Posts” now feels more responsive because the tab button itself updates right away:

In this example, the PostsTab component fetches some data using use. When you click the “Posts” tab, the PostsTab component suspends, causing the closest loading fallback to appear:

Hiding the entire tab container to show a loading indicator leads to a jarring user experience. If you add useTransition to TabButton, you can instead display the pending state in the tab button instead.

Notice that clicking “Posts” no longer replaces the entire tab container with a spinner:

Read more about using Transitions with Suspense.

Transitions only “wait” long enough to avoid hiding already revealed content (like the tab container). If the Posts tab had a nested <Suspense> boundary, the Transition would not “wait” for it.

If you’re building a React framework or a router, we recommend marking page navigations as Transitions.

This is recommended for three reasons:

Here is a simplified router example using Transitions for navigations.

Suspense-enabled routers are expected to wrap the navigation updates into Transitions by default.

If a function passed to startTransition throws an error, you can display an error to your user with an error boundary. To use an error boundary, wrap the component where you are calling the useTransition in an error boundary. Once the function passed to startTransition errors, the fallback for the error boundary will be displayed.

You can’t use a Transition for a state variable that controls an input:

This is because Transitions are non-blocking, but updating an input in response to the change event should happen synchronously. If you want to run a Transition in response to typing, you have two options:

When you wrap a state update in a Transition, make sure that it happens during the startTransition call:

The function you pass to startTransition must be synchronous. You can’t mark an update as a Transition like this:

Instead, you could do this:

When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:

However, this works instead:

This is a JavaScript limitation due to React losing the scope of the async context. In the future, when AsyncContext is available, this limitation will be removed.

You can’t call useTransition outside a component because it’s a Hook. In this case, use the standalone startTransition method instead. It works the same way, but it doesn’t provide the isPending indicator.

If you run this code, it will print 1, 2, 3:

It is expected to print 1, 2, 3. The function you pass to startTransition does not get delayed. Unlike with the browser setTimeout, it does not run the callback later. React executes your function immediately, but any state updates scheduled while it is running are marked as Transitions. You can imagine that it works like this:

If you await inside startTransition, you might see the updates happen out of order.

In this example, the updateQuantity function simulates a request to the server to update the item’s quantity in the cart. This function artificially returns every other request after the previous to simulate race conditions for network requests.

Try updating the quantity once, then update it quickly multiple times. You might see the incorrect total:

When clicking multiple times, it’s possible for previous requests to finish after later requests. When this happens, React currently has no way to know the intended order. This is because the updates are scheduled asynchronously, and React loses context of the order across the async boundary.

This is expected, because Actions within a Transition do not guarantee execution order. For common use cases, React provides higher-level abstractions like useActionState and <form> actions that handle ordering for you. For advanced use cases, you’ll need to implement your own queuing and abort logic to handle this.

Example of useActionState handling execution order:

**Examples:**

Example 1 (unknown):
```unknown
const [isPending, startTransition] = useTransition()
```

Example 2 (javascript):
```javascript
import { useTransition } from 'react';function TabContainer() {  const [isPending, startTransition] = useTransition();  // ...}
```

Example 3 (javascript):
```javascript
function TabContainer() {  const [isPending, startTransition] = useTransition();  const [tab, setTab] = useState('about');  function selectTab(nextTab) {    startTransition(() => {      setTab(nextTab);    });  }  // ...}
```

Example 4 (jsx):
```jsx
function SubmitButton({ submitAction }) {  const [isPending, startTransition] = useTransition();  return (    <button      disabled={isPending}      onClick={() => {        startTransition(async () => {          await submitAction();        });      }}    >      Submit    </button>  );}
```

---

## <Fragment> (<>...</>)

**URL:** https://react.dev/reference/react/Fragment

**Contents:**
- <Fragment> (<>...</>)
  - Canary
- Reference
  - <Fragment>
    - Props
  - Canary only FragmentInstance
    - Caveats
- Usage
  - Returning multiple elements
      - Deep Dive

<Fragment>, often used via <>...</> syntax, lets you group elements without a wrapper node.

Wrap elements in <Fragment> to group them together in situations where you need a single element. Grouping elements in Fragment has no effect on the resulting DOM; it is the same as if the elements were not grouped. The empty JSX tag <></> is shorthand for <Fragment></Fragment> in most cases.

When you pass a ref to a fragment, React provides a FragmentInstance object with methods for interacting with the DOM nodes wrapped by the fragment:

Event handling methods:

Focus management methods:

If you want to pass key to a Fragment, you can’t use the <>...</> syntax. You have to explicitly import Fragment from 'react' and render <Fragment key={yourKey}>...</Fragment>.

React does not reset state when you go from rendering <><Child /></> to [<Child />] or back, or when you go from rendering <><Child /></> to <Child /> and back. This only works a single level deep: for example, going from <><><Child /></></> to <Child /> resets the state. See the precise semantics here.

Canary only If you want to pass ref to a Fragment, you can’t use the <>...</> syntax. You have to explicitly import Fragment from 'react' and render <Fragment ref={yourRef}>...</Fragment>.

Use Fragment, or the equivalent <>...</> syntax, to group multiple elements together. You can use it to put multiple elements in any place where a single element can go. For example, a component can only return one element, but by using a Fragment you can group multiple elements together and then return them as a group:

Fragments are useful because grouping elements with a Fragment has no effect on layout or styles, unlike if you wrapped the elements in another container like a DOM element. If you inspect this example with the browser tools, you’ll see that all <h1> and <article> DOM nodes appear as siblings without wrappers around them:

The example above is equivalent to importing Fragment from React:

Usually you won’t need this unless you need to pass a key to your Fragment.

Like any other element, you can assign Fragment elements to variables, pass them as props, and so on:

You can use Fragment to group text together with components:

Here’s a situation where you need to write Fragment explicitly instead of using the <></> syntax. When you render multiple elements in a loop, you need to assign a key to each element. If the elements within the loop are Fragments, you need to use the normal JSX element syntax in order to provide the key attribute:

You can inspect the DOM to verify that there are no wrapper elements around the Fragment children:

Fragment refs allow you to interact with the DOM nodes wrapped by a Fragment without adding extra wrapper elements. This is useful for event handling, visibility tracking, focus management, and replacing deprecated patterns like ReactDOM.findDOMNode().

Fragment refs are useful for visibility tracking and intersection observation. This enables you to monitor when content becomes visible without requiring the child Components to expose refs:

This pattern is an alternative to Effect-based visibility logging, which is an anti-pattern in most cases. Relying on Effects alone does not guarantee that the rendered Component is observable by the user.

Fragment refs provide focus management methods that work across all DOM nodes within the Fragment:

The focus() method focuses the first focusable element within the Fragment, while focusLast() focuses the last focusable element.

**Examples:**

Example 1 (jsx):
```jsx
<>  <OneChild />  <AnotherChild /></>
```

Example 2 (jsx):
```jsx
function Post() {  return (    <>      <PostTitle />      <PostBody />    </>  );}
```

Example 3 (jsx):
```jsx
import { Fragment } from 'react';function Post() {  return (    <Fragment>      <PostTitle />      <PostBody />    </Fragment>  );}
```

Example 4 (jsx):
```jsx
function CloseDialog() {  const buttons = (    <>      <OKButton />      <CancelButton />    </>  );  return (    <AlertDialog buttons={buttons}>      Are you sure you want to leave this page?    </AlertDialog>  );}
```

---

## <Suspense>

**URL:** https://react.dev/reference/react/Suspense

**Contents:**
- <Suspense>
- Reference
  - <Suspense>
    - Props
    - Caveats
- Usage
  - Displaying a fallback while content is loading
  - Note
  - Revealing content together at once
  - Revealing nested content as it loads

<Suspense> lets you display a fallback until its children have finished loading.

You can wrap any part of your application with a Suspense boundary:

React will display your loading fallback until all the code and data needed by the children has been loaded.

In the example below, the Albums component suspends while fetching the list of albums. Until it’s ready to render, React switches the closest Suspense boundary above to show the fallback—your Loading component. Then, when the data loads, React hides the Loading fallback and renders the Albums component with data.

Only Suspense-enabled data sources will activate the Suspense component. They include:

Suspense does not detect when data is fetched inside an Effect or event handler.

The exact way you would load data in the Albums component above depends on your framework. If you use a Suspense-enabled framework, you’ll find the details in its data fetching documentation.

Suspense-enabled data fetching without the use of an opinionated framework is not yet supported. The requirements for implementing a Suspense-enabled data source are unstable and undocumented. An official API for integrating data sources with Suspense will be released in a future version of React.

By default, the whole tree inside Suspense is treated as a single unit. For example, even if only one of these components suspends waiting for some data, all of them together will be replaced by the loading indicator:

Then, after all of them are ready to be displayed, they will all appear together at once.

In the example below, both Biography and Albums fetch some data. However, because they are grouped under a single Suspense boundary, these components always “pop in” together at the same time.

Components that load data don’t have to be direct children of the Suspense boundary. For example, you can move Biography and Albums into a new Details component. This doesn’t change the behavior. Biography and Albums share the same closest parent Suspense boundary, so their reveal is coordinated together.

When a component suspends, the closest parent Suspense component shows the fallback. This lets you nest multiple Suspense components to create a loading sequence. Each Suspense boundary’s fallback will be filled in as the next level of content becomes available. For example, you can give the album list its own fallback:

With this change, displaying the Biography doesn’t need to “wait” for the Albums to load.

The sequence will be:

Suspense boundaries let you coordinate which parts of your UI should always “pop in” together at the same time, and which parts should progressively reveal more content in a sequence of loading states. You can add, move, or delete Suspense boundaries in any place in the tree without affecting the rest of your app’s behavior.

Don’t put a Suspense boundary around every component. Suspense boundaries should not be more granular than the loading sequence that you want the user to experience. If you work with a designer, ask them where the loading states should be placed—it’s likely that they’ve already included them in their design wireframes.

In this example, the SearchResults component suspends while fetching the search results. Type "a", wait for the results, and then edit it to "ab". The results for "a" will get replaced by the loading fallback.

A common alternative UI pattern is to defer updating the list and to keep showing the previous results until the new results are ready. The useDeferredValue Hook lets you pass a deferred version of the query down:

The query will update immediately, so the input will display the new value. However, the deferredQuery will keep its previous value until the data has loaded, so SearchResults will show the stale results for a bit.

To make it more obvious to the user, you can add a visual indication when the stale result list is displayed:

Enter "a" in the example below, wait for the results to load, and then edit the input to "ab". Notice how instead of the Suspense fallback, you now see the dimmed stale result list until the new results have loaded:

Both deferred values and Transitions let you avoid showing Suspense fallback in favor of inline indicators. Transitions mark the whole update as non-urgent so they are typically used by frameworks and router libraries for navigation. Deferred values, on the other hand, are mostly useful in application code where you want to mark a part of UI as non-urgent and let it “lag behind” the rest of the UI.

When a component suspends, the closest parent Suspense boundary switches to showing the fallback. This can lead to a jarring user experience if it was already displaying some content. Try pressing this button:

When you pressed the button, the Router component rendered ArtistPage instead of IndexPage. A component inside ArtistPage suspended, so the closest Suspense boundary started showing the fallback. The closest Suspense boundary was near the root, so the whole site layout got replaced by BigSpinner.

To prevent this, you can mark the navigation state update as a Transition with startTransition:

This tells React that the state transition is not urgent, and it’s better to keep showing the previous page instead of hiding any already revealed content. Now clicking the button “waits” for the Biography to load:

A Transition doesn’t wait for all content to load. It only waits long enough to avoid hiding already revealed content. For example, the website Layout was already revealed, so it would be bad to hide it behind a loading spinner. However, the nested Suspense boundary around Albums is new, so the Transition doesn’t wait for it.

Suspense-enabled routers are expected to wrap the navigation updates into Transitions by default.

In the above example, once you click the button, there is no visual indication that a navigation is in progress. To add an indicator, you can replace startTransition with useTransition which gives you a boolean isPending value. In the example below, it’s used to change the website header styling while a Transition is happening:

During a Transition, React will avoid hiding already revealed content. However, if you navigate to a route with different parameters, you might want to tell React it is different content. You can express this with a key:

Imagine you’re navigating within a user’s profile page, and something suspends. If that update is wrapped in a Transition, it will not trigger the fallback for already visible content. That’s the expected behavior.

However, now imagine you’re navigating between two different user profiles. In that case, it makes sense to show the fallback. For example, one user’s timeline is different content from another user’s timeline. By specifying a key, you ensure that React treats different users’ profiles as different components, and resets the Suspense boundaries during navigation. Suspense-integrated routers should do this automatically.

If you use one of the streaming server rendering APIs (or a framework that relies on them), React will also use your <Suspense> boundaries to handle errors on the server. If a component throws an error on the server, React will not abort the server render. Instead, it will find the closest <Suspense> component above it and include its fallback (such as a spinner) into the generated server HTML. The user will see a spinner at first.

On the client, React will attempt to render the same component again. If it errors on the client too, React will throw the error and display the closest Error Boundary. However, if it does not error on the client, React will not display the error to the user since the content was eventually displayed successfully.

You can use this to opt out some components from rendering on the server. To do this, throw an error in the server environment and then wrap them in a <Suspense> boundary to replace their HTML with fallbacks:

The server HTML will include the loading indicator. It will be replaced by the Chat component on the client.

Replacing visible UI with a fallback creates a jarring user experience. This can happen when an update causes a component to suspend, and the nearest Suspense boundary is already showing content to the user.

To prevent this from happening, mark the update as non-urgent using startTransition. During a Transition, React will wait until enough data has loaded to prevent an unwanted fallback from appearing:

This will avoid hiding existing content. However, any newly rendered Suspense boundaries will still immediately display fallbacks to avoid blocking the UI and let the user see the content as it becomes available.

React will only prevent unwanted fallbacks during non-urgent updates. It will not delay a render if it’s the result of an urgent update. You must opt in with an API like startTransition or useDeferredValue.

If your router is integrated with Suspense, it should wrap its updates into startTransition automatically.

**Examples:**

Example 1 (jsx):
```jsx
<Suspense fallback={<Loading />}>  <SomeComponent /></Suspense>
```

Example 2 (jsx):
```jsx
<Suspense fallback={<Loading />}>  <Albums /></Suspense>
```

Example 3 (jsx):
```jsx
<Suspense fallback={<Loading />}>  <Biography />  <Panel>    <Albums />  </Panel></Suspense>
```

Example 4 (jsx):
```jsx
<Suspense fallback={<Loading />}>  <Details artistId={artist.id} /></Suspense>function Details({ artistId }) {  return (    <>      <Biography artistId={artistId} />      <Panel>        <Albums artistId={artistId} />      </Panel>    </>  );}
```

---

## <Activity>

**URL:** https://react.dev/reference/react/Activity

**Contents:**
- <Activity>
- Reference
  - <Activity>
    - Props
    - Caveats
- Usage
  - Restoring the state of hidden components
  - Restoring the DOM of hidden components
  - Pre-rendering content that’s likely to become visible
  - Note

<Activity> lets you hide and restore the UI and internal state of its children.

You can use Activity to hide part of your application:

When an Activity boundary is hidden, React will visually hide its children using the display: "none" CSS property. It will also destroy their Effects, cleaning up any active subscriptions.

While hidden, children still re-render in response to new props, albeit at a lower priority than the rest of the content.

When the boundary becomes visible again, React will reveal the children with their previous state restored, and re-create their Effects.

In this way, Activity can be thought of as a mechanism for rendering “background activity”. Rather than completely discarding content that’s likely to become visible again, you can use Activity to maintain and restore that content’s UI and internal state, while ensuring that your hidden content has no unwanted side effects.

See more examples below.

In React, when you want to conditionally show or hide a component, you typically mount or unmount it based on that condition:

But unmounting a component destroys its internal state, which is not always what you want.

When you hide a component using an Activity boundary instead, React will “save” its state for later:

This makes it possible to hide and then later restore components in the state they were previously in.

The following example has a sidebar with an expandable section. You can press “Overview” to reveal the three subitems below it. The main app area also has a button that hides and shows the sidebar.

Try expanding the Overview section, and then toggling the sidebar closed then open:

The Overview section always starts out collapsed. Because we unmount the sidebar when isShowingSidebar flips to false, all its internal state is lost.

This is a perfect use case for Activity. We can preserve the internal state of our sidebar, even when visually hiding it.

Let’s replace the conditional rendering of our sidebar with an Activity boundary:

and check out the new behavior:

Our sidebar’s internal state is now restored, without any changes to its implementation.

Since Activity boundaries hide their children using display: none, their children’s DOM is also preserved when hidden. This makes them great for maintaining ephemeral state in parts of the UI that the user is likely to interact with again.

In this example, the Contact tab has a <textarea> where the user can enter a message. If you enter some text, change to the Home tab, then change back to the Contact tab, the draft message is lost:

This is because we’re fully unmounting Contact in App. When the Contact tab unmounts, the <textarea> element’s internal DOM state is lost.

If we switch to using an Activity boundary to show and hide the active tab, we can preserve the state of each tab’s DOM. Try entering text and switching tabs again, and you’ll see the draft message is no longer reset:

Again, the Activity boundary let us preserve the Contact tab’s internal state without changing its implementation.

So far, we’ve seen how Activity can hide some content that the user has interacted with, without discarding that content’s ephemeral state.

But Activity boundaries can also be used to prepare content that the user has yet to see for the first time:

When an Activity boundary is hidden during its initial render, its children won’t be visible on the page — but they will still be rendered, albeit at a lower priority than the visible content, and without mounting their Effects.

This pre-rendering allows the children to load any code or data they need ahead of time, so that later, when the Activity boundary becomes visible, the children can appear faster with reduced loading times.

Let’s look at an example.

In this demo, the Posts tab loads some data. If you press it, you’ll see a Suspense fallback displayed while the data is being fetched:

This is because App doesn’t mount Posts until its tab is active.

If we update App to use an Activity boundary to show and hide the active tab, Posts will be pre-rendered when the app first loads, allowing it to fetch its data before it becomes visible.

Try clicking the Posts tab now:

Posts was able to prepare itself for a faster render, thanks to the hidden Activity boundary.

Pre-rendering components with hidden Activity boundaries is a powerful way to reduce loading times for parts of the UI that the user is likely to interact with next.

Only Suspense-enabled data sources will be fetched during pre-rendering. They include:

Activity does not detect data that is fetched inside an Effect.

The exact way you would load data in the Posts component above depends on your framework. If you use a Suspense-enabled framework, you’ll find the details in its data fetching documentation.

Suspense-enabled data fetching without the use of an opinionated framework is not yet supported. The requirements for implementing a Suspense-enabled data source are unstable and undocumented. An official API for integrating data sources with Suspense will be released in a future version of React.

React includes an under-the-hood performance optimization called Selective Hydration. It works by hydrating your app’s initial HTML in chunks, enabling some components to become interactive even if other components on the page haven’t loaded their code or data yet.

Suspense boundaries participate in Selective Hydration, because they naturally divide your component tree into units that are independent from one another:

Here, MessageComposer can be fully hydrated during the initial render of the page, even before Chats is mounted and starts to fetch its data.

So by breaking up your component tree into discrete units, Suspense allows React to hydrate your app’s server-rendered HTML in chunks, enabling parts of your app to become interactive as fast as possible.

But what about pages that don’t use Suspense?

Take this tabs example:

Here, React must hydrate the entire page all at once. If Home or Video are slower to render, they could make the tab buttons feel unresponsive during hydration.

Adding Suspense around the active tab would solve this:

…but it would also change the UI, since the Placeholder fallback would be displayed on the initial render.

Instead, we can use Activity. Since Activity boundaries show and hide their children, they already naturally divide the component tree into independent units. And just like Suspense, this feature allows them to participate in Selective Hydration.

Let’s update our example to use Activity boundaries around the active tab:

Now our initial server-rendered HTML looks the same as it did in the original version, but thanks to Activity, React can hydrate the tab buttons first, before it even mounts Home or Video.

Thus, in addition to hiding and showing content, Activity boundaries help improve your app’s performance during hydration by letting React know which parts of your page can become interactive in isolation.

And even if your page doesn’t ever hide part of its content, you can still add always-visible Activity boundaries to improve hydration performance:

An Activity boundary hides its content by setting display: none on its children and cleaning up any of their Effects. So, most well-behaved React components that properly clean up their side effects will already be robust to being hidden by Activity.

But there are some situations where a hidden component behaves differently than an unmounted one. Most notably, since a hidden component’s DOM is not destroyed, any side effects from that DOM will persist, even after the component is hidden.

As an example, consider a <video> tag. Typically it doesn’t require any cleanup, because even if you’re playing a video, unmounting the tag stops the video and audio from playing in the browser. Try playing the video and then pressing Home in this demo:

The video stops playing as expected.

Now, let’s say we wanted to preserve the timecode where the user last watched, so that when they tab back to the video, it doesn’t start over from the beginning again.

This is a great use case for Activity!

Let’s update App to hide the inactive tab with a hidden Activity boundary instead of unmounting it, and see how the demo behaves this time:

Whoops! The video and audio continue to play even after it’s been hidden, because the tab’s <video> element is still in the DOM.

To fix this, we can add an Effect with a cleanup function that pauses the video:

We call useLayoutEffect instead of useEffect because conceptually the clean-up code is tied to the component’s UI being visually hidden. If we used a regular effect, the code could be delayed by (say) a re-suspending Suspense boundary or a View Transition.

Let’s see the new behavior. Try playing the video, switching to the Home tab, then back to the Video tab:

It works great! Our cleanup function ensures that the video stops playing if it’s ever hidden by an Activity boundary, and even better, because the <video> tag is never destroyed, the timecode is preserved, and the video itself doesn’t need to be initialized or downloaded again when the user switches back to keep watching it.

This is a great example of using Activity to preserve ephemeral DOM state for parts of the UI that become hidden, but the user is likely to interact with again soon.

Our example illustrates that for certain tags like <video>, unmounting and hiding have different behavior. If a component renders DOM that has a side effect, and you want to prevent that side effect when an Activity boundary hides it, add an Effect with a return function to clean it up.

The most common cases of this will be from the following tags:

Typically, though, most of your React components should already be robust to being hidden by an Activity boundary. And conceptually, you should think of “hidden” Activities as being unmounted.

To eagerly discover other Effects that don’t have proper cleanup, which is important not only for Activity boundaries but for many other behaviors in React, we recommend using <StrictMode>.

When an <Activity> is “hidden”, all its children’s Effects are cleaned up. Conceptually, the children are unmounted, but React saves their state for later. This is a feature of Activity because it means subscriptions won’t be active for hidden parts of the UI, reducing the amount of work needed for hidden content.

If you’re relying on an Effect mounting to clean up a component’s side effects, refactor the Effect to do the work in the returned cleanup function instead.

To eagerly find problematic Effects, we recommend adding <StrictMode> which will eagerly perform Activity unmounts and mounts to catch any unexpected side-effects.

**Examples:**

Example 1 (jsx):
```jsx
<Activity mode={visibility}>  <Sidebar /></Activity>
```

Example 2 (jsx):
```jsx
<Activity mode={isShowingSidebar ? "visible" : "hidden"}>  <Sidebar /></Activity>
```

Example 3 (jsx):
```jsx
{isShowingSidebar && (  <Sidebar />)}
```

Example 4 (jsx):
```jsx
<Activity mode={isShowingSidebar ? "visible" : "hidden"}>  <Sidebar /></Activity>
```

---

## <ViewTransition> - This feature is available in the latest Canary version of React

**URL:** https://react.dev/reference/react/ViewTransition

**Contents:**
- <ViewTransition> - This feature is available in the latest Canary version of React
  - Canary
- Reference
  - <ViewTransition>
      - Deep Dive
    - How does <ViewTransition> work?
    - Props
    - Callback
  - View Transition Class
  - Styling View Transitions

The <ViewTransition /> API is currently only available in React’s Canary and Experimental channels.

Learn more about React’s release channels here.

<ViewTransition> lets you animate elements that update inside a Transition.

Wrap elements in <ViewTransition> to animate them when they update inside a Transition. React uses the following heuristics to determine if a View Transition activates for an animation:

By default, <ViewTransition> animates with a smooth cross-fade (the browser default view transition). You can customize the animation by providing a View Transition Class to the <ViewTransition> component. You can customize animations for each kind of trigger (see Styling View Transitions).

Under the hood, React applies view-transition-name to inline styles of the nearest DOM node nested inside the <ViewTransition> component. If there are multiple sibling DOM nodes like <ViewTransition><div /><div /></ViewTransition> then React adds a suffix to the name to make each unique but conceptually they’re part of the same one. React doesn’t apply these eagerly but only at the time that boundary should participate in an animation.

React automatically calls startViewTransition itself behind the scenes so you should never do that yourself. In fact, if you have something else on the page running a ViewTransition React will interrupt it. So it’s recommended that you use React itself to coordinate these. If you had other ways of trigger ViewTransitions in the past, we recommend that you migrate to the built-in way.

If there are other React ViewTransitions already running then React will wait for them to finish before starting the next one. However, importantly if there are multiple updates happening while the first one is running, those will all be batched into one. If you start A->B. Then in the meantime you get an update to go to C and then D. When the first A->B animation finishes the next one will animate from B->D.

The getSnapshotBeforeUpdate life-cycle will be called before startViewTransition and some view-transition-name will update at the same time.

Then React calls startViewTransition. Inside the updateCallback, React will:

After the ready Promise of the startViewTransition is resolved, React will then revert the view-transition-name. Then React will invoke the onEnter, onExit, onUpdate and onShare callbacks to allow for manual programmatic control over the Animations. This will be after the built-in default ones have already been computed.

If a flushSync happens to get in the middle of this sequence, then React will skip the Transition since it relies on being able to complete synchronously.

After the finished Promise of the startViewTransition is resolved, React will then invoke useEffect. This prevents those from interfering with the performance of the Animation. However, this is not a guarantee because if another setState happens while the Animation is running it’ll still have to invoke the useEffect earlier to preserve the sequential guarantees.

By default, <ViewTransition> animates with a smooth cross-fade. You can customize the animation, or specify a shared element transition, with these props:

These callbacks allow you to adjust the animation imperatively using the animate APIs:

Each callback receives as arguments:

The View Transition Class is the CSS class name(s) applied by React during the transition when the ViewTransition activates. It can be a string or an object.

The value 'none' can be used to prevent a View Transition from activating for a specific trigger.

In many early examples of View Transitions around the web, you’ll have seen using a view-transition-name and then style it using ::view-transition-...(my-name) selectors. We don’t recommend that for styling. Instead, we normally recommend using a View Transition Class instead.

To customize the animation for a <ViewTransition> you can provide a View Transition Class to one of the activation props. The View Transition Class is a CSS class name that React applies to the child elements when the ViewTransition activates.

For example, to customize an “enter” animation, provide a class name to the enter prop:

When the <ViewTransition> activates an “enter” animation, React will add the class name slide-in. Then you can refer to this class using view transition pseudo selectors to build reusable animations:

In the future, CSS libraries may add built-in animations using View Transition Classes to make this easier to use.

Enter/Exit Transitions trigger when a <ViewTransition> is added or removed by a component in a transition:

When setShow is called, show switches to true and the Child component is rendered. When setShow is called inside startTransition, and Child renders a ViewTransition before any other DOM nodes, an enter animation is triggered.

When show switches back to false, an exit animation is triggered.

<ViewTransition> only activates if it is placed before any DOM node. If Child instead looked like this, no animation would trigger:

Normally, we don’t recommend assigning a name to a <ViewTransition> and instead let React assign it an automatic name. The reason you might want to assign a name is to animate between completely different components when one tree unmounts and another tree mounts at the same time. To preserve continuity.

When one tree unmounts and another mounts, if there’s a pair where the same name exists in the unmounting tree and the mounting tree, they trigger the “share” animation on both. It animates from the unmounting side to the mounting side.

Unlike an exit/enter animation this can be deeply inside the deleted/mounted tree. If a <ViewTransition> would also be eligible for exit/enter, then the “share” animation takes precedence.

If Transition first unmounts one side and then leads to a <Suspense> fallback being shown before eventually the new name being mounted, then no shared element transition happens.

If either the mounted or unmounted side of a pair is outside the viewport, then no pair is formed. This ensures that it doesn’t fly in or out of the viewport when something is scrolled. Instead it’s treated as a regular enter/exit by itself.

This does not happen if the same Component instance changes position, which triggers an “update”. Those animate regardless if one position is outside the viewport.

There’s currently a quirk where if a deeply nested unmounted <ViewTransition> is inside the viewport but the mounted side is not within the viewport, then the unmounted side animates as its own “exit” animation even if it’s deeply nested instead of as part of the parent animation.

It’s important that there’s only one thing with the same name mounted at a time in the entire app. Therefore it’s important to use unique namespaces for the name to avoid conflicts. To ensure you can do this you might want to add a constant in a separate module that you import.

When reordering a list, without updating the content, the “update” animation triggers on each <ViewTransition> in the list if they’re outside a DOM node. Similar to enter/exit animations.

This means that this will trigger the animation on this <ViewTransition>:

However, this wouldn’t animate each individual item:

Instead, any parent <ViewTransition> would cross-fade. If there is no parent <ViewTransition> then there’s no animation in that case.

This means you might want to avoid wrapper elements in lists where you want to allow the Component to control its own reorder animation:

The above rule also applies if one of the items updates to resize, which then causes the siblings to resize, it’ll also animate its sibling <ViewTransition> but only if they’re immediate siblings.

This means that during an update, which causes a lot of re-layout, it doesn’t individually animate every <ViewTransition> on the page. That would lead to a lot of noisy animations which distracts from the actual change. Therefore React is more conservative about when an individual animation triggers.

It’s important to properly use keys to preserve identity when reordering lists. It might seem like you could use “name”, shared element transitions, to animate reorders but that would not trigger if one side was outside the viewport. To animate a reorder you often want to show that it went to a position outside the viewport.

Just like any Transition, React waits for data and new CSS (<link rel="stylesheet" precedence="...">) before running the animation. In addition to this, ViewTransitions also wait up to 500ms for new fonts to load before starting the animation to avoid them flickering in later. For the same reason, an image wrapped in ViewTransition will wait for the image to load.

If it’s inside a new Suspense boundary instance, then the fallback is shown first. After the Suspense boundary fully loads, it triggers the <ViewTransition> to animate the reveal to the content.

Currently, this only happens for client-side Transition. In the future, this will also animate Suspense boundary for streaming SSR when content from the server suspends during the initial load.

There are two ways to animate Suspense boundaries depending on where you place the <ViewTransition>:

In this scenario when the content goes from A to B, it’ll be treated as an “update” and apply that class if appropriate. Both A and B will get the same view-transition-name and therefore they’re acting as a cross-fade by default.

In this scenario, these are two separate ViewTransition instances each with their own view-transition-name. This will be treated as an “exit” of the <A> and an “enter” of the <B>.

You can achieve different effects depending on where you choose to place the <ViewTransition> boundary.

Sometimes you’re wrapping a large existing component, like a whole page, and you want to animate some updates, such as changing the theme. However, you don’t want it to opt-in all updates inside the whole page to cross-fade when they’re updating. Especially if you’re incrementally adding more animations.

You can use the class “none” to opt-out of an animation. By wrapping your children in a “none” you can disable animations for updates to them while the parent still triggers.

This will only animate if the theme changes and not if only the children update. The children can still opt-in again with their own <ViewTransition> but at least it’s manual again.

By default, <ViewTransition> includes the default cross-fade from the browser.

To customize animations, you can provide props to the <ViewTransition> component to specify which animations to use, based on how the <ViewTransition> activates.

For example, we can slow down the default cross fade animation:

And define slow-fade in CSS using view transition classes:

In addition to setting the default, you can also provide configurations for enter, exit, update, and share animations.

You can use the addTransitionType API to add a class name to the child elements when a specific transition type is activated for a specific activation trigger. This allows you to customize the animation for each type of transition.

For example, to customize the animation for all forward and backward navigations:

When the ViewTransition activates a “navigation-back” animation, React will add the class name “slide-right”. When the ViewTransition activates a “navigation-forward” animation, React will add the class name “slide-left”.

In the future, routers and other libraries may add support for standard view-transition types and styles.

React waits for any pending Navigation to finish to ensure that scroll restoration happens within the animation. If the Navigation is blocked on React, your router must unblock in useLayoutEffect since useEffect would lead to a deadlock.

If a startTransition is started from the legacy popstate event, such as during a “back”-navigation then it must finish synchronously to ensure scroll and form restoration works correctly. This is in conflict with running a View Transition animation. Therefore, React will skip animations from popstate. Therefore animations won’t run for the back button. You can fix this by upgrading your router to use the Navigation API.

<ViewTransition> only activates if it is placed before any DOM node:

To fix, ensure that the <ViewTransition> comes before any other DOM nodes:

This error occurs when two <ViewTransition> components with the same name are mounted at the same time:

This will cause the View Transition to error. In development, React detects this issue to surface it and logs two errors:

To fix, ensure that there’s only one <ViewTransition> with the same name mounted at a time in the entire app by ensuring the name is unique, or adding an id to the name:

**Examples:**

Example 1 (sql):
```sql
import {ViewTransition} from 'react';<ViewTransition>  <div>...</div></ViewTransition>
```

Example 2 (jsx):
```jsx
<ViewTransition enter="slide-in">
```

Example 3 (julia):
```julia
::view-transition-group(.slide-in) {  }::view-transition-old(.slide-in) {}::view-transition-new(.slide-in) {}
```

Example 4 (jsx):
```jsx
function Child() {  return (    <ViewTransition>      <div>Hi</div>    </ViewTransition>  );}function Parent() {  const [show, setShow] = useState();  if (show) {    return <Child />;  }  return null;}
```

---

## act

**URL:** https://react.dev/reference/react/act

**Contents:**
- act
  - Note
- Reference
  - await act(async actFn)
  - Note
    - Parameters
    - Returns
- Usage
  - Rendering components in tests
  - Dispatching events in tests

act is a test helper to apply pending React updates before making assertions.

To prepare a component for assertions, wrap the code rendering it and performing updates inside an await act() call. This makes your test run closer to how React works in the browser.

You might find using act() directly a bit too verbose. To avoid some of the boilerplate, you could use a library like React Testing Library, whose helpers are wrapped with act().

When writing UI tests, tasks like rendering, user events, or data fetching can be considered as “units” of interaction with a user interface. React provides a helper called act() that makes sure all updates related to these “units” have been processed and applied to the DOM before you make any assertions.

The name act comes from the Arrange-Act-Assert pattern.

We recommend using act with await and an async function. Although the sync version works in many cases, it doesn’t work in all cases and due to the way React schedules updates internally, it’s difficult to predict when you can use the sync version.

We will deprecate and remove the sync version in the future.

act does not return anything.

When testing a component, you can use act to make assertions about its output.

For example, let’s say we have this Counter component, the usage examples below show how to test it:

To test the render output of a component, wrap the render inside act():

Here, we create a container, append it to the document, and render the Counter component inside act(). This ensures that the component is rendered and its effects are applied before making assertions.

Using act ensures that all updates have been applied before we make assertions.

To test events, wrap the event dispatch inside act():

Here, we render the component with act, and then dispatch the event inside another act(). This ensures that all updates from the event are applied before making assertions.

Don’t forget that dispatching DOM events only works when the DOM container is added to the document. You can use a library like React Testing Library to reduce the boilerplate code.

Using act requires setting global.IS_REACT_ACT_ENVIRONMENT=true in your test environment. This is to ensure that act is only used in the correct environment.

If you don’t set the global, you will see an error like this:

To fix, add this to your global setup file for React tests:

In testing frameworks like React Testing Library, IS_REACT_ACT_ENVIRONMENT is already set for you.

**Examples:**

Example 1 (swift):
```swift
await act(async actFn)
```

Example 2 (jsx):
```jsx
it ('renders with button disabled', async () => {  await act(async () => {    root.render(<TestComponent />)  });  expect(container.querySelector('button')).toBeDisabled();});
```

Example 3 (jsx):
```jsx
function Counter() {  const [count, setCount] = useState(0);  const handleClick = () => {    setCount(prev => prev + 1);  }  useEffect(() => {    document.title = `You clicked ${count} times`;  }, [count]);  return (    <div>      <p>You clicked {count} times</p>      <button onClick={handleClick}>        Click me      </button>    </div>  )}
```

Example 4 (jsx):
```jsx
import {act} from 'react';import ReactDOMClient from 'react-dom/client';import Counter from './Counter';it('can render and update a counter', async () => {  container = document.createElement('div');  document.body.appendChild(container);    // ✅ Render the component inside act().  await act(() => {    ReactDOMClient.createRoot(container).render(<Counter />);  });    const button = container.querySelector('button');  const label = container.querySelector('p');  expect(label.textContent).toBe('You clicked 0 times');  expect(document.title).toBe('You clicked 0 times');});
```

---

## addTransitionType - This feature is available in the latest Canary version of React

**URL:** https://react.dev/reference/react/addTransitionType

**Contents:**
- addTransitionType - This feature is available in the latest Canary version of React
  - Canary
- Reference
  - addTransitionType
    - Parameters
    - Returns
    - Caveats
- Usage
  - Adding the cause of a transition
  - Customize animations using browser view transition types

The addTransitionType API is currently only available in React’s Canary and Experimental channels.

Learn more about React’s release channels here.

addTransitionType lets you specify the cause of a transition.

addTransitionType does not return anything.

Call addTransitionType inside of startTransition to indicate the cause of a transition:

When you call addTransitionType inside the scope of startTransition, React will associate submit-click as one of the causes for the Transition.

Currently, Transition Types can be used to customize different animations based on what caused the Transition. You have three different ways to choose from for how to use them:

In the future, we plan to support more use cases for using the cause of a transition.

When a ViewTransition activates from a transition, React adds all the Transition Types as browser view transition types to the element.

This allows you to customize different animations based on CSS scopes:

You can customize animations for an activated ViewTransition based on type by passing an object to the View Transition Class:

If multiple types match, then they’re joined together. If no types match then the special “default” entry is used instead. If any type has the value “none” then that wins and the ViewTransition is disabled (not assigned a name).

These can be combined with enter/exit/update/layout/share props to match based on kind of trigger and Transition Type.

You can imperatively customize animations for an activated ViewTransition based on type using View Transition events:

This allows you to pick different imperative Animations based on the cause.

**Examples:**

Example 1 (javascript):
```javascript
startTransition(() => {  addTransitionType('my-transition-type');  setState(newState);});
```

Example 2 (jsx):
```jsx
import { startTransition, addTransitionType } from 'react';function Submit({action) {  function handleClick() {    startTransition(() => {      addTransitionType('submit-click');      action();    });  }  return <button onClick={handleClick}>Click me</button>;}
```

Example 3 (javascript):
```javascript
function Component() {  return (    <ViewTransition>      <div>Hello</div>    </ViewTransition>  );}startTransition(() => {  addTransitionType('my-transition-type');  setShow(true);});
```

Example 4 (julia):
```julia
:root:active-view-transition-type(my-transition-type) {  &::view-transition-...(...) {    ...  }}
```

---

## cache

**URL:** https://react.dev/reference/react/cache

**Contents:**
- cache
  - React Server Components
- Reference
  - cache(fn)
    - Parameters
    - Returns
  - Note
    - Caveats
- Usage
  - Cache an expensive computation

cache is only for use with React Server Components.

cache lets you cache the result of a data fetch or computation.

Call cache outside of any components to create a version of the function with caching.

When getMetrics is first called with data, getMetrics will call calculateMetrics(data) and store the result in cache. If getMetrics is called again with the same data, it will return the cached result instead of calling calculateMetrics(data) again.

See more examples below.

cache returns a cached version of fn with the same type signature. It does not call fn in the process.

When calling cachedFn with given arguments, it first checks if a cached result exists in the cache. If a cached result exists, it returns the result. If not, it calls fn with the arguments, stores the result in the cache, and returns the result. The only time fn is called is when there is a cache miss.

The optimization of caching return values based on inputs is known as memoization. We refer to the function returned from cache as a memoized function.

Use cache to skip duplicate work.

If the same user object is rendered in both Profile and TeamReport, the two components can share work and only call calculateUserMetrics once for that user.

Assume Profile is rendered first. It will call getUserMetrics, and check if there is a cached result. Since it is the first time getUserMetrics is called with that user, there will be a cache miss. getUserMetrics will then call calculateUserMetrics with that user and write the result to cache.

When TeamReport renders its list of users and reaches the same user object, it will call getUserMetrics and read the result from cache.

If calculateUserMetrics can be aborted by passing an AbortSignal, you can use cacheSignal() to cancel the expensive computation if React has finished rendering. calculateUserMetrics may already handle cancellation internally by using cacheSignal directly.

To access the same cache, components must call the same memoized function.

In the above example, Precipitation and Temperature each call cache to create a new memoized function with their own cache look-up. If both components render for the same cityData, they will do duplicate work to call calculateWeekReport.

In addition, Temperature creates a new memoized function each time the component is rendered which doesn’t allow for any cache sharing.

To maximize cache hits and reduce work, the two components should call the same memoized function to access the same cache. Instead, define the memoized function in a dedicated module that can be import-ed across components.

Here, both components call the same memoized function exported from ./getWeekReport.js to read and write to the same cache.

To share a snapshot of data between components, call cache with a data-fetching function like fetch. When multiple components make the same data fetch, only one request is made and the data returned is cached and shared across components. All components refer to the same snapshot of data across the server render.

If AnimatedWeatherCard and MinimalWeatherCard both render for the same city, they will receive the same snapshot of data from the memoized function.

If AnimatedWeatherCard and MinimalWeatherCard supply different city arguments to getTemperature, then fetchTemperature will be called twice and each call site will receive different data.

The city acts as a cache key.

Asynchronous rendering is only supported for Server Components.

To render components that use asynchronous data in Client Components, see use() documentation.

By caching a long-running data fetch, you can kick off asynchronous work prior to rendering the component.

When rendering Page, the component calls getUser but note that it doesn’t use the returned data. This early getUser call kicks off the asynchronous database query that occurs while Page is doing other computational work and rendering children.

When rendering Profile, we call getUser again. If the initial getUser call has already returned and cached the user data, when Profile asks and waits for this data, it can simply read from the cache without requiring another remote procedure call. If the initial data request hasn’t been completed, preloading data in this pattern reduces delay in data-fetching.

When evaluating an asynchronous function, you will receive a Promise for that work. The promise holds the state of that work (pending, fulfilled, failed) and its eventual settled result.

In this example, the asynchronous function fetchData returns a promise that is awaiting the fetch.

In calling getData the first time, the promise returned from fetchData is cached. Subsequent look-ups will then return the same promise.

Notice that the first getData call does not await whereas the second does. await is a JavaScript operator that will wait and return the settled result of the promise. The first getData call simply initiates the fetch to cache the promise for the second getData to look-up.

If by the second call the promise is still pending, then await will pause for the result. The optimization is that while we wait on the fetch, React can continue with computational work, thus reducing the wait time for the second call.

If the promise is already settled, either to an error or the fulfilled result, await will return that value immediately. In both outcomes, there is a performance benefit.

React only provides cache access to the memoized function in a component. When calling getUser outside of a component, it will still evaluate the function but not read or update the cache.

This is because cache access is provided through a context which is only accessible from a component.

All mentioned APIs offer memoization but the difference is what they’re intended to memoize, who can access the cache, and when their cache is invalidated.

In general, you should use useMemo for caching an expensive computation in a Client Component across renders. As an example, to memoize a transformation of data within a component.

In this example, App renders two WeatherReports with the same record. Even though both components do the same work, they cannot share work. useMemo’s cache is only local to the component.

However, useMemo does ensure that if App re-renders and the record object doesn’t change, each component instance would skip work and use the memoized value of avgTemp. useMemo will only cache the last computation of avgTemp with the given dependencies.

In general, you should use cache in Server Components to memoize work that can be shared across components.

Re-writing the previous example to use cache, in this case the second instance of WeatherReport will be able to skip duplicate work and read from the same cache as the first WeatherReport. Another difference from the previous example is that cache is also recommended for memoizing data fetches, unlike useMemo which should only be used for computations.

At this time, cache should only be used in Server Components and the cache will be invalidated across server requests.

You should use memo to prevent a component re-rendering if its props are unchanged.

In this example, both MemoWeatherReport components will call calculateAvg when first rendered. However, if App re-renders, with no changes to record, none of the props have changed and MemoWeatherReport will not re-render.

Compared to useMemo, memo memoizes the component render based on props vs. specific computations. Similar to useMemo, the memoized component only caches the last render with the last prop values. Once the props change, the cache invalidates and the component re-renders.

See prior mentioned pitfalls

If none of the above apply, it may be a problem with how React checks if something exists in cache.

If your arguments are not primitives (ex. objects, functions, arrays), ensure you’re passing the same object reference.

When calling a memoized function, React will look up the input arguments to see if a result is already cached. React will use shallow equality of the arguments to determine if there is a cache hit.

In this case the two MapMarkers look like they’re doing the same work and calling calculateNorm with the same value of {x: 10, y: 10, z:10}. Even though the objects contain the same values, they are not the same object reference as each component creates its own props object.

React will call Object.is on the input to verify if there is a cache hit.

One way to address this could be to pass the vector dimensions to calculateNorm. This works because the dimensions themselves are primitives.

Another solution may be to pass the vector object itself as a prop to the component. We’ll need to pass the same object to both component instances.

**Examples:**

Example 1 (javascript):
```javascript
const cachedFn = cache(fn);
```

Example 2 (javascript):
```javascript
import {cache} from 'react';import calculateMetrics from 'lib/metrics';const getMetrics = cache(calculateMetrics);function Chart({data}) {  const report = getMetrics(data);  // ...}
```

Example 3 (javascript):
```javascript
import {cache} from 'react';import calculateUserMetrics from 'lib/user';const getUserMetrics = cache(calculateUserMetrics);function Profile({user}) {  const metrics = getUserMetrics(user);  // ...}function TeamReport({users}) {  for (let user in users) {    const metrics = getUserMetrics(user);    // ...  }  // ...}
```

Example 4 (javascript):
```javascript
// Temperature.jsimport {cache} from 'react';import {calculateWeekReport} from './report';export function Temperature({cityData}) {  // 🚩 Wrong: Calling `cache` in component creates new `getWeekReport` for each render  const getWeekReport = cache(calculateWeekReport);  const report = getWeekReport(cityData);  // ...}
```

---

## captureOwnerStack

**URL:** https://react.dev/reference/react/captureOwnerStack

**Contents:**
- captureOwnerStack
- Reference
  - captureOwnerStack()
    - Parameters
    - Returns
    - Caveats
      - Deep Dive
    - Owner Stack vs Component Stack
- Usage
  - Enhance a custom error overlay

captureOwnerStack reads the current Owner Stack in development and returns it as a string if available.

Call captureOwnerStack to get the current Owner Stack.

captureOwnerStack does not take any parameters.

captureOwnerStack returns string | null.

Owner Stacks are available in

If no Owner Stack is available, null is returned (see Troubleshooting: The Owner Stack is null).

The Owner Stack is different from the Component Stack available in React error handlers like errorInfo.componentStack in onUncaughtError.

For example, consider the following code:

SubComponent would throw an error. The Component Stack of that error would be

However, the Owner Stack would only read

Neither App nor the DOM components (e.g. fieldset) are considered Owners in this Stack since they didn’t contribute to “creating” the node containing SubComponent. App and DOM components only forwarded the node. App just rendered the children node as opposed to Component which created a node containing SubComponent via <SubComponent />.

Neither Navigation nor legend are in the stack at all since it’s only a sibling to a node containing <SubComponent />.

SubComponent is omitted because it’s already part of the callstack.

If you intercept console.error calls to highlight them in an error overlay, you can call captureOwnerStack to include the Owner Stack.

The call of captureOwnerStack happened outside of a React controlled function e.g. in a setTimeout callback, after a fetch call or in a custom DOM event handler. During render, Effects, React event handlers, and React error handlers (e.g. hydrateRoot#options.onCaughtError) Owner Stacks should be available.

In the example below, clicking the button will log an empty Owner Stack because captureOwnerStack was called during a custom DOM event handler. The Owner Stack must be captured earlier e.g. by moving the call of captureOwnerStack into the Effect body.

captureOwnerStack is only exported in development builds. It will be undefined in production builds. If captureOwnerStack is used in files that are bundled for production and development, you should conditionally access it from a namespace import.

**Examples:**

Example 1 (javascript):
```javascript
const stack = captureOwnerStack();
```

Example 2 (javascript):
```javascript
import * as React from 'react';function Component() {  if (process.env.NODE_ENV !== 'production') {    const ownerStack = React.captureOwnerStack();    console.log(ownerStack);  }}
```

Example 3 (unknown):
```unknown
at SubComponentat fieldsetat Componentat mainat React.Suspenseat App
```

Example 4 (unknown):
```unknown
at Component
```

---

## lazy

**URL:** https://react.dev/reference/react/lazy

**Contents:**
- lazy
- Reference
  - lazy(load)
    - Parameters
    - Returns
  - load function
    - Parameters
    - Returns
- Usage
  - Lazy-loading components with Suspense

lazy lets you defer loading component’s code until it is rendered for the first time.

Call lazy outside your components to declare a lazy-loaded React component:

See more examples below.

lazy returns a React component you can render in your tree. While the code for the lazy component is still loading, attempting to render it will suspend. Use <Suspense> to display a loading indicator while it’s loading.

load receives no parameters.

You need to return a Promise or some other thenable (a Promise-like object with a then method). It needs to eventually resolve to an object whose .default property is a valid React component type, such as a function, memo, or a forwardRef component.

Usually, you import components with the static import declaration:

To defer loading this component’s code until it’s rendered for the first time, replace this import with:

This code relies on dynamic import(), which might require support from your bundler or framework. Using this pattern requires that the lazy component you’re importing was exported as the default export.

Now that your component’s code loads on demand, you also need to specify what should be displayed while it is loading. You can do this by wrapping the lazy component or any of its parents into a <Suspense> boundary:

In this example, the code for MarkdownPreview won’t be loaded until you attempt to render it. If MarkdownPreview hasn’t loaded yet, Loading will be shown in its place. Try ticking the checkbox:

This demo loads with an artificial delay. The next time you untick and tick the checkbox, Preview will be cached, so there will be no loading state. To see the loading state again, click “Reset” on the sandbox.

Learn more about managing loading states with Suspense.

Do not declare lazy components inside other components:

Instead, always declare them at the top level of your module:

**Examples:**

Example 1 (javascript):
```javascript
const SomeComponent = lazy(load)
```

Example 2 (javascript):
```javascript
import { lazy } from 'react';const MarkdownPreview = lazy(() => import('./MarkdownPreview.js'));
```

Example 3 (sql):
```sql
import MarkdownPreview from './MarkdownPreview.js';
```

Example 4 (javascript):
```javascript
import { lazy } from 'react';const MarkdownPreview = lazy(() => import('./MarkdownPreview.js'));
```

---

## startTransition

**URL:** https://react.dev/reference/react/startTransition

**Contents:**
- startTransition
- Reference
  - startTransition(action)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Marking a state update as a non-blocking Transition
  - Note

startTransition lets you render a part of the UI in the background.

The startTransition function lets you mark a state update as a Transition.

See more examples below.

startTransition does not return anything.

startTransition does not provide a way to track whether a Transition is pending. To show a pending indicator while the Transition is ongoing, you need useTransition instead.

You can wrap an update into a Transition only if you have access to the set function of that state. If you want to start a Transition in response to some prop or a custom Hook return value, try useDeferredValue instead.

The function you pass to startTransition is called immediately, marking all state updates that happen while it executes as Transitions. If you try to perform state updates in a setTimeout, for example, they won’t be marked as Transitions.

You must wrap any state updates after any async requests in another startTransition to mark them as Transitions. This is a known limitation that we will fix in the future (see Troubleshooting).

A state update marked as a Transition will be interrupted by other state updates. For example, if you update a chart component inside a Transition, but then start typing into an input while the chart is in the middle of a re-render, React will restart the rendering work on the chart component after handling the input state update.

Transition updates can’t be used to control text inputs.

If there are multiple ongoing Transitions, React currently batches them together. This is a limitation that may be removed in a future release.

You can mark a state update as a Transition by wrapping it in a startTransition call:

Transitions let you keep the user interface updates responsive even on slow devices.

With a Transition, your UI stays responsive in the middle of a re-render. For example, if the user clicks a tab but then change their mind and click another tab, they can do that without waiting for the first re-render to finish.

startTransition is very similar to useTransition, except that it does not provide the isPending flag to track whether a Transition is ongoing. You can call startTransition when useTransition is not available. For example, startTransition works outside components, such as from a data library.

Learn about Transitions and see examples on the useTransition page.

**Examples:**

Example 1 (unknown):
```unknown
startTransition(action)
```

Example 2 (javascript):
```javascript
import { startTransition } from 'react';function TabContainer() {  const [tab, setTab] = useState('about');  function selectTab(nextTab) {    startTransition(() => {      setTab(nextTab);    });  }  // ...}
```

Example 3 (javascript):
```javascript
import { startTransition } from 'react';function TabContainer() {  const [tab, setTab] = useState('about');  function selectTab(nextTab) {    startTransition(() => {      setTab(nextTab);    });  }  // ...}
```

---

## experimental_taintObjectReference - This feature is available in the latest Experimental version of React

**URL:** https://react.dev/reference/react/experimental_taintObjectReference

**Contents:**
- experimental_taintObjectReference - This feature is available in the latest Experimental version of React
  - Experimental Feature
- Reference
  - taintObjectReference(message, object)
    - Parameters
    - Returns
    - Caveats
  - Pitfall
- Usage
  - Prevent user data from unintentionally reaching the client

This API is experimental and is not available in a stable version of React yet.

You can try it by upgrading React packages to the most recent experimental version:

Experimental versions of React may contain bugs. Don’t use them in production.

This API is only available inside React Server Components.

taintObjectReference lets you prevent a specific object instance from being passed to a Client Component like a user object.

To prevent passing a key, hash or token, see taintUniqueValue.

Call taintObjectReference with an object to register it with React as something that should not be allowed to be passed to the Client as is:

See more examples below.

message: The message you want to display if the object gets passed to a Client Component. This message will be displayed as a part of the Error that will be thrown if the object gets passed to a Client Component.

object: The object to be tainted. Functions and class instances can be passed to taintObjectReference as object. Functions and classes are already blocked from being passed to Client Components but the React’s default error message will be replaced by what you defined in message. When a specific instance of a Typed Array is passed to taintObjectReference as object, any other copies of the Typed Array will not be tainted.

experimental_taintObjectReference returns undefined.

Do not rely on just tainting for security. Tainting an object doesn’t prevent leaking of every possible derived value. For example, the clone of a tainted object will create a new untainted object. Using data from a tainted object (e.g. {secret: taintedObj.secret}) will create a new value or object that is not tainted. Tainting is a layer of protection; a secure app will have multiple layers of protection, well designed APIs, and isolation patterns.

A Client Component should never accept objects that carry sensitive data. Ideally, the data fetching functions should not expose data that the current user should not have access to. Sometimes mistakes happen during refactoring. To protect against these mistakes happening down the line we can “taint” the user object in our data API.

Now whenever anyone tries to pass this object to a Client Component, an error will be thrown with the passed in error message instead.

If you’re running a Server Components environment that has access to sensitive data, you have to be careful not to pass objects straight through:

Ideally, the getUser should not expose data that the current user should not have access to. To prevent passing the user object to a Client Component down the line we can “taint” the user object:

Now if anyone tries to pass the user object to a Client Component, an error will be thrown with the passed in error message.

**Examples:**

Example 1 (unknown):
```unknown
experimental_taintObjectReference(message, object);
```

Example 2 (sql):
```sql
import {experimental_taintObjectReference} from 'react';experimental_taintObjectReference(  'Do not pass ALL environment variables to the client.',  process.env);
```

Example 3 (javascript):
```javascript
import {experimental_taintObjectReference} from 'react';export async function getUser(id) {  const user = await db`SELECT * FROM users WHERE id = ${id}`;  experimental_taintObjectReference(    'Do not pass the entire user object to the client. ' +      'Instead, pick off the specific properties you need for this use case.',    user,  );  return user;}
```

Example 4 (javascript):
```javascript
// api.jsexport async function getUser(id) {  const user = await db`SELECT * FROM users WHERE id = ${id}`;  return user;}
```

---

## experimental_taintUniqueValue - This feature is available in the latest Experimental version of React

**URL:** https://react.dev/reference/react/experimental_taintUniqueValue

**Contents:**
- experimental_taintUniqueValue - This feature is available in the latest Experimental version of React
  - Experimental Feature
- Reference
  - taintUniqueValue(message, lifetime, value)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Prevent a token from being passed to Client Components
  - Pitfall

This API is experimental and is not available in a stable version of React yet.

You can try it by upgrading React packages to the most recent experimental version:

Experimental versions of React may contain bugs. Don’t use them in production.

This API is only available inside React Server Components.

taintUniqueValue lets you prevent unique values from being passed to Client Components like passwords, keys, or tokens.

To prevent passing an object containing sensitive data, see taintObjectReference.

Call taintUniqueValue with a password, token, key or hash to register it with React as something that should not be allowed to be passed to the Client as is:

See more examples below.

message: The message you want to display if value is passed to a Client Component. This message will be displayed as a part of the Error that will be thrown if value is passed to a Client Component.

lifetime: Any object that indicates how long value should be tainted. value will be blocked from being sent to any Client Component while this object still exists. For example, passing globalThis blocks the value for the lifetime of an app. lifetime is typically an object whose properties contains value.

value: A string, bigint or TypedArray. value must be a unique sequence of characters or bytes with high entropy such as a cryptographic token, private key, hash, or a long password. value will be blocked from being sent to any Client Component.

experimental_taintUniqueValue returns undefined.

To ensure that sensitive information such as passwords, session tokens, or other unique values do not inadvertently get passed to Client Components, the taintUniqueValue function provides a layer of protection. When a value is tainted, any attempt to pass it to a Client Component will result in an error.

The lifetime argument defines the duration for which the value remains tainted. For values that should remain tainted indefinitely, objects like globalThis or process can serve as the lifetime argument. These objects have a lifespan that spans the entire duration of your app’s execution.

If the tainted value’s lifespan is tied to a object, the lifetime should be the object that encapsulates the value. This ensures the tainted value remains protected for the lifetime of the encapsulating object.

In this example, the user object serves as the lifetime argument. If this object gets stored in a global cache or is accessible by another request, the session token remains tainted.

Do not rely solely on tainting for security. Tainting a value doesn’t block every possible derived value. For example, creating a new value by upper casing a tainted string will not taint the new value.

In this example, the constant password is tainted. Then password is used to create a new value uppercasePassword by calling the toUpperCase method on password. The newly created uppercasePassword is not tainted.

Other similar ways of deriving new values from tainted values like concatenating it into a larger string, converting it to base64, or returning a substring create untained values.

Tainting only protects against simple mistakes like explicitly passing secret values to the client. Mistakes in calling the taintUniqueValue like using a global store outside of React, without the corresponding lifetime object, can cause the tainted value to become untainted. Tainting is a layer of protection; a secure app will have multiple layers of protection, well designed APIs, and isolation patterns.

If you’re running a Server Components environment that has access to private keys or passwords such as database passwords, you have to be careful not to pass that to a Client Component.

This example would leak the secret API token to the client. If this API token can be used to access data this particular user shouldn’t have access to, it could lead to a data breach.

Ideally, secrets like this are abstracted into a single helper file that can only be imported by trusted data utilities on the server. The helper can even be tagged with server-only to ensure that this file isn’t imported on the client.

Sometimes mistakes happen during refactoring and not all of your colleagues might know about this. To protect against this mistakes happening down the line we can “taint” the actual password:

Now whenever anyone tries to pass this password to a Client Component, or send the password to a Client Component with a Server Function, an error will be thrown with message you defined when you called taintUniqueValue.

**Examples:**

Example 1 (unknown):
```unknown
taintUniqueValue(errMessage, lifetime, value)
```

Example 2 (sql):
```sql
import {experimental_taintUniqueValue} from 'react';experimental_taintUniqueValue(  'Do not pass secret keys to the client.',  process,  process.env.SECRET_KEY);
```

Example 3 (sql):
```sql
import {experimental_taintUniqueValue} from 'react';experimental_taintUniqueValue(  'Do not pass a user password to the client.',  globalThis,  process.env.SECRET_KEY);
```

Example 4 (javascript):
```javascript
import {experimental_taintUniqueValue} from 'react';export async function getUser(id) {  const user = await db`SELECT * FROM users WHERE id = ${id}`;  experimental_taintUniqueValue(    'Do not pass a user session token to the client.',    user,    user.session.token  );  return user;}
```

---

## flushSync

**URL:** https://react.dev/reference/react-dom/flushSync

**Contents:**
- flushSync
  - Pitfall
- Reference
  - flushSync(callback)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Flushing updates for third-party integrations
  - Pitfall

Using flushSync is uncommon and can hurt the performance of your app.

flushSync lets you force React to flush any updates inside the provided callback synchronously. This ensures that the DOM is updated immediately.

Call flushSync to force React to flush any pending work and update the DOM synchronously.

Most of the time, flushSync can be avoided. Use flushSync as last resort.

See more examples below.

flushSync returns undefined.

When integrating with third-party code such as browser APIs or UI libraries, it may be necessary to force React to flush updates. Use flushSync to force React to flush any state updates inside the callback synchronously:

This ensures that, by the time the next line of code runs, React has already updated the DOM.

Using flushSync is uncommon, and using it often can significantly hurt the performance of your app. If your app only uses React APIs, and does not integrate with third-party libraries, flushSync should be unnecessary.

However, it can be helpful for integrating with third-party code like browser APIs.

Some browser APIs expect results inside of callbacks to be written to the DOM synchronously, by the end of the callback, so the browser can do something with the rendered DOM. In most cases, React handles this for you automatically. But in some cases it may be necessary to force a synchronous update.

For example, the browser onbeforeprint API allows you to change the page immediately before the print dialog opens. This is useful for applying custom print styles that allow the document to display better for printing. In the example below, you use flushSync inside of the onbeforeprint callback to immediately “flush” the React state to the DOM. Then, by the time the print dialog opens, isPrinting displays “yes”:

Without flushSync, the print dialog will display isPrinting as “no”. This is because React batches the updates asynchronously and the print dialog is displayed before the state is updated.

flushSync can significantly hurt performance, and may unexpectedly force pending Suspense boundaries to show their fallback state.

Most of the time, flushSync can be avoided, so use flushSync as a last resort.

React cannot flushSync in the middle of a render. If you do, it will noop and warn:

This includes calling flushSync inside:

For example, calling flushSync in an Effect will noop and warn:

To fix this, you usually want to move the flushSync call to an event:

If it’s difficult to move to an event, you can defer flushSync in a microtask:

This will allow the current render to finish and schedule another syncronous render to flush the updates.

flushSync can significantly hurt performance, but this particular pattern is even worse for performance. Exhaust all other options before calling flushSync in a microtask as an escape hatch.

**Examples:**

Example 1 (unknown):
```unknown
flushSync(callback)
```

Example 2 (sql):
```sql
import { flushSync } from 'react-dom';flushSync(() => {  setSomething(123);});
```

Example 3 (javascript):
```javascript
flushSync(() => {  setSomething(123);});// By this line, the DOM is updated.
```

Example 4 (javascript):
```javascript
import { useEffect } from 'react';import { flushSync } from 'react-dom';function MyComponent() {  useEffect(() => {    // 🚩 Wrong: calling flushSync inside an effect    flushSync(() => {      setSomething(newValue);    });  }, []);  return <div>{/* ... */}</div>;}
```

---

## prefetchDNS

**URL:** https://react.dev/reference/react-dom/prefetchDNS

**Contents:**
- prefetchDNS
- Reference
  - prefetchDNS(href)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Prefetching DNS when rendering
  - Prefetching DNS in an event handler

prefetchDNS lets you eagerly look up the IP of a server that you expect to load resources from.

To look up a host, call the prefetchDNS function from react-dom.

See more examples below.

The prefetchDNS function provides the browser with a hint that it should look up the IP address of a given server. If the browser chooses to do so, this can speed up the loading of resources from that server.

prefetchDNS returns nothing.

Call prefetchDNS when rendering a component if you know that its children will load external resources from that host.

Call prefetchDNS in an event handler before transitioning to a page or state where external resources will be needed. This gets the process started earlier than if you call it during the rendering of the new page or state.

**Examples:**

Example 1 (unknown):
```unknown
prefetchDNS("https://example.com");
```

Example 2 (javascript):
```javascript
import { prefetchDNS } from 'react-dom';function AppRoot() {  prefetchDNS("https://example.com");  // ...}
```

Example 3 (javascript):
```javascript
import { prefetchDNS } from 'react-dom';function AppRoot() {  prefetchDNS("https://example.com");  return ...;}
```

Example 4 (jsx):
```jsx
import { prefetchDNS } from 'react-dom';function CallToAction() {  const onClick = () => {    prefetchDNS('http://example.com');    startWizard();  }  return (    <button onClick={onClick}>Start Wizard</button>  );}
```

---

## preinit

**URL:** https://react.dev/reference/react-dom/preinit

**Contents:**
- preinit
  - Note
- Reference
  - preinit(href, options)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Preiniting when rendering
    - Examples of preiniting

React-based frameworks frequently handle resource loading for you, so you might not have to call this API yourself. Consult your framework’s documentation for details.

preinit lets you eagerly fetch and evaluate a stylesheet or external script.

To preinit a script or stylesheet, call the preinit function from react-dom.

See more examples below.

The preinit function provides the browser with a hint that it should start downloading and executing the given resource, which can save time. Scripts that you preinit are executed when they finish downloading. Stylesheets that you preinit are inserted into the document, which causes them to go into effect right away.

preinit returns nothing.

Call preinit when rendering a component if you know that it or its children will use a specific resource, and you’re OK with the resource being evaluated and thereby taking effect immediately upon being downloaded.

If you want the browser to download the script but not to execute it right away, use preload instead. If you want to load an ESM module, use preinitModule.

Call preinit in an event handler before transitioning to a page or state where external resources will be needed. This gets the process started earlier than if you call it during the rendering of the new page or state.

**Examples:**

Example 1 (css):
```css
preinit("https://example.com/script.js", {as: "script"});
```

Example 2 (javascript):
```javascript
import { preinit } from 'react-dom';function AppRoot() {  preinit("https://example.com/script.js", {as: "script"});  // ...}
```

Example 3 (javascript):
```javascript
import { preinit } from 'react-dom';function AppRoot() {  preinit("https://example.com/script.js", {as: "script"});  return ...;}
```

Example 4 (jsx):
```jsx
import { preinit } from 'react-dom';function CallToAction() {  const onClick = () => {    preinit("https://example.com/wizardStyles.css", {as: "style"});    startWizard();  }  return (    <button onClick={onClick}>Start Wizard</button>  );}
```

---

## preload

**URL:** https://react.dev/reference/react-dom/preload

**Contents:**
- preload
  - Note
- Reference
  - preload(href, options)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Preloading when rendering
    - Examples of preloading

React-based frameworks frequently handle resource loading for you, so you might not have to call this API yourself. Consult your framework’s documentation for details.

preload lets you eagerly fetch a resource such as a stylesheet, font, or external script that you expect to use.

To preload a resource, call the preload function from react-dom.

See more examples below.

The preload function provides the browser with a hint that it should start downloading the given resource, which can save time.

preload returns nothing.

Call preload when rendering a component if you know that it or its children will use a specific resource.

If you want the browser to start executing the script immediately (rather than just downloading it), use preinit instead. If you want to load an ESM module, use preloadModule.

Call preload in an event handler before transitioning to a page or state where external resources will be needed. This gets the process started earlier than if you call it during the rendering of the new page or state.

**Examples:**

Example 1 (css):
```css
preload("https://example.com/font.woff2", {as: "font"});
```

Example 2 (javascript):
```javascript
import { preload } from 'react-dom';function AppRoot() {  preload("https://example.com/font.woff2", {as: "font"});  // ...}
```

Example 3 (javascript):
```javascript
import { preload } from 'react-dom';function AppRoot() {  preload("https://example.com/script.js", {as: "script"});  return ...;}
```

Example 4 (jsx):
```jsx
import { preload } from 'react-dom';function CallToAction() {  const onClick = () => {    preload("https://example.com/wizardStyles.css", {as: "style"});    startWizard();  }  return (    <button onClick={onClick}>Start Wizard</button>  );}
```

---

## preloadModule

**URL:** https://react.dev/reference/react-dom/preloadModule

**Contents:**
- preloadModule
  - Note
- Reference
  - preloadModule(href, options)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Preloading when rendering
  - Preloading in an event handler

React-based frameworks frequently handle resource loading for you, so you might not have to call this API yourself. Consult your framework’s documentation for details.

preloadModule lets you eagerly fetch an ESM module that you expect to use.

To preload an ESM module, call the preloadModule function from react-dom.

See more examples below.

The preloadModule function provides the browser with a hint that it should start downloading the given module, which can save time.

preloadModule returns nothing.

Call preloadModule when rendering a component if you know that it or its children will use a specific module.

If you want the browser to start executing the module immediately (rather than just downloading it), use preinitModule instead. If you want to load a script that isn’t an ESM module, use preload.

Call preloadModule in an event handler before transitioning to a page or state where the module will be needed. This gets the process started earlier than if you call it during the rendering of the new page or state.

**Examples:**

Example 1 (css):
```css
preloadModule("https://example.com/module.js", {as: "script"});
```

Example 2 (javascript):
```javascript
import { preloadModule } from 'react-dom';function AppRoot() {  preloadModule("https://example.com/module.js", {as: "script"});  // ...}
```

Example 3 (javascript):
```javascript
import { preloadModule } from 'react-dom';function AppRoot() {  preloadModule("https://example.com/module.js", {as: "script"});  return ...;}
```

Example 4 (jsx):
```jsx
import { preloadModule } from 'react-dom';function CallToAction() {  const onClick = () => {    preloadModule("https://example.com/module.js", {as: "script"});    startWizard();  }  return (    <button onClick={onClick}>Start Wizard</button>  );}
```

---

## Client React DOM APIs

**URL:** https://react.dev/reference/react-dom/client

**Contents:**
- Client React DOM APIs
- Client APIs
- Browser support

The react-dom/client APIs let you render React components on the client (in the browser). These APIs are typically used at the top level of your app to initialize your React tree. A framework may call them for you. Most of your components don’t need to import or use them.

React supports all popular browsers, including Internet Explorer 9 and above. Some polyfills are required for older browsers such as IE 9 and IE 10.

---

## createRoot

**URL:** https://react.dev/reference/react-dom/client/createRoot

**Contents:**
- createRoot
- Reference
  - createRoot(domNode, options?)
    - Parameters
    - Returns
    - Caveats
  - root.render(reactNode)
    - Parameters
    - Returns
    - Caveats

createRoot lets you create a root to display React components inside a browser DOM node.

Call createRoot to create a React root for displaying content inside a browser DOM element.

React will create a root for the domNode, and take over managing the DOM inside it. After you’ve created a root, you need to call root.render to display a React component inside of it:

An app fully built with React will usually only have one createRoot call for its root component. A page that uses “sprinkles” of React for parts of the page may have as many separate roots as needed.

See more examples below.

domNode: A DOM element. React will create a root for this DOM element and allow you to call functions on the root, such as render to display rendered React content.

optional options: An object with options for this React root.

createRoot returns an object with two methods: render and unmount.

Call root.render to display a piece of JSX (“React node”) into the React root’s browser DOM node.

React will display <App /> in the root, and take over managing the DOM inside it.

See more examples below.

root.render returns undefined.

The first time you call root.render, React will clear all the existing HTML content inside the React root before rendering the React component into it.

If your root’s DOM node contains HTML generated by React on the server or during the build, use hydrateRoot() instead, which attaches the event handlers to the existing HTML.

If you call render on the same root more than once, React will update the DOM as necessary to reflect the latest JSX you passed. React will decide which parts of the DOM can be reused and which need to be recreated by “matching it up” with the previously rendered tree. Calling render on the same root again is similar to calling the set function on the root component: React avoids unnecessary DOM updates.

Although rendering is synchronous once it starts, root.render(...) is not. This means code after root.render() may run before any effects (useLayoutEffect, useEffect) of that specific render are fired. This is usually fine and rarely needs adjustment. In rare cases where effect timing matters, you can wrap root.render(...) in flushSync to ensure the initial render runs fully synchronously.

Call root.unmount to destroy a rendered tree inside a React root.

An app fully built with React will usually not have any calls to root.unmount.

This is mostly useful if your React root’s DOM node (or any of its ancestors) may get removed from the DOM by some other code. For example, imagine a jQuery tab panel that removes inactive tabs from the DOM. If a tab gets removed, everything inside it (including the React roots inside) would get removed from the DOM as well. In that case, you need to tell React to “stop” managing the removed root’s content by calling root.unmount. Otherwise, the components inside the removed root won’t know to clean up and free up global resources like subscriptions.

Calling root.unmount will unmount all the components in the root and “detach” React from the root DOM node, including removing any event handlers or state in the tree.

root.unmount does not accept any parameters.

root.unmount returns undefined.

Calling root.unmount will unmount all the components in the tree and “detach” React from the root DOM node.

Once you call root.unmount you cannot call root.render again on the same root. Attempting to call root.render on an unmounted root will throw a “Cannot update an unmounted root” error. However, you can create a new root for the same DOM node after the previous root for that node has been unmounted.

If your app is fully built with React, create a single root for your entire app.

Usually, you only need to run this code once at startup. It will:

If your app is fully built with React, you shouldn’t need to create any more roots, or to call root.render again.

From this point on, React will manage the DOM of your entire app. To add more components, nest them inside the App component. When you need to update the UI, each of your components can do this by using state. When you need to display extra content like a modal or a tooltip outside the DOM node, render it with a portal.

When your HTML is empty, the user sees a blank page until the app’s JavaScript code loads and runs:

This can feel very slow! To solve this, you can generate the initial HTML from your components on the server or during the build. Then your visitors can read text, see images, and click links before any of the JavaScript code loads. We recommend using a framework that does this optimization out of the box. Depending on when it runs, this is called server-side rendering (SSR) or static site generation (SSG).

Apps using server rendering or static generation must call hydrateRoot instead of createRoot. React will then hydrate (reuse) the DOM nodes from your HTML instead of destroying and re-creating them.

If your page isn’t fully built with React, you can call createRoot multiple times to create a root for each top-level piece of UI managed by React. You can display different content in each root by calling root.render.

Here, two different React components are rendered into two DOM nodes defined in the index.html file:

You could also create a new DOM node with document.createElement() and add it to the document manually.

To remove the React tree from the DOM node and clean up all the resources used by it, call root.unmount.

This is mostly useful if your React components are inside an app written in a different framework.

You can call render more than once on the same root. As long as the component tree structure matches up with what was previously rendered, React will preserve the state. Notice how you can type in the input, which means that the updates from repeated render calls every second in this example are not destructive:

It is uncommon to call render multiple times. Usually, your components will update state instead.

By default, React will log all errors to the console. To implement your own error reporting, you can provide the optional error handler root options onUncaughtError, onCaughtError and onRecoverableError:

The onCaughtError option is a function called with two arguments:

Together with onUncaughtError and onRecoverableError, you can can implement your own error reporting system:

Make sure you haven’t forgotten to actually render your app into the root:

Until you do that, nothing is displayed.

A common mistake is to pass the options for createRoot to root.render(...):

To fix, pass the root options to createRoot(...), not root.render(...):

This error means that whatever you’re passing to createRoot is not a DOM node.

If you’re not sure what’s happening, try logging it:

For example, if domNode is null, it means that getElementById returned null. This will happen if there is no node in the document with the given ID at the time of your call. There may be a few reasons for it:

Another common way to get this error is to write createRoot(<App />) instead of createRoot(domNode).

This error means that whatever you’re passing to root.render is not a React component.

This may happen if you call root.render with Component instead of <Component />:

Or if you pass a function to root.render, instead of the result of calling it:

If your app is server-rendered and includes the initial HTML generated by React, you might notice that creating a root and calling root.render deletes all that HTML, and then re-creates all the DOM nodes from scratch. This can be slower, resets focus and scroll positions, and may lose other user input.

Server-rendered apps must use hydrateRoot instead of createRoot:

Note that its API is different. In particular, usually there will be no further root.render call.

**Examples:**

Example 1 (javascript):
```javascript
const root = createRoot(domNode, options?)
```

Example 2 (sql):
```sql
import { createRoot } from 'react-dom/client';const domNode = document.getElementById('root');const root = createRoot(domNode);
```

Example 3 (jsx):
```jsx
root.render(<App />);
```

Example 4 (jsx):
```jsx
root.render(<App />);
```

---

## hydrateRoot

**URL:** https://react.dev/reference/react-dom/client/hydrateRoot

**Contents:**
- hydrateRoot
- Reference
  - hydrateRoot(domNode, reactNode, options?)
    - Parameters
    - Returns
    - Caveats
  - root.render(reactNode)
    - Parameters
    - Returns
    - Caveats

hydrateRoot lets you display React components inside a browser DOM node whose HTML content was previously generated by react-dom/server.

Call hydrateRoot to “attach” React to existing HTML that was already rendered by React in a server environment.

React will attach to the HTML that exists inside the domNode, and take over managing the DOM inside it. An app fully built with React will usually only have one hydrateRoot call with its root component.

See more examples below.

domNode: A DOM element that was rendered as the root element on the server.

reactNode: The “React node” used to render the existing HTML. This will usually be a piece of JSX like <App /> which was rendered with a ReactDOM Server method such as renderToPipeableStream(<App />).

optional options: An object with options for this React root.

hydrateRoot returns an object with two methods: render and unmount.

Call root.render to update a React component inside a hydrated React root for a browser DOM element.

React will update <App /> in the hydrated root.

See more examples below.

root.render returns undefined.

Call root.unmount to destroy a rendered tree inside a React root.

An app fully built with React will usually not have any calls to root.unmount.

This is mostly useful if your React root’s DOM node (or any of its ancestors) may get removed from the DOM by some other code. For example, imagine a jQuery tab panel that removes inactive tabs from the DOM. If a tab gets removed, everything inside it (including the React roots inside) would get removed from the DOM as well. You need to tell React to “stop” managing the removed root’s content by calling root.unmount. Otherwise, the components inside the removed root won’t clean up and free up resources like subscriptions.

Calling root.unmount will unmount all the components in the root and “detach” React from the root DOM node, including removing any event handlers or state in the tree.

root.unmount does not accept any parameters.

root.unmount returns undefined.

Calling root.unmount will unmount all the components in the tree and “detach” React from the root DOM node.

Once you call root.unmount you cannot call root.render again on the root. Attempting to call root.render on an unmounted root will throw a “Cannot update an unmounted root” error.

If your app’s HTML was generated by react-dom/server, you need to hydrate it on the client.

This will hydrate the server HTML inside the browser DOM node with the React component for your app. Usually, you will do it once at startup. If you use a framework, it might do this behind the scenes for you.

To hydrate your app, React will “attach” your components’ logic to the initial generated HTML from the server. Hydration turns the initial HTML snapshot from the server into a fully interactive app that runs in the browser.

You shouldn’t need to call hydrateRoot again or to call it in more places. From this point on, React will be managing the DOM of your application. To update the UI, your components will use state instead.

The React tree you pass to hydrateRoot needs to produce the same output as it did on the server.

This is important for the user experience. The user will spend some time looking at the server-generated HTML before your JavaScript code loads. Server rendering creates an illusion that the app loads faster by showing the HTML snapshot of its output. Suddenly showing different content breaks that illusion. This is why the server render output must match the initial render output on the client.

The most common causes leading to hydration errors include:

React recovers from some hydration errors, but you must fix them like other bugs. In the best case, they’ll lead to a slowdown; in the worst case, event handlers can get attached to the wrong elements.

Apps fully built with React can render the entire document as JSX, including the <html> tag:

To hydrate the entire document, pass the document global as the first argument to hydrateRoot:

If a single element’s attribute or text content is unavoidably different between the server and the client (for example, a timestamp), you may silence the hydration mismatch warning.

To silence hydration warnings on an element, add suppressHydrationWarning={true}:

This only works one level deep, and is intended to be an escape hatch. Don’t overuse it. React will not attempt to patch mismatched text content.

If you intentionally need to render something different on the server and the client, you can do a two-pass rendering. Components that render something different on the client can read a state variable like isClient, which you can set to true in an Effect:

This way the initial render pass will render the same content as the server, avoiding mismatches, but an additional pass will happen synchronously right after hydration.

This approach makes hydration slower because your components have to render twice. Be mindful of the user experience on slow connections. The JavaScript code may load significantly later than the initial HTML render, so rendering a different UI immediately after hydration may also feel jarring to the user.

After the root has finished hydrating, you can call root.render to update the root React component. Unlike with createRoot, you don’t usually need to do this because the initial content was already rendered as HTML.

If you call root.render at some point after hydration, and the component tree structure matches up with what was previously rendered, React will preserve the state. Notice how you can type in the input, which means that the updates from repeated render calls every second in this example are not destructive:

It is uncommon to call root.render on a hydrated root. Usually, you’ll update state inside one of the components instead.

By default, React will log all errors to the console. To implement your own error reporting, you can provide the optional error handler root options onUncaughtError, onCaughtError and onRecoverableError:

The onCaughtError option is a function called with two arguments:

Together with onUncaughtError and onRecoverableError, you can implement your own error reporting system:

A common mistake is to pass the options for hydrateRoot to root.render(...):

To fix, pass the root options to hydrateRoot(...), not root.render(...):

**Examples:**

Example 1 (javascript):
```javascript
const root = hydrateRoot(domNode, reactNode, options?)
```

Example 2 (sql):
```sql
import { hydrateRoot } from 'react-dom/client';const domNode = document.getElementById('root');const root = hydrateRoot(domNode, reactNode);
```

Example 3 (jsx):
```jsx
root.render(<App />);
```

Example 4 (unknown):
```unknown
root.unmount();
```

---

## Server React DOM APIs

**URL:** https://react.dev/reference/react-dom/server

**Contents:**
- Server React DOM APIs
- Server APIs for Web Streams
  - Note
- Server APIs for Node.js Streams
- Legacy Server APIs for non-streaming environments

The react-dom/server APIs let you server-side render React components to HTML. These APIs are only used on the server at the top level of your app to generate the initial HTML. A framework may call them for you. Most of your components don’t need to import or use them.

These methods are only available in the environments with Web Streams, which includes browsers, Deno, and some modern edge runtimes:

Node.js also includes these methods for compatibility, but they are not recommended due to worse performance. Use the dedicated Node.js APIs instead.

These methods are only available in the environments with Node.js Streams:

These methods can be used in the environments that don’t support streams:

They have limited functionality compared to the streaming APIs.

---

## renderToPipeableStream

**URL:** https://react.dev/reference/react-dom/server/renderToPipeableStream

**Contents:**
- renderToPipeableStream
  - Note
- Reference
  - renderToPipeableStream(reactNode, options?)
    - Parameters
    - Returns
- Usage
  - Rendering a React tree as HTML to a Node.js Stream
      - Deep Dive
    - Reading CSS and JS asset paths from the build output

renderToPipeableStream renders a React tree to a pipeable Node.js Stream.

This API is specific to Node.js. Environments with Web Streams, like Deno and modern edge runtimes, should use renderToReadableStream instead.

Call renderToPipeableStream to render your React tree as HTML into a Node.js Stream.

On the client, call hydrateRoot to make the server-generated HTML interactive.

See more examples below.

reactNode: A React node you want to render to HTML. For example, a JSX element like <App />. It is expected to represent the entire document, so the App component should render the <html> tag.

optional options: An object with streaming options.

renderToPipeableStream returns an object with two methods:

Call renderToPipeableStream to render your React tree as HTML into a Node.js Stream:

Along with the root component, you need to provide a list of bootstrap <script> paths. Your root component should return the entire document including the root <html> tag.

For example, it might look like this:

React will inject the doctype and your bootstrap <script> tags into the resulting HTML stream:

On the client, your bootstrap script should hydrate the entire document with a call to hydrateRoot:

This will attach event listeners to the server-generated HTML and make it interactive.

The final asset URLs (like JavaScript and CSS files) are often hashed after the build. For example, instead of styles.css you might end up with styles.123456.css. Hashing static asset filenames guarantees that every distinct build of the same asset will have a different filename. This is useful because it lets you safely enable long-term caching for static assets: a file with a certain name would never change content.

However, if you don’t know the asset URLs until after the build, there’s no way for you to put them in the source code. For example, hardcoding "/styles.css" into JSX like earlier wouldn’t work. To keep them out of your source code, your root component can read the real filenames from a map passed as a prop:

On the server, render <App assetMap={assetMap} /> and pass your assetMap with the asset URLs:

Since your server is now rendering <App assetMap={assetMap} />, you need to render it with assetMap on the client too to avoid hydration errors. You can serialize and pass assetMap to the client like this:

In the example above, the bootstrapScriptContent option adds an extra inline <script> tag that sets the global window.assetMap variable on the client. This lets the client code read the same assetMap:

Both client and server render App with the same assetMap prop, so there are no hydration errors.

Streaming allows the user to start seeing the content even before all the data has loaded on the server. For example, consider a profile page that shows a cover, a sidebar with friends and photos, and a list of posts:

Imagine that loading data for <Posts /> takes some time. Ideally, you’d want to show the rest of the profile page content to the user without waiting for the posts. To do this, wrap Posts in a <Suspense> boundary:

This tells React to start streaming the HTML before Posts loads its data. React will send the HTML for the loading fallback (PostsGlimmer) first, and then, when Posts finishes loading its data, React will send the remaining HTML along with an inline <script> tag that replaces the loading fallback with that HTML. From the user’s perspective, the page will first appear with the PostsGlimmer, later replaced by the Posts.

You can further nest <Suspense> boundaries to create a more granular loading sequence:

In this example, React can start streaming the page even earlier. Only ProfileLayout and ProfileCover must finish rendering first because they are not wrapped in any <Suspense> boundary. However, if Sidebar, Friends, or Photos need to load some data, React will send the HTML for the BigSpinner fallback instead. Then, as more data becomes available, more content will continue to be revealed until all of it becomes visible.

Streaming does not need to wait for React itself to load in the browser, or for your app to become interactive. The HTML content from the server will get progressively revealed before any of the <script> tags load.

Read more about how streaming HTML works.

Only Suspense-enabled data sources will activate the Suspense component. They include:

Suspense does not detect when data is fetched inside an Effect or event handler.

The exact way you would load data in the Posts component above depends on your framework. If you use a Suspense-enabled framework, you’ll find the details in its data fetching documentation.

Suspense-enabled data fetching without the use of an opinionated framework is not yet supported. The requirements for implementing a Suspense-enabled data source are unstable and undocumented. An official API for integrating data sources with Suspense will be released in a future version of React.

The part of your app outside of any <Suspense> boundaries is called the shell:

It determines the earliest loading state that the user may see:

If you wrap the whole app into a <Suspense> boundary at the root, the shell will only contain that spinner. However, that’s not a pleasant user experience because seeing a big spinner on the screen can feel slower and more annoying than waiting a bit more and seeing the real layout. This is why usually you’ll want to place the <Suspense> boundaries so that the shell feels minimal but complete—like a skeleton of the entire page layout.

The onShellReady callback fires when the entire shell has been rendered. Usually, you’ll start streaming then:

By the time onShellReady fires, components in nested <Suspense> boundaries might still be loading data.

By default, all errors on the server are logged to console. You can override this behavior to log crash reports:

If you provide a custom onError implementation, don’t forget to also log errors to the console like above.

In this example, the shell contains ProfileLayout, ProfileCover, and PostsGlimmer:

If an error occurs while rendering those components, React won’t have any meaningful HTML to send to the client. Override onShellError to send a fallback HTML that doesn’t rely on server rendering as the last resort:

If there is an error while generating the shell, both onError and onShellError will fire. Use onError for error reporting and use onShellError to send the fallback HTML document. Your fallback HTML does not have to be an error page. Instead, you may include an alternative shell that renders your app on the client only.

In this example, the <Posts /> component is wrapped in <Suspense> so it is not a part of the shell:

If an error happens in the Posts component or somewhere inside it, React will try to recover from it:

If retrying rendering Posts on the client also fails, React will throw the error on the client. As with all the errors thrown during rendering, the closest parent error boundary determines how to present the error to the user. In practice, this means that the user will see a loading indicator until it is certain that the error is not recoverable.

If retrying rendering Posts on the client succeeds, the loading fallback from the server will be replaced with the client rendering output. The user will not know that there was a server error. However, the server onError callback and the client onRecoverableError callbacks will fire so that you can get notified about the error.

Streaming introduces a tradeoff. You want to start streaming the page as early as possible so that the user can see the content sooner. However, once you start streaming, you can no longer set the response status code.

By dividing your app into the shell (above all <Suspense> boundaries) and the rest of the content, you’ve already solved a part of this problem. If the shell errors, you’ll get the onShellError callback which lets you set the error status code. Otherwise, you know that the app may recover on the client, so you can send “OK”.

If a component outside the shell (i.e. inside a <Suspense> boundary) throws an error, React will not stop rendering. This means that the onError callback will fire, but you will still get onShellReady instead of onShellError. This is because React will try to recover from that error on the client, as described above.

However, if you’d like, you can use the fact that something has errored to set the status code:

This will only catch errors outside the shell that happened while generating the initial shell content, so it’s not exhaustive. If knowing whether an error occurred for some content is critical, you can move it up into the shell.

You can create your own Error subclasses and use the instanceof operator to check which error is thrown. For example, you can define a custom NotFoundError and throw it from your component. Then your onError, onShellReady, and onShellError callbacks can do something different depending on the error type:

Keep in mind that once you emit the shell and start streaming, you can’t change the status code.

Streaming offers a better user experience because the user can see the content as it becomes available.

However, when a crawler visits your page, or if you’re generating the pages at the build time, you might want to let all of the content load first and then produce the final HTML output instead of revealing it progressively.

You can wait for all the content to load using the onAllReady callback:

A regular visitor will get a stream of progressively loaded content. A crawler will receive the final HTML output after all the data loads. However, this also means that the crawler will have to wait for all data, some of which might be slow to load or error. Depending on your app, you could choose to send the shell to the crawlers too.

You can force the server rendering to “give up” after a timeout:

React will flush the remaining loading fallbacks as HTML, and will attempt to render the rest on the client.

**Examples:**

Example 1 (unknown):
```unknown
const { pipe, abort } = renderToPipeableStream(reactNode, options?)
```

Example 2 (jsx):
```jsx
import { renderToPipeableStream } from 'react-dom/server';const { pipe } = renderToPipeableStream(<App />, {  bootstrapScripts: ['/main.js'],  onShellReady() {    response.setHeader('content-type', 'text/html');    pipe(response);  }});
```

Example 3 (jsx):
```jsx
import { renderToPipeableStream } from 'react-dom/server';// The route handler syntax depends on your backend frameworkapp.use('/', (request, response) => {  const { pipe } = renderToPipeableStream(<App />, {    bootstrapScripts: ['/main.js'],    onShellReady() {      response.setHeader('content-type', 'text/html');      pipe(response);    }  });});
```

Example 4 (html):
```html
export default function App() {  return (    <html>      <head>        <meta charSet="utf-8" />        <meta name="viewport" content="width=device-width, initial-scale=1" />        <link rel="stylesheet" href="/styles.css"></link>        <title>My app</title>      </head>      <body>        <Router />      </body>    </html>  );}
```

---

## renderToReadableStream

**URL:** https://react.dev/reference/react-dom/server/renderToReadableStream

**Contents:**
- renderToReadableStream
  - Note
- Reference
  - renderToReadableStream(reactNode, options?)
    - Parameters
    - Returns
- Usage
  - Rendering a React tree as HTML to a Readable Web Stream
      - Deep Dive
    - Reading CSS and JS asset paths from the build output

renderToReadableStream renders a React tree to a Readable Web Stream.

This API depends on Web Streams. For Node.js, use renderToPipeableStream instead.

Call renderToReadableStream to render your React tree as HTML into a Readable Web Stream.

On the client, call hydrateRoot to make the server-generated HTML interactive.

See more examples below.

reactNode: A React node you want to render to HTML. For example, a JSX element like <App />. It is expected to represent the entire document, so the App component should render the <html> tag.

optional options: An object with streaming options.

renderToReadableStream returns a Promise:

The returned stream has an additional property:

Call renderToReadableStream to render your React tree as HTML into a Readable Web Stream:

Along with the root component, you need to provide a list of bootstrap <script> paths. Your root component should return the entire document including the root <html> tag.

For example, it might look like this:

React will inject the doctype and your bootstrap <script> tags into the resulting HTML stream:

On the client, your bootstrap script should hydrate the entire document with a call to hydrateRoot:

This will attach event listeners to the server-generated HTML and make it interactive.

The final asset URLs (like JavaScript and CSS files) are often hashed after the build. For example, instead of styles.css you might end up with styles.123456.css. Hashing static asset filenames guarantees that every distinct build of the same asset will have a different filename. This is useful because it lets you safely enable long-term caching for static assets: a file with a certain name would never change content.

However, if you don’t know the asset URLs until after the build, there’s no way for you to put them in the source code. For example, hardcoding "/styles.css" into JSX like earlier wouldn’t work. To keep them out of your source code, your root component can read the real filenames from a map passed as a prop:

On the server, render <App assetMap={assetMap} /> and pass your assetMap with the asset URLs:

Since your server is now rendering <App assetMap={assetMap} />, you need to render it with assetMap on the client too to avoid hydration errors. You can serialize and pass assetMap to the client like this:

In the example above, the bootstrapScriptContent option adds an extra inline <script> tag that sets the global window.assetMap variable on the client. This lets the client code read the same assetMap:

Both client and server render App with the same assetMap prop, so there are no hydration errors.

Streaming allows the user to start seeing the content even before all the data has loaded on the server. For example, consider a profile page that shows a cover, a sidebar with friends and photos, and a list of posts:

Imagine that loading data for <Posts /> takes some time. Ideally, you’d want to show the rest of the profile page content to the user without waiting for the posts. To do this, wrap Posts in a <Suspense> boundary:

This tells React to start streaming the HTML before Posts loads its data. React will send the HTML for the loading fallback (PostsGlimmer) first, and then, when Posts finishes loading its data, React will send the remaining HTML along with an inline <script> tag that replaces the loading fallback with that HTML. From the user’s perspective, the page will first appear with the PostsGlimmer, later replaced by the Posts.

You can further nest <Suspense> boundaries to create a more granular loading sequence:

In this example, React can start streaming the page even earlier. Only ProfileLayout and ProfileCover must finish rendering first because they are not wrapped in any <Suspense> boundary. However, if Sidebar, Friends, or Photos need to load some data, React will send the HTML for the BigSpinner fallback instead. Then, as more data becomes available, more content will continue to be revealed until all of it becomes visible.

Streaming does not need to wait for React itself to load in the browser, or for your app to become interactive. The HTML content from the server will get progressively revealed before any of the <script> tags load.

Read more about how streaming HTML works.

Only Suspense-enabled data sources will activate the Suspense component. They include:

Suspense does not detect when data is fetched inside an Effect or event handler.

The exact way you would load data in the Posts component above depends on your framework. If you use a Suspense-enabled framework, you’ll find the details in its data fetching documentation.

Suspense-enabled data fetching without the use of an opinionated framework is not yet supported. The requirements for implementing a Suspense-enabled data source are unstable and undocumented. An official API for integrating data sources with Suspense will be released in a future version of React.

The part of your app outside of any <Suspense> boundaries is called the shell:

It determines the earliest loading state that the user may see:

If you wrap the whole app into a <Suspense> boundary at the root, the shell will only contain that spinner. However, that’s not a pleasant user experience because seeing a big spinner on the screen can feel slower and more annoying than waiting a bit more and seeing the real layout. This is why usually you’ll want to place the <Suspense> boundaries so that the shell feels minimal but complete—like a skeleton of the entire page layout.

The async call to renderToReadableStream will resolve to a stream as soon as the entire shell has been rendered. Usually, you’ll start streaming then by creating and returning a response with that stream:

By the time the stream is returned, components in nested <Suspense> boundaries might still be loading data.

By default, all errors on the server are logged to console. You can override this behavior to log crash reports:

If you provide a custom onError implementation, don’t forget to also log errors to the console like above.

In this example, the shell contains ProfileLayout, ProfileCover, and PostsGlimmer:

If an error occurs while rendering those components, React won’t have any meaningful HTML to send to the client. Wrap your renderToReadableStream call in a try...catch to send a fallback HTML that doesn’t rely on server rendering as the last resort:

If there is an error while generating the shell, both onError and your catch block will fire. Use onError for error reporting and use the catch block to send the fallback HTML document. Your fallback HTML does not have to be an error page. Instead, you may include an alternative shell that renders your app on the client only.

In this example, the <Posts /> component is wrapped in <Suspense> so it is not a part of the shell:

If an error happens in the Posts component or somewhere inside it, React will try to recover from it:

If retrying rendering Posts on the client also fails, React will throw the error on the client. As with all the errors thrown during rendering, the closest parent error boundary determines how to present the error to the user. In practice, this means that the user will see a loading indicator until it is certain that the error is not recoverable.

If retrying rendering Posts on the client succeeds, the loading fallback from the server will be replaced with the client rendering output. The user will not know that there was a server error. However, the server onError callback and the client onRecoverableError callbacks will fire so that you can get notified about the error.

Streaming introduces a tradeoff. You want to start streaming the page as early as possible so that the user can see the content sooner. However, once you start streaming, you can no longer set the response status code.

By dividing your app into the shell (above all <Suspense> boundaries) and the rest of the content, you’ve already solved a part of this problem. If the shell errors, your catch block will run which lets you set the error status code. Otherwise, you know that the app may recover on the client, so you can send “OK”.

If a component outside the shell (i.e. inside a <Suspense> boundary) throws an error, React will not stop rendering. This means that the onError callback will fire, but your code will continue running without getting into the catch block. This is because React will try to recover from that error on the client, as described above.

However, if you’d like, you can use the fact that something has errored to set the status code:

This will only catch errors outside the shell that happened while generating the initial shell content, so it’s not exhaustive. If knowing whether an error occurred for some content is critical, you can move it up into the shell.

You can create your own Error subclasses and use the instanceof operator to check which error is thrown. For example, you can define a custom NotFoundError and throw it from your component. Then you can save the error in onError and do something different before returning the response depending on the error type:

Keep in mind that once you emit the shell and start streaming, you can’t change the status code.

Streaming offers a better user experience because the user can see the content as it becomes available.

However, when a crawler visits your page, or if you’re generating the pages at the build time, you might want to let all of the content load first and then produce the final HTML output instead of revealing it progressively.

You can wait for all the content to load by awaiting the stream.allReady Promise:

A regular visitor will get a stream of progressively loaded content. A crawler will receive the final HTML output after all the data loads. However, this also means that the crawler will have to wait for all data, some of which might be slow to load or error. Depending on your app, you could choose to send the shell to the crawlers too.

You can force the server rendering to “give up” after a timeout:

React will flush the remaining loading fallbacks as HTML, and will attempt to render the rest on the client.

**Examples:**

Example 1 (javascript):
```javascript
const stream = await renderToReadableStream(reactNode, options?)
```

Example 2 (javascript):
```javascript
import { renderToReadableStream } from 'react-dom/server';async function handler(request) {  const stream = await renderToReadableStream(<App />, {    bootstrapScripts: ['/main.js']  });  return new Response(stream, {    headers: { 'content-type': 'text/html' },  });}
```

Example 3 (javascript):
```javascript
import { renderToReadableStream } from 'react-dom/server';async function handler(request) {  const stream = await renderToReadableStream(<App />, {    bootstrapScripts: ['/main.js']  });  return new Response(stream, {    headers: { 'content-type': 'text/html' },  });}
```

Example 4 (html):
```html
export default function App() {  return (    <html>      <head>        <meta charSet="utf-8" />        <meta name="viewport" content="width=device-width, initial-scale=1" />        <link rel="stylesheet" href="/styles.css"></link>        <title>My app</title>      </head>      <body>        <Router />      </body>    </html>  );}
```

---

## renderToStaticMarkup

**URL:** https://react.dev/reference/react-dom/server/renderToStaticMarkup

**Contents:**
- renderToStaticMarkup
- Reference
  - renderToStaticMarkup(reactNode, options?)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Rendering a non-interactive React tree as HTML to a string
  - Pitfall

renderToStaticMarkup renders a non-interactive React tree to an HTML string.

On the server, call renderToStaticMarkup to render your app to HTML.

It will produce non-interactive HTML output of your React components.

See more examples below.

renderToStaticMarkup output cannot be hydrated.

renderToStaticMarkup has limited Suspense support. If a component suspends, renderToStaticMarkup immediately sends its fallback as HTML.

renderToStaticMarkup works in the browser, but using it in the client code is not recommended. If you need to render a component to HTML in the browser, get the HTML by rendering it into a DOM node.

Call renderToStaticMarkup to render your app to an HTML string which you can send with your server response:

This will produce the initial non-interactive HTML output of your React components.

This method renders non-interactive HTML that cannot be hydrated. This is useful if you want to use React as a simple static page generator, or if you’re rendering completely static content like emails.

Interactive apps should use renderToString on the server and hydrateRoot on the client.

**Examples:**

Example 1 (javascript):
```javascript
const html = renderToStaticMarkup(reactNode, options?)
```

Example 2 (jsx):
```jsx
import { renderToStaticMarkup } from 'react-dom/server';const html = renderToStaticMarkup(<Page />);
```

Example 3 (jsx):
```jsx
import { renderToStaticMarkup } from 'react-dom/server';// The route handler syntax depends on your backend frameworkapp.use('/', (request, response) => {  const html = renderToStaticMarkup(<Page />);  response.send(html);});
```

---

## Static React DOM APIs

**URL:** https://react.dev/reference/react-dom/static

**Contents:**
- Static React DOM APIs
- Static APIs for Web Streams
- Static APIs for Node.js Streams

The react-dom/static APIs let you generate static HTML for React components. They have limited functionality compared to the streaming APIs. A framework may call them for you. Most of your components don’t need to import or use them.

These methods are only available in the environments with Web Streams, which includes browsers, Deno, and some modern edge runtimes:

Node.js also includes these methods for compatibility, but they are not recommended due to worse performance. Use the dedicated Node.js APIs instead.

These methods are only available in the environments with Node.js Streams:

---

## prerenderToNodeStream

**URL:** https://react.dev/reference/react-dom/static/prerenderToNodeStream

**Contents:**
- prerenderToNodeStream
  - Note
- Reference
  - prerenderToNodeStream(reactNode, options?)
    - Parameters
    - Returns
    - Caveats
  - Note
  - When should I use prerenderToNodeStream?
- Usage

prerenderToNodeStream renders a React tree to a static HTML string using a Node.js Stream.

This API is specific to Node.js. Environments with Web Streams, like Deno and modern edge runtimes, should use prerender instead.

Call prerenderToNodeStream to render your app to static HTML.

On the client, call hydrateRoot to make the server-generated HTML interactive.

See more examples below.

reactNode: A React node you want to render to HTML. For example, a JSX node like <App />. It is expected to represent the entire document, so the App component should render the <html> tag.

optional options: An object with static generation options.

prerenderToNodeStream returns a Promise:

nonce is not an available option when prerendering. Nonces must be unique per request and if you use nonces to secure your application with CSP it would be inappropriate and insecure to include the nonce value in the prerender itself.

The static prerenderToNodeStream API is used for static server-side generation (SSG). Unlike renderToString, prerenderToNodeStream waits for all data to load before resolving. This makes it suitable for generating static HTML for a full page, including data that needs to be fetched using Suspense. To stream content as it loads, use a streaming server-side render (SSR) API like renderToReadableStream.

prerenderToNodeStream can be aborted and resumed later with resumeToPipeableStream to support partial pre-rendering.

Call prerenderToNodeStream to render your React tree to static HTML into a Node.js Stream:

Along with the root component, you need to provide a list of bootstrap <script> paths. Your root component should return the entire document including the root <html> tag.

For example, it might look like this:

React will inject the doctype and your bootstrap <script> tags into the resulting HTML stream:

On the client, your bootstrap script should hydrate the entire document with a call to hydrateRoot:

This will attach event listeners to the static server-generated HTML and make it interactive.

The final asset URLs (like JavaScript and CSS files) are often hashed after the build. For example, instead of styles.css you might end up with styles.123456.css. Hashing static asset filenames guarantees that every distinct build of the same asset will have a different filename. This is useful because it lets you safely enable long-term caching for static assets: a file with a certain name would never change content.

However, if you don’t know the asset URLs until after the build, there’s no way for you to put them in the source code. For example, hardcoding "/styles.css" into JSX like earlier wouldn’t work. To keep them out of your source code, your root component can read the real filenames from a map passed as a prop:

On the server, render <App assetMap={assetMap} /> and pass your assetMap with the asset URLs:

Since your server is now rendering <App assetMap={assetMap} />, you need to render it with assetMap on the client too to avoid hydration errors. You can serialize and pass assetMap to the client like this:

In the example above, the bootstrapScriptContent option adds an extra inline <script> tag that sets the global window.assetMap variable on the client. This lets the client code read the same assetMap:

Both client and server render App with the same assetMap prop, so there are no hydration errors.

Call prerenderToNodeStream to render your app to a static HTML string:

This will produce the initial non-interactive HTML output of your React components. On the client, you will need to call hydrateRoot to hydrate that server-generated HTML and make it interactive.

prerenderToNodeStream waits for all data to load before finishing the static HTML generation and resolving. For example, consider a profile page that shows a cover, a sidebar with friends and photos, and a list of posts:

Imagine that <Posts /> needs to load some data, which takes some time. Ideally, you’d want wait for the posts to finish so it’s included in the HTML. To do this, you can use Suspense to suspend on the data, and prerenderToNodeStream will wait for the suspended content to finish before resolving to the static HTML.

Only Suspense-enabled data sources will activate the Suspense component. They include:

Suspense does not detect when data is fetched inside an Effect or event handler.

The exact way you would load data in the Posts component above depends on your framework. If you use a Suspense-enabled framework, you’ll find the details in its data fetching documentation.

Suspense-enabled data fetching without the use of an opinionated framework is not yet supported. The requirements for implementing a Suspense-enabled data source are unstable and undocumented. An official API for integrating data sources with Suspense will be released in a future version of React.

You can force the prerender to “give up” after a timeout:

Any Suspense boundaries with incomplete children will be included in the prelude in the fallback state.

This can be used for partial prerendering together with resumeToPipeableStream or resumeAndPrerenderToNodeStream.

The prerenderToNodeStream response waits for the entire app to finish rendering, including waiting for all Suspense boundaries to resolve, before resolving. It is designed for static site generation (SSG) ahead of time and does not support streaming more content as it loads.

To stream content as it loads, use a streaming server render API like renderToPipeableStream.

**Examples:**

Example 1 (swift):
```swift
const {prelude, postponed} = await prerenderToNodeStream(reactNode, options?)
```

Example 2 (jsx):
```jsx
import { prerenderToNodeStream } from 'react-dom/static';// The route handler syntax depends on your backend frameworkapp.use('/', async (request, response) => {  const { prelude } = await prerenderToNodeStream(<App />, {    bootstrapScripts: ['/main.js'],  });  response.setHeader('Content-Type', 'text/plain');  prelude.pipe(response);});
```

Example 3 (jsx):
```jsx
import { prerenderToNodeStream } from 'react-dom/static';// The route handler syntax depends on your backend frameworkapp.use('/', async (request, response) => {  const { prelude } = await prerenderToNodeStream(<App />, {    bootstrapScripts: ['/main.js'],  });  response.setHeader('Content-Type', 'text/plain');  prelude.pipe(response);});
```

Example 4 (html):
```html
export default function App() {  return (    <html>      <head>        <meta charSet="utf-8" />        <meta name="viewport" content="width=device-width, initial-scale=1" />        <link rel="stylesheet" href="/styles.css"></link>        <title>My app</title>      </head>      <body>        <Router />      </body>    </html>  );}
```

---

## resumeAndPrerender

**URL:** https://react.dev/reference/react-dom/static/resumeAndPrerender

**Contents:**
- resumeAndPrerender
  - Note
- Reference
  - resumeAndPrerender(reactNode, postponedState, options?)
    - Parameters
    - Returns
    - Caveats
  - Note
  - When should I use resumeAndPrerender?
- Usage

resumeAndPrerender continues a prerendered React tree to a static HTML string using a Web Stream.

This API depends on Web Streams. For Node.js, use resumeAndPrerenderToNodeStream instead.

Call resumeAndPrerender to continue a prerendered React tree to a static HTML string.

On the client, call hydrateRoot to make the server-generated HTML interactive.

See more examples below.

prerender returns a Promise:

nonce is not an available option when prerendering. Nonces must be unique per request and if you use nonces to secure your application with CSP it would be inappropriate and insecure to include the nonce value in the prerender itself.

The static resumeAndPrerender API is used for static server-side generation (SSG). Unlike renderToString, resumeAndPrerender waits for all data to load before resolving. This makes it suitable for generating static HTML for a full page, including data that needs to be fetched using Suspense. To stream content as it loads, use a streaming server-side render (SSR) API like renderToReadableStream.

resumeAndPrerender can be aborted and later either continued with another resumeAndPrerender or resumed with resume to support partial pre-rendering.

resumeAndPrerender behaves similarly to prerender but can be used to continue a previously started prerendering process that was aborted. For more information about resuming a prerendered tree, see the resume documentation.

**Examples:**

Example 1 (swift):
```swift
const { prelude,postpone } = await resumeAndPrerender(reactNode, postponedState, options?)
```

Example 2 (javascript):
```javascript
import { resumeAndPrerender } from 'react-dom/static';import { getPostponedState } from 'storage';async function handler(request, response) {  const postponedState = getPostponedState(request);  const { prelude } = await resumeAndPrerender(<App />, postponedState, {    bootstrapScripts: ['/main.js']  });  return new Response(prelude, {    headers: { 'content-type': 'text/html' },  });}
```

---

## resumeAndPrerenderToNodeStream

**URL:** https://react.dev/reference/react-dom/static/resumeAndPrerenderToNodeStream

**Contents:**
- resumeAndPrerenderToNodeStream
  - Note
- Reference
  - resumeAndPrerenderToNodeStream(reactNode, postponedState, options?)
    - Parameters
    - Returns
    - Caveats
  - Note
  - When should I use resumeAndPrerenderToNodeStream?
- Usage

resumeAndPrerenderToNodeStream continues a prerendered React tree to a static HTML string using a a Node.js Stream..

This API is specific to Node.js. Environments with Web Streams, like Deno and modern edge runtimes, should use prerender instead.

Call resumeAndPrerenderToNodeStream to continue a prerendered React tree to a static HTML string.

On the client, call hydrateRoot to make the server-generated HTML interactive.

See more examples below.

resumeAndPrerenderToNodeStream returns a Promise:

nonce is not an available option when prerendering. Nonces must be unique per request and if you use nonces to secure your application with CSP it would be inappropriate and insecure to include the nonce value in the prerender itself.

The static resumeAndPrerenderToNodeStream API is used for static server-side generation (SSG). Unlike renderToString, resumeAndPrerenderToNodeStream waits for all data to load before resolving. This makes it suitable for generating static HTML for a full page, including data that needs to be fetched using Suspense. To stream content as it loads, use a streaming server-side render (SSR) API like renderToReadableStream.

resumeAndPrerenderToNodeStream can be aborted and later either continued with another resumeAndPrerenderToNodeStream or resumed with resume to support partial pre-rendering.

resumeAndPrerenderToNodeStream behaves similarly to prerender but can be used to continue a previously started prerendering process that was aborted. For more information about resuming a prerendered tree, see the resume documentation.

**Examples:**

Example 1 (swift):
```swift
const {prelude, postponed} = await resumeAndPrerenderToNodeStream(reactNode, postponedState, options?)
```

Example 2 (javascript):
```javascript
import { resumeAndPrerenderToNodeStream } from 'react-dom/static';import { getPostponedState } from 'storage';async function handler(request, writable) {  const postponedState = getPostponedState(request);  const { prelude } = await resumeAndPrerenderToNodeStream(<App />, JSON.parse(postponedState));  prelude.pipe(writable);}
```

---

## Configuration

**URL:** https://react.dev/reference/react-compiler/configuration

**Contents:**
- Configuration
  - Note
- Compilation Control
- Version Compatibility
- Error Handling
- Debugging
- Feature Flags
- Common Configuration Patterns
  - Default configuration
  - React 17/18 projects

This page lists all configuration options available in React Compiler.

For most apps, the default options should work out of the box. If you have a special need, you can use these advanced options.

These options control what the compiler optimizes and how it selects components and hooks to compile.

React version configuration ensures the compiler generates code compatible with your React version.

target specifies which React version you’re using (17, 18, or 19).

These options control how the compiler responds to code that doesn’t follow the Rules of React.

panicThreshold determines whether to fail the build or skip problematic components.

Logging and analysis options help you understand what the compiler is doing.

logger provides custom logging for compilation events.

Conditional compilation lets you control when optimized code is used.

gating enables runtime feature flags for A/B testing or gradual rollouts.

For most React 19 applications, the compiler works without configuration:

Older React versions need the runtime package and target configuration:

Start with specific directories and expand gradually:

**Examples:**

Example 1 (css):
```css
// babel.config.jsmodule.exports = {  plugins: [    [      'babel-plugin-react-compiler', {        // compiler options      }    ]  ]};
```

Example 2 (css):
```css
{  compilationMode: 'annotation' // Only compile "use memo" functions}
```

Example 3 (css):
```css
// For React 18 projects{  target: '18' // Also requires react-compiler-runtime package}
```

Example 4 (css):
```css
// Recommended for production{  panicThreshold: 'none' // Skip components with errors instead of failing the build}
```

---

## compilationMode

**URL:** https://react.dev/reference/react-compiler/compilationMode

**Contents:**
- compilationMode
- Reference
  - compilationMode
    - Type
    - Default value
    - Options
    - Caveats
- Usage
  - Default inference mode
  - Incremental adoption with annotation mode

The compilationMode option controls how the React Compiler selects which functions to compile.

Controls the strategy for determining which functions the React Compiler will optimize.

'infer' (default): The compiler uses intelligent heuristics to identify React components and hooks:

'annotation': Only compile functions explicitly marked with the "use memo" directive. Ideal for incremental adoption.

'syntax': Only compile components and hooks that use Flow’s component and hook syntax.

'all': Compile all top-level functions. Not recommended as it may compile non-React functions.

The default 'infer' mode works well for most codebases that follow React conventions:

With this mode, these functions will be compiled:

For gradual migration, use 'annotation' mode to only compile marked functions:

Then explicitly mark functions to compile:

If your codebase uses Flow instead of TypeScript:

Then use Flow’s component syntax:

Regardless of compilation mode, use "use no memo" to skip compilation:

In 'infer' mode, ensure your component follows React conventions:

**Examples:**

Example 1 (css):
```css
{  compilationMode: 'infer' // or 'annotation', 'syntax', 'all'}
```

Example 2 (unknown):
```unknown
'infer' | 'syntax' | 'annotation' | 'all'
```

Example 3 (css):
```css
{  compilationMode: 'infer'}
```

Example 4 (jsx):
```jsx
// ✅ Compiled: Named like a component + returns JSXfunction Button(props) {  return <button>{props.label}</button>;}// ✅ Compiled: Named like a hook + calls hooksfunction useCounter() {  const [count, setCount] = useState(0);  return [count, setCount];}// ✅ Compiled: Explicit directivefunction expensiveCalculation(data) {  "use memo";  return data.reduce(/* ... */);}// ❌ Not compiled: Not a component/hook patternfunction calculateTotal(items) {  return items.reduce((a, b) => a + b, 0);}
```

---

## gating

**URL:** https://react.dev/reference/react-compiler/gating

**Contents:**
- gating
- Reference
  - gating
    - Type
    - Default value
    - Properties
    - Caveats
- Usage
  - Basic feature flag setup
- Troubleshooting

The gating option enables conditional compilation, allowing you to control when optimized code is used at runtime.

Configures runtime feature flag gating for compiled functions.

Note that the gating function is evaluated once at module time, so once the JS bundle has been parsed and evaluated the choice of component stays static for the rest of the browser session.

Verify your flag module exports the correct function:

Ensure the source path is correct:

**Examples:**

Example 1 (json):
```json
{  gating: {    source: 'my-feature-flags',    importSpecifierName: 'shouldUseCompiler'  }}
```

Example 2 (css):
```css
{  source: string;  importSpecifierName: string;} | null
```

Example 3 (javascript):
```javascript
// src/utils/feature-flags.jsexport function shouldUseCompiler() {  // your logic here  return getFeatureFlag('react-compiler-enabled');}
```

Example 4 (json):
```json
{  gating: {    source: './src/utils/feature-flags',    importSpecifierName: 'shouldUseCompiler'  }}
```

---

## logger

**URL:** https://react.dev/reference/react-compiler/logger

**Contents:**
- logger
- Reference
  - logger
    - Type
    - Default value
    - Methods
    - Event types
    - Caveats
- Usage
  - Basic logging

The logger option provides custom logging for React Compiler events during compilation.

Configures custom logging to track compiler behavior and debug issues.

Track compilation success and failures:

Get specific information about compilation failures:

**Examples:**

Example 1 (json):
```json
{  logger: {    logEvent(filename, event) {      console.log(`[Compiler] ${event.kind}: ${filename}`);    }  }}
```

Example 2 (css):
```css
{  logEvent: (filename: string | null, event: LoggerEvent) => void;} | null
```

Example 3 (json):
```json
{  logger: {    logEvent(filename, event) {      switch (event.kind) {        case 'CompileSuccess': {          console.log(`✅ Compiled: ${filename}`);          break;        }        case 'CompileError': {          console.log(`❌ Skipped: ${filename}`);          break;        }        default: {}      }    }  }}
```

Example 4 (json):
```json
{  logger: {    logEvent(filename, event) {      if (event.kind === 'CompileError') {        console.error(`\nCompilation failed: ${filename}`);        console.error(`Reason: ${event.detail.reason}`);        if (event.detail.description) {          console.error(`Details: ${event.detail.description}`);        }        if (event.detail.loc) {          const { line, column } = event.detail.loc.start;          console.error(`Location: Line ${line}, Column ${column}`);        }        if (event.detail.suggestions) {          console.error('Suggestions:', event.detail.suggestions);        }      }    }  }}
```

---

## panicThreshold

**URL:** https://react.dev/reference/react-compiler/panicThreshold

**Contents:**
- panicThreshold
- Reference
  - panicThreshold
    - Type
    - Default value
    - Options
    - Caveats
- Usage
  - Production configuration (recommended)
  - Development debugging

The panicThreshold option controls how the React Compiler handles errors during compilation.

Determines whether compilation errors should fail the build or skip optimization.

For production builds, always use 'none'. This is the default value:

Temporarily use stricter thresholds to find issues:

**Examples:**

Example 1 (css):
```css
{  panicThreshold: 'none' // Recommended}
```

Example 2 (rust):
```rust
'none' | 'critical_errors' | 'all_errors'
```

Example 3 (css):
```css
{  panicThreshold: 'none'}
```

Example 4 (css):
```css
const isDevelopment = process.env.NODE_ENV === 'development';{  panicThreshold: isDevelopment ? 'critical_errors' : 'none',  logger: {    logEvent(filename, event) {      if (isDevelopment && event.kind === 'CompileError') {        // ...      }    }  }}
```

---

## target

**URL:** https://react.dev/reference/react-compiler/target

**Contents:**
- target
- Reference
  - target
    - Type
    - Default value
    - Valid values
    - Caveats
- Usage
  - Targeting React 19 (default)
  - Targeting React 17 or 18

The target option specifies which React version the compiler should generate code for.

Configures the React version compatibility for the compiled output.

For React 19, no special configuration is needed:

The compiler will use React 19’s built-in runtime APIs:

For React 17 and React 18 projects, you need two steps:

The compiler will use the polyfill runtime for both versions:

If you see errors like “Cannot find module ‘react/compiler-runtime’“:

Check your React version:

If using React 17 or 18, install the runtime:

Ensure your target matches your React version:

Ensure the runtime package is:

To verify the correct runtime is being used, note the different import (react/compiler-runtime for builtin, react-compiler-runtime standalone package for 17/18):

**Examples:**

Example 1 (css):
```css
{  target: '19' // or '18', '17'}
```

Example 2 (unknown):
```unknown
'17' | '18' | '19'
```

Example 3 (json):
```json
{  // defaults to target: '19'}
```

Example 4 (sql):
```sql
// Compiled output uses React 19's native APIsimport { c as _c } from 'react/compiler-runtime';
```

---

## Directives

**URL:** https://react.dev/reference/react-compiler/directives

**Contents:**
- Directives
- Overview
  - Available directives
  - Quick comparison
- Usage
  - Function-level directives
  - Module-level directives
  - Compilation modes interaction
- Best practices
  - Use directives sparingly

React Compiler directives are special string literals that control whether specific functions are compiled.

React Compiler directives provide fine-grained control over which functions are optimized by the compiler. They are string literals placed at the beginning of a function body or at the top of a module.

Place directives at the beginning of a function to control its compilation:

Place directives at the top of a file to affect all functions in that module:

Directives behave differently depending on your compilationMode:

Directives are escape hatches. Prefer configuring the compiler at the project level:

Always explain why a directive is used:

Opt-out directives should be temporary:

When adopting the React Compiler in a large codebase:

For specific issues with directives, see the troubleshooting sections in:

**Examples:**

Example 1 (javascript):
```javascript
function MyComponent() {  "use memo"; // Opt this component into compilation  return <div>{/* ... */}</div>;}
```

Example 2 (typescript):
```typescript
// Opt into compilationfunction OptimizedComponent() {  "use memo";  return <div>This will be optimized</div>;}// Opt out of compilationfunction UnoptimizedComponent() {  "use no memo";  return <div>This won't be optimized</div>;}
```

Example 3 (julia):
```julia
// At the very top of the file"use memo";// All functions in this file will be compiledfunction Component1() {  return <div>Compiled</div>;}function Component2() {  return <div>Also compiled</div>;}// Can be overridden at function levelfunction Component3() {  "use no memo"; // This overrides the module directive  return <div>Not compiled</div>;}
```

Example 4 (css):
```css
// ✅ Good - project-wide configuration{  plugins: [    ['babel-plugin-react-compiler', {      compilationMode: 'infer'    }]  ]}// ⚠️ Use directives only when neededfunction SpecialCase() {  "use no memo"; // Document why this is needed  // ...}
```

---

## use memo

**URL:** https://react.dev/reference/react-compiler/directives/use-memo

**Contents:**
- use memo
  - Note
- Reference
  - "use memo"
    - Caveats
  - How "use memo" marks functions for optimization
  - When to use "use memo"
    - You’re using annotation mode
    - You’re gradually adopting React Compiler
- Usage

"use memo" marks a function for React Compiler optimization.

In most cases, you don’t need "use memo". It’s primarily needed in annotation mode where you must explicitly mark functions for optimization. In infer mode, the compiler automatically detects components and hooks by their naming patterns (PascalCase for components, use prefix for hooks). If a component or hook isn’t being compiled in infer mode, you should fix its naming convention rather than forcing compilation with "use memo".

Add "use memo" at the beginning of a function to mark it for React Compiler optimization.

When a function contains "use memo", the React Compiler will analyze and optimize it during build time. The compiler will automatically memoize values and components to prevent unnecessary re-computations and re-renders.

In a React app that uses the React Compiler, functions are analyzed at build time to determine if they can be optimized. By default, the compiler automatically infers which components to memoize, but this can depend on your compilationMode setting if you’ve set it.

"use memo" explicitly marks a function for optimization, overriding the default behavior:

The directive creates a clear boundary in your codebase between optimized and non-optimized code, giving you fine-grained control over the compilation process.

You should consider using "use memo" when:

In compilationMode: 'annotation', the directive is required for any function you want optimized:

Start with annotation mode and selectively optimize stable components:

The behavior of "use memo" changes based on your compiler configuration:

In infer mode, the compiler automatically detects components and hooks by their naming patterns (PascalCase for components, use prefix for hooks). If a component or hook isn’t being compiled in infer mode, you should fix its naming convention rather than forcing compilation with "use memo".

To confirm your component is being optimized:

**Examples:**

Example 1 (javascript):
```javascript
function MyComponent() {  "use memo";  // ...}
```

Example 2 (unknown):
```unknown
// ✅ This component will be optimizedfunction OptimizedList() {  "use memo";  // ...}// ❌ This component won't be optimizedfunction SimpleWrapper() {  // ...}
```

Example 3 (swift):
```swift
// Start by optimizing leaf componentsfunction Button({ onClick, children }) {  "use memo";  // ...}// Gradually move up the tree as you verify behaviorfunction ButtonGroup({ buttons }) {  "use memo";  // ...}
```

Example 4 (css):
```css
// babel.config.jsmodule.exports = {  plugins: [    ['babel-plugin-react-compiler', {      compilationMode: 'annotation' // or 'infer' or 'all'    }]  ]};
```

---

## use no memo

**URL:** https://react.dev/reference/react-compiler/directives/use-no-memo

**Contents:**
- use no memo
- Reference
  - "use no memo"
    - Caveats
  - How "use no memo" opts-out of optimization
  - When to use "use no memo"
    - Debugging compiler issues
    - Third-party library integration
- Usage
- Troubleshooting

"use no memo" prevents a function from being optimized by React Compiler.

Add "use no memo" at the beginning of a function to prevent React Compiler optimization.

When a function contains "use no memo", the React Compiler will skip it entirely during optimization. This is useful as a temporary escape hatch when debugging or when dealing with code that doesn’t work correctly with the compiler.

React Compiler analyzes your code at build time to apply optimizations. "use no memo" creates an explicit boundary that tells the compiler to skip a function entirely.

This directive takes precedence over all other settings:

The compiler treats these functions as if the React Compiler wasn’t enabled, leaving them exactly as written.

"use no memo" should be used sparingly and temporarily. Common scenarios include:

When you suspect the compiler is causing issues, temporarily disable optimization to isolate the problem:

When integrating with libraries that might not be compatible with the compiler:

The "use no memo" directive is placed at the beginning of a function body to prevent React Compiler from optimizing that function:

The directive can also be placed at the top of a file to affect all functions in that module:

"use no memo" at the function level overrides the module level directive.

If "use no memo" isn’t working:

Always document why you’re disabling optimization:

**Examples:**

Example 1 (javascript):
```javascript
function MyComponent() {  "use no memo";  // ...}
```

Example 2 (javascript):
```javascript
function ProblematicComponent({ data }) {  "use no memo"; // TODO: Remove after fixing issue #123  // Rules of React violations that weren't statically detected  // ...}
```

Example 3 (javascript):
```javascript
function ThirdPartyWrapper() {  "use no memo";  useThirdPartyHook(); // Has side effects that compiler might optimize incorrectly  // ...}
```

Example 4 (javascript):
```javascript
function MyComponent() {  "use no memo";  // Function body}
```

---

## Compiling Libraries

**URL:** https://react.dev/reference/react-compiler/compiling-libraries

**Contents:**
- Compiling Libraries
- Why Ship Compiled Code?
- Setting Up Compilation
- Backwards Compatibility
  - 1. Install the runtime package
  - 2. Configure the target version
- Testing Strategy
- Troubleshooting
  - Library doesn’t work with older React versions
  - Compilation conflicts with other Babel plugins

This guide helps library authors understand how to use React Compiler to ship optimized library code to their users.

As a library author, you can compile your library code before publishing to npm. This provides several benefits:

Add React Compiler to your library’s build process:

Configure your build tool to compile your library. For example, with Babel:

If your library supports React versions below 19, you’ll need additional configuration:

We recommend installing react-compiler-runtime as a direct dependency:

Set the minimum React version your library supports:

Test your library both with and without compilation to ensure compatibility. Run your existing test suite against the compiled code, and also create a separate test configuration that bypasses the compiler. This helps catch any issues that might arise from the compilation process and ensures your library works correctly in all scenarios.

If your compiled library throws errors in React 17 or 18:

Some Babel plugins may conflict with React Compiler:

If users see “Cannot find module ‘react-compiler-runtime’“:

**Examples:**

Example 1 (python):
```python
npm install -D babel-plugin-react-compiler@latest
```

Example 2 (css):
```css
// babel.config.jsmodule.exports = {  plugins: [    'babel-plugin-react-compiler',  ],  // ... other config};
```

Example 3 (python):
```python
npm install react-compiler-runtime@latest
```

Example 4 (json):
```json
{  "dependencies": {    "react-compiler-runtime": "^1.0.0"  },  "peerDependencies": {    "react": "^17.0.0 || ^18.0.0 || ^19.0.0"  }}
```

---

## React Performance tracks

**URL:** https://react.dev/reference/dev-tools/react-performance-tracks

**Contents:**
- React Performance tracks
- Usage
  - Pitfall
  - Using profiling builds
- Tracks
  - Scheduler
    - Renders
    - Cascading updates
  - Components
  - Note

React Performance tracks are specialized custom entries that appear on the Performance panel’s timeline in your browser developer tools.

These tracks are designed to provide developers with comprehensive insights into their React application’s performance by visualizing React-specific events and metrics alongside other critical data sources such as network requests, JavaScript execution, and event loop activity, all synchronized on a unified timeline within the Performance panel for a complete understanding of application behavior.

React Performance tracks are only available in development and profiling builds of React:

If enabled, tracks should appear automatically in the traces you record with the Performance panel of browsers that provide extensibility APIs.

The profiling instrumentation that powers React Performance tracks adds some additional overhead, so it is disabled in production builds by default. Server Components and Server Requests tracks are only available in development builds.

In addition to production and development builds, React also includes a special profiling build. To use profiling builds, you have to use react-dom/profiling instead of react-dom/client. We recommend that you alias react-dom/client to react-dom/profiling at build time via bundler aliases instead of manually updating each react-dom/client import. Your framework might have built-in support for enabling React’s profiling build.

The Scheduler is an internal React concept used for managing tasks with different priorities. This track consists of 4 subtracks, each representing work of a specific priority:

Every render pass consists of multiple phases that you can see on a timeline:

Learn more about renders and commits.

Cascading updates is one of the patterns for performance regressions. If an update was scheduled during a render pass, React could discard completed work and start a new pass.

In development builds, React can show you which Component scheduled a new update. This includes both general updates and cascading ones. You can see the enhanced stack trace by clicking on the “Cascading update” entry, which should also display the name of the method that scheduled an update.

Learn more about Effects.

The Components track visualizes the durations of React components. They are displayed as a flamegraph, where each entry represents the duration of the corresponding component render and all its descendant children components.

Similar to render durations, effect durations are also represented as a flamegraph, but with a different color scheme that aligns with the corresponding phase on the Scheduler track.

Unlike renders, not all effects are shown on the Components track by default.

To maintain performance and prevent UI clutter, React will only display those effects, which had a duration of 0.05ms or longer, or triggered an update.

Additional events may be displayed during the render and effects phases:

In development builds, when you click on a component render entry, you can inspect potential changes in props. You can use this information to identify unnecessary renders.

The Server Requests track visualized all Promises that eventually end up in a React Server Component. This includes any async operations like calling fetch or async Node.js file operations.

React will try to combine Promises that are started from inside third-party code into a single span representing the the duration of the entire operation blocking 1st party code. For example, a third party library method called getUser that calls fetch internally multiple times will be represented as a single span called getUser, instead of showing multiple fetch spans.

Clicking on spans will show you a stack trace of where the Promise was created as well as a view of the value that the Promise resolved to, if available.

Rejected Promises are displayed as red with their rejected value.

The Server Components tracks visualize the durations of React Server Components Promises they awaited. Timings are displayed as a flamegraph, where each entry represents the duration of the corresponding component render and all its descendant children components.

If you await a Promise, React will display duration of that Promise. To see all I/O operations, use the Server Requests track.

Different colors are used to indicate the duration of the component render. The darker the color, the longer the duration.

The Server Components track group will always contain a “Primary” track. If React is able to render Server Components concurrently, it will display addititional “Parallel” tracks. If more than 8 Server Components are rendered concurrently, React will associate them with the last “Parallel” track instead of adding more tracks.

---

## Rules of React

**URL:** https://react.dev/reference/rules

**Contents:**
- Rules of React
  - Note
- Components and Hooks must be pure
- React calls Components and Hooks
- Rules of Hooks

Just as different programming languages have their own ways of expressing concepts, React has its own idioms — or rules — for how to express patterns in a way that is easy to understand and yields high-quality applications.

To learn more about expressing UIs with React, we recommend reading Thinking in React.

This section describes the rules you need to follow to write idiomatic React code. Writing idiomatic React code can help you write well organized, safe, and composable applications. These properties make your app more resilient to changes and makes it easier to work with other developers, libraries, and tools.

These rules are known as the Rules of React. They are rules – and not just guidelines – in the sense that if they are broken, your app likely has bugs. Your code also becomes unidiomatic and harder to understand and reason about.

We strongly recommend using Strict Mode alongside React’s ESLint plugin to help your codebase follow the Rules of React. By following the Rules of React, you’ll be able to find and address these bugs and keep your application maintainable.

Purity in Components and Hooks is a key rule of React that makes your app predictable, easy to debug, and allows React to automatically optimize your code.

React is responsible for rendering components and hooks when necessary to optimize the user experience. It is declarative: you tell React what to render in your component’s logic, and React will figure out how best to display it to your user.

Hooks are defined using JavaScript functions, but they represent a special type of reusable UI logic with restrictions on where they can be called. You need to follow the Rules of Hooks when using them.

---

## Server Functions

**URL:** https://react.dev/reference/rsc/server-functions

**Contents:**
- Server Functions
  - React Server Components
  - Note
    - How do I build support for Server Functions?
- Usage
  - Creating a Server Function from a Server Component
  - Importing Server Functions from Client Components
  - Server Functions with Actions
  - Server Functions with Form Actions
  - Server Functions with useActionState

Server Functions are for use in React Server Components.

Note: Until September 2024, we referred to all Server Functions as “Server Actions”. If a Server Function is passed to an action prop or called from inside an action then it is a Server Action, but not all Server Functions are Server Actions. The naming in this documentation has been updated to reflect that Server Functions can be used for multiple purposes.

Server Functions allow Client Components to call async functions executed on the server.

While Server Functions in React 19 are stable and will not break between minor versions, the underlying APIs used to implement Server Functions in a React Server Components bundler or framework do not follow semver and may break between minors in React 19.x.

To support Server Functions as a bundler or framework, we recommend pinning to a specific React version, or using the Canary release. We will continue working with bundlers and frameworks to stabilize the APIs used to implement Server Functions in the future.

When a Server Function is defined with the "use server" directive, your framework will automatically create a reference to the Server Function, and pass that reference to the Client Component. When that function is called on the client, React will send a request to the server to execute the function, and return the result.

Server Functions can be created in Server Components and passed as props to Client Components, or they can be imported and used in Client Components.

Server Components can define Server Functions with the "use server" directive:

When React renders the EmptyNote Server Component, it will create a reference to the createNoteAction function, and pass that reference to the Button Client Component. When the button is clicked, React will send a request to the server to execute the createNoteAction function with the reference provided:

For more, see the docs for "use server".

Client Components can import Server Functions from files that use the "use server" directive:

When the bundler builds the EmptyNote Client Component, it will create a reference to the createNote function in the bundle. When the button is clicked, React will send a request to the server to execute the createNote function using the reference provided:

For more, see the docs for "use server".

Server Functions can be called from Actions on the client:

This allows you to access the isPending state of the Server Function by wrapping it in an Action on the client.

For more, see the docs for Calling a Server Function outside of <form>

Server Functions work with the new Form features in React 19.

You can pass a Server Function to a Form to automatically submit the form to the server:

When the Form submission succeeds, React will automatically reset the form. You can add useActionState to access the pending state, last response, or to support progressive enhancement.

For more, see the docs for Server Functions in Forms.

You can call Server Functions with useActionState for the common case where you just need access to the action pending state and last returned response:

When using useActionState with Server Functions, React will also automatically replay form submissions entered before hydration finishes. This means users can interact with your app even before the app has hydrated.

For more, see the docs for useActionState.

Server Functions also support progressive enhancement with the third argument of useActionState.

When the permalink is provided to useActionState, React will redirect to the provided URL if the form is submitted before the JavaScript bundle loads.

For more, see the docs for useActionState.

**Examples:**

Example 1 (javascript):
```javascript
// Server Componentimport Button from './Button';function EmptyNote () {  async function createNoteAction() {    // Server Function    'use server';        await db.notes.create();  }  return <Button onClick={createNoteAction}/>;}
```

Example 2 (javascript):
```javascript
"use client";export default function Button({onClick}) {   console.log(onClick);   // {$$typeof: Symbol.for("react.server.reference"), $$id: 'createNoteAction'}  return <button onClick={() => onClick()}>Create Empty Note</button>}
```

Example 3 (javascript):
```javascript
"use server";export async function createNote() {  await db.notes.create();}
```

Example 4 (jsx):
```jsx
"use client";import {createNote} from './actions';function EmptyNote() {  console.log(createNote);  // {$$typeof: Symbol.for("react.server.reference"), $$id: 'createNote'}  <button onClick={() => createNote()} />}
```

---

## Directives

**URL:** https://react.dev/reference/rsc/directives

**Contents:**
- Directives
  - React Server Components
- Source code directives

Directives are for use in React Server Components.

Directives provide instructions to bundlers compatible with React Server Components.

---

## 'use client'

**URL:** https://react.dev/reference/rsc/use-client

**Contents:**
- 'use client'
  - React Server Components
- Reference
  - 'use client'
    - Caveats
  - How 'use client' marks client code
      - Deep Dive
    - How is FancyText both a Server and a Client Component?
      - Deep Dive
    - Why is Copyright a Server Component?

'use client' is for use with React Server Components.

'use client' lets you mark what code runs on the client.

Add 'use client' at the top of a file to mark the module and its transitive dependencies as client code.

When a file marked with 'use client' is imported from a Server Component, compatible bundlers will treat the module import as a boundary between server-run and client-run code.

As dependencies of RichTextEditor, formatDate and Button will also be evaluated on the client regardless of whether their modules contain a 'use client' directive. Note that a single module may be evaluated on the server when imported from server code and on the client when imported from client code.

In a React app, components are often split into separate files, or modules.

For apps that use React Server Components, the app is server-rendered by default. 'use client' introduces a server-client boundary in the module dependency tree, effectively creating a subtree of Client modules.

To better illustrate this, consider the following React Server Components app.

In the module dependency tree of this example app, the 'use client' directive in InspirationGenerator.js marks that module and all of its transitive dependencies as Client modules. The subtree starting at InspirationGenerator.js is now marked as Client modules.

'use client' segments the module dependency tree of the React Server Components app, marking InspirationGenerator.js and all of its dependencies as client-rendered.

During render, the framework will server-render the root component and continue through the render tree, opting-out of evaluating any code imported from client-marked code.

The server-rendered portion of the render tree is then sent to the client. The client, with its client code downloaded, then completes rendering the rest of the tree.

The render tree for the React Server Components app. InspirationGenerator and its child component FancyText are components exported from client-marked code and considered Client Components.

We introduce the following definitions:

Working through the example app, App, FancyText and Copyright are all server-rendered and considered Server Components. As InspirationGenerator.js and its transitive dependencies are marked as client code, the component InspirationGenerator and its child component FancyText are Client Components.

By the above definitions, the component FancyText is both a Server and Client Component, how can that be?

First, let’s clarify that the term “component” is not very precise. Here are just two ways “component” can be understood:

Often, the imprecision is not important when explaining concepts, but in this case it is.

When we talk about Server or Client Components, we are referring to component usages.

Back to the question of FancyText, we see that the component definition does not have a 'use client' directive and it has two usages.

The usage of FancyText as a child of App, marks that usage as a Server Component. When FancyText is imported and called under InspirationGenerator, that usage of FancyText is a Client Component as InspirationGenerator contains a 'use client' directive.

This means that the component definition for FancyText will both be evaluated on the server and also downloaded by the client to render its Client Component usage.

Because Copyright is rendered as a child of the Client Component InspirationGenerator, you might be surprised that it is a Server Component.

Recall that 'use client' defines the boundary between server and client code on the module dependency tree, not the render tree.

'use client' defines the boundary between server and client code on the module dependency tree.

In the module dependency tree, we see that App.js imports and calls Copyright from the Copyright.js module. As Copyright.js does not contain a 'use client' directive, the component usage is rendered on the server. App is rendered on the server as it is the root component.

Client Components can render Server Components because you can pass JSX as props. In this case, InspirationGenerator receives Copyright as children. However, the InspirationGenerator module never directly imports the Copyright module nor calls the component, all of that is done by App. In fact, the Copyright component is fully executed before InspirationGenerator starts rendering.

The takeaway is that a parent-child render relationship between components does not guarantee the same render environment.

With 'use client', you can determine when components are Client Components. As Server Components are default, here is a brief overview of the advantages and limitations to Server Components to determine when you need to mark something as client rendered.

For simplicity, we talk about Server Components, but the same principles apply to all code in your app that is server run.

As in any React app, parent components pass data to child components. As they are rendered in different environments, passing data from a Server Component to a Client Component requires extra consideration.

Prop values passed from a Server Component to Client Component must be serializable.

Serializable props include:

Notably, these are not supported:

As Counter requires both the useState Hook and event handlers to increment or decrement the value, this component must be a Client Component and will require a 'use client' directive at the top.

In contrast, a component that renders UI without interaction will not need to be a Client Component.

For example, Counter’s parent component, CounterContainer, does not require 'use client' as it is not interactive and does not use state. In addition, CounterContainer must be a Server Component as it reads from the local file system on the server, which is possible only in a Server Component.

There are also components that don’t use any server or client-only features and can be agnostic to where they render. In our earlier example, FancyText is one such component.

In this case, we don’t add the 'use client' directive, resulting in FancyText’s output (rather than its source code) to be sent to the browser when referenced from a Server Component. As demonstrated in the earlier Inspirations app example, FancyText is used as both a Server or Client Component, depending on where it is imported and used.

But if FancyText’s HTML output was large relative to its source code (including dependencies), it might be more efficient to force it to always be a Client Component. Components that return a long SVG path string are one case where it may be more efficient to force a component to be a Client Component.

Your React app may use client-specific APIs, such as the browser’s APIs for web storage, audio and video manipulation, and device hardware, among others.

In this example, the component uses DOM APIs to manipulate a canvas element. Since those APIs are only available in the browser, it must be marked as a Client Component.

Often in a React app, you’ll leverage third-party libraries to handle common UI patterns or logic.

These libraries may rely on component Hooks or client APIs. Third-party components that use any of the following React APIs must run on the client:

If these libraries have been updated to be compatible with React Server Components, then they will already include 'use client' markers of their own, allowing you to use them directly from your Server Components. If a library hasn’t been updated, or if a component needs props like event handlers that can only be specified on the client, you may need to add your own Client Component file in between the third-party Client Component and your Server Component where you’d like to use it.

**Examples:**

Example 1 (jsx):
```jsx
'use client';import { useState } from 'react';import { formatDate } from './formatters';import Button from './button';export default function RichTextEditor({ timestamp, text }) {  const date = formatDate(timestamp);  // ...  const editButton = <Button />;  // ...}
```

Example 2 (typescript):
```typescript
// This is a definition of a componentfunction MyComponent() {  return <p>My Component</p>}
```

Example 3 (jsx):
```jsx
import MyComponent from './MyComponent';function App() {  // This is a usage of a component  return <MyComponent />;}
```

Example 4 (javascript):
```javascript
import { readFile } from 'node:fs/promises';import Counter from './Counter';export default async function CounterContainer() {  const initialValue = await readFile('/path/to/counter_value');  return <Counter initialValue={initialValue} />}
```

---

## 'use server'

**URL:** https://react.dev/reference/rsc/use-server

**Contents:**
- 'use server'
  - React Server Components
- Reference
  - 'use server'
    - Caveats
  - Security considerations
  - Under Construction
  - Serializable arguments and return values
- Usage
  - Server Functions in forms

'use server' is for use with using React Server Components.

'use server' marks server-side functions that can be called from client-side code.

Add 'use server' at the top of an async function body to mark the function as callable by the client. We call these functions Server Functions.

When calling a Server Function on the client, it will make a network request to the server that includes a serialized copy of any arguments passed. If the Server Function returns a value, that value will be serialized and returned to the client.

Instead of individually marking functions with 'use server', you can add the directive to the top of a file to mark all exports within that file as Server Functions that can be used anywhere, including imported in client code.

Arguments to Server Functions are fully client-controlled. For security, always treat them as untrusted input, and make sure to validate and escape arguments as appropriate.

In any Server Function, make sure to validate that the logged-in user is allowed to perform that action.

To prevent sending sensitive data from a Server Function, there are experimental taint APIs to prevent unique values and objects from being passed to client code.

See experimental_taintUniqueValue and experimental_taintObjectReference.

Since client code calls the Server Function over the network, any arguments passed will need to be serializable.

Here are supported types for Server Function arguments:

Notably, these are not supported:

Supported serializable return values are the same as serializable props for a boundary Client Component.

The most common use case of Server Functions will be calling functions that mutate data. On the browser, the HTML form element is the traditional approach for a user to submit a mutation. With React Server Components, React introduces first-class support for Server Functions as Actions in forms.

Here is a form that allows a user to request a username.

In this example requestUsername is a Server Function passed to a <form>. When a user submits this form, there is a network request to the server function requestUsername. When calling a Server Function in a form, React will supply the form’s FormData as the first argument to the Server Function.

By passing a Server Function to the form action, React can progressively enhance the form. This means that forms can be submitted before the JavaScript bundle is loaded.

In the username request form, there might be the chance that a username is not available. requestUsername should tell us if it fails or not.

To update the UI based on the result of a Server Function while supporting progressive enhancement, use useActionState.

Note that like most Hooks, useActionState can only be called in client code.

Server Functions are exposed server endpoints and can be called anywhere in client code.

When using a Server Function outside a form, call the Server Function in a Transition, which allows you to display a loading indicator, show optimistic state updates, and handle unexpected errors. Forms will automatically wrap Server Functions in transitions.

To read a Server Function return value, you’ll need to await the promise returned.

**Examples:**

Example 1 (javascript):
```javascript
async function addToCart(data) {  'use server';  // ...}
```

Example 2 (javascript):
```javascript
// App.jsasync function requestUsername(formData) {  'use server';  const username = formData.get('username');  // ...}export default function App() {  return (    <form action={requestUsername}>      <input type="text" name="username" />      <button type="submit">Request</button>    </form>  );}
```

Example 3 (javascript):
```javascript
// requestUsername.js'use server';export default async function requestUsername(formData) {  const username = formData.get('username');  if (canRequest(username)) {    // ...    return 'successful';  }  return 'failed';}
```

Example 4 (jsx):
```jsx
// UsernameForm.js'use client';import { useActionState } from 'react';import requestUsername from './requestUsername';function UsernameForm() {  const [state, action] = useActionState(requestUsername, null, 'n/a');  return (    <>      <form action={action}>        <input type="text" name="username" />        <button type="submit">Request</button>      </form>      <p>Last submission request returned: {state}</p>    </>  );}
```

---

## Legacy React APIs

**URL:** https://react.dev/reference/react/legacy

**Contents:**
- Legacy React APIs
- Legacy APIs
- Removed APIs

These APIs are exported from the react package, but they are not recommended for use in newly written code. See the linked individual API pages for the suggested alternatives.

These APIs were removed in React 19:

---

## Children

**URL:** https://react.dev/reference/react/Children

**Contents:**
- Children
  - Pitfall
- Reference
  - Children.count(children)
    - Parameters
    - Returns
    - Caveats
  - Children.forEach(children, fn, thisArg?)
    - Parameters
    - Returns

Using Children is uncommon and can lead to fragile code. See common alternatives.

Children lets you manipulate and transform the JSX you received as the children prop.

Call Children.count(children) to count the number of children in the children data structure.

See more examples below.

The number of nodes inside these children.

Call Children.forEach(children, fn, thisArg?) to run some code for each child in the children data structure.

See more examples below.

Children.forEach returns undefined.

Call Children.map(children, fn, thisArg?) to map or transform each child in the children data structure.

See more examples below.

If children is null or undefined, returns the same value.

Otherwise, returns a flat array consisting of the nodes you’ve returned from the fn function. The returned array will contain all nodes you returned except for null and undefined.

Empty nodes (null, undefined, and Booleans), strings, numbers, and React elements count as individual nodes. Arrays don’t count as individual nodes, but their children do. The traversal does not go deeper than React elements: they don’t get rendered, and their children aren’t traversed. Fragments don’t get traversed.

If you return an element or an array of elements with keys from fn, the returned elements’ keys will be automatically combined with the key of the corresponding original item from children. When you return multiple elements from fn in an array, their keys only need to be unique locally amongst each other.

Call Children.only(children) to assert that children represent a single React element.

If children is a valid element, returns that element.

Otherwise, throws an error.

Call Children.toArray(children) to create an array out of the children data structure.

Returns a flat array of elements in children.

To transform the children JSX that your component receives as the children prop, call Children.map:

In the example above, the RowList wraps every child it receives into a <div className="Row"> container. For example, let’s say the parent component passes three <p> tags as the children prop to RowList:

Then, with the RowList implementation above, the final rendered result will look like this:

Children.map is similar to to transforming arrays with map(). The difference is that the children data structure is considered opaque. This means that even if it’s sometimes an array, you should not assume it’s an array or any other particular data type. This is why you should use Children.map if you need to transform it.

In React, the children prop is considered an opaque data structure. This means that you shouldn’t rely on how it is structured. To transform, filter, or count children, you should use the Children methods.

In practice, the children data structure is often represented as an array internally. However, if there is only a single child, then React won’t create an extra array since this would lead to unnecessary memory overhead. As long as you use the Children methods instead of directly introspecting the children prop, your code will not break even if React changes how the data structure is actually implemented.

Even when children is an array, Children.map has useful special behavior. For example, Children.map combines the keys on the returned elements with the keys on the children you’ve passed to it. This ensures the original JSX children don’t “lose” keys even if they get wrapped like in the example above.

The children data structure does not include rendered output of the components you pass as JSX. In the example below, the children received by the RowList only contains two items rather than three:

This is why only two row wrappers are generated in this example:

There is no way to get the rendered output of an inner component like <MoreRows /> when manipulating children. This is why it’s usually better to use one of the alternative solutions.

Call Children.forEach to iterate over each child in the children data structure. It does not return any value and is similar to the array forEach method. You can use it to run custom logic like constructing your own array.

As mentioned earlier, there is no way to get the rendered output of an inner component when manipulating children. This is why it’s usually better to use one of the alternative solutions.

Call Children.count(children) to calculate the number of children.

As mentioned earlier, there is no way to get the rendered output of an inner component when manipulating children. This is why it’s usually better to use one of the alternative solutions.

Call Children.toArray(children) to turn the children data structure into a regular JavaScript array. This lets you manipulate the array with built-in array methods like filter, sort, or reverse.

As mentioned earlier, there is no way to get the rendered output of an inner component when manipulating children. This is why it’s usually better to use one of the alternative solutions.

This section describes alternatives to the Children API (with capital C) that’s imported like this:

Don’t confuse it with using the children prop (lowercase c), which is good and encouraged.

Manipulating children with the Children methods often leads to fragile code. When you pass children to a component in JSX, you don’t usually expect the component to manipulate or transform the individual children.

When you can, try to avoid using the Children methods. For example, if you want every child of RowList to be wrapped in <div className="Row">, export a Row component, and manually wrap every row into it like this:

Unlike using Children.map, this approach does not wrap every child automatically. However, this approach has a significant benefit compared to the earlier example with Children.map because it works even if you keep extracting more components. For example, it still works if you extract your own MoreRows component:

This wouldn’t work with Children.map because it would “see” <MoreRows /> as a single child (and a single row).

You can also explicitly pass an array as a prop. For example, this RowList accepts a rows array as a prop:

Since rows is a regular JavaScript array, the RowList component can use built-in array methods like map on it.

This pattern is especially useful when you want to be able to pass more information as structured data together with children. In the below example, the TabSwitcher component receives an array of objects as the tabs prop:

Unlike passing the children as JSX, this approach lets you associate some extra data like header with each item. Because you are working with the tabs directly, and it is an array, you do not need the Children methods.

Instead of producing JSX for every single item, you can also pass a function that returns JSX, and call that function when necessary. In this example, the App component passes a renderContent function to the TabSwitcher component. The TabSwitcher component calls renderContent only for the selected tab:

A prop like renderContent is called a render prop because it is a prop that specifies how to render a piece of the user interface. However, there is nothing special about it: it is a regular prop which happens to be a function.

Render props are functions, so you can pass information to them. For example, this RowList component passes the id and the index of each row to the renderRow render prop, which uses index to highlight even rows:

This is another example of how parent and child components can cooperate without manipulating the children.

Suppose you pass two children to RowList like this:

If you do Children.count(children) inside RowList, you will get 2. Even if MoreRows renders 10 different items, or if it returns null, Children.count(children) will still be 2. From the RowList’s perspective, it only “sees” the JSX it has received. It does not “see” the internals of the MoreRows component.

The limitation makes it hard to extract a component. This is why alternatives are preferred to using Children.

**Examples:**

Example 1 (jsx):
```jsx
const mappedChildren = Children.map(children, child =>  <div className="Row">    {child}  </div>);
```

Example 2 (javascript):
```javascript
import { Children } from 'react';function RowList({ children }) {  return (    <>      <h1>Total rows: {Children.count(children)}</h1>      ...    </>  );}
```

Example 3 (javascript):
```javascript
import { Children } from 'react';function SeparatorList({ children }) {  const result = [];  Children.forEach(children, (child, index) => {    result.push(child);    result.push(<hr key={index} />);  });  // ...
```

Example 4 (jsx):
```jsx
import { Children } from 'react';function RowList({ children }) {  return (    <div className="RowList">      {Children.map(children, child =>        <div className="Row">          {child}        </div>      )}    </div>  );}
```

---

## isValidElement

**URL:** https://react.dev/reference/react/isValidElement

**Contents:**
- isValidElement
- Reference
  - isValidElement(value)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Checking if something is a React element
      - Deep Dive
    - React elements vs React nodes

isValidElement checks whether a value is a React element.

Call isValidElement(value) to check whether value is a React element.

See more examples below.

isValidElement returns true if the value is a React element. Otherwise, it returns false.

Call isValidElement to check if some value is a React element.

For React elements, isValidElement returns true:

Any other values, such as strings, numbers, or arbitrary objects and arrays, are not React elements.

For them, isValidElement returns false:

It is very uncommon to need isValidElement. It’s mostly useful if you’re calling another API that only accepts elements (like cloneElement does) and you want to avoid an error when your argument is not a React element.

Unless you have some very specific reason to add an isValidElement check, you probably don’t need it.

When you write a component, you can return any kind of React node from it:

Note isValidElement checks whether the argument is a React element, not whether it’s a React node. For example, 42 is not a valid React element. However, it is a perfectly valid React node:

This is why you shouldn’t use isValidElement as a way to check whether something can be rendered.

**Examples:**

Example 1 (javascript):
```javascript
const isElement = isValidElement(value)
```

Example 2 (jsx):
```jsx
import { isValidElement, createElement } from 'react';// ✅ React elementsconsole.log(isValidElement(<p />)); // trueconsole.log(isValidElement(createElement('p'))); // true// ❌ Not React elementsconsole.log(isValidElement(25)); // falseconsole.log(isValidElement('Hello')); // falseconsole.log(isValidElement({ age: 42 })); // false
```

Example 3 (jsx):
```jsx
import { isValidElement, createElement } from 'react';// ✅ JSX tags are React elementsconsole.log(isValidElement(<p />)); // trueconsole.log(isValidElement(<MyComponent />)); // true// ✅ Values returned by createElement are React elementsconsole.log(isValidElement(createElement('p'))); // trueconsole.log(isValidElement(createElement(MyComponent))); // true
```

Example 4 (jsx):
```jsx
// ❌ These are *not* React elementsconsole.log(isValidElement(null)); // falseconsole.log(isValidElement(25)); // falseconsole.log(isValidElement('Hello')); // falseconsole.log(isValidElement({ age: 42 })); // falseconsole.log(isValidElement([<div />, <div />])); // falseconsole.log(isValidElement(MyComponent)); // false
```

---

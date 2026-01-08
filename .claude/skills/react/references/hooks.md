# React - Hooks

**Pages:** 26

---

## useCallback

**URL:** https://react.dev/reference/react/useCallback

**Contents:**
- useCallback
  - Note
- Reference
  - useCallback(fn, dependencies)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Skipping re-rendering of components
  - Note

useCallback is a React Hook that lets you cache a function definition between re-renders.

React Compiler automatically memoizes values and functions, reducing the need for manual useCallback calls. You can use the compiler to handle memoization automatically.

Call useCallback at the top level of your component to cache a function definition between re-renders:

See more examples below.

fn: The function value that you want to cache. It can take any arguments and return any values. React will return (not call!) your function back to you during the initial render. On next renders, React will give you the same function again if the dependencies have not changed since the last render. Otherwise, it will give you the function that you have passed during the current render, and store it in case it can be reused later. React will not call your function. The function is returned to you so you can decide when and whether to call it.

dependencies: The list of all reactive values referenced inside of the fn code. Reactive values include props, state, and all the variables and functions declared directly inside your component body. If your linter is configured for React, it will verify that every reactive value is correctly specified as a dependency. The list of dependencies must have a constant number of items and be written inline like [dep1, dep2, dep3]. React will compare each dependency with its previous value using the Object.is comparison algorithm.

On the initial render, useCallback returns the fn function you have passed.

During subsequent renders, it will either return an already stored fn function from the last render (if the dependencies haven’t changed), or return the fn function you have passed during this render.

When you optimize rendering performance, you will sometimes need to cache the functions that you pass to child components. Let’s first look at the syntax for how to do this, and then see in which cases it’s useful.

To cache a function between re-renders of your component, wrap its definition into the useCallback Hook:

You need to pass two things to useCallback:

On the initial render, the returned function you’ll get from useCallback will be the function you passed.

On the following renders, React will compare the dependencies with the dependencies you passed during the previous render. If none of the dependencies have changed (compared with Object.is), useCallback will return the same function as before. Otherwise, useCallback will return the function you passed on this render.

In other words, useCallback caches a function between re-renders until its dependencies change.

Let’s walk through an example to see when this is useful.

Say you’re passing a handleSubmit function down from the ProductPage to the ShippingForm component:

You’ve noticed that toggling the theme prop freezes the app for a moment, but if you remove <ShippingForm /> from your JSX, it feels fast. This tells you that it’s worth trying to optimize the ShippingForm component.

By default, when a component re-renders, React re-renders all of its children recursively. This is why, when ProductPage re-renders with a different theme, the ShippingForm component also re-renders. This is fine for components that don’t require much calculation to re-render. But if you verified a re-render is slow, you can tell ShippingForm to skip re-rendering when its props are the same as on last render by wrapping it in memo:

With this change, ShippingForm will skip re-rendering if all of its props are the same as on the last render. This is when caching a function becomes important! Let’s say you defined handleSubmit without useCallback:

In JavaScript, a function () {} or () => {} always creates a different function, similar to how the {} object literal always creates a new object. Normally, this wouldn’t be a problem, but it means that ShippingForm props will never be the same, and your memo optimization won’t work. This is where useCallback comes in handy:

By wrapping handleSubmit in useCallback, you ensure that it’s the same function between the re-renders (until dependencies change). You don’t have to wrap a function in useCallback unless you do it for some specific reason. In this example, the reason is that you pass it to a component wrapped in memo, and this lets it skip re-rendering. There are other reasons you might need useCallback which are described further on this page.

You should only rely on useCallback as a performance optimization. If your code doesn’t work without it, find the underlying problem and fix it first. Then you may add useCallback back.

You will often see useMemo alongside useCallback. They are both useful when you’re trying to optimize a child component. They let you memoize (or, in other words, cache) something you’re passing down:

The difference is in what they’re letting you cache:

If you’re already familiar with useMemo, you might find it helpful to think of useCallback as this:

Read more about the difference between useMemo and useCallback.

If your app is like this site, and most interactions are coarse (like replacing a page or an entire section), memoization is usually unnecessary. On the other hand, if your app is more like a drawing editor, and most interactions are granular (like moving shapes), then you might find memoization very helpful.

Caching a function with useCallback is only valuable in a few cases:

There is no benefit to wrapping a function in useCallback in other cases. There is no significant harm to doing that either, so some teams choose to not think about individual cases, and memoize as much as possible. The downside is that code becomes less readable. Also, not all memoization is effective: a single value that’s “always new” is enough to break memoization for an entire component.

Note that useCallback does not prevent creating the function. You’re always creating a function (and that’s fine!), but React ignores it and gives you back a cached function if nothing changed.

In practice, you can make a lot of memoization unnecessary by following a few principles:

If a specific interaction still feels laggy, use the React Developer Tools profiler to see which components benefit the most from memoization, and add memoization where needed. These principles make your components easier to debug and understand, so it’s good to follow them in any case. In long term, we’re researching doing memoization automatically to solve this once and for all.

In this example, the ShippingForm component is artificially slowed down so that you can see what happens when a React component you’re rendering is genuinely slow. Try incrementing the counter and toggling the theme.

Incrementing the counter feels slow because it forces the slowed down ShippingForm to re-render. That’s expected because the counter has changed, and so you need to reflect the user’s new choice on the screen.

Next, try toggling the theme. Thanks to useCallback together with memo, it’s fast despite the artificial slowdown! ShippingForm skipped re-rendering because the handleSubmit function has not changed. The handleSubmit function has not changed because both productId and referrer (your useCallback dependencies) haven’t changed since last render.

Sometimes, you might need to update state based on previous state from a memoized callback.

This handleAddTodo function specifies todos as a dependency because it computes the next todos from it:

You’ll usually want memoized functions to have as few dependencies as possible. When you read some state only to calculate the next state, you can remove that dependency by passing an updater function instead:

Here, instead of making todos a dependency and reading it inside, you pass an instruction about how to update the state (todos => [...todos, newTodo]) to React. Read more about updater functions.

Sometimes, you might want to call a function from inside an Effect:

This creates a problem. Every reactive value must be declared as a dependency of your Effect. However, if you declare createOptions as a dependency, it will cause your Effect to constantly reconnect to the chat room:

To solve this, you can wrap the function you need to call from an Effect into useCallback:

This ensures that the createOptions function is the same between re-renders if the roomId is the same. However, it’s even better to remove the need for a function dependency. Move your function inside the Effect:

Now your code is simpler and doesn’t need useCallback. Learn more about removing Effect dependencies.

If you’re writing a custom Hook, it’s recommended to wrap any functions that it returns into useCallback:

This ensures that the consumers of your Hook can optimize their own code when needed.

Make sure you’ve specified the dependency array as a second argument!

If you forget the dependency array, useCallback will return a new function every time:

This is the corrected version passing the dependency array as a second argument:

If this doesn’t help, then the problem is that at least one of your dependencies is different from the previous render. You can debug this problem by manually logging your dependencies to the console:

You can then right-click on the arrays from different re-renders in the console and select “Store as a global variable” for both of them. Assuming the first one got saved as temp1 and the second one got saved as temp2, you can then use the browser console to check whether each dependency in both arrays is the same:

When you find which dependency is breaking memoization, either find a way to remove it, or memoize it as well.

Suppose the Chart component is wrapped in memo. You want to skip re-rendering every Chart in the list when the ReportList component re-renders. However, you can’t call useCallback in a loop:

Instead, extract a component for an individual item, and put useCallback there:

Alternatively, you could remove useCallback in the last snippet and instead wrap Report itself in memo. If the item prop does not change, Report will skip re-rendering, so Chart will skip re-rendering too:

**Examples:**

Example 1 (jsx):
```jsx
const cachedFn = useCallback(fn, dependencies)
```

Example 2 (javascript):
```javascript
import { useCallback } from 'react';export default function ProductPage({ productId, referrer, theme }) {  const handleSubmit = useCallback((orderDetails) => {    post('/product/' + productId + '/buy', {      referrer,      orderDetails,    });  }, [productId, referrer]);
```

Example 3 (javascript):
```javascript
import { useCallback } from 'react';function ProductPage({ productId, referrer, theme }) {  const handleSubmit = useCallback((orderDetails) => {    post('/product/' + productId + '/buy', {      referrer,      orderDetails,    });  }, [productId, referrer]);  // ...
```

Example 4 (jsx):
```jsx
function ProductPage({ productId, referrer, theme }) {  // ...  return (    <div className={theme}>      <ShippingForm onSubmit={handleSubmit} />    </div>  );
```

---

## useEffect

**URL:** https://react.dev/reference/react/useEffect

**Contents:**
- useEffect
- Reference
  - useEffect(setup, dependencies?)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Connecting to an external system
  - Note
    - Examples of connecting to an external system

useEffect is a React Hook that lets you synchronize a component with an external system.

Call useEffect at the top level of your component to declare an Effect:

See more examples below.

setup: The function with your Effect’s logic. Your setup function may also optionally return a cleanup function. When your component commits, React will run your setup function. After every commit with changed dependencies, React will first run the cleanup function (if you provided it) with the old values, and then run your setup function with the new values. After your component is removed from the DOM, React will run your cleanup function.

optional dependencies: The list of all reactive values referenced inside of the setup code. Reactive values include props, state, and all the variables and functions declared directly inside your component body. If your linter is configured for React, it will verify that every reactive value is correctly specified as a dependency. The list of dependencies must have a constant number of items and be written inline like [dep1, dep2, dep3]. React will compare each dependency with its previous value using the Object.is comparison. If you omit this argument, your Effect will re-run after every commit of the component. See the difference between passing an array of dependencies, an empty array, and no dependencies at all.

useEffect returns undefined.

useEffect is a Hook, so you can only call it at the top level of your component or your own Hooks. You can’t call it inside loops or conditions. If you need that, extract a new component and move the state into it.

If you’re not trying to synchronize with some external system, you probably don’t need an Effect.

When Strict Mode is on, React will run one extra development-only setup+cleanup cycle before the first real setup. This is a stress-test that ensures that your cleanup logic “mirrors” your setup logic and that it stops or undoes whatever the setup is doing. If this causes a problem, implement the cleanup function.

If some of your dependencies are objects or functions defined inside the component, there is a risk that they will cause the Effect to re-run more often than needed. To fix this, remove unnecessary object and function dependencies. You can also extract state updates and non-reactive logic outside of your Effect.

If your Effect wasn’t caused by an interaction (like a click), React will generally let the browser paint the updated screen first before running your Effect. If your Effect is doing something visual (for example, positioning a tooltip), and the delay is noticeable (for example, it flickers), replace useEffect with useLayoutEffect.

If your Effect is caused by an interaction (like a click), React may run your Effect before the browser paints the updated screen. This ensures that the result of the Effect can be observed by the event system. Usually, this works as expected. However, if you must defer the work until after paint, such as an alert(), you can use setTimeout. See reactwg/react-18/128 for more information.

Even if your Effect was caused by an interaction (like a click), React may allow the browser to repaint the screen before processing the state updates inside your Effect. Usually, this works as expected. However, if you must block the browser from repainting the screen, you need to replace useEffect with useLayoutEffect.

Effects only run on the client. They don’t run during server rendering.

Some components need to stay connected to the network, some browser API, or a third-party library, while they are displayed on the page. These systems aren’t controlled by React, so they are called external.

To connect your component to some external system, call useEffect at the top level of your component:

You need to pass two arguments to useEffect:

React calls your setup and cleanup functions whenever it’s necessary, which may happen multiple times:

Let’s illustrate this sequence for the example above.

When the ChatRoom component above gets added to the page, it will connect to the chat room with the initial serverUrl and roomId. If either serverUrl or roomId change as a result of a commit (say, if the user picks a different chat room in a dropdown), your Effect will disconnect from the previous room, and connect to the next one. When the ChatRoom component is removed from the page, your Effect will disconnect one last time.

To help you find bugs, in development React runs setup and cleanup one extra time before the setup. This is a stress-test that verifies your Effect’s logic is implemented correctly. If this causes visible issues, your cleanup function is missing some logic. The cleanup function should stop or undo whatever the setup function was doing. The rule of thumb is that the user shouldn’t be able to distinguish between the setup being called once (as in production) and a setup → cleanup → setup sequence (as in development). See common solutions.

Try to write every Effect as an independent process and think about a single setup/cleanup cycle at a time. It shouldn’t matter whether your component is mounting, updating, or unmounting. When your cleanup logic correctly “mirrors” the setup logic, your Effect is resilient to running setup and cleanup as often as needed.

An Effect lets you keep your component synchronized with some external system (like a chat service). Here, external system means any piece of code that’s not controlled by React, such as:

If you’re not connecting to any external system, you probably don’t need an Effect.

In this example, the ChatRoom component uses an Effect to stay connected to an external system defined in chat.js. Press “Open chat” to make the ChatRoom component appear. This sandbox runs in development mode, so there is an extra connect-and-disconnect cycle, as explained here. Try changing the roomId and serverUrl using the dropdown and the input, and see how the Effect re-connects to the chat. Press “Close chat” to see the Effect disconnect one last time.

Effects are an “escape hatch”: you use them when you need to “step outside React” and when there is no better built-in solution for your use case. If you find yourself often needing to manually write Effects, it’s usually a sign that you need to extract some custom Hooks for common behaviors your components rely on.

For example, this useChatRoom custom Hook “hides” the logic of your Effect behind a more declarative API:

Then you can use it from any component like this:

There are also many excellent custom Hooks for every purpose available in the React ecosystem.

Learn more about wrapping Effects in custom Hooks.

This example is identical to one of the earlier examples, but the logic is extracted to a custom Hook.

Sometimes, you want to keep an external system synchronized to some prop or state of your component.

For example, if you have a third-party map widget or a video player component written without React, you can use an Effect to call methods on it that make its state match the current state of your React component. This Effect creates an instance of a MapWidget class defined in map-widget.js. When you change the zoomLevel prop of the Map component, the Effect calls the setZoom() on the class instance to keep it synchronized:

In this example, a cleanup function is not needed because the MapWidget class manages only the DOM node that was passed to it. After the Map React component is removed from the tree, both the DOM node and the MapWidget class instance will be automatically garbage-collected by the browser JavaScript engine.

You can use an Effect to fetch data for your component. Note that if you use a framework, using your framework’s data fetching mechanism will be a lot more efficient than writing Effects manually.

If you want to fetch data from an Effect manually, your code might look like this:

Note the ignore variable which is initialized to false, and is set to true during cleanup. This ensures your code doesn’t suffer from “race conditions”: network responses may arrive in a different order than you sent them.

You can also rewrite using the async / await syntax, but you still need to provide a cleanup function:

Writing data fetching directly in Effects gets repetitive and makes it difficult to add optimizations like caching and server rendering later. It’s easier to use a custom Hook—either your own or maintained by the community.

Writing fetch calls inside Effects is a popular way to fetch data, especially in fully client-side apps. This is, however, a very manual approach and it has significant downsides:

This list of downsides is not specific to React. It applies to fetching data on mount with any library. Like with routing, data fetching is not trivial to do well, so we recommend the following approaches:

You can continue fetching data directly in Effects if neither of these approaches suit you.

Notice that you can’t “choose” the dependencies of your Effect. Every reactive value used by your Effect’s code must be declared as a dependency. Your Effect’s dependency list is determined by the surrounding code:

If either serverUrl or roomId change, your Effect will reconnect to the chat using the new values.

Reactive values include props and all variables and functions declared directly inside of your component. Since roomId and serverUrl are reactive values, you can’t remove them from the dependencies. If you try to omit them and your linter is correctly configured for React, the linter will flag this as a mistake you need to fix:

To remove a dependency, you need to “prove” to the linter that it doesn’t need to be a dependency. For example, you can move serverUrl out of your component to prove that it’s not reactive and won’t change on re-renders:

Now that serverUrl is not a reactive value (and can’t change on a re-render), it doesn’t need to be a dependency. If your Effect’s code doesn’t use any reactive values, its dependency list should be empty ([]):

An Effect with empty dependencies doesn’t re-run when any of your component’s props or state change.

If you have an existing codebase, you might have some Effects that suppress the linter like this:

When dependencies don’t match the code, there is a high risk of introducing bugs. By suppressing the linter, you “lie” to React about the values your Effect depends on. Instead, prove they’re unnecessary.

If you specify the dependencies, your Effect runs after the initial commit and after commits with changed dependencies.

In the below example, serverUrl and roomId are reactive values, so they both must be specified as dependencies. As a result, selecting a different room in the dropdown or editing the server URL input causes the chat to re-connect. However, since message isn’t used in the Effect (and so it isn’t a dependency), editing the message doesn’t re-connect to the chat.

When you want to update state based on previous state from an Effect, you might run into a problem:

Since count is a reactive value, it must be specified in the list of dependencies. However, that causes the Effect to cleanup and setup again every time the count changes. This is not ideal.

To fix this, pass the c => c + 1 state updater to setCount:

Now that you’re passing c => c + 1 instead of count + 1, your Effect no longer needs to depend on count. As a result of this fix, it won’t need to cleanup and setup the interval again every time the count changes.

If your Effect depends on an object or a function created during rendering, it might run too often. For example, this Effect re-connects after every commit because the options object is different for every render:

Avoid using an object created during rendering as a dependency. Instead, create the object inside the Effect:

Now that you create the options object inside the Effect, the Effect itself only depends on the roomId string.

With this fix, typing into the input doesn’t reconnect the chat. Unlike an object which gets re-created, a string like roomId doesn’t change unless you set it to another value. Read more about removing dependencies.

If your Effect depends on an object or a function created during rendering, it might run too often. For example, this Effect re-connects after every commit because the createOptions function is different for every render:

By itself, creating a function from scratch on every re-render is not a problem. You don’t need to optimize that. However, if you use it as a dependency of your Effect, it will cause your Effect to re-run after every commit.

Avoid using a function created during rendering as a dependency. Instead, declare it inside the Effect:

Now that you define the createOptions function inside the Effect, the Effect itself only depends on the roomId string. With this fix, typing into the input doesn’t reconnect the chat. Unlike a function which gets re-created, a string like roomId doesn’t change unless you set it to another value. Read more about removing dependencies.

By default, when you read a reactive value from an Effect, you have to add it as a dependency. This ensures that your Effect “reacts” to every change of that value. For most dependencies, that’s the behavior you want.

However, sometimes you’ll want to read the latest props and state from an Effect without “reacting” to them. For example, imagine you want to log the number of the items in the shopping cart for every page visit:

What if you want to log a new page visit after every url change, but not if only the shoppingCart changes? You can’t exclude shoppingCart from dependencies without breaking the reactivity rules. However, you can express that you don’t want a piece of code to “react” to changes even though it is called from inside an Effect. Declare an Effect Event with the useEffectEvent Hook, and move the code reading shoppingCart inside of it:

Effect Events are not reactive and must always be omitted from dependencies of your Effect. This is what lets you put non-reactive code (where you can read the latest value of some props and state) inside of them. By reading shoppingCart inside of onVisit, you ensure that shoppingCart won’t re-run your Effect.

Read more about how Effect Events let you separate reactive and non-reactive code.

If your app uses server rendering (either directly or via a framework), your component will render in two different environments. On the server, it will render to produce the initial HTML. On the client, React will run the rendering code again so that it can attach your event handlers to that HTML. This is why, for hydration to work, your initial render output must be identical on the client and the server.

In rare cases, you might need to display different content on the client. For example, if your app reads some data from localStorage, it can’t possibly do that on the server. Here is how you could implement this:

While the app is loading, the user will see the initial render output. Then, when it’s loaded and hydrated, your Effect will run and set didMount to true, triggering a re-render. This will switch to the client-only render output. Effects don’t run on the server, so this is why didMount was false during the initial server render.

Use this pattern sparingly. Keep in mind that users with a slow connection will see the initial content for quite a bit of time—potentially, many seconds—so you don’t want to make jarring changes to your component’s appearance. In many cases, you can avoid the need for this by conditionally showing different things with CSS.

When Strict Mode is on, in development, React runs setup and cleanup one extra time before the actual setup.

This is a stress-test that verifies your Effect’s logic is implemented correctly. If this causes visible issues, your cleanup function is missing some logic. The cleanup function should stop or undo whatever the setup function was doing. The rule of thumb is that the user shouldn’t be able to distinguish between the setup being called once (as in production) and a setup → cleanup → setup sequence (as in development).

Read more about how this helps find bugs and how to fix your logic.

First, check that you haven’t forgotten to specify the dependency array:

If you’ve specified the dependency array but your Effect still re-runs in a loop, it’s because one of your dependencies is different on every re-render.

You can debug this problem by manually logging your dependencies to the console:

You can then right-click on the arrays from different re-renders in the console and select “Store as a global variable” for both of them. Assuming the first one got saved as temp1 and the second one got saved as temp2, you can then use the browser console to check whether each dependency in both arrays is the same:

When you find the dependency that is different on every re-render, you can usually fix it in one of these ways:

As a last resort (if these methods didn’t help), wrap its creation with useMemo or useCallback (for functions).

If your Effect runs in an infinite cycle, these two things must be true:

Before you start fixing the problem, ask yourself whether your Effect is connecting to some external system (like DOM, network, a third-party widget, and so on). Why does your Effect need to set state? Does it synchronize with that external system? Or are you trying to manage your application’s data flow with it?

If there is no external system, consider whether removing the Effect altogether would simplify your logic.

If you’re genuinely synchronizing with some external system, think about why and under what conditions your Effect should update the state. Has something changed that affects your component’s visual output? If you need to keep track of some data that isn’t used by rendering, a ref (which doesn’t trigger re-renders) might be more appropriate. Verify your Effect doesn’t update the state (and trigger re-renders) more than needed.

Finally, if your Effect is updating the state at the right time, but there is still a loop, it’s because that state update leads to one of the Effect’s dependencies changing. Read how to debug dependency changes.

The cleanup function runs not only during unmount, but before every re-render with changed dependencies. Additionally, in development, React runs setup+cleanup one extra time immediately after component mounts.

If you have cleanup code without corresponding setup code, it’s usually a code smell:

Your cleanup logic should be “symmetrical” to the setup logic, and should stop or undo whatever setup did:

Learn how the Effect lifecycle is different from the component’s lifecycle.

If your Effect must block the browser from painting the screen, replace useEffect with useLayoutEffect. Note that this shouldn’t be needed for the vast majority of Effects. You’ll only need this if it’s crucial to run your Effect before the browser paint: for example, to measure and position a tooltip before the user sees it.

**Examples:**

Example 1 (jsx):
```jsx
useEffect(setup, dependencies?)
```

Example 2 (jsx):
```jsx
import { useState, useEffect } from 'react';import { createConnection } from './chat.js';function ChatRoom({ roomId }) {  const [serverUrl, setServerUrl] = useState('https://localhost:1234');  useEffect(() => {    const connection = createConnection(serverUrl, roomId);    connection.connect();    return () => {      connection.disconnect();    };  }, [serverUrl, roomId]);  // ...}
```

Example 3 (jsx):
```jsx
import { useState, useEffect } from 'react';import { createConnection } from './chat.js';function ChatRoom({ roomId }) {  const [serverUrl, setServerUrl] = useState('https://localhost:1234');  useEffect(() => {  	const connection = createConnection(serverUrl, roomId);    connection.connect();  	return () => {      connection.disconnect();  	};  }, [serverUrl, roomId]);  // ...}
```

Example 4 (javascript):
```javascript
function useChatRoom({ serverUrl, roomId }) {  useEffect(() => {    const options = {      serverUrl: serverUrl,      roomId: roomId    };    const connection = createConnection(options);    connection.connect();    return () => connection.disconnect();  }, [roomId, serverUrl]);}
```

---

## useEffectEvent

**URL:** https://react.dev/reference/react/useEffectEvent

**Contents:**
- useEffectEvent
- Reference
  - useEffectEvent(callback)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Reading the latest props and state

useEffectEvent is a React Hook that lets you extract non-reactive logic from your Effects into a reusable function called an Effect Event.

Call useEffectEvent at the top level of your component to declare an Effect Event. Effect Events are functions you can call inside Effects, such as useEffect:

See more examples below.

Returns an Effect Event function. You can call this function inside useEffect, useLayoutEffect, or useInsertionEffect.

Typically, when you access a reactive value inside an Effect, you must include it in the dependency array. This makes sure your Effect runs again whenever that value changes, which is usually the desired behavior.

But in some cases, you may want to read the most recent props or state inside an Effect without causing the Effect to re-run when those values change.

To read the latest props or state in your Effect, without making those values reactive, include them in an Effect Event.

In this example, the Effect should re-run after a render when url changes (to log the new page visit), but it should not re-run when numberOfItems changes. By wrapping the logging logic in an Effect Event, numberOfItems becomes non-reactive. It’s always read from the latest value without triggering the Effect.

You can pass reactive values like url as arguments to the Effect Event to keep them reactive while accessing the latest non-reactive values inside the event.

**Examples:**

Example 1 (javascript):
```javascript
const onSomething = useEffectEvent(callback)
```

Example 2 (javascript):
```javascript
import { useEffectEvent, useEffect } from 'react';function ChatRoom({ roomId, theme }) {  const onConnected = useEffectEvent(() => {    showNotification('Connected!', theme);  });  useEffect(() => {    const connection = createConnection(serverUrl, roomId);    connection.on('connected', () => {      onConnected();    });    connection.connect();    return () => connection.disconnect();  }, [roomId]);  // ...}
```

Example 3 (javascript):
```javascript
import { useEffect, useContext, useEffectEvent } from 'react';function Page({ url }) {  const { items } = useContext(ShoppingCartContext);  const numberOfItems = items.length;  const onNavigate = useEffectEvent((visitedUrl) => {    logVisit(visitedUrl, numberOfItems);  });  useEffect(() => {    onNavigate(url);  }, [url]);  // ...}
```

---

## useRef

**URL:** https://react.dev/reference/react/useRef

**Contents:**
- useRef
- Reference
  - useRef(initialValue)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Referencing a value with a ref
    - Examples of referencing a value with useRef
    - Example 1 of 2: Click counter

useRef is a React Hook that lets you reference a value that’s not needed for rendering.

Call useRef at the top level of your component to declare a ref.

See more examples below.

useRef returns an object with a single property:

On the next renders, useRef will return the same object.

Call useRef at the top level of your component to declare one or more refs.

useRef returns a ref object with a single current property initially set to the initial value you provided.

On the next renders, useRef will return the same object. You can change its current property to store information and read it later. This might remind you of state, but there is an important difference.

Changing a ref does not trigger a re-render. This means refs are perfect for storing information that doesn’t affect the visual output of your component. For example, if you need to store an interval ID and retrieve it later, you can put it in a ref. To update the value inside the ref, you need to manually change its current property:

Later, you can read that interval ID from the ref so that you can call clear that interval:

By using a ref, you ensure that:

Changing a ref does not trigger a re-render, so refs are not appropriate for storing information you want to display on the screen. Use state for that instead. Read more about choosing between useRef and useState.

This component uses a ref to keep track of how many times the button was clicked. Note that it’s okay to use a ref instead of state here because the click count is only read and written in an event handler.

If you show {ref.current} in the JSX, the number won’t update on click. This is because setting ref.current does not trigger a re-render. Information that’s used for rendering should be state instead.

Do not write or read ref.current during rendering.

React expects that the body of your component behaves like a pure function:

Reading or writing a ref during rendering breaks these expectations.

You can read or write refs from event handlers or effects instead.

If you have to read or write something during rendering, use state instead.

When you break these rules, your component might still work, but most of the newer features we’re adding to React will rely on these expectations. Read more about keeping your components pure.

It’s particularly common to use a ref to manipulate the DOM. React has built-in support for this.

First, declare a ref object with an initial value of null:

Then pass your ref object as the ref attribute to the JSX of the DOM node you want to manipulate:

After React creates the DOM node and puts it on the screen, React will set the current property of your ref object to that DOM node. Now you can access the <input>’s DOM node and call methods like focus():

React will set the current property back to null when the node is removed from the screen.

Read more about manipulating the DOM with refs.

In this example, clicking the button will focus the input:

React saves the initial ref value once and ignores it on the next renders.

Although the result of new VideoPlayer() is only used for the initial render, you’re still calling this function on every render. This can be wasteful if it’s creating expensive objects.

To solve it, you may initialize the ref like this instead:

Normally, writing or reading ref.current during render is not allowed. However, it’s fine in this case because the result is always the same, and the condition only executes during initialization so it’s fully predictable.

If you use a type checker and don’t want to always check for null, you can try a pattern like this instead:

Here, the playerRef itself is nullable. However, you should be able to convince your type checker that there is no case in which getPlayer() returns null. Then use getPlayer() in your event handlers.

If you try to pass a ref to your own component like this:

You might get an error in the console:

By default, your own components don’t expose refs to the DOM nodes inside them.

To fix this, find the component that you want to get a ref to:

And then add ref to the list of props your component accepts and pass ref as a prop to the relevant child built-in component like this:

Then the parent component can get a ref to it.

Read more about accessing another component’s DOM nodes.

**Examples:**

Example 1 (jsx):
```jsx
const ref = useRef(initialValue)
```

Example 2 (javascript):
```javascript
import { useRef } from 'react';function MyComponent() {  const intervalRef = useRef(0);  const inputRef = useRef(null);  // ...
```

Example 3 (javascript):
```javascript
import { useRef } from 'react';function Stopwatch() {  const intervalRef = useRef(0);  // ...
```

Example 4 (javascript):
```javascript
function handleStartClick() {  const intervalId = setInterval(() => {    // ...  }, 1000);  intervalRef.current = intervalId;}
```

---

## useState

**URL:** https://react.dev/reference/react/useState

**Contents:**
- useState
- Reference
  - useState(initialState)
    - Parameters
    - Returns
    - Caveats
  - set functions, like setSomething(nextState)
    - Parameters
    - Returns
    - Caveats

useState is a React Hook that lets you add a state variable to your component.

Call useState at the top level of your component to declare a state variable.

The convention is to name state variables like [something, setSomething] using array destructuring.

See more examples below.

useState returns an array with exactly two values:

The set function returned by useState lets you update the state to a different value and trigger a re-render. You can pass the next state directly, or a function that calculates it from the previous state:

set functions do not have a return value.

The set function only updates the state variable for the next render. If you read the state variable after calling the set function, you will still get the old value that was on the screen before your call.

If the new value you provide is identical to the current state, as determined by an Object.is comparison, React will skip re-rendering the component and its children. This is an optimization. Although in some cases React may still need to call your component before skipping the children, it shouldn’t affect your code.

React batches state updates. It updates the screen after all the event handlers have run and have called their set functions. This prevents multiple re-renders during a single event. In the rare case that you need to force React to update the screen earlier, for example to access the DOM, you can use flushSync.

The set function has a stable identity, so you will often see it omitted from Effect dependencies, but including it will not cause the Effect to fire. If the linter lets you omit a dependency without errors, it is safe to do. Learn more about removing Effect dependencies.

Calling the set function during rendering is only allowed from within the currently rendering component. React will discard its output and immediately attempt to render it again with the new state. This pattern is rarely needed, but you can use it to store information from the previous renders. See an example below.

In Strict Mode, React will call your updater function twice in order to help you find accidental impurities. This is development-only behavior and does not affect production. If your updater function is pure (as it should be), this should not affect the behavior. The result from one of the calls will be ignored.

Call useState at the top level of your component to declare one or more state variables.

The convention is to name state variables like [something, setSomething] using array destructuring.

useState returns an array with exactly two items:

To update what’s on the screen, call the set function with some next state:

React will store the next state, render your component again with the new values, and update the UI.

Calling the set function does not change the current state in the already executing code:

It only affects what useState will return starting from the next render.

In this example, the count state variable holds a number. Clicking the button increments it.

Suppose the age is 42. This handler calls setAge(age + 1) three times:

However, after one click, age will only be 43 rather than 45! This is because calling the set function does not update the age state variable in the already running code. So each setAge(age + 1) call becomes setAge(43).

To solve this problem, you may pass an updater function to setAge instead of the next state:

Here, a => a + 1 is your updater function. It takes the pending state and calculates the next state from it.

React puts your updater functions in a queue. Then, during the next render, it will call them in the same order:

There are no other queued updates, so React will store 45 as the current state in the end.

By convention, it’s common to name the pending state argument for the first letter of the state variable name, like a for age. However, you may also call it like prevAge or something else that you find clearer.

React may call your updaters twice in development to verify that they are pure.

You might hear a recommendation to always write code like setAge(a => a + 1) if the state you’re setting is calculated from the previous state. There is no harm in it, but it is also not always necessary.

In most cases, there is no difference between these two approaches. React always makes sure that for intentional user actions, like clicks, the age state variable would be updated before the next click. This means there is no risk of a click handler seeing a “stale” age at the beginning of the event handler.

However, if you do multiple updates within the same event, updaters can be helpful. They’re also helpful if accessing the state variable itself is inconvenient (you might run into this when optimizing re-renders).

If you prefer consistency over slightly more verbose syntax, it’s reasonable to always write an updater if the state you’re setting is calculated from the previous state. If it’s calculated from the previous state of some other state variable, you might want to combine them into one object and use a reducer.

This example passes the updater function, so the “+3” button works.

You can put objects and arrays into state. In React, state is considered read-only, so you should replace it rather than mutate your existing objects. For example, if you have a form object in state, don’t mutate it:

Instead, replace the whole object by creating a new one:

Read updating objects in state and updating arrays in state to learn more.

In this example, the form state variable holds an object. Each input has a change handler that calls setForm with the next state of the entire form. The { ...form } spread syntax ensures that the state object is replaced rather than mutated.

React saves the initial state once and ignores it on the next renders.

Although the result of createInitialTodos() is only used for the initial render, you’re still calling this function on every render. This can be wasteful if it’s creating large arrays or performing expensive calculations.

To solve this, you may pass it as an initializer function to useState instead:

Notice that you’re passing createInitialTodos, which is the function itself, and not createInitialTodos(), which is the result of calling it. If you pass a function to useState, React will only call it during initialization.

React may call your initializers twice in development to verify that they are pure.

This example passes the initializer function, so the createInitialTodos function only runs during initialization. It does not run when component re-renders, such as when you type into the input.

You’ll often encounter the key attribute when rendering lists. However, it also serves another purpose.

You can reset a component’s state by passing a different key to a component. In this example, the Reset button changes the version state variable, which we pass as a key to the Form. When the key changes, React re-creates the Form component (and all of its children) from scratch, so its state gets reset.

Read preserving and resetting state to learn more.

Usually, you will update state in event handlers. However, in rare cases you might want to adjust state in response to rendering — for example, you might want to change a state variable when a prop changes.

In most cases, you don’t need this:

In the rare case that none of these apply, there is a pattern you can use to update state based on the values that have been rendered so far, by calling a set function while your component is rendering.

Here’s an example. This CountLabel component displays the count prop passed to it:

Say you want to show whether the counter has increased or decreased since the last change. The count prop doesn’t tell you this — you need to keep track of its previous value. Add the prevCount state variable to track it. Add another state variable called trend to hold whether the count has increased or decreased. Compare prevCount with count, and if they’re not equal, update both prevCount and trend. Now you can show both the current count prop and how it has changed since the last render.

Note that if you call a set function while rendering, it must be inside a condition like prevCount !== count, and there must be a call like setPrevCount(count) inside of the condition. Otherwise, your component would re-render in a loop until it crashes. Also, you can only update the state of the currently rendering component like this. Calling the set function of another component during rendering is an error. Finally, your set call should still update state without mutation — this doesn’t mean you can break other rules of pure functions.

This pattern can be hard to understand and is usually best avoided. However, it’s better than updating state in an effect. When you call the set function during render, React will re-render that component immediately after your component exits with a return statement, and before rendering the children. This way, children don’t need to render twice. The rest of your component function will still execute (and the result will be thrown away). If your condition is below all the Hook calls, you may add an early return; to restart rendering earlier.

Calling the set function does not change state in the running code:

This is because states behaves like a snapshot. Updating state requests another render with the new state value, but does not affect the count JavaScript variable in your already-running event handler.

If you need to use the next state, you can save it in a variable before passing it to the set function:

React will ignore your update if the next state is equal to the previous state, as determined by an Object.is comparison. This usually happens when you change an object or an array in state directly:

You mutated an existing obj object and passed it back to setObj, so React ignored the update. To fix this, you need to ensure that you’re always replacing objects and arrays in state instead of mutating them:

You might get an error that says: Too many re-renders. React limits the number of renders to prevent an infinite loop. Typically, this means that you’re unconditionally setting state during render, so your component enters a loop: render, set state (which causes a render), render, set state (which causes a render), and so on. Very often, this is caused by a mistake in specifying an event handler:

If you can’t find the cause of this error, click on the arrow next to the error in the console and look through the JavaScript stack to find the specific set function call responsible for the error.

In Strict Mode, React will call some of your functions twice instead of once:

This is expected and shouldn’t break your code.

This development-only behavior helps you keep components pure. React uses the result of one of the calls, and ignores the result of the other call. As long as your component, initializer, and updater functions are pure, this shouldn’t affect your logic. However, if they are accidentally impure, this helps you notice the mistakes.

For example, this impure updater function mutates an array in state:

Because React calls your updater function twice, you’ll see the todo was added twice, so you’ll know that there is a mistake. In this example, you can fix the mistake by replacing the array instead of mutating it:

Now that this updater function is pure, calling it an extra time doesn’t make a difference in behavior. This is why React calling it twice helps you find mistakes. Only component, initializer, and updater functions need to be pure. Event handlers don’t need to be pure, so React will never call your event handlers twice.

Read keeping components pure to learn more.

You can’t put a function into state like this:

Because you’re passing a function, React assumes that someFunction is an initializer function, and that someOtherFunction is an updater function, so it tries to call them and store the result. To actually store a function, you have to put () => before them in both cases. Then React will store the functions you pass.

**Examples:**

Example 1 (jsx):
```jsx
const [state, setState] = useState(initialState)
```

Example 2 (javascript):
```javascript
import { useState } from 'react';function MyComponent() {  const [age, setAge] = useState(28);  const [name, setName] = useState('Taylor');  const [todos, setTodos] = useState(() => createTodos());  // ...
```

Example 3 (javascript):
```javascript
const [name, setName] = useState('Edward');function handleClick() {  setName('Taylor');  setAge(a => a + 1);  // ...
```

Example 4 (jsx):
```jsx
import { useState } from 'react';function MyComponent() {  const [age, setAge] = useState(42);  const [name, setName] = useState('Taylor');  // ...
```

---

## Built-in React DOM Hooks

**URL:** https://react.dev/reference/react-dom/hooks

**Contents:**
- Built-in React DOM Hooks
- Form Hooks

The react-dom package contains Hooks that are only supported for web applications (which run in the browser DOM environment). These Hooks are not supported in non-browser environments like iOS, Android, or Windows applications. If you are looking for Hooks that are supported in web browsers and other environments see the React Hooks page. This page lists all the Hooks in the react-dom package.

Forms let you create interactive controls for submitting information. To manage forms in your components, use one of these Hooks:

**Examples:**

Example 1 (jsx):
```jsx
function Form({ action }) {  async function increment(n) {    return n + 1;  }  const [count, incrementFormAction] = useActionState(increment, 0);  return (    <form action={action}>      <button formAction={incrementFormAction}>Count: {count}</button>      <Button />    </form>  );}function Button() {  const { pending } = useFormStatus();  return (    <button disabled={pending} type="submit">      Submit    </button>  );}
```

---

## useFormStatus

**URL:** https://react.dev/reference/react-dom/hooks/useFormStatus

**Contents:**
- useFormStatus
- Reference
  - useFormStatus()
    - Parameters
    - Returns
    - Caveats
- Usage
  - Display a pending state during form submission
  - Pitfall
      - useFormStatus will not return status information for a <form> rendered in the same component.

useFormStatus is a Hook that gives you status information of the last form submission.

The useFormStatus Hook provides status information of the last form submission.

To get status information, the Submit component must be rendered within a <form>. The Hook returns information like the pending property which tells you if the form is actively submitting.

In the above example, Submit uses this information to disable <button> presses while the form is submitting.

See more examples below.

useFormStatus does not take any parameters.

A status object with the following properties:

pending: A boolean. If true, this means the parent <form> is pending submission. Otherwise, false.

data: An object implementing the FormData interface that contains the data the parent <form> is submitting. If there is no active submission or no parent <form>, it will be null.

method: A string value of either 'get' or 'post'. This represents whether the parent <form> is submitting with either a GET or POST HTTP method. By default, a <form> will use the GET method and can be specified by the method property.

To display a pending state while a form is submitting, you can call the useFormStatus Hook in a component rendered in a <form> and read the pending property returned.

Here, we use the pending property to indicate the form is submitting.

The useFormStatus Hook only returns status information for a parent <form> and not for any <form> rendered in the same component calling the Hook, or child components.

Instead call useFormStatus from inside a component that is located inside <form>.

You can use the data property of the status information returned from useFormStatus to display what data is being submitted by the user.

Here, we have a form where users can request a username. We can use useFormStatus to display a temporary status message confirming what username they have requested.

useFormStatus will only return status information for a parent <form>.

If the component that calls useFormStatus is not nested in a <form>, status.pending will always return false. Verify useFormStatus is called in a component that is a child of a <form> element.

useFormStatus will not track the status of a <form> rendered in the same component. See Pitfall for more details.

**Examples:**

Example 1 (unknown):
```unknown
const { pending, data, method, action } = useFormStatus();
```

Example 2 (jsx):
```jsx
import { useFormStatus } from "react-dom";import action from './actions';function Submit() {  const status = useFormStatus();  return <button disabled={status.pending}>Submit</button>}export default function App() {  return (    <form action={action}>      <Submit />    </form>  );}
```

Example 3 (jsx):
```jsx
function Form() {  // 🚩 `pending` will never be true  // useFormStatus does not track the form rendered in this component  const { pending } = useFormStatus();  return <form action={submit}></form>;}
```

Example 4 (jsx):
```jsx
function Submit() {  // ✅ `pending` will be derived from the form that wraps the Submit component  const { pending } = useFormStatus();   return <button disabled={pending}>...</button>;}function Form() {  // This is the <form> `useFormStatus` tracks  return (    <form action={submit}>      <Submit />    </form>  );}
```

---

## eslint-plugin-react-hooks - This feature is available in the latest RC version

**URL:** https://react.dev/reference/eslint-plugin-react-hooks

**Contents:**
- eslint-plugin-react-hooks - This feature is available in the latest RC version
  - Note
- Recommended Rules

eslint-plugin-react-hooks provides ESLint rules to enforce the Rules of React.

This plugin helps you catch violations of React’s rules at build time, ensuring your components and hooks follow React’s rules for correctness and performance. The lints cover both fundamental React patterns (exhaustive-deps and rules-of-hooks) and issues flagged by React Compiler. React Compiler diagnostics are automatically surfaced by this ESLint plugin, and can be used even if your app hasn’t adopted the compiler yet.

When the compiler reports a diagnostic, it means that the compiler was able to statically detect a pattern that is not supported or breaks the Rules of React. When it detects this, it automatically skips over those components and hooks, while keeping the rest of your app compiled. This ensures optimal coverage of safe optimizations that won’t break your app.

What this means for linting, is that you don’t need to fix all violations immediately. Address them at your own pace to gradually increase the number of optimized components.

These rules are included in the recommended preset in eslint-plugin-react-hooks:

---

## exhaustive-deps

**URL:** https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps

**Contents:**
- exhaustive-deps
- Rule Details
- Common Violations
  - Invalid
  - Valid
- Troubleshooting
  - Adding a function dependency causes infinite loops
  - Running an effect only once
- Options

Validates that dependency arrays for React hooks contain all necessary dependencies.

React hooks like useEffect, useMemo, and useCallback accept dependency arrays. When a value referenced inside these hooks isn’t included in the dependency array, React won’t re-run the effect or recalculate the value when that dependency changes. This causes stale closures where the hook uses outdated values.

This error often happens when you try to “trick” React about dependencies to control when an effect runs. Effects should synchronize your component with external systems. The dependency array tells React which values the effect uses, so React knows when to re-synchronize.

If you find yourself fighting with the linter, you likely need to restructure your code. See Removing Effect Dependencies to learn how.

Examples of incorrect code for this rule:

Examples of correct code for this rule:

You have an effect, but you’re creating a new function on every render:

In most cases, you don’t need the effect. Call the function where the action happens instead:

If you genuinely need the effect (for example, to subscribe to something external), make the dependency stable:

You want to run an effect once on mount, but the linter complains about missing dependencies:

Either include the dependency (recommended) or use a ref if you truly need to run once:

You can configure custom effect hooks using shared ESLint settings (available in eslint-plugin-react-hooks 6.1.1 and later):

For backward compatibility, this rule also accepts a rule-level option:

**Examples:**

Example 1 (javascript):
```javascript
// ❌ Missing dependencyuseEffect(() => {  console.log(count);}, []); // Missing 'count'// ❌ Missing propuseEffect(() => {  fetchUser(userId);}, []); // Missing 'userId'// ❌ Incomplete dependenciesuseMemo(() => {  return items.sort(sortOrder);}, [items]); // Missing 'sortOrder'
```

Example 2 (javascript):
```javascript
// ✅ All dependencies includeduseEffect(() => {  console.log(count);}, [count]);// ✅ All dependencies includeduseEffect(() => {  fetchUser(userId);}, [userId]);
```

Example 3 (jsx):
```jsx
// ❌ Causes infinite loopconst logItems = () => {  console.log(items);};useEffect(() => {  logItems();}, [logItems]); // Infinite loop!
```

Example 4 (jsx):
```jsx
// ✅ Call it from the event handlerconst logItems = () => {  console.log(items);};return <button onClick={logItems}>Log</button>;// ✅ Or derive during render if there's no side effectitems.forEach(item => {  console.log(item);});
```

---

## rules-of-hooks

**URL:** https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks

**Contents:**
- rules-of-hooks
- Rule Details
- Common Violations
  - Note
  - use hook
  - Invalid
  - Valid
- Troubleshooting
  - I want to fetch data based on some condition
  - Note

Validates that components and hooks follow the Rules of Hooks.

React relies on the order in which hooks are called to correctly preserve state between renders. Each time your component renders, React expects the exact same hooks to be called in the exact same order. When hooks are called conditionally or in loops, React loses track of which state corresponds to which hook call, leading to bugs like state mismatches and “Rendered fewer/more hooks than expected” errors.

These patterns violate the Rules of Hooks:

The use hook is different from other React hooks. You can call it conditionally and in loops:

However, use still has restrictions:

Learn more: use API Reference

Examples of incorrect code for this rule:

Examples of correct code for this rule:

You’re trying to conditionally call useEffect:

Call the hook unconditionally, check condition inside:

There are better ways to fetch data rather than in a useEffect. Consider using TanStack Query, useSWR, or React Router 6.4+ for data fetching. These solutions handle deduplicating requests, caching responses, and avoiding network waterfalls.

Learn more: Fetching Data

You’re trying to conditionally initialize state:

Always call useState, conditionally set the initial value:

You can configure custom effect hooks using shared ESLint settings (available in eslint-plugin-react-hooks 6.1.1 and later):

This shared configuration is used by both rules-of-hooks and exhaustive-deps rules, ensuring consistent behavior across all hook-related linting.

**Examples:**

Example 1 (javascript):
```javascript
// ✅ `use` can be conditionalif (shouldFetch) {  const data = use(fetchPromise);}// ✅ `use` can be in loopsfor (const promise of promises) {  results.push(use(promise));}
```

Example 2 (jsx):
```jsx
// ❌ Hook in conditionif (isLoggedIn) {  const [user, setUser] = useState(null);}// ❌ Hook after early returnif (!data) return <Loading />;const [processed, setProcessed] = useState(data);// ❌ Hook in callback<button onClick={() => {  const [clicked, setClicked] = useState(false);}}/>// ❌ `use` in try/catchtry {  const data = use(promise);} catch (e) {  // error handling}// ❌ Hook at module levelconst globalState = useState(0); // Outside component
```

Example 3 (javascript):
```javascript
function Component({ isSpecial, shouldFetch, fetchPromise }) {  // ✅ Hooks at top level  const [count, setCount] = useState(0);  const [name, setName] = useState('');  if (!isSpecial) {    return null;  }  if (shouldFetch) {    // ✅ `use` can be conditional    const data = use(fetchPromise);    return <div>{data}</div>;  }  return <div>{name}: {count}</div>;}
```

Example 4 (jsx):
```jsx
// ❌ Conditional hookif (isLoggedIn) {  useEffect(() => {    fetchUserData();  }, []);}
```

---

## incompatible-library

**URL:** https://react.dev/reference/eslint-plugin-react-hooks/lints/incompatible-library

**Contents:**
- incompatible-library
  - Note
- Rule Details
      - Deep Dive
    - Designing APIs that follow the Rules of React
  - Invalid
  - Pitfall
    - MobX
  - Valid

Validates against usage of libraries which are incompatible with memoization (manual or automatic).

These libraries were designed before React’s memoization rules were fully documented. They made the correct choices at the time to optimize for ergonomic ways to keep components just the right amount of reactive as app state changes. While these legacy patterns worked, we have since discovered that it’s incompatible with React’s programming model. We will continue working with library authors to migrate these libraries to use patterns that follow the Rules of React.

Some libraries use patterns that aren’t supported by React. When the linter detects usages of these APIs from a known list, it flags them under this rule. This means that React Compiler can automatically skip over components that use these incompatible APIs, in order to avoid breaking your app.

React Compiler automatically memoizes values following the Rules of React. If something breaks with manual useMemo, it will also break the compiler’s automatic optimization. This rule helps identify these problematic patterns.

One question to think about when designing a library API or hook is whether calling the API can be safely memoized with useMemo. If it can’t, then both manual and React Compiler memoizations will break your user’s code.

For example, one such incompatible pattern is “interior mutability”. Interior mutability is when an object or function keeps its own hidden state that changes over time, even though the reference to it stays the same. Think of it like a box that looks the same on the outside but secretly rearranges its contents. React can’t tell anything changed because it only checks if you gave it a different box, not what’s inside. This breaks memoization, since React relies on the outer object (or function) changing if part of its value has changed.

As a rule of thumb, when designing React APIs, think about whether useMemo would break it:

Instead, design APIs that return immutable state and use explicit update functions:

Examples of incorrect code for this rule:

MobX patterns like observer also break memoization assumptions, but the linter does not yet detect them. If you rely on MobX and find that your app doesn’t work with React Compiler, you may need to use the "use no memo" directive.

Examples of correct code for this rule:

Some other libraries do not yet have alternative APIs that are compatible with React’s memoization model. If the linter doesn’t automatically skip over your components or hooks that call these APIs, please file an issue so we can add it to the linter.

**Examples:**

Example 1 (jsx):
```jsx
// Example of how memoization breaks with these librariesfunction Form() {  const { watch } = useForm();  // ❌ This value will never update, even when 'name' field changes  const name = useMemo(() => watch('name'), [watch]);  return <div>Name: {name}</div>; // UI appears "frozen"}
```

Example 2 (javascript):
```javascript
function Component() {  const { someFunction } = useLibrary();  // it should always be safe to memoize functions like this  const result = useMemo(() => someFunction(), [someFunction]);}
```

Example 3 (jsx):
```jsx
// ✅ Good: Return immutable state that changes reference when updatedfunction Component() {  const { field, updateField } = useLibrary();  // this is always safe to memo  const greeting = useMemo(() => `Hello, ${field.name}!`, [field.name]);  return (    <div>      <input        value={field.name}        onChange={(e) => updateField('name', e.target.value)}      />      <p>{greeting}</p>    </div>  );}
```

Example 4 (javascript):
```javascript
// ❌ react-hook-form `watch`function Component() {  const {watch} = useForm();  const value = watch('field'); // Interior mutability  return <div>{value}</div>;}// ❌ TanStack Table `useReactTable`function Component({data}) {  const table = useReactTable({    data,    columns,    getCoreRowModel: getCoreRowModel(),  });  // table instance uses interior mutability  return <Table table={table} />;}
```

---

## preserve-manual-memoization

**URL:** https://react.dev/reference/eslint-plugin-react-hooks/lints/preserve-manual-memoization

**Contents:**
- preserve-manual-memoization
- Rule Details
  - Invalid
  - Valid
- Troubleshooting
  - Should I remove my manual memoization?

Validates that existing manual memoization is preserved by the compiler. React Compiler will only compile components and hooks if its inference matches or exceeds the existing manual memoization.

React Compiler preserves your existing useMemo, useCallback, and React.memo calls. If you’ve manually memoized something, the compiler assumes you had a good reason and won’t remove it. However, incomplete dependencies prevent the compiler from understanding your code’s data flow and applying further optimizations.

Examples of incorrect code for this rule:

Examples of correct code for this rule:

You might wonder if React Compiler makes manual memoization unnecessary:

You can safely remove it if using React Compiler:

**Examples:**

Example 1 (jsx):
```jsx
// ❌ Missing dependencies in useMemofunction Component({ data, filter }) {  const filtered = useMemo(    () => data.filter(filter),    [data] // Missing 'filter' dependency  );  return <List items={filtered} />;}// ❌ Missing dependencies in useCallbackfunction Component({ onUpdate, value }) {  const handleClick = useCallback(() => {    onUpdate(value);  }, [onUpdate]); // Missing 'value'  return <button onClick={handleClick}>Update</button>;}
```

Example 2 (jsx):
```jsx
// ✅ Complete dependenciesfunction Component({ data, filter }) {  const filtered = useMemo(    () => data.filter(filter),    [data, filter] // All dependencies included  );  return <List items={filtered} />;}// ✅ Or let the compiler handle itfunction Component({ data, filter }) {  // No manual memoization needed  const filtered = data.filter(filter);  return <List items={filtered} />;}
```

Example 3 (jsx):
```jsx
// Do I still need this?function Component({items, sortBy}) {  const sorted = useMemo(() => {    return [...items].sort((a, b) => {      return a[sortBy] - b[sortBy];    });  }, [items, sortBy]);  return <List items={sorted} />;}
```

Example 4 (jsx):
```jsx
// ✅ Better: Let the compiler optimizefunction Component({items, sortBy}) {  const sorted = [...items].sort((a, b) => {    return a[sortBy] - b[sortBy];  });  return <List items={sorted} />;}
```

---

## purity

**URL:** https://react.dev/reference/eslint-plugin-react-hooks/lints/purity

**Contents:**
- purity
- Rule Details
- Common Violations
  - Invalid
  - Valid
- Troubleshooting
  - I need to show the current time

Validates that components/hooks are pure by checking that they do not call known-impure functions.

React components must be pure functions - given the same props, they should always return the same JSX. When components use functions like Math.random() or Date.now() during render, they produce different output each time, breaking React’s assumptions and causing bugs like hydration mismatches, incorrect memoization, and unpredictable behavior.

In general, any API that returns a different value for the same inputs violates this rule. Usual examples include:

Examples of incorrect code for this rule:

Examples of correct code for this rule:

Calling Date.now() during render makes your component impure:

Instead, move the impure function outside of render:

**Examples:**

Example 1 (jsx):
```jsx
// ❌ Math.random() in renderfunction Component() {  const id = Math.random(); // Different every render  return <div key={id}>Content</div>;}// ❌ Date.now() for valuesfunction Component() {  const timestamp = Date.now(); // Changes every render  return <div>Created at: {timestamp}</div>;}
```

Example 2 (jsx):
```jsx
// ✅ Stable IDs from initial statefunction Component() {  const [id] = useState(() => crypto.randomUUID());  return <div key={id}>Content</div>;}
```

Example 3 (typescript):
```typescript
// ❌ Wrong: Time changes every renderfunction Clock() {  return <div>Current time: {Date.now()}</div>;}
```

Example 4 (jsx):
```jsx
function Clock() {  const [time, setTime] = useState(() => Date.now());  useEffect(() => {    const interval = setInterval(() => {      setTime(Date.now());    }, 1000);    return () => clearInterval(interval);  }, []);  return <div>Current time: {time}</div>;}
```

---

## refs

**URL:** https://react.dev/reference/eslint-plugin-react-hooks/lints/refs

**Contents:**
- refs
- Rule Details
- How It Detects Refs
- Common Violations
  - Invalid
  - Valid
- Troubleshooting
  - The lint flagged my plain object with .current

Validates correct usage of refs, not reading/writing during render. See the “pitfalls” section in useRef() usage.

Refs hold values that aren’t used for rendering. Unlike state, changing a ref doesn’t trigger a re-render. Reading or writing ref.current during render breaks React’s expectations. Refs might not be initialized when you try to read them, and their values can be stale or inconsistent.

The lint only applies these rules to values it knows are refs. A value is inferred as a ref when the compiler sees any of the following patterns:

Returned from useRef() or React.createRef().

An identifier named ref or ending in Ref that reads from or writes to .current.

Passed through a JSX ref prop (for example <div ref={someRef} />).

Once something is marked as a ref, that inference follows the value through assignments, destructuring, or helper calls. This lets the lint surface violations even when ref.current is accessed inside another function that received the ref as an argument.

Examples of incorrect code for this rule:

Examples of correct code for this rule:

The name heuristic intentionally treats ref.current and fooRef.current as real refs. If you’re modeling a custom container object, pick a different name (for example, box) or move the mutable value into state. Renaming avoids the lint because the compiler stops inferring it as a ref.

**Examples:**

Example 1 (jsx):
```jsx
const scrollRef = useRef(null);
```

Example 2 (unknown):
```unknown
buttonRef.current = node;
```

Example 3 (jsx):
```jsx
<input ref={inputRef} />
```

Example 4 (jsx):
```jsx
// ❌ Reading ref during renderfunction Component() {  const ref = useRef(0);  const value = ref.current; // Don't read during render  return <div>{value}</div>;}// ❌ Modifying ref during renderfunction Component({value}) {  const ref = useRef(null);  ref.current = value; // Don't modify during render  return <div />;}
```

---

## set-state-in-effect

**URL:** https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-effect

**Contents:**
- set-state-in-effect
- Rule Details
- Common Violations
  - Invalid
  - Valid

Validates against calling setState synchronously in an effect, which can lead to re-renders that degrade performance.

Setting state immediately inside an effect forces React to restart the entire render cycle. When you update state in an effect, React must re-render your component, apply changes to the DOM, and then run effects again. This creates an extra render pass that could have been avoided by transforming data directly during render or deriving state from props. Transform data at the top level of your component instead. This code will naturally re-run when props or state change without triggering additional render cycles.

Synchronous setState calls in effects trigger immediate re-renders before the browser can paint, causing performance issues and visual jank. React has to render twice: once to apply the state update, then again after effects run. This double rendering is wasteful when the same result could be achieved with a single render.

In many cases, you may also not need an effect at all. Please see You Might Not Need an Effect for more information.

This rule catches several patterns where synchronous setState is used unnecessarily:

Examples of incorrect code for this rule:

Examples of correct code for this rule:

When something can be calculated from the existing props or state, don’t put it in state. Instead, calculate it during rendering. This makes your code faster, simpler, and less error-prone. Learn more in You Might Not Need an Effect.

**Examples:**

Example 1 (jsx):
```jsx
// ❌ Synchronous setState in effectfunction Component({data}) {  const [items, setItems] = useState([]);  useEffect(() => {    setItems(data); // Extra render, use initial state instead  }, [data]);}// ❌ Setting loading state synchronouslyfunction Component() {  const [loading, setLoading] = useState(false);  useEffect(() => {    setLoading(true); // Synchronous, causes extra render    fetchData().then(() => setLoading(false));  }, []);}// ❌ Transforming data in effectfunction Component({rawData}) {  const [processed, setProcessed] = useState([]);  useEffect(() => {    setProcessed(rawData.map(transform)); // Should derive in render  }, [rawData]);}// ❌ Deriving state from propsfunction Component({selectedId, items}) {  const [selected, setSelected] = useState(null);  useEffect(() => {    setSelected(items.find(i => i.id === selectedId));  }, [selectedId, items]);}
```

Example 2 (jsx):
```jsx
// ✅ setState in an effect is fine if the value comes from a reffunction Tooltip() {  const ref = useRef(null);  const [tooltipHeight, setTooltipHeight] = useState(0);  useLayoutEffect(() => {    const { height } = ref.current.getBoundingClientRect();    setTooltipHeight(height);  }, []);}// ✅ Calculate during renderfunction Component({selectedId, items}) {  const selected = items.find(i => i.id === selectedId);  return <div>{selected?.name}</div>;}
```

---

## set-state-in-render

**URL:** https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-render

**Contents:**
- set-state-in-render
- Rule Details
- Common Violations
  - Invalid
  - Valid
- Troubleshooting
  - I want to sync state to a prop

Validates against unconditionally setting state during render, which can trigger additional renders and potential infinite render loops.

Calling setState during render unconditionally triggers another render before the current one finishes. This creates an infinite loop that crashes your app.

A common problem is trying to “fix” state after it renders. Suppose you want to keep a counter from exceeding a max prop:

As soon as count exceeds max, an infinite loop is triggered.

Instead, it’s often better to move this logic to the event (the place where the state is first set). For example, you can enforce the maximum at the moment you update state:

Now the setter only runs in response to the click, React finishes the render normally, and count never crosses max.

In rare cases, you may need to adjust state based on information from previous renders. For those, follow this pattern of setting state conditionally.

**Examples:**

Example 1 (jsx):
```jsx
// ❌ Unconditional setState directly in renderfunction Component({value}) {  const [count, setCount] = useState(0);  setCount(value); // Infinite loop!  return <div>{count}</div>;}
```

Example 2 (jsx):
```jsx
// ✅ Derive during renderfunction Component({items}) {  const sorted = [...items].sort(); // Just calculate it in render  return <ul>{sorted.map(/*...*/)}</ul>;}// ✅ Set state in event handlerfunction Component() {  const [count, setCount] = useState(0);  return (    <button onClick={() => setCount(count + 1)}>      {count}    </button>  );}// ✅ Derive from props instead of setting statefunction Component({user}) {  const name = user?.name || '';  const email = user?.email || '';  return <div>{name}</div>;}// ✅ Conditionally derive state from props and state from previous rendersfunction Component({ items }) {  const [isReverse, setIsReverse] = useState(false);  const [selection, setSelection] = useState(null);  const [prevItems, setPrevItems] = useState(items);  if (items !== prevItems) { // This condition makes it valid    setPrevItems(items);    setSelection(null);  }  // ...}
```

Example 3 (jsx):
```jsx
// ❌ Wrong: clamps during renderfunction Counter({max}) {  const [count, setCount] = useState(0);  if (count > max) {    setCount(max);  }  return (    <button onClick={() => setCount(count + 1)}>      {count}    </button>  );}
```

Example 4 (jsx):
```jsx
// ✅ Clamp when updatingfunction Counter({max}) {  const [count, setCount] = useState(0);  const increment = () => {    setCount(current => Math.min(current + 1, max));  };  return <button onClick={increment}>{count}</button>;}
```

---

## static-components

**URL:** https://react.dev/reference/eslint-plugin-react-hooks/lints/static-components

**Contents:**
- static-components
- Rule Details
  - Invalid
  - Valid
- Troubleshooting
  - I need to render different components conditionally
  - Note

Validates that components are static, not recreated every render. Components that are recreated dynamically can reset state and trigger excessive re-rendering.

Components defined inside other components are recreated on every render. React sees each as a brand new component type, unmounting the old one and mounting the new one, destroying all state and DOM nodes in the process.

Examples of incorrect code for this rule:

Examples of correct code for this rule:

You might define components inside to access local state:

Pass data as props instead:

If you find yourself wanting to define components inside other components to access local variables, that’s a sign you should be passing props instead. This makes components more reusable and testable.

**Examples:**

Example 1 (jsx):
```jsx
// ❌ Component defined inside componentfunction Parent() {  const ChildComponent = () => { // New component every render!    const [count, setCount] = useState(0);    return <button onClick={() => setCount(count + 1)}>{count}</button>;  };  return <ChildComponent />; // State resets every render}// ❌ Dynamic component creationfunction Parent({type}) {  const Component = type === 'button'    ? () => <button>Click</button>    : () => <div>Text</div>;  return <Component />;}
```

Example 2 (jsx):
```jsx
// ✅ Components at module levelconst ButtonComponent = () => <button>Click</button>;const TextComponent = () => <div>Text</div>;function Parent({type}) {  const Component = type === 'button'    ? ButtonComponent  // Reference existing component    : TextComponent;  return <Component />;}
```

Example 3 (jsx):
```jsx
// ❌ Wrong: Inner component to access parent statefunction Parent() {  const [theme, setTheme] = useState('light');  function ThemedButton() { // Recreated every render!    return (      <button className={theme}>        Click me      </button>    );  }  return <ThemedButton />;}
```

Example 4 (jsx):
```jsx
// ✅ Better: Pass props to static componentfunction ThemedButton({theme}) {  return (    <button className={theme}>      Click me    </button>  );}function Parent() {  const [theme, setTheme] = useState('light');  return <ThemedButton theme={theme} />;}
```

---

## unsupported-syntax

**URL:** https://react.dev/reference/eslint-plugin-react-hooks/lints/unsupported-syntax

**Contents:**
- unsupported-syntax
- Rule Details
  - Invalid
  - Valid
- Troubleshooting
  - I need to evaluate dynamic code
  - Note

Validates against syntax that React Compiler does not support. If you need to, you can still use this syntax outside of React, such as in a standalone utility function.

React Compiler needs to statically analyze your code to apply optimizations. Features like eval and with make it impossible to statically understand what the code does at compile time, so the compiler can’t optimize components that use them.

Examples of incorrect code for this rule:

Examples of correct code for this rule:

You might need to evaluate user-provided code:

Use a safe expression parser instead:

Never use eval with user input - it’s a security risk. Use dedicated parsing libraries for specific use cases like mathematical expressions, JSON parsing, or template evaluation.

**Examples:**

Example 1 (typescript):
```typescript
// ❌ Using eval in componentfunction Component({ code }) {  const result = eval(code); // Can't be analyzed  return <div>{result}</div>;}// ❌ Using with statementfunction Component() {  with (Math) { // Changes scope dynamically    return <div>{sin(PI / 2)}</div>;  }}// ❌ Dynamic property access with evalfunction Component({propName}) {  const value = eval(`props.${propName}`);  return <div>{value}</div>;}
```

Example 2 (typescript):
```typescript
// ✅ Use normal property accessfunction Component({propName, props}) {  const value = props[propName]; // Analyzable  return <div>{value}</div>;}// ✅ Use standard Math methodsfunction Component() {  return <div>{Math.sin(Math.PI / 2)}</div>;}
```

Example 3 (typescript):
```typescript
// ❌ Wrong: eval in componentfunction Calculator({expression}) {  const result = eval(expression); // Unsafe and unoptimizable  return <div>Result: {result}</div>;}
```

Example 4 (jsx):
```jsx
// ✅ Better: Use a safe parserimport {evaluate} from 'mathjs'; // or similar libraryfunction Calculator({expression}) {  const [result, setResult] = useState(null);  const calculate = () => {    try {      // Safe mathematical expression evaluation      setResult(evaluate(expression));    } catch (error) {      setResult('Invalid expression');    }  };  return (    <div>      <button onClick={calculate}>Calculate</button>      {result && <div>Result: {result}</div>}    </div>  );}
```

---

## use-memo

**URL:** https://react.dev/reference/eslint-plugin-react-hooks/lints/use-memo

**Contents:**
- use-memo
- Rule Details
  - Invalid
  - Valid
- Troubleshooting
  - I need to run side effects when dependencies change

Validates that the useMemo hook is used with a return value. See useMemo docs for more information.

useMemo is for computing and caching expensive values, not for side effects. Without a return value, useMemo returns undefined, which defeats its purpose and likely indicates you’re using the wrong hook.

Examples of incorrect code for this rule:

Examples of correct code for this rule:

You might try to use useMemo for side effects:

If the side effect needs to happen in response to user interaction, it’s best to colocate the side effect with the event:

If the side effect sychronizes React state with some external state (or vice versa), use useEffect:

**Examples:**

Example 1 (javascript):
```javascript
// ❌ No return valuefunction Component({ data }) {  const processed = useMemo(() => {    data.forEach(item => console.log(item));    // Missing return!  }, [data]);  return <div>{processed}</div>; // Always undefined}
```

Example 2 (jsx):
```jsx
// ✅ Returns computed valuefunction Component({ data }) {  const processed = useMemo(() => {    return data.map(item => item * 2);  }, [data]);  return <div>{processed}</div>;}
```

Example 3 (jsx):
```jsx
// ❌ Wrong: Side effects in useMemofunction Component({user}) {  // No return value, just side effect  useMemo(() => {    analytics.track('UserViewed', {userId: user.id});  }, [user.id]);  // Not assigned to a variable  useMemo(() => {    return analytics.track('UserViewed', {userId: user.id});  }, [user.id]);}
```

Example 4 (jsx):
```jsx
// ✅ Good: Side effects in event handlersfunction Component({user}) {  const handleClick = () => {    analytics.track('ButtonClicked', {userId: user.id});    // Other click logic...  };  return <button onClick={handleClick}>Click me</button>;}
```

---

## Components and Hooks must be pure

**URL:** https://react.dev/reference/rules/components-and-hooks-must-be-pure

**Contents:**
- Components and Hooks must be pure
  - Note
  - Why does purity matter?
    - How does React run your code?
      - Deep Dive
    - How to tell if code runs in render
- Components and Hooks must be idempotent
- Side effects must run outside of render
  - Note
  - When is it okay to have mutation?

Pure functions only perform a calculation and nothing more. It makes your code easier to understand, debug, and allows React to automatically optimize your components and Hooks correctly.

This reference page covers advanced topics and requires familiarity with the concepts covered in the Keeping Components Pure page.

One of the key concepts that makes React, React is purity. A pure component or hook is one that is:

When render is kept pure, React can understand how to prioritize which updates are most important for the user to see first. This is made possible because of render purity: since components don’t have side effects in render, React can pause rendering components that aren’t as important to update, and only come back to them later when it’s needed.

Concretely, this means that rendering logic can be run multiple times in a way that allows React to give your user a pleasant user experience. However, if your component has an untracked side effect – like modifying the value of a global variable during render – when React runs your rendering code again, your side effects will be triggered in a way that won’t match what you want. This often leads to unexpected bugs that can degrade how your users experience your app. You can see an example of this in the Keeping Components Pure page.

React is declarative: you tell React what to render, and React will figure out how best to display it to your user. To do this, React has a few phases where it runs your code. You don’t need to know about all of these phases to use React well. But at a high level, you should know about what code runs in render, and what runs outside of it.

Rendering refers to calculating what the next version of your UI should look like. After rendering, Effects are flushed (meaning they are run until there are no more left) and may update the calculation if the Effects have impacts on layout. React takes this new calculation and compares it to the calculation used to create the previous version of your UI, then commits just the minimum changes needed to the DOM (what your user actually sees) to catch it up to the latest version.

One quick heuristic to tell if code runs during render is to examine where it is: if it’s written at the top level like in the example below, there’s a good chance it runs during render.

Event handlers and Effects don’t run in render:

Components must always return the same output with respect to their inputs – props, state, and context. This is known as idempotency. Idempotency is a term popularized in functional programming. It refers to the idea that you always get the same result every time you run that piece of code with the same inputs.

This means that all code that runs during render must also be idempotent in order for this rule to hold. For example, this line of code is not idempotent (and therefore, neither is the component):

new Date() is not idempotent as it always returns the current date and changes its result every time it’s called. When you render the above component, the time displayed on the screen will stay stuck on the time that the component was rendered. Similarly, functions like Math.random() also aren’t idempotent, because they return different results every time they’re called, even when the inputs are the same.

This doesn’t mean you shouldn’t use non-idempotent functions like new Date() at all – you should just avoid using them during render. In this case, we can synchronize the latest date to this component using an Effect:

By wrapping the non-idempotent new Date() call in an Effect, it moves that calculation outside of rendering.

If you don’t need to synchronize some external state with React, you can also consider using an event handler if it only needs to be updated in response to a user interaction.

Side effects should not run in render, as React can render components multiple times to create the best possible user experience.

Side effects are a broader term than Effects. Effects specifically refer to code that’s wrapped in useEffect, while a side effect is a general term for code that has any observable effect other than its primary result of returning a value to the caller.

Side effects are typically written inside of event handlers or Effects. But never during render.

While render must be kept pure, side effects are necessary at some point in order for your app to do anything interesting, like showing something on the screen! The key point of this rule is that side effects should not run in render, as React can render components multiple times. In most cases, you’ll use event handlers to handle side effects. Using an event handler explicitly tells React that this code doesn’t need to run during render, keeping render pure. If you’ve exhausted all options – and only as a last resort – you can also handle side effects using useEffect.

One common example of a side effect is mutation, which in JavaScript refers to changing the value of a non-primitive value. In general, while mutation is not idiomatic in React, local mutation is absolutely fine:

There is no need to contort your code to avoid local mutation. Array.map could also be used here for brevity, but there is nothing wrong with creating a local array and then pushing items into it during render.

Even though it looks like we are mutating items, the key point to note is that this code only does so locally – the mutation isn’t “remembered” when the component is rendered again. In other words, items only stays around as long as the component does. Because items is always recreated every time <FriendList /> is rendered, the component will always return the same result.

On the other hand, if items was created outside of the component, it holds on to its previous values and remembers changes:

When <FriendList /> runs again, we will continue appending friends to items every time that component is run, leading to multiple duplicated results. This version of <FriendList /> has observable side effects during render and breaks the rule.

Lazy initialization is also fine despite not being fully “pure”:

Side effects that are directly visible to the user are not allowed in the render logic of React components. In other words, merely calling a component function shouldn’t by itself produce a change on the screen.

One way to achieve the desired result of updating document.title outside of render is to synchronize the component with document.

As long as calling a component multiple times is safe and doesn’t affect the rendering of other components, React doesn’t care if it’s 100% pure in the strict functional programming sense of the word. It is more important that components must be idempotent.

A component’s props and state are immutable snapshots. Never mutate them directly. Instead, pass new props down, and use the setter function from useState.

You can think of the props and state values as snapshots that are updated after rendering. For this reason, you don’t modify the props or state variables directly: instead you pass new props, or use the setter function provided to you to tell React that state needs to update the next time the component is rendered.

Props are immutable because if you mutate them, the application will produce inconsistent output, which can be hard to debug as it may or may not work depending on the circumstances.

useState returns the state variable and a setter to update that state.

Rather than updating the state variable in-place, we need to update it using the setter function that is returned by useState. Changing values on the state variable doesn’t cause the component to update, leaving your users with an outdated UI. Using the setter function informs React that the state has changed, and that we need to queue a re-render to update the UI.

Once values are passed to a hook, you should not modify them. Like props in JSX, values become immutable when passed to a hook.

One important principle in React is local reasoning: the ability to understand what a component or hook does by looking at its code in isolation. Hooks should be treated like “black boxes” when they are called. For example, a custom hook might have used its arguments as dependencies to memoize values inside it:

If you were to mutate the Hook’s arguments, the custom hook’s memoization will become incorrect, so it’s important to avoid doing that.

Similarly, it’s important to not modify the return values of Hooks, as they may have been memoized.

Don’t mutate values after they’ve been used in JSX. Move the mutation to before the JSX is created.

When you use JSX in an expression, React may eagerly evaluate the JSX before the component finishes rendering. This means that mutating values after they’ve been passed to JSX can lead to outdated UIs, as React won’t know to update the component’s output.

**Examples:**

Example 1 (javascript):
```javascript
function Dropdown() {  const selectedItems = new Set(); // created during render  // ...}
```

Example 2 (javascript):
```javascript
function Dropdown() {  const selectedItems = new Set();  const onSelect = (item) => {    // this code is in an event handler, so it's only run when the user triggers this    selectedItems.add(item);  }}
```

Example 3 (javascript):
```javascript
function Dropdown() {  const selectedItems = new Set();  useEffect(() => {    // this code is inside of an Effect, so it only runs after rendering    logForAnalytics(selectedItems);  }, [selectedItems]);}
```

Example 4 (javascript):
```javascript
function Clock() {  const time = new Date(); // 🔴 Bad: always returns a different result!  return <span>{time.toLocaleString()}</span>}
```

---

## React calls Components and Hooks

**URL:** https://react.dev/reference/rules/react-calls-components-and-hooks

**Contents:**
- React calls Components and Hooks
- Never call component functions directly
- Never pass around Hooks as regular values
  - Don’t dynamically mutate a Hook
  - Don’t dynamically use Hooks

React is responsible for rendering components and Hooks when necessary to optimize the user experience. It is declarative: you tell React what to render in your component’s logic, and React will figure out how best to display it to your user.

Components should only be used in JSX. Don’t call them as regular functions. React should call it.

React must decide when your component function is called during rendering. In React, you do this using JSX.

If a component contains Hooks, it’s easy to violate the Rules of Hooks when components are called directly in a loop or conditionally.

Letting React orchestrate rendering also allows a number of benefits:

Hooks should only be called inside of components or Hooks. Never pass it around as a regular value.

Hooks allow you to augment a component with React features. They should always be called as a function, and never passed around as a regular value. This enables local reasoning, or the ability for developers to understand everything a component can do by looking at that component in isolation.

Breaking this rule will cause React to not automatically optimize your component.

Hooks should be as “static” as possible. This means you shouldn’t dynamically mutate them. For example, this means you shouldn’t write higher order Hooks:

Hooks should be immutable and not be mutated. Instead of mutating a Hook dynamically, create a static version of the Hook with the desired functionality.

Hooks should also not be dynamically used: for example, instead of doing dependency injection in a component by passing a Hook as a value:

You should always inline the call of the Hook into that component and handle any logic in there.

This way, <Button /> is much easier to understand and debug. When Hooks are used in dynamic ways, it increases the complexity of your app greatly and inhibits local reasoning, making your team less productive in the long term. It also makes it easier to accidentally break the Rules of Hooks that Hooks should not be called conditionally. If you find yourself needing to mock components for tests, it’s better to mock the server instead to respond with canned data. If possible, it’s also usually more effective to test your app with end-to-end tests.

**Examples:**

Example 1 (jsx):
```jsx
function BlogPost() {  return <Layout><Article /></Layout>; // ✅ Good: Only use components in JSX}
```

Example 2 (javascript):
```javascript
function BlogPost() {  return <Layout>{Article()}</Layout>; // 🔴 Bad: Never call them directly}
```

Example 3 (javascript):
```javascript
function ChatInput() {  const useDataWithLogging = withLogging(useData); // 🔴 Bad: don't write higher order Hooks  const data = useDataWithLogging();}
```

Example 4 (javascript):
```javascript
function ChatInput() {  const data = useDataWithLogging(); // ✅ Good: Create a new version of the Hook}function useDataWithLogging() {  // ... Create a new version of the Hook and inline the logic here}
```

---

## Rules of Hooks

**URL:** https://react.dev/reference/rules/rules-of-hooks

**Contents:**
- Rules of Hooks
- Only call Hooks at the top level
  - Note
- Only call Hooks from React functions

Hooks are defined using JavaScript functions, but they represent a special type of reusable UI logic with restrictions on where they can be called.

Functions whose names start with use are called Hooks in React.

Don’t call Hooks inside loops, conditions, nested functions, or try/catch/finally blocks. Instead, always use Hooks at the top level of your React function, before any early returns. You can only call Hooks while React is rendering a function component:

It’s not supported to call Hooks (functions starting with use) in any other cases, for example:

If you break these rules, you might see this error.

You can use the eslint-plugin-react-hooks plugin to catch these mistakes.

Custom Hooks may call other Hooks (that’s their whole purpose). This works because custom Hooks are also supposed to only be called while a function component is rendering.

Don’t call Hooks from regular JavaScript functions. Instead, you can:

✅ Call Hooks from React function components. ✅ Call Hooks from custom Hooks.

By following this rule, you ensure that all stateful logic in a component is clearly visible from its source code.

**Examples:**

Example 1 (jsx):
```jsx
function Counter() {  // ✅ Good: top-level in a function component  const [count, setCount] = useState(0);  // ...}function useWindowWidth() {  // ✅ Good: top-level in a custom Hook  const [width, setWidth] = useState(window.innerWidth);  // ...}
```

Example 2 (jsx):
```jsx
function Bad({ cond }) {  if (cond) {    // 🔴 Bad: inside a condition (to fix, move it outside!)    const theme = useContext(ThemeContext);  }  // ...}function Bad() {  for (let i = 0; i < 10; i++) {    // 🔴 Bad: inside a loop (to fix, move it outside!)    const theme = useContext(ThemeContext);  }  // ...}function Bad({ cond }) {  if (cond) {    return;  }  // 🔴 Bad: after a conditional return (to fix, move it before the return!)  const theme = useContext(ThemeContext);  // ...}function Bad() {  function handleClick() {    // 🔴 Bad: inside an event handler (to fix, move it outside!)    const theme = useContext(ThemeContext);  }  // ...}function Bad() {  const style = useMemo(() => {    // 🔴 Bad: inside useMemo (to fix, move it outside!)    const theme = useContext(ThemeContext);    return createStyle(theme);  });  // ...}class Bad extends React.Component {  render() {    // 🔴 Bad: inside a class component (to fix, write a function component instead of a class!)    useEffect(() => {})    // ...  }}function Bad() {  try {    // 🔴 Bad: inside try/catch/finally block (to fix, move it outside!)    const [x, setX] = useState(0);  } catch {    const [x, setX] = useState(1);  }}
```

Example 3 (javascript):
```javascript
function FriendList() {  const [onlineStatus, setOnlineStatus] = useOnlineStatus(); // ✅}function setOnlineStatus() { // ❌ Not a component or custom Hook!  const [onlineStatus, setOnlineStatus] = useOnlineStatus();}
```

---

## React Compiler

**URL:** https://react.dev/learn/react-compiler

**Contents:**
- React Compiler
- Introduction
- Installation
- Incremental Adoption
- Debugging and Troubleshooting
- Configuration and Reference
- Additional resources

Learn what React Compiler does and how it automatically optimizes your React application by handling memoization for you, eliminating the need for manual useMemo, useCallback, and React.memo.

Get started with installing React Compiler and learn how to configure it with your build tools.

Learn strategies for gradually adopting React Compiler in your existing codebase if you’re not ready to enable it everywhere yet.

When things don’t work as expected, use our debugging guide to understand the difference between compiler errors and runtime issues, identify common breaking patterns, and follow a systematic debugging workflow.

For detailed configuration options and API reference:

In addition to these docs, we recommend checking the React Compiler Working Group for additional information and discussion about the compiler.

---

## Reusing Logic with Custom Hooks

**URL:** https://react.dev/learn/reusing-logic-with-custom-hooks

**Contents:**
- Reusing Logic with Custom Hooks
  - You will learn
- Custom Hooks: Sharing logic between components
  - Extracting your own custom Hook from a component
  - Hook names always start with use
  - Note
      - Deep Dive
    - Should all functions called during rendering start with the use prefix?
  - Custom Hooks let you share stateful logic, not state itself
- Passing reactive values between Hooks

React comes with several built-in Hooks like useState, useContext, and useEffect. Sometimes, you’ll wish that there was a Hook for some more specific purpose: for example, to fetch data, to keep track of whether the user is online, or to connect to a chat room. You might not find these Hooks in React, but you can create your own Hooks for your application’s needs.

Imagine you’re developing an app that heavily relies on the network (as most apps do). You want to warn the user if their network connection has accidentally gone off while they were using your app. How would you go about it? It seems like you’ll need two things in your component:

This will keep your component synchronized with the network status. You might start with something like this:

Try turning your network on and off, and notice how this StatusBar updates in response to your actions.

Now imagine you also want to use the same logic in a different component. You want to implement a Save button that will become disabled and show “Reconnecting…” instead of “Save” while the network is off.

To start, you can copy and paste the isOnline state and the Effect into SaveButton:

Verify that, if you turn off the network, the button will change its appearance.

These two components work fine, but the duplication in logic between them is unfortunate. It seems like even though they have different visual appearance, you want to reuse the logic between them.

Imagine for a moment that, similar to useState and useEffect, there was a built-in useOnlineStatus Hook. Then both of these components could be simplified and you could remove the duplication between them:

Although there is no such built-in Hook, you can write it yourself. Declare a function called useOnlineStatus and move all the duplicated code into it from the components you wrote earlier:

At the end of the function, return isOnline. This lets your components read that value:

Verify that switching the network on and off updates both components.

Now your components don’t have as much repetitive logic. More importantly, the code inside them describes what they want to do (use the online status!) rather than how to do it (by subscribing to the browser events).

When you extract logic into custom Hooks, you can hide the gnarly details of how you deal with some external system or a browser API. The code of your components expresses your intent, not the implementation.

React applications are built from components. Components are built from Hooks, whether built-in or custom. You’ll likely often use custom Hooks created by others, but occasionally you might write one yourself!

You must follow these naming conventions:

This convention guarantees that you can always look at a component and know where its state, Effects, and other React features might “hide”. For example, if you see a getColor() function call inside your component, you can be sure that it can’t possibly contain React state inside because its name doesn’t start with use. However, a function call like useOnlineStatus() will most likely contain calls to other Hooks inside!

If your linter is configured for React, it will enforce this naming convention. Scroll up to the sandbox above and rename useOnlineStatus to getOnlineStatus. Notice that the linter won’t allow you to call useState or useEffect inside of it anymore. Only Hooks and components can call other Hooks!

No. Functions that don’t call Hooks don’t need to be Hooks.

If your function doesn’t call any Hooks, avoid the use prefix. Instead, write it as a regular function without the use prefix. For example, useSorted below doesn’t call Hooks, so call it getSorted instead:

This ensures that your code can call this regular function anywhere, including conditions:

You should give use prefix to a function (and thus make it a Hook) if it uses at least one Hook inside of it:

Technically, this isn’t enforced by React. In principle, you could make a Hook that doesn’t call other Hooks. This is often confusing and limiting so it’s best to avoid that pattern. However, there may be rare cases where it is helpful. For example, maybe your function doesn’t use any Hooks right now, but you plan to add some Hook calls to it in the future. Then it makes sense to name it with the use prefix:

Then components won’t be able to call it conditionally. This will become important when you actually add Hook calls inside. If you don’t plan to use Hooks inside it (now or later), don’t make it a Hook.

In the earlier example, when you turned the network on and off, both components updated together. However, it’s wrong to think that a single isOnline state variable is shared between them. Look at this code:

It works the same way as before you extracted the duplication:

These are two completely independent state variables and Effects! They happened to have the same value at the same time because you synchronized them with the same external value (whether the network is on).

To better illustrate this, we’ll need a different example. Consider this Form component:

There’s some repetitive logic for each form field:

You can extract the repetitive logic into this useFormInput custom Hook:

Notice that it only declares one state variable called value.

However, the Form component calls useFormInput two times:

This is why it works like declaring two separate state variables!

Custom Hooks let you share stateful logic but not state itself. Each call to a Hook is completely independent from every other call to the same Hook. This is why the two sandboxes above are completely equivalent. If you’d like, scroll back up and compare them. The behavior before and after extracting a custom Hook is identical.

When you need to share the state itself between multiple components, lift it up and pass it down instead.

The code inside your custom Hooks will re-run during every re-render of your component. This is why, like components, custom Hooks need to be pure. Think of custom Hooks’ code as part of your component’s body!

Because custom Hooks re-render together with your component, they always receive the latest props and state. To see what this means, consider this chat room example. Change the server URL or the chat room:

When you change serverUrl or roomId, the Effect “reacts” to your changes and re-synchronizes. You can tell by the console messages that the chat re-connects every time that you change your Effect’s dependencies.

Now move the Effect’s code into a custom Hook:

This lets your ChatRoom component call your custom Hook without worrying about how it works inside:

This looks much simpler! (But it does the same thing.)

Notice that the logic still responds to prop and state changes. Try editing the server URL or the selected room:

Notice how you’re taking the return value of one Hook:

and passing it as an input to another Hook:

Every time your ChatRoom component re-renders, it passes the latest roomId and serverUrl to your Hook. This is why your Effect re-connects to the chat whenever their values are different after a re-render. (If you ever worked with audio or video processing software, chaining Hooks like this might remind you of chaining visual or audio effects. It’s as if the output of useState “feeds into” the input of the useChatRoom.)

As you start using useChatRoom in more components, you might want to let components customize its behavior. For example, currently, the logic for what to do when a message arrives is hardcoded inside the Hook:

Let’s say you want to move this logic back to your component:

To make this work, change your custom Hook to take onReceiveMessage as one of its named options:

This will work, but there’s one more improvement you can do when your custom Hook accepts event handlers.

Adding a dependency on onReceiveMessage is not ideal because it will cause the chat to re-connect every time the component re-renders. Wrap this event handler into an Effect Event to remove it from the dependencies:

Now the chat won’t re-connect every time that the ChatRoom component re-renders. Here is a fully working demo of passing an event handler to a custom Hook that you can play with:

Notice how you no longer need to know how useChatRoom works in order to use it. You could add it to any other component, pass any other options, and it would work the same way. That’s the power of custom Hooks.

You don’t need to extract a custom Hook for every little duplicated bit of code. Some duplication is fine. For example, extracting a useFormInput Hook to wrap a single useState call like earlier is probably unnecessary.

However, whenever you write an Effect, consider whether it would be clearer to also wrap it in a custom Hook. You shouldn’t need Effects very often, so if you’re writing one, it means that you need to “step outside React” to synchronize with some external system or to do something that React doesn’t have a built-in API for. Wrapping it into a custom Hook lets you precisely communicate your intent and how the data flows through it.

For example, consider a ShippingForm component that displays two dropdowns: one shows the list of cities, and another shows the list of areas in the selected city. You might start with some code that looks like this:

Although this code is quite repetitive, it’s correct to keep these Effects separate from each other. They synchronize two different things, so you shouldn’t merge them into one Effect. Instead, you can simplify the ShippingForm component above by extracting the common logic between them into your own useData Hook:

Now you can replace both Effects in the ShippingForm components with calls to useData:

Extracting a custom Hook makes the data flow explicit. You feed the url in and you get the data out. By “hiding” your Effect inside useData, you also prevent someone working on the ShippingForm component from adding unnecessary dependencies to it. With time, most of your app’s Effects will be in custom Hooks.

Start by choosing your custom Hook’s name. If you struggle to pick a clear name, it might mean that your Effect is too coupled to the rest of your component’s logic, and is not yet ready to be extracted.

Ideally, your custom Hook’s name should be clear enough that even a person who doesn’t write code often could have a good guess about what your custom Hook does, what it takes, and what it returns:

When you synchronize with an external system, your custom Hook name may be more technical and use jargon specific to that system. It’s good as long as it would be clear to a person familiar with that system:

Keep custom Hooks focused on concrete high-level use cases. Avoid creating and using custom “lifecycle” Hooks that act as alternatives and convenience wrappers for the useEffect API itself:

For example, this useMount Hook tries to ensure some code only runs “on mount”:

Custom “lifecycle” Hooks like useMount don’t fit well into the React paradigm. For example, this code example has a mistake (it doesn’t “react” to roomId or serverUrl changes), but the linter won’t warn you about it because the linter only checks direct useEffect calls. It won’t know about your Hook.

If you’re writing an Effect, start by using the React API directly:

Then, you can (but don’t have to) extract custom Hooks for different high-level use cases:

A good custom Hook makes the calling code more declarative by constraining what it does. For example, useChatRoom(options) can only connect to the chat room, while useImpressionLog(eventName, extraData) can only send an impression log to the analytics. If your custom Hook API doesn’t constrain the use cases and is very abstract, in the long run it’s likely to introduce more problems than it solves.

Effects are an “escape hatch”: you use them when you need to “step outside React” and when there is no better built-in solution for your use case. With time, the React team’s goal is to reduce the number of the Effects in your app to the minimum by providing more specific solutions to more specific problems. Wrapping your Effects in custom Hooks makes it easier to upgrade your code when these solutions become available.

Let’s return to this example:

In the above example, useOnlineStatus is implemented with a pair of useState and useEffect. However, this isn’t the best possible solution. There is a number of edge cases it doesn’t consider. For example, it assumes that when the component mounts, isOnline is already true, but this may be wrong if the network already went offline. You can use the browser navigator.onLine API to check for that, but using it directly would not work on the server for generating the initial HTML. In short, this code could be improved.

React includes a dedicated API called useSyncExternalStore which takes care of all of these problems for you. Here is your useOnlineStatus Hook, rewritten to take advantage of this new API:

Notice how you didn’t need to change any of the components to make this migration:

This is another reason for why wrapping Effects in custom Hooks is often beneficial:

Similar to a design system, you might find it helpful to start extracting common idioms from your app’s components into custom Hooks. This will keep your components’ code focused on the intent, and let you avoid writing raw Effects very often. Many excellent custom Hooks are maintained by the React community.

Today, with the use API, data can be read in render by passing a Promise to use:

We’re still working out the details, but we expect that in the future, you’ll write data fetching like this:

If you use custom Hooks like useData above in your app, it will require fewer changes to migrate to the eventually recommended approach than if you write raw Effects in every component manually. However, the old approach will still work fine, so if you feel happy writing raw Effects, you can continue to do that.

Let’s say you want to implement a fade-in animation from scratch using the browser requestAnimationFrame API. You might start with an Effect that sets up an animation loop. During each frame of the animation, you could change the opacity of the DOM node you hold in a ref until it reaches 1. Your code might start like this:

To make the component more readable, you might extract the logic into a useFadeIn custom Hook:

You could keep the useFadeIn code as is, but you could also refactor it more. For example, you could extract the logic for setting up the animation loop out of useFadeIn into a custom useAnimationLoop Hook:

However, you didn’t have to do that. As with regular functions, ultimately you decide where to draw the boundaries between different parts of your code. You could also take a very different approach. Instead of keeping the logic in the Effect, you could move most of the imperative logic inside a JavaScript class:

Effects let you connect React to external systems. The more coordination between Effects is needed (for example, to chain multiple animations), the more it makes sense to extract that logic out of Effects and Hooks completely like in the sandbox above. Then, the code you extracted becomes the “external system”. This lets your Effects stay simple because they only need to send messages to the system you’ve moved outside React.

The examples above assume that the fade-in logic needs to be written in JavaScript. However, this particular fade-in animation is both simpler and much more efficient to implement with a plain CSS Animation:

Sometimes, you don’t even need a Hook!

This component uses a state variable and an Effect to display a number that increments every second. Extract this logic into a custom Hook called useCounter. Your goal is to make the Counter component implementation look exactly like this:

You’ll need to write your custom Hook in useCounter.js and import it into the App.js file.

**Examples:**

Example 1 (jsx):
```jsx
function StatusBar() {  const isOnline = useOnlineStatus();  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;}function SaveButton() {  const isOnline = useOnlineStatus();  function handleSaveClick() {    console.log('✅ Progress saved');  }  return (    <button disabled={!isOnline} onClick={handleSaveClick}>      {isOnline ? 'Save progress' : 'Reconnecting...'}    </button>  );}
```

Example 2 (jsx):
```jsx
function useOnlineStatus() {  const [isOnline, setIsOnline] = useState(true);  useEffect(() => {    function handleOnline() {      setIsOnline(true);    }    function handleOffline() {      setIsOnline(false);    }    window.addEventListener('online', handleOnline);    window.addEventListener('offline', handleOffline);    return () => {      window.removeEventListener('online', handleOnline);      window.removeEventListener('offline', handleOffline);    };  }, []);  return isOnline;}
```

Example 3 (unknown):
```unknown
// 🔴 Avoid: A Hook that doesn't use Hooksfunction useSorted(items) {  return items.slice().sort();}// ✅ Good: A regular function that doesn't use Hooksfunction getSorted(items) {  return items.slice().sort();}
```

Example 4 (swift):
```swift
function List({ items, shouldSort }) {  let displayedItems = items;  if (shouldSort) {    // ✅ It's ok to call getSorted() conditionally because it's not a Hook    displayedItems = getSorted(items);  }  // ...}
```

---

## Referencing Values with Refs

**URL:** https://react.dev/learn/referencing-values-with-refs

**Contents:**
- Referencing Values with Refs
  - You will learn
- Adding a ref to your component
- Example: building a stopwatch
- Differences between refs and state
      - Deep Dive
    - How does useRef work inside?
- When to use refs
- Best practices for refs
- Refs and the DOM

When you want a component to “remember” some information, but you don’t want that information to trigger new renders, you can use a ref.

You can add a ref to your component by importing the useRef Hook from React:

Inside your component, call the useRef Hook and pass the initial value that you want to reference as the only argument. For example, here is a ref to the value 0:

useRef returns an object like this:

Illustrated by Rachel Lee Nabors

You can access the current value of that ref through the ref.current property. This value is intentionally mutable, meaning you can both read and write to it. It’s like a secret pocket of your component that React doesn’t track. (This is what makes it an “escape hatch” from React’s one-way data flow—more on that below!)

Here, a button will increment ref.current on every click:

The ref points to a number, but, like state, you could point to anything: a string, an object, or even a function. Unlike state, ref is a plain JavaScript object with the current property that you can read and modify.

Note that the component doesn’t re-render with every increment. Like state, refs are retained by React between re-renders. However, setting state re-renders a component. Changing a ref does not!

You can combine refs and state in a single component. For example, let’s make a stopwatch that the user can start or stop by pressing a button. In order to display how much time has passed since the user pressed “Start”, you will need to keep track of when the Start button was pressed and what the current time is. This information is used for rendering, so you’ll keep it in state:

When the user presses “Start”, you’ll use setInterval in order to update the time every 10 milliseconds:

When the “Stop” button is pressed, you need to cancel the existing interval so that it stops updating the now state variable. You can do this by calling clearInterval, but you need to give it the interval ID that was previously returned by the setInterval call when the user pressed Start. You need to keep the interval ID somewhere. Since the interval ID is not used for rendering, you can keep it in a ref:

When a piece of information is used for rendering, keep it in state. When a piece of information is only needed by event handlers and changing it doesn’t require a re-render, using a ref may be more efficient.

Perhaps you’re thinking refs seem less “strict” than state—you can mutate them instead of always having to use a state setting function, for instance. But in most cases, you’ll want to use state. Refs are an “escape hatch” you won’t need often. Here’s how state and refs compare:

Here is a counter button that’s implemented with state:

Because the count value is displayed, it makes sense to use a state value for it. When the counter’s value is set with setCount(), React re-renders the component and the screen updates to reflect the new count.

If you tried to implement this with a ref, React would never re-render the component, so you’d never see the count change! See how clicking this button does not update its text:

This is why reading ref.current during render leads to unreliable code. If you need that, use state instead.

Although both useState and useRef are provided by React, in principle useRef could be implemented on top of useState. You can imagine that inside of React, useRef is implemented like this:

During the first render, useRef returns { current: initialValue }. This object is stored by React, so during the next render the same object will be returned. Note how the state setter is unused in this example. It is unnecessary because useRef always needs to return the same object!

React provides a built-in version of useRef because it is common enough in practice. But you can think of it as a regular state variable without a setter. If you’re familiar with object-oriented programming, refs might remind you of instance fields—but instead of this.something you write somethingRef.current.

Typically, you will use a ref when your component needs to “step outside” React and communicate with external APIs—often a browser API that won’t impact the appearance of the component. Here are a few of these rare situations:

If your component needs to store some value, but it doesn’t impact the rendering logic, choose refs.

Following these principles will make your components more predictable:

Limitations of React state don’t apply to refs. For example, state acts like a snapshot for every render and doesn’t update synchronously. But when you mutate the current value of a ref, it changes immediately:

This is because the ref itself is a regular JavaScript object, and so it behaves like one.

You also don’t need to worry about avoiding mutation when you work with a ref. As long as the object you’re mutating isn’t used for rendering, React doesn’t care what you do with the ref or its contents.

You can point a ref to any value. However, the most common use case for a ref is to access a DOM element. For example, this is handy if you want to focus an input programmatically. When you pass a ref to a ref attribute in JSX, like <div ref={myRef}>, React will put the corresponding DOM element into myRef.current. Once the element is removed from the DOM, React will update myRef.current to be null. You can read more about this in Manipulating the DOM with Refs.

Type a message and click “Send”. You will notice there is a three second delay before you see the “Sent!” alert. During this delay, you can see an “Undo” button. Click it. This “Undo” button is supposed to stop the “Sent!” message from appearing. It does this by calling clearTimeout for the timeout ID saved during handleSend. However, even after “Undo” is clicked, the “Sent!” message still appears. Find why it doesn’t work, and fix it.

**Examples:**

Example 1 (sql):
```sql
import { useRef } from 'react';
```

Example 2 (jsx):
```jsx
const ref = useRef(0);
```

Example 3 (json):
```json
{   current: 0 // The value you passed to useRef}
```

Example 4 (jsx):
```jsx
const [startTime, setStartTime] = useState(null);const [now, setNow] = useState(null);
```

---

## Manipulating the DOM with Refs

**URL:** https://react.dev/learn/manipulating-the-dom-with-refs

**Contents:**
- Manipulating the DOM with Refs
  - You will learn
- Getting a ref to the node
  - Example: Focusing a text input
  - Example: Scrolling to an element
      - Deep Dive
    - How to manage a list of refs using a ref callback
  - Note
- Accessing another component’s DOM nodes
  - Pitfall

React automatically updates the DOM to match your render output, so your components won’t often need to manipulate it. However, sometimes you might need access to the DOM elements managed by React—for example, to focus a node, scroll to it, or measure its size and position. There is no built-in way to do those things in React, so you will need a ref to the DOM node.

To access a DOM node managed by React, first, import the useRef Hook:

Then, use it to declare a ref inside your component:

Finally, pass your ref as the ref attribute to the JSX tag for which you want to get the DOM node:

The useRef Hook returns an object with a single property called current. Initially, myRef.current will be null. When React creates a DOM node for this <div>, React will put a reference to this node into myRef.current. You can then access this DOM node from your event handlers and use the built-in browser APIs defined on it.

In this example, clicking the button will focus the input:

While DOM manipulation is the most common use case for refs, the useRef Hook can be used for storing other things outside React, like timer IDs. Similarly to state, refs remain between renders. Refs are like state variables that don’t trigger re-renders when you set them. Read about refs in Referencing Values with Refs.

You can have more than a single ref in a component. In this example, there is a carousel of three images. Each button centers an image by calling the browser scrollIntoView() method on the corresponding DOM node:

In the above examples, there is a predefined number of refs. However, sometimes you might need a ref to each item in the list, and you don’t know how many you will have. Something like this wouldn’t work:

This is because Hooks must only be called at the top-level of your component. You can’t call useRef in a loop, in a condition, or inside a map() call.

One possible way around this is to get a single ref to their parent element, and then use DOM manipulation methods like querySelectorAll to “find” the individual child nodes from it. However, this is brittle and can break if your DOM structure changes.

Another solution is to pass a function to the ref attribute. This is called a ref callback. React will call your ref callback with the DOM node when it’s time to set the ref, and call the cleanup function returned from the callback when it’s time to clear it. This lets you maintain your own array or a Map, and access any ref by its index or some kind of ID.

This example shows how you can use this approach to scroll to an arbitrary node in a long list:

In this example, itemsRef doesn’t hold a single DOM node. Instead, it holds a Map from item ID to a DOM node. (Refs can hold any values!) The ref callback on every list item takes care to update the Map:

This lets you read individual DOM nodes from the Map later.

When Strict Mode is enabled, ref callbacks will run twice in development.

Read more about how this helps find bugs in callback refs.

Refs are an escape hatch. Manually manipulating another component’s DOM nodes can make your code fragile.

You can pass refs from parent component to child components just like any other prop.

In the above example, a ref is created in the parent component, MyForm, and is passed to the child component, MyInput. MyInput then passes the ref to <input>. Because <input> is a built-in component React sets the .current property of the ref to the <input> DOM element.

The inputRef created in MyForm now points to the <input> DOM element returned by MyInput. A click handler created in MyForm can access inputRef and call focus() to set the focus on <input>.

In the above example, the ref passed to MyInput is passed on to the original DOM input element. This lets the parent component call focus() on it. However, this also lets the parent component do something else—for example, change its CSS styles. In uncommon cases, you may want to restrict the exposed functionality. You can do that with useImperativeHandle:

Here, realInputRef inside MyInput holds the actual input DOM node. However, useImperativeHandle instructs React to provide your own special object as the value of a ref to the parent component. So inputRef.current inside the Form component will only have the focus method. In this case, the ref “handle” is not the DOM node, but the custom object you create inside useImperativeHandle call.

In React, every update is split in two phases:

In general, you don’t want to access refs during rendering. That goes for refs holding DOM nodes as well. During the first render, the DOM nodes have not yet been created, so ref.current will be null. And during the rendering of updates, the DOM nodes haven’t been updated yet. So it’s too early to read them.

React sets ref.current during the commit. Before updating the DOM, React sets the affected ref.current values to null. After updating the DOM, React immediately sets them to the corresponding DOM nodes.

Usually, you will access refs from event handlers. If you want to do something with a ref, but there is no particular event to do it in, you might need an Effect. We will discuss Effects on the next pages.

Consider code like this, which adds a new todo and scrolls the screen down to the last child of the list. Notice how, for some reason, it always scrolls to the todo that was just before the last added one:

The issue is with these two lines:

In React, state updates are queued. Usually, this is what you want. However, here it causes a problem because setTodos does not immediately update the DOM. So the time you scroll the list to its last element, the todo has not yet been added. This is why scrolling always “lags behind” by one item.

To fix this issue, you can force React to update (“flush”) the DOM synchronously. To do this, import flushSync from react-dom and wrap the state update into a flushSync call:

This will instruct React to update the DOM synchronously right after the code wrapped in flushSync executes. As a result, the last todo will already be in the DOM by the time you try to scroll to it:

Refs are an escape hatch. You should only use them when you have to “step outside React”. Common examples of this include managing focus, scroll position, or calling browser APIs that React does not expose.

If you stick to non-destructive actions like focusing and scrolling, you shouldn’t encounter any problems. However, if you try to modify the DOM manually, you can risk conflicting with the changes React is making.

To illustrate this problem, this example includes a welcome message and two buttons. The first button toggles its presence using conditional rendering and state, as you would usually do in React. The second button uses the remove() DOM API to forcefully remove it from the DOM outside of React’s control.

Try pressing “Toggle with setState” a few times. The message should disappear and appear again. Then press “Remove from the DOM”. This will forcefully remove it. Finally, press “Toggle with setState”:

After you’ve manually removed the DOM element, trying to use setState to show it again will lead to a crash. This is because you’ve changed the DOM, and React doesn’t know how to continue managing it correctly.

Avoid changing DOM nodes managed by React. Modifying, adding children to, or removing children from elements that are managed by React can lead to inconsistent visual results or crashes like above.

However, this doesn’t mean that you can’t do it at all. It requires caution. You can safely modify parts of the DOM that React has no reason to update. For example, if some <div> is always empty in the JSX, React won’t have a reason to touch its children list. Therefore, it is safe to manually add or remove elements there.

In this example, the button toggles a state variable to switch between a playing and a paused state. However, in order to actually play or pause the video, toggling state is not enough. You also need to call play() and pause() on the DOM element for the <video>. Add a ref to it, and make the button work.

For an extra challenge, keep the “Play” button in sync with whether the video is playing even if the user right-clicks the video and plays it using the built-in browser media controls. You might want to listen to onPlay and onPause on the video to do that.

**Examples:**

Example 1 (sql):
```sql
import { useRef } from 'react';
```

Example 2 (jsx):
```jsx
const myRef = useRef(null);
```

Example 3 (jsx):
```jsx
<div ref={myRef}>
```

Example 4 (unknown):
```unknown
// You can use any browser APIs, for example:myRef.current.scrollIntoView();
```

---

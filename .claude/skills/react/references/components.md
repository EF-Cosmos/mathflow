# React - Components

**Pages:** 41

---

## Built-in React Components

**URL:** https://react.dev/reference/react/components

**Contents:**
- Built-in React Components
- Built-in components
- Your own components

React exposes a few built-in components that you can use in your JSX.

You can also define your own components as JavaScript functions.

---

## <Profiler>

**URL:** https://react.dev/reference/react/Profiler

**Contents:**
- <Profiler>
- Reference
  - <Profiler>
    - Props
    - Caveats
  - onRender callback
    - Parameters
- Usage
  - Measuring rendering performance programmatically
  - Pitfall

<Profiler> lets you measure rendering performance of a React tree programmatically.

Wrap a component tree in a <Profiler> to measure its rendering performance.

React will call your onRender callback with information about what was rendered.

Wrap the <Profiler> component around a React tree to measure its rendering performance.

It requires two props: an id (string) and an onRender callback (function) which React calls any time a component within the tree “commits” an update.

Profiling adds some additional overhead, so it is disabled in the production build by default. To opt into production profiling, you need to enable a special production build with profiling enabled.

<Profiler> lets you gather measurements programmatically. If you’re looking for an interactive profiler, try the Profiler tab in React Developer Tools. It exposes similar functionality as a browser extension.

Components wrapped in <Profiler> will also be marked in the Component tracks of React Performance tracks even in profiling builds. In development builds, all components are marked in the Components track regardless of whether they’re wrapped in <Profiler>.

You can use multiple <Profiler> components to measure different parts of your application:

You can also nest <Profiler> components:

Although <Profiler> is a lightweight component, it should be used only when necessary. Each use adds some CPU and memory overhead to an application.

**Examples:**

Example 1 (jsx):
```jsx
<Profiler id="App" onRender={onRender}>  <App /></Profiler>
```

Example 2 (jsx):
```jsx
<Profiler id="App" onRender={onRender}>  <App /></Profiler>
```

Example 3 (javascript):
```javascript
function onRender(id, phase, actualDuration, baseDuration, startTime, commitTime) {  // Aggregate or log render timings...}
```

Example 4 (jsx):
```jsx
<App>  <Profiler id="Sidebar" onRender={onRender}>    <Sidebar />  </Profiler>  <PageContent /></App>
```

---

## <StrictMode>

**URL:** https://react.dev/reference/react/StrictMode

**Contents:**
- <StrictMode>
- Reference
  - <StrictMode>
    - Props
    - Caveats
- Usage
  - Enabling Strict Mode for entire app
  - Note
  - Enabling Strict Mode for a part of the app
  - Note

<StrictMode> lets you find common bugs in your components early during development.

Use StrictMode to enable additional development behaviors and warnings for the component tree inside:

See more examples below.

Strict Mode enables the following development-only behaviors:

StrictMode accepts no props.

Strict Mode enables extra development-only checks for the entire component tree inside the <StrictMode> component. These checks help you find common bugs in your components early in the development process.

To enable Strict Mode for your entire app, wrap your root component with <StrictMode> when you render it:

We recommend wrapping your entire app in Strict Mode, especially for newly created apps. If you use a framework that calls createRoot for you, check its documentation for how to enable Strict Mode.

Although the Strict Mode checks only run in development, they help you find bugs that already exist in your code but can be tricky to reliably reproduce in production. Strict Mode lets you fix bugs before your users report them.

Strict Mode enables the following checks in development:

All of these checks are development-only and do not impact the production build.

You can also enable Strict Mode for any part of your application:

In this example, Strict Mode checks will not run against the Header and Footer components. However, they will run on Sidebar and Content, as well as all of the components inside them, no matter how deep.

When StrictMode is enabled for a part of the app, React will only enable behaviors that are possible in production. For example, if <StrictMode> is not enabled at the root of the app, it will not re-run Effects an extra time on initial mount, since this would cause child effects to double fire without the parent effects, which cannot happen in production.

React assumes that every component you write is a pure function. This means that React components you write must always return the same JSX given the same inputs (props, state, and context).

Components breaking this rule behave unpredictably and cause bugs. To help you find accidentally impure code, Strict Mode calls some of your functions (only the ones that should be pure) twice in development. This includes:

If a function is pure, running it twice does not change its behavior because a pure function produces the same result every time. However, if a function is impure (for example, it mutates the data it receives), running it twice tends to be noticeable (that’s what makes it impure!) This helps you spot and fix the bug early.

Here is an example to illustrate how double rendering in Strict Mode helps you find bugs early.

This StoryTray component takes an array of stories and adds one last “Create Story” item at the end:

There is a mistake in the code above. However, it is easy to miss because the initial output appears correct.

This mistake will become more noticeable if the StoryTray component re-renders multiple times. For example, let’s make the StoryTray re-render with a different background color whenever you hover over it:

Notice how every time you hover over the StoryTray component, “Create Story” gets added to the list again. The intention of the code was to add it once at the end. But StoryTray directly modifies the stories array from the props. Every time StoryTray renders, it adds “Create Story” again at the end of the same array. In other words, StoryTray is not a pure function—running it multiple times produces different results.

To fix this problem, you can make a copy of the array, and modify that copy instead of the original one:

This would make the StoryTray function pure. Each time it is called, it would only modify a new copy of the array, and would not affect any external objects or variables. This solves the bug, but you had to make the component re-render more often before it became obvious that something is wrong with its behavior.

In the original example, the bug wasn’t obvious. Now let’s wrap the original (buggy) code in <StrictMode>:

Strict Mode always calls your rendering function twice, so you can see the mistake right away (“Create Story” appears twice). This lets you notice such mistakes early in the process. When you fix your component to render in Strict Mode, you also fix many possible future production bugs like the hover functionality from before:

Without Strict Mode, it was easy to miss the bug until you added more re-renders. Strict Mode made the same bug appear right away. Strict Mode helps you find bugs before you push them to your team and to your users.

Read more about keeping components pure.

If you have React DevTools installed, any console.log calls during the second render call will appear slightly dimmed. React DevTools also offers a setting (off by default) to suppress them completely.

Strict Mode can also help find bugs in Effects.

Every Effect has some setup code and may have some cleanup code. Normally, React calls setup when the component mounts (is added to the screen) and calls cleanup when the component unmounts (is removed from the screen). React then calls cleanup and setup again if its dependencies changed since the last render.

When Strict Mode is on, React will also run one extra setup+cleanup cycle in development for every Effect. This may feel surprising, but it helps reveal subtle bugs that are hard to catch manually.

Here is an example to illustrate how re-running Effects in Strict Mode helps you find bugs early.

Consider this example that connects a component to a chat:

There is an issue with this code, but it might not be immediately clear.

To make the issue more obvious, let’s implement a feature. In the example below, roomId is not hardcoded. Instead, the user can select the roomId that they want to connect to from a dropdown. Click “Open chat” and then select different chat rooms one by one. Keep track of the number of active connections in the console:

You’ll notice that the number of open connections always keeps growing. In a real app, this would cause performance and network problems. The issue is that your Effect is missing a cleanup function:

Now that your Effect “cleans up” after itself and destroys the outdated connections, the leak is solved. However, notice that the problem did not become visible until you’ve added more features (the select box).

In the original example, the bug wasn’t obvious. Now let’s wrap the original (buggy) code in <StrictMode>:

With Strict Mode, you immediately see that there is a problem (the number of active connections jumps to 2). Strict Mode runs an extra setup+cleanup cycle for every Effect. This Effect has no cleanup logic, so it creates an extra connection but doesn’t destroy it. This is a hint that you’re missing a cleanup function.

Strict Mode lets you notice such mistakes early in the process. When you fix your Effect by adding a cleanup function in Strict Mode, you also fix many possible future production bugs like the select box from before:

Notice how the active connection count in the console doesn’t keep growing anymore.

Without Strict Mode, it was easy to miss that your Effect needed cleanup. By running setup → cleanup → setup instead of setup for your Effect in development, Strict Mode made the missing cleanup logic more noticeable.

Read more about implementing Effect cleanup.

Strict Mode can also help find bugs in callbacks refs.

Every callback ref has some setup code and may have some cleanup code. Normally, React calls setup when the element is created (is added to the DOM) and calls cleanup when the element is removed (is removed from the DOM).

When Strict Mode is on, React will also run one extra setup+cleanup cycle in development for every callback ref. This may feel surprising, but it helps reveal subtle bugs that are hard to catch manually.

Consider this example, which allows you to select an animal and then scroll to one of them. Notice when you switch from “Cats” to “Dogs”, the console logs show that the number of animals in the list keeps growing, and the “Scroll to” buttons stop working:

This is a production bug! Since the ref callback doesn’t remove animals from the list in the cleanup, the list of animals keeps growing. This is a memory leak that can cause performance problems in a real app, and breaks the behavior of the app.

The issue is the ref callback doesn’t cleanup after itself:

Now let’s wrap the original (buggy) code in <StrictMode>:

With Strict Mode, you immediately see that there is a problem. Strict Mode runs an extra setup+cleanup cycle for every callback ref. This callback ref has no cleanup logic, so it adds refs but doesn’t remove them. This is a hint that you’re missing a cleanup function.

Strict Mode lets you eagerly find mistakes in callback refs. When you fix your callback by adding a cleanup function in Strict Mode, you also fix many possible future production bugs like the “Scroll to” bug from before:

Now on inital mount in StrictMode, the ref callbacks are all setup, cleaned up, and setup again:

This is expected. Strict Mode confirms that the ref callbacks are cleaned up correctly, so the size never grows above the expected amount. After the fix, there are no memory leaks, and all the features work as expected.

Without Strict Mode, it was easy to miss the bug until you clicked around to app to notice broken features. Strict Mode made the bugs appear right away, before you push them to production.

React warns if some component anywhere inside a <StrictMode> tree uses one of these deprecated APIs:

These APIs are primarily used in older class components so they rarely appear in modern apps.

**Examples:**

Example 1 (jsx):
```jsx
<StrictMode>  <App /></StrictMode>
```

Example 2 (jsx):
```jsx
import { StrictMode } from 'react';import { createRoot } from 'react-dom/client';const root = createRoot(document.getElementById('root'));root.render(  <StrictMode>    <App />  </StrictMode>);
```

Example 3 (jsx):
```jsx
import { StrictMode } from 'react';import { createRoot } from 'react-dom/client';const root = createRoot(document.getElementById('root'));root.render(  <StrictMode>    <App />  </StrictMode>);
```

Example 4 (jsx):
```jsx
import { StrictMode } from 'react';function App() {  return (    <>      <Header />      <StrictMode>        <main>          <Sidebar />          <Content />        </main>      </StrictMode>      <Footer />    </>  );}
```

---

## memo

**URL:** https://react.dev/reference/react/memo

**Contents:**
- memo
  - Note
- Reference
  - memo(Component, arePropsEqual?)
    - Parameters
    - Returns
- Usage
  - Skipping re-rendering when props are unchanged
  - Note
      - Deep Dive

memo lets you skip re-rendering a component when its props are unchanged.

React Compiler automatically applies the equivalent of memo to all components, reducing the need for manual memoization. You can use the compiler to handle component memoization automatically.

Wrap a component in memo to get a memoized version of that component. This memoized version of your component will usually not be re-rendered when its parent component is re-rendered as long as its props have not changed. But React may still re-render it: memoization is a performance optimization, not a guarantee.

See more examples below.

Component: The component that you want to memoize. The memo does not modify this component, but returns a new, memoized component instead. Any valid React component, including functions and forwardRef components, is accepted.

optional arePropsEqual: A function that accepts two arguments: the component’s previous props, and its new props. It should return true if the old and new props are equal: that is, if the component will render the same output and behave in the same way with the new props as with the old. Otherwise it should return false. Usually, you will not specify this function. By default, React will compare each prop with Object.is.

memo returns a new React component. It behaves the same as the component provided to memo except that React will not always re-render it when its parent is being re-rendered unless its props have changed.

React normally re-renders a component whenever its parent re-renders. With memo, you can create a component that React will not re-render when its parent re-renders so long as its new props are the same as the old props. Such a component is said to be memoized.

To memoize a component, wrap it in memo and use the value that it returns in place of your original component:

A React component should always have pure rendering logic. This means that it must return the same output if its props, state, and context haven’t changed. By using memo, you are telling React that your component complies with this requirement, so React doesn’t need to re-render as long as its props haven’t changed. Even with memo, your component will re-render if its own state changes or if a context that it’s using changes.

In this example, notice that the Greeting component re-renders whenever name is changed (because that’s one of its props), but not when address is changed (because it’s not passed to Greeting as a prop):

You should only rely on memo as a performance optimization. If your code doesn’t work without it, find the underlying problem and fix it first. Then you may add memo to improve performance.

If your app is like this site, and most interactions are coarse (like replacing a page or an entire section), memoization is usually unnecessary. On the other hand, if your app is more like a drawing editor, and most interactions are granular (like moving shapes), then you might find memoization very helpful.

Optimizing with memo is only valuable when your component re-renders often with the same exact props, and its re-rendering logic is expensive. If there is no perceptible lag when your component re-renders, memo is unnecessary. Keep in mind that memo is completely useless if the props passed to your component are always different, such as if you pass an object or a plain function defined during rendering. This is why you will often need useMemo and useCallback together with memo.

There is no benefit to wrapping a component in memo in other cases. There is no significant harm to doing that either, so some teams choose to not think about individual cases, and memoize as much as possible. The downside of this approach is that code becomes less readable. Also, not all memoization is effective: a single value that’s “always new” is enough to break memoization for an entire component.

In practice, you can make a lot of memoization unnecessary by following a few principles:

If a specific interaction still feels laggy, use the React Developer Tools profiler to see which components would benefit the most from memoization, and add memoization where needed. These principles make your components easier to debug and understand, so it’s good to follow them in any case. In the long term, we’re researching doing granular memoization automatically to solve this once and for all.

Even when a component is memoized, it will still re-render when its own state changes. Memoization only has to do with props that are passed to the component from its parent.

If you set a state variable to its current value, React will skip re-rendering your component even without memo. You may still see your component function being called an extra time, but the result will be discarded.

Even when a component is memoized, it will still re-render when a context that it’s using changes. Memoization only has to do with props that are passed to the component from its parent.

To make your component re-render only when a part of some context changes, split your component in two. Read what you need from the context in the outer component, and pass it down to a memoized child as a prop.

When you use memo, your component re-renders whenever any prop is not shallowly equal to what it was previously. This means that React compares every prop in your component with its previous value using the Object.is comparison. Note that Object.is(3, 3) is true, but Object.is({}, {}) is false.

To get the most out of memo, minimize the times that the props change. For example, if the prop is an object, prevent the parent component from re-creating that object every time by using useMemo:

A better way to minimize props changes is to make sure the component accepts the minimum necessary information in its props. For example, it could accept individual values instead of a whole object:

Even individual values can sometimes be projected to ones that change less frequently. For example, here a component accepts a boolean indicating the presence of a value rather than the value itself:

When you need to pass a function to memoized component, either declare it outside your component so that it never changes, or useCallback to cache its definition between re-renders.

In rare cases it may be infeasible to minimize the props changes of a memoized component. In that case, you can provide a custom comparison function, which React will use to compare the old and new props instead of using shallow equality. This function is passed as a second argument to memo. It should return true only if the new props would result in the same output as the old props; otherwise it should return false.

If you do this, use the Performance panel in your browser developer tools to make sure that your comparison function is actually faster than re-rendering the component. You might be surprised.

When you do performance measurements, make sure that React is running in the production mode.

If you provide a custom arePropsEqual implementation, you must compare every prop, including functions. Functions often close over the props and state of parent components. If you return true when oldProps.onClick !== newProps.onClick, your component will keep “seeing” the props and state from a previous render inside its onClick handler, leading to very confusing bugs.

Avoid doing deep equality checks inside arePropsEqual unless you are 100% sure that the data structure you’re working with has a known limited depth. Deep equality checks can become incredibly slow and can freeze your app for many seconds if someone changes the data structure later.

When you enable React Compiler, you typically don’t need React.memo anymore. The compiler automatically optimizes component re-rendering for you.

Without React Compiler, you need React.memo to prevent unnecessary re-renders:

With React Compiler enabled, the same optimization happens automatically:

Here’s the key part of what the React Compiler generates:

Notice the highlighted lines: The compiler wraps <ExpensiveChild name="John" /> in a cache check. Since the name prop is always "John", this JSX is created once and reused on every parent re-render. This is exactly what React.memo does - it prevents the child from re-rendering when its props haven’t changed.

The React Compiler automatically:

This means you can safely remove React.memo from your components when using React Compiler. The compiler provides the same optimization automatically, making your code cleaner and easier to maintain.

The compiler’s optimization is actually more comprehensive than React.memo. It also memoizes intermediate values and expensive computations within your components, similar to combining React.memo with useMemo throughout your component tree.

React compares old and new props by shallow equality: that is, it considers whether each new prop is reference-equal to the old prop. If you create a new object or array each time the parent is re-rendered, even if the individual elements are each the same, React will still consider it to be changed. Similarly, if you create a new function when rendering the parent component, React will consider it to have changed even if the function has the same definition. To avoid this, simplify props or memoize props in the parent component.

**Examples:**

Example 1 (javascript):
```javascript
const MemoizedComponent = memo(SomeComponent, arePropsEqual?)
```

Example 2 (javascript):
```javascript
import { memo } from 'react';const SomeComponent = memo(function SomeComponent(props) {  // ...});
```

Example 3 (javascript):
```javascript
const Greeting = memo(function Greeting({ name }) {  return <h1>Hello, {name}!</h1>;});export default Greeting;
```

Example 4 (jsx):
```jsx
function Page() {  const [name, setName] = useState('Taylor');  const [age, setAge] = useState(42);  const person = useMemo(    () => ({ name, age }),    [name, age]  );  return <Profile person={person} />;}const Profile = memo(function Profile({ person }) {  // ...});
```

---

## React DOM Components

**URL:** https://react.dev/reference/react-dom/components

**Contents:**
- React DOM Components
- Common components
- Form components
- Resource and Metadata Components
- All HTML components
  - Note
  - Custom HTML elements
    - Setting values on custom elements
    - Listening for events on custom elements
  - Note

React supports all of the browser built-in HTML and SVG components.

All of the built-in browser components support some props and events.

This includes React-specific props like ref and dangerouslySetInnerHTML.

These built-in browser components accept user input:

They are special in React because passing the value prop to them makes them controlled.

These built-in browser components let you load external resources or annotate the document with metadata:

They are special in React because React can render them into the document head, suspend while resources are loading, and enact other behaviors that are described on the reference page for each specific component.

React supports all built-in browser HTML components. This includes:

Similar to the DOM standard, React uses a camelCase convention for prop names. For example, you’ll write tabIndex instead of tabindex. You can convert existing HTML to JSX with an online converter.

If you render a tag with a dash, like <my-element>, React will assume you want to render a custom HTML element.

If you render a built-in browser HTML element with an is attribute, it will also be treated as a custom element.

Custom elements have two methods of passing data into them:

By default, React will pass values bound in JSX as attributes:

Non-string JavaScript values passed to custom elements will be serialized by default:

React will, however, recognize an custom element’s property as one that it may pass arbitrary values to if the property name shows up on the class during construction:

A common pattern when using custom elements is that they may dispatch CustomEvents rather than accept a function to call when an event occur. You can listen for these events using an on prefix when binding to the event via JSX.

Events are case-sensitive and support dashes (-). Preserve the casing of the event and include all dashes when listening for custom element’s events:

React supports all built-in browser SVG components. This includes:

Similar to the DOM standard, React uses a camelCase convention for prop names. For example, you’ll write tabIndex instead of tabindex. You can convert existing SVG to JSX with an online converter.

Namespaced attributes also have to be written without the colon:

**Examples:**

Example 1 (unknown):
```unknown
<my-element value="Hello, world!"></my-element>
```

Example 2 (typescript):
```typescript
// Will be passed as `"1,2,3"` as the output of `[1,2,3].toString()`<my-element value={[1,2,3]}></my-element>
```

Example 3 (javascript):
```javascript
// Listens for `say-hi` events<my-element onsay-hi={console.log}></my-element>// Listens for `sayHi` events<my-element onsayHi={console.log}></my-element>
```

---

## Common components (e.g. <div>)

**URL:** https://react.dev/reference/react-dom/components/common

**Contents:**
- Common components (e.g. <div>)
- Reference
  - Common components (e.g. <div>)
    - Props
    - Caveats
  - ref callback function
    - Parameters
  - Note
    - React 19 added cleanup functions for ref callbacks.
    - Returns

All built-in browser components, such as <div>, support some common props and events.

See more examples below.

These special React props are supported for all built-in components:

children: A React node (an element, a string, a number, a portal, an empty node like null, undefined and booleans, or an array of other React nodes). Specifies the content inside the component. When you use JSX, you will usually specify the children prop implicitly by nesting tags like <div><span /></div>.

dangerouslySetInnerHTML: An object of the form { __html: '<p>some html</p>' } with a raw HTML string inside. Overrides the innerHTML property of the DOM node and displays the passed HTML inside. This should be used with extreme caution! If the HTML inside isn’t trusted (for example, if it’s based on user data), you risk introducing an XSS vulnerability. Read more about using dangerouslySetInnerHTML.

ref: A ref object from useRef or createRef, or a ref callback function, or a string for legacy refs. Your ref will be filled with the DOM element for this node. Read more about manipulating the DOM with refs.

suppressContentEditableWarning: A boolean. If true, suppresses the warning that React shows for elements that both have children and contentEditable={true} (which normally do not work together). Use this if you’re building a text input library that manages the contentEditable content manually.

suppressHydrationWarning: A boolean. If you use server rendering, normally there is a warning when the server and the client render different content. In some rare cases (like timestamps), it is very hard or impossible to guarantee an exact match. If you set suppressHydrationWarning to true, React will not warn you about mismatches in the attributes and the content of that element. It only works one level deep, and is intended to be used as an escape hatch. Don’t overuse it. Read about suppressing hydration errors.

style: An object with CSS styles, for example { fontWeight: 'bold', margin: 20 }. Similarly to the DOM style property, the CSS property names need to be written as camelCase, for example fontWeight instead of font-weight. You can pass strings or numbers as values. If you pass a number, like width: 100, React will automatically append px (“pixels”) to the value unless it’s a unitless property. We recommend using style only for dynamic styles where you don’t know the style values ahead of time. In other cases, applying plain CSS classes with className is more efficient. Read more about className and style.

These standard DOM props are also supported for all built-in components:

You can also pass custom attributes as props, for example mycustomprop="someValue". This can be useful when integrating with third-party libraries. The custom attribute name must be lowercase and must not start with on. The value will be converted to a string. If you pass null or undefined, the custom attribute will be removed.

These events fire only for the <form> elements:

These events fire only for the <dialog> elements. Unlike browser events, they bubble in React:

These events fire only for the <details> elements. Unlike browser events, they bubble in React:

These events fire for <img>, <iframe>, <object>, <embed>, <link>, and SVG <image> elements. Unlike browser events, they bubble in React:

These events fire for resources like <audio> and <video>. Unlike browser events, they bubble in React:

Instead of a ref object (like the one returned by useRef), you may pass a function to the ref attribute.

See an example of using the ref callback.

When the <div> DOM node is added to the screen, React will call your ref callback with the DOM node as the argument. When that <div> DOM node is removed, React will call your the cleanup function returned from the callback.

React will also call your ref callback whenever you pass a different ref callback. In the above example, (node) => { ... } is a different function on every render. When your component re-renders, the previous function will be called with null as the argument, and the next function will be called with the DOM node.

To support backwards compatibility, if a cleanup function is not returned from the ref callback, node will be called with null when the ref is detached. This behavior will be removed in a future version.

Your event handlers will receive a React event object. It is also sometimes known as a “synthetic event”.

It conforms to the same standard as the underlying DOM events, but fixes some browser inconsistencies.

Some React events do not map directly to the browser’s native events. For example in onMouseLeave, e.nativeEvent will point to a mouseout event. The specific mapping is not part of the public API and may change in the future. If you need the underlying browser event for some reason, read it from e.nativeEvent.

React event objects implement some of the standard Event properties:

Additionally, React event objects provide these properties:

React event objects implement some of the standard Event methods:

Additionally, React event objects provide these methods:

An event handler type for the CSS animation events.

An event handler type for the Clipboard API events.

e: A React event object with these extra ClipboardEvent properties:

An event handler type for the input method editor (IME) events.

An event handler type for the HTML Drag and Drop API events.

e: A React event object with these extra DragEvent properties:

It also includes the inherited MouseEvent properties:

It also includes the inherited UIEvent properties:

An event handler type for the focus events.

e: A React event object with these extra FocusEvent properties:

It also includes the inherited UIEvent properties:

An event handler type for generic events.

An event handler type for the onBeforeInput event.

An event handler type for keyboard events.

e: A React event object with these extra KeyboardEvent properties:

It also includes the inherited UIEvent properties:

An event handler type for mouse events.

e: A React event object with these extra MouseEvent properties:

It also includes the inherited UIEvent properties:

An event handler type for pointer events.

e: A React event object with these extra PointerEvent properties:

It also includes the inherited MouseEvent properties:

It also includes the inherited UIEvent properties:

An event handler type for touch events.

e: A React event object with these extra TouchEvent properties:

It also includes the inherited UIEvent properties:

An event handler type for the CSS transition events.

An event handler type for generic UI events.

An event handler type for the onWheel event.

e: A React event object with these extra WheelEvent properties:

It also includes the inherited MouseEvent properties:

It also includes the inherited UIEvent properties:

In React, you specify a CSS class with className. It works like the class attribute in HTML:

Then you write the CSS rules for it in a separate CSS file:

React does not prescribe how you add CSS files. In the simplest case, you’ll add a <link> tag to your HTML. If you use a build tool or a framework, consult its documentation to learn how to add a CSS file to your project.

Sometimes, the style values depend on data. Use the style attribute to pass some styles dynamically:

In the above example, style={{}} is not a special syntax, but a regular {} object inside the style={ } JSX curly braces. We recommend only using the style attribute when your styles depend on JavaScript variables.

To apply CSS classes conditionally, you need to produce the className string yourself using JavaScript.

For example, className={'row ' + (isSelected ? 'selected': '')} will produce either className="row" or className="row selected" depending on whether isSelected is true.

To make this more readable, you can use a tiny helper library like classnames:

It is especially convenient if you have multiple conditional classes:

Sometimes, you’ll need to get the browser DOM node associated with a tag in JSX. For example, if you want to focus an <input> when a button is clicked, you need to call focus() on the browser <input> DOM node.

To obtain the browser DOM node for a tag, declare a ref and pass it as the ref attribute to that tag:

React will put the DOM node into inputRef.current after it’s been rendered to the screen.

Read more about manipulating DOM with refs and check out more examples.

For more advanced use cases, the ref attribute also accepts a callback function.

You can pass a raw HTML string to an element like so:

This is dangerous. As with the underlying DOM innerHTML property, you must exercise extreme caution! Unless the markup is coming from a completely trusted source, it is trivial to introduce an XSS vulnerability this way.

For example, if you use a Markdown library that converts Markdown to HTML, you trust that its parser doesn’t contain bugs, and the user only sees their own input, you can display the resulting HTML like this:

The {__html} object should be created as close to where the HTML is generated as possible, like the above example does in the renderMarkdownToHTML function. This ensures that all raw HTML being used in your code is explicitly marked as such, and that only variables that you expect to contain HTML are passed to dangerouslySetInnerHTML. It is not recommended to create the object inline like <div dangerouslySetInnerHTML={{__html: markup}} />.

To see why rendering arbitrary HTML is dangerous, replace the code above with this:

The code embedded in the HTML will run. A hacker could use this security hole to steal user information or to perform actions on their behalf. Only use dangerouslySetInnerHTML with trusted and sanitized data.

This example shows some common mouse events and when they fire.

This example shows some common pointer events and when they fire.

In React, focus events bubble. You can use the currentTarget and relatedTarget to differentiate if the focusing or blurring events originated from outside of the parent element. The example shows how to detect focusing a child, focusing the parent element, and how to detect focus entering or leaving the whole subtree.

This example shows some common keyboard events and when they fire.

**Examples:**

Example 1 (jsx):
```jsx
<div className="wrapper">Some content</div>
```

Example 2 (jsx):
```jsx
<div ref={(node) => {  console.log('Attached', node);  return () => {    console.log('Clean up', node)  }}}>
```

Example 3 (jsx):
```jsx
<button onClick={e => {  console.log(e); // React event object}} />
```

Example 4 (jsx):
```jsx
<div  onAnimationStart={e => console.log('onAnimationStart')}  onAnimationIteration={e => console.log('onAnimationIteration')}  onAnimationEnd={e => console.log('onAnimationEnd')}/>
```

---

## <form>

**URL:** https://react.dev/reference/react-dom/components/form

**Contents:**
- <form>
- Reference
  - <form>
    - Props
    - Caveats
- Usage
  - Handle form submission on the client
  - Handle form submission with a Server Function
  - Display a pending state during form submission
  - Optimistically updating form data

The built-in browser <form> component lets you create interactive controls for submitting information.

To create interactive controls for submitting information, render the built-in browser <form> component.

See more examples below.

<form> supports all common element props.

action: a URL or function. When a URL is passed to action the form will behave like the HTML form component. When a function is passed to action the function will handle the form submission in a Transition following the Action prop pattern. The function passed to action may be async and will be called with a single argument containing the form data of the submitted form. The action prop can be overridden by a formAction attribute on a <button>, <input type="submit">, or <input type="image"> component.

Pass a function to the action prop of form to run the function when the form is submitted. formData will be passed to the function as an argument so you can access the data submitted by the form. This differs from the conventional HTML action, which only accepts URLs. After the action function succeeds, all uncontrolled field elements in the form are reset.

Render a <form> with an input and submit button. Pass a Server Function (a function marked with 'use server') to the action prop of form to run the function when the form is submitted.

Passing a Server Function to <form action> allow users to submit forms without JavaScript enabled or before the code has loaded. This is beneficial to users who have a slow connection, device, or have JavaScript disabled and is similar to the way forms work when a URL is passed to the action prop.

You can use hidden form fields to provide data to the <form>’s action. The Server Function will be called with the hidden form field data as an instance of FormData.

In lieu of using hidden form fields to provide data to the <form>’s action, you can call the bind method to supply it with extra arguments. This will bind a new argument (productId) to the function in addition to the formData that is passed as an argument to the function.

When <form> is rendered by a Server Component, and a Server Function is passed to the <form>’s action prop, the form is progressively enhanced.

To display a pending state when a form is being submitted, you can call the useFormStatus Hook in a component rendered in a <form> and read the pending property returned.

Here, we use the pending property to indicate the form is submitting.

To learn more about the useFormStatus Hook see the reference documentation.

The useOptimistic Hook provides a way to optimistically update the user interface before a background operation, like a network request, completes. In the context of forms, this technique helps to make apps feel more responsive. When a user submits a form, instead of waiting for the server’s response to reflect the changes, the interface is immediately updated with the expected outcome.

For example, when a user types a message into the form and hits the “Send” button, the useOptimistic Hook allows the message to immediately appear in the list with a “Sending…” label, even before the message is actually sent to a server. This “optimistic” approach gives the impression of speed and responsiveness. The form then attempts to truly send the message in the background. Once the server confirms the message has been received, the “Sending…” label is removed.

In some cases the function called by a <form>’s action prop throws an error. You can handle these errors by wrapping <form> in an Error Boundary. If the function called by a <form>’s action prop throws an error, the fallback for the error boundary will be displayed.

Displaying a form submission error message before the JavaScript bundle loads for progressive enhancement requires that:

useActionState takes two parameters: a Server Function and an initial state. useActionState returns two values, a state variable and an action. The action returned by useActionState should be passed to the action prop of the form. The state variable returned by useActionState can be used to display an error message. The value returned by the Server Function passed to useActionState will be used to update the state variable.

Learn more about updating state from a form action with the useActionState docs

Forms can be designed to handle multiple submission actions based on the button pressed by the user. Each button inside a form can be associated with a distinct action or behavior by setting the formAction prop.

When a user taps a specific button, the form is submitted, and a corresponding action, defined by that button’s attributes and action, is executed. For instance, a form might submit an article for review by default but have a separate button with formAction set to save the article as a draft.

**Examples:**

Example 1 (jsx):
```jsx
<form action={search}>    <input name="query" />    <button type="submit">Search</button></form>
```

Example 2 (jsx):
```jsx
<form action={search}>    <input name="query" />    <button type="submit">Search</button></form>
```

Example 3 (javascript):
```javascript
import { updateCart } from './lib.js';function AddToCart({productId}) {  async function addToCart(formData) {    'use server'    const productId = formData.get('productId')    await updateCart(productId)  }  return (    <form action={addToCart}>        <input type="hidden" name="productId" value={productId} />        <button type="submit">Add to Cart</button>    </form>  );}
```

Example 4 (javascript):
```javascript
import { updateCart } from './lib.js';function AddToCart({productId}) {  async function addToCart(productId, formData) {    "use server";    await updateCart(productId)  }  const addProductToCart = addToCart.bind(null, productId);  return (    <form action={addProductToCart}>      <button type="submit">Add to Cart</button>    </form>  );}
```

---

## <input>

**URL:** https://react.dev/reference/react-dom/components/input

**Contents:**
- <input>
- Reference
  - <input>
    - Props
    - Caveats
- Usage
  - Displaying inputs of different types
  - Providing a label for an input
  - Providing an initial value for an input
  - Reading the input values when submitting a form

The built-in browser <input> component lets you render different kinds of form inputs.

To display an input, render the built-in browser <input> component.

See more examples below.

<input> supports all common element props.

You can make an input controlled by passing one of these props:

When you pass either of them, you must also pass an onChange handler that updates the passed value.

These <input> props are only relevant for uncontrolled inputs:

These <input> props are relevant both for uncontrolled and controlled inputs:

To display an input, render an <input> component. By default, it will be a text input. You can pass type="checkbox" for a checkbox, type="radio" for a radio button, or one of the other input types.

Typically, you will place every <input> inside a <label> tag. This tells the browser that this label is associated with that input. When the user clicks the label, the browser will automatically focus the input. It’s also essential for accessibility: a screen reader will announce the label caption when the user focuses the associated input.

If you can’t nest <input> into a <label>, associate them by passing the same ID to <input id> and <label htmlFor>. To avoid conflicts between multiple instances of one component, generate such an ID with useId.

You can optionally specify the initial value for any input. Pass it as the defaultValue string for text inputs. Checkboxes and radio buttons should specify the initial value with the defaultChecked boolean instead.

Add a <form> around your inputs with a <button type="submit"> inside. It will call your <form onSubmit> event handler. By default, the browser will send the form data to the current URL and refresh the page. You can override that behavior by calling e.preventDefault(). Read the form data with new FormData(e.target).

Give a name to every <input>, for example <input name="firstName" defaultValue="Taylor" />. The name you specified will be used as a key in the form data, for example { firstName: "Taylor" }.

By default, a <button> inside a <form> without a type attribute will submit it. This can be surprising! If you have your own custom Button React component, consider using <button type="button"> instead of <button> (with no type). Then, to be explicit, use <button type="submit"> for buttons that are supposed to submit the form.

An input like <input /> is uncontrolled. Even if you pass an initial value like <input defaultValue="Initial text" />, your JSX only specifies the initial value. It does not control what the value should be right now.

To render a controlled input, pass the value prop to it (or checked for checkboxes and radios). React will force the input to always have the value you passed. Usually, you would do this by declaring a state variable:

A controlled input makes sense if you needed state anyway—for example, to re-render your UI on every edit:

It’s also useful if you want to offer multiple ways to adjust the input state (for example, by clicking a button):

The value you pass to controlled components should not be undefined or null. If you need the initial value to be empty (such as with the firstName field below), initialize your state variable to an empty string ('').

If you pass value without onChange, it will be impossible to type into the input. When you control an input by passing some value to it, you force it to always have the value you passed. So if you pass a state variable as a value but forget to update that state variable synchronously during the onChange event handler, React will revert the input after every keystroke back to the value that you specified.

When you use a controlled input, you set the state on every keystroke. If the component containing your state re-renders a large tree, this can get slow. There’s a few ways you can optimize re-rendering performance.

For example, suppose you start with a form that re-renders all page content on every keystroke:

Since <PageContent /> doesn’t rely on the input state, you can move the input state into its own component:

This significantly improves performance because now only SignupForm re-renders on every keystroke.

If there is no way to avoid re-rendering (for example, if PageContent depends on the search input’s value), useDeferredValue lets you keep the controlled input responsive even in the middle of a large re-render.

If you render an input with value but no onChange, you will see an error in the console:

As the error message suggests, if you only wanted to specify the initial value, pass defaultValue instead:

If you want to control this input with a state variable, specify an onChange handler:

If the value is intentionally read-only, add a readOnly prop to suppress the error:

If you render a checkbox with checked but no onChange, you will see an error in the console:

As the error message suggests, if you only wanted to specify the initial value, pass defaultChecked instead:

If you want to control this checkbox with a state variable, specify an onChange handler:

You need to read e.target.checked rather than e.target.value for checkboxes.

If the checkbox is intentionally read-only, add a readOnly prop to suppress the error:

If you control an input, you must update its state variable to the input’s value from the DOM during onChange.

You can’t update it to something other than e.target.value (or e.target.checked for checkboxes):

You also can’t update it asynchronously:

To fix your code, update it synchronously to e.target.value:

If this doesn’t fix the problem, it’s possible that the input gets removed and re-added from the DOM on every keystroke. This can happen if you’re accidentally resetting state on every re-render, for example if the input or one of its parents always receives a different key attribute, or if you nest component function definitions (which is not supported and causes the “inner” component to always be considered a different tree).

If you provide a value to the component, it must remain a string throughout its lifetime.

You cannot pass value={undefined} first and later pass value="some string" because React won’t know whether you want the component to be uncontrolled or controlled. A controlled component should always receive a string value, not null or undefined.

If your value is coming from an API or a state variable, it might be initialized to null or undefined. In that case, either set it to an empty string ('') initially, or pass value={someValue ?? ''} to ensure value is a string.

Similarly, if you pass checked to a checkbox, ensure it’s always a boolean.

**Examples:**

Example 1 (jsx):
```jsx
<input name="myInput" />
```

Example 2 (jsx):
```jsx
function Form() {  const [firstName, setFirstName] = useState(''); // Declare a state variable...  // ...  return (    <input      value={firstName} // ...force the input's value to match the state variable...      onChange={e => setFirstName(e.target.value)} // ... and update the state variable on any edits!    />  );}
```

Example 3 (jsx):
```jsx
function Form() {  const [firstName, setFirstName] = useState('');  return (    <>      <label>        First name:        <input value={firstName} onChange={e => setFirstName(e.target.value)} />      </label>      {firstName !== '' && <p>Your name is {firstName}.</p>}      ...
```

Example 4 (jsx):
```jsx
function Form() {  // ...  const [age, setAge] = useState('');  const ageAsNumber = Number(age);  return (    <>      <label>        Age:        <input          value={age}          onChange={e => setAge(e.target.value)}          type="number"        />        <button onClick={() => setAge(ageAsNumber + 10)}>          Add 10 years        </button>
```

---

## <option>

**URL:** https://react.dev/reference/react-dom/components/option

**Contents:**
- <option>
- Reference
  - <option>
    - Props
    - Caveats
- Usage
  - Displaying a select box with options

The built-in browser <option> component lets you render an option inside a <select> box.

The built-in browser <option> component lets you render an option inside a <select> box.

See more examples below.

<option> supports all common element props.

Additionally, <option> supports these props:

Render a <select> with a list of <option> components inside to display a select box. Give each <option> a value representing the data to be submitted with the form.

Read more about displaying a <select> with a list of <option> components.

**Examples:**

Example 1 (jsx):
```jsx
<select>  <option value="someOption">Some option</option>  <option value="otherOption">Other option</option></select>
```

Example 2 (jsx):
```jsx
<select>  <option value="someOption">Some option</option>  <option value="otherOption">Other option</option></select>
```

---

## <progress>

**URL:** https://react.dev/reference/react-dom/components/progress

**Contents:**
- <progress>
- Reference
  - <progress>
    - Props
- Usage
  - Controlling a progress indicator

The built-in browser <progress> component lets you render a progress indicator.

To display a progress indicator, render the built-in browser <progress> component.

See more examples below.

<progress> supports all common element props.

Additionally, <progress> supports these props:

To display a progress indicator, render a <progress> component. You can pass a number value between 0 and the max value you specify. If you don’t pass a max value, it will assumed to be 1 by default.

If the operation is not ongoing, pass value={null} to put the progress indicator into an indeterminate state.

**Examples:**

Example 1 (jsx):
```jsx
<progress value={0.5} />
```

Example 2 (jsx):
```jsx
<progress value={0.5} />
```

---

## <select>

**URL:** https://react.dev/reference/react-dom/components/select

**Contents:**
- <select>
- Reference
  - <select>
    - Props
    - Caveats
- Usage
  - Displaying a select box with options
  - Providing a label for a select box
  - Providing an initially selected option
  - Pitfall

The built-in browser <select> component lets you render a select box with options.

To display a select box, render the built-in browser <select> component.

See more examples below.

<select> supports all common element props.

You can make a select box controlled by passing a value prop:

When you pass value, you must also pass an onChange handler that updates the passed value.

If your <select> is uncontrolled, you may pass the defaultValue prop instead:

These <select> props are relevant both for uncontrolled and controlled select boxes:

Render a <select> with a list of <option> components inside to display a select box. Give each <option> a value representing the data to be submitted with the form.

Typically, you will place every <select> inside a <label> tag. This tells the browser that this label is associated with that select box. When the user clicks the label, the browser will automatically focus the select box. It’s also essential for accessibility: a screen reader will announce the label caption when the user focuses the select box.

If you can’t nest <select> into a <label>, associate them by passing the same ID to <select id> and <label htmlFor>. To avoid conflicts between multiple instances of one component, generate such an ID with useId.

By default, the browser will select the first <option> in the list. To select a different option by default, pass that <option>’s value as the defaultValue to the <select> element.

Unlike in HTML, passing a selected attribute to an individual <option> is not supported.

Pass multiple={true} to the <select> to let the user select multiple options. In that case, if you also specify defaultValue to choose the initially selected options, it must be an array.

Add a <form> around your select box with a <button type="submit"> inside. It will call your <form onSubmit> event handler. By default, the browser will send the form data to the current URL and refresh the page. You can override that behavior by calling e.preventDefault(). Read the form data with new FormData(e.target).

Give a name to your <select>, for example <select name="selectedFruit" />. The name you specified will be used as a key in the form data, for example { selectedFruit: "orange" }.

If you use <select multiple={true}>, the FormData you’ll read from the form will include each selected value as a separate name-value pair. Look closely at the console logs in the example above.

By default, any <button> inside a <form> will submit it. This can be surprising! If you have your own custom Button React component, consider returning <button type="button"> instead of <button>. Then, to be explicit, use <button type="submit"> for buttons that are supposed to submit the form.

A select box like <select /> is uncontrolled. Even if you pass an initially selected value like <select defaultValue="orange" />, your JSX only specifies the initial value, not the value right now.

To render a controlled select box, pass the value prop to it. React will force the select box to always have the value you passed. Typically, you will control a select box by declaring a state variable:

This is useful if you want to re-render some part of the UI in response to every selection.

If you pass value without onChange, it will be impossible to select an option. When you control a select box by passing some value to it, you force it to always have the value you passed. So if you pass a state variable as a value but forget to update that state variable synchronously during the onChange event handler, React will revert the select box after every keystroke back to the value that you specified.

Unlike in HTML, passing a selected attribute to an individual <option> is not supported.

**Examples:**

Example 1 (jsx):
```jsx
<select>  <option value="someOption">Some option</option>  <option value="otherOption">Other option</option></select>
```

Example 2 (jsx):
```jsx
<select>  <option value="someOption">Some option</option>  <option value="otherOption">Other option</option></select>
```

Example 3 (jsx):
```jsx
function FruitPicker() {  const [selectedFruit, setSelectedFruit] = useState('orange'); // Declare a state variable...  // ...  return (    <select      value={selectedFruit} // ...force the select's value to match the state variable...      onChange={e => setSelectedFruit(e.target.value)} // ... and update the state variable on any change!    >      <option value="apple">Apple</option>      <option value="banana">Banana</option>      <option value="orange">Orange</option>    </select>  );}
```

---

## <textarea>

**URL:** https://react.dev/reference/react-dom/components/textarea

**Contents:**
- <textarea>
- Reference
  - <textarea>
    - Props
    - Caveats
- Usage
  - Displaying a text area
  - Providing a label for a text area
  - Providing an initial value for a text area
  - Pitfall

The built-in browser <textarea> component lets you render a multiline text input.

To display a text area, render the built-in browser <textarea> component.

See more examples below.

<textarea> supports all common element props.

You can make a text area controlled by passing a value prop:

When you pass value, you must also pass an onChange handler that updates the passed value.

If your <textarea> is uncontrolled, you may pass the defaultValue prop instead:

These <textarea> props are relevant both for uncontrolled and controlled text areas:

Render <textarea> to display a text area. You can specify its default size with the rows and cols attributes, but by default the user will be able to resize it. To disable resizing, you can specify resize: none in the CSS.

Typically, you will place every <textarea> inside a <label> tag. This tells the browser that this label is associated with that text area. When the user clicks the label, the browser will focus the text area. It’s also essential for accessibility: a screen reader will announce the label caption when the user focuses the text area.

If you can’t nest <textarea> into a <label>, associate them by passing the same ID to <textarea id> and <label htmlFor>. To avoid conflicts between instances of one component, generate such an ID with useId.

You can optionally specify the initial value for the text area. Pass it as the defaultValue string.

Unlike in HTML, passing initial text like <textarea>Some content</textarea> is not supported.

Add a <form> around your textarea with a <button type="submit"> inside. It will call your <form onSubmit> event handler. By default, the browser will send the form data to the current URL and refresh the page. You can override that behavior by calling e.preventDefault(). Read the form data with new FormData(e.target).

Give a name to your <textarea>, for example <textarea name="postContent" />. The name you specified will be used as a key in the form data, for example { postContent: "Your post" }.

By default, any <button> inside a <form> will submit it. This can be surprising! If you have your own custom Button React component, consider returning <button type="button"> instead of <button>. Then, to be explicit, use <button type="submit"> for buttons that are supposed to submit the form.

A text area like <textarea /> is uncontrolled. Even if you pass an initial value like <textarea defaultValue="Initial text" />, your JSX only specifies the initial value, not the value right now.

To render a controlled text area, pass the value prop to it. React will force the text area to always have the value you passed. Typically, you will control a text area by declaring a state variable:

This is useful if you want to re-render some part of the UI in response to every keystroke.

If you pass value without onChange, it will be impossible to type into the text area. When you control a text area by passing some value to it, you force it to always have the value you passed. So if you pass a state variable as a value but forget to update that state variable synchronously during the onChange event handler, React will revert the text area after every keystroke back to the value that you specified.

If you render a text area with value but no onChange, you will see an error in the console:

As the error message suggests, if you only wanted to specify the initial value, pass defaultValue instead:

If you want to control this text area with a state variable, specify an onChange handler:

If the value is intentionally read-only, add a readOnly prop to suppress the error:

If you control a text area, you must update its state variable to the text area’s value from the DOM during onChange.

You can’t update it to something other than e.target.value:

You also can’t update it asynchronously:

To fix your code, update it synchronously to e.target.value:

If this doesn’t fix the problem, it’s possible that the text area gets removed and re-added from the DOM on every keystroke. This can happen if you’re accidentally resetting state on every re-render. For example, this can happen if the text area or one of its parents always receives a different key attribute, or if you nest component definitions (which is not allowed in React and causes the “inner” component to remount on every render).

If you provide a value to the component, it must remain a string throughout its lifetime.

You cannot pass value={undefined} first and later pass value="some string" because React won’t know whether you want the component to be uncontrolled or controlled. A controlled component should always receive a string value, not null or undefined.

If your value is coming from an API or a state variable, it might be initialized to null or undefined. In that case, either set it to an empty string ('') initially, or pass value={someValue ?? ''} to ensure value is a string.

**Examples:**

Example 1 (jsx):
```jsx
<textarea />
```

Example 2 (jsx):
```jsx
<textarea name="postContent" />
```

Example 3 (jsx):
```jsx
function NewPost() {  const [postContent, setPostContent] = useState(''); // Declare a state variable...  // ...  return (    <textarea      value={postContent} // ...force the input's value to match the state variable...      onChange={e => setPostContent(e.target.value)} // ... and update the state variable on any edits!    />  );}
```

Example 4 (jsx):
```jsx
// 🔴 Bug: controlled text area with no onChange handler<textarea value={something} />
```

---

## <link>

**URL:** https://react.dev/reference/react-dom/components/link

**Contents:**
- <link>
- Reference
  - <link>
    - Props
    - Special rendering behavior
    - Special behavior for stylesheets
- Usage
  - Linking to related resources
  - Linking to a stylesheet
  - Note

The built-in browser <link> component lets you use external resources such as stylesheets or annotate the document with link metadata.

To link to external resources such as stylesheets, fonts, and icons, or to annotate the document with link metadata, render the built-in browser <link> component. You can render <link> from any component and React will in most cases place the corresponding DOM element in the document head.

See more examples below.

<link> supports all common element props.

These props apply when rel="stylesheet":

These props apply when rel="stylesheet" but disable React’s special treatment of stylesheets:

These props apply when rel="preload" or rel="modulepreload":

These props apply when rel="icon" or rel="apple-touch-icon":

These props apply in all cases:

Props that are not recommended for use with React:

React will always place the DOM element corresponding to the <link> component within the document’s <head>, regardless of where in the React tree it is rendered. The <head> is the only valid place for <link> to exist within the DOM, yet it’s convenient and keeps things composable if a component representing a specific page can render <link> components itself.

There are a few exceptions to this:

In addition, if the <link> is to a stylesheet (namely, it has rel="stylesheet" in its props), React treats it specially in the following ways:

There are two exception to this special behavior:

This special treatment comes with two caveats:

You can annotate the document with links to related resources such as an icon, canonical URL, or pingback. React will place this metadata within the document <head> regardless of where in the React tree it is rendered.

If a component depends on a certain stylesheet in order to be displayed correctly, you can render a link to that stylesheet within the component. Your component will suspend while the stylesheet is loading. You must supply the precedence prop, which tells React where to place this stylesheet relative to others — stylesheets with higher precedence can override those with lower precedence.

When you want to use a stylesheet, it can be beneficial to call the preinit function. Calling this function may allow the browser to start fetching the stylesheet earlier than if you just render a <link> component, for example by sending an HTTP Early Hints response.

Stylesheets can conflict with each other, and when they do, the browser goes with the one that comes later in the document. React lets you control the order of stylesheets with the precedence prop. In this example, three components render stylesheets, and the ones with the same precedence are grouped together in the <head>.

Note the precedence values themselves are arbitrary and their naming is up to you. React will infer that precedence values it discovers first are “lower” and precedence values it discovers later are “higher”.

If you render the same stylesheet from multiple components, React will place only a single <link> in the document head.

You can use the <link> component with the itemProp prop to annotate specific items within the document with links to related resources. In this case, React will not place these annotations within the document <head> but will place them like any other React component.

**Examples:**

Example 1 (jsx):
```jsx
<link rel="icon" href="favicon.ico" />
```

Example 2 (jsx):
```jsx
<link rel="icon" href="favicon.ico" />
```

Example 3 (jsx):
```jsx
<section itemScope>  <h3>Annotating specific items</h3>  <link itemProp="author" href="http://example.com/" />  <p>...</p></section>
```

---

## <meta>

**URL:** https://react.dev/reference/react-dom/components/meta

**Contents:**
- <meta>
- Reference
  - <meta>
    - Props
    - Special rendering behavior
- Usage
  - Annotating the document with metadata
  - Annotating specific items within the document with metadata

The built-in browser <meta> component lets you add metadata to the document.

To add document metadata, render the built-in browser <meta> component. You can render <meta> from any component and React will always place the corresponding DOM element in the document head.

See more examples below.

<meta> supports all common element props.

It should have exactly one of the following props: name, httpEquiv, charset, itemProp. The <meta> component does something different depending on which of these props is specified.

React will always place the DOM element corresponding to the <meta> component within the document’s <head>, regardless of where in the React tree it is rendered. The <head> is the only valid place for <meta> to exist within the DOM, yet it’s convenient and keeps things composable if a component representing a specific page can render <meta> components itself.

There is one exception to this: if <meta> has an itemProp prop, there is no special behavior, because in this case it doesn’t represent metadata about the document but rather metadata about a specific part of the page.

You can annotate the document with metadata such as keywords, a summary, or the author’s name. React will place this metadata within the document <head> regardless of where in the React tree it is rendered.

You can render the <meta> component from any component. React will put a <meta> DOM node in the document <head>.

You can use the <meta> component with the itemProp prop to annotate specific items within the document with metadata. In this case, React will not place these annotations within the document <head> but will place them like any other React component.

**Examples:**

Example 1 (jsx):
```jsx
<meta name="keywords" content="React, JavaScript, semantic markup, html" />
```

Example 2 (jsx):
```jsx
<meta name="keywords" content="React, JavaScript, semantic markup, html" />
```

Example 3 (jsx):
```jsx
<meta name="author" content="John Smith" /><meta name="keywords" content="React, JavaScript, semantic markup, html" /><meta name="description" content="API reference for the <meta> component in React DOM" />
```

Example 4 (jsx):
```jsx
<section itemScope>  <h3>Annotating specific items</h3>  <meta itemProp="description" content="API reference for using <meta> with itemProp" />  <p>...</p></section>
```

---

## <script>

**URL:** https://react.dev/reference/react-dom/components/script

**Contents:**
- <script>
- Reference
  - <script>
    - Props
    - Special rendering behavior
- Usage
  - Rendering an external script
  - Note
  - Rendering an inline script

The built-in browser <script> component lets you add a script to your document.

To add inline or external scripts to your document, render the built-in browser <script> component. You can render <script> from any component and React will in certain cases place the corresponding DOM element in the document head and de-duplicate identical scripts.

See more examples below.

<script> supports all common element props.

It should have either children or a src prop.

Other supported props:

Props that disable React’s special treatment of scripts:

Props that are not recommended for use with React:

React can move <script> components to the document’s <head> and de-duplicate identical scripts.

To opt into this behavior, provide the src and async={true} props. React will de-duplicate scripts if they have the same src. The async prop must be true to allow scripts to be safely moved.

This special treatment comes with two caveats:

If a component depends on certain scripts in order to be displayed correctly, you can render a <script> within the component. However, the component might be committed before the script has finished loading. You can start depending on the script content once the load event is fired e.g. by using the onLoad prop.

React will de-duplicate scripts that have the same src, inserting only one of them into the DOM even if multiple components render it.

When you want to use a script, it can be beneficial to call the preinit function. Calling this function may allow the browser to start fetching the script earlier than if you just render a <script> component, for example by sending an HTTP Early Hints response.

To include an inline script, render the <script> component with the script source code as its children. Inline scripts are not de-duplicated or moved to the document <head>.

**Examples:**

Example 1 (vue):
```vue
<script> alert("hi!") </script>
```

Example 2 (jsx):
```jsx
<script> alert("hi!") </script><script src="script.js" />
```

---

## <style>

**URL:** https://react.dev/reference/react-dom/components/style

**Contents:**
- <style>
- Reference
  - <style>
    - Props
    - Special rendering behavior
- Usage
  - Rendering an inline CSS stylesheet

The built-in browser <style> component lets you add inline CSS stylesheets to your document.

To add inline styles to your document, render the built-in browser <style> component. You can render <style> from any component and React will in certain cases place the corresponding DOM element in the document head and de-duplicate identical styles.

See more examples below.

<style> supports all common element props.

Props that are not recommended for use with React:

React can move <style> components to the document’s <head>, de-duplicate identical stylesheets, and suspend while the stylesheet is loading.

To opt into this behavior, provide the href and precedence props. React will de-duplicate styles if they have the same href. The precedence prop tells React where to rank the <style> DOM node relative to others in the document <head>, which determines which stylesheet can override the other.

This special treatment comes with three caveats:

If a component depends on certain CSS styles in order to be displayed correctly, you can render an inline stylesheet within the component.

The href prop should uniquely identify the stylesheet, because React will de-duplicate stylesheets that have the same href. If you supply a precedence prop, React will reorder inline stylesheets based on the order these values appear in the component tree.

Inline stylesheets will not trigger Suspense boundaries while they’re loading. Even if they load async resources like fonts or images.

**Examples:**

Example 1 (css):
```css
<style>{` p { color: red; } `}</style>
```

Example 2 (css):
```css
<style>{` p { color: red; } `}</style>
```

---

## <title>

**URL:** https://react.dev/reference/react-dom/components/title

**Contents:**
- <title>
- Reference
  - <title>
    - Props
    - Special rendering behavior
  - Pitfall
- Usage
  - Set the document title
  - Use variables in the title

The built-in browser <title> component lets you specify the title of the document.

To specify the title of the document, render the built-in browser <title> component. You can render <title> from any component and React will always place the corresponding DOM element in the document head.

See more examples below.

<title> supports all common element props.

React will always place the DOM element corresponding to the <title> component within the document’s <head>, regardless of where in the React tree it is rendered. The <head> is the only valid place for <title> to exist within the DOM, yet it’s convenient and keeps things composable if a component representing a specific page can render its <title> itself.

There are two exception to this:

Only render a single <title> at a time. If more than one component renders a <title> tag at the same time, React will place all of those titles in the document head. When this happens, the behavior of browsers and search engines is undefined.

Render the <title> component from any component with text as its children. React will put a <title> DOM node in the document <head>.

The children of the <title> component must be a single string of text. (Or a single number or a single object with a toString method.) It might not be obvious, but using JSX curly braces like this:

… actually causes the <title> component to get a two-element array as its children (the string "Results page" and the value of pageNumber). This will cause an error. Instead, use string interpolation to pass <title> a single string:

**Examples:**

Example 1 (typescript):
```typescript
<title>My Blog</title>
```

Example 2 (typescript):
```typescript
<title>My Blog</title>
```

Example 3 (typescript):
```typescript
<title>Results page {pageNumber}</title> // 🔴 Problem: This is not a single string
```

Example 4 (typescript):
```typescript
<title>{`Results page ${pageNumber}`}</title>
```

---

## prerender

**URL:** https://react.dev/reference/react-dom/static/prerender

**Contents:**
- prerender
  - Note
- Reference
  - prerender(reactNode, options?)
    - Parameters
    - Returns
    - Caveats
  - Note
  - When should I use prerender?
- Usage

prerender renders a React tree to a static HTML string using a Web Stream.

This API depends on Web Streams. For Node.js, use prerenderToNodeStream instead.

Call prerender to render your app to static HTML.

On the client, call hydrateRoot to make the server-generated HTML interactive.

See more examples below.

reactNode: A React node you want to render to HTML. For example, a JSX node like <App />. It is expected to represent the entire document, so the App component should render the <html> tag.

optional options: An object with static generation options.

prerender returns a Promise:

nonce is not an available option when prerendering. Nonces must be unique per request and if you use nonces to secure your application with CSP it would be inappropriate and insecure to include the nonce value in the prerender itself.

The static prerender API is used for static server-side generation (SSG). Unlike renderToString, prerender waits for all data to load before resolving. This makes it suitable for generating static HTML for a full page, including data that needs to be fetched using Suspense. To stream content as it loads, use a streaming server-side render (SSR) API like renderToReadableStream.

prerender can be aborted and later either continued with resumeAndPrerender or resumed with resume to support partial pre-rendering.

Call prerender to render your React tree to static HTML into a Readable Web Stream::

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

Call prerender to render your app to a static HTML string:

This will produce the initial non-interactive HTML output of your React components. On the client, you will need to call hydrateRoot to hydrate that server-generated HTML and make it interactive.

prerender waits for all data to load before finishing the static HTML generation and resolving. For example, consider a profile page that shows a cover, a sidebar with friends and photos, and a list of posts:

Imagine that <Posts /> needs to load some data, which takes some time. Ideally, you’d want wait for the posts to finish so it’s included in the HTML. To do this, you can use Suspense to suspend on the data, and prerender will wait for the suspended content to finish before resolving to the static HTML.

Only Suspense-enabled data sources will activate the Suspense component. They include:

Suspense does not detect when data is fetched inside an Effect or event handler.

The exact way you would load data in the Posts component above depends on your framework. If you use a Suspense-enabled framework, you’ll find the details in its data fetching documentation.

Suspense-enabled data fetching without the use of an opinionated framework is not yet supported. The requirements for implementing a Suspense-enabled data source are unstable and undocumented. An official API for integrating data sources with Suspense will be released in a future version of React.

You can force the prerender to “give up” after a timeout:

Any Suspense boundaries with incomplete children will be included in the prelude in the fallback state.

This can be used for partial prerendering together with resume or resumeAndPrerender.

The prerender response waits for the entire app to finish rendering, including waiting for all Suspense boundaries to resolve, before resolving. It is designed for static site generation (SSG) ahead of time and does not support streaming more content as it loads.

To stream content as it loads, use a streaming server render API like renderToReadableStream.

**Examples:**

Example 1 (swift):
```swift
const {prelude, postponed} = await prerender(reactNode, options?)
```

Example 2 (javascript):
```javascript
import { prerender } from 'react-dom/static';async function handler(request, response) {  const {prelude} = await prerender(<App />, {    bootstrapScripts: ['/main.js']  });  return new Response(prelude, {    headers: { 'content-type': 'text/html' },  });}
```

Example 3 (javascript):
```javascript
import { prerender } from 'react-dom/static';async function handler(request) {  const {prelude} = await prerender(<App />, {    bootstrapScripts: ['/main.js']  });  return new Response(prelude, {    headers: { 'content-type': 'text/html' },  });}
```

Example 4 (html):
```html
export default function App() {  return (    <html>      <head>        <meta charSet="utf-8" />        <meta name="viewport" content="width=device-width, initial-scale=1" />        <link rel="stylesheet" href="/styles.css"></link>        <title>My app</title>      </head>      <body>        <Router />      </body>    </html>  );}
```

---

## Server Components

**URL:** https://react.dev/reference/rsc/server-components

**Contents:**
- Server Components
  - Note
    - How do I build support for Server Components?
  - Server Components without a Server
  - Note
  - Server Components with a Server
  - Adding interactivity to Server Components
  - Note
    - There is no directive for Server Components.
  - Async components with Server Components

Server Components are a new type of Component that renders ahead of time, before bundling, in an environment separate from your client app or SSR server.

This separate environment is the “server” in React Server Components. Server Components can run once at build time on your CI server, or they can be run for each request using a web server.

While React Server Components in React 19 are stable and will not break between minor versions, the underlying APIs used to implement a React Server Components bundler or framework do not follow semver and may break between minors in React 19.x.

To support React Server Components as a bundler or framework, we recommend pinning to a specific React version, or using the Canary release. We will continue working with bundlers and frameworks to stabilize the APIs used to implement React Server Components in the future.

Server components can run at build time to read from the filesystem or fetch static content, so a web server is not required. For example, you may want to read static data from a content management system.

Without Server Components, it’s common to fetch static data on the client with an Effect:

This pattern means users need to download and parse an additional 75K (gzipped) of libraries, and wait for a second request to fetch the data after the page loads, just to render static content that will not change for the lifetime of the page.

With Server Components, you can render these components once at build time:

The rendered output can then be server-side rendered (SSR) to HTML and uploaded to a CDN. When the app loads, the client will not see the original Page component, or the expensive libraries for rendering the markdown. The client will only see the rendered output:

This means the content is visible during first page load, and the bundle does not include the expensive libraries needed to render the static content.

You may notice that the Server Component above is an async function:

Async Components are a new feature of Server Components that allow you to await in render.

See Async components with Server Components below.

Server Components can also run on a web server during a request for a page, letting you access your data layer without having to build an API. They are rendered before your application is bundled, and can pass data and JSX as props to Client Components.

Without Server Components, it’s common to fetch dynamic data on the client in an Effect:

With Server Components, you can read the data and render it in the component:

The bundler then combines the data, rendered Server Components and dynamic Client Components into a bundle. Optionally, that bundle can then be server-side rendered (SSR) to create the initial HTML for the page. When the page loads, the browser does not see the original Note and Author components; only the rendered output is sent to the client:

Server Components can be made dynamic by re-fetching them from a server, where they can access the data and render again. This new application architecture combines the simple “request/response” mental model of server-centric Multi-Page Apps with the seamless interactivity of client-centric Single-Page Apps, giving you the best of both worlds.

Server Components are not sent to the browser, so they cannot use interactive APIs like useState. To add interactivity to Server Components, you can compose them with Client Component using the "use client" directive.

A common misunderstanding is that Server Components are denoted by "use server", but there is no directive for Server Components. The "use server" directive is used for Server Functions.

For more info, see the docs for Directives.

In the following example, the Notes Server Component imports an Expandable Client Component that uses state to toggle its expanded state:

This works by first rendering Notes as a Server Component, and then instructing the bundler to create a bundle for the Client Component Expandable. In the browser, the Client Components will see output of the Server Components passed as props:

Server Components introduce a new way to write Components using async/await. When you await in an async component, React will suspend and wait for the promise to resolve before resuming rendering. This works across server/client boundaries with streaming support for Suspense.

You can even create a promise on the server, and await it on the client:

The note content is important data for the page to render, so we await it on the server. The comments are below the fold and lower-priority, so we start the promise on the server, and wait for it on the client with the use API. This will Suspend on the client, without blocking the note content from rendering.

Since async components are not supported on the client, we await the promise with use.

**Examples:**

Example 1 (jsx):
```jsx
// bundle.jsimport marked from 'marked'; // 35.9K (11.2K gzipped)import sanitizeHtml from 'sanitize-html'; // 206K (63.3K gzipped)function Page({page}) {  const [content, setContent] = useState('');  // NOTE: loads *after* first page render.  useEffect(() => {    fetch(`/api/content/${page}`).then((data) => {      setContent(data.content);    });  }, [page]);  return <div>{sanitizeHtml(marked(content))}</div>;}
```

Example 2 (javascript):
```javascript
// api.jsapp.get(`/api/content/:page`, async (req, res) => {  const page = req.params.page;  const content = await file.readFile(`${page}.md`);  res.send({content});});
```

Example 3 (javascript):
```javascript
import marked from 'marked'; // Not included in bundleimport sanitizeHtml from 'sanitize-html'; // Not included in bundleasync function Page({page}) {  // NOTE: loads *during* render, when the app is built.  const content = await file.readFile(`${page}.md`);  return <div>{sanitizeHtml(marked(content))}</div>;}
```

Example 4 (typescript):
```typescript
<div><!-- html for markdown --></div>
```

---

## cloneElement

**URL:** https://react.dev/reference/react/cloneElement

**Contents:**
- cloneElement
  - Pitfall
- Reference
  - cloneElement(element, props, ...children)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Overriding props of an element
  - Pitfall

Using cloneElement is uncommon and can lead to fragile code. See common alternatives.

cloneElement lets you create a new React element using another element as a starting point.

Call cloneElement to create a React element based on the element, but with different props and children:

See more examples below.

element: The element argument must be a valid React element. For example, it could be a JSX node like <Something />, the result of calling createElement, or the result of another cloneElement call.

props: The props argument must either be an object or null. If you pass null, the cloned element will retain all of the original element.props. Otherwise, for every prop in the props object, the returned element will “prefer” the value from props over the value from element.props. The rest of the props will be filled from the original element.props. If you pass props.key or props.ref, they will replace the original ones.

optional ...children: Zero or more child nodes. They can be any React nodes, including React elements, strings, numbers, portals, empty nodes (null, undefined, true, and false), and arrays of React nodes. If you don’t pass any ...children arguments, the original element.props.children will be preserved.

cloneElement returns a React element object with a few properties:

Usually, you’ll return the element from your component or make it a child of another element. Although you may read the element’s properties, it’s best to treat every element as opaque after it’s created, and only render it.

Cloning an element does not modify the original element.

You should only pass children as multiple arguments to cloneElement if they are all statically known, like cloneElement(element, null, child1, child2, child3). If your children are dynamic, pass the entire array as the third argument: cloneElement(element, null, listItems). This ensures that React will warn you about missing keys for any dynamic lists. For static lists this is not necessary because they never reorder.

cloneElement makes it harder to trace the data flow, so try the alternatives instead.

To override the props of some React element, pass it to cloneElement with the props you want to override:

Here, the resulting cloned element will be <Row title="Cabbage" isHighlighted={true} />.

Let’s walk through an example to see when it’s useful.

Imagine a List component that renders its children as a list of selectable rows with a “Next” button that changes which row is selected. The List component needs to render the selected Row differently, so it clones every <Row> child that it has received, and adds an extra isHighlighted: true or isHighlighted: false prop:

Let’s say the original JSX received by List looks like this:

By cloning its children, the List can pass extra information to every Row inside. The result looks like this:

Notice how pressing “Next” updates the state of the List, and highlights a different row:

To summarize, the List cloned the <Row /> elements it received and added an extra prop to them.

Cloning children makes it hard to tell how the data flows through your app. Try one of the alternatives.

Instead of using cloneElement, consider accepting a render prop like renderItem. Here, List receives renderItem as a prop. List calls renderItem for every item and passes isHighlighted as an argument:

The renderItem prop is called a “render prop” because it’s a prop that specifies how to render something. For example, you can pass a renderItem implementation that renders a <Row> with the given isHighlighted value:

The end result is the same as with cloneElement:

However, you can clearly trace where the isHighlighted value is coming from.

This pattern is preferred to cloneElement because it is more explicit.

Another alternative to cloneElement is to pass data through context.

For example, you can call createContext to define a HighlightContext:

Your List component can wrap every item it renders into a HighlightContext provider:

With this approach, Row does not need to receive an isHighlighted prop at all. Instead, it reads the context:

This allows the calling component to not know or worry about passing isHighlighted to <Row>:

Instead, List and Row coordinate the highlighting logic through context.

Learn more about passing data through context.

Another approach you can try is to extract the “non-visual” logic into your own Hook, and use the information returned by your Hook to decide what to render. For example, you could write a useList custom Hook like this:

Then you could use it like this:

The data flow is explicit, but the state is inside the useList custom Hook that you can use from any component:

This approach is particularly useful if you want to reuse this logic between different components.

**Examples:**

Example 1 (javascript):
```javascript
const clonedElement = cloneElement(element, props, ...children)
```

Example 2 (jsx):
```jsx
import { cloneElement } from 'react';// ...const clonedElement = cloneElement(  <Row title="Cabbage">    Hello  </Row>,  { isHighlighted: true },  'Goodbye');console.log(clonedElement); // <Row title="Cabbage" isHighlighted={true}>Goodbye</Row>
```

Example 3 (jsx):
```jsx
import { cloneElement } from 'react';// ...const clonedElement = cloneElement(  <Row title="Cabbage" />,  { isHighlighted: true });
```

Example 4 (jsx):
```jsx
export default function List({ children }) {  const [selectedIndex, setSelectedIndex] = useState(0);  return (    <div className="List">      {Children.map(children, (child, index) =>        cloneElement(child, {          isHighlighted: index === selectedIndex         })      )}
```

---

## Component

**URL:** https://react.dev/reference/react/Component

**Contents:**
- Component
  - Pitfall
- Reference
  - Component
  - context
  - Note
  - props
  - Note
  - state
  - Note

We recommend defining components as functions instead of classes. See how to migrate.

Component is the base class for the React components defined as JavaScript classes. Class components are still supported by React, but we don’t recommend using them in new code.

To define a React component as a class, extend the built-in Component class and define a render method:

Only the render method is required, other methods are optional.

See more examples below.

The context of a class component is available as this.context. It is only available if you specify which context you want to receive using static contextType.

A class component can only read one context at a time.

Reading this.context in class components is equivalent to useContext in function components.

The props passed to a class component are available as this.props.

Reading this.props in class components is equivalent to declaring props in function components.

The state of a class component is available as this.state. The state field must be an object. Do not mutate the state directly. If you wish to change the state, call setState with the new state.

Defining state in class components is equivalent to calling useState in function components.

The constructor runs before your class component mounts (gets added to the screen). Typically, a constructor is only used for two purposes in React. It lets you declare state and bind your class methods to the class instance:

If you use modern JavaScript syntax, constructors are rarely needed. Instead, you can rewrite this code above using the public class field syntax which is supported both by modern browsers and tools like Babel:

A constructor should not contain any side effects or subscriptions.

constructor should not return anything.

Do not run any side effects or subscriptions in the constructor. Instead, use componentDidMount for that.

Inside a constructor, you need to call super(props) before any other statement. If you don’t do that, this.props will be undefined while the constructor runs, which can be confusing and cause bugs.

Constructor is the only place where you can assign this.state directly. In all other methods, you need to use this.setState() instead. Do not call setState in the constructor.

When you use server rendering, the constructor will run on the server too, followed by the render method. However, lifecycle methods like componentDidMount or componentWillUnmount will not run on the server.

When Strict Mode is on, React will call constructor twice in development and then throw away one of the instances. This helps you notice the accidental side effects that need to be moved out of the constructor.

There is no exact equivalent for constructor in function components. To declare state in a function component, call useState. To avoid recalculating the initial state, pass a function to useState.

If you define componentDidCatch, React will call it when some child component (including distant children) throws an error during rendering. This lets you log that error to an error reporting service in production.

Typically, it is used together with static getDerivedStateFromError which lets you update state in response to an error and display an error message to the user. A component with these methods is called an Error Boundary.

error: The error that was thrown. In practice, it will usually be an instance of Error but this is not guaranteed because JavaScript allows to throw any value, including strings or even null.

info: An object containing additional information about the error. Its componentStack field contains a stack trace with the component that threw, as well as the names and source locations of all its parent components. In production, the component names will be minified. If you set up production error reporting, you can decode the component stack using sourcemaps the same way as you would do for regular JavaScript error stacks.

componentDidCatch should not return anything.

In the past, it was common to call setState inside componentDidCatch in order to update the UI and display the fallback error message. This is deprecated in favor of defining static getDerivedStateFromError.

Production and development builds of React slightly differ in the way componentDidCatch handles errors. In development, the errors will bubble up to window, which means that any window.onerror or window.addEventListener('error', callback) will intercept the errors that have been caught by componentDidCatch. In production, instead, the errors will not bubble up, which means any ancestor error handler will only receive errors not explicitly caught by componentDidCatch.

There is no direct equivalent for componentDidCatch in function components yet. If you’d like to avoid creating class components, write a single ErrorBoundary component like above and use it throughout your app. Alternatively, you can use the react-error-boundary package which does that for you.

If you define the componentDidMount method, React will call it when your component is added (mounted) to the screen. This is a common place to start data fetching, set up subscriptions, or manipulate the DOM nodes.

If you implement componentDidMount, you usually need to implement other lifecycle methods to avoid bugs. For example, if componentDidMount reads some state or props, you also have to implement componentDidUpdate to handle their changes, and componentWillUnmount to clean up whatever componentDidMount was doing.

componentDidMount does not take any parameters.

componentDidMount should not return anything.

When Strict Mode is on, in development React will call componentDidMount, then immediately call componentWillUnmount, and then call componentDidMount again. This helps you notice if you forgot to implement componentWillUnmount or if its logic doesn’t fully “mirror” what componentDidMount does.

Although you may call setState immediately in componentDidMount, it’s best to avoid that when you can. It will trigger an extra rendering, but it will happen before the browser updates the screen. This guarantees that even though the render will be called twice in this case, the user won’t see the intermediate state. Use this pattern with caution because it often causes performance issues. In most cases, you should be able to assign the initial state in the constructor instead. It can, however, be necessary for cases like modals and tooltips when you need to measure a DOM node before rendering something that depends on its size or position.

For many use cases, defining componentDidMount, componentDidUpdate, and componentWillUnmount together in class components is equivalent to calling useEffect in function components. In the rare cases where it’s important for the code to run before browser paint, useLayoutEffect is a closer match.

If you define the componentDidUpdate method, React will call it immediately after your component has been re-rendered with updated props or state. This method is not called for the initial render.

You can use it to manipulate the DOM after an update. This is also a common place to do network requests as long as you compare the current props to previous props (e.g. a network request may not be necessary if the props have not changed). Typically, you’d use it together with componentDidMount and componentWillUnmount:

prevProps: Props before the update. Compare prevProps to this.props to determine what changed.

prevState: State before the update. Compare prevState to this.state to determine what changed.

snapshot: If you implemented getSnapshotBeforeUpdate, snapshot will contain the value you returned from that method. Otherwise, it will be undefined.

componentDidUpdate should not return anything.

componentDidUpdate will not get called if shouldComponentUpdate is defined and returns false.

The logic inside componentDidUpdate should usually be wrapped in conditions comparing this.props with prevProps, and this.state with prevState. Otherwise, there’s a risk of creating infinite loops.

Although you may call setState immediately in componentDidUpdate, it’s best to avoid that when you can. It will trigger an extra rendering, but it will happen before the browser updates the screen. This guarantees that even though the render will be called twice in this case, the user won’t see the intermediate state. This pattern often causes performance issues, but it may be necessary for rare cases like modals and tooltips when you need to measure a DOM node before rendering something that depends on its size or position.

For many use cases, defining componentDidMount, componentDidUpdate, and componentWillUnmount together in class components is equivalent to calling useEffect in function components. In the rare cases where it’s important for the code to run before browser paint, useLayoutEffect is a closer match.

This API has been renamed from componentWillMount to UNSAFE_componentWillMount. The old name has been deprecated. In a future major version of React, only the new name will work.

Run the rename-unsafe-lifecycles codemod to automatically update your components.

This API has been renamed from componentWillReceiveProps to UNSAFE_componentWillReceiveProps. The old name has been deprecated. In a future major version of React, only the new name will work.

Run the rename-unsafe-lifecycles codemod to automatically update your components.

This API has been renamed from componentWillUpdate to UNSAFE_componentWillUpdate. The old name has been deprecated. In a future major version of React, only the new name will work.

Run the rename-unsafe-lifecycles codemod to automatically update your components.

If you define the componentWillUnmount method, React will call it before your component is removed (unmounted) from the screen. This is a common place to cancel data fetching or remove subscriptions.

The logic inside componentWillUnmount should “mirror” the logic inside componentDidMount. For example, if componentDidMount sets up a subscription, componentWillUnmount should clean up that subscription. If the cleanup logic in your componentWillUnmount reads some props or state, you will usually also need to implement componentDidUpdate to clean up resources (such as subscriptions) corresponding to the old props and state.

componentWillUnmount does not take any parameters.

componentWillUnmount should not return anything.

For many use cases, defining componentDidMount, componentDidUpdate, and componentWillUnmount together in class components is equivalent to calling useEffect in function components. In the rare cases where it’s important for the code to run before browser paint, useLayoutEffect is a closer match.

Forces a component to re-render.

Usually, this is not necessary. If your component’s render method only reads from this.props, this.state, or this.context, it will re-render automatically when you call setState inside your component or one of its parents. However, if your component’s render method reads directly from an external data source, you have to tell React to update the user interface when that data source changes. That’s what forceUpdate lets you do.

Try to avoid all uses of forceUpdate and only read from this.props and this.state in render.

forceUpdate does not return anything.

Reading an external data source and forcing class components to re-render in response to its changes with forceUpdate has been superseded by useSyncExternalStore in function components.

If you implement getSnapshotBeforeUpdate, React will call it immediately before React updates the DOM. It enables your component to capture some information from the DOM (e.g. scroll position) before it is potentially changed. Any value returned by this lifecycle method will be passed as a parameter to componentDidUpdate.

For example, you can use it in a UI like a chat thread that needs to preserve its scroll position during updates:

In the above example, it is important to read the scrollHeight property directly in getSnapshotBeforeUpdate. It is not safe to read it in render, UNSAFE_componentWillReceiveProps, or UNSAFE_componentWillUpdate because there is a potential time gap between these methods getting called and React updating the DOM.

prevProps: Props before the update. Compare prevProps to this.props to determine what changed.

prevState: State before the update. Compare prevState to this.state to determine what changed.

You should return a snapshot value of any type that you’d like, or null. The value you returned will be passed as the third argument to componentDidUpdate.

At the moment, there is no equivalent to getSnapshotBeforeUpdate for function components. This use case is very uncommon, but if you have the need for it, for now you’ll have to write a class component.

The render method is the only required method in a class component.

The render method should specify what you want to appear on the screen, for example:

React may call render at any moment, so you shouldn’t assume that it runs at a particular time. Usually, the render method should return a piece of JSX, but a few other return types (like strings) are supported. To calculate the returned JSX, the render method can read this.props, this.state, and this.context.

You should write the render method as a pure function, meaning that it should return the same result if props, state, and context are the same. It also shouldn’t contain side effects (like setting up subscriptions) or interact with the browser APIs. Side effects should happen either in event handlers or methods like componentDidMount.

render does not take any parameters.

render can return any valid React node. This includes React elements such as <div />, strings, numbers, portals, empty nodes (null, undefined, true, and false), and arrays of React nodes.

render should be written as a pure function of props, state, and context. It should not have side effects.

render will not get called if shouldComponentUpdate is defined and returns false.

When Strict Mode is on, React will call render twice in development and then throw away one of the results. This helps you notice the accidental side effects that need to be moved out of the render method.

There is no one-to-one correspondence between the render call and the subsequent componentDidMount or componentDidUpdate call. Some of the render call results may be discarded by React when it’s beneficial.

Call setState to update the state of your React component.

setState enqueues changes to the component state. It tells React that this component and its children need to re-render with the new state. This is the main way you’ll update the user interface in response to interactions.

Calling setState does not change the current state in the already executing code:

It only affects what this.state will return starting from the next render.

You can also pass a function to setState. It lets you update state based on the previous state:

You don’t have to do this, but it’s handy if you want to update state multiple times during the same event.

nextState: Either an object or a function.

optional callback: If specified, React will call the callback you’ve provided after the update is committed.

setState does not return anything.

Think of setState as a request rather than an immediate command to update the component. When multiple components update their state in response to an event, React will batch their updates and re-render them together in a single pass at the end of the event. In the rare case that you need to force a particular state update to be applied synchronously, you may wrap it in flushSync, but this may hurt performance.

setState does not update this.state immediately. This makes reading this.state right after calling setState a potential pitfall. Instead, use componentDidUpdate or the setState callback argument, either of which are guaranteed to fire after the update has been applied. If you need to set the state based on the previous state, you can pass a function to nextState as described above.

Calling setState in class components is similar to calling a set function in function components.

If you define shouldComponentUpdate, React will call it to determine whether a re-render can be skipped.

If you are confident you want to write it by hand, you may compare this.props with nextProps and this.state with nextState and return false to tell React the update can be skipped.

React calls shouldComponentUpdate before rendering when new props or state are being received. Defaults to true. This method is not called for the initial render or when forceUpdate is used.

Return true if you want the component to re-render. That’s the default behavior.

Return false to tell React that re-rendering can be skipped.

This method only exists as a performance optimization. If your component breaks without it, fix that first.

Consider using PureComponent instead of writing shouldComponentUpdate by hand. PureComponent shallowly compares props and state, and reduces the chance that you’ll skip a necessary update.

We do not recommend doing deep equality checks or using JSON.stringify in shouldComponentUpdate. It makes performance unpredictable and dependent on the data structure of every prop and state. In the best case, you risk introducing multi-second stalls to your application, and in the worst case you risk crashing it.

Returning false does not prevent child components from re-rendering when their state changes.

Returning false does not guarantee that the component will not re-render. React will use the return value as a hint but it may still choose to re-render your component if it makes sense to do for other reasons.

Optimizing class components with shouldComponentUpdate is similar to optimizing function components with memo. Function components also offer more granular optimization with useMemo.

If you define UNSAFE_componentWillMount, React will call it immediately after the constructor. It only exists for historical reasons and should not be used in any new code. Instead, use one of the alternatives:

See examples of migrating away from unsafe lifecycles.

UNSAFE_componentWillMount does not take any parameters.

UNSAFE_componentWillMount should not return anything.

UNSAFE_componentWillMount will not get called if the component implements static getDerivedStateFromProps or getSnapshotBeforeUpdate.

Despite its naming, UNSAFE_componentWillMount does not guarantee that the component will get mounted if your app uses modern React features like Suspense. If a render attempt is suspended (for example, because the code for some child component has not loaded yet), React will throw the in-progress tree away and attempt to construct the component from scratch during the next attempt. This is why this method is “unsafe”. Code that relies on mounting (like adding a subscription) should go into componentDidMount.

UNSAFE_componentWillMount is the only lifecycle method that runs during server rendering. For all practical purposes, it is identical to constructor, so you should use the constructor for this type of logic instead.

Calling setState inside UNSAFE_componentWillMount in a class component to initialize state is equivalent to passing that state as the initial state to useState in a function component.

If you define UNSAFE_componentWillReceiveProps, React will call it when the component receives new props. It only exists for historical reasons and should not be used in any new code. Instead, use one of the alternatives:

See examples of migrating away from unsafe lifecycles.

UNSAFE_componentWillReceiveProps should not return anything.

UNSAFE_componentWillReceiveProps will not get called if the component implements static getDerivedStateFromProps or getSnapshotBeforeUpdate.

Despite its naming, UNSAFE_componentWillReceiveProps does not guarantee that the component will receive those props if your app uses modern React features like Suspense. If a render attempt is suspended (for example, because the code for some child component has not loaded yet), React will throw the in-progress tree away and attempt to construct the component from scratch during the next attempt. By the time of the next render attempt, the props might be different. This is why this method is “unsafe”. Code that should run only for committed updates (like resetting a subscription) should go into componentDidUpdate.

UNSAFE_componentWillReceiveProps does not mean that the component has received different props than the last time. You need to compare nextProps and this.props yourself to check if something changed.

React doesn’t call UNSAFE_componentWillReceiveProps with initial props during mounting. It only calls this method if some of component’s props are going to be updated. For example, calling setState doesn’t generally trigger UNSAFE_componentWillReceiveProps inside the same component.

Calling setState inside UNSAFE_componentWillReceiveProps in a class component to “adjust” state is equivalent to calling the set function from useState during rendering in a function component.

If you define UNSAFE_componentWillUpdate, React will call it before rendering with the new props or state. It only exists for historical reasons and should not be used in any new code. Instead, use one of the alternatives:

See examples of migrating away from unsafe lifecycles.

UNSAFE_componentWillUpdate should not return anything.

UNSAFE_componentWillUpdate will not get called if shouldComponentUpdate is defined and returns false.

UNSAFE_componentWillUpdate will not get called if the component implements static getDerivedStateFromProps or getSnapshotBeforeUpdate.

It’s not supported to call setState (or any method that leads to setState being called, like dispatching a Redux action) during componentWillUpdate.

Despite its naming, UNSAFE_componentWillUpdate does not guarantee that the component will update if your app uses modern React features like Suspense. If a render attempt is suspended (for example, because the code for some child component has not loaded yet), React will throw the in-progress tree away and attempt to construct the component from scratch during the next attempt. By the time of the next render attempt, the props and state might be different. This is why this method is “unsafe”. Code that should run only for committed updates (like resetting a subscription) should go into componentDidUpdate.

UNSAFE_componentWillUpdate does not mean that the component has received different props or state than the last time. You need to compare nextProps with this.props and nextState with this.state yourself to check if something changed.

React doesn’t call UNSAFE_componentWillUpdate with initial props and state during mounting.

There is no direct equivalent to UNSAFE_componentWillUpdate in function components.

If you want to read this.context from your class component, you must specify which context it needs to read. The context you specify as the static contextType must be a value previously created by createContext.

Reading this.context in class components is equivalent to useContext in function components.

You can define static defaultProps to set the default props for the class. They will be used for undefined and missing props, but not for null props.

For example, here is how you define that the color prop should default to 'blue':

If the color prop is not provided or is undefined, it will be set by default to 'blue':

Defining defaultProps in class components is similar to using default values in function components.

If you define static getDerivedStateFromError, React will call it when a child component (including distant children) throws an error during rendering. This lets you display an error message instead of clearing the UI.

Typically, it is used together with componentDidCatch which lets you send the error report to some analytics service. A component with these methods is called an Error Boundary.

static getDerivedStateFromError should return the state telling the component to display the error message.

There is no direct equivalent for static getDerivedStateFromError in function components yet. If you’d like to avoid creating class components, write a single ErrorBoundary component like above and use it throughout your app. Alternatively, use the react-error-boundary package which does that.

If you define static getDerivedStateFromProps, React will call it right before calling render, both on the initial mount and on subsequent updates. It should return an object to update the state, or null to update nothing.

This method exists for rare use cases where the state depends on changes in props over time. For example, this Form component resets the email state when the userID prop changes:

Note that this pattern requires you to keep a previous value of the prop (like userID) in state (like prevUserID).

Deriving state leads to verbose code and makes your components difficult to think about. Make sure you’re familiar with simpler alternatives:

static getDerivedStateFromProps return an object to update the state, or null to update nothing.

This method is fired on every render, regardless of the cause. This is different from UNSAFE_componentWillReceiveProps, which only fires when the parent causes a re-render and not as a result of a local setState.

This method doesn’t have access to the component instance. If you’d like, you can reuse some code between static getDerivedStateFromProps and the other class methods by extracting pure functions of the component props and state outside the class definition.

Implementing static getDerivedStateFromProps in a class component is equivalent to calling the set function from useState during rendering in a function component.

To define a React component as a class, extend the built-in Component class and define a render method:

React will call your render method whenever it needs to figure out what to display on the screen. Usually, you will return some JSX from it. Your render method should be a pure function: it should only calculate the JSX.

Similarly to function components, a class component can receive information by props from its parent component. However, the syntax for reading props is different. For example, if the parent component renders <Greeting name="Taylor" />, then you can read the name prop from this.props, like this.props.name:

Note that Hooks (functions starting with use, like useState) are not supported inside class components.

We recommend defining components as functions instead of classes. See how to migrate.

To add state to a class, assign an object to a property called state. To update state, call this.setState.

We recommend defining components as functions instead of classes. See how to migrate.

There are a few special methods you can define on your class.

If you define the componentDidMount method, React will call it when your component is added (mounted) to the screen. React will call componentDidUpdate after your component re-renders due to changed props or state. React will call componentWillUnmount after your component has been removed (unmounted) from the screen.

If you implement componentDidMount, you usually need to implement all three lifecycles to avoid bugs. For example, if componentDidMount reads some state or props, you also have to implement componentDidUpdate to handle their changes, and componentWillUnmount to clean up whatever componentDidMount was doing.

For example, this ChatRoom component keeps a chat connection synchronized with props and state:

Note that in development when Strict Mode is on, React will call componentDidMount, immediately call componentWillUnmount, and then call componentDidMount again. This helps you notice if you forgot to implement componentWillUnmount or if its logic doesn’t fully “mirror” what componentDidMount does.

We recommend defining components as functions instead of classes. See how to migrate.

By default, if your application throws an error during rendering, React will remove its UI from the screen. To prevent this, you can wrap a part of your UI into an Error Boundary. An Error Boundary is a special component that lets you display some fallback UI instead of the part that crashed—for example, an error message.

Error boundaries do not catch errors for:

To implement an Error Boundary component, you need to provide static getDerivedStateFromError which lets you update state in response to an error and display an error message to the user. You can also optionally implement componentDidCatch to add some extra logic, for example, to log the error to an analytics service.

With captureOwnerStack you can include the Owner Stack during development.

Then you can wrap a part of your component tree with it:

If Profile or its child component throws an error, ErrorBoundary will “catch” that error, display a fallback UI with the error message you’ve provided, and send a production error report to your error reporting service.

You don’t need to wrap every component into a separate Error Boundary. When you think about the granularity of Error Boundaries, consider where it makes sense to display an error message. For example, in a messaging app, it makes sense to place an Error Boundary around the list of conversations. It also makes sense to place one around every individual message. However, it wouldn’t make sense to place a boundary around every avatar.

There is currently no way to write an Error Boundary as a function component. However, you don’t have to write the Error Boundary class yourself. For example, you can use react-error-boundary instead.

Typically, you will define components as functions instead.

For example, suppose you’re converting this Greeting class component to a function:

Define a function called Greeting. This is where you will move the body of your render function.

Instead of this.props.name, define the name prop using the destructuring syntax and read it directly:

Here is a complete example:

Suppose you’re converting this Counter class component to a function:

Start by declaring a function with the necessary state variables:

Next, convert the event handlers:

Finally, replace all references starting with this with the variables and functions you defined in your component. For example, replace this.state.age with age, and replace this.handleNameChange with handleNameChange.

Here is a fully converted component:

Suppose you’re converting this ChatRoom class component with lifecycle methods to a function:

First, verify that your componentWillUnmount does the opposite of componentDidMount. In the above example, that’s true: it disconnects the connection that componentDidMount sets up. If such logic is missing, add it first.

Next, verify that your componentDidUpdate method handles changes to any props and state you’re using in componentDidMount. In the above example, componentDidMount calls setupConnection which reads this.state.serverUrl and this.props.roomId. This is why componentDidUpdate checks whether this.state.serverUrl and this.props.roomId have changed, and resets the connection if they did. If your componentDidUpdate logic is missing or doesn’t handle changes to all relevant props and state, fix that first.

In the above example, the logic inside the lifecycle methods connects the component to a system outside of React (a chat server). To connect a component to an external system, describe this logic as a single Effect:

This useEffect call is equivalent to the logic in the lifecycle methods above. If your lifecycle methods do multiple unrelated things, split them into multiple independent Effects. Here is a complete example you can play with:

If your component does not synchronize with any external systems, you might not need an Effect.

In this example, the Panel and Button class components read context from this.context:

When you convert them to function components, replace this.context with useContext calls:

**Examples:**

Example 1 (jsx):
```jsx
class Greeting extends Component {  render() {    return <h1>Hello, {this.props.name}!</h1>;  }}
```

Example 2 (jsx):
```jsx
import { Component } from 'react';class Greeting extends Component {  render() {    return <h1>Hello, {this.props.name}!</h1>;  }}
```

Example 3 (jsx):
```jsx
class Button extends Component {  static contextType = ThemeContext;  render() {    const theme = this.context;    const className = 'button-' + theme;    return (      <button className={className}>        {this.props.children}      </button>    );  }}
```

Example 4 (jsx):
```jsx
class Greeting extends Component {  render() {    return <h1>Hello, {this.props.name}!</h1>;  }}<Greeting name="Taylor" />
```

---

## createElement

**URL:** https://react.dev/reference/react/createElement

**Contents:**
- createElement
- Reference
  - createElement(type, props, ...children)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Creating an element without JSX
      - Deep Dive
    - What is a React element, exactly?

createElement lets you create a React element. It serves as an alternative to writing JSX.

Call createElement to create a React element with the given type, props, and children.

See more examples below.

type: The type argument must be a valid React component type. For example, it could be a tag name string (such as 'div' or 'span'), or a React component (a function, a class, or a special component like Fragment).

props: The props argument must either be an object or null. If you pass null, it will be treated the same as an empty object. React will create an element with props matching the props you have passed. Note that ref and key from your props object are special and will not be available as element.props.ref and element.props.key on the returned element. They will be available as element.ref and element.key.

optional ...children: Zero or more child nodes. They can be any React nodes, including React elements, strings, numbers, portals, empty nodes (null, undefined, true, and false), and arrays of React nodes.

createElement returns a React element object with a few properties:

Usually, you’ll return the element from your component or make it a child of another element. Although you may read the element’s properties, it’s best to treat every element as opaque after it’s created, and only render it.

You must treat React elements and their props as immutable and never change their contents after creation. In development, React will freeze the returned element and its props property shallowly to enforce this.

When you use JSX, you must start a tag with a capital letter to render your own custom component. In other words, <Something /> is equivalent to createElement(Something), but <something /> (lowercase) is equivalent to createElement('something') (note it’s a string, so it will be treated as a built-in HTML tag).

You should only pass children as multiple arguments to createElement if they are all statically known, like createElement('h1', {}, child1, child2, child3). If your children are dynamic, pass the entire array as the third argument: createElement('ul', {}, listItems). This ensures that React will warn you about missing keys for any dynamic lists. For static lists this is not necessary because they never reorder.

If you don’t like JSX or can’t use it in your project, you can use createElement as an alternative.

To create an element without JSX, call createElement with some type, props, and children:

The children are optional, and you can pass as many as you need (the example above has three children). This code will display a <h1> header with a greeting. For comparison, here is the same example rewritten with JSX:

To render your own React component, pass a function like Greeting as the type instead of a string like 'h1':

With JSX, it would look like this:

Here is a complete example written with createElement:

And here is the same example written using JSX:

Both coding styles are fine, so you can use whichever one you prefer for your project. The main benefit of using JSX compared to createElement is that it’s easy to see which closing tag corresponds to which opening tag.

An element is a lightweight description of a piece of the user interface. For example, both <Greeting name="Taylor" /> and createElement(Greeting, { name: 'Taylor' }) produce an object like this:

Note that creating this object does not render the Greeting component or create any DOM elements.

A React element is more like a description—an instruction for React to later render the Greeting component. By returning this object from your App component, you tell React what to do next.

Creating elements is extremely cheap so you don’t need to try to optimize or avoid it.

**Examples:**

Example 1 (javascript):
```javascript
const element = createElement(type, props, ...children)
```

Example 2 (javascript):
```javascript
import { createElement } from 'react';function Greeting({ name }) {  return createElement(    'h1',    { className: 'greeting' },    'Hello'  );}
```

Example 3 (javascript):
```javascript
import { createElement } from 'react';function Greeting({ name }) {  return createElement(    'h1',    { className: 'greeting' },    'Hello ',    createElement('i', null, name),    '. Welcome!'  );}
```

Example 4 (jsx):
```jsx
function Greeting({ name }) {  return (    <h1 className="greeting">      Hello <i>{name}</i>. Welcome!    </h1>  );}
```

---

## createRef

**URL:** https://react.dev/reference/react/createRef

**Contents:**
- createRef
  - Pitfall
- Reference
  - createRef()
    - Parameters
    - Returns
    - Caveats
- Usage
  - Declaring a ref in a class component
  - Pitfall

createRef is mostly used for class components. Function components typically rely on useRef instead.

createRef creates a ref object which can contain arbitrary value.

Call createRef to declare a ref inside a class component.

See more examples below.

createRef takes no parameters.

createRef returns an object with a single property:

To declare a ref inside a class component, call createRef and assign its result to a class field:

If you now pass ref={this.inputRef} to an <input> in your JSX, React will populate this.inputRef.current with the input DOM node. For example, here is how you make a button that focuses the input:

createRef is mostly used for class components. Function components typically rely on useRef instead.

We recommend using function components instead of class components in new code. If you have some existing class components using createRef, here is how you can convert them. This is the original code:

When you convert this component from a class to a function, replace calls to createRef with calls to useRef:

**Examples:**

Example 1 (gdscript):
```gdscript
class MyInput extends Component {  inputRef = createRef();  // ...}
```

Example 2 (gdscript):
```gdscript
import { createRef, Component } from 'react';class MyComponent extends Component {  intervalRef = createRef();  inputRef = createRef();  // ...
```

Example 3 (gdscript):
```gdscript
import { Component, createRef } from 'react';class Form extends Component {  inputRef = createRef();  // ...}
```

---

## forwardRef

**URL:** https://react.dev/reference/react/forwardRef

**Contents:**
- forwardRef
  - Deprecated
- Reference
  - forwardRef(render)
    - Parameters
    - Returns
    - Caveats
  - render function
    - Parameters
    - Returns

In React 19, forwardRef is no longer necessary. Pass ref as a prop instead.

forwardRef will be deprecated in a future release. Learn more here.

forwardRef lets your component expose a DOM node to the parent component with a ref.

Call forwardRef() to let your component receive a ref and forward it to a child component:

See more examples below.

forwardRef returns a React component that you can render in JSX. Unlike React components defined as plain functions, a component returned by forwardRef is also able to receive a ref prop.

forwardRef accepts a render function as an argument. React calls this function with props and ref:

props: The props passed by the parent component.

ref: The ref attribute passed by the parent component. The ref can be an object or a function. If the parent component has not passed a ref, it will be null. You should either pass the ref you receive to another component, or pass it to useImperativeHandle.

forwardRef returns a React component that you can render in JSX. Unlike React components defined as plain functions, the component returned by forwardRef is able to take a ref prop.

By default, each component’s DOM nodes are private. However, sometimes it’s useful to expose a DOM node to the parent—for example, to allow focusing it. To opt in, wrap your component definition into forwardRef():

You will receive a ref as the second argument after props. Pass it to the DOM node that you want to expose:

This lets the parent Form component access the <input> DOM node exposed by MyInput:

This Form component passes a ref to MyInput. The MyInput component forwards that ref to the <input> browser tag. As a result, the Form component can access that <input> DOM node and call focus() on it.

Keep in mind that exposing a ref to the DOM node inside your component makes it harder to change your component’s internals later. You will typically expose DOM nodes from reusable low-level components like buttons or text inputs, but you won’t do it for application-level components like an avatar or a comment.

Clicking the button will focus the input. The Form component defines a ref and passes it to the MyInput component. The MyInput component forwards that ref to the browser <input>. This lets the Form component focus the <input>.

Instead of forwarding a ref to a DOM node, you can forward it to your own component like MyInput:

If that MyInput component forwards a ref to its <input>, a ref to FormField will give you that <input>:

The Form component defines a ref and passes it to FormField. The FormField component forwards that ref to MyInput, which forwards it to a browser <input> DOM node. This is how Form accesses that DOM node.

Instead of exposing an entire DOM node, you can expose a custom object, called an imperative handle, with a more constrained set of methods. To do this, you’d need to define a separate ref to hold the DOM node:

Pass the ref you received to useImperativeHandle and specify the value you want to expose to the ref:

If some component gets a ref to MyInput, it will only receive your { focus, scrollIntoView } object instead of the DOM node. This lets you limit the information you expose about your DOM node to the minimum.

Read more about using imperative handles.

Do not overuse refs. You should only use refs for imperative behaviors that you can’t express as props: for example, scrolling to a node, focusing a node, triggering an animation, selecting text, and so on.

If you can express something as a prop, you should not use a ref. For example, instead of exposing an imperative handle like { open, close } from a Modal component, it is better to take isOpen as a prop like <Modal isOpen={isOpen} />. Effects can help you expose imperative behaviors via props.

This usually means that you forgot to actually use the ref that you received.

For example, this component doesn’t do anything with its ref:

To fix it, pass the ref down to a DOM node or another component that can accept a ref:

The ref to MyInput could also be null if some of the logic is conditional:

If showInput is false, then the ref won’t be forwarded to any node, and a ref to MyInput will remain empty. This is particularly easy to miss if the condition is hidden inside another component, like Panel in this example:

**Examples:**

Example 1 (javascript):
```javascript
const SomeComponent = forwardRef(render)
```

Example 2 (javascript):
```javascript
import { forwardRef } from 'react';const MyInput = forwardRef(function MyInput(props, ref) {  // ...});
```

Example 3 (javascript):
```javascript
const MyInput = forwardRef(function MyInput(props, ref) {  return (    <label>      {props.label}      <input ref={ref} />    </label>  );});
```

Example 4 (javascript):
```javascript
import { forwardRef } from 'react';const MyInput = forwardRef(function MyInput(props, ref) {  const { label, ...otherProps } = props;  return (    <label>      {label}      <input {...otherProps} />    </label>  );});
```

---

## PureComponent

**URL:** https://react.dev/reference/react/PureComponent

**Contents:**
- PureComponent
  - Pitfall
- Reference
  - PureComponent
- Usage
  - Skipping unnecessary re-renders for class components
  - Pitfall
- Alternatives
  - Migrating from a PureComponent class component to a function
  - Note

We recommend defining components as functions instead of classes. See how to migrate.

PureComponent is similar to Component but it skips re-renders for same props and state. Class components are still supported by React, but we don’t recommend using them in new code.

To skip re-rendering a class component for same props and state, extend PureComponent instead of Component:

PureComponent is a subclass of Component and supports all the Component APIs. Extending PureComponent is equivalent to defining a custom shouldComponentUpdate method that shallowly compares props and state.

See more examples below.

React normally re-renders a component whenever its parent re-renders. As an optimization, you can create a component that React will not re-render when its parent re-renders so long as its new props and state are the same as the old props and state. Class components can opt into this behavior by extending PureComponent:

A React component should always have pure rendering logic. This means that it must return the same output if its props, state, and context haven’t changed. By using PureComponent, you are telling React that your component complies with this requirement, so React doesn’t need to re-render as long as its props and state haven’t changed. However, your component will still re-render if a context that it’s using changes.

In this example, notice that the Greeting component re-renders whenever name is changed (because that’s one of its props), but not when address is changed (because it’s not passed to Greeting as a prop):

We recommend defining components as functions instead of classes. See how to migrate.

We recommend using function components instead of class components in new code. If you have some existing class components using PureComponent, here is how you can convert them. This is the original code:

When you convert this component from a class to a function, wrap it in memo:

Unlike PureComponent, memo does not compare the new and the old state. In function components, calling the set function with the same state already prevents re-renders by default, even without memo.

**Examples:**

Example 1 (jsx):
```jsx
class Greeting extends PureComponent {  render() {    return <h1>Hello, {this.props.name}!</h1>;  }}
```

Example 2 (jsx):
```jsx
import { PureComponent } from 'react';class Greeting extends PureComponent {  render() {    return <h1>Hello, {this.props.name}!</h1>;  }}
```

Example 3 (jsx):
```jsx
class Greeting extends PureComponent {  render() {    return <h1>Hello, {this.props.name}!</h1>;  }}
```

---

## Adding Interactivity

**URL:** https://react.dev/learn/adding-interactivity

**Contents:**
- Adding Interactivity
  - In this chapter
- Responding to events
- Ready to learn this topic?
- State: a component’s memory
- Ready to learn this topic?
- Render and commit
- Ready to learn this topic?
- State as a snapshot
- Ready to learn this topic?

Some things on the screen update in response to user input. For example, clicking an image gallery switches the active image. In React, data that changes over time is called state. You can add state to any component, and update it as needed. In this chapter, you’ll learn how to write components that handle interactions, update their state, and display different output over time.

React lets you add event handlers to your JSX. Event handlers are your own functions that will be triggered in response to user interactions like clicking, hovering, focusing on form inputs, and so on.

Built-in components like <button> only support built-in browser events like onClick. However, you can also create your own components, and give their event handler props any application-specific names that you like.

Read Responding to Events to learn how to add event handlers.

Components often need to change what’s on the screen as a result of an interaction. Typing into the form should update the input field, clicking “next” on an image carousel should change which image is displayed, clicking “buy” puts a product in the shopping cart. Components need to “remember” things: the current input value, the current image, the shopping cart. In React, this kind of component-specific memory is called state.

You can add state to a component with a useState Hook. Hooks are special functions that let your components use React features (state is one of those features). The useState Hook lets you declare a state variable. It takes the initial state and returns a pair of values: the current state, and a state setter function that lets you update it.

Here is how an image gallery uses and updates state on click:

Read State: A Component’s Memory to learn how to remember a value and update it on interaction.

Before your components are displayed on the screen, they must be rendered by React. Understanding the steps in this process will help you think about how your code executes and explain its behavior.

Imagine that your components are cooks in the kitchen, assembling tasty dishes from ingredients. In this scenario, React is the waiter who puts in requests from customers and brings them their orders. This process of requesting and serving UI has three steps:

Illustrated by Rachel Lee Nabors

Read Render and Commit to learn the lifecycle of a UI update.

Unlike regular JavaScript variables, React state behaves more like a snapshot. Setting it does not change the state variable you already have, but instead triggers a re-render. This can be surprising at first!

This behavior helps you avoid subtle bugs. Here is a little chat app. Try to guess what happens if you press “Send” first and then change the recipient to Bob. Whose name will appear in the alert five seconds later?

Read State as a Snapshot to learn why state appears “fixed” and unchanging inside the event handlers.

This component is buggy: clicking “+3” increments the score only once.

State as a Snapshot explains why this is happening. Setting state requests a new re-render, but does not change it in the already running code. So score continues to be 0 right after you call setScore(score + 1).

You can fix this by passing an updater function when setting state. Notice how replacing setScore(score + 1) with setScore(s => s + 1) fixes the “+3” button. This lets you queue multiple state updates.

Read Queueing a Series of State Updates to learn how to queue a sequence of state updates.

State can hold any kind of JavaScript value, including objects. But you shouldn’t change objects and arrays that you hold in the React state directly. Instead, when you want to update an object and array, you need to create a new one (or make a copy of an existing one), and then update the state to use that copy.

Usually, you will use the ... spread syntax to copy objects and arrays that you want to change. For example, updating a nested object could look like this:

If copying objects in code gets tedious, you can use a library like Immer to reduce repetitive code:

Read Updating Objects in State to learn how to update objects correctly.

Arrays are another type of mutable JavaScript objects you can store in state and should treat as read-only. Just like with objects, when you want to update an array stored in state, you need to create a new one (or make a copy of an existing one), and then set state to use the new array:

If copying arrays in code gets tedious, you can use a library like Immer to reduce repetitive code:

Read Updating Arrays in State to learn how to update arrays correctly.

Head over to Responding to Events to start reading this chapter page by page!

Or, if you’re already familiar with these topics, why not read about Managing State?

**Examples:**

Example 1 (jsx):
```jsx
const [index, setIndex] = useState(0);const [showMore, setShowMore] = useState(false);
```

Example 2 (javascript):
```javascript
console.log(count);  // 0setCount(count + 1); // Request a re-render with 1console.log(count);  // Still 0!
```

Example 3 (javascript):
```javascript
console.log(score);  // 0setScore(score + 1); // setScore(0 + 1);console.log(score);  // 0setScore(score + 1); // setScore(0 + 1);console.log(score);  // 0setScore(score + 1); // setScore(0 + 1);console.log(score);  // 0
```

---

## Passing Props to a Component

**URL:** https://react.dev/learn/passing-props-to-a-component

**Contents:**
- Passing Props to a Component
  - You will learn
- Familiar props
- Passing props to a component
  - Step 1: Pass props to the child component
  - Note
  - Step 2: Read props inside the child component
  - Pitfall
- Specifying a default value for a prop
- Forwarding props with the JSX spread syntax

React components use props to communicate with each other. Every parent component can pass some information to its child components by giving them props. Props might remind you of HTML attributes, but you can pass any JavaScript value through them, including objects, arrays, and functions.

Props are the information that you pass to a JSX tag. For example, className, src, alt, width, and height are some of the props you can pass to an <img>:

The props you can pass to an <img> tag are predefined (ReactDOM conforms to the HTML standard). But you can pass any props to your own components, such as <Avatar>, to customize them. Here’s how!

In this code, the Profile component isn’t passing any props to its child component, Avatar:

You can give Avatar some props in two steps.

First, pass some props to Avatar. For example, let’s pass two props: person (an object), and size (a number):

If double curly braces after person= confuse you, recall they’re merely an object inside the JSX curlies.

Now you can read these props inside the Avatar component.

You can read these props by listing their names person, size separated by the commas inside ({ and }) directly after function Avatar. This lets you use them inside the Avatar code, like you would with a variable.

Add some logic to Avatar that uses the person and size props for rendering, and you’re done.

Now you can configure Avatar to render in many different ways with different props. Try tweaking the values!

Props let you think about parent and child components independently. For example, you can change the person or the size props inside Profile without having to think about how Avatar uses them. Similarly, you can change how the Avatar uses these props, without looking at the Profile.

You can think of props like “knobs” that you can adjust. They serve the same role as arguments serve for functions—in fact, props are the only argument to your component! React component functions accept a single argument, a props object:

Usually you don’t need the whole props object itself, so you destructure it into individual props.

Don’t miss the pair of { and } curlies inside of ( and ) when declaring props:

This syntax is called “destructuring” and is equivalent to reading properties from a function parameter:

If you want to give a prop a default value to fall back on when no value is specified, you can do it with the destructuring by putting = and the default value right after the parameter:

Now, if <Avatar person={...} /> is rendered with no size prop, the size will be set to 100.

The default value is only used if the size prop is missing or if you pass size={undefined}. But if you pass size={null} or size={0}, the default value will not be used.

Sometimes, passing props gets very repetitive:

There’s nothing wrong with repetitive code—it can be more legible. But at times you may value conciseness. Some components forward all of their props to their children, like how this Profile does with Avatar. Because they don’t use any of their props directly, it can make sense to use a more concise “spread” syntax:

This forwards all of Profile’s props to the Avatar without listing each of their names.

Use spread syntax with restraint. If you’re using it in every other component, something is wrong. Often, it indicates that you should split your components and pass children as JSX. More on that next!

It is common to nest built-in browser tags:

Sometimes you’ll want to nest your own components the same way:

When you nest content inside a JSX tag, the parent component will receive that content in a prop called children. For example, the Card component below will receive a children prop set to <Avatar /> and render it in a wrapper div:

Try replacing the <Avatar> inside <Card> with some text to see how the Card component can wrap any nested content. It doesn’t need to “know” what’s being rendered inside of it. You will see this flexible pattern in many places.

You can think of a component with a children prop as having a “hole” that can be “filled in” by its parent components with arbitrary JSX. You will often use the children prop for visual wrappers: panels, grids, etc.

Illustrated by Rachel Lee Nabors

The Clock component below receives two props from its parent component: color and time. (The parent component’s code is omitted because it uses state, which we won’t dive into just yet.)

Try changing the color in the select box below:

This example illustrates that a component may receive different props over time. Props are not always static! Here, the time prop changes every second, and the color prop changes when you select another color. Props reflect a component’s data at any point in time, rather than only in the beginning.

However, props are immutable—a term from computer science meaning “unchangeable”. When a component needs to change its props (for example, in response to a user interaction or new data), it will have to “ask” its parent component to pass it different props—a new object! Its old props will then be cast aside, and eventually the JavaScript engine will reclaim the memory taken by them.

Don’t try to “change props”. When you need to respond to the user input (like changing the selected color), you will need to “set state”, which you can learn about in State: A Component’s Memory.

This Gallery component contains some very similar markup for two profiles. Extract a Profile component out of it to reduce the duplication. You’ll need to choose what props to pass to it.

**Examples:**

Example 1 (jsx):
```jsx
export default function Profile() {  return (    <Avatar />  );}
```

Example 2 (javascript):
```javascript
export default function Profile() {  return (    <Avatar      person={{ name: 'Lin Lanying', imageId: '1bX5QH6' }}      size={100}    />  );}
```

Example 3 (javascript):
```javascript
function Avatar({ person, size }) {  // person and size are available here}
```

Example 4 (javascript):
```javascript
function Avatar(props) {  let person = props.person;  let size = props.size;  // ...}
```

---

## Sharing State Between Components

**URL:** https://react.dev/learn/sharing-state-between-components

**Contents:**
- Sharing State Between Components
  - You will learn
- Lifting state up by example
  - Step 1: Remove state from the child components
  - Step 2: Pass hardcoded data from the common parent
  - Step 3: Add state to the common parent
      - Deep Dive
    - Controlled and uncontrolled components
- A single source of truth for each state
- Recap

Sometimes, you want the state of two components to always change together. To do it, remove state from both of them, move it to their closest common parent, and then pass it down to them via props. This is known as lifting state up, and it’s one of the most common things you will do writing React code.

In this example, a parent Accordion component renders two separate Panels:

Each Panel component has a boolean isActive state that determines whether its content is visible.

Press the Show button for both panels:

Notice how pressing one panel’s button does not affect the other panel—they are independent.

Initially, each Panel’s isActive state is false, so they both appear collapsed

Clicking either Panel’s button will only update that Panel’s isActive state alone

But now let’s say you want to change it so that only one panel is expanded at any given time. With that design, expanding the second panel should collapse the first one. How would you do that?

To coordinate these two panels, you need to “lift their state up” to a parent component in three steps:

This will allow the Accordion component to coordinate both Panels and only expand one at a time.

You will give control of the Panel’s isActive to its parent component. This means that the parent component will pass isActive to Panel as a prop instead. Start by removing this line from the Panel component:

And instead, add isActive to the Panel’s list of props:

Now the Panel’s parent component can control isActive by passing it down as a prop. Conversely, the Panel component now has no control over the value of isActive—it’s now up to the parent component!

To lift state up, you must locate the closest common parent component of both of the child components that you want to coordinate:

In this example, it’s the Accordion component. Since it’s above both panels and can control their props, it will become the “source of truth” for which panel is currently active. Make the Accordion component pass a hardcoded value of isActive (for example, true) to both panels:

Try editing the hardcoded isActive values in the Accordion component and see the result on the screen.

Lifting state up often changes the nature of what you’re storing as state.

In this case, only one panel should be active at a time. This means that the Accordion common parent component needs to keep track of which panel is the active one. Instead of a boolean value, it could use a number as the index of the active Panel for the state variable:

When the activeIndex is 0, the first panel is active, and when it’s 1, it’s the second one.

Clicking the “Show” button in either Panel needs to change the active index in Accordion. A Panel can’t set the activeIndex state directly because it’s defined inside the Accordion. The Accordion component needs to explicitly allow the Panel component to change its state by passing an event handler down as a prop:

The <button> inside the Panel will now use the onShow prop as its click event handler:

This completes lifting state up! Moving state into the common parent component allowed you to coordinate the two panels. Using the active index instead of two “is shown” flags ensured that only one panel is active at a given time. And passing down the event handler to the child allowed the child to change the parent’s state.

Initially, Accordion’s activeIndex is 0, so the first Panel receives isActive = true

When Accordion’s activeIndex state changes to 1, the second Panel receives isActive = true instead

It is common to call a component with some local state “uncontrolled”. For example, the original Panel component with an isActive state variable is uncontrolled because its parent cannot influence whether the panel is active or not.

In contrast, you might say a component is “controlled” when the important information in it is driven by props rather than its own local state. This lets the parent component fully specify its behavior. The final Panel component with the isActive prop is controlled by the Accordion component.

Uncontrolled components are easier to use within their parents because they require less configuration. But they’re less flexible when you want to coordinate them together. Controlled components are maximally flexible, but they require the parent components to fully configure them with props.

In practice, “controlled” and “uncontrolled” aren’t strict technical terms—each component usually has some mix of both local state and props. However, this is a useful way to talk about how components are designed and what capabilities they offer.

When writing a component, consider which information in it should be controlled (via props), and which information should be uncontrolled (via state). But you can always change your mind and refactor later.

In a React application, many components will have their own state. Some state may “live” close to the leaf components (components at the bottom of the tree) like inputs. Other state may “live” closer to the top of the app. For example, even client-side routing libraries are usually implemented by storing the current route in the React state, and passing it down by props!

For each unique piece of state, you will choose the component that “owns” it. This principle is also known as having a “single source of truth”. It doesn’t mean that all state lives in one place—but that for each piece of state, there is a specific component that holds that piece of information. Instead of duplicating shared state between components, lift it up to their common shared parent, and pass it down to the children that need it.

Your app will change as you work on it. It is common that you will move state down or back up while you’re still figuring out where each piece of the state “lives”. This is all part of the process!

To see what this feels like in practice with a few more components, read Thinking in React.

These two inputs are independent. Make them stay in sync: editing one input should update the other input with the same text, and vice versa.

**Examples:**

Example 1 (jsx):
```jsx
const [isActive, setIsActive] = useState(false);
```

Example 2 (javascript):
```javascript
function Panel({ title, children, isActive }) {
```

Example 3 (jsx):
```jsx
const [activeIndex, setActiveIndex] = useState(0);
```

Example 4 (jsx):
```jsx
<>  <Panel    isActive={activeIndex === 0}    onShow={() => setActiveIndex(0)}  >    ...  </Panel>  <Panel    isActive={activeIndex === 1}    onShow={() => setActiveIndex(1)}  >    ...  </Panel></>
```

---

## Keeping Components Pure

**URL:** https://react.dev/learn/keeping-components-pure

**Contents:**
- Keeping Components Pure
  - You will learn
- Purity: Components as formulas
- Side Effects: (un)intended consequences
      - Deep Dive
    - Detecting impure calculations with StrictMode
  - Local mutation: Your component’s little secret
- Where you can cause side effects
      - Deep Dive
    - Why does React care about purity?

Some JavaScript functions are pure. Pure functions only perform a calculation and nothing more. By strictly only writing your components as pure functions, you can avoid an entire class of baffling bugs and unpredictable behavior as your codebase grows. To get these benefits, though, there are a few rules you must follow.

In computer science (and especially the world of functional programming), a pure function is a function with the following characteristics:

You might already be familiar with one example of pure functions: formulas in math.

Consider this math formula: y = 2x.

If x = 2 then y = 4. Always.

If x = 3 then y = 6. Always.

If x = 3, y won’t sometimes be 9 or –1 or 2.5 depending on the time of day or the state of the stock market.

If y = 2x and x = 3, y will always be 6.

If we made this into a JavaScript function, it would look like this:

In the above example, double is a pure function. If you pass it 3, it will return 6. Always.

React is designed around this concept. React assumes that every component you write is a pure function. This means that React components you write must always return the same JSX given the same inputs:

When you pass drinkers={2} to Recipe, it will return JSX containing 2 cups of water. Always.

If you pass drinkers={4}, it will return JSX containing 4 cups of water. Always.

Just like a math formula.

You could think of your components as recipes: if you follow them and don’t introduce new ingredients during the cooking process, you will get the same dish every time. That “dish” is the JSX that the component serves to React to render.

Illustrated by Rachel Lee Nabors

React’s rendering process must always be pure. Components should only return their JSX, and not change any objects or variables that existed before rendering—that would make them impure!

Here is a component that breaks this rule:

This component is reading and writing a guest variable declared outside of it. This means that calling this component multiple times will produce different JSX! And what’s more, if other components read guest, they will produce different JSX, too, depending on when they were rendered! That’s not predictable.

Going back to our formula y = 2x, now even if x = 2, we cannot trust that y = 4. Our tests could fail, our users would be baffled, planes would fall out of the sky—you can see how this would lead to confusing bugs!

You can fix this component by passing guest as a prop instead:

Now your component is pure, as the JSX it returns only depends on the guest prop.

In general, you should not expect your components to be rendered in any particular order. It doesn’t matter if you call y = 2x before or after y = 5x: both formulas will resolve independently of each other. In the same way, each component should only “think for itself”, and not attempt to coordinate with or depend upon others during rendering. Rendering is like a school exam: each component should calculate JSX on their own!

Although you might not have used them all yet, in React there are three kinds of inputs that you can read while rendering: props, state, and context. You should always treat these inputs as read-only.

When you want to change something in response to user input, you should set state instead of writing to a variable. You should never change preexisting variables or objects while your component is rendering.

React offers a “Strict Mode” in which it calls each component’s function twice during development. By calling the component functions twice, Strict Mode helps find components that break these rules.

Notice how the original example displayed “Guest #2”, “Guest #4”, and “Guest #6” instead of “Guest #1”, “Guest #2”, and “Guest #3”. The original function was impure, so calling it twice broke it. But the fixed pure version works even if the function is called twice every time. Pure functions only calculate, so calling them twice won’t change anything—just like calling double(2) twice doesn’t change what’s returned, and solving y = 2x twice doesn’t change what y is. Same inputs, same outputs. Always.

Strict Mode has no effect in production, so it won’t slow down the app for your users. To opt into Strict Mode, you can wrap your root component into <React.StrictMode>. Some frameworks do this by default.

In the above example, the problem was that the component changed a preexisting variable while rendering. This is often called a “mutation” to make it sound a bit scarier. Pure functions don’t mutate variables outside of the function’s scope or objects that were created before the call—that makes them impure!

However, it’s completely fine to change variables and objects that you’ve just created while rendering. In this example, you create an [] array, assign it to a cups variable, and then push a dozen cups into it:

If the cups variable or the [] array were created outside the TeaGathering function, this would be a huge problem! You would be changing a preexisting object by pushing items into that array.

However, it’s fine because you’ve created them during the same render, inside TeaGathering. No code outside of TeaGathering will ever know that this happened. This is called “local mutation”—it’s like your component’s little secret.

While functional programming relies heavily on purity, at some point, somewhere, something has to change. That’s kind of the point of programming! These changes—updating the screen, starting an animation, changing the data—are called side effects. They’re things that happen “on the side”, not during rendering.

In React, side effects usually belong inside event handlers. Event handlers are functions that React runs when you perform some action—for example, when you click a button. Even though event handlers are defined inside your component, they don’t run during rendering! So event handlers don’t need to be pure.

If you’ve exhausted all other options and can’t find the right event handler for your side effect, you can still attach it to your returned JSX with a useEffect call in your component. This tells React to execute it later, after rendering, when side effects are allowed. However, this approach should be your last resort.

When possible, try to express your logic with rendering alone. You’ll be surprised how far this can take you!

Writing pure functions takes some habit and discipline. But it also unlocks marvelous opportunities:

Every new React feature we’re building takes advantage of purity. From data fetching to animations to performance, keeping components pure unlocks the power of the React paradigm.

This component tries to set the <h1>’s CSS class to "night" during the time from midnight to six hours in the morning, and "day" at all other times. However, it doesn’t work. Can you fix this component?

You can verify whether your solution works by temporarily changing the computer’s timezone. When the current time is between midnight and six in the morning, the clock should have inverted colors!

**Examples:**

Example 1 (javascript):
```javascript
function double(number) {  return 2 * number;}
```

---

## You Might Not Need an Effect

**URL:** https://react.dev/learn/you-might-not-need-an-effect

**Contents:**
- You Might Not Need an Effect
  - You will learn
- How to remove unnecessary Effects
  - Updating state based on props or state
  - Caching expensive calculations
  - Note
      - Deep Dive
    - How to tell if a calculation is expensive?
  - Resetting all state when a prop changes
  - Adjusting some state when a prop changes

Effects are an escape hatch from the React paradigm. They let you “step outside” of React and synchronize your components with some external system like a non-React widget, network, or the browser DOM. If there is no external system involved (for example, if you want to update a component’s state when some props or state change), you shouldn’t need an Effect. Removing unnecessary Effects will make your code easier to follow, faster to run, and less error-prone.

There are two common cases in which you don’t need Effects:

You do need Effects to synchronize with external systems. For example, you can write an Effect that keeps a jQuery widget synchronized with the React state. You can also fetch data with Effects: for example, you can synchronize the search results with the current search query. Keep in mind that modern frameworks provide more efficient built-in data fetching mechanisms than writing Effects directly in your components.

To help you gain the right intuition, let’s look at some common concrete examples!

Suppose you have a component with two state variables: firstName and lastName. You want to calculate a fullName from them by concatenating them. Moreover, you’d like fullName to update whenever firstName or lastName change. Your first instinct might be to add a fullName state variable and update it in an Effect:

This is more complicated than necessary. It is inefficient too: it does an entire render pass with a stale value for fullName, then immediately re-renders with the updated value. Remove the state variable and the Effect:

When something can be calculated from the existing props or state, don’t put it in state. Instead, calculate it during rendering. This makes your code faster (you avoid the extra “cascading” updates), simpler (you remove some code), and less error-prone (you avoid bugs caused by different state variables getting out of sync with each other). If this approach feels new to you, Thinking in React explains what should go into state.

This component computes visibleTodos by taking the todos it receives by props and filtering them according to the filter prop. You might feel tempted to store the result in state and update it from an Effect:

Like in the earlier example, this is both unnecessary and inefficient. First, remove the state and the Effect:

Usually, this code is fine! But maybe getFilteredTodos() is slow or you have a lot of todos. In that case you don’t want to recalculate getFilteredTodos() if some unrelated state variable like newTodo has changed.

You can cache (or “memoize”) an expensive calculation by wrapping it in a useMemo Hook:

React Compiler can automatically memoize expensive calculations for you, eliminating the need for manual useMemo in many cases.

Or, written as a single line:

This tells React that you don’t want the inner function to re-run unless either todos or filter have changed. React will remember the return value of getFilteredTodos() during the initial render. During the next renders, it will check if todos or filter are different. If they’re the same as last time, useMemo will return the last result it has stored. But if they are different, React will call the inner function again (and store its result).

The function you wrap in useMemo runs during rendering, so this only works for pure calculations.

In general, unless you’re creating or looping over thousands of objects, it’s probably not expensive. If you want to get more confidence, you can add a console log to measure the time spent in a piece of code:

Perform the interaction you’re measuring (for example, typing into the input). You will then see logs like filter array: 0.15ms in your console. If the overall logged time adds up to a significant amount (say, 1ms or more), it might make sense to memoize that calculation. As an experiment, you can then wrap the calculation in useMemo to verify whether the total logged time has decreased for that interaction or not:

useMemo won’t make the first render faster. It only helps you skip unnecessary work on updates.

Keep in mind that your machine is probably faster than your users’ so it’s a good idea to test the performance with an artificial slowdown. For example, Chrome offers a CPU Throttling option for this.

Also note that measuring performance in development will not give you the most accurate results. (For example, when Strict Mode is on, you will see each component render twice rather than once.) To get the most accurate timings, build your app for production and test it on a device like your users have.

This ProfilePage component receives a userId prop. The page contains a comment input, and you use a comment state variable to hold its value. One day, you notice a problem: when you navigate from one profile to another, the comment state does not get reset. As a result, it’s easy to accidentally post a comment on a wrong user’s profile. To fix the issue, you want to clear out the comment state variable whenever the userId changes:

This is inefficient because ProfilePage and its children will first render with the stale value, and then render again. It is also complicated because you’d need to do this in every component that has some state inside ProfilePage. For example, if the comment UI is nested, you’d want to clear out nested comment state too.

Instead, you can tell React that each user’s profile is conceptually a different profile by giving it an explicit key. Split your component in two and pass a key attribute from the outer component to the inner one:

Normally, React preserves the state when the same component is rendered in the same spot. By passing userId as a key to the Profile component, you’re asking React to treat two Profile components with different userId as two different components that should not share any state. Whenever the key (which you’ve set to userId) changes, React will recreate the DOM and reset the state of the Profile component and all of its children. Now the comment field will clear out automatically when navigating between profiles.

Note that in this example, only the outer ProfilePage component is exported and visible to other files in the project. Components rendering ProfilePage don’t need to pass the key to it: they pass userId as a regular prop. The fact ProfilePage passes it as a key to the inner Profile component is an implementation detail.

Sometimes, you might want to reset or adjust a part of the state on a prop change, but not all of it.

This List component receives a list of items as a prop, and maintains the selected item in the selection state variable. You want to reset the selection to null whenever the items prop receives a different array:

This, too, is not ideal. Every time the items change, the List and its child components will render with a stale selection value at first. Then React will update the DOM and run the Effects. Finally, the setSelection(null) call will cause another re-render of the List and its child components, restarting this whole process again.

Start by deleting the Effect. Instead, adjust the state directly during rendering:

Storing information from previous renders like this can be hard to understand, but it’s better than updating the same state in an Effect. In the above example, setSelection is called directly during a render. React will re-render the List immediately after it exits with a return statement. React has not rendered the List children or updated the DOM yet, so this lets the List children skip rendering the stale selection value.

When you update a component during rendering, React throws away the returned JSX and immediately retries rendering. To avoid very slow cascading retries, React only lets you update the same component’s state during a render. If you update another component’s state during a render, you’ll see an error. A condition like items !== prevItems is necessary to avoid loops. You may adjust state like this, but any other side effects (like changing the DOM or setting timeouts) should stay in event handlers or Effects to keep components pure.

Although this pattern is more efficient than an Effect, most components shouldn’t need it either. No matter how you do it, adjusting state based on props or other state makes your data flow more difficult to understand and debug. Always check whether you can reset all state with a key or calculate everything during rendering instead. For example, instead of storing (and resetting) the selected item, you can store the selected item ID:

Now there is no need to “adjust” the state at all. If the item with the selected ID is in the list, it remains selected. If it’s not, the selection calculated during rendering will be null because no matching item was found. This behavior is different, but arguably better because most changes to items preserve the selection.

Let’s say you have a product page with two buttons (Buy and Checkout) that both let you buy that product. You want to show a notification whenever the user puts the product in the cart. Calling showNotification() in both buttons’ click handlers feels repetitive so you might be tempted to place this logic in an Effect:

This Effect is unnecessary. It will also most likely cause bugs. For example, let’s say that your app “remembers” the shopping cart between the page reloads. If you add a product to the cart once and refresh the page, the notification will appear again. It will keep appearing every time you refresh that product’s page. This is because product.isInCart will already be true on the page load, so the Effect above will call showNotification().

When you’re not sure whether some code should be in an Effect or in an event handler, ask yourself why this code needs to run. Use Effects only for code that should run because the component was displayed to the user. In this example, the notification should appear because the user pressed the button, not because the page was displayed! Delete the Effect and put the shared logic into a function called from both event handlers:

This both removes the unnecessary Effect and fixes the bug.

This Form component sends two kinds of POST requests. It sends an analytics event when it mounts. When you fill in the form and click the Submit button, it will send a POST request to the /api/register endpoint:

Let’s apply the same criteria as in the example before.

The analytics POST request should remain in an Effect. This is because the reason to send the analytics event is that the form was displayed. (It would fire twice in development, but see here for how to deal with that.)

However, the /api/register POST request is not caused by the form being displayed. You only want to send the request at one specific moment in time: when the user presses the button. It should only ever happen on that particular interaction. Delete the second Effect and move that POST request into the event handler:

When you choose whether to put some logic into an event handler or an Effect, the main question you need to answer is what kind of logic it is from the user’s perspective. If this logic is caused by a particular interaction, keep it in the event handler. If it’s caused by the user seeing the component on the screen, keep it in the Effect.

Sometimes you might feel tempted to chain Effects that each adjust a piece of state based on other state:

There are two problems with this code.

The first problem is that it is very inefficient: the component (and its children) have to re-render between each set call in the chain. In the example above, in the worst case (setCard → render → setGoldCardCount → render → setRound → render → setIsGameOver → render) there are three unnecessary re-renders of the tree below.

The second problem is that even if it weren’t slow, as your code evolves, you will run into cases where the “chain” you wrote doesn’t fit the new requirements. Imagine you are adding a way to step through the history of the game moves. You’d do it by updating each state variable to a value from the past. However, setting the card state to a value from the past would trigger the Effect chain again and change the data you’re showing. Such code is often rigid and fragile.

In this case, it’s better to calculate what you can during rendering, and adjust the state in the event handler:

This is a lot more efficient. Also, if you implement a way to view game history, now you will be able to set each state variable to a move from the past without triggering the Effect chain that adjusts every other value. If you need to reuse logic between several event handlers, you can extract a function and call it from those handlers.

Remember that inside event handlers, state behaves like a snapshot. For example, even after you call setRound(round + 1), the round variable will reflect the value at the time the user clicked the button. If you need to use the next value for calculations, define it manually like const nextRound = round + 1.

In some cases, you can’t calculate the next state directly in the event handler. For example, imagine a form with multiple dropdowns where the options of the next dropdown depend on the selected value of the previous dropdown. Then, a chain of Effects is appropriate because you are synchronizing with network.

Some logic should only run once when the app loads.

You might be tempted to place it in an Effect in the top-level component:

However, you’ll quickly discover that it runs twice in development. This can cause issues—for example, maybe it invalidates the authentication token because the function wasn’t designed to be called twice. In general, your components should be resilient to being remounted. This includes your top-level App component.

Although it may not ever get remounted in practice in production, following the same constraints in all components makes it easier to move and reuse code. If some logic must run once per app load rather than once per component mount, add a top-level variable to track whether it has already executed:

You can also run it during module initialization and before the app renders:

Code at the top level runs once when your component is imported—even if it doesn’t end up being rendered. To avoid slowdown or surprising behavior when importing arbitrary components, don’t overuse this pattern. Keep app-wide initialization logic to root component modules like App.js or in your application’s entry point.

Let’s say you’re writing a Toggle component with an internal isOn state which can be either true or false. There are a few different ways to toggle it (by clicking or dragging). You want to notify the parent component whenever the Toggle internal state changes, so you expose an onChange event and call it from an Effect:

Like earlier, this is not ideal. The Toggle updates its state first, and React updates the screen. Then React runs the Effect, which calls the onChange function passed from a parent component. Now the parent component will update its own state, starting another render pass. It would be better to do everything in a single pass.

Delete the Effect and instead update the state of both components within the same event handler:

With this approach, both the Toggle component and its parent component update their state during the event. React batches updates from different components together, so there will only be one render pass.

You might also be able to remove the state altogether, and instead receive isOn from the parent component:

“Lifting state up” lets the parent component fully control the Toggle by toggling the parent’s own state. This means the parent component will have to contain more logic, but there will be less state overall to worry about. Whenever you try to keep two different state variables synchronized, try lifting state up instead!

This Child component fetches some data and then passes it to the Parent component in an Effect:

In React, data flows from the parent components to their children. When you see something wrong on the screen, you can trace where the information comes from by going up the component chain until you find which component passes the wrong prop or has the wrong state. When child components update the state of their parent components in Effects, the data flow becomes very difficult to trace. Since both the child and the parent need the same data, let the parent component fetch that data, and pass it down to the child instead:

This is simpler and keeps the data flow predictable: the data flows down from the parent to the child.

Sometimes, your components may need to subscribe to some data outside of the React state. This data could be from a third-party library or a built-in browser API. Since this data can change without React’s knowledge, you need to manually subscribe your components to it. This is often done with an Effect, for example:

Here, the component subscribes to an external data store (in this case, the browser navigator.onLine API). Since this API does not exist on the server (so it can’t be used for the initial HTML), initially the state is set to true. Whenever the value of that data store changes in the browser, the component updates its state.

Although it’s common to use Effects for this, React has a purpose-built Hook for subscribing to an external store that is preferred instead. Delete the Effect and replace it with a call to useSyncExternalStore:

This approach is less error-prone than manually syncing mutable data to React state with an Effect. Typically, you’ll write a custom Hook like useOnlineStatus() above so that you don’t need to repeat this code in the individual components. Read more about subscribing to external stores from React components.

Many apps use Effects to kick off data fetching. It is quite common to write a data fetching Effect like this:

You don’t need to move this fetch to an event handler.

This might seem like a contradiction with the earlier examples where you needed to put the logic into the event handlers! However, consider that it’s not the typing event that’s the main reason to fetch. Search inputs are often prepopulated from the URL, and the user might navigate Back and Forward without touching the input.

It doesn’t matter where page and query come from. While this component is visible, you want to keep results synchronized with data from the network for the current page and query. This is why it’s an Effect.

However, the code above has a bug. Imagine you type "hello" fast. Then the query will change from "h", to "he", "hel", "hell", and "hello". This will kick off separate fetches, but there is no guarantee about which order the responses will arrive in. For example, the "hell" response may arrive after the "hello" response. Since it will call setResults() last, you will be displaying the wrong search results. This is called a “race condition”: two different requests “raced” against each other and came in a different order than you expected.

To fix the race condition, you need to add a cleanup function to ignore stale responses:

This ensures that when your Effect fetches data, all responses except the last requested one will be ignored.

Handling race conditions is not the only difficulty with implementing data fetching. You might also want to think about caching responses (so that the user can click Back and see the previous screen instantly), how to fetch data on the server (so that the initial server-rendered HTML contains the fetched content instead of a spinner), and how to avoid network waterfalls (so that a child can fetch data without waiting for every parent).

These issues apply to any UI library, not just React. Solving them is not trivial, which is why modern frameworks provide more efficient built-in data fetching mechanisms than fetching data in Effects.

If you don’t use a framework (and don’t want to build your own) but would like to make data fetching from Effects more ergonomic, consider extracting your fetching logic into a custom Hook like in this example:

You’ll likely also want to add some logic for error handling and to track whether the content is loading. You can build a Hook like this yourself or use one of the many solutions already available in the React ecosystem. Although this alone won’t be as efficient as using a framework’s built-in data fetching mechanism, moving the data fetching logic into a custom Hook will make it easier to adopt an efficient data fetching strategy later.

In general, whenever you have to resort to writing Effects, keep an eye out for when you can extract a piece of functionality into a custom Hook with a more declarative and purpose-built API like useData above. The fewer raw useEffect calls you have in your components, the easier you will find to maintain your application.

The TodoList below displays a list of todos. When the “Show only active todos” checkbox is ticked, completed todos are not displayed in the list. Regardless of which todos are visible, the footer displays the count of todos that are not yet completed.

Simplify this component by removing all the unnecessary state and Effects.

**Examples:**

Example 1 (jsx):
```jsx
function Form() {  const [firstName, setFirstName] = useState('Taylor');  const [lastName, setLastName] = useState('Swift');  // 🔴 Avoid: redundant state and unnecessary Effect  const [fullName, setFullName] = useState('');  useEffect(() => {    setFullName(firstName + ' ' + lastName);  }, [firstName, lastName]);  // ...}
```

Example 2 (javascript):
```javascript
function Form() {  const [firstName, setFirstName] = useState('Taylor');  const [lastName, setLastName] = useState('Swift');  // ✅ Good: calculated during rendering  const fullName = firstName + ' ' + lastName;  // ...}
```

Example 3 (jsx):
```jsx
function TodoList({ todos, filter }) {  const [newTodo, setNewTodo] = useState('');  // 🔴 Avoid: redundant state and unnecessary Effect  const [visibleTodos, setVisibleTodos] = useState([]);  useEffect(() => {    setVisibleTodos(getFilteredTodos(todos, filter));  }, [todos, filter]);  // ...}
```

Example 4 (javascript):
```javascript
function TodoList({ todos, filter }) {  const [newTodo, setNewTodo] = useState('');  // ✅ This is fine if getFilteredTodos() is not slow.  const visibleTodos = getFilteredTodos(todos, filter);  // ...}
```

---

## Removing Effect Dependencies

**URL:** https://react.dev/learn/removing-effect-dependencies

**Contents:**
- Removing Effect Dependencies
  - You will learn
- Dependencies should match the code
  - To remove a dependency, prove that it’s not a dependency
  - To change the dependencies, change the code
  - Pitfall
      - Deep Dive
    - Why is suppressing the dependency linter so dangerous?
- Removing unnecessary dependencies
  - Should this code move to an event handler?

When you write an Effect, the linter will verify that you’ve included every reactive value (like props and state) that the Effect reads in the list of your Effect’s dependencies. This ensures that your Effect remains synchronized with the latest props and state of your component. Unnecessary dependencies may cause your Effect to run too often, or even create an infinite loop. Follow this guide to review and remove unnecessary dependencies from your Effects.

When you write an Effect, you first specify how to start and stop whatever you want your Effect to be doing:

Then, if you leave the Effect dependencies empty ([]), the linter will suggest the correct dependencies:

Fill them in according to what the linter says:

Effects “react” to reactive values. Since roomId is a reactive value (it can change due to a re-render), the linter verifies that you’ve specified it as a dependency. If roomId receives a different value, React will re-synchronize your Effect. This ensures that the chat stays connected to the selected room and “reacts” to the dropdown:

Notice that you can’t “choose” the dependencies of your Effect. Every reactive value used by your Effect’s code must be declared in your dependency list. The dependency list is determined by the surrounding code:

Reactive values include props and all variables and functions declared directly inside of your component. Since roomId is a reactive value, you can’t remove it from the dependency list. The linter wouldn’t allow it:

And the linter would be right! Since roomId may change over time, this would introduce a bug in your code.

To remove a dependency, “prove” to the linter that it doesn’t need to be a dependency. For example, you can move roomId out of your component to prove that it’s not reactive and won’t change on re-renders:

Now that roomId is not a reactive value (and can’t change on a re-render), it doesn’t need to be a dependency:

This is why you could now specify an empty ([]) dependency list. Your Effect really doesn’t depend on any reactive value anymore, so it really doesn’t need to re-run when any of the component’s props or state change.

You might have noticed a pattern in your workflow:

The last part is important. If you want to change the dependencies, change the surrounding code first. You can think of the dependency list as a list of all the reactive values used by your Effect’s code. You don’t choose what to put on that list. The list describes your code. To change the dependency list, change the code.

This might feel like solving an equation. You might start with a goal (for example, to remove a dependency), and you need to “find” the code matching that goal. Not everyone finds solving equations fun, and the same thing could be said about writing Effects! Luckily, there is a list of common recipes that you can try below.

If you have an existing codebase, you might have some Effects that suppress the linter like this:

When dependencies don’t match the code, there is a very high risk of introducing bugs. By suppressing the linter, you “lie” to React about the values your Effect depends on.

Instead, use the techniques below.

Suppressing the linter leads to very unintuitive bugs that are hard to find and fix. Here’s one example:

Let’s say that you wanted to run the Effect “only on mount”. You’ve read that empty ([]) dependencies do that, so you’ve decided to ignore the linter, and forcefully specified [] as the dependencies.

This counter was supposed to increment every second by the amount configurable with the two buttons. However, since you “lied” to React that this Effect doesn’t depend on anything, React forever keeps using the onTick function from the initial render. During that render, count was 0 and increment was 1. This is why onTick from that render always calls setCount(0 + 1) every second, and you always see 1. Bugs like this are harder to fix when they’re spread across multiple components.

There’s always a better solution than ignoring the linter! To fix this code, you need to add onTick to the dependency list. (To ensure the interval is only setup once, make onTick an Effect Event.)

We recommend treating the dependency lint error as a compilation error. If you don’t suppress it, you will never see bugs like this. The rest of this page documents the alternatives for this and other cases.

Every time you adjust the Effect’s dependencies to reflect the code, look at the dependency list. Does it make sense for the Effect to re-run when any of these dependencies change? Sometimes, the answer is “no”:

To find the right solution, you’ll need to answer a few questions about your Effect. Let’s walk through them.

The first thing you should think about is whether this code should be an Effect at all.

Imagine a form. On submit, you set the submitted state variable to true. You need to send a POST request and show a notification. You’ve put this logic inside an Effect that “reacts” to submitted being true:

Later, you want to style the notification message according to the current theme, so you read the current theme. Since theme is declared in the component body, it is a reactive value, so you add it as a dependency:

By doing this, you’ve introduced a bug. Imagine you submit the form first and then switch between Dark and Light themes. The theme will change, the Effect will re-run, and so it will display the same notification again!

The problem here is that this shouldn’t be an Effect in the first place. You want to send this POST request and show the notification in response to submitting the form, which is a particular interaction. To run some code in response to particular interaction, put that logic directly into the corresponding event handler:

Now that the code is in an event handler, it’s not reactive—so it will only run when the user submits the form. Read more about choosing between event handlers and Effects and how to delete unnecessary Effects.

The next question you should ask yourself is whether your Effect is doing several unrelated things.

Imagine you’re creating a shipping form where the user needs to choose their city and area. You fetch the list of cities from the server according to the selected country to show them in a dropdown:

This is a good example of fetching data in an Effect. You are synchronizing the cities state with the network according to the country prop. You can’t do this in an event handler because you need to fetch as soon as ShippingForm is displayed and whenever the country changes (no matter which interaction causes it).

Now let’s say you’re adding a second select box for city areas, which should fetch the areas for the currently selected city. You might start by adding a second fetch call for the list of areas inside the same Effect:

However, since the Effect now uses the city state variable, you’ve had to add city to the list of dependencies. That, in turn, introduced a problem: when the user selects a different city, the Effect will re-run and call fetchCities(country). As a result, you will be unnecessarily refetching the list of cities many times.

The problem with this code is that you’re synchronizing two different unrelated things:

Split the logic into two Effects, each of which reacts to the prop that it needs to synchronize with:

Now the first Effect only re-runs if the country changes, while the second Effect re-runs when the city changes. You’ve separated them by purpose: two different things are synchronized by two separate Effects. Two separate Effects have two separate dependency lists, so they won’t trigger each other unintentionally.

The final code is longer than the original, but splitting these Effects is still correct. Each Effect should represent an independent synchronization process. In this example, deleting one Effect doesn’t break the other Effect’s logic. This means they synchronize different things, and it’s good to split them up. If you’re concerned about duplication, you can improve this code by extracting repetitive logic into a custom Hook.

This Effect updates the messages state variable with a newly created array every time a new message arrives:

It uses the messages variable to create a new array starting with all the existing messages and adds the new message at the end. However, since messages is a reactive value read by an Effect, it must be a dependency:

And making messages a dependency introduces a problem.

Every time you receive a message, setMessages() causes the component to re-render with a new messages array that includes the received message. However, since this Effect now depends on messages, this will also re-synchronize the Effect. So every new message will make the chat re-connect. The user would not like that!

To fix the issue, don’t read messages inside the Effect. Instead, pass an updater function to setMessages:

Notice how your Effect does not read the messages variable at all now. You only need to pass an updater function like msgs => [...msgs, receivedMessage]. React puts your updater function in a queue and will provide the msgs argument to it during the next render. This is why the Effect itself doesn’t need to depend on messages anymore. As a result of this fix, receiving a chat message will no longer make the chat re-connect.

Suppose that you want to play a sound when the user receives a new message unless isMuted is true:

Since your Effect now uses isMuted in its code, you have to add it to the dependencies:

The problem is that every time isMuted changes (for example, when the user presses the “Muted” toggle), the Effect will re-synchronize, and reconnect to the chat. This is not the desired user experience! (In this example, even disabling the linter would not work—if you do that, isMuted would get “stuck” with its old value.)

To solve this problem, you need to extract the logic that shouldn’t be reactive out of the Effect. You don’t want this Effect to “react” to the changes in isMuted. Move this non-reactive piece of logic into an Effect Event:

Effect Events let you split an Effect into reactive parts (which should “react” to reactive values like roomId and their changes) and non-reactive parts (which only read their latest values, like onMessage reads isMuted). Now that you read isMuted inside an Effect Event, it doesn’t need to be a dependency of your Effect. As a result, the chat won’t re-connect when you toggle the “Muted” setting on and off, solving the original issue!

You might run into a similar problem when your component receives an event handler as a prop:

Suppose that the parent component passes a different onReceiveMessage function on every render:

Since onReceiveMessage is a dependency, it would cause the Effect to re-synchronize after every parent re-render. This would make it re-connect to the chat. To solve this, wrap the call in an Effect Event:

Effect Events aren’t reactive, so you don’t need to specify them as dependencies. As a result, the chat will no longer re-connect even if the parent component passes a function that’s different on every re-render.

In this example, you want to log a visit every time roomId changes. You want to include the current notificationCount with every log, but you don’t want a change to notificationCount to trigger a log event.

The solution is again to split out the non-reactive code into an Effect Event:

You want your logic to be reactive with regards to roomId, so you read roomId inside of your Effect. However, you don’t want a change to notificationCount to log an extra visit, so you read notificationCount inside of the Effect Event. Learn more about reading the latest props and state from Effects using Effect Events.

Sometimes, you do want your Effect to “react” to a certain value, but that value changes more often than you’d like—and might not reflect any actual change from the user’s perspective. For example, let’s say that you create an options object in the body of your component, and then read that object from inside of your Effect:

This object is declared in the component body, so it’s a reactive value. When you read a reactive value like this inside an Effect, you declare it as a dependency. This ensures your Effect “reacts” to its changes:

It is important to declare it as a dependency! This ensures, for example, that if the roomId changes, your Effect will re-connect to the chat with the new options. However, there is also a problem with the code above. To see it, try typing into the input in the sandbox below, and watch what happens in the console:

In the sandbox above, the input only updates the message state variable. From the user’s perspective, this should not affect the chat connection. However, every time you update the message, your component re-renders. When your component re-renders, the code inside of it runs again from scratch.

A new options object is created from scratch on every re-render of the ChatRoom component. React sees that the options object is a different object from the options object created during the last render. This is why it re-synchronizes your Effect (which depends on options), and the chat re-connects as you type.

This problem only affects objects and functions. In JavaScript, each newly created object and function is considered distinct from all the others. It doesn’t matter that the contents inside of them may be the same!

Object and function dependencies can make your Effect re-synchronize more often than you need.

This is why, whenever possible, you should try to avoid objects and functions as your Effect’s dependencies. Instead, try moving them outside the component, inside the Effect, or extracting primitive values out of them.

If the object does not depend on any props and state, you can move that object outside your component:

This way, you prove to the linter that it’s not reactive. It can’t change as a result of a re-render, so it doesn’t need to be a dependency. Now re-rendering ChatRoom won’t cause your Effect to re-synchronize.

This works for functions too:

Since createOptions is declared outside your component, it’s not a reactive value. This is why it doesn’t need to be specified in your Effect’s dependencies, and why it won’t ever cause your Effect to re-synchronize.

If your object depends on some reactive value that may change as a result of a re-render, like a roomId prop, you can’t pull it outside your component. You can, however, move its creation inside of your Effect’s code:

Now that options is declared inside of your Effect, it is no longer a dependency of your Effect. Instead, the only reactive value used by your Effect is roomId. Since roomId is not an object or function, you can be sure that it won’t be unintentionally different. In JavaScript, numbers and strings are compared by their content:

Thanks to this fix, the chat no longer re-connects if you edit the input:

However, it does re-connect when you change the roomId dropdown, as you would expect.

This works for functions, too:

You can write your own functions to group pieces of logic inside your Effect. As long as you also declare them inside your Effect, they’re not reactive values, and so they don’t need to be dependencies of your Effect.

Sometimes, you may receive an object from props:

The risk here is that the parent component will create the object during rendering:

This would cause your Effect to re-connect every time the parent component re-renders. To fix this, read information from the object outside the Effect, and avoid having object and function dependencies:

The logic gets a little repetitive (you read some values from an object outside an Effect, and then create an object with the same values inside the Effect). But it makes it very explicit what information your Effect actually depends on. If an object is re-created unintentionally by the parent component, the chat would not re-connect. However, if options.roomId or options.serverUrl really are different, the chat would re-connect.

The same approach can work for functions. For example, suppose the parent component passes a function:

To avoid making it a dependency (and causing it to re-connect on re-renders), call it outside the Effect. This gives you the roomId and serverUrl values that aren’t objects, and that you can read from inside your Effect:

This only works for pure functions because they are safe to call during rendering. If your function is an event handler, but you don’t want its changes to re-synchronize your Effect, wrap it into an Effect Event instead.

This Effect sets up an interval that ticks every second. You’ve noticed something strange happening: it seems like the interval gets destroyed and re-created every time it ticks. Fix the code so that the interval doesn’t get constantly re-created.

**Examples:**

Example 1 (javascript):
```javascript
const serverUrl = 'https://localhost:1234';function ChatRoom({ roomId }) {  useEffect(() => {    const connection = createConnection(serverUrl, roomId);    connection.connect();    return () => connection.disconnect();  	// ...}
```

Example 2 (javascript):
```javascript
function ChatRoom({ roomId }) {  useEffect(() => {    const connection = createConnection(serverUrl, roomId);    connection.connect();    return () => connection.disconnect();  }, [roomId]); // ✅ All dependencies declared  // ...}
```

Example 3 (javascript):
```javascript
const serverUrl = 'https://localhost:1234';function ChatRoom({ roomId }) { // This is a reactive value  useEffect(() => {    const connection = createConnection(serverUrl, roomId); // This Effect reads that reactive value    connection.connect();    return () => connection.disconnect();  }, [roomId]); // ✅ So you must specify that reactive value as a dependency of your Effect  // ...}
```

Example 4 (javascript):
```javascript
const serverUrl = 'https://localhost:1234';function ChatRoom({ roomId }) {  useEffect(() => {    const connection = createConnection(serverUrl, roomId);    connection.connect();    return () => connection.disconnect();  }, []); // 🔴 React Hook useEffect has a missing dependency: 'roomId'  // ...}
```

---

## Lifecycle of Reactive Effects

**URL:** https://react.dev/learn/lifecycle-of-reactive-effects

**Contents:**
- Lifecycle of Reactive Effects
  - You will learn
- The lifecycle of an Effect
  - Note
  - Why synchronization may need to happen more than once
  - How React re-synchronizes your Effect
  - Thinking from the Effect’s perspective
  - How React verifies that your Effect can re-synchronize
  - How React knows that it needs to re-synchronize the Effect
  - Each Effect represents a separate synchronization process

Effects have a different lifecycle from components. Components may mount, update, or unmount. An Effect can only do two things: to start synchronizing something, and later to stop synchronizing it. This cycle can happen multiple times if your Effect depends on props and state that change over time. React provides a linter rule to check that you’ve specified your Effect’s dependencies correctly. This keeps your Effect synchronized to the latest props and state.

Every React component goes through the same lifecycle:

It’s a good way to think about components, but not about Effects. Instead, try to think about each Effect independently from your component’s lifecycle. An Effect describes how to synchronize an external system to the current props and state. As your code changes, synchronization will need to happen more or less often.

To illustrate this point, consider this Effect connecting your component to a chat server:

Your Effect’s body specifies how to start synchronizing:

The cleanup function returned by your Effect specifies how to stop synchronizing:

Intuitively, you might think that React would start synchronizing when your component mounts and stop synchronizing when your component unmounts. However, this is not the end of the story! Sometimes, it may also be necessary to start and stop synchronizing multiple times while the component remains mounted.

Let’s look at why this is necessary, when it happens, and how you can control this behavior.

Some Effects don’t return a cleanup function at all. More often than not, you’ll want to return one—but if you don’t, React will behave as if you returned an empty cleanup function.

Imagine this ChatRoom component receives a roomId prop that the user picks in a dropdown. Let’s say that initially the user picks the "general" room as the roomId. Your app displays the "general" chat room:

After the UI is displayed, React will run your Effect to start synchronizing. It connects to the "general" room:

Later, the user picks a different room in the dropdown (for example, "travel"). First, React will update the UI:

Think about what should happen next. The user sees that "travel" is the selected chat room in the UI. However, the Effect that ran the last time is still connected to the "general" room. The roomId prop has changed, so what your Effect did back then (connecting to the "general" room) no longer matches the UI.

At this point, you want React to do two things:

Luckily, you’ve already taught React how to do both of these things! Your Effect’s body specifies how to start synchronizing, and your cleanup function specifies how to stop synchronizing. All that React needs to do now is to call them in the correct order and with the correct props and state. Let’s see how exactly that happens.

Recall that your ChatRoom component has received a new value for its roomId prop. It used to be "general", and now it is "travel". React needs to re-synchronize your Effect to re-connect you to a different room.

To stop synchronizing, React will call the cleanup function that your Effect returned after connecting to the "general" room. Since roomId was "general", the cleanup function disconnects from the "general" room:

Then React will run the Effect that you’ve provided during this render. This time, roomId is "travel" so it will start synchronizing to the "travel" chat room (until its cleanup function is eventually called too):

Thanks to this, you’re now connected to the same room that the user chose in the UI. Disaster averted!

Every time after your component re-renders with a different roomId, your Effect will re-synchronize. For example, let’s say the user changes roomId from "travel" to "music". React will again stop synchronizing your Effect by calling its cleanup function (disconnecting you from the "travel" room). Then it will start synchronizing again by running its body with the new roomId prop (connecting you to the "music" room).

Finally, when the user goes to a different screen, ChatRoom unmounts. Now there is no need to stay connected at all. React will stop synchronizing your Effect one last time and disconnect you from the "music" chat room.

Let’s recap everything that’s happened from the ChatRoom component’s perspective:

During each of these points in the component’s lifecycle, your Effect did different things:

Now let’s think about what happened from the perspective of the Effect itself:

This code’s structure might inspire you to see what happened as a sequence of non-overlapping time periods:

Previously, you were thinking from the component’s perspective. When you looked from the component’s perspective, it was tempting to think of Effects as “callbacks” or “lifecycle events” that fire at a specific time like “after a render” or “before unmount”. This way of thinking gets complicated very fast, so it’s best to avoid.

Instead, always focus on a single start/stop cycle at a time. It shouldn’t matter whether a component is mounting, updating, or unmounting. All you need to do is to describe how to start synchronization and how to stop it. If you do it well, your Effect will be resilient to being started and stopped as many times as it’s needed.

This might remind you how you don’t think whether a component is mounting or updating when you write the rendering logic that creates JSX. You describe what should be on the screen, and React figures out the rest.

Here is a live example that you can play with. Press “Open chat” to mount the ChatRoom component:

Notice that when the component mounts for the first time, you see three logs:

The first two logs are development-only. In development, React always remounts each component once.

React verifies that your Effect can re-synchronize by forcing it to do that immediately in development. This might remind you of opening a door and closing it an extra time to check if the door lock works. React starts and stops your Effect one extra time in development to check you’ve implemented its cleanup well.

The main reason your Effect will re-synchronize in practice is if some data it uses has changed. In the sandbox above, change the selected chat room. Notice how, when the roomId changes, your Effect re-synchronizes.

However, there are also more unusual cases in which re-synchronization is necessary. For example, try editing the serverUrl in the sandbox above while the chat is open. Notice how the Effect re-synchronizes in response to your edits to the code. In the future, React may add more features that rely on re-synchronization.

You might be wondering how React knew that your Effect needed to re-synchronize after roomId changes. It’s because you told React that its code depends on roomId by including it in the list of dependencies:

Here’s how this works:

Every time after your component re-renders, React will look at the array of dependencies that you have passed. If any of the values in the array is different from the value at the same spot that you passed during the previous render, React will re-synchronize your Effect.

For example, if you passed ["general"] during the initial render, and later you passed ["travel"] during the next render, React will compare "general" and "travel". These are different values (compared with Object.is), so React will re-synchronize your Effect. On the other hand, if your component re-renders but roomId has not changed, your Effect will remain connected to the same room.

Resist adding unrelated logic to your Effect only because this logic needs to run at the same time as an Effect you already wrote. For example, let’s say you want to send an analytics event when the user visits the room. You already have an Effect that depends on roomId, so you might feel tempted to add the analytics call there:

But imagine you later add another dependency to this Effect that needs to re-establish the connection. If this Effect re-synchronizes, it will also call logVisit(roomId) for the same room, which you did not intend. Logging the visit is a separate process from connecting. Write them as two separate Effects:

Each Effect in your code should represent a separate and independent synchronization process.

In the above example, deleting one Effect wouldn’t break the other Effect’s logic. This is a good indication that they synchronize different things, and so it made sense to split them up. On the other hand, if you split up a cohesive piece of logic into separate Effects, the code may look “cleaner” but will be more difficult to maintain. This is why you should think whether the processes are same or separate, not whether the code looks cleaner.

Your Effect reads two variables (serverUrl and roomId), but you only specified roomId as a dependency:

Why doesn’t serverUrl need to be a dependency?

This is because the serverUrl never changes due to a re-render. It’s always the same no matter how many times the component re-renders and why. Since serverUrl never changes, it wouldn’t make sense to specify it as a dependency. After all, dependencies only do something when they change over time!

On the other hand, roomId may be different on a re-render. Props, state, and other values declared inside the component are reactive because they’re calculated during rendering and participate in the React data flow.

If serverUrl was a state variable, it would be reactive. Reactive values must be included in dependencies:

By including serverUrl as a dependency, you ensure that the Effect re-synchronizes after it changes.

Try changing the selected chat room or edit the server URL in this sandbox:

Whenever you change a reactive value like roomId or serverUrl, the Effect re-connects to the chat server.

What happens if you move both serverUrl and roomId outside the component?

Now your Effect’s code does not use any reactive values, so its dependencies can be empty ([]).

Thinking from the component’s perspective, the empty [] dependency array means this Effect connects to the chat room only when the component mounts, and disconnects only when the component unmounts. (Keep in mind that React would still re-synchronize it an extra time in development to stress-test your logic.)

However, if you think from the Effect’s perspective, you don’t need to think about mounting and unmounting at all. What’s important is you’ve specified what your Effect does to start and stop synchronizing. Today, it has no reactive dependencies. But if you ever want the user to change roomId or serverUrl over time (and they would become reactive), your Effect’s code won’t change. You will only need to add them to the dependencies.

Props and state aren’t the only reactive values. Values that you calculate from them are also reactive. If the props or state change, your component will re-render, and the values calculated from them will also change. This is why all variables from the component body used by the Effect should be in the Effect dependency list.

Let’s say that the user can pick a chat server in the dropdown, but they can also configure a default server in settings. Suppose you’ve already put the settings state in a context so you read the settings from that context. Now you calculate the serverUrl based on the selected server from props and the default server:

In this example, serverUrl is not a prop or a state variable. It’s a regular variable that you calculate during rendering. But it’s calculated during rendering, so it can change due to a re-render. This is why it’s reactive.

All values inside the component (including props, state, and variables in your component’s body) are reactive. Any reactive value can change on a re-render, so you need to include reactive values as Effect’s dependencies.

In other words, Effects “react” to all values from the component body.

Mutable values (including global variables) aren’t reactive.

A mutable value like location.pathname can’t be a dependency. It’s mutable, so it can change at any time completely outside of the React rendering data flow. Changing it wouldn’t trigger a re-render of your component. Therefore, even if you specified it in the dependencies, React wouldn’t know to re-synchronize the Effect when it changes. This also breaks the rules of React because reading mutable data during rendering (which is when you calculate the dependencies) breaks purity of rendering. Instead, you should read and subscribe to an external mutable value with useSyncExternalStore.

A mutable value like ref.current or things you read from it also can’t be a dependency. The ref object returned by useRef itself can be a dependency, but its current property is intentionally mutable. It lets you keep track of something without triggering a re-render. But since changing it doesn’t trigger a re-render, it’s not a reactive value, and React won’t know to re-run your Effect when it changes.

As you’ll learn below on this page, a linter will check for these issues automatically.

If your linter is configured for React, it will check that every reactive value used by your Effect’s code is declared as its dependency. For example, this is a lint error because both roomId and serverUrl are reactive:

This may look like a React error, but really React is pointing out a bug in your code. Both roomId and serverUrl may change over time, but you’re forgetting to re-synchronize your Effect when they change. You will remain connected to the initial roomId and serverUrl even after the user picks different values in the UI.

To fix the bug, follow the linter’s suggestion to specify roomId and serverUrl as dependencies of your Effect:

Try this fix in the sandbox above. Verify that the linter error is gone, and the chat re-connects when needed.

In some cases, React knows that a value never changes even though it’s declared inside the component. For example, the set function returned from useState and the ref object returned by useRef are stable—they are guaranteed to not change on a re-render. Stable values aren’t reactive, so you may omit them from the list. Including them is allowed: they won’t change, so it doesn’t matter.

In the previous example, you’ve fixed the lint error by listing roomId and serverUrl as dependencies.

However, you could instead “prove” to the linter that these values aren’t reactive values, i.e. that they can’t change as a result of a re-render. For example, if serverUrl and roomId don’t depend on rendering and always have the same values, you can move them outside the component. Now they don’t need to be dependencies:

You can also move them inside the Effect. They aren’t calculated during rendering, so they’re not reactive:

Effects are reactive blocks of code. They re-synchronize when the values you read inside of them change. Unlike event handlers, which only run once per interaction, Effects run whenever synchronization is necessary.

You can’t “choose” your dependencies. Your dependencies must include every reactive value you read in the Effect. The linter enforces this. Sometimes this may lead to problems like infinite loops and to your Effect re-synchronizing too often. Don’t fix these problems by suppressing the linter! Here’s what to try instead:

Check that your Effect represents an independent synchronization process. If your Effect doesn’t synchronize anything, it might be unnecessary. If it synchronizes several independent things, split it up.

If you want to read the latest value of props or state without “reacting” to it and re-synchronizing the Effect, you can split your Effect into a reactive part (which you’ll keep in the Effect) and a non-reactive part (which you’ll extract into something called an Effect Event). Read about separating Events from Effects.

Avoid relying on objects and functions as dependencies. If you create objects and functions during rendering and then read them from an Effect, they will be different on every render. This will cause your Effect to re-synchronize every time. Read more about removing unnecessary dependencies from Effects.

The linter is your friend, but its powers are limited. The linter only knows when the dependencies are wrong. It doesn’t know the best way to solve each case. If the linter suggests a dependency, but adding it causes a loop, it doesn’t mean the linter should be ignored. You need to change the code inside (or outside) the Effect so that that value isn’t reactive and doesn’t need to be a dependency.

If you have an existing codebase, you might have some Effects that suppress the linter like this:

On the next pages, you’ll learn how to fix this code without breaking the rules. It’s always worth fixing!

In this example, the ChatRoom component connects to the chat room when the component mounts, disconnects when it unmounts, and reconnects when you select a different chat room. This behavior is correct, so you need to keep it working.

However, there is a problem. Whenever you type into the message box input at the bottom, ChatRoom also reconnects to the chat. (You can notice this by clearing the console and typing into the input.) Fix the issue so that this doesn’t happen.

**Examples:**

Example 1 (javascript):
```javascript
const serverUrl = 'https://localhost:1234';function ChatRoom({ roomId }) {  useEffect(() => {    const connection = createConnection(serverUrl, roomId);    connection.connect();    return () => {      connection.disconnect();    };  }, [roomId]);  // ...}
```

Example 2 (javascript):
```javascript
// ...    const connection = createConnection(serverUrl, roomId);    connection.connect();    return () => {      connection.disconnect();    };    // ...
```

Example 3 (javascript):
```javascript
// ...    const connection = createConnection(serverUrl, roomId);    connection.connect();    return () => {      connection.disconnect();    };    // ...
```

Example 4 (javascript):
```javascript
const serverUrl = 'https://localhost:1234';function ChatRoom({ roomId /* "general" */ }) {  // ...  return <h1>Welcome to the {roomId} room!</h1>;}
```

---

## State: A Component's Memory

**URL:** https://react.dev/learn/state-a-components-memory

**Contents:**
- State: A Component's Memory
  - You will learn
- When a regular variable isn’t enough
- Adding a state variable
  - Meet your first Hook
  - Pitfall
  - Anatomy of useState
  - Note
- Giving a component multiple state variables
      - Deep Dive

Components often need to change what’s on the screen as a result of an interaction. Typing into the form should update the input field, clicking “next” on an image carousel should change which image is displayed, clicking “buy” should put a product in the shopping cart. Components need to “remember” things: the current input value, the current image, the shopping cart. In React, this kind of component-specific memory is called state.

Here’s a component that renders a sculpture image. Clicking the “Next” button should show the next sculpture by changing the index to 1, then 2, and so on. However, this won’t work (you can try it!):

The handleClick event handler is updating a local variable, index. But two things prevent that change from being visible:

To update a component with new data, two things need to happen:

The useState Hook provides those two things:

To add a state variable, import useState from React at the top of the file:

Then, replace this line:

index is a state variable and setIndex is the setter function.

The [ and ] syntax here is called array destructuring and it lets you read values from an array. The array returned by useState always has exactly two items.

This is how they work together in handleClick:

Now clicking the “Next” button switches the current sculpture:

In React, useState, as well as any other function starting with “use”, is called a Hook.

Hooks are special functions that are only available while React is rendering (which we’ll get into in more detail on the next page). They let you “hook into” different React features.

State is just one of those features, but you will meet the other Hooks later.

Hooks—functions starting with use—can only be called at the top level of your components or your own Hooks. You can’t call Hooks inside conditions, loops, or other nested functions. Hooks are functions, but it’s helpful to think of them as unconditional declarations about your component’s needs. You “use” React features at the top of your component similar to how you “import” modules at the top of your file.

When you call useState, you are telling React that you want this component to remember something:

In this case, you want React to remember index.

The convention is to name this pair like const [something, setSomething]. You could name it anything you like, but conventions make things easier to understand across projects.

The only argument to useState is the initial value of your state variable. In this example, the index’s initial value is set to 0 with useState(0).

Every time your component renders, useState gives you an array containing two values:

Here’s how that happens in action:

You can have as many state variables of as many types as you like in one component. This component has two state variables, a number index and a boolean showMore that’s toggled when you click “Show details”:

It is a good idea to have multiple state variables if their state is unrelated, like index and showMore in this example. But if you find that you often change two state variables together, it might be easier to combine them into one. For example, if you have a form with many fields, it’s more convenient to have a single state variable that holds an object than state variable per field. Read Choosing the State Structure for more tips.

You might have noticed that the useState call does not receive any information about which state variable it refers to. There is no “identifier” that is passed to useState, so how does it know which of the state variables to return? Does it rely on some magic like parsing your functions? The answer is no.

Instead, to enable their concise syntax, Hooks rely on a stable call order on every render of the same component. This works well in practice because if you follow the rule above (“only call Hooks at the top level”), Hooks will always be called in the same order. Additionally, a linter plugin catches most mistakes.

Internally, React holds an array of state pairs for every component. It also maintains the current pair index, which is set to 0 before rendering. Each time you call useState, React gives you the next state pair and increments the index. You can read more about this mechanism in React Hooks: Not Magic, Just Arrays.

This example doesn’t use React but it gives you an idea of how useState works internally:

You don’t have to understand it to use React, but you might find this a helpful mental model.

State is local to a component instance on the screen. In other words, if you render the same component twice, each copy will have completely isolated state! Changing one of them will not affect the other.

In this example, the Gallery component from earlier is rendered twice with no changes to its logic. Try clicking the buttons inside each of the galleries. Notice that their state is independent:

This is what makes state different from regular variables that you might declare at the top of your module. State is not tied to a particular function call or a place in the code, but it’s “local” to the specific place on the screen. You rendered two <Gallery /> components, so their state is stored separately.

Also notice how the Page component doesn’t “know” anything about the Gallery state or even whether it has any. Unlike props, state is fully private to the component declaring it. The parent component can’t change it. This lets you add state to any component or remove it without impacting the rest of the components.

What if you wanted both galleries to keep their states in sync? The right way to do it in React is to remove state from child components and add it to their closest shared parent. The next few pages will focus on organizing state of a single component, but we will return to this topic in Sharing State Between Components.

When you press “Next” on the last sculpture, the code crashes. Fix the logic to prevent the crash. You may do this by adding extra logic to event handler or by disabling the button when the action is not possible.

After fixing the crash, add a “Previous” button that shows the previous sculpture. It shouldn’t crash on the first sculpture.

**Examples:**

Example 1 (sql):
```sql
import { useState } from 'react';
```

Example 2 (javascript):
```javascript
let index = 0;
```

Example 3 (jsx):
```jsx
const [index, setIndex] = useState(0);
```

Example 4 (javascript):
```javascript
function handleClick() {  setIndex(index + 1);}
```

---

## Passing Data Deeply with Context

**URL:** https://react.dev/learn/passing-data-deeply-with-context

**Contents:**
- Passing Data Deeply with Context
  - You will learn
- The problem with passing props
- Context: an alternative to passing props
  - Step 1: Create the context
  - Step 2: Use the context
  - Step 3: Provide the context
- Using and providing context from the same component
  - Note
- Context passes through intermediate components

Usually, you will pass information from a parent component to a child component via props. But passing props can become verbose and inconvenient if you have to pass them through many components in the middle, or if many components in your app need the same information. Context lets the parent component make some information available to any component in the tree below it—no matter how deep—without passing it explicitly through props.

Passing props is a great way to explicitly pipe data through your UI tree to the components that use it.

But passing props can become verbose and inconvenient when you need to pass some prop deeply through the tree, or if many components need the same prop. The nearest common ancestor could be far removed from the components that need data, and lifting state up that high can lead to a situation called “prop drilling”.

Wouldn’t it be great if there were a way to “teleport” data to the components in the tree that need it without passing props? With React’s context feature, there is!

Context lets a parent component provide data to the entire tree below it. There are many uses for context. Here is one example. Consider this Heading component that accepts a level for its size:

Let’s say you want multiple headings within the same Section to always have the same size:

Currently, you pass the level prop to each <Heading> separately:

It would be nice if you could pass the level prop to the <Section> component instead and remove it from the <Heading>. This way you could enforce that all headings in the same section have the same size:

But how can the <Heading> component know the level of its closest <Section>? That would require some way for a child to “ask” for data from somewhere above in the tree.

You can’t do it with props alone. This is where context comes into play. You will do it in three steps:

Context lets a parent—even a distant one!—provide some data to the entire tree inside of it.

Using context in close children

Using context in distant children

First, you need to create the context. You’ll need to export it from a file so that your components can use it:

The only argument to createContext is the default value. Here, 1 refers to the biggest heading level, but you could pass any kind of value (even an object). You will see the significance of the default value in the next step.

Import the useContext Hook from React and your context:

Currently, the Heading component reads level from props:

Instead, remove the level prop and read the value from the context you just imported, LevelContext:

useContext is a Hook. Just like useState and useReducer, you can only call a Hook immediately inside a React component (not inside loops or conditions). useContext tells React that the Heading component wants to read the LevelContext.

Now that the Heading component doesn’t have a level prop, you don’t need to pass the level prop to Heading in your JSX like this anymore:

Update the JSX so that it’s the Section that receives it instead:

As a reminder, this is the markup that you were trying to get working:

Notice this example doesn’t quite work, yet! All the headings have the same size because even though you’re using the context, you have not provided it yet. React doesn’t know where to get it!

If you don’t provide the context, React will use the default value you’ve specified in the previous step. In this example, you specified 1 as the argument to createContext, so useContext(LevelContext) returns 1, setting all those headings to <h1>. Let’s fix this problem by having each Section provide its own context.

The Section component currently renders its children:

Wrap them with a context provider to provide the LevelContext to them:

This tells React: “if any component inside this <Section> asks for LevelContext, give them this level.” The component will use the value of the nearest <LevelContext> in the UI tree above it.

It’s the same result as the original code, but you did not need to pass the level prop to each Heading component! Instead, it “figures out” its heading level by asking the closest Section above:

Currently, you still have to specify each section’s level manually:

Since context lets you read information from a component above, each Section could read the level from the Section above, and pass level + 1 down automatically. Here is how you could do it:

With this change, you don’t need to pass the level prop either to the <Section> or to the <Heading>:

Now both Heading and Section read the LevelContext to figure out how “deep” they are. And the Section wraps its children into the LevelContext to specify that anything inside of it is at a “deeper” level.

This example uses heading levels because they show visually how nested components can override context. But context is useful for many other use cases too. You can pass down any information needed by the entire subtree: the current color theme, the currently logged in user, and so on.

You can insert as many components as you like between the component that provides context and the one that uses it. This includes both built-in components like <div> and components you might build yourself.

In this example, the same Post component (with a dashed border) is rendered at two different nesting levels. Notice that the <Heading> inside of it gets its level automatically from the closest <Section>:

You didn’t do anything special for this to work. A Section specifies the context for the tree inside it, so you can insert a <Heading> anywhere, and it will have the correct size. Try it in the sandbox above!

Context lets you write components that “adapt to their surroundings” and display themselves differently depending on where (or, in other words, in which context) they are being rendered.

How context works might remind you of CSS property inheritance. In CSS, you can specify color: blue for a <div>, and any DOM node inside of it, no matter how deep, will inherit that color unless some other DOM node in the middle overrides it with color: green. Similarly, in React, the only way to override some context coming from above is to wrap children into a context provider with a different value.

In CSS, different properties like color and background-color don’t override each other. You can set all <div>’s color to red without impacting background-color. Similarly, different React contexts don’t override each other. Each context that you make with createContext() is completely separate from other ones, and ties together components using and providing that particular context. One component may use or provide many different contexts without a problem.

Context is very tempting to use! However, this also means it’s too easy to overuse it. Just because you need to pass some props several levels deep doesn’t mean you should put that information into context.

Here’s a few alternatives you should consider before using context:

If neither of these approaches works well for you, consider context.

Context is not limited to static values. If you pass a different value on the next render, React will update all the components reading it below! This is why context is often used in combination with state.

In general, if some information is needed by distant components in different parts of the tree, it’s a good indication that context will help you.

In this example, toggling the checkbox changes the imageSize prop passed to each <PlaceImage>. The checkbox state is held in the top-level App component, but each <PlaceImage> needs to be aware of it.

Currently, App passes imageSize to List, which passes it to each Place, which passes it to the PlaceImage. Remove the imageSize prop, and instead pass it from the App component directly to PlaceImage.

You can declare context in Context.js.

**Examples:**

Example 1 (jsx):
```jsx
<Section>  <Heading level={3}>About</Heading>  <Heading level={3}>Photos</Heading>  <Heading level={3}>Videos</Heading></Section>
```

Example 2 (jsx):
```jsx
<Section level={3}>  <Heading>About</Heading>  <Heading>Photos</Heading>  <Heading>Videos</Heading></Section>
```

Example 3 (sql):
```sql
import { useContext } from 'react';import { LevelContext } from './LevelContext.js';
```

Example 4 (javascript):
```javascript
export default function Heading({ level, children }) {  // ...}
```

---

## Your First Component

**URL:** https://react.dev/learn/your-first-component

**Contents:**
- Your First Component
  - You will learn
- Components: UI building blocks
- Defining a component
  - Step 1: Export the component
  - Step 2: Define the function
  - Pitfall
  - Step 3: Add markup
  - Pitfall
- Using a component

Components are one of the core concepts of React. They are the foundation upon which you build user interfaces (UI), which makes them the perfect place to start your React journey!

On the Web, HTML lets us create rich structured documents with its built-in set of tags like <h1> and <li>:

This markup represents this article <article>, its heading <h1>, and an (abbreviated) table of contents as an ordered list <ol>. Markup like this, combined with CSS for style, and JavaScript for interactivity, lies behind every sidebar, avatar, modal, dropdown—every piece of UI you see on the Web.

React lets you combine your markup, CSS, and JavaScript into custom “components”, reusable UI elements for your app. The table of contents code you saw above could be turned into a <TableOfContents /> component you could render on every page. Under the hood, it still uses the same HTML tags like <article>, <h1>, etc.

Just like with HTML tags, you can compose, order and nest components to design whole pages. For example, the documentation page you’re reading is made out of React components:

As your project grows, you will notice that many of your designs can be composed by reusing components you already wrote, speeding up your development. Our table of contents above could be added to any screen with <TableOfContents />! You can even jumpstart your project with the thousands of components shared by the React open source community like Chakra UI and Material UI.

Traditionally when creating web pages, web developers marked up their content and then added interaction by sprinkling on some JavaScript. This worked great when interaction was a nice-to-have on the web. Now it is expected for many sites and all apps. React puts interactivity first while still using the same technology: a React component is a JavaScript function that you can sprinkle with markup. Here’s what that looks like (you can edit the example below):

And here’s how to build a component:

The export default prefix is a standard JavaScript syntax (not specific to React). It lets you mark the main function in a file so that you can later import it from other files. (More on importing in Importing and Exporting Components!)

With function Profile() { } you define a JavaScript function with the name Profile.

React components are regular JavaScript functions, but their names must start with a capital letter or they won’t work!

The component returns an <img /> tag with src and alt attributes. <img /> is written like HTML, but it is actually JavaScript under the hood! This syntax is called JSX, and it lets you embed markup inside JavaScript.

Return statements can be written all on one line, as in this component:

But if your markup isn’t all on the same line as the return keyword, you must wrap it in a pair of parentheses:

Without parentheses, any code on the lines after return will be ignored!

Now that you’ve defined your Profile component, you can nest it inside other components. For example, you can export a Gallery component that uses multiple Profile components:

Notice the difference in casing:

And Profile contains even more HTML: <img />. In the end, this is what the browser sees:

Components are regular JavaScript functions, so you can keep multiple components in the same file. This is convenient when components are relatively small or tightly related to each other. If this file gets crowded, you can always move Profile to a separate file. You will learn how to do this shortly on the page about imports.

Because the Profile components are rendered inside Gallery—even several times!—we can say that Gallery is a parent component, rendering each Profile as a “child”. This is part of the magic of React: you can define a component once, and then use it in as many places and as many times as you like.

Components can render other components, but you must never nest their definitions:

The snippet above is very slow and causes bugs. Instead, define every component at the top level:

When a child component needs some data from a parent, pass it by props instead of nesting definitions.

Your React application begins at a “root” component. Usually, it is created automatically when you start a new project. For example, if you use CodeSandbox or if you use the framework Next.js, the root component is defined in pages/index.js. In these examples, you’ve been exporting root components.

Most React apps use components all the way down. This means that you won’t only use components for reusable pieces like buttons, but also for larger pieces like sidebars, lists, and ultimately, complete pages! Components are a handy way to organize UI code and markup, even if some of them are only used once.

React-based frameworks take this a step further. Instead of using an empty HTML file and letting React “take over” managing the page with JavaScript, they also generate the HTML automatically from your React components. This allows your app to show some content before the JavaScript code loads.

Still, many websites only use React to add interactivity to existing HTML pages. They have many root components instead of a single one for the entire page. You can use as much—or as little—React as you need.

You’ve just gotten your first taste of React! Let’s recap some key points.

React lets you create components, reusable UI elements for your app.

In a React app, every piece of UI is a component.

React components are regular JavaScript functions except:

This sandbox doesn’t work because the root component is not exported:

Try to fix it yourself before looking at the solution!

**Examples:**

Example 1 (julia):
```julia
<article>  <h1>My First Component</h1>  <ol>    <li>Components: UI Building Blocks</li>    <li>Defining a Component</li>    <li>Using a Component</li>  </ol></article>
```

Example 2 (jsx):
```jsx
<PageLayout>  <NavigationHeader>    <SearchBar />    <Link to="/docs">Docs</Link>  </NavigationHeader>  <Sidebar />  <PageContent>    <TableOfContents />    <DocumentationText />  </PageContent></PageLayout>
```

Example 3 (jsx):
```jsx
return <img src="https://i.imgur.com/MK3eW3As.jpg" alt="Katherine Johnson" />;
```

Example 4 (jsx):
```jsx
return (  <div>    <img src="https://i.imgur.com/MK3eW3As.jpg" alt="Katherine Johnson" />  </div>);
```

---

## React Developer Tools

**URL:** https://react.dev/learn/react-developer-tools

**Contents:**
- React Developer Tools
  - You will learn
- Browser extension
  - Safari and other browsers
- Mobile (React Native)

Use React Developer Tools to inspect React components, edit props and state, and identify performance problems.

The easiest way to debug websites built with React is to install the React Developer Tools browser extension. It is available for several popular browsers:

Now, if you visit a website built with React, you will see the Components and Profiler panels.

For other browsers (for example, Safari), install the react-devtools npm package:

Next open the developer tools from the terminal:

Then connect your website by adding the following <script> tag to the beginning of your website’s <head>:

Reload your website in the browser now to view it in developer tools.

To inspect apps built with React Native, you can use React Native DevTools, the built-in debugger that deeply integrates React Developer Tools. All features work identically to the browser extension, including native element highlighting and selection.

Learn more about debugging in React Native.

For versions of React Native earlier than 0.76, please use the standalone build of React DevTools by following the Safari and other browsers guide above.

**Examples:**

Example 1 (markdown):
```markdown
# Yarnyarn global add react-devtools# Npmnpm install -g react-devtools
```

Example 2 (unknown):
```unknown
react-devtools
```

Example 3 (html):
```html
<html>  <head>    <script src="http://localhost:8097"></script>
```

---

## Importing and Exporting Components

**URL:** https://react.dev/learn/importing-and-exporting-components

**Contents:**
- Importing and Exporting Components
  - You will learn
- The root component file
- Exporting and importing a component
  - Note
      - Deep Dive
    - Default vs named exports
- Exporting and importing multiple components from the same file
  - Note
- Recap

The magic of components lies in their reusability: you can create components that are composed of other components. But as you nest more and more components, it often makes sense to start splitting them into different files. This lets you keep your files easy to scan and reuse components in more places.

In Your First Component, you made a Profile component and a Gallery component that renders it:

These currently live in a root component file, named App.js in this example. Depending on your setup, your root component could be in another file, though. If you use a framework with file-based routing, such as Next.js, your root component will be different for every page.

What if you want to change the landing screen in the future and put a list of science books there? Or place all the profiles somewhere else? It makes sense to move Gallery and Profile out of the root component file. This will make them more modular and reusable in other files. You can move a component in three steps:

Here both Profile and Gallery have been moved out of App.js into a new file called Gallery.js. Now you can change App.js to import Gallery from Gallery.js:

Notice how this example is broken down into two component files now:

You may encounter files that leave off the .js file extension like so:

Either './Gallery.js' or './Gallery' will work with React, though the former is closer to how native ES Modules work.

There are two primary ways to export values with JavaScript: default exports and named exports. So far, our examples have only used default exports. But you can use one or both of them in the same file. A file can have no more than one default export, but it can have as many named exports as you like.

How you export your component dictates how you must import it. You will get an error if you try to import a default export the same way you would a named export! This chart can help you keep track:

When you write a default import, you can put any name you want after import. For example, you could write import Banana from './Button.js' instead and it would still provide you with the same default export. In contrast, with named imports, the name has to match on both sides. That’s why they are called named imports!

People often use default exports if the file exports only one component, and use named exports if it exports multiple components and values. Regardless of which coding style you prefer, always give meaningful names to your component functions and the files that contain them. Components without names, like export default () => {}, are discouraged because they make debugging harder.

What if you want to show just one Profile instead of a gallery? You can export the Profile component, too. But Gallery.js already has a default export, and you can’t have two default exports. You could create a new file with a default export, or you could add a named export for Profile. A file can only have one default export, but it can have numerous named exports!

To reduce the potential confusion between default and named exports, some teams choose to only stick to one style (default or named), or avoid mixing them in a single file. Do what works best for you!

First, export Profile from Gallery.js using a named export (no default keyword):

Then, import Profile from Gallery.js to App.js using a named import (with the curly braces):

Finally, render <Profile /> from the App component:

Now Gallery.js contains two exports: a default Gallery export, and a named Profile export. App.js imports both of them. Try editing <Profile /> to <Gallery /> and back in this example:

Now you’re using a mix of default and named exports:

On this page you learned:

Currently, Gallery.js exports both Profile and Gallery, which is a bit confusing.

Move the Profile component to its own Profile.js, and then change the App component to render both <Profile /> and <Gallery /> one after another.

You may use either a default or a named export for Profile, but make sure that you use the corresponding import syntax in both App.js and Gallery.js! You can refer to the table from the deep dive above:

After you get it working with one kind of exports, make it work with the other kind.

**Examples:**

Example 1 (sql):
```sql
import Gallery from './Gallery';
```

Example 2 (javascript):
```javascript
export function Profile() {  // ...}
```

Example 3 (sql):
```sql
import { Profile } from './Gallery.js';
```

Example 4 (jsx):
```jsx
export default function App() {  return <Profile />;}
```

---

## JavaScript in JSX with Curly Braces

**URL:** https://react.dev/learn/javascript-in-jsx-with-curly-braces

**Contents:**
- JavaScript in JSX with Curly Braces
  - You will learn
- Passing strings with quotes
- Using curly braces: A window into the JavaScript world
  - Where to use curly braces
- Using “double curlies”: CSS and other objects in JSX
  - Pitfall
- More fun with JavaScript objects and curly braces
- Recap
- Try out some challenges

JSX lets you write HTML-like markup inside a JavaScript file, keeping rendering logic and content in the same place. Sometimes you will want to add a little JavaScript logic or reference a dynamic property inside that markup. In this situation, you can use curly braces in your JSX to open a window to JavaScript.

When you want to pass a string attribute to JSX, you put it in single or double quotes:

Here, "https://i.imgur.com/7vQD0fPs.jpg" and "Gregorio Y. Zara" are being passed as strings.

But what if you want to dynamically specify the src or alt text? You could use a value from JavaScript by replacing " and " with { and }:

Notice the difference between className="avatar", which specifies an "avatar" CSS class name that makes the image round, and src={avatar} that reads the value of the JavaScript variable called avatar. That’s because curly braces let you work with JavaScript right there in your markup!

JSX is a special way of writing JavaScript. That means it’s possible to use JavaScript inside it—with curly braces { }. The example below first declares a name for the scientist, name, then embeds it with curly braces inside the <h1>:

Try changing the name’s value from 'Gregorio Y. Zara' to 'Hedy Lamarr'. See how the list title changes?

Any JavaScript expression will work between curly braces, including function calls like formatDate():

You can only use curly braces in two ways inside JSX:

In addition to strings, numbers, and other JavaScript expressions, you can even pass objects in JSX. Objects are also denoted with curly braces, like { name: "Hedy Lamarr", inventions: 5 }. Therefore, to pass a JS object in JSX, you must wrap the object in another pair of curly braces: person={{ name: "Hedy Lamarr", inventions: 5 }}.

You may see this with inline CSS styles in JSX. React does not require you to use inline styles (CSS classes work great for most cases). But when you need an inline style, you pass an object to the style attribute:

Try changing the values of backgroundColor and color.

You can really see the JavaScript object inside the curly braces when you write it like this:

The next time you see {{ and }} in JSX, know that it’s nothing more than an object inside the JSX curlies!

Inline style properties are written in camelCase. For example, HTML <ul style="background-color: black"> would be written as <ul style={{ backgroundColor: 'black' }}> in your component.

You can move several expressions into one object, and reference them in your JSX inside curly braces:

In this example, the person JavaScript object contains a name string and a theme object:

The component can use these values from person like so:

JSX is very minimal as a templating language because it lets you organize data and logic using JavaScript.

Now you know almost everything about JSX:

This code crashes with an error saying Objects are not valid as a React child:

Can you find the problem?

**Examples:**

Example 1 (jsx):
```jsx
<ul style={  {    backgroundColor: 'black',    color: 'pink'  }}>
```

Example 2 (css):
```css
const person = {  name: 'Gregorio Y. Zara',  theme: {    backgroundColor: 'black',    color: 'pink'  }};
```

Example 3 (jsx):
```jsx
<div style={person.theme}>  <h1>{person.name}'s Todos</h1>
```

---

## Writing Markup with JSX

**URL:** https://react.dev/learn/writing-markup-with-jsx

**Contents:**
- Writing Markup with JSX
  - You will learn
- JSX: Putting markup into JavaScript
  - Note
- Converting HTML to JSX
  - Note
- The Rules of JSX
  - 1. Return a single root element
      - Deep Dive
    - Why do multiple JSX tags need to be wrapped?

JSX is a syntax extension for JavaScript that lets you write HTML-like markup inside a JavaScript file. Although there are other ways to write components, most React developers prefer the conciseness of JSX, and most codebases use it.

The Web has been built on HTML, CSS, and JavaScript. For many years, web developers kept content in HTML, design in CSS, and logic in JavaScript—often in separate files! Content was marked up inside HTML while the page’s logic lived separately in JavaScript:

But as the Web became more interactive, logic increasingly determined content. JavaScript was in charge of the HTML! This is why in React, rendering logic and markup live together in the same place—components.

Sidebar.js React component

Form.js React component

Keeping a button’s rendering logic and markup together ensures that they stay in sync with each other on every edit. Conversely, details that are unrelated, such as the button’s markup and a sidebar’s markup, are isolated from each other, making it safer to change either of them on their own.

Each React component is a JavaScript function that may contain some markup that React renders into the browser. React components use a syntax extension called JSX to represent that markup. JSX looks a lot like HTML, but it is a bit stricter and can display dynamic information. The best way to understand this is to convert some HTML markup to JSX markup.

JSX and React are two separate things. They’re often used together, but you can use them independently of each other. JSX is a syntax extension, while React is a JavaScript library.

Suppose that you have some (perfectly valid) HTML:

And you want to put it into your component:

If you copy and paste it as is, it will not work:

This is because JSX is stricter and has a few more rules than HTML! If you read the error messages above, they’ll guide you to fix the markup, or you can follow the guide below.

Most of the time, React’s on-screen error messages will help you find where the problem is. Give them a read if you get stuck!

To return multiple elements from a component, wrap them with a single parent tag.

For example, you can use a <div>:

If you don’t want to add an extra <div> to your markup, you can write <> and </> instead:

This empty tag is called a Fragment. Fragments let you group things without leaving any trace in the browser HTML tree.

JSX looks like HTML, but under the hood it is transformed into plain JavaScript objects. You can’t return two objects from a function without wrapping them into an array. This explains why you also can’t return two JSX tags without wrapping them into another tag or a Fragment.

JSX requires tags to be explicitly closed: self-closing tags like <img> must become <img />, and wrapping tags like <li>oranges must be written as <li>oranges</li>.

This is how Hedy Lamarr’s image and list items look closed:

JSX turns into JavaScript and attributes written in JSX become keys of JavaScript objects. In your own components, you will often want to read those attributes into variables. But JavaScript has limitations on variable names. For example, their names can’t contain dashes or be reserved words like class.

This is why, in React, many HTML and SVG attributes are written in camelCase. For example, instead of stroke-width you use strokeWidth. Since class is a reserved word, in React you write className instead, named after the corresponding DOM property:

You can find all these attributes in the list of DOM component props. If you get one wrong, don’t worry—React will print a message with a possible correction to the browser console.

For historical reasons, aria-* and data-* attributes are written as in HTML with dashes.

Converting all these attributes in existing markup can be tedious! We recommend using a converter to translate your existing HTML and SVG to JSX. Converters are very useful in practice, but it’s still worth understanding what is going on so that you can comfortably write JSX on your own.

Here is your final result:

Now you know why JSX exists and how to use it in components:

This HTML was pasted into a component, but it’s not valid JSX. Fix it:

Whether to do it by hand or using the converter is up to you!

**Examples:**

Example 1 (jsx):
```jsx
<h1>Hedy Lamarr's Todos</h1><img   src="https://i.imgur.com/yXOvdOSs.jpg"   alt="Hedy Lamarr"   class="photo"><ul>    <li>Invent new traffic lights    <li>Rehearse a movie scene    <li>Improve the spectrum technology</ul>
```

Example 2 (javascript):
```javascript
export default function TodoList() {  return (    // ???  )}
```

Example 3 (jsx):
```jsx
<div>  <h1>Hedy Lamarr's Todos</h1>  <img     src="https://i.imgur.com/yXOvdOSs.jpg"     alt="Hedy Lamarr"     class="photo"  >  <ul>    ...  </ul></div>
```

Example 4 (jsx):
```jsx
<>  <h1>Hedy Lamarr's Todos</h1>  <img     src="https://i.imgur.com/yXOvdOSs.jpg"     alt="Hedy Lamarr"     class="photo"  >  <ul>    ...  </ul></>
```

---

## Setup

**URL:** https://react.dev/learn/setup

**Contents:**
- Setup
- Editor Setup
- Using TypeScript
- React Developer Tools
- React Compiler
- Next steps

React integrates with tools like editors, TypeScript, browser extensions, and compilers. This section will help you get your environment set up.

See our recommended editors and learn how to set them up to work with React.

TypeScript is a popular way to add type definitions to JavaScript codebases. Learn how to integrate TypeScript into your React projects.

React Developer Tools is a browser extension that can inspect React components, edit props and state, and identify performance problems. Learn how to install it here.

React Compiler is a tool that automatically optimizes your React app. Learn more.

Head to the Quick Start guide for a tour of the most important React concepts you will encounter every day.

---

## Conditional Rendering

**URL:** https://react.dev/learn/conditional-rendering

**Contents:**
- Conditional Rendering
  - You will learn
- Conditionally returning JSX
  - Conditionally returning nothing with null
- Conditionally including JSX
  - Conditional (ternary) operator (? :)
      - Deep Dive
    - Are these two examples fully equivalent?
  - Logical AND operator (&&)
  - Pitfall

Your components will often need to display different things depending on different conditions. In React, you can conditionally render JSX using JavaScript syntax like if statements, &&, and ? : operators.

Let’s say you have a PackingList component rendering several Items, which can be marked as packed or not:

Notice that some of the Item components have their isPacked prop set to true instead of false. You want to add a checkmark (✅) to packed items if isPacked={true}.

You can write this as an if/else statement like so:

If the isPacked prop is true, this code returns a different JSX tree. With this change, some of the items get a checkmark at the end:

Try editing what gets returned in either case, and see how the result changes!

Notice how you’re creating branching logic with JavaScript’s if and return statements. In React, control flow (like conditions) is handled by JavaScript.

In some situations, you won’t want to render anything at all. For example, say you don’t want to show packed items at all. A component must return something. In this case, you can return null:

If isPacked is true, the component will return nothing, null. Otherwise, it will return JSX to render.

In practice, returning null from a component isn’t common because it might surprise a developer trying to render it. More often, you would conditionally include or exclude the component in the parent component’s JSX. Here’s how to do that!

In the previous example, you controlled which (if any!) JSX tree would be returned by the component. You may already have noticed some duplication in the render output:

Both of the conditional branches return <li className="item">...</li>:

While this duplication isn’t harmful, it could make your code harder to maintain. What if you want to change the className? You’d have to do it in two places in your code! In such a situation, you could conditionally include a little JSX to make your code more DRY.

JavaScript has a compact syntax for writing a conditional expression — the conditional operator or “ternary operator”.

You can read it as “if isPacked is true, then (?) render name + ' ✅', otherwise (:) render name”.

If you’re coming from an object-oriented programming background, you might assume that the two examples above are subtly different because one of them may create two different “instances” of <li>. But JSX elements aren’t “instances” because they don’t hold any internal state and aren’t real DOM nodes. They’re lightweight descriptions, like blueprints. So these two examples, in fact, are completely equivalent. Preserving and Resetting State goes into detail about how this works.

Now let’s say you want to wrap the completed item’s text into another HTML tag, like <del> to strike it out. You can add even more newlines and parentheses so that it’s easier to nest more JSX in each of the cases:

This style works well for simple conditions, but use it in moderation. If your components get messy with too much nested conditional markup, consider extracting child components to clean things up. In React, markup is a part of your code, so you can use tools like variables and functions to tidy up complex expressions.

Another common shortcut you’ll encounter is the JavaScript logical AND (&&) operator. Inside React components, it often comes up when you want to render some JSX when the condition is true, or render nothing otherwise. With &&, you could conditionally render the checkmark only if isPacked is true:

You can read this as “if isPacked, then (&&) render the checkmark, otherwise, render nothing”.

Here it is in action:

A JavaScript && expression returns the value of its right side (in our case, the checkmark) if the left side (our condition) is true. But if the condition is false, the whole expression becomes false. React considers false as a “hole” in the JSX tree, just like null or undefined, and doesn’t render anything in its place.

Don’t put numbers on the left side of &&.

To test the condition, JavaScript converts the left side to a boolean automatically. However, if the left side is 0, then the whole expression gets that value (0), and React will happily render 0 rather than nothing.

For example, a common mistake is to write code like messageCount && <p>New messages</p>. It’s easy to assume that it renders nothing when messageCount is 0, but it really renders the 0 itself!

To fix it, make the left side a boolean: messageCount > 0 && <p>New messages</p>.

When the shortcuts get in the way of writing plain code, try using an if statement and a variable. You can reassign variables defined with let, so start by providing the default content you want to display, the name:

Use an if statement to reassign a JSX expression to itemContent if isPacked is true:

Curly braces open the “window into JavaScript”. Embed the variable with curly braces in the returned JSX tree, nesting the previously calculated expression inside of JSX:

This style is the most verbose, but it’s also the most flexible. Here it is in action:

Like before, this works not only for text, but for arbitrary JSX too:

If you’re not familiar with JavaScript, this variety of styles might seem overwhelming at first. However, learning them will help you read and write any JavaScript code — and not just React components! Pick the one you prefer for a start, and then consult this reference again if you forget how the other ones work.

Use the conditional operator (cond ? a : b) to render a ❌ if isPacked isn’t true.

**Examples:**

Example 1 (jsx):
```jsx
if (isPacked) {  return <li className="item">{name} ✅</li>;}return <li className="item">{name}</li>;
```

Example 2 (jsx):
```jsx
if (isPacked) {  return null;}return <li className="item">{name}</li>;
```

Example 3 (jsx):
```jsx
<li className="item">{name} ✅</li>
```

Example 4 (jsx):
```jsx
<li className="item">{name}</li>
```

---

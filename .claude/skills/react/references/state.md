# React - State

**Pages:** 14

---

## useActionState

**URL:** https://react.dev/reference/react/useActionState

**Contents:**
- useActionState
  - Note
- Reference
  - useActionState(action, initialState, permalink?)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Using information returned by a form action
    - Display information after submitting a form

useActionState is a Hook that allows you to update state based on the result of a form action.

In earlier React Canary versions, this API was part of React DOM and called useFormState.

Call useActionState at the top level of your component to create component state that is updated when a form action is invoked. You pass useActionState an existing form action function as well as an initial state, and it returns a new action that you use in your form, along with the latest form state and whether the Action is still pending. The latest form state is also passed to the function that you provided.

The form state is the value returned by the action when the form was last submitted. If the form has not yet been submitted, it is the initial state that you pass.

If used with a Server Function, useActionState allows the server’s response from submitting the form to be shown even before hydration has completed.

See more examples below.

useActionState returns an array with the following values:

Call useActionState at the top level of your component to access the return value of an action from the last time a form was submitted.

useActionState returns an array with the following items:

When the form is submitted, the action function that you provided will be called. Its return value will become the new current state of the form.

The action that you provide will also receive a new first argument, namely the current state of the form. The first time the form is submitted, this will be the initial state you provided, while with subsequent submissions, it will be the return value from the last time the action was called. The rest of the arguments are the same as if useActionState had not been used.

To display messages such as an error message or toast that’s returned by a Server Function, wrap the action in a call to useActionState.

When you wrap an action with useActionState, it gets an extra argument as its first argument. The submitted form data is therefore its second argument instead of its first as it would usually be. The new first argument that gets added is the current state of the form.

**Examples:**

Example 1 (unknown):
```unknown
const [state, formAction, isPending] = useActionState(fn, initialState, permalink?);
```

Example 2 (javascript):
```javascript
import { useActionState } from "react";async function increment(previousState, formData) {  return previousState + 1;}function StatefulForm({}) {  const [state, formAction] = useActionState(increment, 0);  return (    <form>      {state}      <button formAction={formAction}>Increment</button>    </form>  )}
```

Example 3 (jsx):
```jsx
import { useActionState } from 'react';import { action } from './actions.js';function MyComponent() {  const [state, formAction] = useActionState(action, null);  // ...  return (    <form action={formAction}>      {/* ... */}    </form>  );}
```

Example 4 (javascript):
```javascript
function action(currentState, formData) {  // ...  return 'next state';}
```

---

## Built-in React APIs

**URL:** https://react.dev/reference/react/apis

**Contents:**
- Built-in React APIs
- Resource APIs

In addition to Hooks and Components, the react package exports a few other APIs that are useful for defining components. This page lists all the remaining modern React APIs.

Resources can be accessed by a component without having them as part of their state. For example, a component can read a message from a Promise or read styling information from a context.

To read a value from a resource, use this API:

**Examples:**

Example 1 (javascript):
```javascript
function MessageComponent({ messagePromise }) {  const message = use(messagePromise);  const theme = use(ThemeContext);  // ...}
```

---

## createContext

**URL:** https://react.dev/reference/react/createContext

**Contents:**
- createContext
- Reference
  - createContext(defaultValue)
    - Parameters
    - Returns
  - SomeContext Provider
  - Note
    - Props
  - SomeContext.Consumer
    - Props

createContext lets you create a context that components can provide or read.

Call createContext outside of any components to create a context.

See more examples below.

createContext returns a context object.

The context object itself does not hold any information. It represents which context other components read or provide. Typically, you will use SomeContext in components above to specify the context value, and call useContext(SomeContext) in components below to read it. The context object has a few properties:

Wrap your components into a context provider to specify the value of this context for all components inside:

Starting in React 19, you can render <SomeContext> as a provider.

In older versions of React, use <SomeContext.Provider>.

Before useContext existed, there was an older way to read context:

Although this older way still works, newly written code should read context with useContext() instead:

Context lets components pass information deep down without explicitly passing props.

Call createContext outside any components to create one or more contexts.

createContext returns a context object. Components can read context by passing it to useContext():

By default, the values they receive will be the default values you have specified when creating the contexts. However, by itself this isn’t useful because the default values never change.

Context is useful because you can provide other, dynamic values from your components:

Now the Page component and any components inside it, no matter how deep, will “see” the passed context values. If the passed context values change, React will re-render the components reading the context as well.

Read more about reading and providing context and see examples.

Often, components in different files will need access to the same context. This is why it’s common to declare contexts in a separate file. Then you can use the export statement to make context available for other files:

Components declared in other files can then use the import statement to read or provide this context:

This works similar to importing and exporting components.

Code like this specifies the default context value:

This value never changes. React only uses this value as a fallback if it can’t find a matching provider above.

To make context change over time, add state and wrap components in a context provider.

**Examples:**

Example 1 (javascript):
```javascript
const SomeContext = createContext(defaultValue)
```

Example 2 (sql):
```sql
import { createContext } from 'react';const ThemeContext = createContext('light');
```

Example 3 (jsx):
```jsx
function App() {  const [theme, setTheme] = useState('light');  // ...  return (    <ThemeContext value={theme}>      <Page />    </ThemeContext>  );}
```

Example 4 (jsx):
```jsx
function Button() {  // 🟡 Legacy way (not recommended)  return (    <ThemeContext.Consumer>      {theme => (        <button className={theme} />      )}    </ThemeContext.Consumer>  );}
```

---

## use

**URL:** https://react.dev/reference/react/use

**Contents:**
- use
- Reference
  - use(resource)
    - Parameters
    - Returns
    - Caveats
- Usage
  - Reading context with use
  - Pitfall
  - Streaming data from the server to the client

use is a React API that lets you read the value of a resource like a Promise or context.

Call use in your component to read the value of a resource like a Promise or context.

Unlike React Hooks, use can be called within loops and conditional statements like if. Like React Hooks, the function that calls use must be a Component or Hook.

When called with a Promise, the use API integrates with Suspense and Error Boundaries. The component calling use suspends while the Promise passed to use is pending. If the component that calls use is wrapped in a Suspense boundary, the fallback will be displayed. Once the Promise is resolved, the Suspense fallback is replaced by the rendered components using the data returned by the use API. If the Promise passed to use is rejected, the fallback of the nearest Error Boundary will be displayed.

See more examples below.

The use API returns the value that was read from the resource like the resolved value of a Promise or context.

When a context is passed to use, it works similarly to useContext. While useContext must be called at the top level of your component, use can be called inside conditionals like if and loops like for. use is preferred over useContext because it is more flexible.

use returns the context value for the context you passed. To determine the context value, React searches the component tree and finds the closest context provider above for that particular context.

To pass context to a Button, wrap it or one of its parent components into the corresponding context provider.

It doesn’t matter how many layers of components there are between the provider and the Button. When a Button anywhere inside of Form calls use(ThemeContext), it will receive "dark" as the value.

Unlike useContext, use can be called in conditionals and loops like if.

use is called from inside a if statement, allowing you to conditionally read values from a Context.

Like useContext, use(context) always looks for the closest context provider above the component that calls it. It searches upwards and does not consider context providers in the component from which you’re calling use(context).

Data can be streamed from the server to the client by passing a Promise as a prop from a Server Component to a Client Component.

The Client Component then takes the Promise it received as a prop and passes it to the use API. This allows the Client Component to read the value from the Promise that was initially created by the Server Component.

Because Message is wrapped in Suspense, the fallback will be displayed until the Promise is resolved. When the Promise is resolved, the value will be read by the use API and the Message component will replace the Suspense fallback.

When passing a Promise from a Server Component to a Client Component, its resolved value must be serializable to pass between server and client. Data types like functions aren’t serializable and cannot be the resolved value of such a Promise.

A Promise can be passed from a Server Component to a Client Component and resolved in the Client Component with the use API. You can also resolve the Promise in a Server Component with await and pass the required data to the Client Component as a prop.

But using await in a Server Component will block its rendering until the await statement is finished. Passing a Promise from a Server Component to a Client Component prevents the Promise from blocking the rendering of the Server Component.

In some cases a Promise passed to use could be rejected. You can handle rejected Promises by either:

use cannot be called in a try-catch block. Instead of a try-catch block wrap your component in an Error Boundary, or provide an alternative value to use with the Promise’s .catch method.

If you’d like to display an error to your users when a Promise is rejected, you can use an Error Boundary. To use an Error Boundary, wrap the component where you are calling the use API in an Error Boundary. If the Promise passed to use is rejected the fallback for the Error Boundary will be displayed.

If you’d like to provide an alternative value when the Promise passed to use is rejected you can use the Promise’s catch method.

To use the Promise’s catch method, call catch on the Promise object. catch takes a single argument: a function that takes an error message as an argument. Whatever is returned by the function passed to catch will be used as the resolved value of the Promise.

You are either calling use outside of a React Component or Hook function, or calling use in a try–catch block. If you are calling use inside a try–catch block, wrap your component in an Error Boundary, or call the Promise’s catch to catch the error and resolve the Promise with another value. See these examples.

If you are calling use outside a React Component or Hook function, move the use call to a React Component or Hook function.

Instead, call use outside any component closures, where the function that calls use is a Component or Hook.

**Examples:**

Example 1 (javascript):
```javascript
const value = use(resource);
```

Example 2 (javascript):
```javascript
import { use } from 'react';function MessageComponent({ messagePromise }) {  const message = use(messagePromise);  const theme = use(ThemeContext);  // ...
```

Example 3 (javascript):
```javascript
import { use } from 'react';function Button() {  const theme = use(ThemeContext);  // ...
```

Example 4 (jsx):
```jsx
function MyPage() {  return (    <ThemeContext value="dark">      <Form />    </ThemeContext>  );}function Form() {  // ... renders buttons inside ...}
```

---

## Managing State

**URL:** https://react.dev/learn/managing-state

**Contents:**
- Managing State
  - In this chapter
- Reacting to input with state
- Ready to learn this topic?
- Choosing the state structure
- Ready to learn this topic?
- Sharing state between components
- Ready to learn this topic?
- Preserving and resetting state
- Ready to learn this topic?

As your application grows, it helps to be more intentional about how your state is organized and how the data flows between your components. Redundant or duplicate state is a common source of bugs. In this chapter, you’ll learn how to structure your state well, how to keep your state update logic maintainable, and how to share state between distant components.

With React, you won’t modify the UI from code directly. For example, you won’t write commands like “disable the button”, “enable the button”, “show the success message”, etc. Instead, you will describe the UI you want to see for the different visual states of your component (“initial state”, “typing state”, “success state”), and then trigger the state changes in response to user input. This is similar to how designers think about UI.

Here is a quiz form built using React. Note how it uses the status state variable to determine whether to enable or disable the submit button, and whether to show the success message instead.

Read Reacting to Input with State to learn how to approach interactions with a state-driven mindset.

Structuring state well can make a difference between a component that is pleasant to modify and debug, and one that is a constant source of bugs. The most important principle is that state shouldn’t contain redundant or duplicated information. If there’s unnecessary state, it’s easy to forget to update it, and introduce bugs!

For example, this form has a redundant fullName state variable:

You can remove it and simplify the code by calculating fullName while the component is rendering:

This might seem like a small change, but many bugs in React apps are fixed this way.

Read Choosing the State Structure to learn how to design the state shape to avoid bugs.

Sometimes, you want the state of two components to always change together. To do it, remove state from both of them, move it to their closest common parent, and then pass it down to them via props. This is known as “lifting state up”, and it’s one of the most common things you will do writing React code.

In this example, only one panel should be active at a time. To achieve this, instead of keeping the active state inside each individual panel, the parent component holds the state and specifies the props for its children.

Read Sharing State Between Components to learn how to lift state up and keep components in sync.

When you re-render a component, React needs to decide which parts of the tree to keep (and update), and which parts to discard or re-create from scratch. In most cases, React’s automatic behavior works well enough. By default, React preserves the parts of the tree that “match up” with the previously rendered component tree.

However, sometimes this is not what you want. In this chat app, typing a message and then switching the recipient does not reset the input. This can make the user accidentally send a message to the wrong person:

React lets you override the default behavior, and force a component to reset its state by passing it a different key, like <Chat key={email} />. This tells React that if the recipient is different, it should be considered a different Chat component that needs to be re-created from scratch with the new data (and UI like inputs). Now switching between the recipients resets the input field—even though you render the same component.

Read Preserving and Resetting State to learn the lifetime of state and how to control it.

Components with many state updates spread across many event handlers can get overwhelming. For these cases, you can consolidate all the state update logic outside your component in a single function, called “reducer”. Your event handlers become concise because they only specify the user “actions”. At the bottom of the file, the reducer function specifies how the state should update in response to each action!

Read Extracting State Logic into a Reducer to learn how to consolidate logic in the reducer function.

Usually, you will pass information from a parent component to a child component via props. But passing props can become inconvenient if you need to pass some prop through many components, or if many components need the same information. Context lets the parent component make some information available to any component in the tree below it—no matter how deep it is—without passing it explicitly through props.

Here, the Heading component determines its heading level by “asking” the closest Section for its level. Each Section tracks its own level by asking the parent Section and adding one to it. Every Section provides information to all components below it without passing props—it does that through context.

Read Passing Data Deeply with Context to learn about using context as an alternative to passing props.

Reducers let you consolidate a component’s state update logic. Context lets you pass information deep down to other components. You can combine reducers and context together to manage state of a complex screen.

With this approach, a parent component with complex state manages it with a reducer. Other components anywhere deep in the tree can read its state via context. They can also dispatch actions to update that state.

Read Scaling Up with Reducer and Context to learn how state management scales in a growing app.

Head over to Reacting to Input with State to start reading this chapter page by page!

Or, if you’re already familiar with these topics, why not read about Escape Hatches?

---

## Queueing a Series of State Updates

**URL:** https://react.dev/learn/queueing-a-series-of-state-updates

**Contents:**
- Queueing a Series of State Updates
  - You will learn
- React batches state updates
- Updating the same state multiple times before the next render
  - What happens if you update state after replacing it
  - Note
  - What happens if you replace state after updating it
  - Naming conventions
- Recap
- Try out some challenges

Setting a state variable will queue another render. But sometimes you might want to perform multiple operations on the value before queueing the next render. To do this, it helps to understand how React batches state updates.

You might expect that clicking the “+3” button will increment the counter three times because it calls setNumber(number + 1) three times:

However, as you might recall from the previous section, each render’s state values are fixed, so the value of number inside the first render’s event handler is always 0, no matter how many times you call setNumber(1):

But there is one other factor at play here. React waits until all code in the event handlers has run before processing your state updates. This is why the re-render only happens after all these setNumber() calls.

This might remind you of a waiter taking an order at the restaurant. A waiter doesn’t run to the kitchen at the mention of your first dish! Instead, they let you finish your order, let you make changes to it, and even take orders from other people at the table.

Illustrated by Rachel Lee Nabors

This lets you update multiple state variables—even from multiple components—without triggering too many re-renders. But this also means that the UI won’t be updated until after your event handler, and any code in it, completes. This behavior, also known as batching, makes your React app run much faster. It also avoids dealing with confusing “half-finished” renders where only some of the variables have been updated.

React does not batch across multiple intentional events like clicks—each click is handled separately. Rest assured that React only does batching when it’s generally safe to do. This ensures that, for example, if the first button click disables a form, the second click would not submit it again.

It is an uncommon use case, but if you would like to update the same state variable multiple times before the next render, instead of passing the next state value like setNumber(number + 1), you can pass a function that calculates the next state based on the previous one in the queue, like setNumber(n => n + 1). It is a way to tell React to “do something with the state value” instead of just replacing it.

Try incrementing the counter now:

Here, n => n + 1 is called an updater function. When you pass it to a state setter:

Here’s how React works through these lines of code while executing the event handler:

When you call useState during the next render, React goes through the queue. The previous number state was 0, so that’s what React passes to the first updater function as the n argument. Then React takes the return value of your previous updater function and passes it to the next updater as n, and so on:

React stores 3 as the final result and returns it from useState.

This is why clicking “+3” in the above example correctly increments the value by 3.

What about this event handler? What do you think number will be in the next render?

Here’s what this event handler tells React to do:

During the next render, React goes through the state queue:

React stores 6 as the final result and returns it from useState.

You may have noticed that setState(5) actually works like setState(n => 5), but n is unused!

Let’s try one more example. What do you think number will be in the next render?

Here’s how React works through these lines of code while executing this event handler:

During the next render, React goes through the state queue:

Then React stores 42 as the final result and returns it from useState.

To summarize, here’s how you can think of what you’re passing to the setNumber state setter:

After the event handler completes, React will trigger a re-render. During the re-render, React will process the queue. Updater functions run during rendering, so updater functions must be pure and only return the result. Don’t try to set state from inside of them or run other side effects. In Strict Mode, React will run each updater function twice (but discard the second result) to help you find mistakes.

It’s common to name the updater function argument by the first letters of the corresponding state variable:

If you prefer more verbose code, another common convention is to repeat the full state variable name, like setEnabled(enabled => !enabled), or to use a prefix like setEnabled(prevEnabled => !prevEnabled).

You’re working on an art marketplace app that lets the user submit multiple orders for an art item at the same time. Each time the user presses the “Buy” button, the “Pending” counter should increase by one. After three seconds, the “Pending” counter should decrease, and the “Completed” counter should increase.

However, the “Pending” counter does not behave as intended. When you press “Buy”, it decreases to -1 (which should not be possible!). And if you click fast twice, both counters seem to behave unpredictably.

Why does this happen? Fix both counters.

**Examples:**

Example 1 (unknown):
```unknown
setNumber(0 + 1);setNumber(0 + 1);setNumber(0 + 1);
```

Example 2 (javascript):
```javascript
setNumber(n => n + 1);setNumber(n => n + 1);setNumber(n => n + 1);
```

Example 3 (jsx):
```jsx
<button onClick={() => {  setNumber(number + 5);  setNumber(n => n + 1);}}>
```

Example 4 (jsx):
```jsx
<button onClick={() => {  setNumber(number + 5);  setNumber(n => n + 1);  setNumber(42);}}>
```

---

## State as a Snapshot

**URL:** https://react.dev/learn/state-as-a-snapshot

**Contents:**
- State as a Snapshot
  - You will learn
- Setting state triggers renders
- Rendering takes a snapshot in time
- State over time
- Recap
- Try out some challenges
    - Challenge 1 of 1: Implement a traffic light

State variables might look like regular JavaScript variables that you can read and write to. However, state behaves more like a snapshot. Setting it does not change the state variable you already have, but instead triggers a re-render.

You might think of your user interface as changing directly in response to the user event like a click. In React, it works a little differently from this mental model. On the previous page, you saw that setting state requests a re-render from React. This means that for an interface to react to the event, you need to update the state.

In this example, when you press “send”, setIsSent(true) tells React to re-render the UI:

Here’s what happens when you click the button:

Let’s take a closer look at the relationship between state and rendering.

“Rendering” means that React is calling your component, which is a function. The JSX you return from that function is like a snapshot of the UI in time. Its props, event handlers, and local variables were all calculated using its state at the time of the render.

Unlike a photograph or a movie frame, the UI “snapshot” you return is interactive. It includes logic like event handlers that specify what happens in response to inputs. React updates the screen to match this snapshot and connects the event handlers. As a result, pressing a button will trigger the click handler from your JSX.

When React re-renders a component:

Illustrated by Rachel Lee Nabors

As a component’s memory, state is not like a regular variable that disappears after your function returns. State actually “lives” in React itself—as if on a shelf!—outside of your function. When React calls your component, it gives you a snapshot of the state for that particular render. Your component returns a snapshot of the UI with a fresh set of props and event handlers in its JSX, all calculated using the state values from that render!

Illustrated by Rachel Lee Nabors

Here’s a little experiment to show you how this works. In this example, you might expect that clicking the “+3” button would increment the counter three times because it calls setNumber(number + 1) three times.

See what happens when you click the “+3” button:

Notice that number only increments once per click!

Setting state only changes it for the next render. During the first render, number was 0. This is why, in that render’s onClick handler, the value of number is still 0 even after setNumber(number + 1) was called:

Here is what this button’s click handler tells React to do:

Even though you called setNumber(number + 1) three times, in this render’s event handler number is always 0, so you set the state to 1 three times. This is why, after your event handler finishes, React re-renders the component with number equal to 1 rather than 3.

You can also visualize this by mentally substituting state variables with their values in your code. Since the number state variable is 0 for this render, its event handler looks like this:

For the next render, number is 1, so that render’s click handler looks like this:

This is why clicking the button again will set the counter to 2, then to 3 on the next click, and so on.

Well, that was fun. Try to guess what clicking this button will alert:

If you use the substitution method from before, you can guess that the alert shows “0”:

But what if you put a timer on the alert, so it only fires after the component re-rendered? Would it say “0” or “5”? Have a guess!

Surprised? If you use the substitution method, you can see the “snapshot” of the state passed to the alert.

The state stored in React may have changed by the time the alert runs, but it was scheduled using a snapshot of the state at the time the user interacted with it!

A state variable’s value never changes within a render, even if its event handler’s code is asynchronous. Inside that render’s onClick, the value of number continues to be 0 even after setNumber(number + 5) was called. Its value was “fixed” when React “took the snapshot” of the UI by calling your component.

Here is an example of how that makes your event handlers less prone to timing mistakes. Below is a form that sends a message with a five-second delay. Imagine this scenario:

What do you expect the alert to display? Would it display, “You said Hello to Alice”? Or would it display, “You said Hello to Bob”? Make a guess based on what you know, and then try it:

React keeps the state values “fixed” within one render’s event handlers. You don’t need to worry whether the state has changed while the code is running.

But what if you wanted to read the latest state before a re-render? You’ll want to use a state updater function, covered on the next page!

Here is a crosswalk light component that toggles when the button is pressed:

Add an alert to the click handler. When the light is green and says “Walk”, clicking the button should say “Stop is next”. When the light is red and says “Stop”, clicking the button should say “Walk is next”.

Does it make a difference whether you put the alert before or after the setWalk call?

**Examples:**

Example 1 (jsx):
```jsx
<button onClick={() => {  setNumber(number + 1);  setNumber(number + 1);  setNumber(number + 1);}}>+3</button>
```

Example 2 (jsx):
```jsx
<button onClick={() => {  setNumber(0 + 1);  setNumber(0 + 1);  setNumber(0 + 1);}}>+3</button>
```

Example 3 (jsx):
```jsx
<button onClick={() => {  setNumber(1 + 1);  setNumber(1 + 1);  setNumber(1 + 1);}}>+3</button>
```

Example 4 (unknown):
```unknown
setNumber(0 + 5);alert(0);
```

---

## Extracting State Logic into a Reducer

**URL:** https://react.dev/learn/extracting-state-logic-into-a-reducer

**Contents:**
- Extracting State Logic into a Reducer
  - You will learn
- Consolidate state logic with a reducer
  - Step 1: Move from setting state to dispatching actions
  - Note
  - Step 2: Write a reducer function
  - Note
      - Deep Dive
    - Why are reducers called this way?
  - Step 3: Use the reducer from your component

Components with many state updates spread across many event handlers can get overwhelming. For these cases, you can consolidate all the state update logic outside your component in a single function, called a reducer.

As your components grow in complexity, it can get harder to see at a glance all the different ways in which a component’s state gets updated. For example, the TaskApp component below holds an array of tasks in state and uses three different event handlers to add, remove, and edit tasks:

Each of its event handlers calls setTasks in order to update the state. As this component grows, so does the amount of state logic sprinkled throughout it. To reduce this complexity and keep all your logic in one easy-to-access place, you can move that state logic into a single function outside your component, called a “reducer”.

Reducers are a different way to handle state. You can migrate from useState to useReducer in three steps:

Your event handlers currently specify what to do by setting state:

Remove all the state setting logic. What you are left with are three event handlers:

Managing state with reducers is slightly different from directly setting state. Instead of telling React “what to do” by setting state, you specify “what the user just did” by dispatching “actions” from your event handlers. (The state update logic will live elsewhere!) So instead of “setting tasks” via an event handler, you’re dispatching an “added/changed/deleted a task” action. This is more descriptive of the user’s intent.

The object you pass to dispatch is called an “action”:

It is a regular JavaScript object. You decide what to put in it, but generally it should contain the minimal information about what happened. (You will add the dispatch function itself in a later step.)

An action object can have any shape.

By convention, it is common to give it a string type that describes what happened, and pass any additional information in other fields. The type is specific to a component, so in this example either 'added' or 'added_task' would be fine. Choose a name that says what happened!

A reducer function is where you will put your state logic. It takes two arguments, the current state and the action object, and it returns the next state:

React will set the state to what you return from the reducer.

To move your state setting logic from your event handlers to a reducer function in this example, you will:

Here is all the state setting logic migrated to a reducer function:

Because the reducer function takes state (tasks) as an argument, you can declare it outside of your component. This decreases the indentation level and can make your code easier to read.

The code above uses if/else statements, but it’s a convention to use switch statements inside reducers. The result is the same, but it can be easier to read switch statements at a glance.

We’ll be using them throughout the rest of this documentation like so:

We recommend wrapping each case block into the { and } curly braces so that variables declared inside of different cases don’t clash with each other. Also, a case should usually end with a return. If you forget to return, the code will “fall through” to the next case, which can lead to mistakes!

If you’re not yet comfortable with switch statements, using if/else is completely fine.

Although reducers can “reduce” the amount of code inside your component, they are actually named after the reduce() operation that you can perform on arrays.

The reduce() operation lets you take an array and “accumulate” a single value out of many:

The function you pass to reduce is known as a “reducer”. It takes the result so far and the current item, then it returns the next result. React reducers are an example of the same idea: they take the state so far and the action, and return the next state. In this way, they accumulate actions over time into state.

You could even use the reduce() method with an initialState and an array of actions to calculate the final state by passing your reducer function to it:

You probably won’t need to do this yourself, but this is similar to what React does!

Finally, you need to hook up the tasksReducer to your component. Import the useReducer Hook from React:

Then you can replace useState:

with useReducer like so:

The useReducer Hook is similar to useState—you must pass it an initial state and it returns a stateful value and a way to set state (in this case, the dispatch function). But it’s a little different.

The useReducer Hook takes two arguments:

Now it’s fully wired up! Here, the reducer is declared at the bottom of the component file:

If you want, you can even move the reducer to a different file:

Component logic can be easier to read when you separate concerns like this. Now the event handlers only specify what happened by dispatching actions, and the reducer function determines how the state updates in response to them.

Reducers are not without downsides! Here’s a few ways you can compare them:

We recommend using a reducer if you often encounter bugs due to incorrect state updates in some component, and want to introduce more structure to its code. You don’t have to use reducers for everything: feel free to mix and match! You can even useState and useReducer in the same component.

Keep these two tips in mind when writing reducers:

Just like with updating objects and arrays in regular state, you can use the Immer library to make reducers more concise. Here, useImmerReducer lets you mutate the state with push or arr[i] = assignment:

Reducers must be pure, so they shouldn’t mutate state. But Immer provides you with a special draft object which is safe to mutate. Under the hood, Immer will create a copy of your state with the changes you made to the draft. This is why reducers managed by useImmerReducer can mutate their first argument and don’t need to return state.

Currently, the event handlers in ContactList.js and Chat.js have // TODO comments. This is why typing into the input doesn’t work, and clicking on the buttons doesn’t change the selected recipient.

Replace these two // TODOs with the code to dispatch the corresponding actions. To see the expected shape and the type of the actions, check the reducer in messengerReducer.js. The reducer is already written so you won’t need to change it. You only need to dispatch the actions in ContactList.js and Chat.js.

**Examples:**

Example 1 (javascript):
```javascript
function handleAddTask(text) {  setTasks([    ...tasks,    {      id: nextId++,      text: text,      done: false,    },  ]);}function handleChangeTask(task) {  setTasks(    tasks.map((t) => {      if (t.id === task.id) {        return task;      } else {        return t;      }    })  );}function handleDeleteTask(taskId) {  setTasks(tasks.filter((t) => t.id !== taskId));}
```

Example 2 (javascript):
```javascript
function handleAddTask(text) {  dispatch({    type: 'added',    id: nextId++,    text: text,  });}function handleChangeTask(task) {  dispatch({    type: 'changed',    task: task,  });}function handleDeleteTask(taskId) {  dispatch({    type: 'deleted',    id: taskId,  });}
```

Example 3 (javascript):
```javascript
function handleDeleteTask(taskId) {  dispatch(    // "action" object:    {      type: 'deleted',      id: taskId,    }  );}
```

Example 4 (unknown):
```unknown
dispatch({  // specific to component  type: 'what_happened',  // other fields go here});
```

---

## Updating Objects in State

**URL:** https://react.dev/learn/updating-objects-in-state

**Contents:**
- Updating Objects in State
  - You will learn
- What’s a mutation?
- Treat state as read-only
      - Deep Dive
    - Local mutation is fine
- Copying objects with the spread syntax
      - Deep Dive
    - Using a single event handler for multiple fields
- Updating a nested object

State can hold any kind of JavaScript value, including objects. But you shouldn’t change objects that you hold in the React state directly. Instead, when you want to update an object, you need to create a new one (or make a copy of an existing one), and then set the state to use that copy.

You can store any kind of JavaScript value in state.

So far you’ve been working with numbers, strings, and booleans. These kinds of JavaScript values are “immutable”, meaning unchangeable or “read-only”. You can trigger a re-render to replace a value:

The x state changed from 0 to 5, but the number 0 itself did not change. It’s not possible to make any changes to the built-in primitive values like numbers, strings, and booleans in JavaScript.

Now consider an object in state:

Technically, it is possible to change the contents of the object itself. This is called a mutation:

However, although objects in React state are technically mutable, you should treat them as if they were immutable—like numbers, booleans, and strings. Instead of mutating them, you should always replace them.

In other words, you should treat any JavaScript object that you put into state as read-only.

This example holds an object in state to represent the current pointer position. The red dot is supposed to move when you touch or move the cursor over the preview area. But the dot stays in the initial position:

The problem is with this bit of code.

This code modifies the object assigned to position from the previous render. But without using the state setting function, React has no idea that object has changed. So React does not do anything in response. It’s like trying to change the order after you’ve already eaten the meal. While mutating state can work in some cases, we don’t recommend it. You should treat the state value you have access to in a render as read-only.

To actually trigger a re-render in this case, create a new object and pass it to the state setting function:

With setPosition, you’re telling React:

Notice how the red dot now follows your pointer when you touch or hover over the preview area:

Code like this is a problem because it modifies an existing object in state:

But code like this is absolutely fine because you’re mutating a fresh object you have just created:

In fact, it is completely equivalent to writing this:

Mutation is only a problem when you change existing objects that are already in state. Mutating an object you’ve just created is okay because no other code references it yet. Changing it isn’t going to accidentally impact something that depends on it. This is called a “local mutation”. You can even do local mutation while rendering. Very convenient and completely okay!

In the previous example, the position object is always created fresh from the current cursor position. But often, you will want to include existing data as a part of the new object you’re creating. For example, you may want to update only one field in a form, but keep the previous values for all other fields.

These input fields don’t work because the onChange handlers mutate the state:

For example, this line mutates the state from a past render:

The reliable way to get the behavior you’re looking for is to create a new object and pass it to setPerson. But here, you want to also copy the existing data into it because only one of the fields has changed:

You can use the ... object spread syntax so that you don’t need to copy every property separately.

Notice how you didn’t declare a separate state variable for each input field. For large forms, keeping all data grouped in an object is very convenient—as long as you update it correctly!

Note that the ... spread syntax is “shallow”—it only copies things one level deep. This makes it fast, but it also means that if you want to update a nested property, you’ll have to use it more than once.

You can also use the [ and ] braces inside your object definition to specify a property with a dynamic name. Here is the same example, but with a single event handler instead of three different ones:

Here, e.target.name refers to the name property given to the <input> DOM element.

Consider a nested object structure like this:

If you wanted to update person.artwork.city, it’s clear how to do it with mutation:

But in React, you treat state as immutable! In order to change city, you would first need to produce the new artwork object (pre-populated with data from the previous one), and then produce the new person object which points at the new artwork:

Or, written as a single function call:

This gets a bit wordy, but it works fine for many cases:

An object like this appears “nested” in code:

However, “nesting” is an inaccurate way to think about how objects behave. When the code executes, there is no such thing as a “nested” object. You are really looking at two different objects:

The obj1 object is not “inside” obj2. For example, obj3 could “point” at obj1 too:

If you were to mutate obj3.artwork.city, it would affect both obj2.artwork.city and obj1.city. This is because obj3.artwork, obj2.artwork, and obj1 are the same object. This is difficult to see when you think of objects as “nested”. Instead, they are separate objects “pointing” at each other with properties.

If your state is deeply nested, you might want to consider flattening it. But, if you don’t want to change your state structure, you might prefer a shortcut to nested spreads. Immer is a popular library that lets you write using the convenient but mutating syntax and takes care of producing the copies for you. With Immer, the code you write looks like you are “breaking the rules” and mutating an object:

But unlike a regular mutation, it doesn’t overwrite the past state!

The draft provided by Immer is a special type of object, called a Proxy, that “records” what you do with it. This is why you can mutate it freely as much as you like! Under the hood, Immer figures out which parts of the draft have been changed, and produces a completely new object that contains your edits.

Here is the above example converted to Immer:

Notice how much more concise the event handlers have become. You can mix and match useState and useImmer in a single component as much as you like. Immer is a great way to keep the update handlers concise, especially if there’s nesting in your state, and copying objects leads to repetitive code.

There are a few reasons:

In practice, you can often “get away” with mutating state in React, but we strongly advise you not to do that so that you can use new React features developed with this approach in mind. Future contributors and perhaps even your future self will thank you!

This form has a few bugs. Click the button that increases the score a few times. Notice that it does not increase. Then edit the first name, and notice that the score has suddenly “caught up” with your changes. Finally, edit the last name, and notice that the score has disappeared completely.

Your task is to fix all of these bugs. As you fix them, explain why each of them happens.

**Examples:**

Example 1 (jsx):
```jsx
const [x, setX] = useState(0);
```

Example 2 (jsx):
```jsx
const [position, setPosition] = useState({ x: 0, y: 0 });
```

Example 3 (unknown):
```unknown
position.x = 5;
```

Example 4 (javascript):
```javascript
onPointerMove={e => {  position.x = e.clientX;  position.y = e.clientY;}}
```

---

## Updating Arrays in State

**URL:** https://react.dev/learn/updating-arrays-in-state

**Contents:**
- Updating Arrays in State
  - You will learn
- Updating arrays without mutation
  - Pitfall
  - Adding to an array
  - Removing from an array
  - Transforming an array
  - Replacing items in an array
  - Inserting into an array
  - Making other changes to an array

Arrays are mutable in JavaScript, but you should treat them as immutable when you store them in state. Just like with objects, when you want to update an array stored in state, you need to create a new one (or make a copy of an existing one), and then set state to use the new array.

In JavaScript, arrays are just another kind of object. Like with objects, you should treat arrays in React state as read-only. This means that you shouldn’t reassign items inside an array like arr[0] = 'bird', and you also shouldn’t use methods that mutate the array, such as push() and pop().

Instead, every time you want to update an array, you’ll want to pass a new array to your state setting function. To do that, you can create a new array from the original array in your state by calling its non-mutating methods like filter() and map(). Then you can set your state to the resulting new array.

Here is a reference table of common array operations. When dealing with arrays inside React state, you will need to avoid the methods in the left column, and instead prefer the methods in the right column:

Alternatively, you can use Immer which lets you use methods from both columns.

Unfortunately, slice and splice are named similarly but are very different:

In React, you will be using slice (no p!) a lot more often because you don’t want to mutate objects or arrays in state. Updating Objects explains what mutation is and why it’s not recommended for state.

push() will mutate an array, which you don’t want:

Instead, create a new array which contains the existing items and a new item at the end. There are multiple ways to do this, but the easiest one is to use the ... array spread syntax:

Now it works correctly:

The array spread syntax also lets you prepend an item by placing it before the original ...artists:

In this way, spread can do the job of both push() by adding to the end of an array and unshift() by adding to the beginning of an array. Try it in the sandbox above!

The easiest way to remove an item from an array is to filter it out. In other words, you will produce a new array that will not contain that item. To do this, use the filter method, for example:

Click the “Delete” button a few times, and look at its click handler.

Here, artists.filter(a => a.id !== artist.id) means “create an array that consists of those artists whose IDs are different from artist.id”. In other words, each artist’s “Delete” button will filter that artist out of the array, and then request a re-render with the resulting array. Note that filter does not modify the original array.

If you want to change some or all items of the array, you can use map() to create a new array. The function you will pass to map can decide what to do with each item, based on its data or its index (or both).

In this example, an array holds coordinates of two circles and a square. When you press the button, it moves only the circles down by 50 pixels. It does this by producing a new array of data using map():

It is particularly common to want to replace one or more items in an array. Assignments like arr[0] = 'bird' are mutating the original array, so instead you’ll want to use map for this as well.

To replace an item, create a new array with map. Inside your map call, you will receive the item index as the second argument. Use it to decide whether to return the original item (the first argument) or something else:

Sometimes, you may want to insert an item at a particular position that’s neither at the beginning nor at the end. To do this, you can use the ... array spread syntax together with the slice() method. The slice() method lets you cut a “slice” of the array. To insert an item, you will create an array that spreads the slice before the insertion point, then the new item, and then the rest of the original array.

In this example, the Insert button always inserts at the index 1:

There are some things you can’t do with the spread syntax and non-mutating methods like map() and filter() alone. For example, you may want to reverse or sort an array. The JavaScript reverse() and sort() methods are mutating the original array, so you can’t use them directly.

However, you can copy the array first, and then make changes to it.

Here, you use the [...list] spread syntax to create a copy of the original array first. Now that you have a copy, you can use mutating methods like nextList.reverse() or nextList.sort(), or even assign individual items with nextList[0] = "something".

However, even if you copy an array, you can’t mutate existing items inside of it directly. This is because copying is shallow—the new array will contain the same items as the original one. So if you modify an object inside the copied array, you are mutating the existing state. For example, code like this is a problem.

Although nextList and list are two different arrays, nextList[0] and list[0] point to the same object. So by changing nextList[0].seen, you are also changing list[0].seen. This is a state mutation, which you should avoid! You can solve this issue in a similar way to updating nested JavaScript objects—by copying individual items you want to change instead of mutating them. Here’s how.

Objects are not really located “inside” arrays. They might appear to be “inside” in code, but each object in an array is a separate value, to which the array “points”. This is why you need to be careful when changing nested fields like list[0]. Another person’s artwork list may point to the same element of the array!

When updating nested state, you need to create copies from the point where you want to update, and all the way up to the top level. Let’s see how this works.

In this example, two separate artwork lists have the same initial state. They are supposed to be isolated, but because of a mutation, their state is accidentally shared, and checking a box in one list affects the other list:

The problem is in code like this:

Although the myNextList array itself is new, the items themselves are the same as in the original myList array. So changing artwork.seen changes the original artwork item. That artwork item is also in yourList, which causes the bug. Bugs like this can be difficult to think about, but thankfully they disappear if you avoid mutating state.

You can use map to substitute an old item with its updated version without mutation.

Here, ... is the object spread syntax used to create a copy of an object.

With this approach, none of the existing state items are being mutated, and the bug is fixed:

In general, you should only mutate objects that you have just created. If you were inserting a new artwork, you could mutate it, but if you’re dealing with something that’s already in state, you need to make a copy.

Updating nested arrays without mutation can get a little bit repetitive. Just as with objects:

Here is the Art Bucket List example rewritten with Immer:

Note how with Immer, mutation like artwork.seen = nextSeen is now okay:

This is because you’re not mutating the original state, but you’re mutating a special draft object provided by Immer. Similarly, you can apply mutating methods like push() and pop() to the content of the draft.

Behind the scenes, Immer always constructs the next state from scratch according to the changes that you’ve done to the draft. This keeps your event handlers very concise without ever mutating state.

Fill in the handleIncreaseClick logic so that pressing ”+” increases the corresponding number:

**Examples:**

Example 1 (css):
```css
setArtists( // Replace the state  [ // with a new array    ...artists, // that contains all the old items    { id: nextId++, name: name } // and one new item at the end  ]);
```

Example 2 (css):
```css
setArtists([  { id: nextId++, name: name },  ...artists // Put old items at the end]);
```

Example 3 (javascript):
```javascript
setArtists(  artists.filter(a => a.id !== artist.id));
```

Example 4 (javascript):
```javascript
const nextList = [...list];nextList[0].seen = true; // Problem: mutates list[0]setList(nextList);
```

---

## Preserving and Resetting State

**URL:** https://react.dev/learn/preserving-and-resetting-state

**Contents:**
- Preserving and Resetting State
  - You will learn
- State is tied to a position in the render tree
- Same component at the same position preserves state
  - Pitfall
- Different components at the same position reset state
  - Pitfall
- Resetting state at the same position
  - Option 1: Rendering a component in different positions
  - Option 2: Resetting state with a key

State is isolated between components. React keeps track of which state belongs to which component based on their place in the UI tree. You can control when to preserve state and when to reset it between re-renders.

React builds render trees for the component structure in your UI.

When you give a component state, you might think the state “lives” inside the component. But the state is actually held inside React. React associates each piece of state it’s holding with the correct component by where that component sits in the render tree.

Here, there is only one <Counter /> JSX tag, but it’s rendered at two different positions:

Here’s how these look as a tree:

These are two separate counters because each is rendered at its own position in the tree. You don’t usually have to think about these positions to use React, but it can be useful to understand how it works.

In React, each component on the screen has fully isolated state. For example, if you render two Counter components side by side, each of them will get its own, independent, score and hover states.

Try clicking both counters and notice they don’t affect each other:

As you can see, when one counter is updated, only the state for that component is updated:

React will keep the state around for as long as you render the same component at the same position in the tree. To see this, increment both counters, then remove the second component by unchecking “Render the second counter” checkbox, and then add it back by ticking it again:

Notice how the moment you stop rendering the second counter, its state disappears completely. That’s because when React removes a component, it destroys its state.

When you tick “Render the second counter”, a second Counter and its state are initialized from scratch (score = 0) and added to the DOM.

React preserves a component’s state for as long as it’s being rendered at its position in the UI tree. If it gets removed, or a different component gets rendered at the same position, React discards its state.

In this example, there are two different <Counter /> tags:

When you tick or clear the checkbox, the counter state does not get reset. Whether isFancy is true or false, you always have a <Counter /> as the first child of the div returned from the root App component:

Updating the App state does not reset the Counter because Counter stays in the same position

It’s the same component at the same position, so from React’s perspective, it’s the same counter.

Remember that it’s the position in the UI tree—not in the JSX markup—that matters to React! This component has two return clauses with different <Counter /> JSX tags inside and outside the if:

You might expect the state to reset when you tick checkbox, but it doesn’t! This is because both of these <Counter /> tags are rendered at the same position. React doesn’t know where you place the conditions in your function. All it “sees” is the tree you return.

In both cases, the App component returns a <div> with <Counter /> as a first child. To React, these two counters have the same “address”: the first child of the first child of the root. This is how React matches them up between the previous and next renders, regardless of how you structure your logic.

In this example, ticking the checkbox will replace <Counter> with a <p>:

Here, you switch between different component types at the same position. Initially, the first child of the <div> contained a Counter. But when you swapped in a p, React removed the Counter from the UI tree and destroyed its state.

When Counter changes to p, the Counter is deleted and the p is added

When switching back, the p is deleted and the Counter is added

Also, when you render a different component in the same position, it resets the state of its entire subtree. To see how this works, increment the counter and then tick the checkbox:

The counter state gets reset when you click the checkbox. Although you render a Counter, the first child of the div changes from a section to a div. When the child section was removed from the DOM, the whole tree below it (including the Counter and its state) was destroyed as well.

When section changes to div, the section is deleted and the new div is added

When switching back, the div is deleted and the new section is added

As a rule of thumb, if you want to preserve the state between re-renders, the structure of your tree needs to “match up” from one render to another. If the structure is different, the state gets destroyed because React destroys state when it removes a component from the tree.

This is why you should not nest component function definitions.

Here, the MyTextField component function is defined inside MyComponent:

Every time you click the button, the input state disappears! This is because a different MyTextField function is created for every render of MyComponent. You’re rendering a different component in the same position, so React resets all state below. This leads to bugs and performance problems. To avoid this problem, always declare component functions at the top level, and don’t nest their definitions.

By default, React preserves state of a component while it stays at the same position. Usually, this is exactly what you want, so it makes sense as the default behavior. But sometimes, you may want to reset a component’s state. Consider this app that lets two players keep track of their scores during each turn:

Currently, when you change the player, the score is preserved. The two Counters appear in the same position, so React sees them as the same Counter whose person prop has changed.

But conceptually, in this app they should be two separate counters. They might appear in the same place in the UI, but one is a counter for Taylor, and another is a counter for Sarah.

There are two ways to reset state when switching between them:

If you want these two Counters to be independent, you can render them in two different positions:

Clicking “next” again

Each Counter’s state gets destroyed each time it’s removed from the DOM. This is why they reset every time you click the button.

This solution is convenient when you only have a few independent components rendered in the same place. In this example, you only have two, so it’s not a hassle to render both separately in the JSX.

There is also another, more generic, way to reset a component’s state.

You might have seen keys when rendering lists. Keys aren’t just for lists! You can use keys to make React distinguish between any components. By default, React uses order within the parent (“first counter”, “second counter”) to discern between components. But keys let you tell React that this is not just a first counter, or a second counter, but a specific counter—for example, Taylor’s counter. This way, React will know Taylor’s counter wherever it appears in the tree!

In this example, the two <Counter />s don’t share state even though they appear in the same place in JSX:

Switching between Taylor and Sarah does not preserve the state. This is because you gave them different keys:

Specifying a key tells React to use the key itself as part of the position, instead of their order within the parent. This is why, even though you render them in the same place in JSX, React sees them as two different counters, and so they will never share state. Every time a counter appears on the screen, its state is created. Every time it is removed, its state is destroyed. Toggling between them resets their state over and over.

Remember that keys are not globally unique. They only specify the position within the parent.

Resetting state with a key is particularly useful when dealing with forms.

In this chat app, the <Chat> component contains the text input state:

Try entering something into the input, and then press “Alice” or “Bob” to choose a different recipient. You will notice that the input state is preserved because the <Chat> is rendered at the same position in the tree.

In many apps, this may be the desired behavior, but not in a chat app! You don’t want to let the user send a message they already typed to a wrong person due to an accidental click. To fix it, add a key:

This ensures that when you select a different recipient, the Chat component will be recreated from scratch, including any state in the tree below it. React will also re-create the DOM elements instead of reusing them.

Now switching the recipient always clears the text field:

In a real chat app, you’d probably want to recover the input state when the user selects the previous recipient again. There are a few ways to keep the state “alive” for a component that’s no longer visible:

No matter which strategy you pick, a chat with Alice is conceptually distinct from a chat with Bob, so it makes sense to give a key to the <Chat> tree based on the current recipient.

This example shows a message when you press the button. However, pressing the button also accidentally resets the input. Why does this happen? Fix it so that pressing the button does not reset the input text.

**Examples:**

Example 1 (jsx):
```jsx
{isPlayerA ? (  <Counter key="Taylor" person="Taylor" />) : (  <Counter key="Sarah" person="Sarah" />)}
```

Example 2 (jsx):
```jsx
<Chat key={to.id} contact={to} />
```

---

## Choosing the State Structure

**URL:** https://react.dev/learn/choosing-the-state-structure

**Contents:**
- Choosing the State Structure
  - You will learn
- Principles for structuring state
- Group related state
  - Pitfall
- Avoid contradictions in state
- Avoid redundant state
      - Deep Dive
    - Don’t mirror props in state
- Avoid duplication in state

Structuring state well can make a difference between a component that is pleasant to modify and debug, and one that is a constant source of bugs. Here are some tips you should consider when structuring state.

When you write a component that holds some state, you’ll have to make choices about how many state variables to use and what the shape of their data should be. While it’s possible to write correct programs even with a suboptimal state structure, there are a few principles that can guide you to make better choices:

The goal behind these principles is to make state easy to update without introducing mistakes. Removing redundant and duplicate data from state helps ensure that all its pieces stay in sync. This is similar to how a database engineer might want to “normalize” the database structure to reduce the chance of bugs. To paraphrase Albert Einstein, “Make your state as simple as it can be—but no simpler.”

Now let’s see how these principles apply in action.

You might sometimes be unsure between using a single or multiple state variables.

Technically, you can use either of these approaches. But if some two state variables always change together, it might be a good idea to unify them into a single state variable. Then you won’t forget to always keep them in sync, like in this example where moving the cursor updates both coordinates of the red dot:

Another case where you’ll group data into an object or an array is when you don’t know how many pieces of state you’ll need. For example, it’s helpful when you have a form where the user can add custom fields.

If your state variable is an object, remember that you can’t update only one field in it without explicitly copying the other fields. For example, you can’t do setPosition({ x: 100 }) in the above example because it would not have the y property at all! Instead, if you wanted to set x alone, you would either do setPosition({ ...position, x: 100 }), or split them into two state variables and do setX(100).

Here is a hotel feedback form with isSending and isSent state variables:

While this code works, it leaves the door open for “impossible” states. For example, if you forget to call setIsSent and setIsSending together, you may end up in a situation where both isSending and isSent are true at the same time. The more complex your component is, the harder it is to understand what happened.

Since isSending and isSent should never be true at the same time, it is better to replace them with one status state variable that may take one of three valid states: 'typing' (initial), 'sending', and 'sent':

You can still declare some constants for readability:

But they’re not state variables, so you don’t need to worry about them getting out of sync with each other.

If you can calculate some information from the component’s props or its existing state variables during rendering, you should not put that information into that component’s state.

For example, take this form. It works, but can you find any redundant state in it?

This form has three state variables: firstName, lastName, and fullName. However, fullName is redundant. You can always calculate fullName from firstName and lastName during render, so remove it from state.

This is how you can do it:

Here, fullName is not a state variable. Instead, it’s calculated during render:

As a result, the change handlers don’t need to do anything special to update it. When you call setFirstName or setLastName, you trigger a re-render, and then the next fullName will be calculated from the fresh data.

A common example of redundant state is code like this:

Here, a color state variable is initialized to the messageColor prop. The problem is that if the parent component passes a different value of messageColor later (for example, 'red' instead of 'blue'), the color state variable would not be updated! The state is only initialized during the first render.

This is why “mirroring” some prop in a state variable can lead to confusion. Instead, use the messageColor prop directly in your code. If you want to give it a shorter name, use a constant:

This way it won’t get out of sync with the prop passed from the parent component.

”Mirroring” props into state only makes sense when you want to ignore all updates for a specific prop. By convention, start the prop name with initial or default to clarify that its new values are ignored:

This menu list component lets you choose a single travel snack out of several:

Currently, it stores the selected item as an object in the selectedItem state variable. However, this is not great: the contents of the selectedItem is the same object as one of the items inside the items list. This means that the information about the item itself is duplicated in two places.

Why is this a problem? Let’s make each item editable:

Notice how if you first click “Choose” on an item and then edit it, the input updates but the label at the bottom does not reflect the edits. This is because you have duplicated state, and you forgot to update selectedItem.

Although you could update selectedItem too, an easier fix is to remove duplication. In this example, instead of a selectedItem object (which creates a duplication with objects inside items), you hold the selectedId in state, and then get the selectedItem by searching the items array for an item with that ID:

The state used to be duplicated like this:

But after the change it’s like this:

The duplication is gone, and you only keep the essential state!

Now if you edit the selected item, the message below will update immediately. This is because setItems triggers a re-render, and items.find(...) would find the item with the updated title. You didn’t need to hold the selected item in state, because only the selected ID is essential. The rest could be calculated during render.

Imagine a travel plan consisting of planets, continents, and countries. You might be tempted to structure its state using nested objects and arrays, like in this example:

Now let’s say you want to add a button to delete a place you’ve already visited. How would you go about it? Updating nested state involves making copies of objects all the way up from the part that changed. Deleting a deeply nested place would involve copying its entire parent place chain. Such code can be very verbose.

If the state is too nested to update easily, consider making it “flat”. Here is one way you can restructure this data. Instead of a tree-like structure where each place has an array of its child places, you can have each place hold an array of its child place IDs. Then store a mapping from each place ID to the corresponding place.

This data restructuring might remind you of seeing a database table:

Now that the state is “flat” (also known as “normalized”), updating nested items becomes easier.

In order to remove a place now, you only need to update two levels of state:

Here is an example of how you could go about it:

You can nest state as much as you like, but making it “flat” can solve numerous problems. It makes state easier to update, and it helps ensure you don’t have duplication in different parts of a nested object.

Ideally, you would also remove the deleted items (and their children!) from the “table” object to improve memory usage. This version does that. It also uses Immer to make the update logic more concise.

Sometimes, you can also reduce state nesting by moving some of the nested state into the child components. This works well for ephemeral UI state that doesn’t need to be stored, like whether an item is hovered.

This Clock component receives two props: color and time. When you select a different color in the select box, the Clock component receives a different color prop from its parent component. However, for some reason, the displayed color doesn’t update. Why? Fix the problem.

**Examples:**

Example 1 (jsx):
```jsx
const [x, setX] = useState(0);const [y, setY] = useState(0);
```

Example 2 (jsx):
```jsx
const [position, setPosition] = useState({ x: 0, y: 0 });
```

Example 3 (javascript):
```javascript
const isSending = status === 'sending';const isSent = status === 'sent';
```

Example 4 (javascript):
```javascript
const fullName = firstName + ' ' + lastName;
```

---

## Reacting to Input with State

**URL:** https://react.dev/learn/reacting-to-input-with-state

**Contents:**
- Reacting to Input with State
  - You will learn
- How declarative UI compares to imperative
- Thinking about UI declaratively
  - Step 1: Identify your component’s different visual states
      - Deep Dive
    - Displaying many visual states at once
  - Step 2: Determine what triggers those state changes
  - Note
  - Step 3: Represent the state in memory with useState

React provides a declarative way to manipulate the UI. Instead of manipulating individual pieces of the UI directly, you describe the different states that your component can be in, and switch between them in response to the user input. This is similar to how designers think about the UI.

When you design UI interactions, you probably think about how the UI changes in response to user actions. Consider a form that lets the user submit an answer:

In imperative programming, the above corresponds directly to how you implement interaction. You have to write the exact instructions to manipulate the UI depending on what just happened. Here’s another way to think about this: imagine riding next to someone in a car and telling them turn by turn where to go.

Illustrated by Rachel Lee Nabors

They don’t know where you want to go, they just follow your commands. (And if you get the directions wrong, you end up in the wrong place!) It’s called imperative because you have to “command” each element, from the spinner to the button, telling the computer how to update the UI.

In this example of imperative UI programming, the form is built without React. It only uses the browser DOM:

Manipulating the UI imperatively works well enough for isolated examples, but it gets exponentially more difficult to manage in more complex systems. Imagine updating a page full of different forms like this one. Adding a new UI element or a new interaction would require carefully checking all existing code to make sure you haven’t introduced a bug (for example, forgetting to show or hide something).

React was built to solve this problem.

In React, you don’t directly manipulate the UI—meaning you don’t enable, disable, show, or hide components directly. Instead, you declare what you want to show, and React figures out how to update the UI. Think of getting into a taxi and telling the driver where you want to go instead of telling them exactly where to turn. It’s the driver’s job to get you there, and they might even know some shortcuts you haven’t considered!

Illustrated by Rachel Lee Nabors

You’ve seen how to implement a form imperatively above. To better understand how to think in React, you’ll walk through reimplementing this UI in React below:

In computer science, you may hear about a “state machine” being in one of several “states”. If you work with a designer, you may have seen mockups for different “visual states”. React stands at the intersection of design and computer science, so both of these ideas are sources of inspiration.

First, you need to visualize all the different “states” of the UI the user might see:

Just like a designer, you’ll want to “mock up” or create “mocks” for the different states before you add logic. For example, here is a mock for just the visual part of the form. This mock is controlled by a prop called status with a default value of 'empty':

You could call that prop anything you like, the naming is not important. Try editing status = 'empty' to status = 'success' to see the success message appear. Mocking lets you quickly iterate on the UI before you wire up any logic. Here is a more fleshed out prototype of the same component, still “controlled” by the status prop:

If a component has a lot of visual states, it can be convenient to show them all on one page:

Pages like this are often called “living styleguides” or “storybooks”.

You can trigger state updates in response to two kinds of inputs:

Illustrated by Rachel Lee Nabors

In both cases, you must set state variables to update the UI. For the form you’re developing, you will need to change state in response to a few different inputs:

Notice that human inputs often require event handlers!

To help visualize this flow, try drawing each state on paper as a labeled circle, and each change between two states as an arrow. You can sketch out many flows this way and sort out bugs long before implementation.

Next you’ll need to represent the visual states of your component in memory with useState. Simplicity is key: each piece of state is a “moving piece”, and you want as few “moving pieces” as possible. More complexity leads to more bugs!

Start with the state that absolutely must be there. For example, you’ll need to store the answer for the input, and the error (if it exists) to store the last error:

Then, you’ll need a state variable representing which one of the visual states that you want to display. There’s usually more than a single way to represent that in memory, so you’ll need to experiment with it.

If you struggle to think of the best way immediately, start by adding enough state that you’re definitely sure that all the possible visual states are covered:

Your first idea likely won’t be the best, but that’s ok—refactoring state is a part of the process!

You want to avoid duplication in the state content so you’re only tracking what is essential. Spending a little time on refactoring your state structure will make your components easier to understand, reduce duplication, and avoid unintended meanings. Your goal is to prevent the cases where the state in memory doesn’t represent any valid UI that you’d want a user to see. (For example, you never want to show an error message and disable the input at the same time, or the user won’t be able to correct the error!)

Here are some questions you can ask about your state variables:

After this clean-up, you’re left with 3 (down from 7!) essential state variables:

You know they are essential, because you can’t remove any of them without breaking the functionality.

These three variables are a good enough representation of this form’s state. However, there are still some intermediate states that don’t fully make sense. For example, a non-null error doesn’t make sense when status is 'success'. To model the state more precisely, you can extract it into a reducer. Reducers let you unify multiple state variables into a single object and consolidate all the related logic!

Lastly, create event handlers that update the state. Below is the final form, with all event handlers wired up:

Although this code is longer than the original imperative example, it is much less fragile. Expressing all interactions as state changes lets you later introduce new visual states without breaking existing ones. It also lets you change what should be displayed in each state without changing the logic of the interaction itself.

Make it so that clicking on the picture removes the background--active CSS class from the outer <div>, but adds the picture--active class to the <img>. Clicking the background again should restore the original CSS classes.

Visually, you should expect that clicking on the picture removes the purple background and highlights the picture border. Clicking outside the picture highlights the background, but removes the picture border highlight.

**Examples:**

Example 1 (jsx):
```jsx
const [answer, setAnswer] = useState('');const [error, setError] = useState(null);
```

Example 2 (jsx):
```jsx
const [isEmpty, setIsEmpty] = useState(true);const [isTyping, setIsTyping] = useState(false);const [isSubmitting, setIsSubmitting] = useState(false);const [isSuccess, setIsSuccess] = useState(false);const [isError, setIsError] = useState(false);
```

Example 3 (jsx):
```jsx
const [answer, setAnswer] = useState('');const [error, setError] = useState(null);const [status, setStatus] = useState('typing'); // 'typing', 'submitting', or 'success'
```

---

## Scaling Up with Reducer and Context

**URL:** https://react.dev/learn/scaling-up-with-reducer-and-context

**Contents:**
- Scaling Up with Reducer and Context
  - You will learn
- Combining a reducer with context
  - Step 1: Create the context
  - Step 2: Put state and dispatch into context
  - Step 3: Use context anywhere in the tree
- Moving all wiring into a single file
  - Note
- Recap

Reducers let you consolidate a component’s state update logic. Context lets you pass information deep down to other components. You can combine reducers and context together to manage state of a complex screen.

In this example from the introduction to reducers, the state is managed by a reducer. The reducer function contains all of the state update logic and is declared at the bottom of this file:

A reducer helps keep the event handlers short and concise. However, as your app grows, you might run into another difficulty. Currently, the tasks state and the dispatch function are only available in the top-level TaskApp component. To let other components read the list of tasks or change it, you have to explicitly pass down the current state and the event handlers that change it as props.

For example, TaskApp passes a list of tasks and the event handlers to TaskList:

And TaskList passes the event handlers to Task:

In a small example like this, this works well, but if you have tens or hundreds of components in the middle, passing down all state and functions can be quite frustrating!

This is why, as an alternative to passing them through props, you might want to put both the tasks state and the dispatch function into context. This way, any component below TaskApp in the tree can read the tasks and dispatch actions without the repetitive “prop drilling”.

Here is how you can combine a reducer with context:

The useReducer Hook returns the current tasks and the dispatch function that lets you update them:

To pass them down the tree, you will create two separate contexts:

Export them from a separate file so that you can later import them from other files:

Here, you’re passing null as the default value to both contexts. The actual values will be provided by the TaskApp component.

Now you can import both contexts in your TaskApp component. Take the tasks and dispatch returned by useReducer() and provide them to the entire tree below:

For now, you pass the information both via props and in context:

In the next step, you will remove prop passing.

Now you don’t need to pass the list of tasks or the event handlers down the tree:

Instead, any component that needs the task list can read it from the TasksContext:

To update the task list, any component can read the dispatch function from context and call it:

The TaskApp component does not pass any event handlers down, and the TaskList does not pass any event handlers to the Task component either. Each component reads the context that it needs:

The state still “lives” in the top-level TaskApp component, managed with useReducer. But its tasks and dispatch are now available to every component below in the tree by importing and using these contexts.

You don’t have to do this, but you could further declutter the components by moving both reducer and context into a single file. Currently, TasksContext.js contains only two context declarations:

This file is about to get crowded! You’ll move the reducer into that same file. Then you’ll declare a new TasksProvider component in the same file. This component will tie all the pieces together:

This removes all the complexity and wiring from your TaskApp component:

You can also export functions that use the context from TasksContext.js:

When a component needs to read context, it can do it through these functions:

This doesn’t change the behavior in any way, but it lets you later split these contexts further or add some logic to these functions. Now all of the context and reducer wiring is in TasksContext.js. This keeps the components clean and uncluttered, focused on what they display rather than where they get the data:

You can think of TasksProvider as a part of the screen that knows how to deal with tasks, useTasks as a way to read them, and useTasksDispatch as a way to update them from any component below in the tree.

Functions like useTasks and useTasksDispatch are called Custom Hooks. Your function is considered a custom Hook if its name starts with use. This lets you use other Hooks, like useContext, inside it.

As your app grows, you may have many context-reducer pairs like this. This is a powerful way to scale your app and lift state up without too much work whenever you want to access the data deep in the tree.

**Examples:**

Example 1 (jsx):
```jsx
<TaskList  tasks={tasks}  onChangeTask={handleChangeTask}  onDeleteTask={handleDeleteTask}/>
```

Example 2 (jsx):
```jsx
<Task  task={task}  onChange={onChangeTask}  onDelete={onDeleteTask}/>
```

Example 3 (unknown):
```unknown
const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
```

Example 4 (javascript):
```javascript
import { TasksContext, TasksDispatchContext } from './TasksContext.js';export default function TaskApp() {  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);  // ...  return (    <TasksContext value={tasks}>      <TasksDispatchContext value={dispatch}>        ...      </TasksDispatchContext>    </TasksContext>  );}
```

---

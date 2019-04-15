# wouter

[![Build Status](https://travis-ci.org/molefrog/wouter.svg?branch=master)](https://travis-ci.org/molefrog/wouter)

A tiny routing solution for modern React apps that relies on Hooks. Perfect for small and hackathon projects.

  - Mimics `react-router`'s best practices, although the library is not a drop-in replacement.
  - A top-level `Router` component is **fully optional**!
  - Out of the box only supports History API, customization is possible via a `Router` component.
  - Small, **2KB** gzipped (vs 17KB `react-router`) with plans to get it down to 1KB. This is currently work in progress, [help is appreciated](https://github.com/molefrog/wouter/issues/1).
  
## How to get started?
Check out this demo app below in order to get started:

```js
import { Link, Route } from "wouter";

const App = () => (
  <div>
    <nav>
      <Link href="/inbox">Inbox</Link>
      <Link href="/settings">
        {/* a link element can be customized */}
        <a className="link-red">Settings</a>
      </Link>
    </nav>

    <main>
      <Route path="/users/:id">
        {params => <div>User ID: {params.id}</div>}
      </Route>
      
      {/* React-Router's way of describing routes */}
      <Route path="/inbox" component={InboxPage} />
      
      <Route path="/settings">Settings Page</Route>
    </main>
  </div>
);
```

### The power of HOOKS!
`wouter` relies heavily on [React Hooks](https://reactjs.org/docs/hooks-intro.html). Thus it makes creating cutom interactions such as route transitions or accessing router directly easier. You can check if a particular route matches the current location by using a `useRoute` hook:

```js
import { useRoute } from "wouter";
import { Transition } from "react-transition-group"

const AnimatedRoute = () => {
  // `match` is boolean
  const [match, params] = useRoute("/users/:id");

  return (
    <Transition in={match}>
      This is user ID: {params.id}
    </Transition>
  )
};
```

### Working with History
By default `wouter` creates an internal History object that observes the changes of the current location. If you need a custom history observer, for example for hash-based routing you can implement your [own history](https://github.com/molefrog/wouter/blob/master/history.js).

```js
import { Router, Route, useRouter } from "wouter"

const App => (
  <Router history={myHashHistory}>
    <Route path="/about" component={About} />
    ...
  </Router>
)

// you can later access the history object through the router object
const Foo = () => {
  const router = useRouter()

  // manually changes the location
  return <div onClick={() => router.history.push("/orders")}>My Orders</div>
}
```

## Your feedback is welcome!
Please feel free to participate in development of the library.

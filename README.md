# wouter

[![Build Status](https://travis-ci.org/molefrog/wouter.svg?branch=master)](https://travis-ci.org/molefrog/wouter)

A tiny routing solution for modern React apps that relies on Hooks. A router you wanted so bad in your pet project.

- Zero dependency, only **1.04KB** gzipped (vs 17KB `react-router`).
- A top-level `Router` component is **fully optional**.
- Mimics `react-router`'s best practices, although the library is not a drop-in replacement.
- Out of the box only supports History API, customization is possible via a `Router` component.

## How to get started?

Check out this demo app below in order to get started:

```js
import { Link, Route } from "wouter";

const App = () => (
  <div>
    <Link href="/users/1">
      <a className="link">Profile</a>
    </Link>

    <Route path="/about">About Us</Route>
    <Route path="/users/:name">
      {params => <div>Hello, {params.name}!</div>}
    </Route>
    <Route path="/inbox" component={InboxPage} />
  </div>
);
```

### The power of HOOKS!

`wouter` relies heavily on [React Hooks](https://reactjs.org/docs/hooks-intro.html). Thus it makes creating cutom interactions such as route transitions or accessing router directly easier. You can check if a particular route matches the current location by using a `useRoute` hook:

```js
import { useRoute } from "wouter";
import { Transition } from "react-transition-group";

const AnimatedRoute = () => {
  // `match` is boolean
  const [match, params] = useRoute("/users/:id");

  return <Transition in={match}>This is user ID: {params.id}</Transition>;
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

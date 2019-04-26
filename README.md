# wouter

[![Build Status](https://travis-ci.org/molefrog/wouter.svg?branch=master)](https://travis-ci.org/molefrog/wouter)

<img src="logo.svg" align="right" width="200" alt="Wouter Logo by Katya Vakulenko">
     
A tiny routing solution for modern React apps that relies on Hooks. A router you wanted so bad in your pet project!

- Zero dependency, only **1.04KB** gzipped vs 17KB [React Router](https://github.com/ReactTraining/react-router).
- A top-level `<Router />` component is **fully optional**.
- Mimics [React Router](https://github.com/ReactTraining/react-router)'s best practices, however the library isn't a drop-in replacement.
- Out of the box only supports History API, customization is possible via a `<Router />` component.

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

**wouter** relies heavily on [React Hooks](https://reactjs.org/docs/hooks-intro.html). Thus it makes creating custom interactions such as route transitions or accessing router directly easier. You can check if a particular route matches the current location by using a `useRoute` hook:

```js
import { useRoute } from "wouter";
import { Transition } from "react-transition-group";

const AnimatedRoute = () => {
  // `match` is boolean
  const [match, params] = useRoute("/users/:id");

  return <Transition in={match}>This is user ID: {params.id}</Transition>;
};
```

### Matching Dynamic Segments

Just like in React Router you can make dynamic matches either with `Route` component or `useRoute` hook.
`useRoute` returns a second parameter which is a hash of all dynamic segments matched. Similarily, the
`Route` component passes these parameters down to its children via a function prop.

```js
import { useRoute } from "wouter";

// /users/alex => [true, { name: "alex "}]
// /anything   => [false, null]
const [match, params] = useRoute("/users/:name");

// or with Route component
<Route path="/users/:name">
  {params => {
    /* { name: "alex" } */
  }}
</Route>;
```

**wouter** implements a limited subset of [`path-to-regexp` package](https://github.com/pillarjs/path-to-regexp)
used by React Router or Express, and it supports the following patterns:

- Named dynamic segments: `/users/:foo`.
- Dynamic segments with modifiers: `/foo/:bar*`, `/foo/baz?` or `/foo/bar+`.

The library was designed to be as small as possible, so most of the additional matching feature were left out
(see [this issue](https://github.com/molefrog/wouter/issues/1) for more info).
If you do need to have `path-to-regexp`-like functionality you can customize a matcher function:

```js
import { Router } from "wouter";
import createMatcher from "wouter/matcher";

import pathToRegexp from "path-to-regexp";

const App = () => (
  <Router matcher={createMatcher(pathToRegexp)}>
    {/* segment constraints aren't supported by wouter */}
    <Route path="/users/:id(\d+)" />}
  </Router>
);
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

## Your feedback is welcome

Feel free to participate in development of the library, your feedback is much appreciated.

## Acknowledgements

Special thanks to [Katya Vakulenko](https://katyavakulenko.com/) for creating a project logo.

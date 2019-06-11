# wouter

[![npm](https://img.shields.io/npm/v/wouter.svg?color=%2356C838)](https://www.npmjs.com/package/wouter)
[![Build Status](https://travis-ci.org/molefrog/wouter.svg?branch=master)](https://travis-ci.org/molefrog/wouter) [![codecov](https://codecov.io/gh/molefrog/wouter/branch/master/graph/badge.svg)](https://codecov.io/gh/molefrog/wouter)

<img src="logo.svg" align="right" width="200" alt="Wouter Logo by Katya Vakulenko">

A tiny routing solution for modern React apps that relies on Hooks. A router you wanted so bad in your project!

- Zero dependency, only **1.11KB** gzipped vs 17KB [React Router](https://github.com/ReactTraining/react-router).
- Supports both **React** and **[Preact](https://preactjs.com/)**! Read _["Preact support" section](#preact-support)_ for more details.
- No top-level `<Router />` component, it is **fully optional**.
- Mimics [React Router](https://github.com/ReactTraining/react-router)'s best practices, however the library isn't a drop-in replacement.
- Only History API is supported out of the box, while customization is available via the `<Router />` component.

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

### This library comes untranspiled, please read this!

**TL;DR** Want to support IE11 → make sure you transpile `node_modules`.

The library is written in pure ES6 and doesn't come with transpiled sources. There is a [big debate going on](https://gist.github.com/Rich-Harris/51e1bf24e7c093469ef7a0983bad94cb) it the community on whether or not libraries should ship untranspiled code. Wouter was designed to be as small as possible and the decision to ship raw ES6 was made intentionally. We only use basic things like arrow functions and destructive assignment, so it should work fine in the [majority of the browsers](https://caniuse.com/#feat=es6). If you'd like to aim platforms like IE11, please make sure you run Babel over your `node_modules`.

## Wouter API

### The power of HOOKS!

**wouter** relies heavily on [React Hooks](https://reactjs.org/docs/hooks-intro.html). Thus, it makes creating custom interactions such as route transitions or accessing router directly easier. You can check if a particular route matches the current location by using a `useRoute` hook:

```js
import { useRoute } from "wouter";
import { Transition } from "react-transition-group";

const AnimatedRoute = () => {
  // `match` is boolean
  const [match, params] = useRoute("/users/:id");

  return <Transition in={match}>This is user ID: {params.id}</Transition>;
};
```

### `useLocation` hook: working with the history

The low-level navigation in wouter is powered by the `useLocation` hook, which is basically a wrapper around
the native browser location object. The hook rerenders when the location changes and you can also perform
a navigation with it, this is very similar to how you work with values returned from the `useState` hook:

```js
import { useLocation } from "wouter";

const CurrentLocation = () => {
  const [location, setLocation] = useLocation();

  return (
    <div>
      {`The current page is: ${location}`}
      <a onClick={() => setLocation("/somewhere")}>Click to update</a>
    </div>
  );
};
```

All the components including the `useRoute` rely on `useLocation` hook, so normally you only need the hook to
perform the navigation using a second value `setLocation`. You can check out the source code of the [`Redirect` component](https://github.com/molefrog/wouter/blob/master/index.js#L142) as a reference.

By default, **wouter** uses `useLocation` hook that reacts to `pushState` and `replaceState` navigation and observes the current pathname including the leading slash e.g. **/users/12**. If you do need a custom history observer, for example, for hash-based routing, you can [implement your own hook](https://github.com/molefrog/wouter/blob/master/use-location.js) and customize it in a `<Router />` component:

```js
import { useState, useEffect } from "react";
import { Router, Route } from "wouter";

const useCustomLocation = () => {
  const [location, update] = useState();

  // custom location logic
};

const App = () => (
  <Router hook={useCustomLocation}>
    <Route path="/about" component={About} />
    ...
  </Router>
);
```

### Matching Dynamic Segments

Just like in React Router, you can make dynamic matches either with `Route` component or `useRoute` hook.
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

The library was designed to be as small as possible, so most of the additional matching features were left out
(see [this issue](https://github.com/molefrog/wouter/issues/1) for more info).
If you do need to have `path-to-regexp`-like functionality, you can customize a matcher function:

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

## FAQ and Code Recipes

### How do I make a default/fallback route?

One of the common patterns in application routing is having a default route that will be shown as a fallback, in case no other route matches (for example, if you need to render 404 message). In **wouter** this can easily be done as a combination of `<Switch />` component and catch-all route:

```js
import { Switch, Route } from "wouter";

<Switch>
  <Route path="/about">...</Route>
  <Route path="/:rest*">404, not found!</Route>
</Switch>;
```

**[▶ Demo Sandbox](https://codesandbox.io/s/oqk302k2y)**

### How do I make a link active for the current route?

There are cases when you need to highlight an active link, for example, in the navigation bar. While this functionality isn't provided out-of-the-box, you can easily write your own `<Link />` wrapper and detect if the path is active by using the `useRoute` hook. The `useRoute(pattern)` hook returns a pair of `[match, params]`, where `match` is a boolean value that tells if the pattern matches current location:

```js
const [isActive] = useRoute(props.href);

return (
  <Link {...props}>
    <a className={isActive ? "active" : ""}>{props.children}</a>
  </Link>
);
```

**[▶ Demo Sandbox](https://codesandbox.io/s/5zjpj19yz4)**

### Can I use _wouter_ in my TypeScript project?

Yes! Although the project isn't written in TypeScript, there is a [type definition package](https://www.npmjs.com/package/@types/wouter) available through [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped). Simply add `npm install --save-dev @types/wouter` to your project and develop safely with types.

### Preact support?

The Preact exports are available within the `wouter/preact` namespace:

```diff
- import { useRoute, Route, Switch } from "wouter";
+ import { useRoute, Route, Switch } from "wouter/preact";
```

You might need to ensure you have the latest version of [Preact X](https://github.com/preactjs/preact/releases/tag/10.0.0-alpha.0) with support for hooks.

### Is there any support for server-side rendering (SSR)?

Yes! In order to render your app on a server, you'll need to tell the router that the current location comes from the request rather than the browser history. In **wouter**, you can achieve that by replacing the default `useLocation` hook with a static one:

```js
import { renderToString } from "react-dom/server";
import { Router, Route } from "wouter";

// note: static location has a different import path,
// this helps to keep the wouter source as small as possible
import staticLocationHook from "wouter/static-location";

import App from "./app";

const handleRequest = (req, res) => {
  // The staticLocationHook function creates a hook that always
  // responds with a path provided
  const prerendered = renderToString(
    <Router hook={staticLocationHook(req.path)}>
      <App />
    </Router>
  );

  // respond with prerendered html
};
```

Make sure you replace the static hook with the real one when you hydrate your app on a client.

### 1KB is too much, I can't afford it!

We've got some great news for you! If you're a minimalist bundle-size nomad and you need a damn simple
routing in your app, you can just use the [`useLocation` hook](#uselocation-hook-working-with-the-history)
which is only **241 bytes gzipped** and manually match the current location with it:

```js
import useLocation from "wouter/use-location";

const UsersRoute = () => {
  const [location] = useLocation();

  if (location !== "/users") return null;

  // render the route
};
```

Wouter's motto is **"Minimalist-friendly"**.

## Acknowledgements

Special thanks to [Katya Vakulenko](https://katyavakulenko.com/) for creating a project logo.

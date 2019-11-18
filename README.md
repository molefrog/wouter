# wouter

[![npm](https://img.shields.io/npm/v/wouter.svg?color=%2356C838)](https://www.npmjs.com/package/wouter)
[![Build Status](https://travis-ci.org/molefrog/wouter.svg?branch=master)](https://travis-ci.org/molefrog/wouter) [![codecov](https://codecov.io/gh/molefrog/wouter/branch/master/graph/badge.svg)](https://codecov.io/gh/molefrog/wouter)

<img src="logo.svg" align="right" width="200" alt="Wouter Logo by Katya Vakulenko">

A tiny routing solution for modern React and Preact apps that relies on Hooks. A router you wanted so bad in your project!

- Zero dependency, only **1278 B** gzipped vs 17KB [React Router](https://github.com/ReactTraining/react-router).
- Supports both **React** and **[Preact](https://preactjs.com/)**! Read _["Preact support" section](#preact-support)_ for more details.
- No top-level `<Router />` component, it is **fully optional**.
- Mimics [React Router](https://github.com/ReactTraining/react-router)'s best practices by providing familiar
  **[`Route`](#route-pathpattern-)**, **[`Link`](#link-hrefpath-)**, **[`Switch`](#switch-)** and **[`Redirect`](#redirect-topath-)** components.
- Has hook-based API for more granular control over routing (like animations): **[`useLocation`](#uselocation-hook-working-with-the-history)**, **[`useRoute`](#useroute-the-power-of-hooks)** and **[`useRouter`](#userouter-accessing-the-router-object)**.

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

### Supporting IE11 and obsolete platforms

This library uses features like [destructuring assignment](https://kangax.github.io/compat-table/es6/#test-destructuring,_assignment) and [`const/let` declarations](https://kangax.github.io/compat-table/es6/#test-const) and doesn't ship with ES5 transpiled sources. If you aim to support browsers like IE11 and below → make sure you run Babel over your `node_modules`

## Wouter API

Wouter comes with two kinds of APIs: low-level [React Hooks](https://reactjs.org/docs/hooks-intro.html) API and more traditional component-based API similar to React Router's one.

You are free to choose whatever works for you: use hooks when you want to keep your app as
small as possible or you want to build custom routing components; or if you're building a
traditional app with pages and navigation — components might come in handy.

Check out also [FAQ and Code Recipes](#faq-and-code-recipes) for more advanced things like
active links, default routes etc.

### The list of methods available

**Hooks API:**

- **[`useRoute`](#useroute-the-power-of-hooks)** — shows whether or not current page matches the pattern provided.
- **[`useLocation`](#uselocation-hook-working-with-the-history)** — allows to manipulate current browser location, a tiny wrapper around the History API.
- **[`useRouter`](#userouter-accessing-the-router-object)** — returns a global router object that holds the configuration. Only use it if
  you want to customize the routing.

**Component API:**

- **[`<Route />`](#route-pathpattern-)** — conditionally renders a component based on a pattern.
- **[`<Link />`](#link-hrefpath-)** — wraps `<a>`, allows to perfom a navigation.
- **[`<Switch />`](#switch-)** — exclusive routing, only renders the first matched route.
- **[`<Redirect />`](#redirect-topath-)** — when rendered, performs an immediate navigation.
- **[`<Router />`](#router-hookhook-matchermatchfn-)** — an optional top-level component for advanced routing configuration.

## Hooks API

### `useRoute`: the power of HOOKS!

Hooks make creating custom interactions such as route transitions or accessing router directly easier. You can check if a particular route matches the current location by using a `useRoute` hook:

```js
import { useRoute } from "wouter";
import { Transition } from "react-transition-group";

const AnimatedRoute = () => {
  // `match` is boolean
  const [match, params] = useRoute("/users/:id");

  return <Transition in={match}>Hi, this is: {params.id}</Transition>;
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

#### Customizing the location hook

By default, **wouter** uses `useLocation` hook that reacts to `pushState` and `replaceState` navigation and observes the current pathname including the leading slash e.g. **`/users/12`**. If you do need a custom history observer, for example, for hash-based routing, you can [implement your own hook](https://github.com/molefrog/wouter/blob/master/use-location.js) and customize it in a `<Router />` component.

Here is how you can implement a router with a fixed basepath:

```js
import { useState, useEffect } from "react";
import { Router, Route } from "wouter";

// a default useLocation hook which wouter uses
import useLocation from "wouter/use-location";

const makeUseBasepathLocation = basepath => () => {
  const [location, setLocation] = useLocation();

  // could be done with regexp, but requires proper escaping
  const normalized = location.startsWith(basepath)
    ? location.slice(basepath.length)
    : location;

  return [normalized, to => setLocation(basepath + to)];
};

const useBasepathLocation = makeUseBasepathLocation("/app");

const App = () => (
  <Router hook={useBasepathLocation}>
    <Route path="/about" component={About} />
    ...
  </Router>
);
```

### `useRouter`: accessing the router object

If you're building an advanced integration, for example custom location hook, you might
want to get access to the global router object. The router is a simple object that holds
current matcher function and a custom location hook function.

Normally, router is constructed internally on demand, but it can also be customized via a top-level `Router` component (see [the section above](#uselocation-hook-working-with-the-history)). The `useRouter` hook simply returns a
current router object:

```js
import { useRouter } from "wouter";
import useLocation from "wouter/use-location";

const Custom = () => {
  const router = useRouter();

  // router.hook is useLocation by default

  // you can also use router as a mediator object
  // and store arbitrary data on it:
  router.lastTransition = { path: "..." };
};
```

## Component API

### `<Route path={pattern} />`

`Route` represents a piece of the app that is rendered conditionally based on a pattern. Pattern is a string, which may
contain special characters to describe dynamic segments, see [**Matching Dynamic Segments** section](#matching-dynamic-segments)
below for details.

The library provides multiple ways to declare a route's body:

```js
import { Route } from "wouter";

// simple form
<Route path="/home"><Home /></Route>

// render-prop style
<Route path="/users/:id">
  {params => <UserPage id={params.id} />}
</Route>

// the `params` prop will be passed down to <Orders />
<Route path="/orders/:status" component={Orders} />
```

### `<Link href={path} />`

Link component renders an `<a />` element that, when clicked, performs a navigation. You can customize the link appearance
by providing your own component or link element as `children`:

```js
import { Link } from "wouter";

// All of these will produce the same html:
// <a href="/foo" class="active">Hello!</a>

// lazy form: `a` element is constructed around children
<Link href="/foo" className="active">Hello!</Link>

// when using your own component or jsx the `href` prop
// will be passed down to an element
<Link href="/foo"><a className="active">Hello!</a></Link>
<Link href="/foo"><A>Hello!</A></Link>
```

### `<Switch />`

There are cases when you want to have an exclusive routing: to make sure that only one route is rendered at the time, even
if the routes have patterns that overlap. That's what `Switch` does: it only renders **the first matching route**.

```js
import { Route, Switch } from "wouter";

<Switch>
  <Route path="/orders/all" component={AllOrders} />
  <Route path="/orders/:status" component={Orders} />
</Switch>;
```

Check out [**FAQ and Code Recipes** section](#faq-and-code-recipes) for more advanced use of `Switch`.

### `<Redirect to={path} />`

When mounted performs a redirect to a `path` provided. Uses `useLocation` hook internally to trigger the navigation inside of a `useEffect` block.

If you need more advanced logic for navigation, for example, to trigger
the redirect inside of an event handler, consider using [`useLocation` hook instead](#uselocation-hook-working-with-the-history):

```js
import { useLocation } from "wouter";

const [location, setLocation] = useLocation();

fetchOrders().then(orders => {
  setOrders(orders);
  setLocation("/app/orders");
});
```

### `<Router hook={hook} matcher={matchFn} />`

Unlike _React Router_, routes in wouter **don't have to be wrapped in a top-level component**. An internal router object will
be constructed on demand, so you can start writing your app without polluting it with a cascade of top-level providers.
There are cases however, when the routing behaviour needs to be customized.

These cases include hash-based routing, basepath support, custom matcher function etc.

A router is a simple object that holds the routing configuration options. You can always obtain this object using a [`useRouter` hook](#userouter-accessing-the-router-object). The list of currently available options:

- **`hook: () => [location: string, setLocation: fn]`** — is a React Hook function that subscribes to location changes. It returns a pair of current `location` string e.g. `/app/users` and a `setLocation` function for navigation. You can use this hook from any component of your app by calling [`useLocation()` hook](#uselocation-hook-working-with-the-history).

Read more → [Customizing the location hook](#customizing-the-location-hook).

- **`matcher: (pattern: string, path: string) => [match: boolean, params: object]`** — a custom function used for matching the current location against the user-defined patterns like `/app/users/:id`. Should return a match result and an hash of extracted parameters.

Read more → [Matching Dynamic Segments](#matching-dynamic-segments).

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

Yes! Although the project isn't written in TypeScript, the type definition files are bundled with the package.

### Preact support?

Preact exports are available through a separate package named `wouter-preact` (or within the `wouter/preact` namespace, however this method isn't recommended as it requires React as a peer dependency):

```diff
- import { useRoute, Route, Switch } from "wouter";
+ import { useRoute, Route, Switch } from "wouter-preact";
```

You might need to ensure you have the latest version of [Preact X](https://github.com/preactjs/preact/releases/tag/10.0.0-alpha.0) with support for hooks.

**[▶ Demo Sandbox](https://codesandbox.io/s/wouter-preact-0lr3n)**

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
which is only **338 bytes gzipped** and manually match the current location with it:

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

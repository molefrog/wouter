# wouter 👩‍✈️

[![Build Status](https://travis-ci.org/molefrog/wouter.svg?branch=master)](https://travis-ci.org/molefrog/wouter)

A tiny routing solution for modern React apps that relies on Hooks. Perfect for small and hackathon projects.

  - Mimics `react-router`'s best practices, although the library is not a drop-in replacement.
  - A top-level `Router` component is **fully optional**!
  - Out of the box only supports History API, customization is possible via a `Router` component.
  - Small, **3KB** gzipped (vs 17KB `react-router`) with plans to get it down to 1KB (this is currently work in progress, your [help is welcome](https://github.com/molefrog/wouter/pulls)!).
  
## Getting started 
Check out this demo app below in order to get started:

```js
import { Link, Route } from "wouter";

const App = () => (
  <div>
    <nav>
      <Link href="/inbox">Inbox</Link>
      <Link href="/users/1">My Profile</Link>

      {/* an element can be customized */}
      <Link href="/settings">
        <a className="link-red">Settings</a>
      </Link>
    </nav>

    <main>
      {/* React-Router's way of describing routes */}
      <Route path="/inbox" component={InboxPage} />

      <Route path="/users/:id">
        {params => <div>User ID: {params.id}</div>}
      </Route>

      <Route path="/settings">
        Settings Page
      </Route>
    </main>
  </div>
);
```

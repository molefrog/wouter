import * as React from "react";
import {
  Route,
  Params,
  Link,
  Redirect,
  Switch,
  Router,
  useLocation,
  useRoute,
  PushCallback
} from "wouter";

const Header: React.FunctionComponent = () => <div />;

/*
 * Params type specs
 */
const someParams: Params = { foo: "bar" };

// error: values are strings!
const invalidParams: Params = { id: 13 }; // $ExpectError

/*
 * <Route /> component type specs
 */

// Has `path` prop, should always be a string
<Route path="/app/users" />;
<Route path={Symbol()} />; // $ExpectError
<Route path={1337} />; // $ExpectError
<Route />; // $ExpectError

// Supports various ways to declare children
<Route path="/header" component={Header} />;

<Route path="/app">
  <div />
</Route>;

<Route path="/app">
  This is a <b>mixed</b> content
</Route>;

<Route path="/users/:id">
  {(params: Params): React.ReactNode => `User id: ${params.id}`}
</Route>;

<Route path="/app" match={true} />; // $ExpectError

/*
 * Link and Redirect component type specs
 */
<Link to="/users">Users</Link>;
<Link href="/about">About</Link>;
<Link href="/about">
  This is <i>awesome!</i>
</Link>;

<Link href="/">
  <a className="active">Active Link</a>
</Link>;

<Link href="/foo">
  <Header />
</Link>;

<Redirect to="/" />;
<Redirect href="/" />;

<Redirect>something</Redirect>; // $ExpectError

/*
 * Switch specs
 */

<Switch>
  <Route path="/app/users" />
  <Route path="/app/:id" />
</Switch>;

/*
 * Router specs
 */

<Router hook="wat?" />; // $ExpectError

<Router>
  <Route path="/" />
  <b>Hello!</b>
</Router>;

<Router>
  Hello, we have <Header /> and some {1337} numbers here.
</Router>;

/*
 * Hooks API
 */
const [location, setLocation] = useLocation();
location; // $ExpectType string

setLocation(); // $ExpectError
setLocation("/app");
setLocation("/app", true);

useRoute(Symbol()); // $ExpectError
useRoute(); // $ExpectError
useRoute("/");

const [match, params] = useRoute("/app/users/:id");
match; // $ExpectType boolean

if (params) {
  params.id; // $ExpectType string
} else {
  params; // $ExpectType null
}

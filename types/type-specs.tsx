import * as React from "react";
import {
  Link,
  Params,
  Redirect,
  Route,
  RouteComponentProps,
  Router,
  Switch,
  useLocation,
  useRoute,
} from "wouter";

import useBrowserLocation from "wouter/use-location";
import staticLocationHook from "wouter/static-location";

const Header: React.FunctionComponent = () => <div />;
const Profile = ({ params }: RouteComponentProps<{ id: string }>) => (
  <div>User id: {params.id}</div>
);

/*
 * Params type specs
 */
const someParams: Params = { foo: "bar" };
const someParamsWithGeneric: Params<{ foo: string }> = { foo: "bar" };

// error: params should follow generic type
const paramsDontMatchGeneric: Params<{ foo: string }> = { baz: "bar" }; // $ExpectError

// error: values are strings!
const invalidParams: Params = { id: 13 }; // $ExpectError
const invalidParamsWithGeneric: Params<{ id: number }> = { id: 13 }; // $ExpectError

/*
 * <Route /> component type specs
 */

// Has `path` prop, should always be a string
<Route path="/app/users" />;
<Route path={Symbol()} />; // $ExpectError
<Route path={1337} />; // $ExpectError
<Route />;

// Supports various ways to declare children
<Route path="/header" component={Header} />;
<Route path="/profile/:id" component={Profile} />;
<Route<{ id: string }> path="/profile/:id" component={Profile} />;
<Route<{ name: string }> path="/profile/:name" component={Profile} />; // $ExpectError

<Route path="/app">
  <div />
</Route>;

<Route path="/app">
  This is a <b>mixed</b> content
</Route>;

<Route path="/users/:id">
  {(params: Params): React.ReactNode => `User id: ${params.id}`}
</Route>;

<Route<{ id: string }> path="/users/:id">{({ id }) => `User id: ${id}`}</Route>;

<Route<{ id: string }> path="/users/:id">
  {({ age }) => `User age: ${age}`} // $ExpectError
</Route>;

<Route path="/app" match={true} />; // $ExpectError

/*
 * Link and Redirect component type specs
 */

// `to` and `href` are aliases, but they are mutually exclusive and
// can't be used at the same time:
<Link to="/users">Users</Link>;
<Link href="/about">About</Link>;
<Link href="/about" to="/app" children="" />; // $ExpectError
<Link children="" />; // $ExpectError

<Link href="/about" replace>
  About
</Link>;

<Link href="/about">
  This is <i>awesome!</i>
</Link>;

<Link href="/">
  <a className="active">Active Link</a>
</Link>;

<Link href="/foo">
  <Header />
</Link>;

// supports standard link attributes
<Link
  href="/somewhere"
  onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {}}
  children={null}
/>;
<Link download href="/" target="_blank" rel="noreferrer" children={null} />;

<Link
  href="/somewhere"
  children={null}
  onDrag={(event) => {
    event; // $ExpectType DragEvent<HTMLAnchorElement>
  }}
/>;

/*
 * Redirect specs
 */

<Redirect to="/" />;
<Redirect href="/" />;
<Redirect href="/" replace />;

<Redirect>something</Redirect>; // $ExpectError

/*
 * Switch specs
 */

<Switch>
  <Route path="/app/users" />
  <Route path="/app/:id" />
</Switch>;

<Switch>
  <Route path="/app/users" />
  <Route />
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

<Router base="/app">Hello World!</Router>;

/*
 * Hooks API
 */
const [location, setLocation] = useLocation();
location; // $ExpectType string

// embedded useLocation hook doesn't accept any arguments
const [] = useLocation({}); // $ExpectError

setLocation(); // $ExpectError
setLocation("/app");
setLocation("/app", { replace: true });
setLocation("/app", { unknownOption: true }); // $ExpectError

useRoute(Symbol()); // $ExpectError
useRoute(); // $ExpectError
useRoute("/");

const [match, params] = useRoute<{ id: string }>("/app/users/:id");
match; // $ExpectType boolean

if (params) {
  params.id; // $ExpectType string
  params.age; // $ExpectError
} else {
  params; // $ExpectType null
}

const [, parameters] = useRoute<{ id: string }>("/app/users/:id");

if (parameters) {
  parameters.id; // $ExpectType string
  parameters.age; // $ExpectError
} else {
  parameters; // $ExpectType null
}

/*
 * Standalone useLocation hook
 */

const [loc, navigate] = useBrowserLocation();
loc; // $ExpectType string

useBrowserLocation({ base: "/something" });
useBrowserLocation({ foo: "bar" }); // $ExpectError

/*
 * staticLocationHook
 */

const myStaticHook = staticLocationHook();
const [staticLoc, staticNavigate] = myStaticHook();
staticLoc; // $ExpectType string
staticNavigate("/something");
staticNavigate("/something", { replace: true });
staticNavigate("/something", { foo: "bar" }); // $ExpectError
myStaticHook.history; // $ExpectType readonly string[]

staticLocationHook('/');
staticLocationHook('/', { record: true });
staticLocationHook('/', { foo: "bar" }); // $ExpectError

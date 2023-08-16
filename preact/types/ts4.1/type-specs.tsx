import { FunctionComponent, h } from "preact";
import {
  Link,
  Params,
  Redirect,
  Route,
  RouteComponentProps,
  Router,
  Switch,
  useLocation,
  useParams,
  useRoute,
} from "wouter/preact";

import useBrowserLocation from "wouter/use-location";
import staticLocationHook from "wouter/static-location";
import { MouseEventHandler } from "react";

const Header: FunctionComponent = () => <div />;
const Profile = ({ params }: RouteComponentProps<{ id: string }>) => (
  <div>User id: {params.id}</div>
);

// example custom hook
type UseNetworkLocation = (options?: {
  protocol: string;
  address: string;
}) => [string, (to: string, options?: { delay: number }) => void];

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

<Route path="/header" component={Header} />;
<Route path="/profile/:id" component={Profile} />;

<Route path="/app">
  <div />
</Route>;

<Route path="/app">
  This is a <b>mixed</b> content
</Route>;

<Route path="/users/:id">
  {(params: Params): React.ReactNode => `User id: ${params.id}`}
</Route>;

<Route path="/users/:id">{({ id }) => `User id: ${id}`}</Route>;

<Route path="/users/:id">{({ age }) => `User age: ${age}`}</Route>; // $ExpectError

<Route path="/users/:id">
  {({ age }: { age: string }) => `User age: ${age}`}
</Route>;

<Route path="/app" match={true} />; // $ExpectError

// inferred rest params
<Route path="/path/:rest*">{(params) => `Rest: ${params.rest}`}</Route>;

// infer multiple params
<Route path="/path/:first/:second/another/:third">
  {({ first, second, third }) => `${first}, ${second}, ${third}`}
</Route>;

// infer only named params
<Route path="/:first/:second">
  {({ first, second }) => `first: ${first}, second: ${second}`}
</Route>;

// for pathToRegexp matcher
<Route path="/:user([a-z]i+)/profile/:tab/:first+/:second*">
  {({ user, tab, first, second }) => {
    user; // $ExpectType string
    tab; // $ExpectType string
    first; // $ExpectType string
    second; // $ExpectType string | undefined
    return `${user}, ${tab}, ${first}, ${second}`;
  }}
</Route>;

<Route path={JSON.parse('"/home"')}>
  {({ itemId }) => {
    const fn = (a: string) => `noop ${a}`;
    fn(itemId); // $ExpectError
    return <div className={itemId} />;
  }}
</Route>;

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
<Link href="/somewhere" onClick={(event: MouseEvent) => {}} children={null} />;
<Link download href="/" target="_blank" rel="noreferrer" children={null} />;

<Link
  href="/somewhere"
  children={null}
  onDrag={(event) => {
    event; // $ExpectType TargetedDragEvent<EventTarget>
  }}
/>;

/*
 * Redirect specs
 */

<Redirect to="/" />;
<Redirect href="/" />;
<Redirect href="/" replace />;
<Redirect href="/" unknownProp={1000} />; // $ExpectError

Redirect<UseNetworkLocation>({ href: "/home", delay: 1000 });
// example custom hook
type UseLocWithNoOptions = () => [
  string,
  (to: string, foo: number, bar: string) => void
];
Redirect<UseLocWithNoOptions>({ href: "/app" });

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

const useNetwork: UseNetworkLocation = (() => {}) as UseNetworkLocation;

<Router hook={useNetwork}>this is a valid router</Router>;

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

// custom hook
const [networkLoc, setNetworkLoc] = useLocation<UseNetworkLocation>();
setNetworkLoc("/home", { delay: 2000 });

const useParamsResults = useParams();
useParamsResults; // $ExpectType Record<string, string | undefined>

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

const [, inferedParams] = useRoute("/app/users/:id/:age");

if (inferedParams) {
  inferedParams.id; // $ExpectType string
  inferedParams.age; // $ExpectType string
} else {
  inferedParams; // $ExpectType null
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

staticLocationHook("/");
staticLocationHook("/", { record: true });
staticLocationHook("/", { foo: "bar" }); // $ExpectError

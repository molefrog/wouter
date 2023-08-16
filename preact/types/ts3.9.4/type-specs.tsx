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

const Header: FunctionComponent = () => <div />;
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
<Link to="/users">Users</Link>;
<Link href="/about">About</Link>;
<Link href="/about">
  This is <i>awesome!</i>
</Link>;

<Link href="/about" to="/app" children="" />; // $ExpectError
<Link children="" />; // $ExpectError

<Link href="/">
  <a className="active">Active Link</a>
</Link>;

<Link href="/foo">
  <Header />
</Link>;

// supports standard link attributes
<Link href="/somewhere" children={null} />;
<Link href="/somewhere" children={null} replace />;
<Link download href="/" target="_blank" rel="noreferrer" children={null} />;

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

setLocation(); // $ExpectError
setLocation("/app");
setLocation("/app", { replace: true });
setLocation("/app", { unknown: true }); // $ExpectError

useLocation({ base: "/app" }); // $ExpectError

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

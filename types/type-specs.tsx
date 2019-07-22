import * as React from "react";
import { Route, Params } from "wouter";

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

// FIXME: the code below throws "Object is possibly 'null'", because
// Params type contains null type.

// <Route path="/users/:id">
//   {(params: Params): React.ReactNode => `User id: ${params.id}`}
// </Route>;

// FIXME: `match` prop should not be exposed
// <Route path="/app" match={true} />; // $ExpectError

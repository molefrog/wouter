import * as React from "react";
import { Route, Params } from "wouter";

/*
 * <Route /> component type specs
 */

// Has `path` prop, should always be a string
<Route path="/app/users" />;
<Route path={Symbol()} />; // $ExpectError
<Route path={1337} />; // $ExpectError
<Route />; // $ExpectError

// Supports various ways to declare children
// <Route component={Header} />;
<Route path="/app">
  <div />
</Route>;

<Route path="/app">
  This is a <b>mixed</b> content
</Route>;

<Route path="/users/:id">
  {(params: Params): string => {
    // $ExpectType string
    return params.id;
  }}
</Route>;

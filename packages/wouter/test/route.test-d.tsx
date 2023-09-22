import { it, describe, expectTypeOf, assertType } from "vitest";
import { Route } from "wouter";
import { ComponentProps } from "react";
import * as React from "react";

describe("`path` prop", () => {
  it("is optional", () => {
    assertType(<Route />);
  });

  it("should be a string", () => {
    let a: ComponentProps<typeof Route>["path"];
    expectTypeOf(a).toMatchTypeOf<string | undefined>();
  });
});

it("accepts the optional boolean `nest` prop", () => {
  assertType(<Route nest />);
  assertType(<Route nest={false} />);

  // @ts-expect-error - should be boolean
  assertType(<Route nest={"true"} />);
});

it("renders a component provided in the `component` prop", () => {
  const Header = () => <div />;
  const Profile = () => null;

  <Route path="/header" component={Header} />;
  <Route path="/profile/:id" component={Profile} />;

  // @ts-expect-error must be a component, not JSX
  <Route path="/header" component={<a />} />;
});

it("accepts class components in the `component` prop", () => {
  class A extends React.Component<{ params: {} }> {
    render() {
      return <div />;
    }
  }

  <Route path="/app" component={A} />;
});

it("accepts children", () => {
  <Route path="/app">
    <div />
  </Route>;

  <Route path="/app">
    This is a <b>mixed</b> content
  </Route>;

  <Route>
    <>
      <div />
    </>
  </Route>;
});

it("supports functions as children", () => {
  <Route path="/users/:id">
    {(params) => {
      expectTypeOf(params).toMatchTypeOf<{}>();
      return <div />;
    }}
  </Route>;

  // @ts-expect-error function should return JSX
  <Route path="/app">{() => {}}</Route>;

  <Route path="/users/:id">{({ id }) => `User id: ${id}`}</Route>;

  <Route path="/users/:id">
    {({ age }: { age: string }) => `User age: ${age}`}
  </Route>;
});

describe("parameter inference", () => {
  it("can infer type of params from the path given", () => {
    <Route path="/path/:first/:second/another/:third">
      {({ first, second, third }) => {
        expectTypeOf(first).toEqualTypeOf<string>();
        return <div>{`${first}, ${second}, ${third}`}</div>;
      }}
    </Route>;

    <Route path="/users/:name/">
      {/* @ts-expect-error - `age` param is not present in the pattern */}
      {({ name, age }) => {
        return <div>{`Hello, ${name}`}</div>;
      }}
    </Route>;
  });

  it("extract wildcard params into `wild` property", () => {
    <Route path="/users/*/settings">
      {({ wild }) => {
        expectTypeOf(wild).toEqualTypeOf<string>();
        return <div>The path is {wild}</div>;
      }}
    </Route>;
  });

  it("allows to customize type of params via generic parameter", () => {
    <Route<{ name: string; lastName: string }> path="/users/:name/:age">
      {(params) => {
        expectTypeOf(params.lastName).toEqualTypeOf<string>();
        return <div>This really is undefined {params.lastName}</div>;
      }}
    </Route>;
  });

  it("can't infer the type when the path isn't known at compile time", () => {
    <Route path={JSON.parse('"/home/:section"')}>
      {(params) => {
        // @ts-expect-error
        params.section;
        return <div />;
      }}
    </Route>;
  });
});

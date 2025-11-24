import { test, describe, expectTypeOf } from "bun:test";
import { Route } from "../src/index.js";
import { ComponentProps } from "react";
import * as React from "react";

const assertType = <T,>(_value: T): void => {};

describe("`path` prop", () => {
  test("is optional", () => {
    assertType(<Route />);
  });

  test("should be a string or RegExp", () => {
    let a: ComponentProps<typeof Route>["path"];
    expectTypeOf(a).toMatchTypeOf<string | RegExp | undefined>();
  });
});

test("accepts the optional boolean `nest` prop", () => {
  assertType(<Route nest />);
  assertType(<Route nest={false} />);

  // @ts-expect-error - should be boolean
  assertType(<Route nest={"true"} />);
});

test("renders a component provided in the `component` prop", () => {
  const Header = () => <div />;
  const Profile = () => null;

  <Route path="/header" component={Header} />;
  <Route path="/profile/:id" component={Profile} />;

  // @ts-expect-error must be a component, not JSX
  <Route path="/header" component={<a />} />;
});

test("accepts class components in the `component` prop", () => {
  class A extends React.Component<{ params: {} }> {
    render() {
      return <div />;
    }
  }

  <Route path="/app" component={A} />;
});

test("accepts ForwardRefExoticComponent in the `component` prop", () => {
  // Simulates components wrapped with HOCs like withErrorBoundary
  const MyComponent = React.forwardRef<HTMLDivElement, { params: {} }>(
    ({ params }) => <div />
  );

  <Route path="/app" component={MyComponent} />;
});

test("accepts children", () => {
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

test("supports functions as children", () => {
  <Route path="/users/:id">
    {(params) => {
      expectTypeOf(params).toMatchTypeOf<{}>();
      return <div />;
    }}
  </Route>;

  <Route path="/users/:id">{({ id }) => `User id: ${id}`}</Route>;

  <Route path="/users/:id">
    {({ age }: { age: string }) => `User age: ${age}`}
  </Route>;

  // @ts-expect-error function should return valid JSX
  <Route path="/app">{() => {}}</Route>;

  // prettier-ignore
  // @ts-expect-error you can't use JSX together with render function
  <Route path="/">{() => <div />}<a>Link</a></Route>;
});

describe("parameter inference", () => {
  test("can infer type of params from the path given", () => {
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

  test("extract wildcard params into `wild` property", () => {
    <Route path="/users/*/settings">
      {({ wild }) => {
        expectTypeOf(wild).toEqualTypeOf<string>();
        return <div>The path is {wild}</div>;
      }}
    </Route>;
  });

  test("allows to customize type of params via generic parameter", () => {
    <Route<{ name: string; lastName: string }> path="/users/:name/:age">
      {(params) => {
        expectTypeOf(params.lastName).toEqualTypeOf<string>();
        return <div>This really is undefined {params.lastName}</div>;
      }}
    </Route>;
  });

  test("can't infer the type when the path isn't known at compile time", () => {
    <Route path={JSON.parse('"/home/:section"')}>
      {(params) => {
        // @ts-expect-error
        params.section;
        return <div />;
      }}
    </Route>;
  });
});

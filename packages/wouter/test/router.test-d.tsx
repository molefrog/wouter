import { ComponentProps } from "react";
import { it, expectTypeOf, assertType } from "vitest";
import { Router, Route, BaseLocationHook, useRouter } from "wouter";

it("should have at least one child", () => {
  // @ts-expect-error
  <Router />;
});

it("accepts valid elements as children", () => {
  const Header = ({ title }: { title: string }) => <h1>{title}</h1>;

  <Router>
    <Route path="/" />
    <b>Hello!</b>
  </Router>;

  <Router>
    Hello, we have <Header title="foo" /> and some {1337} numbers here.
  </Router>;

  <Router>
    <>Fragments!</>
  </Router>;

  <Router>
    {/* @ts-expect-error should be a valid element */}
    {() => <div />}
  </Router>;
});

it("can be customized with router properties passed as props", () => {
  // @ts-expect-error
  <Router hook="wat?" />;

  const useFakeLocation: BaseLocationHook = () => ["/foo", () => {}];
  <Router hook={useFakeLocation}>this is a valid router</Router>;

  let fn: ComponentProps<typeof Router>["hook"];
  expectTypeOf(fn).exclude<undefined>().toBeFunction();

  <Router base="/app">Hello World!</Router>;

  <Router ssrPath="/foo">SSR</Router>;

  <Router base="/users" ssrPath="/users/all" hook={useFakeLocation}>
    Custom
  </Router>;
});

it("does not accept other props", () => {
  const router = useRouter();

  // @ts-expect-error `parent` prop isn't defined
  <Router parent={router}>Parent router</Router>;
});

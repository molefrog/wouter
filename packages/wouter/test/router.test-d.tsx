import { ComponentProps } from "react";
import { test, expectTypeOf } from "bun:test";
import {
  Router,
  Route,
  BaseLocationHook,
  useRouter,
  Parser,
  Path,
} from "../src/index.js";

test("should have at least one child", () => {
  // @ts-expect-error
  <Router />;
});

test("accepts valid elements as children", () => {
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

test("can be customized with router properties passed as props", () => {
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

test("accepts `hrefs` function for transforming href strings", () => {
  const router = useRouter();
  expectTypeOf(router.hrefs).toBeFunction();

  <Router hrefs={(href: string) => href + "1"}>0</Router>;

  <Router
    hrefs={(href, router) => {
      expectTypeOf(router).toEqualTypeOf<typeof router>();
      return href + router.base;
    }}
  >
    routers as a second argument
  </Router>;
});

test("accepts `parser` function for generating regular expressions", () => {
  const parser: Parser = (path: Path, loose?: boolean) => {
    return {
      pattern: new RegExp(`^${path}${loose === true ? "(?=$|[/])" : "[/]$"}`),
      keys: [],
    };
  };

  <Router parser={parser}>this is a valid router</Router>;
});

test("does not accept other props", () => {
  const router = useRouter();

  // @ts-expect-error `parent` prop isn't defined
  <Router parent={router}>Parent router</Router>;
});

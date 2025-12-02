import { describe, expectTypeOf, test } from "bun:test";
import { Link, LinkProps, type Path } from "../src/index.js";
import * as React from "react";

type NetworkLocationHook = () => [
  Path,
  (path: string, options: { host: string; retries?: number }) => void
];

describe("<Link /> types", () => {
  test("should have required prop href", () => {
    // @ts-expect-error
    <Link>test</Link>;
    <Link href="/">test</Link>;
  });

  test("does not allow `to` and `href` props to be used at the same time", () => {
    // @ts-expect-error
    <Link to="/hello" href="/world">
      Hello
    </Link>;
  });

  test("should inherit props from `HTMLAnchorElement`", () => {
    <Link to="/hello" className="hello">
      Hello
    </Link>;

    <Link to="/hello" style={{}}>
      Hello
    </Link>;

    <Link to="/hello" target="_blank">
      Hello
    </Link>;

    <Link to="/hello" download ping="he-he">
      Hello
    </Link>;
  });

  test("can accept function as `className`", () => {
    <Link
      href="/"
      className={(isActive) => (isActive ? "active" : "non-active")}
    />;

    <Link
      href="/"
      className={(isActive) => (isActive ? "active" : undefined)}
    />;
  });

  test("should support other navigation params", () => {
    <Link href="/" state={{ a: "foo" }}>
      test
    </Link>;

    <Link href="/" replace>
      test
    </Link>;

    // @ts-expect-error
    <Link to="/" replace={{ nope: 1 }}>
      Hello
    </Link>;

    <Link href="/" state={undefined}>
      test
    </Link>;
  });

  test("should work with generic type", () => {
    <Link<NetworkLocationHook> href="/" host="wouter.com">
      test
    </Link>;

    // @ts-expect-error
    <Link<NetworkLocationHook> href="/">test</Link>;

    <Link<NetworkLocationHook> href="/" host="wouter.com" retries={4}>
      test
    </Link>;
  });
});

describe("<Link /> with ref", () => {
  test("should work", () => {
    const ref = React.useRef<HTMLAnchorElement>(null);

    <Link to="/" ref={ref}>
      Hello
    </Link>;
  });

  test("should have error when type is miss matched", () => {
    const ref = React.useRef<HTMLAreaElement>(null);

    // @ts-expect-error
    <Link to="/" ref={ref}>
      Hello
    </Link>;
  });
});

describe("<Link /> with `asChild` prop", () => {
  test("should work", () => {
    <Link to="/" asChild>
      <a>Hello</a>
    </Link>;
  });

  test("does not allow `to` and `href` props to be used at the same time", () => {
    // @ts-expect-error
    <Link to="/hello" href="/world" asChild>
      <a>Hello</a>
    </Link>;
  });

  test("can only have valid element as a child", () => {
    // @ts-expect-error strings are not valid children
    <Link to="/" asChild>
      {true ? "Hello" : "World"}
    </Link>;

    // @ts-expect-error can't use multiple nodes as children
    <Link to="/" asChild>
      <a>Link</a>
      <div>icon</div>
    </Link>;
  });

  test("does not allow other props", () => {
    // @ts-expect-error
    <Link to="/" asChild className="">
      <a>Hello</a>
    </Link>;

    // @ts-expect-error
    <Link to="/" asChild style={{}}>
      <a>Hello</a>
    </Link>;

    // @ts-expect-error
    <Link to="/" asChild unknown={10}>
      <a>Hello</a>
    </Link>;

    // @ts-expect-error
    <Link to="/" asChild ref={null}>
      <a>Hello</a>
    </Link>;
  });

  test("should support other navigation params", () => {
    <Link to="/" asChild replace>
      <a>Hello</a>
    </Link>;

    // @ts-expect-error
    <Link to="/" asChild replace={12}>
      <a>Hello</a>
    </Link>;

    <Link to="/" asChild state={{ hello: "world" }}>
      <a>Hello</a>
    </Link>;
  });

  test("should work with generic type", () => {
    <Link<NetworkLocationHook> asChild to="/" host="wouter.com">
      <div>test</div>
    </Link>;

    // @ts-expect-error
    <Link<NetworkLocationHook> asChild to="/">
      <div>test</div>
    </Link>;

    <Link<NetworkLocationHook> asChild to="/" host="wouter.com" retries={4}>
      <div>test</div>
    </Link>;
  });

  test("accepts `onClick` prop that overwrites child's handler", () => {
    <Link
      to="/"
      asChild
      onClick={(e) => {
        expectTypeOf(e).toEqualTypeOf<React.MouseEvent>();
      }}
    >
      <a>Hello</a>
    </Link>;
  });

  test("should work with `ComponentProps`", () => {
    type LinkComponentProps = React.ComponentProps<typeof Link>;

    // Because Link is a generic component, the props
    // cant't contain navigation options of the default generic
    // parameter `BrowserLocationHook`.
    // So the best we can get are the props such as `href` etc.
    expectTypeOf<LinkComponentProps>().toMatchTypeOf<LinkProps>();
  });
});

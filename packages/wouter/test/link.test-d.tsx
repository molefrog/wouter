import { describe, it } from "vitest";
import { Link } from "wouter";
import * as React from "react";

describe("<Link /> types", () => {
  it("should have required prop href", () => {
    // @ts-expect-error
    <Link>test</Link>;
    <Link href="/">test</Link>;
  });

  it("should throw error when `to` and `href` props are used in same time", () => {
    // @ts-expect-error
    <Link to="/hello" href="/world">
      Hello
    </Link>;
  });

  it("should inherit props from `HTMLAnchorElements`", () => {
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

  it("should support other navigation params", () => {
    <Link href="/" state={{ a: "foo" }}>
      test
    </Link>;

    <Link href="/" replace>
      test
    </Link>;

    <Link href="/" state={undefined}>
      test
    </Link>;
  });
});

describe("<Link /> with ref", () => {
  it("should work", () => {
    const ref = React.useRef<HTMLAnchorElement>(null);

    <Link to="/" ref={ref}>
      Hello
    </Link>;
  });

  it("should have error when type is `unknown`", () => {
    const ref = React.useRef();

    // @ts-expect-error
    <Link to="/" ref={ref}>
      Hello
    </Link>;
  });

  it("should have error when type is miss matched", () => {
    const ref = React.useRef<HTMLAreaElement>(null);

    // @ts-expect-error
    <Link to="/" ref={ref}>
      Hello
    </Link>;
  });
});

describe("<Link /> in asChild mode", () => {
  it("should work", () => {
    <Link to="/" asChild>
      <a>Hello</a>
    </Link>;
  });

  it("should throw error when `to` and `href` props are used in same time", () => {
    // @ts-expect-error
    <Link to="/hello" href="/world" asChild>
      <a>Hello</a>
    </Link>;
  });

  it("should throw error when unsupported props are provided", () => {
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

  it("should throw error when to and href props are used in same time", () => {
    // @ts-expect-error
    <Link to="/hello" href="/world" asChild>
      <a>Hello</a>
    </Link>;
  });

  it("should support other navigation params", () => {
    <Link to="/" asChild replace>
      <a>Hello</a>
    </Link>;

    <Link to="/" asChild state={{ hello: "world" }}>
      <a>Hello</a>
    </Link>;
  });
});

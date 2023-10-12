import { describe, it, assertType } from "vitest";
import { Link } from "wouter";
import * as React from "react";

describe("Link types", () => {
  it("should have required prop href", () => {
    // @ts-expect-error
    assertType(<Link>test</Link>);
    assertType(<Link href="/">test</Link>);
  });

  it("should support state prop", () => {
    assertType(
      <Link href="/" state={{ a: "foo" }}>
        test
      </Link>
    );
    assertType(
      <Link href="/" state={null}>
        test
      </Link>
    );
    assertType(
      <Link href="/" state={undefined}>
        test
      </Link>
    );
    assertType(
      <Link href="/" state="string">
        test
      </Link>
    );
  });
});

describe("Link's ref", () => {
  it("should work", () => {
    const ref = React.useRef<HTMLAnchorElement>(null);

    <Link to="/" ref={ref}>
      HELLO
    </Link>;
  });

  it("should have error when type is `unknown`", () => {
    const ref = React.useRef();

    // @ts-expect-error
    <Link to="/" ref={ref}>
      HELLO
    </Link>;
  });

  it("should have error when type is miss matched", () => {
    const ref = React.useRef<HTMLAreaElement>(null);

    // @ts-expect-error
    <Link to="/" ref={ref}>
      HELLO
    </Link>;
  });

  it("should work with composed components", () => {
    const ref = React.useRef<React.ElementRef<typeof Component>>(null);

    <Link to="/">
      <Component ref={ref}></Component>
    </Link>;
  });
});

const Component = React.forwardRef<{ hello: "world" }>((props, ref) => {
  return <>test</>;
});

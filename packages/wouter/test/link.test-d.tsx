import { describe, it, assertType } from "vitest";
import { Link } from "wouter";

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

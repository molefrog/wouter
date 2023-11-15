import { describe, it, assertType } from "vitest";
import { Redirect } from "wouter";

describe("Redirect types", () => {
  it("should have required prop href", () => {
    // @ts-expect-error
    assertType(<Redirect />);
    assertType(<Redirect href="/" />);
  });

  it("should support state prop", () => {
    assertType(<Redirect href="/" state={{ a: "foo" }} />);
    assertType(<Redirect href="/" state={null} />);
    assertType(<Redirect href="/" state={undefined} />);
    assertType(<Redirect href="/" state="string" />);
  });

  it("always renders nothing", () => {
    // can be used in JSX
    <div>
      <Redirect href="/" />
    </div>;

    assertType<null>(Redirect({ href: "/" }));
  });
});

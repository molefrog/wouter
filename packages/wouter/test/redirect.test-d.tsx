import { describe, test } from "bun:test";
import { Redirect } from "../src/index.js";

const assertType = <T,>(_value: T): void => {};

describe("Redirect types", () => {
  test("should have required prop href", () => {
    // @ts-expect-error
    assertType(<Redirect />);
    assertType(<Redirect href="/" />);
  });

  test("should support state prop", () => {
    assertType(<Redirect href="/" state={{ a: "foo" }} />);
    assertType(<Redirect href="/" state={null} />);
    assertType(<Redirect href="/" state={undefined} />);
    assertType(<Redirect href="/" state="string" />);
  });

  test("always renders nothing", () => {
    // can be used in JSX
    <div>
      <Redirect href="/" />
    </div>;

    assertType<null>(Redirect({ href: "/" }));
  });

  test("can not accept children", () => {
    // @ts-expect-error
    <Redirect href="/">hi!</Redirect>;

    // prettier-ignore
    // @ts-expect-error
    <Redirect href="/"><><div>Fragment</div></></Redirect>;
  });
});

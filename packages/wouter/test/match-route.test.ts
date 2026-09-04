import { test, expect } from "bun:test";
import { parse } from "regexparam";
import { matchRoute } from "../src/index.js";

test("keeps empty matches and only includes the base in loose mode", () => {
  expect(matchRoute(parse, /^/, "/users")).toEqual([true, {}]);
  expect<unknown>(matchRoute(parse, /^/, "/users", true)).toEqual([
    true,
    {},
    "",
  ]);
  expect(matchRoute(parse, "/users", "/other", true)).toEqual([false, null]);
});

test("named parser keys take precedence over positional captures", () => {
  const parser = () => ({ pattern: /^\/(\w+)\/(\w+)$/, keys: ["1", "0"] });
  expect(matchRoute(parser, "", "/first/second")).toEqual([
    true,
    { 0: "second", 1: "first" },
  ]);
});

test("duplicate names keep the last capture, including missing captures", () => {
  expect(matchRoute(parse, "/:id/:id?", "/first/second")).toStrictEqual([
    true,
    { 0: "first", 1: "second", id: "second" },
  ]);
  expect<unknown>(matchRoute(parse, "/:id/:id?", "/first")).toStrictEqual([
    true,
    { 0: "first", 1: undefined, id: undefined },
  ]);
});

test("regex routes bypass the parser and retain optional named captures", () => {
  const parser = () => {
    throw new Error("Regex routes should not be parsed");
  };
  expect<unknown>(
    matchRoute(parser, /^\/(?<id>\w+)(?:\/(?<tab>\w+))?/, "/first", true)
  ).toStrictEqual([
    true,
    { 0: "first", 1: undefined, id: "first", tab: undefined },
    "/first",
  ]);
});

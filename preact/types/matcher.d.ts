/*
 * Match and params
 */

import { Path } from "./use-location";

export interface DefaultParams {
  readonly [paramName: string]: string | undefined;
}

export type Params<T extends DefaultParams = DefaultParams> = T;

export type MatchWithParams<T extends DefaultParams = DefaultParams> = [
  true,
  Params<T>
];
export type NoMatch = [false, null];
export type Match<T extends DefaultParams = DefaultParams> =
  | MatchWithParams<T>
  | NoMatch;

export type MatcherFn = (pattern: Path, path: Path) => Match;

export interface PatternToRegexpResult {
  keys: Array<{ name: string | number }>;
  regexp: RegExp;
}

export default function makeMatcher(
  makeRegexpFn?: (pattern: string) => PatternToRegexpResult
): MatcherFn;

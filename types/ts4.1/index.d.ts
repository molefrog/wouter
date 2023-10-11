// Minimum TypeScript Version: 4.1

// tslint:disable:no-unnecessary-generics

import {
  AnchorHTMLAttributes,
  FunctionComponent,
  PropsWithChildren,
  ComponentType,
  ReactElement,
  ReactChild,
  ReactPortal,
} from "react";

import {
  Path,
  BaseLocationHook,
  HookReturnValue,
  HookNavigationOptions,
  LocationHook,
} from "../use-location";

import { DefaultParams, Params, Match } from "../matcher";
import { RouterObject, RouterOptions } from "../router";

// re-export some types from these modules
export {
  DefaultParams,
  Params,
  MatchWithParams,
  NoMatch,
  Match,
} from "../matcher";
export { Path, BaseLocationHook, LocationHook } from "../use-location";
export * from "../router";

// React <18 only: fixes incorrect `ReactNode` declaration that had `{}` in the union.
// This issue has been fixed in React 18 type declaration.
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/56210
type ReactNode =
  | ReactChild
  | Iterable<ReactNode>
  | ReactPortal
  | boolean
  | null
  | undefined;

export type ExtractRouteOptionalParam<PathType extends Path> =
  PathType extends `${infer Param}?`
    ? { readonly [k in Param]: string | undefined }
    : PathType extends `${infer Param}*`
    ? { readonly [k in Param]: string | undefined }
    : PathType extends `${infer Param}+`
    ? { readonly [k in Param]: string }
    : { readonly [k in PathType]: string };

export type ExtractRouteParams<PathType extends string> =
  string extends PathType
    ? DefaultParams
    : PathType extends `${infer _Start}:${infer ParamWithOptionalRegExp}/${infer Rest}`
    ? ParamWithOptionalRegExp extends `${infer Param}(${infer _RegExp})`
      ? ExtractRouteOptionalParam<Param> & ExtractRouteParams<Rest>
      : ExtractRouteOptionalParam<ParamWithOptionalRegExp> &
          ExtractRouteParams<Rest>
    : PathType extends `${infer _Start}:${infer ParamWithOptionalRegExp}`
    ? ParamWithOptionalRegExp extends `${infer Param}(${infer _RegExp})`
      ? ExtractRouteOptionalParam<Param>
      : ExtractRouteOptionalParam<ParamWithOptionalRegExp>
    : {};

/*
 * Components: <Route />
 */

export interface RouteComponentProps<T extends DefaultParams = DefaultParams> {
  params: T;
}

export interface RouteProps<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends Path = Path
> {
  children?:
    | ((
        params: T extends DefaultParams ? T : ExtractRouteParams<RoutePath>
      ) => ReactNode)
    | ReactNode;
  path?: RoutePath;
  component?: ComponentType<
    RouteComponentProps<
      T extends DefaultParams ? T : ExtractRouteParams<RoutePath>
    >
  >;
}

export function Route<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends Path = Path
>(props: RouteProps<T, RoutePath>): ReactElement | null;

/*
 * Components: <Link /> & <Redirect />
 */

export type NavigationalProps<H extends BaseLocationHook = LocationHook> = (
  | { to: Path; href?: never }
  | { href: Path; to?: never }
) &
  HookNavigationOptions<H>;

export type LinkProps<H extends BaseLocationHook = LocationHook> = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> &
  NavigationalProps<H>;

export type RedirectProps<H extends BaseLocationHook = LocationHook> =
  NavigationalProps<H> & {
    children?: never;
  };

export function Redirect<H extends BaseLocationHook = LocationHook>(
  props: PropsWithChildren<RedirectProps<H>>,
  context?: any
): ReactElement<any, any> | null;

export function Link<H extends BaseLocationHook = LocationHook>(
  props: PropsWithChildren<LinkProps<H>>,
  context?: any
): ReactElement<any, any> | null;

/*
 * Components: <Switch />
 */

export interface SwitchProps {
  location?: string;
  children: ReactNode;
}
export const Switch: FunctionComponent<SwitchProps>;

/*
 * Components: <Router />
 */

export type RouterProps = RouterOptions & {
  children: ReactNode;
};

export const Router: FunctionComponent<RouterProps>;

/*
 * Hooks
 */

export function useRouter(): RouterObject;

export function useRoute<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends Path = Path
>(
  pattern: RoutePath
): Match<T extends DefaultParams ? T : ExtractRouteParams<RoutePath>>;

export function useLocation<
  H extends BaseLocationHook = LocationHook
>(): HookReturnValue<H>;

export function useParams<T extends DefaultParams = DefaultParams>(): Params<T>;

// tslint:enable:no-unnecessary-generics

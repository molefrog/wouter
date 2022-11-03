// Minimum TypeScript Version: 4.1
// tslint:disable:no-unnecessary-generics

import { JSX, FunctionComponent, ComponentType, ComponentChildren, VNode } from "preact";

import {
  Path,
  BaseLocationHook,
  HookReturnValue,
  HookNavigationOptions,
  LocationHook,
} from "../use-location";

import { DefaultParams, Match, MatcherFn } from "../matcher";

// re-export types from these modules
export * from "../matcher";
export * from "../use-location";

export type ExtractRouteOptionalParam<PathType extends Path> = PathType extends `${infer Param}?`
  ? { readonly [k in Param]: string | undefined }
  : PathType extends `${infer Param}*`
  ? { readonly [k in Param]: string | undefined }
  : PathType extends `${infer Param}+`
  ? { readonly [k in Param]: string }
  : { readonly [k in PathType]: string };

export type ExtractRouteParams<PathType extends string> = string extends PathType
  ? DefaultParams
  : PathType extends `${infer _Start}:${infer ParamWithOptionalRegExp}/${infer Rest}`
  ? ParamWithOptionalRegExp extends `${infer Param}(${infer _RegExp})`
    ? ExtractRouteOptionalParam<Param> & ExtractRouteParams<Rest>
    : ExtractRouteOptionalParam<ParamWithOptionalRegExp> & ExtractRouteParams<Rest>
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
    | ((params: T extends DefaultParams ? T : ExtractRouteParams<RoutePath>) => ComponentChildren)
    | ComponentChildren;
  path?: RoutePath;
  component?: ComponentType<
    RouteComponentProps<T extends DefaultParams ? T : ExtractRouteParams<RoutePath>>
  >;
}

export function Route<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends Path = Path
>(props: RouteProps<T, RoutePath>): VNode<any> | null;

/*
 * Components: <Link /> & <Redirect />
 */

export type NavigationalProps<H extends BaseLocationHook = LocationHook> = (
  | { to: Path; href?: never }
  | { href: Path; to?: never }
) &
  HookNavigationOptions<H>;

export type LinkProps<H extends BaseLocationHook = LocationHook> = Omit<
  JSX.HTMLAttributes,
  "href"
> &
  NavigationalProps<H>;

export type RedirectProps<H extends BaseLocationHook = LocationHook> = NavigationalProps<H> & {
  children?: never;
};

export function Link<H extends BaseLocationHook = LocationHook>(
  props: LinkProps<H>
): VNode<any> | null;

export function Redirect<H extends BaseLocationHook = LocationHook>(
  props: RedirectProps<H>
): VNode<any> | null;

/*
 * Components: <Switch />
 */

export interface SwitchProps {
  location?: string;
  children: Array<VNode<RouteProps>>;
}
export const Switch: FunctionComponent<SwitchProps>;

/*
 * Components: <Router />
 */

export interface RouterProps {
  hook: BaseLocationHook;
  base: Path;
  matcher: MatcherFn;
}
export const Router: FunctionComponent<
  Partial<RouterProps> & {
    children: ComponentChildren;
  }
>;

/*
 * Hooks
 */
export function useRouter(): RouterProps;

export function useRoute<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends Path = Path
>(pattern: RoutePath): Match<T extends DefaultParams ? T : ExtractRouteParams<RoutePath>>;

export function useLocation<H extends BaseLocationHook = LocationHook>(): HookReturnValue<H>;

// tslint:enable:no-unnecessary-generics

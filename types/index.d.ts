// tslint:disable:no-unnecessary-generics

import {
  AnchorHTMLAttributes,
  FunctionComponent,
  PropsWithChildren,
  ComponentType,
  ReactElement,
  ReactNode,
} from "react";

import {
  Path,
  BaseLocationHook,
  HookReturnValue,
  HookNavigationOptions,
  LocationHook,
} from "./use-location";

import { DefaultParams, Params, Match, MatcherFn } from "./matcher";

// re-export types from these modules
export * from "./matcher";
export * from "./use-location";

type StripAsterisk<Str extends string> =
  Str extends `${infer Start}*` ? Start : Str;

type ExtractRouteParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${infer Start}:${infer Param}/${infer Rest}`
  ? { [k in StripAsterisk<Param> | keyof ExtractRouteParams<Rest>]: string }
  : T extends `${infer Start}:${infer Param}`
  ? { [k in StripAsterisk<Param>]: string }
  : {};

/*
 * Components: <Route />
 */

export interface RouteComponentProps<T extends DefaultParams = DefaultParams> {
  params: T;
}

export interface RouteProps<RoutePath extends Path = Path> {
  children?: ((params: ExtractRouteParams<RoutePath>) => ReactNode) | ReactNode;
  path?: RoutePath;
  component?: ComponentType<RouteComponentProps<ExtractRouteParams<RoutePath>>>;
}

export function Route<RoutePath extends Path>(
  props: RouteProps<RoutePath>,
): ReactElement | null;

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

export type RedirectProps<
  H extends BaseLocationHook = LocationHook
> = NavigationalProps<H> & {
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
  children: Array<ReactElement<RouteProps>>;
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
    children: ReactNode;
  }
>;

/*
 * Hooks
 */

export function useRouter(): RouterProps;

export function useRoute<T extends DefaultParams = DefaultParams>(
  pattern: Path
): Match<T>;

export function useLocation<
  H extends BaseLocationHook = LocationHook
>(): HookReturnValue<H>;

// tslint:enable:no-unnecessary-generics

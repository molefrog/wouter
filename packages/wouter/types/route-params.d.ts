// Mirror regexparam's segment parser rather than interpreting colons in literals.
type SegmentParams<Segment extends string> = Segment extends `*${infer Rest}`
  ? Rest extends `?${string}`
    ? { "*"?: string | undefined }
    : { "*": string }
  : Segment extends `:${infer Name}`
  ? Name extends `${infer Key}?${string}`
    ? { [Param in Key]?: string | undefined }
    : Name extends `${infer Key}.${string}`
    ? { [Param in Key]: string }
    : { [Param in Name]: string }
  : {};

// Repeated capture names are assigned in order; the last value wins.
type AddSegment<Params, Segment extends string> = Omit<
  Params,
  keyof SegmentParams<Segment>
> &
  SegmentParams<Segment>;

type ParseSegments<Path extends string, Params = {}> = Path extends ""
  ? Params
  : Path extends `${infer Segment}/${infer Rest}`
  ? Segment extends ""
    ? Params
    : ParseSegments<Rest, AddSegment<Params, Segment>>
  : AddSegment<Params, Path>;

// An empty route is the catch-all; only one leading slash is removed by the
// parser, and an empty interior segment ends parsing.
export type ExtractRouteParams<Path extends string> = Path extends unknown
  ? ParseSegments<
      Path extends "" ? "*" : Path extends `/${infer Rest}` ? Rest : Path
    > extends infer Params
    ? { [Param in keyof Params]: Params[Param] }
    : never
  : never;

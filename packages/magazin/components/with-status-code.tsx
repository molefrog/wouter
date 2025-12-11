import { useRouter } from "wouter";

export function WithStatusCode({
  code,
  children,
}: {
  code: number;
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Set status code on SSR context if available
  if (router.ssrContext) {
    router.ssrContext.statusCode = code;
  }

  return <>{children}</>;
}

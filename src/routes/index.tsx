import { createFileRoute, redirect } from "@tanstack/react-router";

// The IMT site is a pure static build in /public (index.html, about.html, ...).
// The dev/preview server serves it directly; "/" simply forwards to it.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/index.html" });
  },
  component: () => null,
});

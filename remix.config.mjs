/** @type {import('@remix-run/dev').AppConfig} */
export default {
  serverModuleFormat: "cjs",
  tailwind: true,
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
    v2_headers: true,
    v2_dev: true,
  },
  serverDependenciesToBundle: ["pretty-ms", "parse-ms"],
  watchPaths: ["./tailwind.config.ts"],
}

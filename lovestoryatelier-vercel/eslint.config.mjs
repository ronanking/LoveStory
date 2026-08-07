import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships native flat configs, so FlatCompat is neither
// needed nor compatible here — it chokes on the circular `react` setting.
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/draco/**",
      "reference/**",
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // The veil poster is a decorative, fixed-size asset positioned by CSS
      // inside an absolutely-placed stage. next/image would add wrapper markup
      // and layout behaviour that fights the art direction, for no benefit on
      // a single pre-optimised WebP. Photography, when it arrives, uses
      // next/image throughout.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;

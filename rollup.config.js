import svelte from "rollup-plugin-svelte";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";
import 'dotenv/config';

const commitHash = require("child_process")
  .execSync('git log --pretty=format:"%h" -n1')
  .toString()
  .trim();

const fallbackMode = process.env.ROLLUP_WATCH ? "development" : "production";
const mode = process.env.NODE_ENV || fallbackMode;

const vars = {
  "process.env.NODE_ENV": JSON.stringify(mode),
  "process.env.COMMIT_HASH": JSON.stringify(commitHash),
  "process.env.APP_VERSION": JSON.stringify(pkg.version),
};

const production = mode === "production";

export default {
  input: "src/main.js",
  output: {
    sourcemap: false,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    babel({
      presets: [],
      sourceMaps: false,
    }),
    replace({
      "process.browser": true,
      API_URL: JSON.stringify(process.env.API_URL),
      WIDGET_URL: JSON.stringify(process.env.WIDGET_URL),
      SOCKET_HOST: JSON.stringify(process.env.SOCKET_HOST),
      ...vars,
    }),
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file - better for performance
      css: (css) => {
        css.write("public/build/bundle.css");
      },
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    // !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        });
      }
    },
  };
}

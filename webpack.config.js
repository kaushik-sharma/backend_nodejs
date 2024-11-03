import path from "path";
import { fileURLToPath } from "url";
import TerserPlugin from "terser-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  target: "node",
  mode: "production",
  entry: "./dist/app.js",
  output: {
    filename: "app.min.cjs",
    path: path.resolve(__dirname, "bundle"),
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};

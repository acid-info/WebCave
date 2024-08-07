import typescript from 'rollup-plugin-typescript2';
import image from '@rollup/plugin-image';

export default {
    input: ["src/index.tsx"],
    output: [
        {
            dir: "dist",
            entryFileNames: "[name].js",
            format: "cjs",
            exports: "named",
        }
    ],
    plugins: [
        image(),
        typescript(),
    ]
};

import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
    globalCss: {
        body: {
            bg: "gray.50",       // colorsのトークンをそのまま指定できる
            color: "gray.800",
        },
        p: {
            color: "gray.600",
        },
    },
})

export const system = createSystem(defaultConfig, config)
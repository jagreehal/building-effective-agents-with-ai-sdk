import { StoryReporter } from "executable-stories-vitest/reporter";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.story.test.ts"],
    reporters: [
      "default",
      new StoryReporter({
        formats: ["markdown", "html"],
        outputDir: "stories",
        outputName: "ai-sdk-examples",
        markdown: {
          title: "Building Effective Agents with AI SDK - Test Stories",
          includeStatusIcons: true,
          includeErrors: true,
        },
      }),
    ],
    testTimeout: 600000, // 10 minutes for AI calls
    hookTimeout: 600000, // 10 minutes for hook setup
  },
});

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "style", // Code style (formatting, etc)
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Adding/updating tests
        "build", // Build system changes
        "ci", // CI/CD changes
        "chore", // Maintenance tasks
        "revert", // Revert changes
        "security", // Security fixes
        "deps", // Dependency updates
      ],
    ],
    "subject-max-length": [2, "always", 72],
    "subject-min-length": [2, "always", 10],
    "subject-case": [2, "always", "lower-case"],
  },
};

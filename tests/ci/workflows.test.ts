import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function readText(path: string): string {
  return readFileSync(path, "utf8");
}

describe("CI workflow automation", () => {
  test("package exposes verify:ci script", () => {
    const packageJson = JSON.parse(readText(`${ROOT}/package.json`)) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["verify:ci"]).toBe(
      "npm test && npm run typecheck && npm run build && npm run eval:multisource-merge"
    );
  });

  test("ci workflow runs verify:ci on push and pull_request", () => {
    const workflowPath = `${ROOT}/.github/workflows/ci.yml`;

    expect(existsSync(workflowPath)).toBe(true);

    const workflow = readText(workflowPath);

    expect(workflow).toContain("push:");
    expect(workflow).toContain("pull_request:");
    expect(workflow).toContain("- main");
    expect(workflow).toContain("- 'codex/**'");
    expect(workflow).toContain("cancel-in-progress: true");
    expect(workflow).toContain("node-version: '22'");
    expect(workflow).toContain("npm ci");
    expect(workflow).toContain("npm run verify:ci");
    expect(workflow).toContain("reports/multisource-merge-latest.json");
    expect(workflow).toContain("reports/multisource-merge-latest.md");
  });

  test("manual canary evaluation workflow supports target and suite selection", () => {
    const workflowPath = `${ROOT}/.github/workflows/canary-eval.yml`;

    expect(existsSync(workflowPath)).toBe(true);

    const workflow = readText(workflowPath);

    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("target:");
    expect(workflow).toContain("default: danawa-canary");
    expect(workflow).toContain("- production");
    expect(workflow).toContain("- danawa-canary");
    expect(workflow).toContain("suite:");
    expect(workflow).toContain("default: both");
    expect(workflow).toContain("- baseline");
    expect(workflow).toContain("- advanced");
    expect(workflow).toContain("- both");
    expect(workflow).toContain('baseline_script="eval:service-quality"');
    expect(workflow).toContain('advanced_script="eval:service-quality:advanced"');
    expect(workflow).toContain('npm run "$baseline_script"');
    expect(workflow).toContain('npm run "$advanced_script"');
    expect(workflow).toContain("sleep 65");
    expect(workflow).toContain("reports/*service-quality-100-latest.json");
    expect(workflow).toContain("reports/*service-quality-advanced-100-latest.md");
  });

  test("documentation explains automated CI and manual live evaluation split", () => {
    const readme = readText(`${ROOT}/README.md`);
    const operations = readText(`${ROOT}/docs/OPERATIONS.md`);

    expect(readme).toContain("verify:ci");
    expect(readme).toContain("live service-quality 평가는 수동 workflow");
    expect(readme).toContain("Danawa rollout 전에는 canary workflow");

    expect(operations).toContain("ci.yml");
    expect(operations).toContain("canary-eval.yml");
    expect(operations).toContain("artifact");
    expect(operations).toContain("100 / 0 / 0");
  });
});

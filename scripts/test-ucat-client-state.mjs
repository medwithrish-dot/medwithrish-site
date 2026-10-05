import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

function read(relativePath) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
}

test("public MedicForest pages import their lightweight clients directly", () => {
  const imports = [
    ["../app/medicforest/page.tsx", "./interviews/page"],
    ["../app/medicforest/ucat/page.tsx", "../_components/MedicForestLandingClient"],
    ["../app/medicforest/pricing/page.tsx", "./_components/MedicForestPricingClient"],
  ];

  for (const [path, expected] of imports) {
    const source = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const modules = source.statements
      .filter(ts.isImportDeclaration)
      .map((statement) => statement.moduleSpecifier.text);
    assert.ok(modules.includes(expected), `${path} must import ${expected}`);
    assert.ok(!modules.some((name) => name.includes("MedicForestClient")));
  }
});

test("Alt+C has one always-attached calculator toggle handler", () => {
  const code = read("../app/medicforest/ucat/_components/MedicForestClient.tsx");
  const source = ts.createSourceFile("client.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let toggleEffect;
  let calculatorKeyHandler;

  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(source) === "useEffect" &&
        node.arguments[0]?.getText(source).includes("handleCalculatorToggle")) {
      toggleEffect = node.arguments[0].getText(source);
    }
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === "handleCalculatorKeyDown") {
      calculatorKeyHandler = node.initializer?.getText(source);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);

  assert.ok(toggleEffect?.includes('window.addEventListener("keydown", handleCalculatorToggle)'));
  assert.ok(!toggleEffect.includes("calculatorOpen"), "the toggle must also work while closed");
  assert.ok(calculatorKeyHandler?.includes("if (event.altKey) return;"));
  assert.ok(!calculatorKeyHandler.includes("setCalculatorOpen"), "the second listener must not toggle again");
});

test("trainer time uses elapsed milliseconds even when display ticks are delayed", () => {
  const compiledModule = { exports: {} };
  new Function("module", "exports", compile(read("../app/medicforest/ucat/_lib/ucatTrainerClock.ts")))(
    compiledModule, compiledModule.exports,
  );
  const { getTrainerElapsedSeconds } = compiledModule.exports;
  assert.equal(getTrainerElapsedSeconds(1000, 1099), 0);
  assert.equal(getTrainerElapsedSeconds(1000, 1350), 0.3);
  assert.equal(getTrainerElapsedSeconds(1000, 2100), 1.1);
  assert.equal(getTrainerElapsedSeconds(1000, 910), 0);
});

for (const route of ["mocks", "mock-options"]) {
  test(`legacy diagnostic ${route} redirects once and preserves the selected mock`, async () => {
    let destination;
    const compiledModule = { exports: {} };
    const code = compile(read(`../app/medicforest/ucat/diagnostic/${route}/page.tsx`));
    new Function("require", "module", "exports", code)(
      () => ({ redirect: (href) => { destination = href; } }),
      compiledModule, compiledModule.exports,
    );

    await compiledModule.exports.default({ searchParams: Promise.resolve({ mock: ["set 1&2", "ignored"] }) });
    assert.equal(destination, "/medicforest/ucat/mocks/full?mock=set%201%262");
    await compiledModule.exports.default({ searchParams: Promise.resolve({}) });
    assert.equal(destination, "/medicforest/ucat/mocks/full");
  });
}

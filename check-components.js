// check-components.js
// Catches the "AgentLauncher is not defined" class of bug: a capitalized JSX
// component that's rendered but never defined or imported anywhere. These pass
// a syntax parse fine and only blow up at runtime, so this check closes that gap.
//
// Run with:  node check-components.js   (wired into `npm run ship`)
//
// Method: parse the bundle, collect every NAME that's declared or imported
// anywhere (functions, consts, classes, import specifiers incl. aliases), then
// collect every capitalized JSX component that's USED. Anything used but never
// declared/imported gets flagged. Member tags like <Foo.Bar> are skipped to
// avoid false positives. Built-in lowercase tags (<div>) are ignored.

import fs from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";

const BUNDLE = path.join("dist", "work-hub.bundle.jsx");

function main() {
  if (!fs.existsSync(BUNDLE)) {
    console.error(`No bundle at ${BUNDLE}. Run \`npm run bundle\` first.`);
    process.exit(1);
  }

  const code = fs.readFileSync(BUNDLE, "utf8");
  let ast;
  try {
    ast = parse(code, { sourceType: "module", plugins: ["jsx"] });
  } catch (e) {
    // The landmine checker already reports parse errors clearly; just bail.
    console.error("Component check skipped — code doesn't parse. Fix parse first.");
    process.exit(1);
  }

  const defined = new Set();
  const usedComponents = new Map(); // name -> first line seen

  // Walk the AST collecting declared/imported names and used JSX components.
  function walk(node) {
    if (!node || typeof node.type !== "string") return;

    switch (node.type) {
      case "FunctionDeclaration":
        if (node.id) defined.add(node.id.name);
        break;
      case "ClassDeclaration":
        if (node.id) defined.add(node.id.name);
        break;
      case "VariableDeclarator":
        if (node.id && node.id.type === "Identifier") defined.add(node.id.name);
        break;
      case "ImportDefaultSpecifier":
      case "ImportNamespaceSpecifier":
        if (node.local) defined.add(node.local.name);
        break;
      case "ImportSpecifier":
        // handles `Foo` and `History as HistoryIcon` (uses the local name)
        if (node.local) defined.add(node.local.name);
        break;
      case "JSXOpeningElement": {
        const n = node.name;
        // Only plain capitalized identifiers (components). Skip <Foo.Bar>,
        // skip lowercase host tags like <div>.
        if (n && n.type === "JSXIdentifier" && /^[A-Z]/.test(n.name)) {
          if (!usedComponents.has(n.name)) {
            usedComponents.set(n.name, node.loc ? node.loc.start.line : "?");
          }
        }
        break;
      }
    }

    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) child.forEach(walk);
      else if (child && typeof child.type === "string") walk(child);
    }
  }

  walk(ast);

  const missing = [...usedComponents.entries()]
    .filter(([name]) => !defined.has(name))
    .sort((a, b) => a[1] - b[1]);

  console.log(
    `Components: ${usedComponents.size} used, ${defined.size} names in scope.`
  );

  if (missing.length === 0) {
    console.log("No undefined components. PASS.");
    return;
  }

  console.error(`\nFAILED: ${missing.length} component(s) used but never defined or imported:`);
  for (const [name, line] of missing) {
    console.error(`  <${name}>  (first used around bundle line ${line})`);
  }
  console.error(
    "\nDefine the component, import it, or remove the usage. This is the " +
      "AgentLauncher class of bug — a clean parse, but a runtime crash."
  );
  process.exit(1);
}

main();

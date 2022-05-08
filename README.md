# Treeche 🌴

## What is this

**Tree* shakable **Che** cker.

check your module is tree-shakable or not, in each module and reduce bundle size!!

## Feature ✨

- typescript support
- you can check in each file
- pretty diagnostics report.


## How to use 🔧

```bash
npm install treeche -D // TBD
treeche "**/*.ts" --excludes "node_modules" "**/*.test.ts"
```

## Example 📕

```typescript
// this is not tree-shakable because have side-effect

const currentYear = new Date().getFullYear();

export function getCurrentYear() {
    return `Year ${currentYear}`
}
```

```bash
treeche "~~~"
```

log
```bash

🚨 ~/application/side_effect.ts is not tree-shakable due to the following code:

\`\`\`
const currentYear = new Date().getFullYear();
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
\`\`\`
```

if you fix this code such above

```typescript
// this is tree-shakable because this does not have side-effect

export function getCurrentYear(currentYear: string) {
    return `Year ${currentYear}`
}
```

log
```bash
Congratulation 🎉 All files are tree-shakeable ✨
```

## command 💻

|kind|name|description|example|
|:--:|:--:|:--:|:--:|
|argument|inputs|input files to check tree-shakable. you can use Node glob pattern| treeche "src/**/*.ts"|
|option|excludes|excludes files to filter from inputs. you can use Node glob pattern| treeche "src/**/*.ts" --e "node_modules"|
|option|entry point|the unique entry point to check tree-shakable. if you specify input with this, treeche will bundle so you can check tree-shakable also in node_modules| treeche --entry-point ./src/main.ts|

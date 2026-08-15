import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const includeDirs = ['server', 'src', 'electron'];
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];

const fileMap = new Map();

function getCategory(filePath) {
  if (filePath.startsWith('electron')) return 'Desktop Layer';
  if (filePath.startsWith('server/db')) return 'Database Layer';
  if (filePath.startsWith('server/connectors')) return 'Connector Layer';
  if (filePath.startsWith('server/services')) return 'Service Layer';
  if (filePath.startsWith('server/routes')) return 'API Routes';
  if (filePath.startsWith('server')) return 'Backend Core';
  if (filePath.startsWith('src/stores')) return 'Zustand Stores';
  if (filePath.startsWith('src/components')) return 'UI Components';
  if (filePath.startsWith('src/pages')) return 'Pages';
  if (filePath.startsWith('src/lib')) return 'Client Libs';
  if (filePath.startsWith('src')) return 'Frontend Core';
  return 'Other';
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', 'build', 'release', '.git'].includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      fileMap.set(relPath, {
        relativePath: relPath,
        category: getCategory(relPath),
        imports: [],
        importedBy: []
      });
    }
  }
}

// 1. Discover all source files
includeDirs.forEach(d => scanDirectory(path.join(rootDir, d)));

// 2. Parse import statements
const importRegex = /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?['"]([^'"]+)['"])|(?:require\(['"]([^'"]+)['"]\))/g;

for (const [relPath, node] of fileMap.entries()) {
  const content = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importSpecifier = match[1] || match[2];
    if (!importSpecifier) continue;

    // Filter out third-party packages (only keep relative or alias imports)
    if (importSpecifier.startsWith('.') || importSpecifier.startsWith('@/')) {
      let resolvedTarget = '';
      if (importSpecifier.startsWith('@/')) {
        resolvedTarget = path.join('src', importSpecifier.replace('@/', ''));
      } else {
        const fileDir = path.dirname(relPath);
        resolvedTarget = path.join(fileDir, importSpecifier);
      }

      // Normalize extensions
      let matchedFile = '';
      if (fileMap.has(resolvedTarget)) {
        matchedFile = resolvedTarget;
      } else {
        for (const ext of extensions) {
          if (fileMap.has(resolvedTarget + ext)) {
            matchedFile = resolvedTarget + ext;
            break;
          }
          if (fileMap.has(path.join(resolvedTarget, 'index' + ext))) {
            matchedFile = path.join(resolvedTarget, 'index' + ext);
            break;
          }
        }
      }

      // Handle .js extension mapping to .ts in typescript ESM imports
      if (!matchedFile && resolvedTarget.endsWith('.js')) {
        const base = resolvedTarget.replace(/\.js$/, '');
        if (fileMap.has(base + '.ts')) matchedFile = base + '.ts';
        if (fileMap.has(base + '.tsx')) matchedFile = base + '.tsx';
      }

      if (matchedFile) {
        if (!node.imports.includes(matchedFile)) {
          node.imports.push(matchedFile);
        }
        const targetNode = fileMap.get(matchedFile);
        if (targetNode && !targetNode.importedBy.includes(relPath)) {
          targetNode.importedBy.push(relPath);
        }
      }
    }
  }
}

// 3. Generate CODEGRAPH.md
let md = `# KobeanAI Tracker — Interactive Code Graph & Dependency Map\n\n`;
md += `> **Auto-Generated Codegraph**: This document provides an architectural map of all module connections, data flows, and dependencies across the desktop, server, database, and client layers.\n\n`;
md += `*Last Generated: ${new Date().toISOString()}*\n\n`;

md += `## 1. High-Level Architectural Flow\n\n`;
md += `\`\`\`mermaid\ngraph LR\n`;
md += `  subgraph Desktop ["🖥️ Desktop Layer"]\n    electron_main["electron/main.cjs"]\n  end\n\n`;
md += `  subgraph Server ["⚡ Backend & Database"]\n    server_index["server/index.ts"]\n    telemetry["server/services/telemetry-service.ts"]\n    skill_scanner["server/services/skill-scanner.ts"]\n    antigravity_conn["server/connectors/antigravity.ts"]\n    db_schema["server/db/schema.ts"]\n  end\n\n`;
md += `  subgraph Client ["🎨 React 19 Frontend"]\n    main_client["src/main.tsx"]\n    dashboard_store["src/stores/useDashboardStore.ts"]\n    sessions_store["src/stores/useSessionsStore.ts"]\n    skills_store["src/stores/useSkillsStore.ts"]\n    dashboard_page["src/pages/DashboardPage.tsx"]\n    sessions_page["src/pages/SessionsPage.tsx"]\n    skills_page["src/pages/SkillsPage.tsx"]\n  end\n\n`;

md += `  electron_main --> server_index\n`;
md += `  server_index --> telemetry\n`;
md += `  server_index --> skill_scanner\n`;
md += `  telemetry --> antigravity_conn\n`;
md += `  antigravity_conn --> db_schema\n`;
md += `  skill_scanner --> db_schema\n`;
md += `  server_index -.-> main_client\n`;
md += `  main_client --> dashboard_store\n`;
md += `  main_client --> sessions_store\n`;
md += `  main_client --> skills_store\n`;
md += `  dashboard_page --> dashboard_store\n`;
md += `  sessions_page --> sessions_store\n`;
md += `  skills_page --> skills_store\n`;
md += `\`\`\`\n\n`;

md += `## 2. Module Dependency Matrix\n\n`;
md += `| Module | Category | Outgoing Dependencies (Imports) | Incoming Dependencies (Imported By) |\n`;
md += `| :--- | :--- | :--- | :--- |\n`;

const sortedFiles = Array.from(fileMap.values()).sort((a, b) => a.relativePath.localeCompare(b.relativePath));

for (const file of sortedFiles) {
  const importsStr = file.imports.length > 0 
    ? file.imports.map(i => `[\`${i}\`](file://${path.join(rootDir, i)})`).join('<br>') 
    : '*None (Leaf)*';

  const importedByStr = file.importedBy.length > 0 
    ? file.importedBy.map(i => `[\`${i}\`](file://${path.join(rootDir, i)})`).join('<br>') 
    : '*None (Root/Entry)*';

  md += `| [\`${file.relativePath}\`](file://${path.join(rootDir, file.relativePath)}) | **${file.category}** | ${importsStr} | ${importedByStr} |\n`;
}

md += `\n---\n\n## 3. Impact Analysis Cheat Sheet for Refactoring\n\n`;
md += `- **Modifying \`server/db/schema.ts\`**:\n`;
md += `  - **Impacts**: All files in \`server/routes/\`, \`server/services/\`, and \`server/connectors/\`.\n`;
md += `  - **Action**: Run \`npm run build\` and check API responses in \`src/stores/\`.\n\n`;
md += `- **Modifying \`server/connectors/antigravity.ts\`**:\n`;
md += `  - **Impacts**: Telemetry parsing, token calculations, and database insertion.\n`;
md += `  - **Action**: Call \`POST /api/sessions/sync\` to test historical and real-time ingestion.\n\n`;
md += `- **Modifying \`src/stores/useSessionsStore.ts\`**:\n`;
md += `  - **Impacts**: \`src/pages/SessionsPage.tsx\`, \`src/components/sessions/SessionsTable.tsx\`.\n`;
md += `  - **Action**: Verify filtering, pagination, and token/cost formatting.\n`;

fs.writeFileSync(path.join(rootDir, 'CODEGRAPH.md'), md, 'utf8');

// Also save JSON structure for programmatic analysis
const codegraphJson = {
  generatedAt: new Date().toISOString(),
  totalFiles: fileMap.size,
  nodes: Array.from(fileMap.values())
};
fs.writeFileSync(path.join(rootDir, '.codegraph.json'), JSON.stringify(codegraphJson, null, 2), 'utf8');

console.log(`[CodeGraph] Successfully mapped ${fileMap.size} modules into CODEGRAPH.md and .codegraph.json!`);

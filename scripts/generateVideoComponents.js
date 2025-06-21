"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const markdownParser_1 = require("./markdownParser");
const componentGenerator_1 = require("./componentGenerator");
const standalonePageGenerator_1 = require("./standalonePageGenerator");
const landingPageLinkGenerator_1 = require("./landingPageLinkGenerator");
function toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
const mdPath = process.argv[2] || path_1.default.join(__dirname, '__tests__', 'fixtures', 'videos.md');
const markdown = fs_1.default.readFileSync(mdPath, 'utf-8');
const entries = (0, markdownParser_1.parseVideoMarkdown)(markdown);
for (const entry of entries) {
    // 1. Write React component and index file
    const componentDir = path_1.default.join(__dirname, '..', 'src', 'components', entry.componentName);
    if (!fs_1.default.existsSync(componentDir))
        fs_1.default.mkdirSync(componentDir, { recursive: true });
    const files = (0, componentGenerator_1.generateComponentFiles)(entry);
    for (const [filename, content] of Object.entries(files)) {
        fs_1.default.writeFileSync(path_1.default.join(componentDir, filename), content, 'utf-8');
        console.log(`Generated: ${path_1.default.join('src', 'components', entry.componentName, filename)}`);
    }
    // 2. Write standalone page
    const kebabName = toKebabCase(entry.componentName);
    const standaloneDir = path_1.default.join(__dirname, '..', 'src', 'app', 'components', 'standalone', kebabName);
    if (!fs_1.default.existsSync(standaloneDir))
        fs_1.default.mkdirSync(standaloneDir, { recursive: true });
    const pageContent = (0, standalonePageGenerator_1.generateStandalonePage)(entry);
    fs_1.default.writeFileSync(path_1.default.join(standaloneDir, 'page.tsx'), pageContent, 'utf-8');
    console.log(`Generated: ${path_1.default.join('src', 'app', 'components', 'standalone', kebabName, 'page.tsx')}`);
    // 3. Output landing page link block
    const linkBlock = (0, landingPageLinkGenerator_1.generateLandingPageLink)(entry);
    console.log('\n--- Landing Page Link Block ---\n');
    console.log(linkBlock);
    console.log('\n------------------------------\n');
}
console.log('All video components and pages generated.');

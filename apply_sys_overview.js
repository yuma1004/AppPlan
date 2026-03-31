const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.toLowerCase().endsWith('.md') && file.toLowerCase().includes('overview')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/yu-tanioka/WebApps/37_SnapRender/docs');
let targetFile = files.find(f => f.toLowerCase().includes('system overview') || f.toLowerCase().includes('systemoverview'));
if (!targetFile) {
    // maybe check diagrams dir?
    targetFile = 'c:/Users/yu-tanioka/WebApps/37_SnapRender/docs/diagrams/07_System_Overview.md';
    if (!fs.existsSync(targetFile)) {
        targetFile = '';
        for(let f of files) {
           if(fs.readFileSync(f, 'utf8').includes('System Overview')) targetFile = f;
        }
    }
}

if (!targetFile) {
  console.log("Could not find System Overview file!");
  process.exit(1);
}

const content = `# SnapRender システム概要

\`\`\`mermaid
flowchart TB
    subgraph Client [Tauri Desktop App]

        subgraph Frontend [React / Vite]
            UI[Resident UI Components - ModePanel - ExpandedPanel]
            State[State Management - useSnapRenderState]
            Logic[Service Layer - captureService - renderService]

            UI --> State
            State --> Logic
        end

        subgraph Backend [Rust / Tauri]
            TauriAPI[Tauri IPC Command Handler]
            CaptureUtil[Window Capture xcap / Image Processing image]
            HTTPClient[HTTP Client reqwest]
            EnvConfig[DotEnv / Environment]

            TauriAPI --> CaptureUtil
            TauriAPI --> HTTPClient
            TauriAPI --> EnvConfig
        end

        Logic --> TauriAPI
    end

    subgraph OS [Operating System]
        TempDir[(Temporary Directory)]
        DisplayArea{Display / Window}
        LocalStore[(LocalStorage)]

        State <--> LocalStore
        CaptureUtil --> DisplayArea
        CaptureUtil --> TempDir
    end

    subgraph External [External AI Providers]
        OpenAI[OpenAI API]
        Gemini[Gemini API]

        HTTPClient --> OpenAI
        HTTPClient --> Gemini
    end
\`\`\`
`;

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully wrote to: ' + targetFile);

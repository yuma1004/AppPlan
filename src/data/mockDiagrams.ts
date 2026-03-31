import { DiagramItem } from '../types/diagram';

export const mockDiagrams: DiagramItem[] = [
  // App 1: SEKKEIYA
  {
    id: 'diag-1-1',
    appId: 'app-1',
    title: 'System Architecture',
    type: 'architecture',
    description: 'High level system architecture diagram for SEKKEIYA',
    mermaidCode: `graph TD
    User-->|HTTP Request|UI[Frontend UI]
    UI-->|API Call|API[Backend API]
    API-->|Reads/Writes|DB[(Database)]
    API-->|Task Queue|Worker[Background Worker]
    Worker-->|Process|Storage[S3 Storage]
    `,
    updatedAt: new Date('2026-03-25T10:15:00Z').toISOString(),
  },
  {
    id: 'diag-1-2',
    appId: 'app-1',
    title: 'Data Flow',
    type: 'flow',
    description: 'Data flow for diagram creation process',
    mermaidCode: `sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as DB
    
    U->>F: Create New Diagram
    F->>B: POST /api/diagrams
    B->>D: INSERT diagram
    D-->>B: Return ID
    B-->>F: Return Diagram Location
    F-->>U: Show Editor
    `,
    updatedAt: new Date('2026-03-25T10:20:00Z').toISOString(),
  },
  {
    id: 'diag-1-3',
    appId: 'app-1',
    title: 'Entities',
    type: 'er',
    description: 'Core entities schema',
    mermaidCode: `erDiagram
    PROJECT ||--o{ DIAGRAM : contains
    PROJECT {
        string id PK
        string name
        string description
    }
    DIAGRAM {
        string id PK
        string projectId FK
        string code
    }
    `,
    updatedAt: new Date('2026-03-25T10:30:00Z').toISOString(),
  },
  
  // App 2: DDB
  {
    id: 'diag-2-1',
    appId: 'app-2',
    title: 'Search Indexing Flow',
    type: 'flow',
    description: 'How PDF documents are processed and indexed',
    mermaidCode: `flowchart LR
    PDF[PDF Upload] --> Extract[Text Extraction]
    Extract --> OCR{Need OCR?}
    OCR -- Yes --> Vision[Vision API]
    OCR -- No --> Parser[Text Parser]
    Vision --> Index
    Parser --> Index
    Index[(Search Index)]
    `,
    updatedAt: new Date('2026-03-27T15:00:00Z').toISOString(),
  },
  {
    id: 'diag-2-2',
    appId: 'app-2',
    title: 'UI Component Structure',
    type: 'ui',
    description: 'Main view component tree',
    mermaidCode: `graph TD
    AppShell --> HeaderSearch
    AppShell --> RightSidebar
    AppShell --> MainViewer
    RightSidebar --> TagFilters
    MainViewer --> PDFRenderer
    `,
    updatedAt: new Date('2026-03-27T15:10:00Z').toISOString(),
  },

  // App 3: THE SCORE
  {
    id: 'diag-3-1',
    appId: 'app-3',
    title: 'Evaluation State',
    type: 'other',
    description: 'State machine for an image evaluation session',
    mermaidCode: `stateDiagram-v2
    [*] --> Pending
    Pending --> Evaluating : Start
    Evaluating --> Evaluating : Update Score
    Evaluating --> Completed : Submit
    Completed --> [*]
    `,
    updatedAt: new Date('2026-03-26T09:30:00Z').toISOString(),
  }
];

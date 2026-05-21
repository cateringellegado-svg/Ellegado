# Handoff Protocol - Web Agency Multi-Agent System

## Standard Handoff Format
Cada agent debe usar este formato JSON al completar una tarea y hacer handoff al siguiente agent:

```json
{
  "handoff": {
    "from_agent": "<agent-id>",
    "to_agent": "<next-agent-id>",
    "phase": "<phase-name>",
    "deliverable": "<deliverable-name>",
    "status": "completed",
    "timestamp": "ISO-8601",
    "notes": "<brief-notes>",
    "artifacts": {
      "urls": ["<artifact-url-1>", "<artifact-url-2>"],
      "files": ["<file-path-1>", "<file-path-2>"]
    },
    "quality_check": {
      "self_reviewed": true,
      "criteria_met": ["<criterion-1>", "<criterion-2>"],
      "known_issues": ["<issue-1>"]
    },
    "next_steps": ["<step-1>", "<step-2>"],
    "requires_approval": true,
    "approver": "<approver-agent-id>"
  }
}
```

## Handoff Rules

### 1. Completitud
- Todos los campos obligatorios deben estar presentes
- Artifacts deben ser accesibles (URLs válidas, archivos existentes)
- Quality check debe ser completado antes del handoff

### 2. Validación
- El agent receptor valida el handoff dentro de 4 horas
- Si hay issues, el handoff es rechazado con feedback específico
- El agent original debe corregir y re-submitir

### 3. Aprobación
- Handoffs que requieren aprobación deben ser aprobados antes de continuar
- Approver tiene 12 horas para responder
- Timeout = aprobación automática con nota de riesgo

### 4. Tracking
- Todos los handoffs se registran en shared_context.decision_log
- Status tracking: pending → in-review → approved/rejected → completed
- Métricas de handoff se reportan semanalmente al PM

## Handoff Matrix

| From Agent | To Agent | Deliverable | Approval Required |
|------------|----------|-------------|-------------------|
| product-strategist | senior-ux-strategist | brief, requirements | PM |
| senior-ux-strategist | senior-ui-designer | wireframes, user-flows | UX Strategist |
| senior-ui-designer | senior-frontend-engineer | mockups, design-system | UX Strategist |
| brand-designer | senior-ui-designer | brand-guidelines, tokens | PM |
| nextjs-architect | senior-frontend-engineer | architecture, project-structure | PM |
| senior-frontend-engineer | qa-web-tester | implemented-code, tests | Next.js Architect |
| backend-architect | supabase-specialist | api-architecture, security-specs | PM |
| supabase-specialist | api-engineer | db-schema, rls-policies | Backend Architect |
| seo-strategist | technical-seo-specialist | seo-strategy, keyword-map | PM |
| technical-seo-specialist | qa-web-tester | structured-data, meta-tags | SEO Strategist |
| content-strategist | conversion-copywriter | content-plan, editorial-calendar | PM |
| conversion-copywriter | technical-seo-specialist | final-copy, meta-descriptions | Content Strategist |
| performance-engineer | qa-web-tester | performance-audit, optimizations | QA Web Tester |
| accessibility-specialist | qa-web-tester | accessibility-audit, remediation | QA Web Tester |
| qa-web-tester | devops-engineer | quality-gate-approval, test-results | PM |
| devops-engineer | vercel-deployment-specialist | ci-cd-pipeline, monitoring | PM |
| ai-automation-engineer | prompt-engineer | automation-workflows | PM |
| prompt-engineer | ai-chatbot-specialist | prompt-library, templates | PM |
| ai-chatbot-specialist | analytics-cro-specialist | chatbot-config, flows | PM |

## Rejection Process

Cuando un handoff es rechazado:

1. El agent receptor crea un rejection report con:
   - Issue específico
   - Criterio no cumplido
   - Evidencia (screenshots, logs, etc.)
   - Recomendación de corrección

2. El agent original recibe el rejection y:
   - Corrige el issue
   - Re-submitir el handoff
   - Agrega nota de corrección

3. Si el rejection se repite 3 veces:
   - Escalamiento al PM
   - PM decide: reasignar, ajustar scope, o aceptar con riesgo

## Metrics Tracked
- Handoff completion time (average)
- Rejection rate per agent
- Approval turnaround time
- Handoff quality score
- Cross-agent collaboration index

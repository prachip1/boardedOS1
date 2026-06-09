/**
 * Contract template definitions: type-specific fields and default content.
 * Used to show the right form fields and build content per template.
 */

export const CONTRACT_TYPES = {
  service_agreement: 'service_agreement',
  nda: 'nda',
  retainer: 'retainer',
  statement_of_work: 'statement_of_work',
  consulting: 'consulting',
  custom: 'custom',
  blank: 'blank', // Create from blank (AI or manual)
}

export const contractTemplates = [
  { value: CONTRACT_TYPES.service_agreement, label: 'Service Agreement', description: 'General scope of work and deliverables' },
  { value: CONTRACT_TYPES.nda, label: 'Non-Disclosure Agreement (NDA)', description: 'Confidentiality between parties' },
  { value: CONTRACT_TYPES.retainer, label: 'Retainer Agreement', description: 'Ongoing monthly or project retainer' },
  { value: CONTRACT_TYPES.statement_of_work, label: 'Statement of Work (SOW)', description: 'Project scope, timeline, and deliverables' },
  { value: CONTRACT_TYPES.consulting, label: 'Consulting Agreement', description: 'Consulting rate and engagement terms' },
  { value: CONTRACT_TYPES.custom, label: 'Custom Contract', description: 'Pre-written template you can edit' },
]

/** Which form fields to show per template (common fields like title, client are always shown) */
export const templateFields = {
  [CONTRACT_TYPES.service_agreement]: [
    { name: 'amount', label: 'Contract Amount', type: 'currency', required: false },
    { name: 'payment_terms', label: 'Payment Terms', type: 'select', options: ['Net 15', 'Net 30', 'Net 60', '50% upfront, 50% on completion', 'Milestone-based'], required: false },
    { name: 'start_date', label: 'Start Date', type: 'date', required: false },
    { name: 'end_date', label: 'End Date', type: 'date', required: false },
    { name: 'deliverables', label: 'Deliverables', type: 'textarea', placeholder: 'List key deliverables...', required: false },
    { name: 'terms', label: 'Terms & Conditions', type: 'textarea', placeholder: 'Additional terms...', required: false },
  ],
  [CONTRACT_TYPES.nda]: [
    { name: 'effective_date', label: 'Effective Date', type: 'date', required: false },
    { name: 'term_months', label: 'Confidentiality Term (months)', type: 'number', placeholder: '12', required: false },
    { name: 'confidential_scope', label: 'What is considered confidential?', type: 'textarea', placeholder: 'Describe information covered...', required: false },
    { name: 'exclusions', label: 'Exclusions (optional)', type: 'textarea', placeholder: 'Information that is not confidential...', required: false },
    { name: 'terms', label: 'Additional Terms', type: 'textarea', required: false },
  ],
  [CONTRACT_TYPES.retainer]: [
    { name: 'amount', label: 'Monthly / Retainer Amount', type: 'currency', required: false },
    { name: 'payment_terms', label: 'Payment Schedule', type: 'select', options: ['Monthly in advance', 'Monthly in arrears', 'Bi-weekly', 'Custom'], required: false },
    { name: 'scope_summary', label: 'Scope of Work', type: 'textarea', placeholder: 'What is included in the retainer...', required: false },
    { name: 'start_date', label: 'Start Date', type: 'date', required: false },
    { name: 'end_date', label: 'End Date', type: 'date', required: false },
    { name: 'terms', label: 'Terms', type: 'textarea', required: false },
  ],
  [CONTRACT_TYPES.statement_of_work]: [
    { name: 'amount', label: 'Project Amount', type: 'currency', required: false },
    { name: 'objectives', label: 'Objectives', type: 'textarea', placeholder: 'Project goals...', required: false },
    { name: 'deliverables', label: 'Deliverables', type: 'textarea', placeholder: 'List deliverables and milestones...', required: false },
    { name: 'timeline', label: 'Timeline', type: 'textarea', placeholder: 'Phases and dates...', required: false },
    { name: 'payment_terms', label: 'Payment Schedule', type: 'select', options: ['Milestone-based', 'Net 30', '50% upfront, 50% on completion', 'Custom'], required: false },
    { name: 'start_date', label: 'Start Date', type: 'date', required: false },
    { name: 'end_date', label: 'End Date', type: 'date', required: false },
    { name: 'terms', label: 'Terms', type: 'textarea', required: false },
  ],
  [CONTRACT_TYPES.consulting]: [
    { name: 'amount', label: 'Rate (hourly/daily/fixed)', type: 'currency', required: false },
    { name: 'rate_type', label: 'Rate Type', type: 'select', options: ['Hourly', 'Daily', 'Fixed project'], required: false },
    { name: 'payment_terms', label: 'Payment Terms', type: 'select', options: ['Net 15', 'Net 30', 'Weekly', 'Monthly', 'On completion'], required: false },
    { name: 'scope_summary', label: 'Scope of Engagement', type: 'textarea', required: false },
    { name: 'start_date', label: 'Start Date', type: 'date', required: false },
    { name: 'end_date', label: 'End Date', type: 'date', required: false },
    { name: 'terms', label: 'Terms', type: 'textarea', required: false },
  ],
  [CONTRACT_TYPES.custom]: [
    { name: 'terms', label: 'Contract Content', type: 'textarea', placeholder: 'Paste or write your contract text...', required: false },
  ],
  [CONTRACT_TYPES.blank]: [
    { name: 'content', label: 'Contract Content', type: 'textarea', placeholder: 'Describe what you need or paste a draft. Use "Generate with AI" to create from a short description.', required: false },
  ],
}

/** Default placeholder content per type (used when no AI/content); can be replaced by AI. */
export const defaultContentSnippets = {
  [CONTRACT_TYPES.service_agreement]: `SERVICE AGREEMENT

This Service Agreement is entered into as of {{start_date}} between the Service Provider and {{client_name}} ("Client").

1. Scope of Services
The Service Provider agrees to provide the following services:
{{deliverables}}

2. Payment
Total contract value: \${{amount}}
Payment terms: {{payment_terms}}

3. Term
Start date: {{start_date}}
End date: {{end_date}}

4. General Terms
{{terms}}`,

  [CONTRACT_TYPES.nda]: `NON-DISCLOSURE AGREEMENT

Effective Date: {{effective_date}}

Between the Disclosing Party and {{client_name}} ("Receiving Party").

1. Definition of Confidential Information
{{confidential_scope}}

2. Exclusions
{{exclusions}}

3. Term
This NDA remains in effect for {{term_months}} months from the Effective Date.

4. Other Terms
{{terms}}`,

  [CONTRACT_TYPES.retainer]: `RETAINER AGREEMENT

This Retainer Agreement is entered into as of {{start_date}} with {{client_name}} ("Client").

1. Retainer Fee
Monthly retainer: \${{amount}}
Payment: {{payment_terms}}

2. Scope
{{scope_summary}}

3. Term
From {{start_date}} to {{end_date}}.

4. Terms
{{terms}}`,

  [CONTRACT_TYPES.statement_of_work]: `STATEMENT OF WORK

Project effective {{start_date}} with {{client_name}} ("Client").

1. Objectives
{{objectives}}

2. Deliverables
{{deliverables}}

3. Timeline
{{timeline}}

4. Compensation
Project amount: \${{amount}}
Payment: {{payment_terms}}

5. Terms
{{terms}}`,

  [CONTRACT_TYPES.consulting]: `CONSULTING AGREEMENT

This Consulting Agreement is entered into as of {{start_date}} with {{client_name}} ("Client").

1. Engagement
Rate: \${{amount}} ({{rate_type}})
Payment: {{payment_terms}}

2. Scope
{{scope_summary}}

3. Term
{{start_date}} to {{end_date}}.

4. Terms
{{terms}}`,

  [CONTRACT_TYPES.custom]: `{{terms}}`,
  [CONTRACT_TYPES.blank]: ``,
}

export function getFieldsForType(type) {
  return templateFields[type] || templateFields[CONTRACT_TYPES.service_agreement]
}

export function getDefaultContent(type, formValues = {}, clientName = '') {
  let template = defaultContentSnippets[type] || defaultContentSnippets[CONTRACT_TYPES.custom]
  const vars = { client_name: clientName, ...formValues }
  Object.entries(vars).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    template = template.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value != null ? String(value) : '')
  })
  // Replace any remaining {{...}}
  template = template.replace(/\{\{\w+\}\}/g, '')
  return template.trim()
}

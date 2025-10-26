export const assignmentRules = [ 
    { 
    condition : (daysPastDue: number) => daysPastDue <=30,
    assignedTo: 'call_center_agent'
    }, 
    { 
    condition: (daysPastDue: number) => daysPastDue > 30 && daysPastDue <= 90,
    assignedTo: 'field_agent',
    }, 
    {
    condition: (daysPastDue: number) => daysPastDue > 90,
    assignedTo: 'legal_team',
    }
]
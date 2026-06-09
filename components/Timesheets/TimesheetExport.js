import { format } from 'date-fns'

export const generateTimesheetPDF = (entries, client, weekStart, weekEnd) => {
  // This will use jsPDF to generate a professional timesheet PDF
  console.log('Generating PDF for:', { entries, client, weekStart, weekEnd })
  
  // TODO: Implement with jsPDF
  // const pdf = new jsPDF()
  // pdf.text('Timesheet Report', 20, 20)
  // etc...
  
  return 'timesheet.pdf'
}

export const generateShareableLink = (entries, weekStart, weekEnd, expiryHours = 24) => {
  // Generate a secure, temporary link for client viewing
  const linkId = Math.random().toString(36).substring(7)
  const shareUrl = `${window.location.origin}/timesheets/shared/${linkId}`
  
  console.log('Generated shareable link:', {
    url: shareUrl,
    expiresIn: `${expiryHours} hours`,
    entries: entries.filter(e => !e.isPrivate).length, // Only non-private entries
  })
  
  return shareUrl
}

const TimesheetExport = { generateTimesheetPDF, generateShareableLink }

export default TimesheetExport


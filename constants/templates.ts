/** A selectable document template shown in the template gallery. */
export interface Template {
  id: string
  imageUrl: string
  initialContent?: string
  label: string
}

/** Predefined list of document templates, including a blank document. */
export const templates: Template[] = [
  {
    id: "blank",
    imageUrl: "/blank-document.svg",
    initialContent: "",
    label: "Blank Document",
  },
  {
    id: "software-proposal",
    imageUrl: "/software-proposal.svg",
    initialContent: `
      <h1>Software Development Proposal</h1>
      <h2>Project Overview</h2>
      <p>Brief description of the proposed software development project.</p>
      
      <h2>Scope of Work</h2>
      <p>Detailed breakdown of project deliverables and requirements.</p>
      
      <h2>Timeline</h2>
      <p>Project milestones and delivery schedule.</p>
      
      <h2>Budget</h2>
      <p>Cost breakdown and payment terms.</p>
    `,
    label: "Software development proposal",
  },
  {
    id: "project-proposal",
    imageUrl: "/project-proposal.svg",
    initialContent: `
      <h1>Project Proposal</h1>
      <h2>Executive Summary</h2>
      <p>Brief overview of the project proposal.</p>
      
      <h2>Project Goals</h2>
      <p>Key objectives and expected outcomes.</p>
      
      <h2>Implementation Plan</h2>
      <p>Strategy and methodology for project execution.</p>
      
      <h2>Resources Required</h2>
      <p>Team, equipment, and budget requirements.</p>
    `,
    label: "Project proposal",
  },
  {
    id: "business-letter",
    imageUrl: "/business-letter.svg",
    initialContent: `
      <h1>Business Letter</h1>
      <p>This is a business letter template.</p>
    `,
    label: "Business letter",
  },
  {
    id: "resume",
    imageUrl: "/resume.svg",
    initialContent: `
      <h1>[Your Name]</h1>
      <p>[Contact Information]</p>
      
      <h2>Professional Summary</h2>
      <p>Brief overview of your professional background and key strengths.</p>
      
      <h2>Work Experience</h2>
      <p>[Company Name] - [Position]<br>
      [Date Range]</p>
      
      <h2>Education</h2>
      <p>[Degree] - [Institution]<br>
      [Graduation Year]</p>
      
      <h2>Skills</h2>
      <p>List of relevant skills and competencies.</p>
    `,
    label: "Resume",
  },
  {
    id: "cover-letter",
    imageUrl: "/cover-letter.svg",
    initialContent: `
      <p>[Your Name]<br>
      [Your Address]<br>
      [City, State ZIP]</p>
      
      <p>[Date]</p>
      
      <p>[Recipient's Name]<br>
      [Company Name]<br>
      [Company Address]</p>
      
      <p>Dear [Recipient's Name],</p>
      
      <p>I am writing to express my interest in [position] at [company name].</p>
      
      <p>Sincerely,<br>
      [Your Name]</p>
    `,
    label: "Cover letter",
  },
  {
    id: "letter",
    imageUrl: "/letter.svg",
    initialContent: `
      <p>Subject: [Email Subject]</p>
      
      <p>Dear [Recipient],</p>
      
      <p>I hope this email finds you well.</p>
      
      <p>[Email Body]</p>
      
      <p>Best regards,<br>
      [Your Name]</p>
    `,
    label: "Letter",
  },
]

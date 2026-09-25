export interface Template {
  id: string
  imageUrl: string
  label: string
}

export const templates: Template[] = [
  {
    id: "blank",
    imageUrl: "/blank-document.svg",
    label: "Blank Document",
  },
  {
    id: "software-proposal",
    imageUrl: "/software-proposal.svg",
    label: "Software development proposal",
  },
  {
    id: "project-proposal",
    imageUrl: "/project-proposal.svg",
    label: "Project proposal",
  },
  {
    id: "business-letter",
    imageUrl: "/business-letter.svg",
    label: "Business letter",
  },
  {
    id: "resume",
    imageUrl: "/resume.svg",
    label: "Resume",
  },
  {
    id: "cover-letter",
    imageUrl: "/cover-letter.svg",
    label: "Cover letter",
  },
  {
    id: "letter",
    imageUrl: "/letter.svg",
    label: "Letter",
  },
]

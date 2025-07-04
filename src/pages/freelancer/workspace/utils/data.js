// Content data

// Dummy data for workspace overview

const overviewData = {
  project: {
    name: "Brand Identity Design",
    status: "In Progress",
    deadline: "2024-07-15",
    budget: 1200,
    spent: 450,
    milestones: [
      {
        id: 1,
        title: "Logo Concepts",
        status: "Completed",
        due: "2024-06-10",
        payoutPercent: 30,
        summary: "Initial logo concepts and sketches for the brand.",
        instructions: "Review the attached PDF and provide feedback.",
        deliverables: [
          { type: "file", name: "LogoConcepts.pdf", url: "/files/LogoConcepts.pdf", submittedAt: "2024-06-08 10:00" }
        ],
        comments: [
          { id: 1, author: "Alice", text: "Uploaded logo concepts.", time: "2024-06-08 10:05" },
          { id: 2, author: "Bob", text: "Looks good! Please proceed.", time: "2024-06-08 12:00" }
        ],
        payout: {
          percent: 30,
          status: "released",
          autoPay: false
        },
        history: [
          { action: "Submitted", by: "Alice", time: "2024-06-08 10:00" },
          { action: "Approved", by: "Bob", time: "2024-06-09 09:00" }
        ]
      },
      {
        id: 2,
        title: "Brand Guidelines",
        status: "Submitted",
        due: "2024-06-20",
        payoutPercent: 40,
        summary: "Creation of comprehensive brand guidelines including color, typography, and usage.",
        instructions: "Please review the attached PDF and Figma link.",
        deliverables: [
          { type: "file", name: "BrandGuidelines.pdf", url: "/files/BrandGuidelines.pdf", submittedAt: "2024-06-18 14:00" },
          { type: "link", name: "Figma Board", url: "https://figma.com/xyz", submittedAt: "2024-06-18 14:00" }
        ],
        comments: [
          { id: 1, author: "Alice", text: "Initial submission done.", time: "2024-06-18 14:05" },
          { id: 2, author: "Bob", text: "Please clarify the color palette.", time: "2024-06-18 15:00" }
        ],
        payout: {
          percent: 40,
          status: "held",
          autoPay: true
        },
        history: [
          { action: "Submitted", by: "Alice", time: "2024-06-18 14:00" },
          { action: "Comment", by: "Bob", time: "2024-06-18 15:00", details: "Please clarify the color palette." }
        ]
      },
      {
        id: 3,
        title: "Final Delivery",
        status: "Pending",
        due: "2024-07-15",
        payoutPercent: 30,
        summary: "Final delivery of all brand assets and documentation.",
        instructions: "Upload all final files and ensure all feedback is addressed.",
        deliverables: [],
        comments: [],
        payout: {
          percent: 30,
          status: "held",
          autoPay: false
        },
        history: []
      }
    ]
  },
  team: [
    { id: 1, name: "Alice", role: "Designer", avatar: "", online: true },
    { id: 2, name: "Bob", role: "Project Manager", avatar: "", online: false }
  ],
  recentMessages: [
    { id: 1, sender: "Alice", text: "Uploaded the first logo concepts.", time: "2h ago" },
    { id: 2, sender: "Bob", text: "Great work! Please proceed with guidelines.", time: "1h ago" }
  ],
  files: [
    { id: 1, name: "LogoConcepts.pdf", uploadedBy: "Alice", date: "2024-06-10" },
    { id: 2, name: "BrandColors.png", uploadedBy: "Alice", date: "2024-06-11" }
  ],
  payments: {
    summary: {
      totalValue: 60000,
      paidUpfront: 30000,
      releasedToFreelancer: 12000,
      remainingLocked: 18000,
      pendingMilestones: 2,
      supportQALocked: 6000,
      currentDisputes: 0,
      autopayEnabled: true,
      autopayDays: 3
    },
    milestonePayments: [
      {
        id: 1,
        title: "Requirement Review",
        value: 0,
        status: "Done",
        date: "2024-06-15",
        action: null
      },
      {
        id: 2,
        title: "Design Preview",
        value: 12000,
        status: "Released",
        date: "2024-06-27",
        action: "Released"
      },
      {
        id: 3,
        title: "Final Delivery",
        value: 30000,
        status: "Locked",
        date: "2024-07-01",
        action: "Will release on approval"
      },
      {
        id: 4,
        title: "QA & Feedback Closure",
        value: 6000,
        status: "Locked",
        date: "2024-07-15",
        action: "Pending final QA approval"
      }
    ],
    dispute: null, // or include dispute details if exists
    transactions: [
      {
        date: "2024-06-20",
        action: "Upfront Payment (Client)",
        amount: 30000,
        status: "Paid"
      },
      {
        date: "2024-06-27",
        action: "Design Milestone Approved",
        amount: 12000,
        status: "Released"
      },
      {
        date: "2024-07-01",
        action: "Expected Final Delivery Payout",
        amount: 30000,
        status: "Locked"
      }
    ]
  }
};

export default overviewData;
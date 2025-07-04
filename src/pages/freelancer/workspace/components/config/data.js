// Right Panel Data contains advanced messaging features, notifications, and quick access to important project information.

export const chatData = {
  currentUser: {
    id: 1,
    name: "John Doe",
    avatar: null,
    role: "Client"
  },
  messages: [
    {
      id: 1,
      type: "text",
      userId: 2,
      userName: "Alice Cooper",
      userRole: "Designer",
      content: "I've uploaded the latest design mockups for review. Please check #Milestone2.",
      timestamp: "2024-03-10T10:30:00"
    },
    {
      id: 2,
      type: "milestone",
      userId: 1,
      userName: "John Doe",
      userRole: "Client",
      milestone: {
        id: 2,
        title: "Brand Guidelines",
        status: "Submitted",
        due: "2024-06-20"
      },
      timestamp: "2024-03-10T10:32:00"
    },
    {
      id: 3,
      type: "revision",
      userId: 2,
      userName: "Alice Cooper",
      userRole: "Designer",
      revision: {
        id: 1,
        title: "Color Palette Revision",
        status: "Requested",
        details: "Client requested a lighter blue for the header."
      },
      timestamp: "2024-03-10T10:35:00"
    },
    {
      id: 4,
      type: "meeting",
      userId: 1,
      userName: "John Doe",
      userRole: "Client",
      meeting: {
        id: 1,
        title: "Design Review Call",
        time: "2024-03-11T15:00:00",
        link: "https://meet.example.com/xyz"
      },
      timestamp: "2024-03-10T10:40:00"
    },
    {
      id: 5,
      type: "reminder",
      userId: 1,
      userName: "John Doe",
      userRole: "Client",
      reminder: {
        id: 1,
        text: "Review the final logo concepts before tomorrow.",
        due: "2024-03-11T09:00:00"
      },
      timestamp: "2024-03-10T10:45:00"
    }
  ],
  participants: [
    {
      id: 1,
      name: "John Doe",
      role: "Client",
      avatar: null,
      status: "online"
    },
    {
      id: 2,
      name: "Alice Cooper",
      role: "Designer",
      avatar: null,
      status: "online"
    },
    {
      id: 3,
      name: "Bob Wilson",
      role: "Project Manager",
      avatar: null,
      status: "offline"
    }
  ]
};


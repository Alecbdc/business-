export const courses = [
  {
    id: "course-foundations",
    title: "Crypto Foundations",
    description: "Master Bitcoin, Ethereum and the macro trends behind blockchain networks.",
    level: "Beginner",
    badge: "Start here",
    lessons: [
      {
        id: "lesson-intro-crypto",
        title: "Why Bitcoin matters",
        duration: "08:32",
        videoUrl: "https://www.youtube.com/embed/SSo_EIwHSd4",
        summary: "Learn the origins of Bitcoin and the properties that make it digital gold.",
        quiz: [
          {
            id: "q1",
            prompt: "What solves the double-spend problem in Bitcoin?",
            options: [
              "A centralized clearing house",
              "Proof-of-work consensus",
              "Unlimited issuance",
              "Lightning Network"
            ],
            answer: 1
          },
          {
            id: "q2",
            prompt: "How many BTC will ever exist?",
            options: ["21 million", "100 million", "Infinite", "Unknown"],
            answer: 0
          }
        ]
      },
      {
        id: "lesson-eth-smart-contracts",
        title: "Smart contracts on Ethereum",
        duration: "12:15",
        videoUrl: "https://www.youtube.com/embed/IpjQ22Co3oA",
        summary: "Understand how Ethereum enables programmable money and what gas fees represent.",
        quiz: [
          {
            id: "q3",
            prompt: "Which language is native to the Ethereum Virtual Machine?",
            options: ["Rust", "Solidity", "Python", "Go"],
            answer: 1
          },
          {
            id: "q4",
            prompt: "Gas fees exist to...",
            options: [
              "Reward miners/validators",
              "Limit spam on the network",
              "Pay for computation",
              "All of the above"
            ],
            answer: 3
          }
        ]
      }
    ]
  },
  {
    id: "course-trading",
    title: "Trading Sandbox",
    description: "Put your knowledge to work with a safe environment that tracks your moves.",
    level: "Intermediate",
    badge: "Hands-on",
    lessons: [
      {
        id: "lesson-risk",
        title: "Position sizing and risk",
        duration: "09:10",
        videoUrl: "https://www.youtube.com/embed/nz6yFTyZF_k",
        summary: "Risk frameworks to keep your portfolio alive during volatility.",
        quiz: [
          {
            id: "q5",
            prompt: "A common max risk per trade for swing traders is...",
            options: ["1-2% of account", "10% of account", "25% of account", "50% of account"],
            answer: 0
          },
          {
            id: "q6",
            prompt: "Stop losses are designed to...",
            options: ["Increase leverage", "Limit downside", "Maximize upside", "Pay taxes"],
            answer: 1
          }
        ]
      }
    ]
  }
];

export const defaultSandboxState = {
  balance: 10000,
  holdings: {
    BTC: 0,
    ETH: 0
  },
  history: []
};

export const initialPrices = {
  BTC: 61000,
  ETH: 3200
};

export const initialPrices = {
  BTC: 62450,
  ETH: 3280,
  USDT: 1,
  XRP: 0.58,
  BNB: 515,
  SOL: 148,
  USDC: 1,
  TRX: 0.12,
  DOGE: 0.18,
  ADA: 0.46,
  WBTC: 62210,
  LINK: 14.2,
  BCH: 428,
  USDS: 1,
  ZEC: 23,
  XLM: 0.12,
  USDE: 1,
  LTC: 89,
  XMR: 156,
  HBAR: 0.09,
  AVAX: 29,
  SUI: 1.39,
  SHIB: 0.000025,
  TON: 7.2,
  DOT: 6.5,
  DAI: 1,
  UNI: 6.3,
  CRO: 0.11,
  M: 0.35,
  WLFI: 0.92,
  MNT: 1.08,
  PYUSD: 1,
  NEAR: 5.2,
  ICP: 10.3,
  TAO: 432,
  USD1: 1,
  AAVE: 96,
  ETC: 25.8,
  PEPE: 0.0000021,
  APT: 9.3,
  ASTER: 0.07,
  ENA: 0.91,
  XAUT: 2402,
  PUMP: 0.012,
  JITOSOL: 156,
  ONDO: 1.21,
  POL: 0.52,
  WLD: 2.9,
  FIL: 4.8,
  TRUMP: 5.3,
  ALGO: 0.19,
  PAXG: 2405,
  ATOM: 9.7,
  ARB: 0.95,
  QNT: 98,
  KAS: 0.17,
  SKY: 5.8,
  USDG: 1,
  RENDER: 7.4,
  FLR: 0.024
};

export const defaultSandboxState = {
  balance: 10000,
  holdings: Object.fromEntries(Object.keys(initialPrices).map((symbol) => [symbol, 0])),
  history: []
};

export const courses = [
  {
    id: 'course-foundations',
    title: 'Crypto Foundations',
    description: 'Build a rock-solid base with monetary history, Bitcoin, and wallets.',
    level: 'Beginner',
    badge: 'Level 1',
    lessons: [
      {
        id: 'lesson-intro-crypto',
        title: 'Why Bitcoin matters',
        duration: '08:32',
        videoUrl: 'https://www.youtube.com/embed/SSo_EIwHSd4',
        summary: 'Origins of Bitcoin, the cypherpunk movement, and the ethos of digital scarcity.'
      },
      {
        id: 'lesson-history-money',
        title: 'History of money',
        duration: '07:21',
        videoUrl: 'https://www.youtube.com/embed/Bhe61JaNFLU',
        summary: 'From shells to paper to blockchains—understand how trust layers evolved.'
      },
      {
        id: 'lesson-bitcoin-halving',
        title: 'Bitcoin halving cycles',
        duration: '09:04',
        videoUrl: 'https://www.youtube.com/embed/Zbm772vF-8E',
        summary: 'Supply schedules, halvings, and the feedback loop with miner incentives.'
      },
      {
        id: 'lesson-wallet-security',
        title: 'Wallets & custody',
        duration: '10:44',
        videoUrl: 'https://www.youtube.com/embed/1YyAzVmP9xQ',
        summary: 'Hot vs. cold wallets, seed phrases, and best practices to protect keys.'
      },
      {
        id: 'lesson-mining',
        title: 'Mining & network security',
        duration: '11:32',
        videoUrl: 'https://www.youtube.com/embed/0UBK4NsH8oA',
        summary: 'How proof-of-work miners secure the network and why energy use matters.'
      }
    ]
  },
  {
    id: 'course-defi',
    title: 'Ethereum & DeFi',
    description: 'Explore programmable money, layer-2s, and decentralized finance.',
    level: 'Intermediate',
    badge: 'Level 2',
    lessons: [
      {
        id: 'lesson-ethereum-smart-contracts',
        title: 'Smart contracts explained',
        duration: '12:15',
        videoUrl: 'https://www.youtube.com/embed/IpjQ22Co3oA',
        summary: 'Understand how the EVM executes Solidity code and why gas fees exist.'
      },
      {
        id: 'lesson-layer2',
        title: 'Layer-2 rollups',
        duration: '08:10',
        videoUrl: 'https://www.youtube.com/embed/sDNN0uH2Z3o',
        summary: 'Optimistic vs. zk-rollups and how they inherit Ethereum security.'
      },
      {
        id: 'lesson-defi-dex',
        title: 'Automated market makers',
        duration: '09:33',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        summary: 'Constant-product formulas, liquidity pools, and impermanent loss decoded.'
      },
      {
        id: 'lesson-stablecoins',
        title: 'Stablecoins & on-chain dollars',
        duration: '07:48',
        videoUrl: 'https://www.youtube.com/embed/mgX2_jQXMj4',
        summary: 'USDC vs. DAI vs. algorithmic models plus the risks of depegs.'
      },
      {
        id: 'lesson-yield-farming',
        title: 'Yield farming tactics',
        duration: '11:20',
        videoUrl: 'https://www.youtube.com/embed/RplnSVTzvnU',
        summary: 'Learn vaults, liquidity incentives, and how to evaluate sustainable APY.'
      }
    ]
  },
  {
    id: 'course-trading',
    title: 'Trading & Research Lab',
    description: 'Apply technical analysis, risk management, and on-chain tools.',
    level: 'Advanced',
    badge: 'Level 3',
    lessons: [
      {
        id: 'lesson-technical-analysis',
        title: 'Charting foundations',
        duration: '09:12',
        videoUrl: 'https://www.youtube.com/embed/Xn7KWR9EOGQ',
        summary: 'Trend, momentum, and volatility indicators for spotting setups.'
      },
      {
        id: 'lesson-risk',
        title: 'Position sizing & risk',
        duration: '09:10',
        videoUrl: 'https://www.youtube.com/embed/nz6yFTyZF_k',
        summary: 'Risk frameworks to keep your portfolio alive during volatility.'
      },
      {
        id: 'lesson-trading-plan',
        title: 'Building a trading plan',
        duration: '08:58',
        videoUrl: 'https://www.youtube.com/embed/2uONu2GXG5o',
        summary: 'Define entry, exit, journaling, and rules that remove emotion.'
      },
      {
        id: 'lesson-onchain-data',
        title: 'On-chain analytics',
        duration: '10:05',
        videoUrl: 'https://www.youtube.com/embed/8uF4QkuJQnc',
        summary: 'Track whale flows, exchange reserves, and network usage trends.'
      },
      {
        id: 'lesson-psychology',
        title: 'Trader psychology',
        duration: '09:44',
        videoUrl: 'https://www.youtube.com/embed/z3U0udLH974',
        summary: 'Create rituals that protect focus, patience, and discipline.'
      }
    ]
  }
];

export const sandboxBulletins = [
  {
    id: 'macro-inflation',
    title: 'Eurozone CPI surprise cools liquidity fears',
    summary:
      'Headline inflation prints 20 bps below consensus. Desk chatter expects calmer rate projections that could buoy BTC and ETH.',
    sentiment: 'bullish',
    assets: ['BTC', 'ETH', 'WBTC'],
    impact: 'Macro easing may expand risk appetite for majors.'
  },
  {
    id: 'layer2-fees',
    title: 'Layer-2 gas rebates spike on weekend volume',
    summary:
      'Optimistic and zk rollups both slash fees for 48 hours; on-chain DEX flows jump. Watch DeFi beta and ETH correlation.',
    sentiment: 'bullish',
    assets: ['ETH', 'ARB', 'MNT', 'POL'],
    impact: 'Scaling catalysts tend to lift ETH beta trades.'
  },
  {
    id: 'stablecoin-flow',
    title: 'Stablecoin inflows hit multi-month high',
    summary:
      'USDT, USDC, and PYUSD issuance expand on exchanges, hinting at fresh sidelined liquidity waiting to deploy.',
    sentiment: 'bullish',
    assets: ['USDT', 'USDC', 'DAI', 'PYUSD', 'USDS', 'USD1'],
    impact: 'Rising stable balances often precede market rotations.'
  },
  {
    id: 'layer1-outage',
    title: 'Minor outage on emerging L1 resolved after patch',
    summary:
      'SUI validators briefly halt blocks; chain restarts within 30 minutes with new client release. Users watching reliability.',
    sentiment: 'bearish',
    assets: ['SUI', 'AVAX', 'NEAR'],
    impact: 'Infra hiccups can pressure riskier L1 valuations.'
  },
  {
    id: 'etf-flows',
    title: 'Spot BTC ETF logs third straight day of inflows',
    summary:
      'Legacy funds continue to add WBTC backing; on-chain wraps mirror demand. Vol desks note rising call skew.',
    sentiment: 'bullish',
    assets: ['BTC', 'WBTC'],
    impact: 'Institutional demand may firm support zones.'
  },
  {
    id: 'reg-hearing',
    title: 'Senate hearing floats stricter privacy coin oversight',
    summary:
      'Draft language singles out XMR and ZEC mixers; compliance desks anticipate liquidity fragmentation.',
    sentiment: 'bearish',
    assets: ['XMR', 'ZEC'],
    impact: 'Policy headwinds could widen spreads and damp volume.'
  },
  {
    id: 'defi-hack',
    title: 'Mid-size DeFi lending pool pauses after oracle drift',
    summary:
      'Protocol halts deposits while patching price feed; insurers flag temporary capital flight into majors and stables.',
    sentiment: 'cautious',
    assets: ['AAVE', 'ETH', 'DAI'],
    impact: 'Short-term volatility expected across DeFi blue chips.'
  },
  {
    id: 'meme-season',
    title: 'Meme coin rotation accelerates on social buzz',
    summary:
      'PEPE, PUMP, and M light up crypto Twitter; funding rates widen as speculators chase momentum.',
    sentiment: 'speculative',
    assets: ['PEPE', 'PUMP', 'M'],
    impact: 'High beta could spill into alt baskets if mania holds.'
  },
  {
    id: 'ai-partnership',
    title: 'AI lab announces compute deal with decentralized storage network',
    summary:
      'Partnership pilots GPU leasing and data attestation on-chain; storage tokens bid on efficiency gains.',
    sentiment: 'bullish',
    assets: ['FIL', 'ICP', 'TAO'],
    impact: 'Narrative lift for AI-aligned infra assets.'
  },
  {
    id: 'payments-push',
    title: 'Fintech giant expands stable settlement pilot',
    summary:
      'Retail app rolls PYUSD and USDC to three new markets; analysts eye volume growth versus card rails.',
    sentiment: 'bullish',
    assets: ['PYUSD', 'USDC', 'USDT'],
    impact: 'Payments traction can tighten stablecoin spreads.'
  },
  {
    id: 'miner-revenue',
    title: 'Hashrate climbs while miner revenues soften',
    summary:
      'Higher difficulty squeezes margins; some miners hedge by selling forward. Could add near-term BTC supply.',
    sentiment: 'cautious',
    assets: ['BTC', 'WBTC'],
    impact: 'Extra sell pressure may weigh on spot bids.'
  },
  {
    id: 'governance-upgrade',
    title: 'DAO schedules vote on fee switch activation',
    summary:
      'Uniswap-style governance debates routing a slice of fees to stakers; liquidity providers price in incentives.',
    sentiment: 'bullish',
    assets: ['UNI', 'CRO'],
    impact: 'Protocol revenue could re-rate governance tokens.'
  },
  {
    id: 'airdrop-rumor',
    title: 'L2 points program hints at surprise airdrop window',
    summary:
      'Validator code references “epoch bonus” triggering speculation. On-chain activity spikes as users farm eligibility.',
    sentiment: 'speculative',
    assets: ['ARB', 'POL', 'MNT'],
    impact: 'Engagement surges but may unwind after snapshot.'
  },
  {
    id: 'governance-spat',
    title: 'Validator spat over treasury spend hits social channels',
    summary:
      'Community split on diverting funds to marketing. Short-term governance uncertainty weighs on sentiment.',
    sentiment: 'bearish',
    assets: ['ATOM', 'NEAR', 'QNT'],
    impact: 'Choppy price action likely until clarity returns.'
  },
  {
    id: 'energy-prices',
    title: 'Energy futures dip, easing miner cost pressure',
    summary:
      'Natural gas contracts slide 4%; proof-of-work miners eye better margins, potentially slowing sell flows.',
    sentiment: 'bullish',
    assets: ['BTC', 'WBTC', 'LTC', 'ETC'],
    impact: 'Lower opex can reduce forced selling risk.'
  }
];

export const quizTopics = [
  {
    id: 'topic-bitcoin',
    title: 'Bitcoin & Sound Money',
    summary: 'Proof-of-work, halvings, and the custody playbook.',
    relatedLessons: ['lesson-intro-crypto', 'lesson-history-money', 'lesson-bitcoin-halving', 'lesson-wallet-security'],
    questions: [
      {
        id: 'btc-q1',
        prompt: 'Which mechanism enforces Bitcoin\'s fixed supply?',
        options: ['Dynamic central bank policy', 'Proof-of-work consensus', 'Staking rewards', 'Fiat reserves'],
        answer: 1
      },
      {
        id: 'btc-q2',
        prompt: 'How often does the Bitcoin block subsidy halve?',
        options: ['Every year', 'Roughly every 4 years', 'Only once', 'When miners vote for it'],
        answer: 1
      },
      {
        id: 'btc-q3',
        prompt: 'Cold storage refers to...',
        options: ['Keeping coins on an exchange', 'Offline key management', 'Borrowing BTC', 'Running a lightning node'],
        answer: 1
      },
      {
        id: 'btc-q4',
        prompt: 'Miner revenue is a combination of block rewards and _____.',
        options: ['Advertising fees', 'Transaction fees', 'Equity grants', 'Bond yields'],
        answer: 1
      },
      {
        id: 'btc-q5',
        prompt: 'The halving tends to influence price because...',
        options: ['It increases supply', 'It doubles inflation', 'It reduces new issuance', 'It pauses transactions'],
        answer: 2
      }
    ]
  },
  {
    id: 'topic-ethereum',
    title: 'Ethereum & Smart Contracts',
    summary: 'EVM design, gas, and scaling upgrades.',
    relatedLessons: ['lesson-ethereum-smart-contracts', 'lesson-layer2', 'lesson-defi-dex'],
    questions: [
      {
        id: 'eth-q1',
        prompt: 'Solidity code is executed by the _____.',
        options: ['Bitcoin Core client', 'Ethereum Virtual Machine', 'Internet Computer', 'Layer-2 sequencer only'],
        answer: 1
      },
      {
        id: 'eth-q2',
        prompt: 'Gas fees exist primarily to...',
        options: ['Reward miners/validators', 'Limit spam transactions', 'Pay for computation', 'All of the above'],
        answer: 3
      },
      {
        id: 'eth-q3',
        prompt: 'Optimistic rollups assume validity and rely on...',
        options: ['Instant withdrawals', 'Fraud proofs and challenge periods', 'Proof-of-work', 'Centralized sequencers only'],
        answer: 1
      },
      {
        id: 'eth-q4',
        prompt: 'An automated market maker prices assets using...',
        options: ['Order books', 'Constant product formulas', 'Time-weighted averages', 'Stable swap oracles only'],
        answer: 1
      },
      {
        id: 'eth-q5',
        prompt: 'Impermanent loss is best described as...',
        options: ['A tax penalty', 'The divergence between holding and LPing', 'Wallet hacking', 'Lost seed phrases'],
        answer: 1
      }
    ]
  },
  {
    id: 'topic-defi',
    title: 'DeFi, Stablecoins & Yield',
    summary: 'Peg mechanics, stablecoin risk, and farming playbooks.',
    relatedLessons: ['lesson-stablecoins', 'lesson-yield-farming'],
    questions: [
      {
        id: 'defi-q1',
        prompt: 'Collateralized stablecoins like DAI maintain their peg by...',
        options: ['Printing unlimited tokens', 'Over-collateralization and liquidations', 'Government insurance', 'Central bank swaps'],
        answer: 1
      },
      {
        id: 'defi-q2',
        prompt: 'APY that dramatically exceeds organic yields is often a sign of...',
        options: ['Protocol risk or inflationary incentives', 'Perfectly safe returns', 'Proof-of-work security', 'KYC requirements'],
        answer: 0
      },
      {
        id: 'defi-q3',
        prompt: 'Liquidity providers earn fees proportional to...',
        options: ['Their time zone', 'The size of their position in the pool', 'Validator uptime', 'Fiat interest rates'],
        answer: 1
      },
      {
        id: 'defi-q4',
        prompt: 'Algorithmic stablecoins primarily depend on...',
        options: ['Treasury bonds', 'Smart-contract incentives and reflexivity', 'Gold reserves', 'Federal oversight'],
        answer: 1
      },
      {
        id: 'defi-q5',
        prompt: 'Yield farming best practices always include...',
        options: ['Re-hypothecation', 'Position sizing and exit plans', 'Central bank approvals', 'SMS alerts only'],
        answer: 1
      }
    ]
  },
  {
    id: 'topic-trading',
    title: 'Trading Psychology & Risk',
    summary: 'Position sizing, journaling, and mindset.',
    relatedLessons: ['lesson-technical-analysis', 'lesson-risk', 'lesson-trading-plan', 'lesson-psychology'],
    questions: [
      {
        id: 'trade-q1',
        prompt: 'A common risk cap per trade for swing traders is...',
        options: ['1-2% of capital', '10% of capital', '50% of capital', 'There is no cap'],
        answer: 0
      },
      {
        id: 'trade-q2',
        prompt: 'A written trading plan should define...',
        options: ['Entry/exit triggers', 'Position sizing rules', 'Review cadence', 'All of the above'],
        answer: 3
      },
      {
        id: 'trade-q3',
        prompt: 'Journaling each trade helps traders...',
        options: ['Recreate hacks', 'Identify behavioral leaks', 'Pay fewer fees', 'Skip taxes'],
        answer: 1
      },
      {
        id: 'trade-q4',
        prompt: 'Emotional trading is reduced by...',
        options: ['Random leverage', 'Pre-defined stop losses', 'Ignoring data', 'Copying strangers'],
        answer: 1
      },
      {
        id: 'trade-q5',
        prompt: 'Volatility should influence...',
        options: ['Position size and conviction', 'Wallet seed phrases', 'Gas limit', 'Monitor brightness'],
        answer: 0
      }
    ]
  }
];

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
  },
  {
    id: 'course-market-interpretation',
    title: 'Market Prediction & Interpretation',
    description: 'Decode news, catalysts, and sentiment so you can anticipate price reactions.',
    level: 'Advanced',
    badge: 'Level 4',
    lessons: [
      {
        id: 'lesson-news-mapping',
        title: 'Reading macro & policy news',
        duration: '08:18',
        videoUrl: 'https://www.youtube.com/embed/YIbYtvf_q6c',
        summary: 'Map macro surprises, tariffs, and elections to the crypto risk curve.'
      },
      {
        id: 'lesson-sentiment-signals',
        title: 'Sentiment, narratives, and reflexivity',
        duration: '09:02',
        videoUrl: 'https://www.youtube.com/embed/NSoX2D1XG1A',
        summary: 'Gauge momentum using funding, social buzz, and liquidity shifts.'
      },
      {
        id: 'lesson-playbook-builder',
        title: 'Building a news reaction playbook',
        duration: '10:27',
        videoUrl: 'https://www.youtube.com/embed/6p9Il_j0zjc',
        summary: 'Practice scenario drills and define hedges, rotations, and cooldown rules.'
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
    impact: 'Macro easing may expand risk appetite for majors.',
    drift: 0.008
  },
  {
    id: 'layer2-fees',
    title: 'Layer-2 gas rebates spike on weekend volume',
    summary:
      'Optimistic and zk rollups both slash fees for 48 hours; on-chain DEX flows jump. Watch DeFi beta and ETH correlation.',
    sentiment: 'bullish',
    assets: ['ETH', 'ARB', 'MNT', 'POL'],
    impact: 'Scaling catalysts tend to lift ETH beta trades.',
    drift: 0.01
  },
  {
    id: 'stablecoin-flow',
    title: 'Stablecoin inflows hit multi-month high',
    summary:
      'USDT, USDC, and PYUSD issuance expand on exchanges, hinting at fresh sidelined liquidity waiting to deploy.',
    sentiment: 'bullish',
    assets: ['USDT', 'USDC', 'DAI', 'PYUSD', 'USDS', 'USD1'],
    impact: 'Rising stable balances often precede market rotations.',
    drift: 0.006
  },
  {
    id: 'layer1-outage',
    title: 'Minor outage on emerging L1 resolved after patch',
    summary:
      'SUI validators briefly halt blocks; chain restarts within 30 minutes with new client release. Users watching reliability.',
    sentiment: 'bearish',
    assets: ['SUI', 'AVAX', 'NEAR'],
    impact: 'Infra hiccups can pressure riskier L1 valuations.',
    drift: -0.012
  },
  {
    id: 'etf-flows',
    title: 'Spot BTC ETF logs third straight day of inflows',
    summary:
      'Legacy funds continue to add WBTC backing; on-chain wraps mirror demand. Vol desks note rising call skew.',
    sentiment: 'bullish',
    assets: ['BTC', 'WBTC'],
    impact: 'Institutional demand may firm support zones.',
    drift: 0.014
  },
  {
    id: 'reg-hearing',
    title: 'Senate hearing floats stricter privacy coin oversight',
    summary:
      'Draft language singles out XMR and ZEC mixers; compliance desks anticipate liquidity fragmentation.',
    sentiment: 'bearish',
    assets: ['XMR', 'ZEC'],
    impact: 'Policy headwinds could widen spreads and damp volume.',
    drift: -0.018
  },
  {
    id: 'defi-hack',
    title: 'Mid-size DeFi lending pool pauses after oracle drift',
    summary:
      'Protocol halts deposits while patching price feed; insurers flag temporary capital flight into majors and stables.',
    sentiment: 'cautious',
    assets: ['AAVE', 'ETH', 'DAI'],
    impact: 'Short-term volatility expected across DeFi blue chips.',
    drift: -0.01
  },
  {
    id: 'meme-season',
    title: 'Meme coin rotation accelerates on social buzz',
    summary:
      'PEPE, PUMP, and M light up crypto Twitter; funding rates widen as speculators chase momentum.',
    sentiment: 'speculative',
    assets: ['PEPE', 'PUMP', 'M'],
    impact: 'High beta could spill into alt baskets if mania holds.',
    drift: 0.02
  },
  {
    id: 'ai-partnership',
    title: 'AI lab announces compute deal with decentralized storage network',
    summary:
      'Partnership pilots GPU leasing and data attestation on-chain; storage tokens bid on efficiency gains.',
    sentiment: 'bullish',
    assets: ['FIL', 'ICP', 'TAO'],
    impact: 'Narrative lift for AI-aligned infra assets.',
    drift: 0.012
  },
  {
    id: 'payments-push',
    title: 'Fintech giant expands stable settlement pilot',
    summary:
      'Retail app rolls PYUSD and USDC to three new markets; analysts eye volume growth versus card rails.',
    sentiment: 'bullish',
    assets: ['PYUSD', 'USDC', 'USDT'],
    impact: 'Payments traction can tighten stablecoin spreads.',
    drift: 0.007
  },
  {
    id: 'miner-revenue',
    title: 'Hashrate climbs while miner revenues soften',
    summary:
      'Higher difficulty squeezes margins; some miners hedge by selling forward. Could add near-term BTC supply.',
    sentiment: 'cautious',
    assets: ['BTC', 'WBTC'],
    impact: 'Extra sell pressure may weigh on spot bids.',
    drift: -0.006
  },
  {
    id: 'governance-upgrade',
    title: 'DAO schedules vote on fee switch activation',
    summary:
      'Uniswap-style governance debates routing a slice of fees to stakers; liquidity providers price in incentives.',
    sentiment: 'bullish',
    assets: ['UNI', 'CRO'],
    impact: 'Protocol revenue could re-rate governance tokens.',
    drift: 0.008
  },
  {
    id: 'airdrop-rumor',
    title: 'L2 points program hints at surprise airdrop window',
    summary:
      'Validator code references “epoch bonus” triggering speculation. On-chain activity spikes as users farm eligibility.',
    sentiment: 'speculative',
    assets: ['ARB', 'POL', 'MNT'],
    impact: 'Engagement surges but may unwind after snapshot.',
    drift: 0.009
  },
  {
    id: 'governance-spat',
    title: 'Validator spat over treasury spend hits social channels',
    summary:
      'Community split on diverting funds to marketing. Short-term governance uncertainty weighs on sentiment.',
    sentiment: 'bearish',
    assets: ['ATOM', 'NEAR', 'QNT'],
    impact: 'Choppy price action likely until clarity returns.',
    drift: -0.009
  },
  {
    id: 'energy-prices',
    title: 'Energy futures dip, easing miner cost pressure',
    summary:
      'Natural gas contracts slide 4%; proof-of-work miners eye better margins, potentially slowing sell flows.',
    sentiment: 'bullish',
    assets: ['BTC', 'WBTC', 'LTC', 'ETC'],
    impact: 'Lower opex can reduce forced selling risk.',
    drift: 0.005
  },
  {
    id: 'election-surprise',
    title: 'Election upset rekindles “risk hedge” bid for BTC',
    summary:
      'A populist White House return echoes the 2016 shock that sent Bitcoin parabolic within months as investors seek non-sovereign hedges.',
    sentiment: 'bullish',
    assets: ['BTC', 'WBTC', 'ETH'],
    impact: 'Historical election jolts have ignited major crypto rallies.',
    drift: 0.028
  },
  {
    id: 'geopolitical-strike',
    title: 'Regional conflict flares after overnight airstrike',
    summary:
      'A Middle East escalation rattles risk assets, mirroring past drawdowns when war headlines pushed traders into dollars and gold.',
    sentiment: 'bearish',
    assets: ['BTC', 'ETH', 'SOL', 'AVAX', 'XAUT', 'PAXG'],
    impact: 'Flight-to-safety moves historically clipped crypto by mid-single digits in hours.',
    drift: -0.026
  },
  {
    id: 'tariff-shock',
    title: 'New import tariffs reignite global growth fears',
    summary:
      'Trade tensions resurface, echoing the 2018 tariff volley that dented tech and altcoins while stoking demand for stablecoins.',
    sentiment: 'bearish',
    assets: ['SOL', 'ADA', 'DOT', 'NEAR', 'USDT', 'USDC', 'DAI'],
    impact: 'Risk-off rotations have previously dragged alts while lifting stables.',
    drift: -0.018
  },
  {
    id: 'etf-approval',
    title: 'Ethereum ETF receives conditional approval',
    summary:
      'Regulators give a conditional green light to an ETH spot ETF, echoing the BTC approval that ignited Q1 inflows.',
    sentiment: 'bullish',
    assets: ['ETH', 'WBTC', 'ARB', 'MNT'],
    impact: 'New wrapped flows could broaden institutional participation beyond BTC.',
    projection: 'When BTC ETFs cleared, ETH outperformed by ~12% in the following month as correlation beta rose.',
    articleBody: [
      'A conditional approval tees up the first U.S. ETH spot ETF pending final disclosures.',
      'Institutions now have a compliance-friendly channel to own ETH exposure.',
      'Traders expect staking narratives and L2 ecosystems to catch sympathetic bids.'
    ],
    drift: 0.022
  },
  {
    id: 'privacy-crackdown',
    title: 'Global taskforce targets mixers after coordinated arrests',
    summary:
      'Regulatory pressure mirrors the 2020 mixer seizures that drained liquidity from privacy coins and bled into broader alt markets.',
    sentiment: 'bearish',
    assets: ['XMR', 'ZEC', 'ATOM', 'ARB'],
    impact: 'Past crackdowns sparked sharp privacy coin drawdowns and wider de-risking.',
    drift: -0.024
  },
  {
    id: 'halving-complete',
    title: 'Bitcoin halving completes smoothly overnight',
    summary: 'Block rewards drop as scheduled; miner difficulty adjusts as hashpower reshuffles.',
    sentiment: 'bullish',
    assets: ['BTC', 'WBTC', 'LTC'],
    impact: 'Issuance shock historically sets floors before medium-term rallies.',
    projection: 'Past halvings saw chop then multi-month rallies of 50-300% as supply tightened.',
    articleBody: [
      'The latest Bitcoin halving reduced block rewards on schedule with clean network performance.',
      'Issuance shocks frequently precede consolidation before upside as supply-demand resets.',
      'Miner behavior bears watching as difficulty retargets and hashpower reallocates.'
    ],
    drift: 0.018
  },
  {
    id: 'bank-stress',
    title: 'Regional bank stress revives “digital gold” narrative',
    summary: 'Two mid-size lenders disclose liquidity gaps, echoing 2023 events that boosted BTC as an alternative hedge.',
    sentiment: 'bullish',
    assets: ['BTC', 'WBTC', 'XAUT', 'PAXG'],
    impact: 'Flight-to-quality can lift BTC alongside gold proxies.',
    projection: 'During March 2023 bank stress, BTC rallied ~40% in weeks while gold climbed.',
    articleBody: [
      'Liquidity cracks at regional banks are rekindling the digital gold conversation.',
      'Investors often pivot to BTC and precious-metal proxies when banking jitters rise.',
      'Watch stablecoin premiums and exchange inflows for confirmation of the rotation.'
    ],
    drift: 0.02
  },
  {
    id: 'exchange-hack',
    title: 'Major exchange pauses withdrawals after security incident',
    summary: 'A top-5 venue halts withdrawals to investigate a suspected wallet exploit, shaking short-term confidence.',
    sentiment: 'bearish',
    assets: ['BTC', 'ETH', 'SOL', 'USDT'],
    impact: 'Liquidity shocks can widen spreads and spark brief sell-offs before recovery.',
    projection: 'Past exchange pauses triggered 5-15% dips that retraced once operations resumed.',
    articleBody: [
      'A leading exchange paused withdrawals overnight after detecting suspicious movements.',
      'Traders are rerouting flows, which can thin books and increase slippage.',
      'Historically, markets stabilize after transparency updates and withdrawals resume.'
    ],
    drift: -0.021
  },
  {
    id: 'dev-upgrade',
    title: 'Core devs lock in upgrade date for major scalability fork',
    summary: 'Roadmap certainty lands as core developers set a firm fork date aimed at doubling throughput.',
    sentiment: 'bullish',
    assets: ['SOL', 'AVAX', 'NEAR'],
    impact: 'Upgrade clarity can attract speculative positioning into the fork.',
    projection: 'When Solana locked in past upgrades, SOL rallied 15-30% into the fork window.',
    articleBody: [
      'Core contributors have agreed on a calendar date for a performance-focused fork.',
      'Upgrade certainty typically lowers roadmap risk premia and invites pre-event positioning.',
      'Perps funding and spot demand tend to rise as traders chase the catalyst.'
    ],
    drift: 0.013
  },
  {
    id: 'metaverse-reboot',
    title: 'Major brand revives metaverse push with new partnerships',
    summary: 'A global retailer announces NFT loyalty integrations across multiple chains.',
    sentiment: 'speculative',
    assets: ['M', 'WLD', 'POL'],
    impact: 'Narrative revivals can spark short-lived rotations into metaverse and identity plays.',
    projection: 'Past brand activations created 10-30% pops that faded without sustained user growth.',
    articleBody: [
      'A household brand is rebooting its metaverse strategy with cross-chain loyalty rewards.',
      'Identity and NFT plays often see speculative bursts on partnership news.',
      'Durability depends on real user traction; watch daily actives to gauge staying power.'
    ],
    drift: 0.011
  },
  {
    id: 'governance-win',
    title: 'Community passes treasury proposal to fund security council',
    summary: 'Delegates approve a security-focused budget after a contested vote, improving confidence.',
    sentiment: 'bullish',
    assets: ['ARB', 'ATOM', 'QNT'],
    impact: 'Resolved governance risk can tighten spreads and lift sentiment.',
    projection: 'Governance wins often claw back prior drawdowns within a week as uncertainty clears.',
    articleBody: [
      'A contentious vote concluded with a mandate to fund a security council and audits.',
      'The outcome reduces tail risk and can lure sidelined capital back to the ecosystem.',
      'Delegates expect spreads to normalize as confidence returns.'
    ],
    drift: 0.009
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
  },
  {
    id: 'topic-news-reaction',
    title: 'Market Prediction & Interpretation Exam',
    summary: 'Match historic news shocks with the crypto reactions they triggered.',
    relatedLessons: ['lesson-news-mapping', 'lesson-sentiment-signals', 'lesson-playbook-builder'],
    questions: [
      { id: 'news-q1', prompt: 'In 2016, Bitcoin rallied strongly after which political surprise?', options: ['Brexit vote', 'U.S. election upset', 'Paris Agreement signing', 'NATO expansion'], answer: 1 },
      {
        id: 'news-q2',
        prompt: 'When a major exchange paused withdrawals due to a hack, BTC typically...',
        options: ['Surged 50% instantly', 'Dropped 5-15% then recovered after clarity', 'Stayed perfectly flat', 'Went to zero'],
        answer: 1
      },
      { id: 'news-q3', prompt: 'Gold and BTC often move together during...', options: ['Regional banking stress', 'NFT mints', 'Video game launches', 'Sports events'], answer: 0 },
      { id: 'news-q4', prompt: 'ETF approvals for BTC or ETH historically led to...', options: ['Lower liquidity', 'Institutional inflows and price appreciation', 'Chain halts', 'Loss of staking rewards'], answer: 1 },
      {
        id: 'news-q5',
        prompt: 'Geopolitical escalations like airstrikes often cause crypto to...',
        options: ['Act as a safe haven instantly', 'Dip as traders flee to dollars and gold', 'Remain unchanged', 'Double within minutes'],
        answer: 1
      },
      { id: 'news-q6', prompt: 'Halving events typically reduce BTC issuance and are followed by...', options: ['Permanent miner shutdowns', 'Consolidation then potential rallies', 'Immediate 90% crashes', 'No change ever'], answer: 1 },
      { id: 'news-q7', prompt: 'Privacy coin crackdowns in 2020 caused XMR and ZEC to...', options: ['List on every exchange', 'Rally on new demand', 'Sell off sharply with liquidity fragmentation', 'Peg to USD'], answer: 2 },
      { id: 'news-q8', prompt: 'Tariff wars in 2018 pushed many altcoins to...', options: ['Outperform tech stocks', 'De-risk and drop double digits', 'Stay pinned to stables', 'Rally with commodities'], answer: 1 },
      {
        id: 'news-q9',
        prompt: 'During meme coin rotations, disciplined traders often...',
        options: ['Ignore risk controls', 'Fade euphoria or scale out before liquidity dries', 'Leverage 100x blindly', 'Sell all BTC'],
        answer: 1
      },
      { id: 'news-q10', prompt: 'Stablecoin issuance surges usually signal...', options: ['Impending exchange bankruptcies', 'Dry powder that can rotate into majors', 'Airdrops are over', 'A need to short stables'], answer: 1 },
      { id: 'news-q11', prompt: 'Energy cost declines can influence POW assets by...', options: ['Increasing forced miner selling', 'Reducing sell pressure and easing margins', 'Eliminating rewards', 'Breaking consensus'], answer: 1 },
      {
        id: 'news-q12',
        prompt: 'Airdrop rumors often lead to...',
        options: ['Lower chain activity', 'Higher on-chain activity then potential post-snapshot retrace', 'Delisting of tokens', 'No change'],
        answer: 1
      },
      { id: 'news-q13', prompt: 'Election shocks have historically pushed some investors to...', options: ['Seek non-sovereign hedges like BTC', 'Sell all assets for cash permanently', 'Only buy real estate', 'Ignore policy risk'], answer: 0 },
      {
        id: 'news-q14',
        prompt: 'When regulators targeted mixers, correlated alt liquidity often...',
        options: ['Deepened', 'Fragmented and widened spreads', 'Became free', 'Moved to proof-of-work'],
        answer: 1
      },
      { id: 'news-q15', prompt: 'Bank stress events in 2023 led BTC to...', options: ['Rally as a perceived alternative to banks', 'Freeze trading', 'Lose all value', 'Convert to euros'], answer: 0 },
      { id: 'news-q16', prompt: 'Setting a firm upgrade date for a scalable L1 commonly...', options: ['Scares developers away', 'Invites speculative pre-fork positioning', 'Halts block production', 'Depegs stablecoins'], answer: 1 },
      {
        id: 'news-q17',
        prompt: 'When a major venue pauses withdrawals, prudent traders...',
        options: ['Add leverage there', 'Diversify venue risk and monitor communications', 'Ignore the pause', 'Assume funds are insured'],
        answer: 1
      },
      { id: 'news-q18', prompt: 'ETF approvals tend to affect related ecosystems (like L2s) by...', options: ['Reducing all fees', 'Attracting attention and correlation bids', 'Deleting smart contracts', 'Banning staking'], answer: 1 },
      { id: 'news-q19', prompt: 'Metaverse partnership headlines often cause...', options: ['Sustained 10-year rallies', 'Short-lived speculative spikes unless users arrive', 'Immediate protocol shutdowns', 'Oil prices to drop'], answer: 1 },
      { id: 'news-q20', prompt: 'When regional conflicts flare, crypto traders frequently...', options: ['Pile into gold proxies or stables first', 'Increase leverage indiscriminately', 'Ignore risk-off signals', 'Buy only meme coins'], answer: 0 }
    ]
  }
];

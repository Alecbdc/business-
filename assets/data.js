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

export const replayScenarios = [
  {
    id: 'calm-week',
    name: 'Calm week',
    description: 'Low volatility, gradual uptrend.',
    seed: 1234
  },
  {
    id: 'volatile-week',
    name: 'Volatile week',
    description: 'Sharp swings and sudden corrections.',
    seed: 5678
  }
];

export const leaderboardPeers = [
  { name: 'Nova Vector', capital: 12500, baseReturn: 0.11 },
  { name: 'Atlas Grove', capital: 9800, baseReturn: 0.07 },
  { name: 'Kairo Drift', capital: 14300, baseReturn: 0.16 },
  { name: 'Mara Helix', capital: 11200, baseReturn: 0.09 },
  { name: 'Orion Vale', capital: 8900, baseReturn: 0.05 },
  { name: 'Sage Ember', capital: 10100, baseReturn: 0.12 }
];

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
    projection:
      'If the "Centrally Planned Bank" follows through with a dovish glidepath, majors could carry a 50-120 bps weekly bid.',
    articleBody: [
      'The Wall Street Jester reports that the "Europhoria Bureau of Statistics" printed a cooler CPI, catching desks leaning hawkish.',
      'Officials at the imaginary "Centrally Planned Bank" hinted to reporters from The Economistical that a gentler dot plot is now on the table.',
      'Veteran macro watcher Tonald Drump, speaking from his gilded podcast bunker, joked that cheaper euros usually make "digital duckets" more interesting.',
      'Historically, softer inflation has lowered yields and lifted risk appetite, which translated into firmer bids for BTC, WBTC, and ETH in the month that followed.'
    ],
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
    projection: 'Fee holidays from rollups have historically juiced L2 tokens 8-15% intraday before normalizing.',
    articleBody: [
      'Rollup engineers at "Optimystic Labs" and "Zero-Knowledge Gazette" leaked a weekend gas rebate program to the satirical Economist cousin, The Economost.',
      'Users on DEX venue "CroissantSwap" reported 3x volume as arbitrage bots wearing monocles raced to capture cheap blockspace.',
      'A research note from brokerage "Giga Sachs" suggests ETH correlation beta usually spikes when scaling stories hit the tape.',
      'Traders watching ARB, MNT, and POL expect the effect to mirror prior fee holidays that briefly pulled L2 tokens into double-digit green before settling back.'
    ],
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
    projection: 'Desk surveys from "StableBros LLP" show a 60% probability that fresh minting fuels a BTC/ETH rotation within a week.',
    articleBody: [
      'The Wall Street Jest relays filings from the fictional "Department of Digital Bucks" showing a surge in tethered-liquidity issuance.',
      'Analysts at satirical ratings shop "Moodsys" told The Economost that new PYUSD and USDC flows resemble the pre-rally builds of early 2024.',
      'A syndicate trader known only as Vladimir Protein quipped that the stable spigot is "aimed right at risk assets" once the macro clouds clear.',
      'Historically, elevated mint activity has preceded rotations out of stables into majors, with spillover into alt baskets if momentum holds.'
    ],
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
    projection: 'A half-hour halt typically dents frontier L1s 5-8% intraday before clawbacks if uptime returns.',
    articleBody: [
      'Reporters from the Wall Street Jest were alerted when the fictional "Super Ultra Internet" chain paused block production overnight.',
      'Core dev collective "Silicon Slalom" rushed a patch that validators installed in under 30 minutes, according to briefings shared with The Economost.',
      'Traders compared the moment to past hiccups on Avalanche and Near-ish protocols, which saw liquidity step away until reliability metrics normalized.',
      'Risk officers at hedge fund "Citronella" warned that repeated wobbles can widen spreads on SUI, AVAX, and NEAR until uptime cred rebuilds.'
    ],
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
    projection: 'Flows resemble the 2024 spring streak that carried BTC +9% over five sessions.',
    articleBody: [
      'Filing trackers at the Wall Street Jest spotted three consecutive days of inflows into the fictional "Really Big Bitcoin Trust".',
      'Custodian "State Steer" confirmed wrapped balances rising in tandem, easing concerns about structural discounts.',
      'Options desks at "Morgan Stan-d Up" flagged a creeping call skew reminiscent of the early-year melt-up.',
      'If the pattern holds, BTC and WBTC could firm up key support zones as allocators drip-feed capital back into the wrapper trade.'
    ],
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
    projection: 'Similar hearings in 2020 clipped privacy names 10-18% before gradual recoveries.',
    articleBody: [
      'Capitol beat writers for the Wall Street Jest say Senator Shelly Blockchains introduced a draft that treats mixers as "clandestine coin laundromats."',
      'Lobbyists for "Zettle Cash" and "Monerail" met behind closed doors with staffers but emerged visibly uneasy, according to The Economost.',
      'Compliance czar Vladimir Protein reminded viewers on late-night financial satire that liquidity usually fragments before policies even land.',
      'Historically, hearings like these prompt OTC desks to widen spreads on XMR and ZEC, dragging spot prices until clarity returns.'
    ],
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
    projection: 'Past oracle snafus trimmed DeFi majors 4-9% in the first trading session.',
    articleBody: [
      'The Wall Street Jest obtained a memo from lending venue "Aviary" confirming an oracle misread on wrapped alpaca futures.',
      'Risk assessors at satirical insurer "LemonHedge" told The Economost that claim queues remain short but inflows are paused.',
      'DeFi historian Tonald Drump noted that similar glitches in 2021 and 2022 pushed users into ETH and DAI until code patches were audited.',
      'If the patch holds, spreads on AAVE and peers typically normalize within the week, but leverage resets can amplify near-term chop.'
    ],
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
    projection: 'Prior meme surges added 20-40% in days before retracing a chunk as liquidity dried.',
    articleBody: [
      'Influencers on the satirical platform "X-ish" posted frog memes at a clip not seen since the Spring of Stonks, the Wall Street Jest reports.',
      'Futures desks at "RobinHonk" showed widening funding as traders bid for PEPE, PUMP, and simply the letter M, hoping to front-run the herd.',
      'Sociologist Vladimir Protein joked that meme seasons end when his aunt asks about green frogs again.',
      'Historically, these rotations bleed into alt baskets briefly before sharp reversals, rewarding disciplined scaling out over blind leverage.'
    ],
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
    projection: 'Comparable AI-storage tie-ups in 2023 lifted sector tokens 6-14% over a fortnight.',
    articleBody: [
      'Private memos seen by The Economost show "DeepLeans" (sister to DeepMindful) cutting a pilot with decentralized storage vault "FileCabinet".',
      'Executives at compute collective "OpenAIsh" framed it as a way to tame GPU scarcity while preserving verifiable data flows.',
      'Brokerage "Goldsocks" told the Wall Street Jest that TAO, FIL, and ICP typically catch a narrative bid whenever AI labs flirt with on-chain infra.',
      'If history rhymes, the hype phase can sustain a modest grind higher unless the integration stumbles in production.'
    ],
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
    projection: 'Card-displacement pilots last year lifted PYUSD pairs 2-4% on usage headlines.',
    articleBody: [
      'Checkout upstart "PayFriend" (a playful cousin of a famous payments firm) quietly expanded its PYUSD and USDC rails to three new regions.',
      'Internal decks reviewed by the Wall Street Jest show executives bragging about lower fraud and fees versus legacy swipe networks nicknamed "Visibly" and "Masteroof."',
      'Economost columnist Sasha Ledger said merchants like the move because settlement arrives in minutes rather than days.',
      'If consumer stickiness materializes, spreads on PYUSD and USDC typically tighten as market-makers price in steadier velocity.'
    ],
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
    projection: 'Difficulty spikes of this size previously dragged BTC 3-6% as hedges rolled on.',
    articleBody: [
      'The Economost compiled data showing hashrate rising even as coinbase rewards shrink, a combo that squeezes the fictional miner "Hashy McHashface Inc."',
      "Treasurers at MegaMine, chaired by Tonald Drump's college roommate, told the Wall Street Jest they are hedging output two months forward.",
      'Such hedges can add incremental BTC supply to spot books, widening spreads until difficulty adjusts.',
      'Past cycles show miners easing sell pressure once energy costs stabilize and hashrate rebalances, giving BTC room to breathe.'
    ],
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
    projection: 'Past fee-switch debates nudged governance tokens 7-12% on anticipation alone.',
    articleBody: [
      'Community scribes on the Wall Street Jest forum report that "YouNiswapped" DAO will finally vote on a fee switch long whispered about.',
      'Liquidity whales on aggregator "Croissant River" told The Economost they are modeling new incentives if stakers receive a slice of volume.',
      'Governance historian Vladimir Protein reminded readers that the last time a similar toggle was discussed, governance tokens front-ran the outcome before settling into fundamentals.',
      'If the vote passes, UNI and CRO could enjoy a temporary re-rate as fee cash flows get priced in.'
    ],
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
    projection: 'Hype-fueled quests historically juiced activity but retraced 5-10% after snapshots.',
    articleBody: [
      'Block explorers spotted a curious "epoch bonus" flag in validator code, igniting an airdrop frenzy chronicled by the Wall Street Jest.',
      'Task boards on platform "FarmVille 3.0" showed queues of users spamming bridges to collect points on ARB, POL, and MNT.',
      'Analysts at boutique shop "Tokenomics & Sons" told The Economost that gas spikes and TVL bumps often vanish post-snapshot.',
      'Disciplined farmers may rotate early, remembering how prior rumors in 2023 left latecomers holding illiquid allocations.'
    ],
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
    projection: 'Treasury squabbles often shave 4-7% from governance tokens until decisions finalize.',
    articleBody: [
      'Validator personalities "Cosmo Kramer" and "Quantavius Finch" aired grievances on X-ish about treasury grants for billboards.',
      'The Wall Street Jest liveblogged the spat, noting that half the council walked out of a video call hosted by the Economost.',
      'Stakeholders remember similar brawls in 2022 that temporarily halved liquidity incentives before compromise.',
      'Until a proposal passes, ATOM, NEAR, and QNT holders may endure chop as market-makers widen quotes to price governance fog.'
    ],
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
    projection: 'When natgas eased 4% last quarter, POW baskets climbed 5-9% over the week.',
    articleBody: [
      'Commodity desks at the Wall Street Jest flag a 4% slide in natural gas, a welcome breather for proof-of-work miners.',
      'Executives from "LiteMining Co." and "Classic Hash LLC" told The Economost that cheaper energy buys them runway after the halving.',
      'Tonald Drump, ever the pundit, declared on his variety show that "cheaper juice means fewer forced dumps" from miners.',
      'Historically, easing input costs reduce urgency to sell block rewards, allowing BTC, WBTC, LTC, and ETC to stabilize.'
    ],
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
    projection: 'A 2016-style shock previously launched BTC ~120% in the ensuing quarter.',
    articleBody: [
      'The Wall Street Jest dubs the victor "Tonald Drump" after a surprise wave of ballots shifted overnight counts.',
      'Macro strategists at "JP Morganic" argue that political whiplash sends allocators hunting for non-sovereign hedges.',
      'Vladimir Protein reminded viewers on The Economost live stream that Bitcoin rocketed after the last surprise win in similar fashion.',
      'If history echoes, BTC, WBTC, and ETH could attract safe-haven curiosity even as traditional indices churn.'
    ],
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
    projection: 'Comparable 2024 headlines shaved 4-9% off alts during the first 24 hours.',
    articleBody: [
      'Satirical correspondents for the Wall Street Jest reported an overnight strike dubbed "Operation Discomfort" rattling regional markets.',
      'Energy traders fled to gold proxies like XAUT and PAXG, while crypto desks tightened risk, The Economost observed.',
      'Geo-politico commentator Vladimir Protein drew parallels to 2020 flare-ups that sparked immediate risk-off moves in SOL and AVAX.',
      'Until headlines cool, flight-to-safety flows may pressure BTC and ETH while lifting metal trackers.'
    ],
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
    projection: 'Trade volleys in 2018 smacked high-beta alts 8-15% while stables held firm.',
    articleBody: [
      'Finance ministers from the fictional "United Tariffdom" slapped duties on silicon imports, reviving growth jitters documented by the Wall Street Jest.',
      'Manufacturers like "AdaCore Devices" and "Dot Matrix Labs" warned of margin compression and delayed roadmaps.',
      'Economost editors compared the moment to 2018, when tariffs pushed investors toward stables while chopping alt valuations.',
      'If the volley escalates, traders may de-risk SOL, ADA, DOT, and NEAR while parking in USDT, USDC, and DAI.'
    ],
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
      'Filings at the satirical "Securities and Occasionally Futures Commission" show a conditional nod for the first U.S. ETH spot ETF.',
      'Mega-issuer "BlackPebble" and rival "Vangaardian" jockeyed for ticker rights while custodian "State Steer" rehearsed cold-storage talking points.',
      'Sources told the Wall Street Jest that allocator interest mirrors the early-days BTC wrapper frenzy, with buy-side desks modeling staking-plus-beta baskets.',
      'L2 cheerleaders from "ArbiTronix" and "Mount Mantle" expect sympathetic inflows if ETH correlation beta rises the way BTC ETFs unlocked fresh demand.'
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
    projection: 'During the 2020 sting, XMR and ZEC slid 15-25% before liquidity slowly returned.',
    articleBody: [
      'Interpol-esque agents from the fictional "Bureau of Coin Scrutiny" announced synchronized arrests of mixer operators across four cities, the Wall Street Jest learned.',
      'Chain sleuths at startup "CipherTonic" told The Economost that bridges and DEX pools briefly froze as LPs yanked liquidity from privacy routes.',
      'Commentator Vladimir Protein noted that even neutral chains like Atomica and ArbiTronix saw spreads widen in prior crackdowns as traders de-risked broadly.',
      'If officials push for stricter travel rules, market depth on XMR and ZEC could take weeks to rebuild, dragging correlated alts in the process.'
    ],
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
      'Node operators toasted another four-year ritual as the halving executed without drama, according to the Wall Street Jest.',
      'Engineers from "Blocksmiths Guild" joked to The Economost that the code treated issuance like a subscription that just got downgraded.',
      'Miner consortium "Hashy McHashface" plans to recalibrate rigs, while macro pundit Tonald Drump framed the cut as "digital austerity with a meme budget."',
      'Past supply shocks have sparked consolidation before multi-month rallies as scarcity narratives return to headlines.'
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
      'Two mid-size lenders nicknamed "Silicon Sallies" and "Signature-ish" disclosed liquidity gaps, according to filings shared with the Wall Street Jest.',
      'Depositors shuffled funds toward money-market clones while chatter about "digital gold" resurfaced on prime-time shows hosted by Tonald Drump.',
      'Gold bugs at "Burrito Hathaway" reminded The Economost that BTC and metal trackers often catch safe-haven bids together when bank wobbles hit.',
      'Traders watch for stablecoin premiums and exchange inflows as signals that the rotation into BTC, WBTC, XAUT, and PAXG has started anew.'
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
      'Mega venue "Coinbarn" hit the kill switch on withdrawals after spotting a rogue multisig transaction, spokespeople confirmed to the Wall Street Jest.',
      'Rival exchange "Binawnce" offered to help triage while market-makers at "SamuraiX" rerouted flow, thinning books and widening spreads.',
      'Tonald Drump mused on late-night TV that shutting the exits tends to spook tourists but seasoned traders watch incident reports for clarity.',
      'Prior pauses at other venues reversed once transparency returned, but BTC, ETH, and SOL often dip 5-15% in the fog before liquidity normalizes.'
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
      'Developers on chain "Solonga" met on a livestream hosted by The Economost to stamp a calendar date for their throughput fork.',
      'Lead maintainer Ada Lovelace-But-Different said the upgrade should double TPS if validators on "Avalunche" and "Nearish" follow suit.',
      'Roadmap certainty trims the risk premium that kept some funds sidelined, notes brokerage "Credit Swish" in a memo shared with the Wall Street Jest.',
      'Perps funding and spot demand often rise into such catalysts as traders position ahead of the fork announcement.'
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
      'Retail titan "WaltShop" teased a fresh metaverse rollout featuring pixelated loyalty cards, according to internal decks leaked to the Wall Street Jest.',
      'Partners include identity chain "Worldy ID" and NFT rail "PolyGander," both promising goggles-free experiences and cartoon avatars.',
      'The Economost reminded readers that last year\'s metaverse mania fizzled when daily active shoppers plateaued, leaving token charts looking like ski slopes.',
      'Speculators in M, WLD, and POL may chase the headline, but durability depends on whether customers actually show up to scan their imaginary receipts.'
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
      'Delegates on chain "ArbiTronix" emerged from a marathon call with a slim majority backing funds for a new security council, the Wall Street Jest reports.',
      'Audit firm "CertiKinda" will oversee the program while treasurer Ada Ledgerlight promised transparent expense dashboards.',
      'Pundit Vladimir Protein told The Economost that tail risks shrink when governance squabbles resolve, inviting sidelined liquidity back.',
      'With clarity restored, spreads on ARB, ATOM, and QNT often tighten as market-makers rebuild depth.'
    ],
    drift: 0.009
  },
  {
    id: 'treasury-buy',
    title: 'Software titan adds BTC to balance sheet redux',
    summary: 'MacroStratagem repeats its 2021 playbook, tucking another $500M in BTC onto its books.',
    sentiment: 'bullish',
    assets: ['BTC', 'WBTC', 'ETH'],
    impact: 'Corporate treasury bids can signal renewed institutional confidence.',
    projection: 'The last time MacroStratagem bought size, BTC climbed ~25% over the next month.',
    articleBody: [
      'CEO Sailor Moonwalk of MacroStratagem announced a fresh $500M BTC purchase on a webcast peppered with space-boat metaphors, the Wall Street Jest recaps.',
      'Auditors at "Pricewhopper Coopers" signed off on the treasury tilt while board member Tonald Drump live-tweeted rocket emojis.',
      'Competitors at "MicroSquishy" whispered about copycat programs, hinting that corporate FOMO could reignite.',
      'In 2021, similar treasury moves helped spark a multi-week climb as tradfi desks framed BTC as a balance-sheet hedge.'
    ],
    drift: 0.017
  },
  {
    id: 'policy-freeze',
    title: 'Central bank pauses hikes amid growth jitters',
    summary: 'The Federal Reservish signals a prolonged hold, echoing the 2019 pivot that boosted risk assets.',
    sentiment: 'bullish',
    assets: ['BTC', 'ETH', 'SOL', 'AVAX'],
    impact: 'Lower rate expectations can loosen liquidity for risk trades.',
    projection: 'The 2019 pivot preceded a 30-60% grind higher across majors over the subsequent quarter.',
    articleBody: [
      'Chair Jay Powpow of the Federal Reservish told reporters at the Wall Street Jest that growth clouds justify a rate pause and a slower balance-sheet runoff.',
      'Bond desks at "Goldsocks" and "Credit Swish" immediately priced in cut odds, easing financial conditions for speculative assets.',
      'Crypto strategists at the Economost noted that every softening cycle since 2013 has eventually nudged BTC and ETH higher, with spillover into fast L1s like SOL and AVAX.',
      'If the hold sticks, risk takers may redeploy sidelined cash toward higher-beta coins while watching inflation prints closely.'
    ],
    drift: 0.012
  },
  {
    id: 'crackdown-asia',
    title: 'Eastland announces another exchange ban, markets shrug',
    summary: 'Regulators in Eastland issue a fresh ban on retail crypto trading, echoing a decade of rinse-and-repeat headlines.',
    sentiment: 'cautious',
    assets: ['BTC', 'ETH', 'TRX', 'NEAR'],
    impact: 'Initial dips often fade as traders route through friendlier hubs.',
    projection: 'Past bans knocked majors 3-8% intraday before liquidity migrated offshore.',
    articleBody: [
      'The Ministry of Harmonious Blockchains in Eastland declared retail trading verboten yet again, state outlet The Daily Panda reported before being paywalled.',
      'Veterans rolled their eyes; Tonald Drump joked on live TV that the ban has been renewed more times than his reality show.',
      'OTC desks at "Huobi-Wannabe" and "OKAlmost" told the Economost that flow simply hops borders whenever the decree returns.',
      'Historically, the knee-jerk dip reverses as traders adapt, leaving BTC, ETH, TRX, and NEAR to reclaim ground within days.'
    ],
    drift: -0.007
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


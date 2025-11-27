// Stock-first dataset for the equities-focused sandbox
const stockCompanies = [
  { symbol: 'AAPL', name: 'Apple', sector: 'Consumer Technology', country: 'USA', size: 'mega', price: 188.2 },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Software', country: 'USA', size: 'mega', price: 412.1 },
  { symbol: 'AMZN', name: 'Amazon', sector: 'E-commerce & Cloud', country: 'USA', size: 'mega', price: 172.8 },
  { symbol: 'GOOGL', name: 'Alphabet', sector: 'Internet Services', country: 'USA', size: 'mega', price: 152.6 },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Social & AI', country: 'USA', size: 'mega', price: 465.4 },
  { symbol: 'TSLA', name: 'Tesla', sector: 'EV & Energy', country: 'USA', size: 'mega', price: 215.7 },
  { symbol: 'NVDA', name: 'NVIDIA', sector: 'Semiconductors', country: 'USA', size: 'mega', price: 890.3 },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Conglomerate', country: 'USA', size: 'mega', price: 430.2 },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Banking', country: 'USA', size: 'mega', price: 191.1 },
  { symbol: 'V', name: 'Visa', sector: 'Payments', country: 'USA', size: 'mega', price: 272.6 },
  { symbol: 'MA', name: 'Mastercard', sector: 'Payments', country: 'USA', size: 'mega', price: 446.8 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', country: 'USA', size: 'mega', price: 163.2 },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Staples', country: 'USA', size: 'mega', price: 162.4 },
  { symbol: 'PEP', name: 'PepsiCo', sector: 'Consumer Staples', country: 'USA', size: 'mega', price: 174.8 },
  { symbol: 'KO', name: 'Coca-Cola', sector: 'Consumer Staples', country: 'USA', size: 'mega', price: 64.3 },
  { symbol: 'MCD', name: 'McDonald\'s', sector: 'Restaurants', country: 'USA', size: 'mega', price: 286.5 },
  { symbol: 'WMT', name: 'Walmart', sector: 'Retail', country: 'USA', size: 'mega', price: 167.2 },
  { symbol: 'HD', name: 'Home Depot', sector: 'Retail', country: 'USA', size: 'mega', price: 347.1 },
  { symbol: 'COST', name: 'Costco', sector: 'Retail', country: 'USA', size: 'mega', price: 722.4 },
  { symbol: 'DIS', name: 'Disney', sector: 'Media & Parks', country: 'USA', size: 'large', price: 108.3 },
  { symbol: 'NFLX', name: 'Netflix', sector: 'Streaming', country: 'USA', size: 'large', price: 612.5 },
  { symbol: 'ADBE', name: 'Adobe', sector: 'Software', country: 'USA', size: 'large', price: 532.1 },
  { symbol: 'CRM', name: 'Salesforce', sector: 'Software', country: 'USA', size: 'large', price: 246.7 },
  { symbol: 'ORCL', name: 'Oracle', sector: 'Software', country: 'USA', size: 'large', price: 130.5 },
  { symbol: 'INTC', name: 'Intel', sector: 'Semiconductors', country: 'USA', size: 'large', price: 44.8 },
  { symbol: 'AMD', name: 'AMD', sector: 'Semiconductors', country: 'USA', size: 'large', price: 178.4 },
  { symbol: 'QCOM', name: 'Qualcomm', sector: 'Semiconductors', country: 'USA', size: 'large', price: 176.9 },
  { symbol: 'CSCO', name: 'Cisco', sector: 'Networking', country: 'USA', size: 'large', price: 52.3 },
  { symbol: 'IBM', name: 'IBM', sector: 'Enterprise Tech', country: 'USA', size: 'large', price: 196.2 },
  { symbol: 'PYPL', name: 'PayPal', sector: 'Fintech', country: 'USA', size: 'large', price: 72.4 },
  { symbol: 'SBUX', name: 'Starbucks', sector: 'Restaurants', country: 'USA', size: 'large', price: 92.8 },
  { symbol: 'NKE', name: 'Nike', sector: 'Apparel', country: 'USA', size: 'large', price: 98.5 },
  { symbol: 'BA', name: 'Boeing', sector: 'Aerospace', country: 'USA', size: 'large', price: 191.7 },
  { symbol: 'LMT', name: 'Lockheed Martin', sector: 'Defense', country: 'USA', size: 'large', price: 461.3 },
  { symbol: 'CAT', name: 'Caterpillar', sector: 'Industrials', country: 'USA', size: 'large', price: 345.6 },
  { symbol: 'UPS', name: 'UPS', sector: 'Logistics', country: 'USA', size: 'large', price: 151.2 },
  { symbol: 'HON', name: 'Honeywell', sector: 'Industrials', country: 'USA', size: 'large', price: 208.4 },
  { symbol: 'GE', name: 'GE Aerospace', sector: 'Aerospace', country: 'USA', size: 'large', price: 166.9 },
  { symbol: 'TSM', name: 'TSMC', sector: 'Semiconductors', country: 'Taiwan', size: 'large', price: 148.7 },
  { symbol: 'SONY', name: 'Sony', sector: 'Electronics & Media', country: 'Japan', size: 'large', price: 98.3 },
  { symbol: 'SAP', name: 'SAP', sector: 'Software', country: 'Germany', size: 'large', price: 192.8 },
  { symbol: 'TM', name: 'Toyota', sector: 'Autos', country: 'Japan', size: 'large', price: 213.5 },
  { symbol: 'HMC', name: 'Honda', sector: 'Autos', country: 'Japan', size: 'large', price: 36.7 },
  { symbol: 'RIVN', name: 'Rivian', sector: 'EV', country: 'USA', size: 'mid', price: 16.9 },
  { symbol: 'GM', name: 'General Motors', sector: 'Autos', country: 'USA', size: 'mid', price: 42.1 },
  { symbol: 'F', name: 'Ford', sector: 'Autos', country: 'USA', size: 'mid', price: 13.8 },
  { symbol: 'UBER', name: 'Uber', sector: 'Mobility', country: 'USA', size: 'mid', price: 69.7 },
  { symbol: 'ABNB', name: 'Airbnb', sector: 'Travel', country: 'USA', size: 'mid', price: 149.9 },
  { symbol: 'SHOP', name: 'Shopify', sector: 'E-commerce Platforms', country: 'Canada', size: 'mid', price: 88.2 },
  { symbol: 'SQ', name: 'Block', sector: 'Fintech', country: 'USA', size: 'mid', price: 79.4 },
  { symbol: 'PLTR', name: 'Palantir', sector: 'Data & AI', country: 'USA', size: 'mid', price: 33.6 },
  { symbol: 'SNOW', name: 'Snowflake', sector: 'Data Platforms', country: 'USA', size: 'mid', price: 180.5 },
  { symbol: 'ZM', name: 'Zoom', sector: 'Collaboration', country: 'USA', size: 'mid', price: 76.2 },
  { symbol: 'DOCU', name: 'DocuSign', sector: 'Collaboration', country: 'USA', size: 'mid', price: 56.7 },
  { symbol: 'ETSY', name: 'Etsy', sector: 'E-commerce', country: 'USA', size: 'mid', price: 87.4 },
  { symbol: 'SPOT', name: 'Spotify', sector: 'Streaming', country: 'Sweden', size: 'mid', price: 288.3 },
  { symbol: 'ROKU', name: 'Roku', sector: 'Streaming Hardware', country: 'USA', size: 'mid', price: 68.9 },
  { symbol: 'CRWD', name: 'CrowdStrike', sector: 'Cybersecurity', country: 'USA', size: 'mid', price: 329.4 },
  { symbol: 'DDOG', name: 'Datadog', sector: 'Observability', country: 'USA', size: 'mid', price: 134.1 },
  { symbol: 'NET', name: 'Cloudflare', sector: 'Networking & Security', country: 'USA', size: 'mid', price: 109.6 }
];

const cryptoAssets = [
  { symbol: 'BTC', name: 'Bitcoin', sector: 'Digital Gold', country: 'Global', size: 'mega', price: 68000 },
  { symbol: 'ETH', name: 'Ethereum', sector: 'Smart Contracts', country: 'Global', size: 'mega', price: 3400 },
  { symbol: 'SOL', name: 'Solana', sector: 'High-Speed Layer 1', country: 'Global', size: 'large', price: 180 },
  { symbol: 'BNB', name: 'Binance Coin', sector: 'Exchange Token', country: 'Global', size: 'large', price: 600 },
  { symbol: 'ADA', name: 'Cardano', sector: 'Layer 1', country: 'Global', size: 'large', price: 0.48 },
  { symbol: 'XRP', name: 'XRP', sector: 'Payments', country: 'Global', size: 'large', price: 0.62 },
  { symbol: 'DOGE', name: 'Dogecoin', sector: 'Memes', country: 'Global', size: 'mid', price: 0.18 },
  { symbol: 'DOT', name: 'Polkadot', sector: 'Interoperability', country: 'Global', size: 'mid', price: 8.2 },
  { symbol: 'AVAX', name: 'Avalanche', sector: 'Layer 1', country: 'Global', size: 'mid', price: 45.5 },
  { symbol: 'MATIC', name: 'Polygon', sector: 'Scaling', country: 'Global', size: 'mid', price: 1.1 },
  { symbol: 'ATOM', name: 'Cosmos', sector: 'Interchain', country: 'Global', size: 'mid', price: 12.4 },
  { symbol: 'LINK', name: 'Chainlink', sector: 'Oracles', country: 'Global', size: 'mid', price: 19.6 },
  { symbol: 'ARB', name: 'Arbitrum', sector: 'Layer 2', country: 'Global', size: 'mid', price: 1.9 },
  { symbol: 'OP', name: 'Optimism', sector: 'Layer 2', country: 'Global', size: 'mid', price: 2.1 },
  { symbol: 'ETC', name: 'Ethereum Classic', sector: 'Legacy Layer 1', country: 'Global', size: 'mid', price: 28.3 },
  { symbol: 'LTC', name: 'Litecoin', sector: 'Payments', country: 'Global', size: 'mid', price: 89.4 },
  { symbol: 'XLM', name: 'Stellar', sector: 'Payments', country: 'Global', size: 'mid', price: 0.16 },
  { symbol: 'FIL', name: 'Filecoin', sector: 'Storage', country: 'Global', size: 'mid', price: 9.8 },
  { symbol: 'APT', name: 'Aptos', sector: 'Layer 1', country: 'Global', size: 'mid', price: 12.7 },
  { symbol: 'PEPE', name: 'Pepe', sector: 'Memes', country: 'Global', size: 'small', price: 0.000012 },
  { symbol: 'SUI', name: 'Sui', sector: 'Layer 1', country: 'Global', size: 'small', price: 1.3 },
  { symbol: 'NEAR', name: 'Near', sector: 'Layer 1', country: 'Global', size: 'small', price: 6.4 },
  { symbol: 'ICP', name: 'Internet Computer', sector: 'Layer 1', country: 'Global', size: 'small', price: 14.1 },
  { symbol: 'AAVE', name: 'Aave', sector: 'DeFi', country: 'Global', size: 'small', price: 102.5 },
  { symbol: 'UNI', name: 'Uniswap', sector: 'DEX', country: 'Global', size: 'small', price: 8.6 },
  { symbol: 'PYTH', name: 'Pyth Network', sector: 'Oracles', country: 'Global', size: 'small', price: 0.65 },
  { symbol: 'TIA', name: 'Celestia', sector: 'Modular', country: 'Global', size: 'small', price: 14.9 },
  { symbol: 'RON', name: 'Ronin', sector: 'Gaming', country: 'Global', size: 'small', price: 3.5 },
  { symbol: 'WLD', name: 'Worldcoin', sector: 'ID', country: 'Global', size: 'small', price: 5.2 },
  { symbol: 'BONK', name: 'Bonk', sector: 'Memes', country: 'Global', size: 'small', price: 0.00003 }
];

const stockPrices = Object.fromEntries(stockCompanies.map((company) => [company.symbol, company.price]));
const cryptoPrices = Object.fromEntries(cryptoAssets.map((asset) => [asset.symbol, asset.price]));

export const assetSegments = {
  stocks: stockCompanies.map((c) => c.symbol),
  crypto: cryptoAssets.map((c) => c.symbol)
};

export const initialPrices = { ...stockPrices, ...cryptoPrices };

function baseCap(size) {
  if (size === 'mega') return 500;
  if (size === 'large') return 140;
  return 40;
}

function makeFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

export const stockFundamentals = Object.fromEntries(
  stockCompanies.map((company, idx) => {
    const cap = baseCap(company.size) + idx * 6;
    const pe = 12 + (idx % 11) * 1.5;
    const eps = 1.2 + (idx % 8) * 0.3;
    const dividendYield = idx % 5 === 0 ? 2 + (idx % 3) * 0.4 : 0.6 + (idx % 4) * 0.3;
    const earningsAnnual = Array.from({ length: 3 }).map((_, i) => {
      const year = 2023 - i;
      const actual = Number((eps * (1 + 0.08 * (2 - i))).toFixed(2));
      const estimate = Number((actual * (1 + (i === 0 ? 0.05 : -0.02))).toFixed(2));
      return { period: String(year), actual, estimate };
    });
    const quarterlyLabels = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];
    const earningsQuarterly = quarterlyLabels.map((label, i) => {
      const actual = Number((eps / 4 + 0.1 * (i % 2)).toFixed(2));
      const estimate = Number((actual * (1 + (i % 2 === 0 ? 0.04 : -0.03))).toFixed(2));
      return { period: label, actual, estimate };
    });
    const performanceAnnual = Array.from({ length: 3 }).map((_, i) => {
      const period = `FY${2023 - i}`;
      const revenueGrowth = Number((8 - i * 1.2 + (idx % 3)).toFixed(1));
      const netIncome = Number((14 - i * 1.5 + (idx % 2)).toFixed(1));
      const margin = Number((15 - i * 0.8 + (idx % 4)).toFixed(1));
      return { period, revenueGrowth, netIncome, margin };
    });
    const perfQuarterly = quarterlyLabels.map((period, i) => {
      const revenueGrowth = Number((5 + (idx % 3) - i * 0.5).toFixed(1));
      const netIncome = Number((10 + (idx % 2) - i * 0.6).toFixed(1));
      const margin = Number((12 + (idx % 4) - i * 0.4).toFixed(1));
      return { period, revenueGrowth, netIncome, margin };
    });
    return [
      company.symbol,
      {
        ...company,
        summary: `${company.name} is a ${company.country} ${company.sector.toLowerCase()} leader focused on durable growth and product innovation.`,
        metrics: {
          marketCap: Number((cap).toFixed(1)),
          pe: Number(pe.toFixed(1)),
          eps: Number(eps.toFixed(2)),
          dividendYield: Number(dividendYield.toFixed(2))
        },
        events: [
          {
            title: `${company.name} earnings call`,
            date: makeFutureDate(15 + (idx % 12)),
            description: `Management shares guidance and balance-sheet updates for ${company.name}.`
          },
          {
            title: `${company.name} launch/update`,
            date: makeFutureDate(40 + (idx % 20)),
            description: `Product or regional expansion milestone for ${company.name}.`
          }
        ],
        earnings: {
          annual: earningsAnnual,
          quarterly: earningsQuarterly
        },
        performance: {
          annual: performanceAnnual,
          quarterly: perfQuarterly
        },
        news: [
          {
            title: `${company.name} expands in ${company.sector.toLowerCase()}`,
            summary: `${company.name} signs new partnerships to deepen ${company.sector.toLowerCase()} reach.`,
            sentiment: 'positive'
          },
          {
            title: `${company.name} faces competitive pressure`,
            summary: `Rivals step up in ${company.sector.toLowerCase()}, investors watch margins closely.`,
            sentiment: 'neutral'
          }
        ]
      }
    ];
  })
);

const cryptoFundamentals = Object.fromEntries(
  cryptoAssets.map((asset, idx) => {
    const cap = 40 + idx * 6;
    const yieldPct = idx % 3 === 0 ? 4 + idx * 0.2 : 0;
    return [
      asset.symbol,
      {
        ...asset,
        summary: `${asset.name} is a ${asset.sector.toLowerCase()} network serving global users.`,
        metrics: {
          marketCap: Number(cap.toFixed(1)),
          pe: null,
          eps: null,
          dividendYield: Number(yieldPct.toFixed(2))
        },
        events: [
          { title: `${asset.name} upgrade`, date: makeFutureDate(10 + (idx % 10)), description: 'Protocol roadmap milestone.' },
          { title: `${asset.name} ecosystem drop`, date: makeFutureDate(25 + (idx % 12)), description: 'Community incentive or partnership.' }
        ],
        earnings: { annual: [], quarterly: [] },
        performance: { annual: [], quarterly: [] },
        news: [
          { title: `${asset.name} adoption grows`, summary: `${asset.symbol} sees rising active addresses.`, sentiment: 'positive' },
          { title: `${asset.name} faces volatility`, summary: `${asset.symbol} reacts to macro shifts.`, sentiment: 'neutral' }
        ]
      }
    ];
  })
);

export const assetFundamentals = { ...stockFundamentals, ...cryptoFundamentals };

export const defaultSandboxState = {
  balance: 10000,
  holdings: Object.fromEntries(Object.keys(initialPrices).map((symbol) => [symbol, 0])),
  history: []
};

export const marketScenarioLevels = [
  {
    id: 'beginner',
    name: 'Beginner',
    tagline: 'First storms in equities with mild policy jitters.',
    scenarios: [
      {
        id: 'slow-squeeze',
        title: 'Gentle Downtrend: The Slow Squeeze',
        teaser: 'Indices drift lower on soft-landing doubts and mixed earnings.',
        difficulty: 1,
        durationDays: 45,
        bias: -0.002,
        volatility: 0.05,
        starTargets: [0.15, 0.25, 0.4],
        xpRewards: [100, 200, 300],
        description:
          'Inspired by pre-recession drifts where equities leak lower for weeks while guidance softens and liquidity tightens.',
        tips: [
          'Trim exposure into strength and keep dry powder for bounces.',
          'Favor quality large caps over speculative names during slow fades.',
          'Watch for rotation: defensives can cushion drawdowns.'
        ],
        news: [
          {
            id: 'slow-gdp',
            title: 'Growth outlook trimmed; industrials guide lower',
            summary: 'Survey data cools while retailers flag softer traffic.',
            drift: -0.06,
            assets: ['WMT', 'HD', 'CAT', 'ALT_BASKET'],
            atDay: 5
          },
          {
            id: 'earnings-drift',
            title: 'Mega-caps tighten spend; cloud growth moderates',
            summary: 'Platform giants rein in capex; investors rotate to staples.',
            drift: -0.08,
            assets: ['AMZN', 'MSFT', 'GOOGL'],
            atDay: 18
          },
          {
            id: 'relief-rumor',
            title: 'Stimulus chatter sparks short-covering rally',
            summary: 'Policy hints lift large caps; cyclicals lag.',
            drift: 0.05,
            assets: ['AAPL', 'MSFT', 'ALT_BASKET'],
            atDay: 32
          }
        ]
      }
    ]
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    tagline: 'Policy whiplash, regulation waves, and sector rotations.',
    scenarios: [
      {
        id: 'clampdownistan',
        title: 'Clampdownistan: Ministry of No-Stock',
        teaser: 'Regulators float tighter rules; fintech and ad-tech wobble.',
        difficulty: 2,
        durationDays: 55,
        bias: -0.0035,
        volatility: 0.08,
        starTargets: [0.15, 0.25, 0.4],
        xpRewards: [100, 200, 300],
        description:
          'Mirrors historic crackdown cycles: sudden investigations, advertising curbs, and payments scrutiny pressure growth names.',
        tips: [
          'Fade sharp rips in the most targeted sectors.',
          'Favor diversified incumbents over single-line challengers.',
          'Hold cash for headline gaps in both directions.'
        ],
        news: [
          {
            id: 'ad-curb',
            title: 'Ad-tracking rules tighten; social apps slide',
            summary: 'New privacy proposals weigh on META and streaming peers.',
            drift: -0.12,
            assets: ['META', 'NFLX', 'DIS'],
            atDay: 8
          },
          {
            id: 'fintech-review',
            title: 'Payments oversight widens to peer-to-peer leaders',
            summary: 'Fintech names flag higher compliance spend.',
            drift: -0.09,
            assets: ['PYPL', 'SQ', 'V', 'MA'],
            atDay: 18
          },
          {
            id: 'policy-pause',
            title: 'Officials hint at review pause—shorts trim risk',
            summary: 'Relief bid lifts diversified tech majors.',
            drift: 0.07,
            assets: ['AAPL', 'MSFT', 'GOOGL'],
            atDay: 38
          }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    tagline: 'Tightening cycles, flash drops, and liquidity crunches.',
    scenarios: [
      {
        id: 'fedzilla',
        title: 'Fedzilla Awakens',
        teaser: 'Aggressive hikes shake growth stocks and leveraged trades.',
        difficulty: 3,
        durationDays: 60,
        bias: -0.004,
        volatility: 0.11,
        starTargets: [0.15, 0.25, 0.4],
        xpRewards: [100, 200, 300],
        description:
          'Mirrors aggressive tightening cycles: jumbo hikes, hawkish pressers, and balance-sheet roll-off rattling high-beta names.',
        tips: [
          'Respect downside momentum after back-to-back hikes.',
          'Use relief rallies to reduce beta exposure.',
          'Favor cash-rich leaders over speculative stories.'
        ],
        news: [
          {
            id: 'jumbo-hike',
            title: 'Fedzilla drops jumbo hike—equities wobble first',
            summary: 'Hawkish tone; liquidity pulls back.',
            drift: -0.16,
            assets: ['TSLA', 'NVDA', 'AMZN', 'ALT_BASKET'],
            atDay: 6
          },
          {
            id: 'taper-rumor',
            title: 'Taper rumors cool fear—brief tech squeeze',
            summary: 'Quality tech rebounds; small caps lag.',
            drift: 0.08,
            assets: ['MSFT', 'AAPL', 'AMD'],
            atDay: 22
          },
          {
            id: 'flash-crunch',
            title: 'Flash crash in thin liquidity session',
            summary: 'Macro funds de-risk; dips bought by value hunters.',
            drift: -0.18,
            assets: ['AMD', 'SHOP', 'RIVN', 'ALT_BASKET'],
            atDay: 41
          }
        ]
      }
    ]
  }
];

export const leaderboardPeers = [
  { name: 'Aether Indexer', change: 0.06 },
  { name: 'Value Voyager', change: 0.03 },
  { name: 'Growth Guru', change: 0.12 },
  { name: 'Defensive Drift', change: 0.01 }
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
    id: 'apple-earnings',
    title: 'Apple tops estimates with services strength',
    summary: 'Cupertino posts record services revenue as hardware steadies; analysts lift price targets.',
    sentiment: 'bullish',
    assets: ['AAPL', 'MSFT', 'NVDA'],
    impact: 'Mega-cap tech leadership may broaden the rally.',
    projection: 'Past beats of this magnitude lifted AAPL peers 4-9% over the following sessions.',
    articleBody: [
      'The Wall Street Jest reports Tonald Drump calling it the "iPhone for your portfolio" after services hit all-time highs.',
      'Research shop The Economost notes cloud and AI attach rates are rising across Apple and Microsoft ecosystems.',
      'Desk chatter suggests hardware margins stabilizing helps smooth volatility across mega-cap peers.',
      'Historically, strong Apple prints supported sentiment in NVDA and MSFT as capital rotated across the complex.'
    ],
    drift: 0.012
  },
  {
    id: 'auto-recall',
    title: 'EV recall headlines rattle automakers',
    summary: 'Regulators probe braking software; delivery targets reiterated but investors trim exposure.',
    sentiment: 'bearish',
    assets: ['TSLA', 'RIVN', 'GM', 'F'],
    impact: 'Autos may see wider spreads until clarity emerges.',
    projection: 'Comparable recalls shaved 6-12% from EV names before stabilizing on firm guidance.',
    articleBody: [
      'Satirical inspector Vladimir Protein joked that regulators "don't like surprise self-driving donuts".',
      'TSLA, RIVN, and legacy peers GM and F outlined over-the-air patch timelines to soothe investors.',
      'Options desks at Morgan Stan-d Up report elevated put skew across autos.',
      'Historically, delivery beats in subsequent months helped reverse the drawdown once fixes rolled out.'
    ],
    drift: -0.015
  },
  {
    id: 'cloud-spend',
    title: 'Enterprise cloud spend re-accelerates',
    summary: 'CIO surveys show budgets loosening for AI workloads; data-platform vendors cheer.',
    sentiment: 'bullish',
    assets: ['MSFT', 'AMZN', 'GOOGL', 'SNOW', 'DDOG'],
    impact: 'Software and data platforms may catch a multi-session bid.',
    projection: 'Similar survey inflections in 2023 preceded a 7-14% upswing in hyperscalers and observability names.',
    articleBody: [
      'The Economost leaked a memo from "Giga Sachs" showing AI budgets up 11% QoQ.',
      'SNOW and DDOG spokespeople say pipelines are the fullest since early 2022.',
      'Block-chain skeptic Tonald Drump quipped that "cloud is the new cloud" but traders still bought.',
      'Hyperscaler optimism often spills into data/security vendors as procurement cycles reopen.'
    ],
    drift: 0.01
  },
  {
    id: 'defense-bill',
    title: 'Defense bill fast-tracked through committee',
    summary: 'New spending package boosts aerospace and security allocations; contractors guide higher.',
    sentiment: 'bullish',
    assets: ['LMT', 'BA', 'GE'],
    impact: 'Defense complex could outperform broader indices.',
    projection: 'Similar bills in past cycles lifted primes 5-10% over two weeks.',
    articleBody: [
      'Committee chair Vladimir Protein called it the "Peace Through Procurement Act" on late-night finance satire.',
      'Analysts at The Economost flagged upside to long-cycle backlogs at LMT and BA.',
      'GE Aerospace notes supply-chain improvements unlocking deliveries.',
      'Historic analogs show defense primes grinding higher into funding clarity.'
    ],
    drift: 0.009
  },
  {
    id: 'ad-privacy',
    title: 'Ad privacy rules resurface; platforms caution on near-term impact',
    summary: 'Proposed tracking curbs push marketers to diversify; social and streaming names guide prudently.',
    sentiment: 'cautious',
    assets: ['META', 'NFLX', 'DIS'],
    impact: 'Engagement metrics may face scrutiny; volatility elevated.',
    projection: 'Prior drafts pulled META and streaming peers 4-8% before a recovery on clearer rules.',
    articleBody: [
      'The Wall Street Jest quotes an agency exec calling the draft "Clampdownistan 2.0".',
      'META lobbyists counter that small-business budgets remain resilient.',
      'Streaming incumbents DIS and NFLX highlight ad-supported tier momentum.',
      'Marketers historically rebalance spend but return once measurement stabilizes.'
    ],
    drift: -0.006
  },
  {
    id: 'rate-cut-hopes',
    title: 'Central bank minutes hint at slower hikes',
    summary: 'Futures price in a gentler path; rate-sensitive sectors perk up.',
    sentiment: 'bullish',
    assets: ['WMT', 'HD', 'PG', 'KO', 'AAPL'],
    impact: 'Defensives and consumer names may enjoy a relief bid.',
    projection: 'Gentler minutes in past cycles delivered 3-6% pops in staples and big-box retailers.',
    articleBody: [
      'Tonald Drump told The Economost he "prefers his rates like his golf scores: lower."',
      'Staples giants PG and KO typically firm up when real yields cool.',
      'Rate relief often boosts home improvement spend, aiding WMT and HD.',
      'AAPL and other quality names can benefit as discount rates ease on cash flows.'
    ],
    drift: 0.007
  }
];

export const marketLabBulletins = [
  {
    id: 'lab-housing',
    title: 'Housing data beats expectations',
    summary: 'New permits rise; homebuilders guide cautiously but pricing holds.',
    sentiment: 'bullish',
    assets: ['HD', 'HD', 'WMT', 'AAPL'],
    drift: 0.006
  },
  {
    id: 'lab-energy',
    title: 'Energy prices spike on refinery outage',
    summary: 'Supply hiccup lifts fuel costs; airlines hedge while logistics firms flag margin pinch.',
    sentiment: 'bearish',
    assets: ['UPS', 'BA', 'GE'],
    drift: -0.01
  },
  {
    id: 'lab-retail',
    title: 'Retail foot traffic accelerates into holiday season',
    summary: 'Early promos pull demand forward; big-box leaders reiterate full-year outlook.',
    sentiment: 'bullish',
    assets: ['WMT', 'COST', 'DIS'],
    drift: 0.007
  },
  {
    id: 'lab-cyber',
    title: 'Security budgets climb after headline breach',
    summary: 'CISOs add spend for endpoint and cloud protection; vendors tout pipeline strength.',
    sentiment: 'bullish',
    assets: ['CRWD', 'NET', 'DDOG'],
    drift: 0.009
  },
  {
    id: 'lab-europe',
    title: 'Eurozone PMI softens, exporters guide cautiously',
    summary: 'Industrial orders slow; FX tailwinds help multinational tech giants.',
    sentiment: 'cautious',
    assets: ['SAP', 'SONY', 'TM', 'HMC'],
    drift: -0.004
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


# Perminal — Social Prediction Markets on Solana

A professional, dark mode-focused, card-based social prediction market web application built on Solana, powered by DFlow Trade API and Kalshi market data.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Auth:** Privy Web SDK (Social Login + Embedded Wallet)
- **State Management:** TanStack Query (React Query)
- **Blockchain:** Solana (@solana/web3.js + @solana/wallet-adapter-react)
- **Trading:** DFlow Trade API
- **Market Data:** Kalshi API

## Features

- 🎨 **Dark Mode UI** - Lute.gg/Tensor-inspired design
- 📊 **Real-time Market Data** - Powered by Kalshi API
- 💱 **On-chain Trading** - DFlow Trade API for prediction market swaps
- 🔐 **Wallet Integration** - Privy + Solana wallet adapters
- 📱 **Responsive Design** - Optimized for desktop browsers

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API keys for:
  - [Privy](https://privy.io) (for authentication)
  - [DFlow](https://pond.dflow.net) (for trading)
  - [Kalshi](https://docs.kalshi.com) (for market data)
  - Solana RPC endpoint (public or private)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Perminal
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Privy App ID
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# DFlow API
NEXT_PUBLIC_DFLOW_API_URL=https://api.dflow.net/v1
NEXT_PUBLIC_DFLOW_API_KEY=your_dflow_api_key

# Kalshi API
NEXT_PUBLIC_KALSHI_API_URL=https://api.calendar.kalshi.com/trade-api/v2
NEXT_PUBLIC_KALSHI_API_KEY_ID=your_kalshi_key_id
NEXT_PUBLIC_KALSHI_API_SECRET=your_kalshi_secret

# Solana RPC
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

### DFlow Trade API

The app uses DFlow's unified Trade API for executing prediction market trades on Solana. Key features:

- **Swap Quotes** - Get best execution quotes for YES/NO outcome tokens
- **Transaction Execution** - Sign and submit Solana transactions
- **Order Tracking** - Monitor trade status and confirmations

Documentation: [https://pond.dflow.net/introduction](https://pond.dflow.net/introduction)

### Kalshi API

Market data is fetched from Kalshi's API, providing:

- **Live Market Prices** - Real-time bid/ask spreads
- **Market Discovery** - Browse available prediction markets
- **Historical Data** - Volume and liquidity metrics

Documentation: [https://docs.kalshi.com/sdks/overview](https://docs.kalshi.com/sdks/overview)

## Project Structure

```
Perminal/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with sidebar/topbar
│   ├── page.tsx            # Home page (market grid)
│   └── providers.tsx      # React Query + Privy + Solana providers
├── components/
│   ├── layout/             # Sidebar, Topbar
│   ├── market/             # MarketCard component
│   └── ui/                 # shadcn/ui components
├── hooks/
│   ├── useMarkets.ts       # Kalshi API integration
│   └── useTrade.ts         # DFlow trading integration
├── lib/
│   ├── services/          # API service clients
│   │   ├── dflow.ts       # DFlow Trade API client
│   │   └── kalshi.ts      # Kalshi API client
│   └── mock-data.ts        # Fallback mock data
└── public/                 # Static assets
```

## Trading Flow

1. User connects wallet (Privy or Solana wallet adapter)
2. Browse markets from Kalshi API
3. Click "Buy YES" or "Buy NO" on a market card
4. DFlow API provides swap quote
5. User signs transaction with wallet
6. Transaction submitted to Solana network
7. Trade confirmed on-chain

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## License

MIT

## Support

For issues and questions:
- DFlow: [https://pond.dflow.net](https://pond.dflow.net)
- Kalshi: [https://docs.kalshi.com](https://docs.kalshi.com)
- Privy: [https://privy.io](https://privy.io)

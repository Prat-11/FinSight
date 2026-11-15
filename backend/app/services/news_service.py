from datetime import datetime, timedelta, timezone
from typing import List, Optional
import uuid

from app.schemas.stock import NewsArticle

SAMPLE_ARTICLES = [
    {
        "id": "news-1",
        "title": "Fed Signals Steady Interest Rates Amid Controlled Inflation Print",
        "summary": "Federal Reserve officials indicated that benchmark interest rates are likely to remain restrictive for a measured timeframe as inflation trends toward the 2% target.",
        "source": "FinSight Financial Wire (Demo)",
        "url": "https://example.com/fed-interest-rates",
        "hours_ago": 2,
        "sentiment": "NEUTRAL",
        "symbols": ["^GSPC", "^IXIC", "AAPL", "MSFT"],
        "category": "Economy",
    },
    {
        "id": "news-2",
        "title": "NVIDIA Unveils Next-Gen AI Architecture Expanding Enterprise Dominance",
        "summary": "NVIDIA announced high-performance GPU architectures designed for massive generative AI training workloads, signaling robust order books and demand momentum.",
        "source": "FinSight Tech Dispatch (Demo)",
        "url": "https://example.com/nvidia-ai-chipset",
        "hours_ago": 5,
        "sentiment": "POSITIVE",
        "symbols": ["NVDA", "MSFT", "GOOGL"],
        "category": "Technology",
    },
    {
        "id": "news-3",
        "title": "RBI Keeps Repo Rate Unchanged at 6.50% Citing Resilient GDP Growth",
        "summary": "The Reserve Bank of India maintained policy stability while reiterating its commitment to durable inflation alignment and sustained economic expansion.",
        "source": "FinSight India Markets (Demo)",
        "url": "https://example.com/rbi-monetary-policy",
        "hours_ago": 8,
        "sentiment": "POSITIVE",
        "symbols": ["^NSEI", "^BSESN", "HDFCBANK.NS", "SBIN.NS", "ICICIBANK.NS"],
        "category": "Banking",
    },
    {
        "id": "news-4",
        "title": "Reliance Industries Announces Major Green Energy Investment Milestone",
        "summary": "Reliance Industries detailed expansion timelines for its integrated solar giga-factories and clean hydrogen ecosystems, strengthening long-term value creation.",
        "source": "FinSight Energy Chronicle (Demo)",
        "url": "https://example.com/reliance-green-energy",
        "hours_ago": 12,
        "sentiment": "POSITIVE",
        "symbols": ["RELIANCE.NS", "^NSEI"],
        "category": "Energy",
    },
    {
        "id": "news-5",
        "title": "Apple Services Revenue Hits All-Time High as Device Installed Base Expands",
        "summary": "Apple posted record cloud, App Store, and services turnover, offsetting modest cyclical deceleration in hardware product upgrades across emerging markets.",
        "source": "FinSight Tech Dispatch (Demo)",
        "url": "https://example.com/apple-services-revenue",
        "hours_ago": 14,
        "sentiment": "POSITIVE",
        "symbols": ["AAPL"],
        "category": "Earnings",
    },
    {
        "id": "news-6",
        "title": "Tata Motors Records Robust EV Deliveries and Commercial Fleet Expansion",
        "summary": "Tata Motors sustained passenger vehicle market leadership in electric mobility, while commercial vehicle margins rebounded on supply chain stabilization.",
        "source": "FinSight Auto Intelligence (Demo)",
        "url": "https://example.com/tata-motors-deliveries",
        "hours_ago": 18,
        "sentiment": "POSITIVE",
        "symbols": ["TATAMOTORS.NS"],
        "category": "Automotive",
    },
    {
        "id": "news-7",
        "title": "Global Tech Hardware Facing Mixed Near-Term Supply Chain Headwinds",
        "summary": "Semiconductor packaging bottlenecks and currency fluctuations lead analysts to project cautious margin guidance for consumer electronics makers.",
        "source": "FinSight Market Review (Demo)",
        "url": "https://example.com/tech-supply-chain",
        "hours_ago": 24,
        "sentiment": "NEGATIVE",
        "symbols": ["TSLA", "AAPL", "AMZN"],
        "category": "Technology",
    },
    {
        "id": "news-8",
        "title": "TCS and Infosys Accelerate Cloud & Enterprise AI Contract Inflows",
        "summary": "Indian IT bellwethers TCS and Infosys reported multi-year enterprise transformation bookings, reflecting renewed IT spending from Fortune 500 customers.",
        "source": "FinSight Corporate Wire (Demo)",
        "url": "https://example.com/it-sector-deals",
        "hours_ago": 30,
        "sentiment": "POSITIVE",
        "symbols": ["TCS.NS", "INFY.NS", "^NSEI"],
        "category": "Technology",
    },
    {
        "id": "news-9",
        "title": "Crude Oil Price Softens Providing Inflation Relief for Net Importers",
        "summary": "Brent crude dipped below recent highs amidst rising inventory stockpiles, easing fuel inflation pressures for consumer staples and manufacturing firms.",
        "source": "FinSight Commodities (Demo)",
        "url": "https://example.com/crude-oil-easing",
        "hours_ago": 36,
        "sentiment": "NEUTRAL",
        "symbols": ["ITC.NS", "RELIANCE.NS"],
        "category": "Economy",
    },
    {
        "id": "news-10",
        "title": "Microsoft Cloud Azure Surpasses Analyst Expectations on Enterprise AI Lift",
        "summary": "Enterprise adoption of Microsoft Copilot integrations spurred Azure cloud consumption growth, driving robust quarterly free cash flow generation.",
        "source": "FinSight Tech Dispatch (Demo)",
        "url": "https://example.com/microsoft-azure-growth",
        "hours_ago": 42,
        "sentiment": "POSITIVE",
        "symbols": ["MSFT", "GOOGL"],
        "category": "Earnings",
    },
]


class NewsService:
    def get_news(
        self,
        symbol: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 20,
    ) -> List[NewsArticle]:
        now = datetime.now(timezone.utc)
        articles: List[NewsArticle] = []

        for item in SAMPLE_ARTICLES:
            pub_time = now - timedelta(hours=item["hours_ago"])
            article = NewsArticle(
                id=item["id"],
                title=item["title"],
                summary=item["summary"],
                source=item["source"],
                url=item["url"],
                published_at=pub_time,
                sentiment=item["sentiment"],
                symbols=item["symbols"],
                category=item["category"],
            )
            articles.append(article)

        # Filtering
        filtered = articles
        if symbol:
            sym_clean = symbol.upper().strip()
            matched = [
                a for a in filtered
                if any(sym_clean == s.upper() or sym_clean in s.upper() for s in a.symbols)
            ]
            if matched:
                filtered = matched
            else:
                # Dynamically generate realistic sample news for this symbol
                dynamic_article = NewsArticle(
                    id=f"demo-{uuid.uuid4().hex[:8]}",
                    title=f"{sym_clean} Reports Solid Operational Progress in Latest Quarterly Review",
                    summary=f"Market analysts note disciplined execution and capital efficiency for {sym_clean} amid shifting broader industry trends.",
                    source="FinSight Market Wire (Sample)",
                    url=f"https://example.com/news/{sym_clean.lower()}",
                    published_at=now - timedelta(hours=3),
                    sentiment="POSITIVE",
                    symbols=[sym_clean],
                    category=category or "Market",
                )
                filtered = [dynamic_article] + [a for a in filtered if a.category == "Economy"]

        if category:
            cat_clean = category.strip().lower()
            filtered = [
                a for a in filtered
                if a.category and a.category.lower() == cat_clean
            ] or filtered

        return filtered[:limit]


news_service = NewsService()

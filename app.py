"""
Pump.fun Protocol Analytics Dashboard
Senior Data Analyst Portfolio — Built by Ryan
Streamlit + Dune Analytics API + CoinGecko + DeFiLlama
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import requests
import time
import os
from datetime import datetime, timedelta

# ─── Page Config ───────────────────────────────────────────────
st.set_page_config(
    page_title="Pump.fun Protocol Analytics",
    page_icon="https://pump.fun/favicon.ico",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─── Premium CSS ───────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

    /* ── Base ── */
    .stApp {
        background: #06060b;
        font-family: 'Inter', -apple-system, sans-serif;
    }
    section[data-testid="stSidebar"] {
        background: #0a0a12;
        border-right: 1px solid rgba(124,58,237,0.1);
    }
    .block-container { padding-top: 2rem; max-width: 1400px; }

    /* ── Hide Streamlit chrome ── */
    #MainMenu, header[data-testid="stHeader"], footer { visibility: hidden; }

    /* ── Animated Hero ── */
    .hero-container {
        position: relative;
        padding: 48px 0 40px;
        margin: -2rem -1rem 0;
        overflow: hidden;
    }
    .hero-bg {
        position: absolute; inset: 0;
        background:
            radial-gradient(ellipse 80% 60% at 20% 0%, rgba(124,58,237,0.12), transparent 70%),
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(6,182,212,0.08), transparent 70%),
            radial-gradient(ellipse 40% 30% at 50% 100%, rgba(239,68,68,0.05), transparent 60%);
        animation: heroPulse 8s ease-in-out infinite alternate;
    }
    @keyframes heroPulse {
        0% { opacity: 0.7; transform: scale(1); }
        100% { opacity: 1; transform: scale(1.02); }
    }
    .hero-content { position: relative; padding: 0 1rem; }

    .hero-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 10px; font-weight: 700; letter-spacing: 2.5px;
        text-transform: uppercase; color: #a78bfa;
        background: rgba(124,58,237,0.08);
        border: 1px solid rgba(124,58,237,0.2);
        padding: 6px 14px; border-radius: 100px;
        margin-bottom: 20px;
        animation: fadeSlideIn 0.6s ease-out;
    }
    .hero-eyebrow .dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 6px #22c55e;
        animation: livePulse 2s infinite;
    }
    @keyframes livePulse {
        0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; }
        50% { opacity: 0.4; box-shadow: 0 0 12px #22c55e; }
    }

    .hero-title {
        font-size: clamp(2rem, 4.5vw, 3.2rem);
        font-weight: 900; letter-spacing: -0.04em;
        line-height: 1.1; margin-bottom: 12px;
        background: linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #06b6d4 100%);
        background-size: 200% 200%;
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientShift 6s ease infinite, fadeSlideIn 0.8s ease-out;
    }
    @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .hero-sub {
        font-size: 0.95rem; color: #6b6b88;
        max-width: 640px; line-height: 1.7;
        animation: fadeSlideIn 1s ease-out;
    }
    .hero-sub strong { color: #8888a0; }

    .hero-pills {
        display: flex; gap: 10px; flex-wrap: wrap;
        margin-top: 20px;
        animation: fadeSlideIn 1.2s ease-out;
    }
    .hero-pill {
        font-size: 11px; font-weight: 600;
        color: #55556a; background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        padding: 5px 12px; border-radius: 6px;
        font-family: 'JetBrains Mono', monospace;
    }
    .hero-pill code { color: #a78bfa; background: none; padding: 0; }

    /* ── Metric Cards ── */
    .kpi-row {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 12px; margin: 24px 0 28px;
    }
    @media (max-width: 900px) { .kpi-row { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 600px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }

    .kpi {
        background: linear-gradient(135deg, rgba(20,20,32,0.9), rgba(20,20,32,0.6));
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.04);
        border-radius: 14px; padding: 18px 16px;
        text-align: center; position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .kpi:hover {
        border-color: rgba(124,58,237,0.3);
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(124,58,237,0.08);
    }
    .kpi::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent);
        opacity: 0; transition: opacity 0.3s;
    }
    .kpi:hover::before { opacity: 1; }

    .kpi .icon { font-size: 18px; margin-bottom: 6px; opacity: 0.7; }
    .kpi .val {
        font-size: 1.6rem; font-weight: 800;
        color: #fff; letter-spacing: -0.03em;
        line-height: 1.2;
    }
    .kpi .lbl {
        font-size: 0.65rem; font-weight: 600;
        color: #44445a; text-transform: uppercase;
        letter-spacing: 0.8px; margin-top: 4px;
    }
    .kpi .delta {
        font-size: 0.7rem; font-weight: 600;
        margin-top: 4px;
        font-family: 'JetBrains Mono', monospace;
    }
    .kpi .delta.up { color: #22c55e; }
    .kpi .delta.down { color: #ef4444; }

    .kpi.glow-purple { border-color: rgba(124,58,237,0.15); }
    .kpi.glow-purple .val { color: #a78bfa; }
    .kpi.glow-purple::after {
        content: ''; position: absolute; inset: -1px;
        border-radius: 14px; z-index: -1;
        background: linear-gradient(135deg, rgba(124,58,237,0.06), transparent 60%);
    }
    .kpi.glow-green .val { color: #22c55e; }
    .kpi.glow-cyan .val { color: #06b6d4; }

    /* ── Section Headers ── */
    .sec-head {
        font-size: 1.3rem; font-weight: 800;
        letter-spacing: -0.03em; color: #e8e8f0;
        margin-bottom: 2px;
        display: flex; align-items: center; gap: 10px;
    }
    .sec-head .accent-line {
        flex: 1; height: 1px;
        background: linear-gradient(90deg, rgba(124,58,237,0.3), transparent);
    }
    .sec-desc {
        font-size: 0.85rem; color: #55556a;
        margin-bottom: 20px;
    }

    /* ── Chart Cards ── */
    .chart-card {
        background: rgba(14,14,22,0.8);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.04);
        border-radius: 14px; padding: 20px;
        margin-bottom: 16px;
        transition: border-color 0.3s;
    }
    .chart-card:hover { border-color: rgba(124,58,237,0.15); }
    .chart-card h4 {
        font-size: 0.8rem; font-weight: 600;
        color: #8888a0; text-transform: uppercase;
        letter-spacing: 0.5px; margin-bottom: 12px;
    }

    /* ── Tabs ── */
    .stTabs [data-baseweb="tab-list"] {
        gap: 4px;
        background: rgba(14,14,22,0.6);
        border-radius: 12px; padding: 4px;
        border: 1px solid rgba(255,255,255,0.04);
    }
    .stTabs [data-baseweb="tab"] {
        background: transparent;
        border: none; border-radius: 8px;
        color: #55556a; padding: 10px 18px;
        font-weight: 600; font-size: 0.85rem;
        transition: all 0.2s;
    }
    .stTabs [data-baseweb="tab"]:hover { color: #8888a0; background: rgba(255,255,255,0.03); }
    .stTabs [aria-selected="true"] {
        background: rgba(124,58,237,0.12) !important;
        color: #a78bfa !important;
        box-shadow: 0 2px 8px rgba(124,58,237,0.1);
    }
    .stTabs [data-baseweb="tab-highlight"] { display: none; }
    .stTabs [data-baseweb="tab-border"] { display: none; }

    /* ── DataFrames ── */
    div[data-testid="stDataFrame"] {
        border: 1px solid rgba(255,255,255,0.04);
        border-radius: 14px; overflow: hidden;
    }

    /* ── Metrics ── */
    div[data-testid="stMetric"] {
        background: rgba(14,14,22,0.8);
        border: 1px solid rgba(255,255,255,0.04);
        border-radius: 14px; padding: 16px;
        backdrop-filter: blur(12px);
    }

    /* ── Insight Cards ── */
    .insight-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    @media (max-width: 900px) { .insight-grid { grid-template-columns: 1fr; } }
    .insight {
        background: rgba(14,14,22,0.8);
        border: 1px solid rgba(255,255,255,0.04);
        border-radius: 14px; padding: 20px;
        backdrop-filter: blur(12px);
        transition: all 0.3s;
    }
    .insight:hover {
        border-color: rgba(124,58,237,0.2);
        transform: translateY(-2px);
    }
    .insight .tag {
        font-size: 10px; font-weight: 700;
        letter-spacing: 1.5px; text-transform: uppercase;
        color: #7c3aed; margin-bottom: 8px;
    }
    .insight h4 { color: #e8e8f0; font-size: 0.95rem; margin-bottom: 6px; }
    .insight p { color: #6b6b88; font-size: 0.8rem; line-height: 1.6; }
    .insight strong { color: #a78bfa; }

    /* ── Footer ── */
    .footer {
        text-align: center; padding: 40px 0 20px;
        border-top: 1px solid rgba(255,255,255,0.04);
        margin-top: 40px;
    }
    .footer p { color: #44445a; font-size: 0.8rem; }
    .footer a { color: #7c3aed; text-decoration: none; }
    .footer strong { color: #8888a0; }
    .footer .sub { font-size: 0.7rem; color: #33334a; margin-top: 4px; }
    .footer .tech-stack {
        display: flex; gap: 8px; justify-content: center;
        flex-wrap: wrap; margin-top: 12px;
    }
    .footer .tech-pill {
        font-size: 10px; font-weight: 600;
        color: #55556a; background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        padding: 3px 10px; border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
    }

    /* ── Dividers ── */
    hr { border-color: rgba(255,255,255,0.04) !important; margin: 24px 0 !important; }

    /* ── Warning/Info boxes ── */
    div[data-testid="stAlert"] {
        background: rgba(14,14,22,0.8);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
    }
</style>
""", unsafe_allow_html=True)

# ─── Constants ─────────────────────────────────────────────────
DUNE_API_KEY = os.environ.get("DUNE_API_KEY", "") or st.secrets.get("DUNE_API_KEY", "")
DUNE_BASE = "https://api.dune.com/api/v1"

PURPLE = "#7c3aed"
PURPLE_LT = "#a78bfa"
GREEN = "#22c55e"
RED = "#ef4444"
BLUE = "#3b82f6"
YELLOW = "#eab308"
CYAN = "#06b6d4"
ORANGE = "#f97316"
PINK = "#ec4899"

# Plotly theme
def chart_layout(height=380):
    return dict(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Inter, sans-serif", color="#55556a", size=11),
        margin=dict(l=48, r=16, t=36, b=40),
        xaxis=dict(
            gridcolor="rgba(255,255,255,0.03)", showgrid=False,
            zeroline=False, linecolor="rgba(255,255,255,0.04)",
        ),
        yaxis=dict(
            gridcolor="rgba(255,255,255,0.04)", zeroline=False,
            linecolor="rgba(255,255,255,0.04)",
        ),
        legend=dict(
            bgcolor="rgba(0,0,0,0)", font=dict(size=10, color="#6b6b88"),
            orientation="h", yanchor="bottom", y=1.02, xanchor="left", x=0,
        ),
        hoverlabel=dict(
            bgcolor="#141420", bordercolor="#2d2d4a",
            font=dict(color="#e8e8f0", size=12, family="Inter"),
        ),
        height=height,
    )


def apply_chart(fig, height=380):
    fig.update_layout(**chart_layout(height))
    return fig


# ─── Dune API Client ──────────────────────────────────────────
class DuneClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {"X-Dune-API-Key": api_key}

    def execute_sql(self, sql: str) -> pd.DataFrame:
        url = f"{DUNE_BASE}/query/execute/sql"
        resp = requests.post(url, headers=self.headers, json={"query_sql": sql})
        resp.raise_for_status()
        eid = resp.json().get("execution_id")
        if not eid:
            return pd.DataFrame()
        return self._poll(eid)

    def _poll(self, eid: str, timeout: int = 300) -> pd.DataFrame:
        url = f"{DUNE_BASE}/execution/{eid}/results"
        t0 = time.time()
        while time.time() - t0 < timeout:
            r = requests.get(url, headers=self.headers)
            r.raise_for_status()
            d = r.json()
            if d.get("state") == "QUERY_STATE_COMPLETED":
                return pd.DataFrame(d.get("result", {}).get("rows", []))
            if d.get("state") in ("QUERY_STATE_FAILED", "QUERY_STATE_CANCELLED"):
                return pd.DataFrame()
            time.sleep(3)
        return pd.DataFrame()


# ─── External APIs ─────────────────────────────────────────────
@st.cache_data(ttl=300)
def get_sol_price():
    try:
        r = requests.get(
            "https://api.coingecko.com/api/v3/simple/price",
            params={"ids": "solana", "vs_currencies": "usd", "include_24hr_change": "true",
                    "include_24hr_vol": "true", "include_market_cap": "true"},
            timeout=10,
        )
        d = r.json().get("solana", {})
        return {
            "price": d.get("usd", 0),
            "change_24h": d.get("usd_24h_change", 0),
            "vol_24h": d.get("usd_24h_vol", 0),
            "mcap": d.get("usd_market_cap", 0),
        }
    except Exception:
        return {"price": 0, "change_24h": 0, "vol_24h": 0, "mcap": 0}


@st.cache_data(ttl=300)
def get_sol_history(days=30):
    try:
        r = requests.get(
            "https://api.coingecko.com/api/v3/coins/solana/market_chart",
            params={"vs_currency": "usd", "days": days, "interval": "daily"}, timeout=10,
        )
        p = r.json().get("prices", [])
        df = pd.DataFrame(p, columns=["ts", "price"])
        df["date"] = pd.to_datetime(df["ts"], unit="ms").dt.date
        return df
    except Exception:
        return pd.DataFrame()


@st.cache_data(ttl=600)
def get_defillama_volume():
    try:
        r = requests.get("https://api.llama.fi/summary/dexs/pump-fun", timeout=10)
        if r.status_code == 200:
            return r.json()
    except Exception:
        pass
    return {}


# ─── Query Definitions ────────────────────────────────────────
QUERIES = {
    "daily_launches": """
        SELECT DATE_TRUNC('day', evt_block_time) AS day, COUNT(*) AS launches
        FROM pumpdotfun_solana.pump_evt_createevent
        WHERE evt_block_date >= CURRENT_DATE - INTERVAL '{days}' DAY
        GROUP BY 1 ORDER BY 1
    """,
    "daily_volume": """
        SELECT
            DATE_TRUNC('day', evt_block_time) AS day,
            SUM(sol_amount / 1e9) AS volume_sol,
            SUM(CASE WHEN is_buy THEN sol_amount / 1e9 ELSE 0 END) AS buy_vol,
            SUM(CASE WHEN NOT is_buy THEN sol_amount / 1e9 ELSE 0 END) AS sell_vol,
            COUNT(*) AS trades,
            COUNT(DISTINCT "user") AS unique_traders
        FROM pumpdotfun_solana.pump_evt_tradeevent
        WHERE evt_block_date >= CURRENT_DATE - INTERVAL '{days}' DAY
        GROUP BY 1 ORDER BY 1
    """,
    "graduation_rate": """
        WITH c AS (
            SELECT DATE_TRUNC('day', evt_block_time) AS day, COUNT(*) AS n
            FROM pumpdotfun_solana.pump_evt_createevent
            WHERE evt_block_date >= CURRENT_DATE - INTERVAL '{days}' DAY GROUP BY 1
        ), g AS (
            SELECT DATE_TRUNC('day', evt_block_time) AS day, COUNT(*) AS n
            FROM pumpdotfun_solana.pump_evt_completeevent
            WHERE evt_block_date >= CURRENT_DATE - INTERVAL '{days}' DAY GROUP BY 1
        )
        SELECT c.day, c.n AS launches, COALESCE(g.n,0) AS graduations,
               ROUND(COALESCE(g.n,0)*100.0/NULLIF(c.n,0),2) AS grad_rate
        FROM c LEFT JOIN g ON c.day=g.day ORDER BY 1
    """,
    "fee_revenue": """
        SELECT DATE_TRUNC('day', evt_block_time) AS day,
            SUM(sol_amount*0.01/1e9) AS protocol_fees,
            SUM(creator_fee_sol_amount/1e9) AS creator_fees,
            SUM((sol_amount*0.01+creator_fee_sol_amount)/1e9) AS total_fees
        FROM pumpdotfun_solana.pump_evt_tradeevent
        WHERE evt_block_date >= CURRENT_DATE - INTERVAL '{days}' DAY
        GROUP BY 1 ORDER BY 1
    """,
    "trade_size_dist": """
        WITH s AS (
            SELECT CASE
                WHEN sol_amount/1e9<0.1 THEN '< 0.1 SOL'
                WHEN sol_amount/1e9<0.5 THEN '0.1-0.5'
                WHEN sol_amount/1e9<1 THEN '0.5-1'
                WHEN sol_amount/1e9<5 THEN '1-5'
                WHEN sol_amount/1e9<10 THEN '5-10'
                WHEN sol_amount/1e9<50 THEN '10-50'
                ELSE '50+'
            END AS bucket, sol_amount/1e9 AS amt
            FROM pumpdotfun_solana.pump_evt_tradeevent
            WHERE evt_block_date >= CURRENT_DATE - INTERVAL '7' DAY
        )
        SELECT bucket, COUNT(*) AS cnt,
            ROUND(SUM(amt),2) AS vol,
            ROUND(COUNT(*)*100.0/SUM(COUNT(*)) OVER(),2) AS pct_trades,
            ROUND(SUM(amt)*100.0/SUM(SUM(amt)) OVER(),2) AS pct_vol
        FROM s GROUP BY 1
        ORDER BY CASE bucket WHEN '< 0.1 SOL' THEN 1 WHEN '0.1-0.5' THEN 2
            WHEN '0.5-1' THEN 3 WHEN '1-5' THEN 4 WHEN '5-10' THEN 5
            WHEN '10-50' THEN 6 ELSE 7 END
    """,
    "token_survival": """
        WITH tl AS (
            SELECT c.mint,
                DATE_DIFF('minute', MIN(c.evt_block_time), MAX(t.evt_block_time)) AS life_min
            FROM pumpdotfun_solana.pump_evt_createevent c
            LEFT JOIN pumpdotfun_solana.pump_evt_tradeevent t
                ON c.mint=t.mint AND t.evt_block_date >= CURRENT_DATE - INTERVAL '14' DAY
            WHERE c.evt_block_date >= CURRENT_DATE - INTERVAL '14' DAY
            GROUP BY 1
        )
        SELECT CASE
            WHEN life_min IS NULL OR life_min<5 THEN '< 5 min'
            WHEN life_min<30 THEN '5-30 min' WHEN life_min<60 THEN '30-60 min'
            WHEN life_min<360 THEN '1-6 hr' WHEN life_min<1440 THEN '6-24 hr'
            WHEN life_min<4320 THEN '1-3 days' ELSE '3+ days'
        END AS bucket, COUNT(*) AS tokens,
            ROUND(COUNT(*)*100.0/SUM(COUNT(*)) OVER(),2) AS pct
        FROM tl GROUP BY 1
        ORDER BY CASE bucket WHEN '< 5 min' THEN 1 WHEN '5-30 min' THEN 2
            WHEN '30-60 min' THEN 3 WHEN '1-6 hr' THEN 4 WHEN '6-24 hr' THEN 5
            WHEN '1-3 days' THEN 6 ELSE 7 END
    """,
    "bonding_curve": """
        WITH mr AS (
            SELECT mint, MAX(real_sol_reserves/1e9) AS max_r
            FROM pumpdotfun_solana.pump_evt_tradeevent
            WHERE evt_block_date >= CURRENT_DATE - INTERVAL '14' DAY GROUP BY 1
        )
        SELECT CASE
            WHEN max_r<1 THEN '< 1 SOL' WHEN max_r<5 THEN '1-5'
            WHEN max_r<15 THEN '5-15' WHEN max_r<30 THEN '15-30'
            WHEN max_r<50 THEN '30-50' WHEN max_r<79 THEN '50-79'
            ELSE '79+ (grad)'
        END AS bucket, COUNT(*) AS tokens,
            ROUND(COUNT(*)*100.0/SUM(COUNT(*)) OVER(),2) AS pct
        FROM mr GROUP BY 1
        ORDER BY CASE bucket WHEN '< 1 SOL' THEN 1 WHEN '1-5' THEN 2
            WHEN '5-15' THEN 3 WHEN '15-30' THEN 4 WHEN '30-50' THEN 5
            WHEN '50-79' THEN 6 ELSE 7 END
    """,
    "top_traders_pnl": """
        WITH tp AS (
            SELECT "user" AS trader,
                SUM(CASE WHEN NOT is_buy THEN sol_amount/1e9 ELSE 0 END) AS recv,
                SUM(CASE WHEN is_buy THEN sol_amount/1e9 ELSE 0 END) AS spent,
                COUNT(DISTINCT mint) AS tokens, COUNT(*) AS trades
            FROM pumpdotfun_solana.pump_evt_tradeevent
            WHERE evt_block_date >= CURRENT_DATE - INTERVAL '7' DAY
            GROUP BY 1 HAVING SUM(CASE WHEN is_buy THEN sol_amount/1e9 ELSE 0 END) > 10
        )
        SELECT trader, ROUND(recv-spent,2) AS pnl,
            ROUND((recv-spent)*100.0/NULLIF(spent,0),1) AS roi,
            ROUND(spent,2) AS spent, ROUND(recv,2) AS received, tokens, trades
        FROM tp ORDER BY pnl DESC LIMIT 20
    """,
    "whale_tracker": """
        SELECT "user" AS trader,
            ROUND(SUM(sol_amount/1e9),2) AS volume,
            ROUND(SUM(CASE WHEN NOT is_buy THEN sol_amount/1e9 ELSE 0 END)
                - SUM(CASE WHEN is_buy THEN sol_amount/1e9 ELSE 0 END),2) AS pnl,
            COUNT(DISTINCT mint) AS tokens, COUNT(*) AS trades,
            ROUND(SUM(CASE WHEN is_buy THEN 1 ELSE 0 END)*100.0/COUNT(*),1) AS buy_pct
        FROM pumpdotfun_solana.pump_evt_tradeevent
        WHERE evt_block_date >= CURRENT_DATE - INTERVAL '7' DAY
        GROUP BY 1 ORDER BY volume DESC LIMIT 20
    """,
    "sandwich_detection": """
        WITH pt AS (
            SELECT block_slot, block_time, trader_id, project_main_id,
                token_bought_mint_address, token_sold_mint_address,
                amount_usd, tx_id, tx_index, outer_instruction_index
            FROM dex_solana.trades
            WHERE project='pump_fun' AND block_date >= CURRENT_DATE - INTERVAL '7' DAY
        ),
        sc AS (
            SELECT f.block_time, f.block_slot, f.trader_id AS bot,
                f.amount_usd AS f_usd, b.amount_usd AS b_usd
            FROM pt f JOIN pt b
                ON f.block_slot=b.block_slot AND f.trader_id=b.trader_id
                AND f.tx_id!=b.tx_id AND f.project_main_id=b.project_main_id
                AND f.token_sold_mint_address=b.token_bought_mint_address
                AND f.token_bought_mint_address=b.token_sold_mint_address
                AND (f.tx_index<b.tx_index OR (f.tx_index=b.tx_index
                    AND f.outer_instruction_index<b.outer_instruction_index))
        )
        SELECT DATE_TRUNC('day', block_time) AS day,
            COUNT(*) AS attacks, COUNT(DISTINCT bot) AS bots,
            ROUND(SUM(f_usd+b_usd),2) AS vol_usd
        FROM sc GROUP BY 1 ORDER BY 1
    """,
    "bot_activity": """
        SELECT DATE_TRUNC('day', block_time) AS day, name AS bot,
            COUNT(*) AS trades, ROUND(SUM(amount_usd),2) AS vol_usd
        FROM dex_solana.bot_trades
        WHERE project='pump_fun' AND block_date >= CURRENT_DATE - INTERVAL '{days}' DAY
        GROUP BY 1, 2 ORDER BY 1, vol_usd DESC
    """,
    "hourly_pattern": """
        SELECT HOUR(evt_block_time) AS hr, COUNT(*) AS trades,
            SUM(sol_amount/1e9) AS vol, COUNT(DISTINCT "user") AS traders
        FROM pumpdotfun_solana.pump_evt_tradeevent
        WHERE evt_block_date >= CURRENT_DATE - INTERVAL '7' DAY
        GROUP BY 1 ORDER BY 1
    """,
    "price_impact": """
        SELECT DATE_TRUNC('day', evt_block_time) AS day,
            APPROX_PERCENTILE(ABS(sol_amount*1.0/NULLIF(virtual_sol_reserves,0))*100, 0.5) AS med,
            APPROX_PERCENTILE(ABS(sol_amount*1.0/NULLIF(virtual_sol_reserves,0))*100, 0.95) AS p95,
            APPROX_PERCENTILE(ABS(sol_amount*1.0/NULLIF(virtual_sol_reserves,0))*100, 0.99) AS p99
        FROM pumpdotfun_solana.pump_evt_tradeevent
        WHERE evt_block_date >= CURRENT_DATE - INTERVAL '{days}' DAY AND virtual_sol_reserves>0
        GROUP BY 1 ORDER BY 1
    """,
    "creator_leaderboard": """
        SELECT c.name, c.symbol,
            ROUND(SUM(t.creator_fee_sol_amount/1e9),2) AS fees_sol,
            ROUND(SUM(t.sol_amount/1e9),2) AS vol_sol, COUNT(*) AS trades
        FROM pumpdotfun_solana.pump_evt_tradeevent t
        JOIN pumpdotfun_solana.pump_evt_createevent c ON t.mint=c.mint
            AND c.evt_block_date >= CURRENT_DATE - INTERVAL '7' DAY
        WHERE t.evt_block_date >= CURRENT_DATE - INTERVAL '7' DAY
        GROUP BY 1, 2 ORDER BY fees_sol DESC LIMIT 20
    """,
    "new_vs_returning": """
        WITH fs AS (
            SELECT "user", MIN(DATE_TRUNC('day', evt_block_time)) AS first_day
            FROM pumpdotfun_solana.pump_evt_tradeevent
            WHERE evt_block_date >= CURRENT_DATE - INTERVAL '60' DAY GROUP BY 1
        ),
        dt AS (
            SELECT DATE_TRUNC('day', t.evt_block_time) AS day, t."user", f.first_day
            FROM pumpdotfun_solana.pump_evt_tradeevent t
            JOIN fs f ON t."user"=f."user"
            WHERE t.evt_block_date >= CURRENT_DATE - INTERVAL '{days}' DAY
        )
        SELECT day,
            COUNT(DISTINCT CASE WHEN day=first_day THEN "user" END) AS new_traders,
            COUNT(DISTINCT CASE WHEN day!=first_day THEN "user" END) AS returning_traders
        FROM dt GROUP BY 1 ORDER BY 1
    """,
}

# ─── Data Loading ──────────────────────────────────────────────
@st.cache_data(ttl=600, show_spinner=False)
def run_q(sql):
    if not DUNE_API_KEY:
        return pd.DataFrame()
    return DuneClient(DUNE_API_KEY).execute_sql(sql)

def load(key, days=30):
    return run_q(QUERIES[key].format(days=days))

def shorten(addr):
    s = str(addr or "")
    return f"{s[:6]}...{s[-4:]}" if len(s) > 10 else s

# ─── KPI Card Builder ─────────────────────────────────────────
def kpi(icon, val, label, cls="", delta=None):
    delta_html = ""
    if delta is not None:
        d_cls = "up" if delta >= 0 else "down"
        d_sign = "+" if delta >= 0 else ""
        delta_html = f'<div class="delta {d_cls}">{d_sign}{delta:.1f}%</div>'
    return (
        f'<div class="kpi {cls}">'
        f'<div class="icon">{icon}</div>'
        f'<div class="val">{val}</div>'
        f'<div class="lbl">{label}</div>'
        f'{delta_html}'
        f'</div>'
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  HERO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

st.markdown("""
<div class="hero-container">
    <div class="hero-bg"></div>
    <div class="hero-content">
        <div class="hero-eyebrow"><span class="dot"></span> LIVE PROTOCOL INTELLIGENCE</div>
        <div class="hero-title">Pump.fun Analytics</div>
        <p class="hero-sub">
            Deep on-chain analysis of the <strong>largest memecoin launchpad on Solana</strong>.
            Real-time data from decoded contract events, curated Dune spells, and external APIs.
        </p>
        <div class="hero-pills">
            <span class="hero-pill"><code>15</code> DuneSQL queries</span>
            <span class="hero-pill"><code>5</code> decoded tables</span>
            <span class="hero-pill"><code>3</code> data sources</span>
            <span class="hero-pill">MEV detection</span>
            <span class="hero-pill">PumpSwap AMM</span>
            <span class="hero-pill">Project Ascend fees</span>
            <span class="hero-pill">Buyback economics</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# ─── Sidebar ───────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### Configuration")
    days = st.selectbox("Time Range", [7, 14, 30, 60, 90], index=2, format_func=lambda x: f"{x} Days")
    st.divider()
    st.markdown("### Data Pipeline")
    st.code("pumpdotfun_solana.pump_evt_*\ndex_solana.trades\ndex_solana.bot_trades\nCoinGecko API\nDeFiLlama API", language="text")
    st.divider()
    st.markdown("### Methodology")
    st.markdown(
        "**Sandwich Detection:** Same-slot front/back pairs, identical sender, reversed token dirs.\n\n"
        "**Token Survival:** `date_diff` between create event and last trade per mint.\n\n"
        "**Price Impact:** `sol_amount / virtual_sol_reserves` at execution time.\n\n"
        "**PnL:** Net SOL received minus spent per wallet."
    )
    st.divider()
    st.caption("Built by Ryan")


# ─── Load Data ─────────────────────────────────────────────────
if not DUNE_API_KEY:
    st.info("Set `DUNE_API_KEY` environment variable for live data. Showing layout preview.")

with st.spinner("Querying Dune Analytics..."):
    D = {}
    for k in ["daily_volume", "graduation_rate", "daily_launches", "fee_revenue",
              "trade_size_dist", "token_survival", "bonding_curve", "hourly_pattern", "price_impact"]:
        D[k] = load(k, days) if DUNE_API_KEY else pd.DataFrame()

sol = get_sol_price()
sol_hist = get_sol_history(days)
defillama = get_defillama_volume()

# ─── KPI Row ───────────────────────────────────────────────────
vol_df = D.get("daily_volume", pd.DataFrame())
grad_df = D.get("graduation_rate", pd.DataFrame())
fee_df = D.get("fee_revenue", pd.DataFrame())
launch_df = D.get("daily_launches", pd.DataFrame())

if not vol_df.empty:
    _avg_l = f"{int(launch_df['launches'].mean()):,}" if not launch_df.empty else "—"
    _avg_v = f"{vol_df['volume_sol'].mean():,.0f}"
    _avg_t = f"{vol_df['unique_traders'].mean():,.0f}"
    _avg_tr = f"{vol_df['trades'].mean():,.0f}"
else:
    _avg_l, _avg_v, _avg_t, _avg_tr = "~30K", "~1.1M", "~170K", "~5M"

_avg_g = f"{grad_df['grad_rate'].mean():.1f}%" if not grad_df.empty else "~1%"
_avg_f = f"{fee_df['total_fees'].mean():,.0f}" if not fee_df.empty else "~13K"
_sol_p = f"${sol['price']:,.2f}" if sol['price'] else "—"

st.markdown(f"""
<div class="kpi-row">
    {kpi("🚀", _avg_l, "Avg Daily Launches")}
    {kpi("💎", _avg_v, "Avg Daily Vol (SOL)")}
    {kpi("🎓", _avg_g, "Graduation Rate", "glow-purple")}
    {kpi("👥", _avg_t, "Avg Daily Traders")}
    {kpi("💰", _avg_f, "Avg Daily Fees (SOL)")}
    {kpi("◎", _sol_p, "SOL Price", "glow-cyan", sol['change_24h'] if sol['change_24h'] else None)}
</div>
""", unsafe_allow_html=True)

# ─── Executive Briefing ───────────────────────────────────────
st.markdown('<div class="sec-head">Executive Briefing <span class="accent-line"></span></div>', unsafe_allow_html=True)
st.markdown('<div class="sec-desc">Key narratives driving the Pump.fun ecosystem right now.</div>', unsafe_allow_html=True)

st.markdown("""
<div class="insight-grid">
    <div class="insight">
        <div class="tag">THE SUPER-APP PIVOT</div>
        <h4>Beyond Memecoins</h4>
        <p>Pump.fun's mobile app (1.5M+ downloads) now supports tokens from Raydium, Meteora,
        and wrapped BTC/ETH. The strategy: evolve from launchpad to <strong>Solana's default
        trading interface</strong>. PumpSwap hit <strong>$176.8B cumulative volume</strong> and
        74% of Solana DEX volume at peak.</p>
    </div>
    <div class="insight">
        <div class="tag">PROJECT ASCEND</div>
        <h4>Creator Fee Revolution</h4>
        <p>New sliding fees: <strong>0.95% under $300K mcap, 0.05% above $20M</strong>. First-week
        payouts hit $15.5M -- 183% more than the protocol's own take. The shift from extraction to
        <strong>creator-aligned incentives</strong> is Pump.fun's answer to competitors like Believe
        (2.58% grad rate) and LetsBonk.</p>
    </div>
    <div class="insight">
        <div class="tag">THE MEV TAX</div>
        <h4>$30M+ Bot Extraction</h4>
        <p>The notorious bot "arsc" extracted <strong>$30M+ in 2 months</strong> via sandwich attacks.
        Top 7 MEV bots hold 92.6% market share. A <strong>$500M class-action lawsuit</strong> names
        Pump.fun, Jito Labs, and Solana Foundation, alleging $4-5.5B in retail losses.</p>
    </div>
</div>
<div class="insight-grid" style="margin-top: 0;">
    <div class="insight">
        <div class="tag">BUYBACK MACHINE</div>
        <h4>$254M+ Token Buybacks</h4>
        <p><strong>98%+ of revenue</strong> goes to PUMP token buybacks, reducing circulating supply by ~20%.
        But the <strong>July 2026 unlock of 41% supply</strong> looms -- founders acquired tokens at near-zero
        cost. The buyback narrative vs. unlock cliff is the key tension.</p>
    </div>
    <div class="insight">
        <div class="tag">THE 0.8% CLUB</div>
        <h4>Graduation Funnel</h4>
        <p>Of ~30K daily launches, only <strong>0.8% graduate</strong> (~240 tokens). 56% die within
        5 minutes. 43.6% never reach 1 SOL in reserves. Solidus Labs reports a
        <strong>98.6% rug-pull rate</strong> -- 986 of every 1,000 tokens are scams.</p>
    </div>
    <div class="insight">
        <div class="tag">COMPETITIVE LANDSCAPE</div>
        <h4>Market Share Wars</h4>
        <p>Pump.fun clawed back to <strong>73-80% of Solana launches</strong> after dropping to 32%
        in July 2025. LetsBonk peaked at 65.9% daily share; Believe achieves higher graduation quality.
        Raydium launched LaunchLab in response to PumpSwap eating its volume.</p>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("---")

# ─── Tabs ──────────────────────────────────────────────────────
tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
    "Core Activity", "Trading Dynamics", "Revenue & Fees",
    "Protocol Health", "Trader Intelligence", "MEV & Sandwich",
])

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TAB 1: CORE ACTIVITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with tab1:
    st.markdown('<div class="sec-head">Core Activity <span class="accent-line"></span></div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-desc">11.9M+ tokens launched since Jan 2024. Revenue declined 75% YoY but Pump.fun maintains 73-80% of Solana launches. The mobile app (1.5M+ downloads) is expanding to multi-asset trading.</div>', unsafe_allow_html=True)

    c1, c2 = st.columns(2)
    with c1:
        st.markdown('<div class="chart-card"><h4>Daily Token Launches</h4></div>', unsafe_allow_html=True)
        if not launch_df.empty:
            fig = go.Figure(go.Bar(x=launch_df["day"], y=launch_df["launches"],
                marker=dict(color=launch_df["launches"],
                    colorscale=[[0, "rgba(124,58,237,0.3)"], [1, PURPLE]]),
                hovertemplate="%{x|%b %d}: <b>%{y:,.0f}</b> launches<extra></extra>"))
            fig.update_traces(marker_line_width=0)
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Connect Dune API for live data")

    with c2:
        st.markdown('<div class="chart-card"><h4>Daily Unique Traders</h4></div>', unsafe_allow_html=True)
        if not vol_df.empty:
            fig = go.Figure(go.Scatter(x=vol_df["day"], y=vol_df["unique_traders"],
                fill="tozeroy", line=dict(color=CYAN, width=2),
                fillcolor="rgba(6,182,212,0.08)",
                hovertemplate="%{x|%b %d}: <b>%{y:,.0f}</b> traders<extra></extra>"))
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Connect Dune API for live data")

    c3, c4 = st.columns(2)
    with c3:
        st.markdown('<div class="chart-card"><h4>Graduation Rate (%)</h4></div>', unsafe_allow_html=True)
        if not grad_df.empty:
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=grad_df["day"], y=grad_df["grad_rate"],
                fill="tozeroy", line=dict(color=YELLOW, width=2.5),
                fillcolor="rgba(234,179,8,0.06)",
                hovertemplate="%{x|%b %d}: <b>%{y:.2f}%</b><extra></extra>"))
            fig.update_yaxes(ticksuffix="%")
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Connect Dune API for live data")

    with c4:
        st.markdown('<div class="chart-card"><h4>Buy vs Sell Volume (SOL)</h4></div>', unsafe_allow_html=True)
        if not vol_df.empty:
            fig = go.Figure()
            fig.add_trace(go.Bar(x=vol_df["day"], y=vol_df["buy_vol"], name="Buy",
                marker_color=GREEN, opacity=0.75))
            fig.add_trace(go.Bar(x=vol_df["day"], y=vol_df["sell_vol"], name="Sell",
                marker_color=RED, opacity=0.75))
            fig.update_layout(barmode="stack")
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Connect Dune API for live data")

    # New vs Returning
    if DUNE_API_KEY:
        st.markdown('<div class="chart-card"><h4>New vs Returning Traders</h4></div>', unsafe_allow_html=True)
        nr = load("new_vs_returning", days)
        if not nr.empty:
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=nr["day"], y=nr["new_traders"], name="New",
                stackgroup="one", line=dict(width=0), fillcolor="rgba(124,58,237,0.4)"))
            fig.add_trace(go.Scatter(x=nr["day"], y=nr["returning_traders"], name="Returning",
                stackgroup="one", line=dict(width=0), fillcolor="rgba(6,182,212,0.3)"))
            st.plotly_chart(apply_chart(fig, 300), use_container_width=True, config={"displayModeBar": False})


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TAB 2: TRADING DYNAMICS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with tab2:
    st.markdown('<div class="sec-head">Trading Dynamics <span class="accent-line"></span></div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-desc">PumpSwap hit $176.8B cumulative volume and 74% Solana DEX share at peak. Volume correlates tightly with SOL price -- tracking price impact and slippage reveals the true cost of trading on thin bonding curves.</div>', unsafe_allow_html=True)

    c1, c2 = st.columns(2)
    with c1:
        st.markdown('<div class="chart-card"><h4>Volume + Moving Averages</h4></div>', unsafe_allow_html=True)
        if not vol_df.empty:
            vd = vol_df.sort_values("day").copy()
            vd["ma7"] = vd["volume_sol"].rolling(7, min_periods=1).mean()
            vd["ma30"] = vd["volume_sol"].rolling(30, min_periods=1).mean()
            fig = go.Figure()
            fig.add_trace(go.Bar(x=vd["day"], y=vd["volume_sol"], name="Daily",
                marker_color="rgba(255,255,255,0.06)"))
            fig.add_trace(go.Scatter(x=vd["day"], y=vd["ma7"], name="7d MA",
                line=dict(color=PURPLE, width=2.5)))
            fig.add_trace(go.Scatter(x=vd["day"], y=vd["ma30"], name="30d MA",
                line=dict(color=ORANGE, width=2.5, dash="dot")))
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Connect Dune API for live data")

    with c2:
        st.markdown('<div class="chart-card"><h4>Trade Size Distribution (7d)</h4></div>', unsafe_allow_html=True)
        ts = D.get("trade_size_dist", pd.DataFrame())
        if not ts.empty:
            colors = [PURPLE, BLUE, CYAN, GREEN, YELLOW, ORANGE, RED]
            fig = go.Figure(go.Pie(
                labels=ts["bucket"], values=ts["pct_vol"],
                hole=0.6, marker=dict(colors=colors, line=dict(color="#06060b", width=2)),
                textinfo="label+percent", textfont=dict(size=10, color="#8888a0"),
                hovertemplate="%{label}<br>%{value:.1f}% of volume<extra></extra>",
            ))
            fig.update_layout(showlegend=False)
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Connect Dune API for live data")

    c3, c4 = st.columns(2)
    with c3:
        st.markdown('<div class="chart-card"><h4>Price Impact (Slippage)</h4></div>', unsafe_allow_html=True)
        pi = D.get("price_impact", pd.DataFrame())
        if not pi.empty:
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=pi["day"], y=pi["p99"], name="P99",
                fill="tozeroy", fillcolor="rgba(239,68,68,0.04)",
                line=dict(color=RED, width=1.5, dash="dot")))
            fig.add_trace(go.Scatter(x=pi["day"], y=pi["p95"], name="P95",
                fill="tozeroy", fillcolor="rgba(234,179,8,0.04)",
                line=dict(color=YELLOW, width=1.5)))
            fig.add_trace(go.Scatter(x=pi["day"], y=pi["med"], name="Median",
                fill="tozeroy", fillcolor="rgba(34,197,94,0.04)",
                line=dict(color=GREEN, width=2)))
            fig.update_yaxes(ticksuffix="%")
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Connect Dune API for live data")

    with c4:
        st.markdown('<div class="chart-card"><h4>Intraday Trading Pattern (UTC)</h4></div>', unsafe_allow_html=True)
        hr = D.get("hourly_pattern", pd.DataFrame())
        if not hr.empty:
            fig = make_subplots(specs=[[{"secondary_y": True}]])
            fig.add_trace(go.Bar(x=hr["hr"], y=hr["vol"], name="Volume",
                marker=dict(color=[f"rgba(124,58,237,{0.3+0.7*v/hr['vol'].max()})" for v in hr["vol"]])),
                secondary_y=False)
            fig.add_trace(go.Scatter(x=hr["hr"], y=hr["traders"], name="Traders",
                line=dict(color=CYAN, width=2.5), mode="lines+markers",
                marker=dict(size=4)), secondary_y=True)
            fig.update_xaxes(dtick=2, title_text="Hour (UTC)")
            fig.update_yaxes(title_text="SOL", secondary_y=False)
            fig.update_yaxes(title_text="Traders", secondary_y=True)
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Connect Dune API for live data")

    # Volume vs SOL price
    if not sol_hist.empty and not vol_df.empty:
        st.markdown('<div class="chart-card"><h4>Volume vs SOL Price Correlation</h4></div>', unsafe_allow_html=True)
        fig = make_subplots(specs=[[{"secondary_y": True}]])
        fig.add_trace(go.Bar(x=vol_df["day"], y=vol_df["volume_sol"], name="Volume (SOL)",
            marker_color="rgba(124,58,237,0.3)"), secondary_y=False)
        fig.add_trace(go.Scatter(x=sol_hist["date"], y=sol_hist["price"], name="SOL Price",
            line=dict(color=YELLOW, width=2.5)), secondary_y=True)
        fig.update_yaxes(title_text="SOL Volume", secondary_y=False)
        fig.update_yaxes(title_text="USD", secondary_y=True)
        st.plotly_chart(apply_chart(fig, 320), use_container_width=True, config={"displayModeBar": False})


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TAB 3: REVENUE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with tab3:
    st.markdown('<div class="sec-head">Revenue & Fees <span class="accent-line"></span></div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-desc">$935M+ cumulative revenue. Project Ascend shifted to sliding creator fees (0.05-0.95%). 98%+ of revenue now funds PUMP token buybacks ($254M+ bought back).</div>', unsafe_allow_html=True)

    c1, c2 = st.columns(2)
    with c1:
        st.markdown('<div class="chart-card"><h4>Daily Fee Revenue (SOL)</h4></div>', unsafe_allow_html=True)
        if not fee_df.empty:
            fig = go.Figure()
            fig.add_trace(go.Bar(x=fee_df["day"], y=fee_df["protocol_fees"],
                name="Protocol (1%)", marker_color=PURPLE, opacity=0.8))
            fig.add_trace(go.Bar(x=fee_df["day"], y=fee_df["creator_fees"],
                name="Creator", marker_color=CYAN, opacity=0.8))
            fig.update_layout(barmode="stack")
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Connect Dune API for live data")

    with c2:
        st.markdown('<div class="chart-card"><h4>Cumulative Revenue (USD)</h4></div>', unsafe_allow_html=True)
        if not fee_df.empty and sol["price"] > 0:
            fd = fee_df.copy()
            fd["cum_usd"] = (fd["total_fees"] * sol["price"]).cumsum()
            fd["cum_protocol"] = (fd["protocol_fees"] * sol["price"]).cumsum()
            fd["cum_creator"] = (fd["creator_fees"] * sol["price"]).cumsum()
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=fd["day"], y=fd["cum_usd"], name="Total",
                fill="tozeroy", fillcolor="rgba(124,58,237,0.08)",
                line=dict(color=PURPLE, width=2.5)))
            fig.add_trace(go.Scatter(x=fd["day"], y=fd["cum_creator"], name="Creator",
                line=dict(color=CYAN, width=1.5, dash="dash")))
            fig.update_yaxes(tickprefix="$")
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Need fee data + SOL price")

    # Fee KPIs
    if not fee_df.empty:
        sp = sol["price"] or 1
        tp = fee_df["protocol_fees"].sum()
        tc = fee_df["creator_fees"].sum()
        fc1, fc2, fc3, fc4 = st.columns(4)
        with fc1:
            st.metric("Protocol Fees", f"{tp:,.0f} SOL", f"${tp*sp:,.0f} USD")
        with fc2:
            st.metric("Creator Fees", f"{tc:,.0f} SOL", f"${tc*sp:,.0f} USD")
        with fc3:
            st.metric("Total Revenue", f"{tp+tc:,.0f} SOL")
        with fc4:
            st.metric("Avg Daily Revenue", f"{fee_df['total_fees'].mean():,.0f} SOL")

    # Creator Leaderboard
    st.markdown('<div class="chart-card"><h4>Top Creator Fee Earners (7d)</h4></div>', unsafe_allow_html=True)
    if DUNE_API_KEY:
        cl = load("creator_leaderboard", 7)
        if not cl.empty:
            st.dataframe(cl, use_container_width=True, hide_index=True, height=400)
    else:
        st.caption("Connect Dune API for live data")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TAB 4: PROTOCOL HEALTH
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with tab4:
    st.markdown('<div class="sec-head">Protocol Health <span class="accent-line"></span></div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-desc">Solidus Labs reports 98.6% of launches are scams. Only 0.8% graduate. Understanding the token lifecycle funnel is critical for platform trust and retention.</div>', unsafe_allow_html=True)

    c1, c2 = st.columns(2)
    with c1:
        st.markdown('<div class="chart-card"><h4>Token Survival (Lifespan)</h4></div>', unsafe_allow_html=True)
        sv = D.get("token_survival", pd.DataFrame())
        if not sv.empty:
            colors = [RED, ORANGE, YELLOW, CYAN, BLUE, PURPLE, GREEN]
            fig = go.Figure(go.Bar(
                y=sv["bucket"], x=sv["pct"], orientation="h",
                marker=dict(color=colors[:len(sv)], line=dict(color="#06060b", width=1)),
                text=[f"{v:.1f}%" for v in sv["pct"]], textposition="outside",
                textfont=dict(color="#6b6b88", size=11),
                hovertemplate="%{y}: <b>%{x:.1f}%</b> of tokens<extra></extra>"))
            fig.update_layout(showlegend=False)
            fig.update_xaxes(title_text="% of Tokens", ticksuffix="%")
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Connect Dune API for live data")

    with c2:
        st.markdown('<div class="chart-card"><h4>Bonding Curve Progress</h4></div>', unsafe_allow_html=True)
        bc = D.get("bonding_curve", pd.DataFrame())
        if not bc.empty:
            colors = [RED, ORANGE, YELLOW, CYAN, BLUE, PURPLE, GREEN]
            fig = go.Figure(go.Bar(
                x=bc["bucket"], y=bc["pct"],
                marker=dict(color=colors[:len(bc)], line=dict(color="#06060b", width=1)),
                text=[f"{v:.1f}%" for v in bc["pct"]], textposition="outside",
                textfont=dict(color="#6b6b88", size=11),
                hovertemplate="%{x}: <b>%{y:.1f}%</b> of tokens<extra></extra>"))
            fig.update_layout(showlegend=False)
            fig.update_yaxes(title_text="% of Tokens", ticksuffix="%")
            st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})
        else:
            st.caption("Connect Dune API for live data")

    # Health insights
    if not sv.empty and not bc.empty:
        st.markdown(f"""
        <div class="insight-grid">
            <div class="insight">
                <div class="tag">MORTALITY</div>
                <h4>Token Lifespan</h4>
                <p><strong>{sv.iloc[0]['pct']:.0f}%</strong> of tokens die within 5 minutes.
                Only <strong>{sv.iloc[-1]['pct']:.1f}%</strong> survive beyond 3 days.</p>
            </div>
            <div class="insight">
                <div class="tag">BONDING CURVE</div>
                <h4>Reserve Distribution</h4>
                <p><strong>{bc.iloc[0]['pct']:.0f}%</strong> never reach 1 SOL in reserves.
                Only <strong>{bc.iloc[-1]['pct']:.1f}%</strong> graduate (79+ SOL).</p>
            </div>
            <div class="insight">
                <div class="tag">IMPLICATION</div>
                <h4>Quality Signal</h4>
                <p>Tokens surviving 24+ hours are in the <strong>top ~8%</strong> by longevity,
                making survival a meaningful quality filter.</p>
            </div>
        </div>
        """, unsafe_allow_html=True)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TAB 5: TRADER INTELLIGENCE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with tab5:
    st.markdown('<div class="sec-head">Trader Intelligence <span class="accent-line"></span></div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-desc">Wallet-level PnL analysis and whale tracking. With the trader cashback model and creator fee sharing, understanding who profits -- and who doesn\'t -- is essential.</div>', unsafe_allow_html=True)

    c1, c2 = st.columns(2)
    with c1:
        st.markdown('<div class="chart-card"><h4>Top Traders by PnL (7d)</h4></div>', unsafe_allow_html=True)
        if DUNE_API_KEY:
            pnl = load("top_traders_pnl")
            if not pnl.empty:
                pnl["trader"] = pnl["trader"].apply(shorten)
                st.dataframe(pnl, use_container_width=True, hide_index=True, height=500)
        else:
            st.caption("Connect Dune API for live data")

    with c2:
        st.markdown('<div class="chart-card"><h4>Whale Tracker (7d)</h4></div>', unsafe_allow_html=True)
        if DUNE_API_KEY:
            wh = load("whale_tracker")
            if not wh.empty:
                wh["trader"] = wh["trader"].apply(shorten)
                st.dataframe(wh, use_container_width=True, hide_index=True, height=500)
        else:
            st.caption("Connect Dune API for live data")

    # PnL Distribution visualization
    if DUNE_API_KEY and "pnl" in dir() and not pnl.empty:
        st.markdown('<div class="chart-card"><h4>PnL Distribution - Top 20 Traders</h4></div>', unsafe_allow_html=True)
        fig = go.Figure(go.Bar(
            x=pnl["trader"], y=pnl["pnl"],
            marker_color=[GREEN if v > 0 else RED for v in pnl["pnl"]],
            hovertemplate="%{x}<br>PnL: <b>%{y:,.0f} SOL</b><extra></extra>"))
        fig.update_yaxes(title_text="PnL (SOL)")
        st.plotly_chart(apply_chart(fig, 300), use_container_width=True, config={"displayModeBar": False})


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TAB 6: MEV & SANDWICH
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with tab6:
    st.markdown('<div class="sec-head">MEV & Sandwich Analysis <span class="accent-line"></span></div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sec-desc">Sandwich attack detection using spellbook-derived logic adapted for Solana. '
        'A $500M class-action lawsuit names MEV practices as central to $4-5.5B in alleged retail losses. '
        'Top 7 bots control 92.6% of MEV extraction.</div>',
        unsafe_allow_html=True)

    if DUNE_API_KEY:
        sw = load("sandwich_detection")
        if not sw.empty:
            c1, c2 = st.columns(2)
            with c1:
                st.markdown('<div class="chart-card"><h4>Daily Sandwich Attacks</h4></div>', unsafe_allow_html=True)
                fig = go.Figure(go.Bar(x=sw["day"], y=sw["attacks"],
                    marker=dict(color=sw["attacks"],
                        colorscale=[[0, "rgba(239,68,68,0.3)"], [1, RED]]),
                    hovertemplate="%{x|%b %d}: <b>%{y:,.0f}</b> attacks<extra></extra>"))
                fig.update_traces(marker_line_width=0)
                st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})

            with c2:
                st.markdown('<div class="chart-card"><h4>Unique MEV Bots</h4></div>', unsafe_allow_html=True)
                fig = go.Figure(go.Scatter(x=sw["day"], y=sw["bots"],
                    fill="tozeroy", fillcolor="rgba(249,115,22,0.06)",
                    line=dict(color=ORANGE, width=2.5), mode="lines+markers",
                    marker=dict(size=5),
                    hovertemplate="%{x|%b %d}: <b>%{y}</b> bots<extra></extra>"))
                st.plotly_chart(apply_chart(fig), use_container_width=True, config={"displayModeBar": False})

            # Sandwich KPIs
            sc1, sc2, sc3 = st.columns(3)
            with sc1:
                st.metric("Total Attacks", f"{sw['attacks'].sum():,.0f}")
            with sc2:
                st.metric("Avg Daily Attacks", f"{sw['attacks'].mean():,.0f}")
            with sc3:
                st.metric("Peak Bots (single day)", f"{sw['bots'].max():,.0f}")
        else:
            st.info("No sandwich attacks detected in this time range")

        # Bot Activity
        st.markdown('<div class="chart-card"><h4>Bot Trading Activity</h4></div>', unsafe_allow_html=True)
        bot = load("bot_activity", days)
        if not bot.empty:
            top_bots = bot.groupby("bot").agg(vol=("vol_usd", "sum"), tr=("trades", "sum")).sort_values("vol", ascending=False).head(8).reset_index()
            c1, c2 = st.columns(2)
            with c1:
                fig = go.Figure(go.Bar(
                    x=top_bots["bot"], y=top_bots["vol"],
                    marker=dict(color=[f"rgba(124,58,237,{0.3+0.7*i/len(top_bots)})" for i in range(len(top_bots))]),
                    hovertemplate="%{x}: <b>$%{y:,.0f}</b><extra></extra>"))
                fig.update_yaxes(tickprefix="$")
                st.plotly_chart(apply_chart(fig, 350), use_container_width=True, config={"displayModeBar": False})

            with c2:
                top5 = top_bots["bot"].head(5).tolist()
                bd = bot[bot["bot"].isin(top5)]
                fig = px.line(bd, x="day", y="vol_usd", color="bot",
                    color_discrete_sequence=[PURPLE, CYAN, GREEN, YELLOW, ORANGE])
                fig.update_yaxes(tickprefix="$")
                st.plotly_chart(apply_chart(fig, 350), use_container_width=True, config={"displayModeBar": False})
    else:
        st.info("Connect Dune API for live MEV analysis")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FOOTER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
st.markdown(f"""
<div class="footer">
    <p>Built by <strong>Ryan</strong> · Powered by
    <a href="https://dune.com" target="_blank">Dune Analytics</a> ·
    CoinGecko · DeFiLlama</p>
    <p class="sub">{datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} ·
    {len(QUERIES)} DuneSQL queries · Decoded events · Real-time</p>
    <div class="tech-stack">
        <span class="tech-pill">Streamlit</span>
        <span class="tech-pill">Plotly</span>
        <span class="tech-pill">DuneSQL</span>
        <span class="tech-pill">CoinGecko API</span>
        <span class="tech-pill">DeFiLlama API</span>
        <span class="tech-pill">Python</span>
    </div>
</div>
""", unsafe_allow_html=True)

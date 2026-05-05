import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ArrowUpDown } from 'lucide-react';

import random1 from '../assets/random1.png';
import random2 from '../assets/random2.png';
import random3 from '../assets/random3.png';
import random4 from '../assets/random4.png';
import random5 from '../assets/random5.png';

// ─── VOCAB DATA ───────────────────────────────────────────────────────────────

const CATS = [
  { id: 'all', label: 'All' },
  { id: 'balance', label: 'Balance Sheet' },
  { id: 'income', label: 'Income Statement' },
  { id: 'cashflow', label: 'Cash Flow' },
  { id: 'valuation', label: 'Valuation' },
  { id: 'market', label: 'Markets' },
  { id: 'ratios', label: 'Ratios' },
  { id: 'instruments', label: 'Instruments' },
  { id: 'risk', label: 'Risk' },
  { id: 'macro', label: 'Macro' },
  { id: 'banking', label: 'IB / Banking' },
];

type Term = { name: string; cat: string; def: string; formula?: string };

const TERMS: Term[] = [
  { name: 'Assets', cat: 'balance', def: 'Items of monetary value owned by a business — cash, inventory, real estate. Split into current (convertible within a year) and non-current (long-term).' },
  { name: 'Current Assets', cat: 'balance', def: 'Assets convertible to cash within one year: cash, accounts receivable, short-term investments, finished goods inventory.' },
  { name: 'Fixed / Non-Current Assets', cat: 'balance', def: 'Tangible items a company owns to generate long-term income — property, plant, and equipment (PP&E).' },
  { name: 'Liabilities', cat: 'balance', def: 'Obligations or debts owed to other parties. Includes bank debt, wages payable, and outstanding invoices. Split into current and non-current.' },
  { name: 'Current Liabilities', cat: 'balance', def: 'Short-term financial obligations due within the next 12 months — accounts payable, short-term debt, accrued expenses.' },
  { name: 'Non-Current Liabilities', cat: 'balance', def: 'Financial obligations not due for over one year — long-term bonds, deferred tax liabilities, pension obligations.' },
  { name: 'Accounts Payable (AP)', cat: 'balance', def: "A company's short-term obligation to pay suppliers for goods or services purchased on credit." },
  { name: 'Accounts Receivable (AR)', cat: 'balance', def: 'Outstanding balances owed to a business by customers for goods or services delivered on credit.' },
  { name: "Equity / Shareholders' Equity", cat: 'balance', def: 'The residual interest in assets after deducting all liabilities. Calculated as Assets − Liabilities.' },
  { name: 'Retained Earnings', cat: 'balance', def: 'Cumulative net income kept by the company rather than distributed as dividends.' },
  { name: 'Goodwill', cat: 'balance', def: 'An intangible asset recorded when a company is acquired for more than the fair value of its net identifiable assets. Represents brand value and synergies.' },
  { name: 'Book Value', cat: 'balance', def: 'The net value of a company\'s assets as recorded on the balance sheet — total assets minus total liabilities.' },
  { name: 'Working Capital', cat: 'balance', def: 'Current Assets minus Current Liabilities. Measures short-term operational liquidity.', formula: 'Working Capital = Current Assets − Current Liabilities' },
  { name: 'Balance Sheet', cat: 'balance', def: "A financial statement snapshot showing a company's assets, liabilities, and equity at a specific point in time.", formula: 'Assets = Liabilities + Equity' },
  { name: 'Revenue / Net Sales', cat: 'income', def: "The total income generated from selling goods or services before any expenses are deducted. The 'top line.'" },
  { name: 'Gross Profit', cat: 'income', def: 'Revenue minus the Cost of Goods Sold (COGS). Measures production efficiency.', formula: 'Gross Profit = Revenue − COGS' },
  { name: 'Operating Income (EBIT)', cat: 'income', def: 'Earnings Before Interest and Taxes. Profit from core operations after COGS and operating expenses.' },
  { name: 'EBITDA', cat: 'income', def: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. The most common metric for valuation multiples in M&A.', formula: 'EBITDA = Net Income + Interest + Taxes + D&A' },
  { name: 'Net Income', cat: 'income', def: "The 'bottom line.' Total profit after all expenses including COGS, operating costs, interest, and taxes." },
  { name: 'EPS (Earnings Per Share)', cat: 'income', def: 'Net income divided by shares outstanding.', formula: 'EPS = Net Income ÷ Shares Outstanding' },
  { name: 'Cost of Goods Sold (COGS)', cat: 'income', def: 'Direct costs to produce goods or deliver services — raw materials, direct labor, and manufacturing overhead.' },
  { name: 'Gross Margin', cat: 'income', def: 'Gross profit as a percentage of revenue.', formula: 'Gross Margin % = Gross Profit ÷ Revenue × 100' },
  { name: 'EBITDA Margin', cat: 'income', def: 'EBITDA as a percentage of revenue. The most widely quoted profitability metric in M&A and PE.', formula: 'EBITDA Margin % = EBITDA ÷ Revenue × 100' },
  { name: 'Depreciation', cat: 'income', def: 'A non-cash charge representing the systematic reduction in value of a tangible fixed asset over its useful life.' },
  { name: 'Amortization', cat: 'income', def: 'Applied to intangible assets such as patents and trademarks. A non-cash income statement charge.' },
  { name: 'Interest Expense', cat: 'income', def: 'The cost of debt financing — interest paid on loans, bonds, and revolving credit facilities.' },
  { name: 'Income Statement', cat: 'income', def: 'A financial statement summarizing revenues, expenses, and net income over a specific period. Also called the P&L.' },
  { name: 'Cash Flow', cat: 'cashflow', def: 'The net movement of cash in and out of a business. Split into operating, investing, and financing activities.' },
  { name: 'Operating Cash Flow (OCF)', cat: 'cashflow', def: 'Cash generated from core business operations. Starts with net income and adjusts for D&A and working capital changes.', formula: 'OCF = Net Income + D&A ± ΔWorking Capital' },
  { name: 'Free Cash Flow (FCF)', cat: 'cashflow', def: "Cash remaining after capital expenditures. The most important metric for equity valuation and LBO modeling — the cash truly 'free' to return to investors.", formula: 'FCF = Operating Cash Flow − CapEx' },
  { name: 'CapEx (Capital Expenditure)', cat: 'cashflow', def: 'Cash spent on acquiring or upgrading physical assets — buildings, equipment, machinery.' },
  { name: 'Cash Flow Statement', cat: 'cashflow', def: 'A financial statement reconciling opening and closing cash through operating, investing, and financing activities.' },
  { name: 'Net Change in Working Capital', cat: 'cashflow', def: 'The period-over-period change in current assets minus current liabilities. A source or use of cash in the operating section.' },
  { name: 'DCF (Discounted Cash Flow)', cat: 'valuation', def: 'A valuation method projecting future free cash flows and discounting them back to present value using WACC.', formula: 'DCF Value = Σ FCFt ÷ (1 + WACC)^t + Terminal Value' },
  { name: 'Comparable Company Analysis (Comps)', cat: 'valuation', def: 'A relative valuation technique comparing a company to publicly traded peers using multiples like EV/EBITDA and P/E.' },
  { name: 'Precedent Transactions', cat: 'valuation', def: 'A valuation method using multiples paid in historical M&A deals. Typically yields higher values than comps due to acquisition premiums.' },
  { name: 'Enterprise Value (EV)', cat: 'valuation', def: 'Total value of a company — equity plus net debt. Represents what an acquirer would pay for the entire business.', formula: 'EV = Market Cap + Debt − Cash' },
  { name: 'EV/EBITDA', cat: 'valuation', def: 'The most common M&A and PE valuation multiple. Allows comparison across different capital structures.' },
  { name: 'P/E Ratio (Price-to-Earnings)', cat: 'valuation', def: 'Market price per share divided by earnings per share.', formula: 'P/E = Share Price ÷ EPS' },
  { name: 'Price-to-Book (P/B)', cat: 'valuation', def: 'Market cap divided by book value of equity. Common for valuing banks.', formula: 'P/B = Market Cap ÷ Book Value of Equity' },
  { name: 'Terminal Value', cat: 'valuation', def: 'The estimated value of all cash flows beyond the explicit projection period in a DCF.' },
  { name: 'WACC', cat: 'valuation', def: 'Weighted Average Cost of Capital — the blended required return for all capital providers. Used as the DCF discount rate.', formula: 'WACC = (E/V × Re) + (D/V × Rd × (1−Tax))' },
  { name: 'LBO (Leveraged Buyout)', cat: 'valuation', def: 'An acquisition financed primarily with debt, where target cash flows service the debt. The core PE transaction structure.' },
  { name: 'IRR (Internal Rate of Return)', cat: 'valuation', def: 'The discount rate that makes NPV of cash flows equal zero. The primary PE return metric. Top funds target 20-30%+ IRR.', formula: '0 = Σ CFt ÷ (1 + IRR)^t' },
  { name: 'MOIC (Multiple on Invested Capital)', cat: 'valuation', def: 'Total value received divided by total equity invested.', formula: 'MOIC = Total Value Received ÷ Equity Invested' },
  { name: 'Capital Gain', cat: 'market', def: "The increase in an asset's value above its original purchase price." },
  { name: 'Capital Market', cat: 'market', def: 'A financial market where long-term securities are bought and sold. Primary markets (new issuances) vs secondary markets (trading).' },
  { name: 'Institutional Investors', cat: 'market', def: 'Large organizations that invest on behalf of others — pension funds, endowments, insurance companies, mutual funds, and sovereign wealth funds.' },
  { name: 'Hedge Fund', cat: 'market', def: 'An alternative investment fund using leverage, short selling, and derivatives to generate absolute returns. Typically 2-and-20 fee structure.' },
  { name: 'Mutual Fund', cat: 'market', def: 'A pooled investment vehicle managed by professionals. Open to retail investors; daily NAV pricing.' },
  { name: 'Private Equity (PE)', cat: 'market', def: 'Investment in private companies through buyouts, growth equity, or venture capital. Typical 5-10 year hold periods.' },
  { name: 'Asset Allocation', cat: 'market', def: 'How an investor distributes capital across equities, fixed income, alternatives, and cash to optimize risk/return.' },
  { name: 'IPO (Initial Public Offering)', cat: 'market', def: 'The first time a private company sells shares to the public. Investment banks underwrite, price, and allocate shares.' },
  { name: 'Secondary Market', cat: 'market', def: 'Where existing securities are traded between investors after their initial issuance.' },
  { name: 'Market Capitalization', cat: 'market', def: "The total market value of a company's outstanding shares.", formula: 'Market Cap = Share Price × Shares Outstanding' },
  { name: 'Liquidity', cat: 'market', def: 'How quickly an asset can be converted into cash without significantly affecting its price.' },
  { name: 'Bid-Ask Spread', cat: 'market', def: 'The difference between the highest price a buyer will pay (bid) and the lowest price a seller will accept (ask).' },
  { name: 'Short Selling', cat: 'market', def: 'Borrowing and selling securities you do not own, hoping to repurchase at a lower price. Profits from price declines.' },
  { name: 'Leverage', cat: 'market', def: 'Using borrowed capital to amplify potential returns. Increases both upside and downside risk.', formula: 'Leverage Ratio = Total Debt ÷ Equity' },
  { name: 'Return on Equity (ROE)', cat: 'ratios', def: "Net income as a percentage of shareholders' equity.", formula: "ROE = Net Income ÷ Shareholders' Equity" },
  { name: 'Return on Assets (ROA)', cat: 'ratios', def: 'Net income divided by total assets. Measures asset efficiency.', formula: 'ROA = Net Income ÷ Total Assets' },
  { name: 'Return on Invested Capital (ROIC)', cat: 'ratios', def: 'NOPAT divided by invested capital. Companies with ROIC > WACC create value.', formula: 'ROIC = NOPAT ÷ Invested Capital' },
  { name: 'ROI (Return on Investment)', cat: 'ratios', def: 'A simple measure of investment return as a percentage of cost.', formula: 'ROI = (Gain − Cost) ÷ Cost × 100' },
  { name: 'Debt-to-Equity (D/E)', cat: 'ratios', def: "Total debt divided by shareholders' equity. Measures financial leverage.", formula: "D/E = Total Debt ÷ Shareholders' Equity" },
  { name: 'Interest Coverage Ratio', cat: 'ratios', def: 'EBIT divided by interest expense. Lenders typically require > 2x.', formula: 'ICR = EBIT ÷ Interest Expense' },
  { name: 'Current Ratio', cat: 'ratios', def: 'Current assets divided by current liabilities. A ratio below 1 signals potential liquidity stress.', formula: 'Current Ratio = Current Assets ÷ Current Liabilities' },
  { name: 'Quick Ratio (Acid Test)', cat: 'ratios', def: 'More conservative than current ratio — excludes inventory.', formula: 'Quick Ratio = (CA − Inventory) ÷ CL' },
  { name: 'Net Profit Margin', cat: 'ratios', def: 'Net income as a percentage of revenue.', formula: 'Net Margin = Net Income ÷ Revenue' },
  { name: 'Asset Turnover', cat: 'ratios', def: 'Revenue divided by total assets. Measures how efficiently a company uses assets to generate sales.', formula: 'Asset Turnover = Revenue ÷ Total Assets' },
  { name: 'Gross Margin', cat: 'ratios', def: 'Gross profit as a percentage of revenue. Indicates pricing power.', formula: 'Gross Margin = Gross Profit ÷ Revenue' },
  { name: 'Stocks / Equities', cat: 'instruments', def: 'A share of ownership in a company. Shareholders receive dividends and benefit from capital appreciation.' },
  { name: 'Bonds / Fixed Income', cat: 'instruments', def: 'Debt instruments where you lend money to an issuer in exchange for periodic interest (coupon) payments and return of principal at maturity.' },
  { name: 'Derivatives', cat: 'instruments', def: 'Financial contracts whose value is derived from an underlying asset. Includes options, futures, swaps, and forwards.' },
  { name: 'Options', cat: 'instruments', def: 'Derivatives giving the holder the right (but not obligation) to buy (call) or sell (put) an asset at a specified strike price.' },
  { name: 'Futures', cat: 'instruments', def: 'Standardized contracts obligating parties to buy or sell an asset at a predetermined price on a future date.' },
  { name: 'ETF (Exchange-Traded Fund)', cat: 'instruments', def: 'A basket of securities traded on an exchange like a stock. Combines diversification with intraday tradability.' },
  { name: 'Commercial Paper', cat: 'instruments', def: 'Short-term unsecured debt issued by corporations to fund working capital needs. Maturities up to 270 days.' },
  { name: 'Convertible Bond', cat: 'instruments', def: 'A bond that can be converted into equity at a predetermined price. Lower interest rate in exchange for the conversion option.' },
  { name: 'Treasury Bills (T-Bills)', cat: 'instruments', def: 'Short-term US government debt securities with maturities under one year. Considered the risk-free rate.' },
  { name: 'Credit Default Swap (CDS)', cat: 'instruments', def: 'A derivative providing insurance against the default of a bond issuer.' },
  { name: 'Beta (β)', cat: 'risk', def: "Measures a stock's volatility relative to the overall market. β=1 moves with market; β>1 is more volatile.", formula: 'β = Cov(ri, rm) ÷ Var(rm)' },
  { name: 'Alpha (α)', cat: 'risk', def: 'Excess return versus a benchmark after adjusting for risk. The goal of every active fund manager.', formula: 'α = Portfolio Return − (Rf + β × (Rm − Rf))' },
  { name: 'Sharpe Ratio', cat: 'risk', def: 'Return per unit of total risk. A higher Sharpe ratio means better risk-adjusted returns. >1 is good.', formula: 'Sharpe = (Rp − Rf) ÷ σ' },
  { name: 'Volatility (σ)', cat: 'risk', def: 'Statistical measure of the dispersion of returns. Higher volatility = higher uncertainty.' },
  { name: 'VaR (Value at Risk)', cat: 'risk', def: 'The maximum expected loss over a given time horizon at a specified confidence level.' },
  { name: 'Hedging', cat: 'risk', def: 'Using financial instruments to offset or reduce the risk of adverse price movements in an existing position.' },
  { name: 'Duration', cat: 'risk', def: "A bond's sensitivity to interest rate changes. Duration of 5 means a 1% rise in rates reduces bond price ~5%." },
  { name: 'Credit Risk', cat: 'risk', def: "The risk that a borrower will default. Measured by credit ratings (AAA to D) from Moody's, S&P, and Fitch." },
  { name: 'Systemic Risk', cat: 'risk', def: 'Risk inherent to the entire financial system — cannot be eliminated through diversification.' },
  { name: 'Compound Interest', cat: 'macro', def: 'Interest calculated on both principal and accumulated interest over time.', formula: 'FV = PV × (1 + r)^n' },
  { name: 'Inflation', cat: 'macro', def: 'The rate at which the general price level rises over time. Measured by CPI and PCE in the US.' },
  { name: 'GDP (Gross Domestic Product)', cat: 'macro', def: 'Total monetary value of all goods and services produced within a country. The primary measure of economic size.' },
  { name: 'Yield Curve', cat: 'macro', def: 'A graph of bond yields across different maturities. Inverted yield curve (short > long) predicts recession.' },
  { name: 'Federal Funds Rate', cat: 'macro', def: 'The interest rate at which US banks lend reserves overnight. Set by the Federal Reserve.' },
  { name: 'Quantitative Easing (QE)', cat: 'macro', def: 'Central bank policy of purchasing long-term securities to inject liquidity and lower long-term interest rates.' },
  { name: 'Basis Point (bps)', cat: 'macro', def: 'One hundredth of one percentage point (0.01%). 100 bps = 1%.' },
  { name: 'Risk-Free Rate', cat: 'macro', def: 'The theoretical return of a zero-risk investment — typically the US 10-year Treasury yield.' },
  { name: 'Spread', cat: 'macro', def: 'The difference in yield between two bonds, usually relative to a benchmark like Treasuries.' },
  { name: 'Underwriting', cat: 'banking', def: 'The process by which investment banks assess and assume risk of issuing new securities — guaranteeing the issuer a set price.' },
  { name: 'M&A (Mergers & Acquisitions)', cat: 'banking', def: 'Transactions where companies combine or one acquires another. Banks advise on structure, valuation, and negotiation.' },
  { name: 'Bulge Bracket', cat: 'banking', def: 'The largest global investment banks — Goldman Sachs, Morgan Stanley, JPMorgan, Bank of America, Citi, Barclays, Deutsche Bank.' },
  { name: 'Elite Boutique', cat: 'banking', def: 'Smaller, prestigious advisory-only firms: Evercore, PJT, Lazard, Centerview, Moelis. Often pay more than bulge brackets.' },
  { name: 'Pitch Book', cat: 'banking', def: 'A presentation prepared by investment banks to win mandates or present deal ideas to clients.' },
  { name: 'Deal Mandate', cat: 'banking', def: 'The formal agreement between a company and an investment bank to advise on a transaction.' },
  { name: 'Syndication', cat: 'banking', def: 'Distributing a loan or securities offering across multiple lenders to reduce individual exposure.' },
  { name: 'Covenant', cat: 'banking', def: 'A condition in a debt agreement restricting or requiring certain borrower actions.' },
  { name: 'Accretion/Dilution', cat: 'banking', def: 'In M&A, whether a deal increases (accretive) or decreases (dilutive) the acquirer\'s EPS.', formula: 'If EPS post-deal > EPS pre-deal → Accretive' },
];

// ─── BADGE COLORS ─────────────────────────────────────────────────────────────

const CAT_BADGE: Record<string, string> = {
  balance:     'bg-[#0C447C] text-[#B5D4F4]',
  income:      'bg-[#27500A] text-[#C0DD97]',
  cashflow:    'bg-[#085041] text-[#9FE1CB]',
  valuation:   'bg-[#3C3489] text-[#CECBF6]',
  market:      'bg-[#633806] text-[#FAC775]',
  ratios:      'bg-[#712B13] text-[#F5C4B3]',
  instruments: 'bg-[#72243E] text-[#F4C0D1]',
  risk:        'bg-[#444441] text-[#D3D1C7]',
  macro:       'bg-[#3B6D11] text-[#C0DD97]',
  banking:     'bg-[#185FA5] text-[#B5D4F4]',
};

// ─── UNIVERSITY DATA ──────────────────────────────────────────────────────────

type University = {
  university: string;
  region: string;
  status: 'target' | 'semi' | 'non-target';
  rank: string;
  network: 'elite' | 'strong' | 'moderate';
  gpa: string;
  clubs: string;
};

const UNIS: University[] = [
  { university: 'Harvard University', region: 'USA', status: 'target', rank: 'Top 3', network: 'elite', gpa: '3.9+', clubs: 'Harvard Finance Club; Harvard Investment Association; Harvard PE & VC Club' },
  { university: 'Wharton (UPenn)', region: 'USA', status: 'target', rank: '#1', network: 'elite', gpa: '3.7+', clubs: 'Wharton Investment & Trading Group; Wharton PE/VC Club; Wharton Finance Club' },
  { university: 'Stanford University', region: 'USA', status: 'target', rank: 'Top 5', network: 'elite', gpa: '3.9+', clubs: 'Stanford Finance Club; Stanford Investment Group; Stanford PE/VC Club' },
  { university: 'MIT (Sloan)', region: 'USA', status: 'target', rank: 'Top 5 (Quant)', network: 'elite', gpa: '3.9+', clubs: 'MIT Finance Club; MIT Trading Club; Quantitative Finance Club' },
  { university: 'Yale University', region: 'USA', status: 'target', rank: 'Top 10', network: 'elite', gpa: '3.9+', clubs: 'Yale Finance Club; Yale Investment Association; Yale Capital Markets' },
  { university: 'Princeton University', region: 'USA', status: 'target', rank: 'Top 10', network: 'elite', gpa: '3.9+', clubs: 'Princeton Finance Club; Princeton Investment Company' },
  { university: 'Columbia University', region: 'USA', status: 'target', rank: 'Top 5', network: 'elite', gpa: '3.7+', clubs: 'Columbia IB Club (CIBC); Columbia Finance Society; Columbia PE/VC' },
  { university: 'University of Chicago', region: 'USA', status: 'target', rank: 'Top 5', network: 'elite', gpa: '3.8+', clubs: 'Chicago Finance Society; Becker Friedman Trading Club' },
  { university: 'Dartmouth College', region: 'USA', status: 'target', rank: 'Top 10', network: 'elite', gpa: '3.7+', clubs: 'Dartmouth Investment & Consulting Group; Tuck Bridge' },
  { university: 'NYU Stern', region: 'USA', status: 'target', rank: 'Top 7', network: 'strong', gpa: '3.5+', clubs: 'Stern Finance Club; SIMR; PE/VC Club' },
  { university: 'Duke University', region: 'USA', status: 'target', rank: 'Top 15', network: 'strong', gpa: '3.7+', clubs: 'Duke Investment Club; Duke Capital Partners' },
  { university: 'Cornell University', region: 'USA', status: 'target', rank: 'Top 15', network: 'strong', gpa: '3.6+', clubs: 'Cornell IB Club; Cornell PE/VC; Dyson Finance Club' },
  { university: 'Northwestern University', region: 'USA', status: 'target', rank: 'Top 15', network: 'strong', gpa: '3.7+', clubs: 'Kellogg Finance Club; Northwestern Investment Group' },
  { university: 'Univ. of Michigan (Ross)', region: 'USA', status: 'target', rank: 'Top 20', network: 'strong', gpa: '3.5+', clubs: 'Michigan Investment Club (MIC); Wolverine Venture Fund' },
  { university: 'UVA (McIntire)', region: 'USA', status: 'target', rank: 'Top 20', network: 'strong', gpa: '3.5+', clubs: 'McIntire Finance Society; Cavalier Capital' },
  { university: 'Carnegie Mellon (Tepper)', region: 'USA', status: 'target', rank: 'Top 15 (Quant)', network: 'strong', gpa: '3.6+', clubs: 'CMU Finance Club; Quant Finance Club; CMU Algo Trading' },
  { university: 'Indiana Univ. (Kelley)', region: 'USA', status: 'semi', rank: 'Top 20', network: 'strong', gpa: '3.3+', clubs: 'Investment Banking Workshop (IBW) — very selective' },
  { university: 'Brown University', region: 'USA', status: 'semi', rank: 'Top 20', network: 'strong', gpa: '3.6+', clubs: 'Brown Investment Group; Brown Finance Club' },
  { university: 'Georgetown University', region: 'USA', status: 'semi', rank: 'Top 20', network: 'strong', gpa: '3.6+', clubs: 'Georgetown Investment Club; GU Finance Society' },
  { university: 'Notre Dame (Mendoza)', region: 'USA', status: 'semi', rank: 'Top 25', network: 'strong', gpa: '3.5+', clubs: 'Notre Dame Investment Club; Mendoza Finance Association' },
  { university: 'Vanderbilt University', region: 'USA', status: 'semi', rank: 'Top 25', network: 'strong', gpa: '3.6+', clubs: 'Vanderbilt Finance Club; Vandy Investment Management' },
  { university: 'USC (Marshall)', region: 'USA', status: 'semi', rank: 'Top 25', network: 'moderate', gpa: '3.4+', clubs: 'USC Finance Club; Marshall Investment Group; Trojan Capital' },
  { university: 'UCLA Anderson', region: 'USA', status: 'semi', rank: 'Top 25', network: 'strong', gpa: '3.5+', clubs: 'UCLA Finance Association; UCLA Investment Group; Bruin Capital' },
  { university: 'UT Austin (McCombs)', region: 'USA', status: 'semi', rank: 'Top 25', network: 'moderate', gpa: '3.4+', clubs: 'Texas Finance Association; McCombs Investment Group; Longhorn Capital' },
  { university: 'Boston College (Carroll)', region: 'USA', status: 'semi', rank: 'Top 25', network: 'strong', gpa: '3.4+', clubs: 'BC Investment Club; BC Finance Society; BC PE/VC Club' },
  { university: 'Emory (Goizueta)', region: 'USA', status: 'semi', rank: 'Top 25', network: 'strong', gpa: '3.5+', clubs: 'Emory Investment Group; Goizueta Finance Club; Emory PE/VC' },
  { university: 'LSE', region: 'UK', status: 'target', rank: 'Top 3 (UK)', network: 'elite', gpa: '3.7+', clubs: 'LSE Finance Society; LSE Alternative Investments; LSE HF Society' },
  { university: 'University of Oxford', region: 'UK', status: 'target', rank: 'Top 5 (UK)', network: 'elite', gpa: '3.8+', clubs: 'Oxford Finance Society; Oxford Investment Group; Oxford PE/VC' },
  { university: 'University of Cambridge', region: 'UK', status: 'target', rank: 'Top 5 (UK)', network: 'elite', gpa: '3.8+', clubs: 'Cambridge University Finance Society (CUFS); Cambridge PE/VC' },
  { university: 'Imperial College London', region: 'UK', status: 'target', rank: 'Top 10 (UK)', network: 'strong', gpa: '3.6+', clubs: 'Imperial Finance Society; Imperial Trading Society' },
  { university: 'UCL', region: 'UK', status: 'semi', rank: 'Top 10 (UK)', network: 'strong', gpa: '3.5+', clubs: 'UCL Finance Society; UCL Investment Group; UCL Trading Society' },
  { university: 'Warwick University', region: 'UK', status: 'semi', rank: 'Top 10 (UK)', network: 'strong', gpa: '3.5+', clubs: 'Warwick Finance Society; Warwick Investment Group' },
  { university: 'Durham University', region: 'UK', status: 'semi', rank: 'Top 15 (UK)', network: 'moderate', gpa: '3.4+', clubs: 'Durham Finance Society; Durham Investment Society' },
  { university: 'University of Edinburgh', region: 'UK', status: 'semi', rank: 'Top 15 (UK)', network: 'strong', gpa: '3.4+', clubs: 'Edinburgh Finance Society; Edinburgh Investment Club' },
  { university: 'King\'s College London', region: 'UK', status: 'semi', rank: 'Top 15 (UK)', network: 'moderate', gpa: '3.3+', clubs: 'KCL Finance Society; KCL Investment Club; KCL Trading Society' },
  { university: 'Univ. of Toronto (Rotman)', region: 'Canada', status: 'target', rank: 'Top 3 (CA)', network: 'strong', gpa: '3.5+', clubs: 'Rotman Finance Association; U of T Investment Club' },
  { university: 'McGill (Desautels)', region: 'Canada', status: 'target', rank: 'Top 5 (CA)', network: 'strong', gpa: '3.4+', clubs: 'McGill Finance Association; Desautels Investment Club' },
  { university: 'Ivey (Western)', region: 'Canada', status: 'target', rank: 'Top 5 (CA)', network: 'strong', gpa: '3.4+', clubs: 'Ivey Capital Markets Association; Ivey Finance Club' },
  { university: "Queen's (Smith)", region: 'Canada', status: 'target', rank: 'Top 5 (CA)', network: 'strong', gpa: '3.4+', clubs: "Queen's Investment Counsel (QIC) — top student fund" },
  { university: 'UBC (Sauder)', region: 'Canada', status: 'semi', rank: 'Top 5 (CA)', network: 'moderate', gpa: '3.3+', clubs: 'Sauder Finance Club; UBC Investment Group; UBC Trading Club' },
  { university: 'HEC Paris', region: 'Europe', status: 'target', rank: 'Top 3 (EU)', network: 'elite', gpa: '3.8+', clubs: 'HEC Finance Club; HEC Investment Society; HEC PE/VC Club' },
  { university: 'Bocconi University', region: 'Europe', status: 'target', rank: 'Top 5 (EU)', network: 'strong', gpa: '3.6+', clubs: 'Bocconi Finance Society; Bocconi Investment Club' },
  { university: 'St. Gallen University', region: 'Europe', status: 'target', rank: 'Top 5 (EU)', network: 'strong', gpa: '3.5+', clubs: 'HSG Finance Club; HSG Investment Group; Banking & Finance Club' },
  { university: 'WHU - Otto Beisheim', region: 'Europe', status: 'target', rank: 'Top 10 (EU)', network: 'strong', gpa: '3.5+', clubs: 'WHU Finance Club; WHU Investment Group; WHU PE/VC Club' },
  { university: 'ESSEC Business School', region: 'Europe', status: 'target', rank: 'Top 10 (EU)', network: 'strong', gpa: '3.5+', clubs: 'ESSEC Finance Club; ESSEC Investment Society' },
  { university: 'ESADE Business School', region: 'Europe', status: 'semi', rank: 'Top 10 (EU)', network: 'strong', gpa: '3.4+', clubs: 'ESADE Finance Club; ESADE Investment Group' },
  { university: 'Rotterdam (EUR)', region: 'Europe', status: 'semi', rank: 'Top 10 (EU)', network: 'moderate', gpa: '3.3+', clubs: 'RSM Finance Association; RSM Investment Club' },
  { university: 'Copenhagen Business School', region: 'Europe', status: 'semi', rank: 'Top 15 (EU)', network: 'moderate', gpa: '3.2+', clubs: 'CBS Finance Society; Nordic Finance Club' },
  { university: 'NUS', region: 'Asia-Pacific', status: 'target', rank: 'Top 3 (APAC)', network: 'strong', gpa: '3.6+', clubs: 'NUS Finance Society; NUS Investment Group; NUS Trading Club' },
  { university: 'HKU', region: 'Asia-Pacific', status: 'target', rank: 'Top 5 (APAC)', network: 'strong', gpa: '3.5+', clubs: 'HKU Finance Society; HKU Investment Club; HKU Trading Club' },
  { university: 'HKUST', region: 'Asia-Pacific', status: 'target', rank: 'Top 5 (APAC)', network: 'strong', gpa: '3.5+', clubs: 'HKUST Finance Society; HKUST Investment Group; Quant Finance Club' },
  { university: 'Peking University (PKU)', region: 'Asia-Pacific', status: 'target', rank: 'Top 3 (APAC)', network: 'strong', gpa: '3.7+', clubs: 'PKU Finance Society; PKU Investment Club; PKU Quant Club' },
  { university: 'Tsinghua University', region: 'Asia-Pacific', status: 'target', rank: 'Top 3 (APAC)', network: 'strong', gpa: '3.7+', clubs: 'Tsinghua Finance Society; Tsinghua Investment Group; Fintech Club' },
  { university: 'NTU', region: 'Asia-Pacific', status: 'semi', rank: 'Top 5 (APAC)', network: 'strong', gpa: '3.4+', clubs: 'NTU Finance Society; NTU Investment Club; NTU Trading Society' },
  { university: 'Univ. of Melbourne', region: 'Asia-Pacific', status: 'semi', rank: 'Top 5 (APAC)', network: 'moderate', gpa: '3.3+', clubs: 'Melbourne Finance Society; UoM Investment Group' },
  { university: 'Univ. of Sydney', region: 'Asia-Pacific', status: 'semi', rank: 'Top 5 (APAC)', network: 'moderate', gpa: '3.2+', clubs: 'USyd Finance Society; USyd Investment Club' },
  { university: 'AUB', region: 'Middle East', status: 'semi', rank: 'Top 5 (ME)', network: 'moderate', gpa: '3.2+', clubs: 'AUB Finance Club; AUB Investment Society' },
  { university: 'AUD', region: 'Middle East', status: 'non-target', rank: 'Top 10 (ME)', network: 'moderate', gpa: '3.0+', clubs: 'AUD Finance Club; AUD Investment Group' },
  { university: 'Khalifa University', region: 'Middle East', status: 'non-target', rank: 'Top 10 (ME)', network: 'moderate', gpa: '3.0+', clubs: 'Khalifa Finance Society; KU Investment Club' },
  { university: 'SP Jain', region: 'Middle East', status: 'non-target', rank: 'Top 10 (ME)', network: 'moderate', gpa: '2.9+', clubs: 'SPJAIN Finance Club; Investment Society' },
];

const REGIONS = ['All', 'USA', 'UK', 'Canada', 'Europe', 'Asia-Pacific', 'Middle East'];
const STATUSES = ['All', 'Target', 'Semi-Target', 'Non-Target'];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function TermCard({ term }: { term: Term }) {
  const [open, setOpen] = useState(false);
  const label = CATS.find(c => c.id === term.cat)?.label ?? term.cat;
  return (
    <motion.div
      layout
      onClick={() => setOpen(o => !o)}
      className={`cursor-pointer rounded-2xl border p-4 transition-colors duration-150 ${
        open ? 'border-yellow-400/60 bg-[#1e293b]' : 'border-white/[0.07] bg-[#1e293b] hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-bold text-sm text-white leading-tight">{term.name}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${CAT_BADGE[term.cat] ?? 'bg-white/10 text-white/60'}`}>
            {label}
          </span>
          <ChevronDown
            size={14}
            className={`text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-white/[0.07]">
              <p className="text-sm text-white/60 leading-relaxed">{term.def}</p>
              {term.formula && (
                <div className="mt-2 font-mono text-[11px] text-cyan-300 bg-[#0f172a] border border-cyan-400/15 px-3 py-2 rounded-xl">
                  {term.formula}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── VOCAB TAB ────────────────────────────────────────────────────────────────

function VocabTab() {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const filtered = TERMS.filter(t => {
    const catOk = activeCat === 'all' || t.cat === activeCat;
    const q = query.toLowerCase();
    const qOk = !q || t.name.toLowerCase().includes(q) || t.def.toLowerCase().includes(q);
    return catOk && qOk;
  });

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any finance term..."
          className="w-full bg-[#1e293b] border border-white/[0.07] rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATS.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all duration-150 ${
              activeCat === c.id
                ? 'bg-[#1e3a8a] border-blue-500 text-blue-300'
                : 'border-white/[0.07] bg-transparent text-white/40 hover:text-white/70 hover:border-white/20'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-[11px] font-black uppercase tracking-widest text-white/25 mb-3">
        {filtered.length} term{filtered.length !== 1 ? 's' : ''} — tap to expand
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/25 text-sm">No terms found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map(t => <TermCard key={t.name} term={t} />)}
        </div>
      )}
    </div>
  );
}

// ─── UNIVERSITIES TAB ─────────────────────────────────────────────────────────

const SCENERY: { src: string; side: 'left' | 'right'; delay: number }[] = [
  { src: random1, side: 'left',  delay: 0 },
  { src: random2, side: 'right', delay: 1 },
  { src: random3, side: 'left',  delay: 0.5 },
  { src: random4, side: 'right', delay: 1.5 },
  { src: random5, side: 'left',  delay: 0.8 },
];

const floatAnim = (delay: number) => ({
  y: [0, -18, 0],
  rotate: [0, 2.5, -2.5, 0],
  transition: { duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay },
});

function UniCard({ uni, scenery }: { uni: University; scenery?: typeof SCENERY[0] }) {
  const statusBadge = (s: University['status']) => {
    if (s === 'target') return 'bg-[#27500A] text-[#C0DD97]';
    if (s === 'semi') return 'bg-[#633806] text-[#FAC775]';
    return 'bg-[#444441] text-[#D3D1C7]';
  };
  const statusLabel = (s: University['status']) =>
    s === 'target' ? 'Target' : s === 'semi' ? 'Semi-Target' : 'Non-Target';

  const networkColor = (n: University['network']) =>
    n === 'elite' ? 'text-yellow-400' : n === 'strong' ? 'text-green-400' : 'text-white/40';

  const clubs = uni.clubs.split(';').map(c => c.trim()).filter(Boolean);

  return (
    <div className="relative w-full">
      {/* Floating scenery illustration */}
      {scenery && (
        <motion.img
          animate={floatAnim(scenery.delay)}
          src={scenery.src}
          alt=""
          aria-hidden="true"
          className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-44 h-44 object-contain drop-shadow-2xl pointer-events-none z-0 ${
            scenery.side === 'left' ? '-left-52' : '-right-52'
          }`}
        />
      )}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-[#1e293b] border border-white/[0.07] rounded-3xl p-6 md:p-8 hover:border-white/[0.14] transition-colors duration-200"
      >
        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg md:text-xl font-black text-white leading-tight mb-1">{uni.university}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#334155] text-white/50 px-2.5 py-1 rounded-lg">
                {uni.region}
              </span>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-xs text-white/40 font-semibold">{uni.rank}</span>
            </div>
          </div>
          <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex-shrink-0 ${statusBadge(uni.status)}`}>
            {statusLabel(uni.status)}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          <div className="bg-[#0f172a] rounded-2xl px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-1">Network</p>
            <p className={`text-sm font-black capitalize ${networkColor(uni.network)}`}>{uni.network}</p>
          </div>
          <div className="bg-[#0f172a] rounded-2xl px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-1">Min GPA</p>
            <p className="text-sm font-black text-cyan-300">{uni.gpa}</p>
          </div>
          <div className="bg-[#0f172a] rounded-2xl px-4 py-3 col-span-2 md:col-span-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-1">Finance Rank</p>
            <p className="text-sm font-bold text-white/60">{uni.rank}</p>
          </div>
        </div>

        {/* Clubs */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2.5">Key Finance Clubs</p>
          <div className="flex flex-wrap gap-2">
            {clubs.map(club => (
              <span key={club} className="text-[11px] font-semibold bg-[#0f172a] border border-white/[0.06] text-white/50 px-3 py-1.5 rounded-xl">
                {club}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function UniversitiesTab() {
  const [query, setQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');

  const statusMap: Record<string, University['status']> = { Target: 'target', 'Semi-Target': 'semi', 'Non-Target': 'non-target' };

  const unis = UNIS.filter(u => {
    const regOk = activeRegion === 'All' || u.region === activeRegion;
    const statOk = activeStatus === 'All' || u.status === statusMap[activeStatus];
    const q = query.toLowerCase();
    const qOk = !q || u.university.toLowerCase().includes(q) || u.region.toLowerCase().includes(q) || u.clubs.toLowerCase().includes(q);
    return regOk && statOk && qOk;
  });

  // Assign scenery at fixed intervals so it doesn't shift on re-filter
  const getScenery = (idx: number) =>
    idx % 4 === 0 ? SCENERY[idx % SCENERY.length] : undefined;

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search university, country, or club..."
          className="w-full bg-[#1e293b] border border-white/[0.07] rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Region filters */}
      <div className="flex flex-wrap gap-2 mb-2">
        {REGIONS.map(r => (
          <button
            key={r}
            onClick={() => setActiveRegion(r)}
            className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all duration-150 ${
              activeRegion === r
                ? 'bg-[#1e3a8a] border-blue-500 text-blue-300'
                : 'border-white/[0.07] bg-transparent text-white/40 hover:text-white/70 hover:border-white/20'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all duration-150 ${
              activeStatus === s
                ? 'bg-[#1e3a8a] border-blue-500 text-blue-300'
                : 'border-white/[0.07] bg-transparent text-white/40 hover:text-white/70 hover:border-white/20'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="text-[11px] font-black uppercase tracking-widest text-white/25 mb-5">
        {unis.length} universit{unis.length === 1 ? 'y' : 'ies'}
      </p>

      {unis.length === 0 ? (
        <div className="text-center py-20 text-white/25 text-sm">No universities found.</div>
      ) : (
        <div className="flex flex-col gap-4 pb-20">
          {unis.map((u, i) => (
            <UniCard key={u.university} uni={u} scenery={getScenery(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Resources() {
  const [activeTab, setActiveTab] = useState<'vocab' | 'universities'>('vocab');

  return (
    <div className="min-h-full flex flex-col items-center py-6 text-white animate-fade-in w-full relative overflow-x-hidden px-4">

      {/* Header card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10 z-20 w-full max-w-3xl bg-[#1e293b]/80 p-8 md:p-10 rounded-[40px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      >
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            Resources
          </h1>
          <p className="text-white/70 font-medium leading-relaxed text-base md:text-lg">
            Your finance reference hub. Master the vocabulary and explore top universities worldwide.
          </p>
        </div>
      </motion.div>

      {/* Tab bar */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-3xl mb-6"
      >
        <div className="flex gap-2 bg-[#0f172a] p-1.5 rounded-2xl border border-white/[0.07]">
          {(['vocab', 'universities'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-200 relative ${
                activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-[#1e293b] rounded-xl border border-white/10"
                  style={{ boxShadow: '0px 4px 0px #1e3a8a' }}
                />
              )}
              <span className="relative z-10">
                {tab === 'vocab' ? '📖 Vocabulary' : '🏛️ Universities'}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-3xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'vocab' ? <VocabTab /> : <UniversitiesTab />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
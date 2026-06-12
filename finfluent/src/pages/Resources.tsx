import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, MapPin, Users, Star, ExternalLink } from 'lucide-react';

// ─── VOCABULARY DATA ─────────────────────────────────────────────────────────

const CATS = [
  { id: 'all',         label: 'All'              },
  { id: 'balance',     label: 'Balance Sheet'    },
  { id: 'income',      label: 'Income Statement' },
  { id: 'cashflow',    label: 'Cash Flow'        },
  { id: 'valuation',   label: 'Valuation'        },
  { id: 'market',      label: 'Markets'          },
  { id: 'ratios',      label: 'Ratios'           },
  { id: 'instruments', label: 'Instruments'      },
  { id: 'risk',        label: 'Risk'             },
  { id: 'macro',       label: 'Macro'            },
  { id: 'banking',     label: 'IB / Banking'     },
];

const TERMS = [
  { name: 'Assets', cat: 'balance', def: 'Items of monetary value owned by a business — cash, inventory, real estate. Split into current (convertible within a year) and non-current (long-term).' },
  { name: 'Current Assets', cat: 'balance', def: 'Assets convertible to cash within one year: cash, accounts receivable, short-term investments, finished goods inventory.' },
  { name: 'Liabilities', cat: 'balance', def: 'Obligations or debts owed to other parties. Includes bank debt, wages payable, and outstanding invoices.' },
  { name: "Equity / Shareholders' Equity", cat: 'balance', def: 'The residual interest in assets after deducting all liabilities. Calculated as Assets − Liabilities.' },
  { name: 'Working Capital', cat: 'balance', def: 'Current Assets minus Current Liabilities. Measures short-term operational liquidity.', formula: 'Working Capital = Current Assets − Current Liabilities' },
  { name: 'Balance Sheet', cat: 'balance', def: "A financial statement snapshot showing a company's assets, liabilities, and equity at a specific point in time.", formula: 'Assets = Liabilities + Equity' },
  { name: 'Revenue / Net Sales', cat: 'income', def: "The total income generated from selling goods or services before any expenses are deducted. The 'top line.'" },
  { name: 'Gross Profit', cat: 'income', def: 'Revenue minus the Cost of Goods Sold (COGS). Measures production efficiency.', formula: 'Gross Profit = Revenue − COGS' },
  { name: 'EBITDA', cat: 'income', def: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. The most common metric for valuation multiples in M&A.', formula: 'EBITDA = Net Income + Interest + Taxes + D&A' },
  { name: 'Net Income', cat: 'income', def: "The 'bottom line.' Total profit after all expenses including COGS, operating costs, interest, and taxes." },
  { name: 'EPS (Earnings Per Share)', cat: 'income', def: 'Net income divided by shares outstanding.', formula: 'EPS = Net Income ÷ Shares Outstanding' },
  { name: 'EBITDA Margin', cat: 'income', def: 'EBITDA as a percentage of revenue. The most widely quoted profitability metric in M&A and PE.', formula: 'EBITDA Margin % = EBITDA ÷ Revenue × 100' },
  { name: 'Free Cash Flow (FCF)', cat: 'cashflow', def: "Cash remaining after capital expenditures. The most important metric for equity valuation and LBO modeling.", formula: 'FCF = Operating Cash Flow − CapEx' },
  { name: 'CapEx', cat: 'cashflow', def: 'Cash spent on acquiring or upgrading physical assets — buildings, equipment, machinery.' },
  { name: 'DCF (Discounted Cash Flow)', cat: 'valuation', def: 'A valuation method projecting future free cash flows and discounting them back to present value using WACC.', formula: 'DCF Value = Σ FCFt ÷ (1 + WACC)^t + Terminal Value' },
  { name: 'Enterprise Value (EV)', cat: 'valuation', def: 'Total value of a company — equity plus net debt. Represents what an acquirer would pay for the entire business.', formula: 'EV = Market Cap + Debt − Cash' },
  { name: 'EV/EBITDA', cat: 'valuation', def: 'The most common M&A and PE valuation multiple. Allows comparison across different capital structures.' },
  { name: 'P/E Ratio', cat: 'valuation', def: 'Market price per share divided by earnings per share.', formula: 'P/E = Share Price ÷ EPS' },
  { name: 'WACC', cat: 'valuation', def: 'Weighted Average Cost of Capital — the blended required return for all capital providers.', formula: 'WACC = (E/V × Re) + (D/V × Rd × (1−Tax))' },
  { name: 'LBO (Leveraged Buyout)', cat: 'valuation', def: 'An acquisition financed primarily with debt, where target cash flows service the debt. The core PE transaction structure.' },
  { name: 'IRR (Internal Rate of Return)', cat: 'valuation', def: 'The discount rate that makes NPV of cash flows equal zero. Top funds target 20-30%+ IRR.', formula: '0 = Σ CFt ÷ (1 + IRR)^t' },
  { name: 'Market Capitalization', cat: 'market', def: "The total market value of a company's outstanding shares.", formula: 'Market Cap = Share Price × Shares Outstanding' },
  { name: 'Hedge Fund', cat: 'market', def: 'An alternative investment fund using leverage, short selling, and derivatives to generate absolute returns.' },
  { name: 'IPO (Initial Public Offering)', cat: 'market', def: 'The first time a private company sells shares to the public. Investment banks underwrite, price, and allocate shares.' },
  { name: 'Leverage', cat: 'market', def: 'Using borrowed capital to amplify potential returns. Increases both upside and downside risk.', formula: 'Leverage Ratio = Total Debt ÷ Equity' },
  { name: 'Return on Equity (ROE)', cat: 'ratios', def: "Net income as a percentage of shareholders' equity.", formula: "ROE = Net Income ÷ Shareholders' Equity" },
  { name: 'Debt-to-Equity (D/E)', cat: 'ratios', def: "Total debt divided by shareholders' equity. Measures financial leverage." },
  { name: 'Current Ratio', cat: 'ratios', def: 'Current assets divided by current liabilities. A ratio below 1 signals potential liquidity stress.', formula: 'Current Ratio = Current Assets ÷ Current Liabilities' },
  { name: 'Net Profit Margin', cat: 'ratios', def: 'Net income as a percentage of revenue.', formula: 'Net Margin = Net Income ÷ Revenue' },
  { name: 'Stocks / Equities', cat: 'instruments', def: 'A share of ownership in a company. Shareholders receive dividends and benefit from capital appreciation.' },
  { name: 'Options', cat: 'instruments', def: 'Derivatives giving the holder the right (but not obligation) to buy (call) or sell (put) an asset at a specified strike price.' },
  { name: 'ETF (Exchange-Traded Fund)', cat: 'instruments', def: 'A basket of securities traded on an exchange like a stock. Combines diversification with intraday tradability.' },
  { name: 'Beta (β)', cat: 'risk', def: "Measures a stock's volatility relative to the overall market. β=1 moves with market; β>1 is more volatile.", formula: 'β = Cov(ri, rm) ÷ Var(rm)' },
  { name: 'Sharpe Ratio', cat: 'risk', def: 'Return per unit of total risk. A higher Sharpe ratio means better risk-adjusted returns.', formula: 'Sharpe = (Rp − Rf) ÷ σ' },
  { name: 'VaR (Value at Risk)', cat: 'risk', def: 'The maximum expected loss over a given time horizon at a specified confidence level.' },
  { name: 'Inflation', cat: 'macro', def: 'The rate at which the general price level rises over time. Measured by CPI and PCE in the US.' },
  { name: 'Yield Curve', cat: 'macro', def: 'A graph of bond yields across different maturities. Inverted yield curve (short > long) predicts recession.' },
  { name: 'Compound Interest', cat: 'macro', def: 'Interest calculated on both principal and accumulated interest over time.', formula: 'FV = PV × (1 + r)^n' },
  { name: 'M&A (Mergers & Acquisitions)', cat: 'banking', def: 'Transactions where companies combine or one acquires another. Banks advise on structure, valuation, and negotiation.' },
  { name: 'Bulge Bracket', cat: 'banking', def: 'The largest global investment banks — Goldman Sachs, Morgan Stanley, JPMorgan, Bank of America, Citi, Barclays, Deutsche Bank.' },
  { name: 'Pitch Book', cat: 'banking', def: 'A presentation prepared by investment banks to win mandates or present deal ideas to clients.' },
  { name: 'Accretion/Dilution', cat: 'banking', def: "In M&A, whether a deal increases (accretive) or decreases (dilutive) the acquirer's EPS." },
];

const CAT_ACCENT = {
  balance:     { bg: '#eff6ff', text: '#1d4ed8' },
  income:      { bg: '#f0fdf4', text: '#15803d' },
  cashflow:    { bg: '#ecfdf5', text: '#047857' },
  valuation:   { bg: '#f5f3ff', text: '#6d28d9' },
  market:      { bg: '#fffbeb', text: '#b45309' },
  ratios:      { bg: '#fff7ed', text: '#c2410c' },
  instruments: { bg: '#fdf2f8', text: '#a21caf' },
  risk:        { bg: '#f8fafc', text: '#475569' },
  macro:       { bg: '#f0fdf4', text: '#166534' },
  banking:     { bg: '#eff6ff', text: '#1e40af' },
};

// ─── UNIVERSITIES DATA (80 universities from global database) ─────────────────

const UNIS = [
  {"university":"Harvard University","region":"North America","country":"USA","city":"Cambridge, MA","status":"target","financeRank":"Top 3","network":"elite","gpa":"3.9+","clubs":"Harvard Finance Club, HBS Capital Markets","topFirms":"Goldman Sachs, Morgan Stanley, Blackstone","clubAlumniGo":"GS, MS, JPM, Blackstone, KKR, Citadel","notableAlumni":"Lloyd Blankfein, Sheryl Sandberg","qs":"5","tuition":"$57,261","tips":"Ultimate target; PE/HF back-door via GS/MS"},
  {"university":"Wharton (UPenn)","region":"North America","country":"USA","city":"Philadelphia, PA","status":"target","financeRank":"#1 Finance","network":"elite","gpa":"3.9+","clubs":"Wharton Finance Club, PE/VC Club, M&A Group","topFirms":"Goldman Sachs, Evercore, McKinsey","clubAlumniGo":"GS, Evercore, PJT, Blackstone, Apollo","notableAlumni":"Warren Buffett, Steve Ballmer","qs":"7","tuition":"$63,452","tips":"Most BB analysts globally; #1 finance brand"},
  {"university":"Stanford University","region":"North America","country":"USA","city":"Stanford, CA","status":"target","financeRank":"Top 5","network":"elite","gpa":"3.9+","clubs":"Stanford Finance Club, Cardinal Capital","topFirms":"Goldman Sachs, KKR, Andreessen Horowitz","clubAlumniGo":"GS, KKR, a16z, Sequoia, McKinsey","notableAlumni":"Phil Knight, Peter Thiel","qs":"2","tuition":"$62,484","tips":"Best for VC/PE; tech finance overlap"},
  {"university":"MIT","region":"North America","country":"USA","city":"Cambridge, MA","status":"target","financeRank":"Top 5 (Quant)","network":"elite","gpa":"3.9+","clubs":"MIT Finance Club, Quant Finance Group","topFirms":"Citadel, Jane Street, Two Sigma","clubAlumniGo":"Citadel, Jane Street, Two Sigma, DE Shaw","notableAlumni":"Robert Merton, Andrew Lo","qs":"4","tuition":"$57,986","tips":"Best for quant/HFT roles globally"},
  {"university":"Yale University","region":"North America","country":"USA","city":"New Haven, CT","status":"target","financeRank":"Top 10","network":"elite","gpa":"3.9+","clubs":"Yale Finance Society, Yale Endowment Scholars","topFirms":"Goldman Sachs, Morgan Stanley, Bridgewater","clubAlumniGo":"GS, MS, Bridgewater, Bain Cap","notableAlumni":"Stephen Schwarzman, David Swensen","qs":"18","tuition":"$62,250","tips":"Bridgewater's #1 feeder school"},
  {"university":"Princeton University","region":"North America","country":"USA","city":"Princeton, NJ","status":"target","financeRank":"Top 10","network":"elite","gpa":"3.9+","clubs":"Princeton Finance Club, Tiger Cub Society","topFirms":"Goldman Sachs, Citadel, DE Shaw","clubAlumniGo":"GS, Citadel, DE Shaw, Two Sigma","notableAlumni":"Jeff Bezos, Eric Schmidt","qs":"20","tuition":"$59,710","tips":"Heavy quant/HF feeder; Tiger Cubs origin"},
  {"university":"Columbia University","region":"North America","country":"USA","city":"New York, NY","status":"target","financeRank":"Top 5","network":"elite","gpa":"3.9+","clubs":"Columbia Finance Society, CU Investment Club","topFirms":"Goldman Sachs, Morgan Stanley, Lazard","clubAlumniGo":"GS, MS, Lazard, Evercore, Apollo","notableAlumni":"Warren Buffett (studied here)","qs":"8","tuition":"$65,000","tips":"NYC location = unmatched internship access"},
  {"university":"UChicago","region":"North America","country":"USA","city":"Chicago, IL","status":"target","financeRank":"Top 5","network":"elite","gpa":"3.9+","clubs":"UChicago Finance Society, Quant Trading Group","topFirms":"Goldman Sachs, McKinsey, Citadel","clubAlumniGo":"GS, Citadel, McKinsey, Bridgewater","notableAlumni":"Eugene Fama, Milton Friedman","qs":"10","tuition":"$62,352","tips":"Strongest economics theory background"},
  {"university":"Dartmouth College","region":"North America","country":"USA","city":"Hanover, NH","status":"target","financeRank":"Top 10","network":"elite","gpa":"3.8+","clubs":"Dartmouth Finance Society, Tuck Bridge Club","topFirms":"Goldman Sachs, Morgan Stanley, Bain","clubAlumniGo":"GS, MS, Bain, LEK Consulting","notableAlumni":"Timothy Geithner","qs":"30","tuition":"$62,430","tips":"Small school, elite network punch"},
  {"university":"Cornell University","region":"North America","country":"USA","city":"Ithaca, NY","status":"target","financeRank":"Top 15","network":"strong","gpa":"3.7+","clubs":"Cornell IB Club, AEM Finance Association","topFirms":"Goldman Sachs, JP Morgan, Evercore","clubAlumniGo":"GS, JPM, Evercore, Citi","notableAlumni":"Vikram Pandit (Citi CEO)","qs":"22","tuition":"$62,456","tips":"ILR/AEM strongest finance pathways"},
  {"university":"Duke University","region":"North America","country":"USA","city":"Durham, NC","status":"target","financeRank":"Top 15","network":"strong","gpa":"3.8+","clubs":"Duke Capital Group, Fuqua Finance Club","topFirms":"Goldman Sachs, Bank of America, McKinsey","clubAlumniGo":"GS, BofA, McKinsey, Carlyle","notableAlumni":"Tim Cook (Duke MBA)","qs":"26","tuition":"$62,688","tips":"Strong south-east finance network"},
  {"university":"Northwestern University","region":"North America","country":"USA","city":"Evanston, IL","status":"target","financeRank":"Top 15","network":"strong","gpa":"3.8+","clubs":"Kellogg Finance Club, NU Investment Group","topFirms":"Goldman Sachs, JP Morgan, Morningstar","clubAlumniGo":"GS, JPM, Morningstar, Baird","notableAlumni":"Janet Napolitano","qs":"33","tuition":"$63,468","tips":"Midwest target; Kellogg MBA feeder"},
  {"university":"NYU Stern","region":"North America","country":"USA","city":"New York, NY","status":"target","financeRank":"Top 7 Finance","network":"strong","gpa":"3.7+","clubs":"Stern IB Club, Stern Finance Society","topFirms":"Goldman Sachs, Citi, Morgan Stanley","clubAlumniGo":"GS, Citi, MS, Barclays","notableAlumni":"Alan Greenspan","qs":"58","tuition":"$58,168","tips":"NYC location; finance-specialist undergrad"},
  {"university":"Brown University","region":"North America","country":"USA","city":"Providence, RI","status":"semi","financeRank":"Top 20","network":"strong","gpa":"3.7+","clubs":"Brown Finance Group, Brown VC Club","topFirms":"Goldman Sachs, Lazard, Citi","clubAlumniGo":"GS, Lazard, Citi, boutiques","notableAlumni":"John D. Rockefeller III","qs":"73","tuition":"$65,656","tips":"Liberal arts edge; strong boutique placement"},
  {"university":"Georgetown University","region":"North America","country":"USA","city":"Washington, DC","status":"semi","financeRank":"Top 20","network":"strong","gpa":"3.7+","clubs":"Georgetown Finance Club, GU Investment Club","topFirms":"Goldman Sachs, World Bank, Lazard","clubAlumniGo":"GS, World Bank, Lazard, boutiques","notableAlumni":"Bill Clinton (Law School)","qs":"95","tuition":"$60,216","tips":"DC = PE/policy/IMF opportunities"},
  {"university":"Univ. of Michigan (Ross)","region":"North America","country":"USA","city":"Ann Arbor, MI","status":"semi","financeRank":"Top 10 Business","network":"strong","gpa":"3.7+","clubs":"Ross IB Workshop, Wolverine Investors","topFirms":"Goldman Sachs, JP Morgan, Citi","clubAlumniGo":"GS, JPM, Citi, Deloitte","notableAlumni":"Larry Page (CS, not Ross)","qs":"37","tuition":"$52,266","tips":"Best public school for IB; strong alumni"},
  {"university":"UVA (McIntire)","region":"North America","country":"USA","city":"Charlottesville, VA","status":"semi","financeRank":"Top 12 Business","network":"strong","gpa":"3.6+","clubs":"McIntire Finance Association, IB Workshop","topFirms":"Goldman Sachs, Bank of America, Citi","clubAlumniGo":"GS, BofA, Citi, Houlihan Lokey","notableAlumni":"Edgar Shannon Jr.","qs":"200","tuition":"$52,342","tips":"McIntire commerce = strong semi-target path"},
  {"university":"UCLA (Anderson)","region":"North America","country":"USA","city":"Los Angeles, CA","status":"semi","financeRank":"Top 15 Business","network":"moderate","gpa":"3.7+","clubs":"UCLA Anderson Finance, Bruin Capital","topFirms":"Goldman Sachs, Citi, Oaktree Capital","clubAlumniGo":"GS, Citi, Oaktree, LA boutiques","notableAlumni":"Gary Winnick","qs":"40","tuition":"$46,326","tips":"LA PE/VC scene growing fast"},
  {"university":"UC Berkeley (Haas)","region":"North America","country":"USA","city":"Berkeley, CA","status":"semi","financeRank":"Top 7 Business","network":"strong","gpa":"3.7+","clubs":"Haas Finance Assoc., Cal Investment Club","topFirms":"Goldman Sachs, Wells Fargo, a16z","clubAlumniGo":"GS, WF, a16z, Sequoia (VC)","notableAlumni":"Eric Schmidt (PhD CS)","qs":"38","tuition":"$44,066","tips":"Best for tech finance & VC on West Coast"},
  {"university":"Carnegie Mellon (Tepper)","region":"North America","country":"USA","city":"Pittsburgh, PA","status":"semi","financeRank":"Top 10 Quant","network":"strong","gpa":"3.8+","clubs":"Tepper Finance Club, CMU Quant Group","topFirms":"Citadel, Jane Street, Goldman Sachs","clubAlumniGo":"Citadel, Jane Street, GS (quant), HFT","notableAlumni":"Raj Rajat (MS CS)","qs":"52","tuition":"$60,468","tips":"Top quant/algo trading school"},
  {"university":"Vanderbilt University","region":"North America","country":"USA","city":"Nashville, TN","status":"semi","financeRank":"Top 15","network":"moderate","gpa":"3.7+","clubs":"Vanderbilt Finance Club, Owen Bridge Program","topFirms":"Goldman Sachs, Citi, Deloitte","clubAlumniGo":"GS, Citi, Deloitte, regional banks","notableAlumni":"Al Gore (Law School)","qs":"207","tuition":"$60,348","tips":"Rising reputation; southern finance hub"},
  {"university":"Emory (Goizueta)","region":"North America","country":"USA","city":"Atlanta, GA","status":"semi","financeRank":"Top 20","network":"moderate","gpa":"3.6+","clubs":"Goizueta Finance Club, Emory IB Prep","topFirms":"Goldman Sachs, Bank of America, Citi","clubAlumniGo":"GS, BofA, Citi, regional banks","notableAlumni":"Bobby Goizueta (Coca-Cola CEO)","qs":"176","tuition":"$57,948","tips":"Atlanta hub; BofA HQ proximity"},
  {"university":"Notre Dame (Mendoza)","region":"North America","country":"USA","city":"Notre Dame, IN","status":"semi","financeRank":"Top 20","network":"strong","gpa":"3.6+","clubs":"ND Finance Club, ND Investment Club","topFirms":"Goldman Sachs, JP Morgan, Baird","clubAlumniGo":"GS, JPM, Baird, Robert W. Baird","notableAlumni":"Regis Philbin","qs":"121","tuition":"$60,301","tips":"Tight alumni loyalty; Catholic network"},
  {"university":"Indiana Univ. (Kelley)","region":"North America","country":"USA","city":"Bloomington, IN","status":"semi","financeRank":"Top 10 Business","network":"strong","gpa":"3.4+","clubs":"Kelley Finance Club, IB Workshop","topFirms":"JP Morgan, Goldman Sachs, EY","clubAlumniGo":"JPM, GS, EY, regional Midwest banks","notableAlumni":"Mark Cuban (dropped out IU)","qs":"—","tuition":"$37,172","tips":"IB Workshop = one of best in US for non-targets"},
  {"university":"Univ. of North Carolina (Kenan-Flagler)","region":"North America","country":"USA","city":"Chapel Hill, NC","status":"semi","financeRank":"Top 20 Business","network":"moderate","gpa":"3.5+","clubs":"Kenan-Flagler Finance Association","topFirms":"Bank of America, Citi, Goldman Sachs","clubAlumniGo":"BofA (Charlotte), Citi, regional banks","notableAlumni":"James Moelis","qs":"—","tuition":"$36,168","tips":"BofA HQ in Charlotte nearby"},
  {"university":"Univ. of Texas (McCombs)","region":"North America","country":"USA","city":"Austin, TX","status":"semi","financeRank":"Top 15 Business","network":"moderate","gpa":"3.5+","clubs":"McCombs Finance Club, UT Investment Group","topFirms":"Goldman Sachs, JP Morgan, Citi (TX)","clubAlumniGo":"GS (Houston), JPM (Dallas), regional PE","notableAlumni":"Michael Dell","qs":"211","tuition":"$40,032","tips":"Texas economy = energy finance + PE strong"},
  {"university":"Washington Univ. (Olin)","region":"North America","country":"USA","city":"St. Louis, MO","status":"semi","financeRank":"Top 20 Business","network":"moderate","gpa":"3.7+","clubs":"WashU Finance Club, Olin Investment Group","topFirms":"Goldman Sachs, JP Morgan, Citi","clubAlumniGo":"GS, JPM, Citi, regional boutiques","notableAlumni":"David Kemper","qs":"197","tuition":"$60,590","tips":"Rising brand; strong midwest network"},
  {"university":"Boston College (Carroll)","region":"North America","country":"USA","city":"Chestnut Hill, MA","status":"semi","financeRank":"Top 25","network":"moderate","gpa":"3.5+","clubs":"BC Finance Club, BC Investment Club","topFirms":"Goldman Sachs, Fidelity, State Street","clubAlumniGo":"GS, Fidelity, State Street, boutiques","notableAlumni":"Chris Matthews","qs":"—","tuition":"$65,082","tips":"Boston finance scene; Fidelity proximity"},
  {"university":"Rice University (Jones)","region":"North America","country":"USA","city":"Houston, TX","status":"semi","financeRank":"Top 20","network":"moderate","gpa":"3.7+","clubs":"Rice Finance Club, Rice Investment Club","topFirms":"Goldman Sachs, Citi, Deloitte","clubAlumniGo":"GS, Citi, energy finance firms","notableAlumni":"None prominent","qs":"162","tuition":"$54,960","tips":"Houston = energy finance hub; rising profile"},
  {"university":"Tufts University","region":"North America","country":"USA","city":"Medford, MA","status":"semi","financeRank":"Top 30","network":"moderate","gpa":"3.6+","clubs":"Tufts Finance Club, Tufts Investment Group","topFirms":"Goldman Sachs, State Street, Fidelity","clubAlumniGo":"GS, State Street, Fidelity, boutiques","notableAlumni":"None prominent","qs":"—","tuition":"$65,222","tips":"Boston location; liberal arts with finance focus"},
  {"university":"Georgetown McDonough","region":"North America","country":"USA","city":"Washington, DC","status":"semi","financeRank":"Top 20","network":"strong","gpa":"3.6+","clubs":"McDonough Finance Club, GU IB Prep","topFirms":"Goldman Sachs, World Bank, IMF","clubAlumniGo":"GS, World Bank, IMF, boutiques","notableAlumni":"None prominent","qs":"95","tuition":"$60,216","tips":"DC location = PE/policy/multilateral orgs"},
  {"university":"Boston University (Questrom)","region":"North America","country":"USA","city":"Boston, MA","status":"non-target","financeRank":"Top 30","network":"moderate","gpa":"3.5+","clubs":"BU Finance Association, Questrom IB Club","topFirms":"Fidelity, State Street, Liberty Mutual","clubAlumniGo":"Fidelity, State Street, boutiques","notableAlumni":"Marty Walsh","qs":"—","tuition":"$60,612","tips":"Hustle required; Boston location helps"},
  {"university":"Fordham (Gabelli)","region":"North America","country":"USA","city":"New York, NY","status":"non-target","financeRank":"Top 40","network":"moderate","gpa":"3.3+","clubs":"Gabelli Finance Club, Fordham IB Prep","topFirms":"Citi, JP Morgan, boutique IB","clubAlumniGo":"Citi, JPM, mid-market boutiques","notableAlumni":"Denzel Washington","qs":"—","tuition":"$57,668","tips":"NYC location compensates for rank"},
  {"university":"Baruch College (Zicklin)","region":"North America","country":"USA","city":"New York, NY","status":"non-target","financeRank":"Top 50","network":"moderate","gpa":"3.3+","clubs":"Baruch Finance & Economics Club","topFirms":"Goldman Sachs, Citi, Bloomberg","clubAlumniGo":"GS (back-office), Citi, Bloomberg","notableAlumni":"Felix Rohatyn","qs":"—","tuition":"$7,680","tips":"Best value in NYC; Bloomberg proximity"},
  {"university":"Rutgers Business School","region":"North America","country":"USA","city":"New Brunswick, NJ","status":"non-target","financeRank":"Top 55","network":"moderate","gpa":"3.2+","clubs":"Rutgers Finance Club, Rutgers IB Prep","topFirms":"JP Morgan, Goldman Sachs, Citi","clubAlumniGo":"JPM, GS (back-office), Citi, Big 4","notableAlumni":"Paul Volcker (Rutgers BA)","qs":"—","tuition":"$31,282","tips":"NJ/NYC proximity; hustle required"},
  {"university":"Lehigh University","region":"North America","country":"USA","city":"Bethlehem, PA","status":"non-target","financeRank":"Top 50","network":"moderate","gpa":"3.4+","clubs":"Lehigh Finance Club","topFirms":"JP Morgan, Goldman Sachs, boutiques","clubAlumniGo":"JPM, boutiques, accounting firms","notableAlumni":"Lee Iacocca","qs":"—","tuition":"$58,680","tips":"Strong alumni loyalty; semi-target potential"},
  {"university":"Ohio State (Fisher)","region":"North America","country":"USA","city":"Columbus, OH","status":"non-target","financeRank":"Top 30 Business","network":"moderate","gpa":"3.3+","clubs":"Fisher Finance Club, OSU Investment Group","topFirms":"JP Morgan, Citi, PwC","clubAlumniGo":"JPM, Citi, PwC, regional Midwest firms","notableAlumni":"Les Wexner","qs":"—","tuition":"$32,061","tips":"Strong Midwest alumni base; hustle required"},
  {"university":"Penn State (Smeal)","region":"North America","country":"USA","city":"State College, PA","status":"non-target","financeRank":"Top 30 Business","network":"moderate","gpa":"3.2+","clubs":"Smeal Finance Club, PSU Investment Club","topFirms":"JP Morgan, Citi, PwC","clubAlumniGo":"JPM, Citi, PwC, regional firms","notableAlumni":"—","qs":"—","tuition":"$35,514","tips":"Large alumni network; needs networking effort"},
  {"university":"Univ. of Illinois (Gies)","region":"North America","country":"USA","city":"Champaign, IL","status":"non-target","financeRank":"Top 20 Business","network":"moderate","gpa":"3.4+","clubs":"Gies Finance Club, Illini Investment Club","topFirms":"JP Morgan, Goldman Sachs, Citi","clubAlumniGo":"JPM, GS (back-office), Citi, Big 4","notableAlumni":"—","qs":"—","tuition":"$32,000","tips":"Rising quant reputation; CS crossover"},
  {"university":"Univ. of Wisconsin (Wisconsin SoB)","region":"North America","country":"USA","city":"Madison, WI","status":"non-target","financeRank":"Top 25 Business","network":"moderate","gpa":"3.3+","clubs":"WSB Finance Club, Badger Investment Group","topFirms":"Baird, JP Morgan, Citi","clubAlumniGo":"Baird, JPM, Citi, regional firms","notableAlumni":"—","qs":"—","tuition":"$33,523","tips":"Baird HQ in Milwaukee; regional strength"},
  {"university":"SMU (Cox)","region":"North America","country":"USA","city":"Dallas, TX","status":"non-target","financeRank":"Top 30 Business","network":"moderate","gpa":"3.3+","clubs":"Cox Finance Club, SMU Mustang Investment","topFirms":"Goldman Sachs, JP Morgan, Deloitte","clubAlumniGo":"GS, JPM, Deloitte, Dallas PE","notableAlumni":"—","qs":"—","tuition":"$58,816","tips":"Dallas PE scene; Texas network strong"},
  {"university":"Babson College","region":"North America","country":"USA","city":"Wellesley, MA","status":"non-target","financeRank":"Top 3 Entrepreneurship","network":"moderate","gpa":"3.4+","clubs":"Babson Finance & Entrepreneurship Club","topFirms":"Citi, JP Morgan, boutique PE","clubAlumniGo":"Citi, JPM, startup finance, boutiques","notableAlumni":"—","qs":"—","tuition":"$57,896","tips":"#1 entrepreneurship school; VC feeder"},
  {"university":"Wake Forest (School of Business)","region":"North America","country":"USA","city":"Winston-Salem, NC","status":"non-target","financeRank":"Top 30 Business","network":"moderate","gpa":"3.4+","clubs":"Wake Forest Finance Club","topFirms":"Goldman Sachs, Bank of America, Citi","clubAlumniGo":"GS, BofA, Citi, regional banks","notableAlumni":"—","qs":"—","tuition":"$62,758","tips":"BofA proximity in Charlotte; hustle required"},
  {"university":"Tulane (Freeman)","region":"North America","country":"USA","city":"New Orleans, LA","status":"non-target","financeRank":"Top 35","network":"moderate","gpa":"3.5+","clubs":"Freeman Finance Club","topFirms":"Citi, JP Morgan, regional banks","clubAlumniGo":"Citi, JPM, regional banks","notableAlumni":"—","qs":"—","tuition":"$60,000","tips":"Niche alumni loyalty; New Orleans hub"},
  {"university":"College of William & Mary (Mason)","region":"North America","country":"USA","city":"Williamsburg, VA","status":"non-target","financeRank":"Top 40","network":"moderate","gpa":"3.5+","clubs":"W&M Finance Club, Mason Investment Club","topFirms":"JP Morgan, PwC, Deloitte","clubAlumniGo":"JPM, PwC, Deloitte, regional firms","notableAlumni":"James Monroe (historical)","qs":"—","tuition":"$49,314","tips":"Strong DC/VA alumni base"},
  {"university":"University of Toronto (Rotman)","region":"North America","country":"Canada","city":"Toronto","status":"semi","financeRank":"Top 3 Canada","network":"strong","gpa":"3.6+","clubs":"Rotman Finance Association, UofT Investment","topFirms":"Goldman Sachs, TD, RBC","clubAlumniGo":"GS, TD, RBC, CIBC, boutiques","notableAlumni":"—","qs":"34","tuition":"C$58,000","tips":"Canada's top finance school; Bay Street feeder"},
  {"university":"McGill University (Desautels)","region":"North America","country":"Canada","city":"Montreal","status":"semi","financeRank":"Top 5 Canada","network":"moderate","gpa":"3.5+","clubs":"Desautels Finance Assoc., McGill Finance Society","topFirms":"Goldman Sachs, RBC, National Bank","clubAlumniGo":"GS, RBC, National Bank, boutiques","notableAlumni":"William Shatner (Arts Faculty)","qs":"46","tuition":"C$50,000","tips":"Montreal hub; bilingual advantage for EU"},
  {"university":"Western University (Ivey)","region":"North America","country":"Canada","city":"London, ON","status":"semi","financeRank":"Top 3 Canada Business","network":"strong","gpa":"3.5+","clubs":"Ivey Finance Club, Ivey Investment Club","topFirms":"Goldman Sachs, TD, Blackstone","clubAlumniGo":"GS, TD, Blackstone, Canadian PE","notableAlumni":"—","qs":"114","tuition":"C$47,000","tips":"Canada's Harvard for business; Bay Street feeder"},
  {"university":"Queen's University (Smith)","region":"North America","country":"Canada","city":"Kingston","status":"semi","financeRank":"Top 5 Canada Business","network":"moderate","gpa":"3.4+","clubs":"Queen's Finance Association, QSC Investment","topFirms":"RBC, TD, Goldman Sachs","clubAlumniGo":"RBC, TD, GS, boutiques Canada","notableAlumni":"—","qs":"—","tuition":"C$43,000","tips":"Strong alumni loyalty; Bay Street semi-target"},
  {"university":"London School of Economics","region":"Europe","country":"UK","city":"London","status":"target","financeRank":"Top 3 (UK)","network":"elite","gpa":"3.8+","clubs":"LSE Finance Society, LSE Capital","topFirms":"Goldman Sachs, Morgan Stanley, Barclays","clubAlumniGo":"GS, MS, Barclays, HSBC, IMF","notableAlumni":"George Soros, Mick Jagger","qs":"50","tuition":"£28,000","tips":"Europe's top IB feeder; global brand"},
  {"university":"University of Oxford","region":"Europe","country":"UK","city":"Oxford","status":"target","financeRank":"Top 5 Global","network":"elite","gpa":"3.9+","clubs":"Oxford Finance Society, Oxford Capital Partners","topFirms":"Goldman Sachs, McKinsey, Rothschild","clubAlumniGo":"GS, McKinsey, Rothschild, government","notableAlumni":"Rupert Murdoch (Magdalen)","qs":"3","tuition":"£9,250","tips":"Prestige beyond finance; generalist target"},
  {"university":"University of Cambridge","region":"Europe","country":"UK","city":"Cambridge","status":"target","financeRank":"Top 5 Global","network":"elite","gpa":"3.9+","clubs":"Cambridge Finance Society, CUER Trading","topFirms":"Goldman Sachs, Morgan Stanley, Barclays","clubAlumniGo":"GS, MS, Barclays, BCG","notableAlumni":"John Maynard Keynes","qs":"2","tuition":"£9,250","tips":"Theory-heavy; renowned economics tradition"},
  {"university":"Imperial College London","region":"Europe","country":"UK","city":"London","status":"target","financeRank":"Top 10 (UK)","network":"strong","gpa":"3.7+","clubs":"Imperial Finance & Quant Society","topFirms":"Goldman Sachs, Citadel, Barclays","clubAlumniGo":"GS (quant), Citadel, Barclays, Jane Street","notableAlumni":"Brian May (PhD Physics)","qs":"8","tuition":"£36,000","tips":"Best quant/engineering crossover in UK"},
  {"university":"University College London (UCL)","region":"Europe","country":"UK","city":"London","status":"semi","financeRank":"Top 8 (UK)","network":"strong","gpa":"3.6+","clubs":"UCL Finance Society, UCL Investment Club","topFirms":"Goldman Sachs, Barclays, HSBC","clubAlumniGo":"GS, Barclays, HSBC, boutiques","notableAlumni":"Rishi Sunak (PPE at Oxford)","qs":"9","tuition":"£32,000","tips":"London location; strong semi-target"},
  {"university":"University of Edinburgh","region":"Europe","country":"UK","city":"Edinburgh","status":"semi","financeRank":"Top 12 (UK)","network":"moderate","gpa":"3.5+","clubs":"Edinburgh Finance Society, Balhousie Capital","topFirms":"Barclays, KPMG, Standard Life","clubAlumniGo":"Barclays, KPMG, Standard Life, boutiques","notableAlumni":"Gordon Brown","qs":"22","tuition":"£26,500","tips":"Scottish finance hub; rising profile"},
  {"university":"University of Warwick","region":"Europe","country":"UK","city":"Coventry","status":"semi","financeRank":"Top 10 (UK)","network":"strong","gpa":"3.6+","clubs":"Warwick Finance Society, WBS Investment Club","topFirms":"Goldman Sachs, Citi, Deutsche Bank","clubAlumniGo":"GS, Citi, Deutsche, boutiques","notableAlumni":"—","qs":"67","tuition":"£27,670","tips":"Strong target for UK finance; rising brand"},
  {"university":"University of Manchester","region":"Europe","country":"UK","city":"Manchester","status":"non-target","financeRank":"Top 15 (UK)","network":"moderate","gpa":"3.4+","clubs":"Manchester Finance Society","topFirms":"Barclays, KPMG, PwC","clubAlumniGo":"Barclays, KPMG, PwC, regional firms","notableAlumni":"—","qs":"32","tuition":"£26,000","tips":"Northern UK hub; Big 4 strong"},
  {"university":"King's College London","region":"Europe","country":"UK","city":"London","status":"semi","financeRank":"Top 12 (UK)","network":"moderate","gpa":"3.5+","clubs":"KCL Finance Society, KCL Trading","topFirms":"Goldman Sachs, Barclays, Citi","clubAlumniGo":"GS, Barclays, Citi, boutiques","notableAlumni":"—","qs":"40","tuition":"£30,000","tips":"London location key advantage"},
  {"university":"INSEAD","region":"Europe","country":"France","city":"Fontainebleau","status":"target","financeRank":"Top 3 MBA (Global)","network":"elite","gpa":"N/A (work exp)","clubs":"INSEAD Private Equity Club, Finance Club","topFirms":"Goldman Sachs, McKinsey, Blackstone","clubAlumniGo":"GS, McKinsey, Blackstone, EU PE funds","notableAlumni":"Lindsay Owen-Jones","qs":"1","tuition":"€95,000 (MBA)","tips":"#1 MBA in Europe; PE/consulting focus"},
  {"university":"HEC Paris","region":"Europe","country":"France","city":"Paris","status":"target","financeRank":"Top 3 EU Business","network":"elite","gpa":"N/A","clubs":"HEC Finance Club, HEC PE Club","topFirms":"BNP Paribas, Société Générale, Goldman Sachs","clubAlumniGo":"BNP, SocGen, GS Paris, Rothschild Paris","notableAlumni":"Bernard Arnault (LVMH)","qs":"23","tuition":"€16,190","tips":"France's #1 business school"},
  {"university":"École Polytechnique","region":"Europe","country":"France","city":"Palaiseau","status":"target","financeRank":"Top 5 EU STEM","network":"strong","gpa":"N/A","clubs":"Polytechnique Finance & Quant Group","topFirms":"Société Générale, BNP Paribas, Citadel","clubAlumniGo":"SocGen (quant), BNP, Citadel EU","notableAlumni":"—","qs":"58","tuition":"€5,000","tips":"France's MIT; top quant finance path"},
  {"university":"ESSEC Business School","region":"Europe","country":"France","city":"Cergy","status":"semi","financeRank":"Top 5 EU Business","network":"strong","gpa":"N/A","clubs":"ESSEC Finance Association","topFirms":"BNP Paribas, Société Générale, LVMH","clubAlumniGo":"BNP, SocGen, boutiques EU","notableAlumni":"—","qs":"—","tuition":"€15,000","tips":"Strong luxury & banking network in France"},
  {"university":"WHU – Otto Beisheim School","region":"Europe","country":"Germany","city":"Vallendar","status":"semi","financeRank":"Top 3 Germany","network":"strong","gpa":"N/A","clubs":"WHU Finance Club, WHU Investment Club","topFirms":"Goldman Sachs, McKinsey, Deutsche Bank","clubAlumniGo":"GS, McKinsey, Deutsche Bank, BCG","notableAlumni":"—","qs":"—","tuition":"€20,000","tips":"Germany's top private business school"},
  {"university":"Goethe University Frankfurt","region":"Europe","country":"Germany","city":"Frankfurt","status":"semi","financeRank":"Top 5 Germany Finance","network":"strong","gpa":"3.5+","clubs":"Goethe Finance Association, JoFinance","topFirms":"Deutsche Bank, Commerzbank, ECB","clubAlumniGo":"Deutsche Bank, Commerzbank, ECB, BCG","notableAlumni":"—","qs":"—","tuition":"€350/semester","tips":"Frankfurt = EU financial capital; ECB proximity"},
  {"university":"Bocconi University","region":"Europe","country":"Italy","city":"Milan","status":"semi","financeRank":"Top 3 EU Business","network":"strong","gpa":"3.6+","clubs":"Bocconi Finance Club, Bocconi Investment Society","topFirms":"Goldman Sachs, McKinsey, Mediobanca","clubAlumniGo":"GS, McKinsey, Mediobanca, Italian PE","notableAlumni":"Giorgio Armani (attended)","qs":"—","tuition":"€14,000","tips":"Italy's #1; gateway to EU finance"},
  {"university":"IE Business School","region":"Europe","country":"Spain","city":"Madrid","status":"semi","financeRank":"Top 5 EU MBA","network":"moderate","gpa":"N/A","clubs":"IE Finance Club, IE Investment Club","topFirms":"Goldman Sachs, Santander, BBVA","clubAlumniGo":"GS, Santander, BBVA, boutiques EU","notableAlumni":"—","qs":"—","tuition":"€85,000 (MBA)","tips":"Spain's top school; strong Latin America link"},
  {"university":"Rotterdam School of Management (Erasmus)","region":"Europe","country":"Netherlands","city":"Rotterdam","status":"semi","financeRank":"Top 5 Netherlands","network":"moderate","gpa":"3.5+","clubs":"RSM Finance Association","topFirms":"ING, Rabobank, Goldman Sachs","clubAlumniGo":"ING, Rabobank, GS, boutiques EU","notableAlumni":"—","qs":"—","tuition":"€12,000","tips":"Netherlands' top finance school"},
  {"university":"Stockholm School of Economics","region":"Europe","country":"Sweden","city":"Stockholm","status":"semi","financeRank":"Top 3 Scandinavia","network":"strong","gpa":"3.6+","clubs":"SSE Finance Society, SSE Investment Club","topFirms":"Goldman Sachs, SEB, Handelsbanken","clubAlumniGo":"GS, SEB, Handelsbanken, boutiques","notableAlumni":"—","qs":"—","tuition":"Free (EU)","tips":"Scandinavia's top business school; PE scene growing"},
  {"university":"Copenhagen Business School","region":"Europe","country":"Denmark","city":"Copenhagen","status":"non-target","financeRank":"Top 5 Scandinavia","network":"moderate","gpa":"3.4+","clubs":"CBS Finance Association","topFirms":"Nordea, Jyske Bank, McKinsey","clubAlumniGo":"Nordea, McKinsey, regional boutiques","notableAlumni":"—","qs":"—","tuition":"Free (EU)","tips":"Danish hub; Nordic PE growing"},
  {"university":"Swiss Federal Institute (ETH Zurich)","region":"Europe","country":"Switzerland","city":"Zurich","status":"semi","financeRank":"Top 5 Europe (STEM)","network":"strong","gpa":"3.7+","clubs":"ETH Finance & Quant Society","topFirms":"UBS, Credit Suisse (legacy), Citadel","clubAlumniGo":"UBS, Citadel, quant funds","notableAlumni":"Albert Einstein (attended)","qs":"7","tuition":"CHF 730/semester","tips":"Top quant path in continental Europe"},
  {"university":"University of St. Gallen (HSG)","region":"Europe","country":"Switzerland","city":"St. Gallen","status":"semi","financeRank":"Top 3 EU Business","network":"strong","gpa":"3.5+","clubs":"HSG Finance Club, HSG Investment Club","topFirms":"UBS, Goldman Sachs, boutiques EU","clubAlumniGo":"UBS, GS, boutiques EU, PE","notableAlumni":"—","qs":"—","tuition":"CHF 730/semester","tips":"Switzerland's top business school; strong network"},
  {"university":"National Univ. of Singapore (NUS)","region":"Asia-Pacific","country":"Singapore","city":"Singapore","status":"target","financeRank":"Top 5 Asia","network":"strong","gpa":"3.8+","clubs":"NUS Finance Society, NUS Investment Club","topFirms":"Goldman Sachs, DBS, Temasek","clubAlumniGo":"GS (APAC), DBS, Temasek, GIC","notableAlumni":"Goh Chok Tong","qs":"8","tuition":"S$38,000","tips":"Singapore's top finance feeder; APAC hub"},
  {"university":"Nanyang Technological University","region":"Asia-Pacific","country":"Singapore","city":"Singapore","status":"semi","financeRank":"Top 8 Asia","network":"strong","gpa":"3.7+","clubs":"NTU Finance Society, NTU Investment Club","topFirms":"DBS, OCBC, Goldman Sachs","clubAlumniGo":"DBS, OCBC, GS, boutiques APAC","notableAlumni":"—","qs":"15","tuition":"S$36,000","tips":"Singapore's #2; quant finance growing"},
  {"university":"Hong Kong Univ. of Science & Tech (HKUST)","region":"Asia-Pacific","country":"Hong Kong","city":"Hong Kong","status":"target","financeRank":"Top 3 HK","network":"strong","gpa":"3.7+","clubs":"HKUST Finance Association, HKUST Investment","topFirms":"Goldman Sachs, Morgan Stanley, HSBC","clubAlumniGo":"GS, MS, HSBC, Citi (HK)","notableAlumni":"—","qs":"28","tuition":"HK$140,000","tips":"HK's top quant/finance school; GS APAC feeder"},
  {"university":"University of Hong Kong (HKU)","region":"Asia-Pacific","country":"Hong Kong","city":"Hong Kong","status":"target","financeRank":"Top 5 HK","network":"strong","gpa":"3.6+","clubs":"HKU Finance Society, HKU Investment Club","topFirms":"Goldman Sachs, HSBC, JPMorgan","clubAlumniGo":"GS, HSBC, JPM (HK), boutiques","notableAlumni":"Chris Patten (governor)","qs":"26","tuition":"HK$145,000","tips":"HK's oldest university; strong HSBC feeder"},
  {"university":"Peking University","region":"Asia-Pacific","country":"China","city":"Beijing","status":"semi","financeRank":"Top 3 China","network":"strong","gpa":"3.8+","clubs":"PKU Finance Club, PKU Investment Society","topFirms":"Goldman Sachs, CITIC, Morgan Stanley","clubAlumniGo":"GS (Beijing), CITIC, MS, domestic banks","notableAlumni":"Various Chinese political leaders","qs":"17","tuition":"¥5,000/yr","tips":"China's Harvard; strong for domestic IB"},
  {"university":"Tsinghua University","region":"Asia-Pacific","country":"China","city":"Beijing","status":"semi","financeRank":"Top 3 China","network":"strong","gpa":"3.8+","clubs":"Tsinghua Finance Club, THUQS Quant Group","topFirms":"Goldman Sachs, McKinsey, CITIC","clubAlumniGo":"GS, McKinsey, CITIC, domestic banks","notableAlumni":"Hu Jintao (political)","qs":"25","tuition":"¥5,000/yr","tips":"China's MIT; top quant finance path in China"},
  {"university":"Fudan University","region":"Asia-Pacific","country":"China","city":"Shanghai","status":"semi","financeRank":"Top 5 China","network":"moderate","gpa":"3.7+","clubs":"Fudan Finance Association","topFirms":"Citi, Goldman Sachs, CITIC","clubAlumniGo":"Citi, GS, CITIC, domestic banks","notableAlumni":"—","qs":"39","tuition":"¥5,000/yr","tips":"Shanghai hub; strong for domestic IB"},
  {"university":"Seoul National University","region":"Asia-Pacific","country":"South Korea","city":"Seoul","status":"semi","financeRank":"Top 3 Korea","network":"strong","gpa":"3.8+","clubs":"SNU Finance Club, SNU Investment Group","topFirms":"Goldman Sachs, Samsung Securities, KB","clubAlumniGo":"GS (Seoul), Samsung Sec., KB, KDB","notableAlumni":"—","qs":"31","tuition":"₩4,000,000/yr","tips":"Korea's top university; Samsung/conglomerate feeder"},
  {"university":"Yonsei University","region":"Asia-Pacific","country":"South Korea","city":"Seoul","status":"non-target","financeRank":"Top 5 Korea","network":"moderate","gpa":"3.6+","clubs":"Yonsei Finance Society","topFirms":"Goldman Sachs, Samsung Securities, Mirae","clubAlumniGo":"GS (Seoul), Samsung Sec., Mirae Asset","notableAlumni":"—","qs":"79","tuition":"₩8,000,000/yr","tips":"Strong for Korean domestic finance jobs"},
  {"university":"University of Tokyo","region":"Asia-Pacific","country":"Japan","city":"Tokyo","status":"semi","financeRank":"Top 3 Japan","network":"strong","gpa":"3.8+","clubs":"UTokyo Finance Club, Todai Investment Group","topFirms":"Goldman Sachs, Nomura, McKinsey","clubAlumniGo":"GS (Tokyo), Nomura, McKinsey, MoF","notableAlumni":"Various Japanese PMs","qs":"28","tuition":"¥535,800/yr","tips":"Japan's top university; Nomura/MoF feeder"},
  {"university":"Keio University","region":"Asia-Pacific","country":"Japan","city":"Tokyo","status":"non-target","financeRank":"Top 5 Japan","network":"moderate","gpa":"3.6+","clubs":"Keio Finance Club","topFirms":"Nomura, Daiwa, Mizuho","clubAlumniGo":"Nomura, Daiwa, Mizuho, domestic banks","notableAlumni":"—","qs":"—","tuition":"¥1,500,000/yr","tips":"Tokyo private school; strong alumni loyalty"},
  {"university":"University of Melbourne","region":"Asia-Pacific","country":"Australia","city":"Melbourne","status":"non-target","financeRank":"Top 3 Australia","network":"moderate","gpa":"3.6+","clubs":"UniMelb Finance Club, MU Investment Society","topFirms":"Macquarie Group, NAB, Goldman Sachs","clubAlumniGo":"Macquarie, NAB, GS, boutiques AU","notableAlumni":"—","qs":"33","tuition":"A$48,000","tips":"Australia's #2; strong PE scene in Melbourne"},
  {"university":"University of Sydney","region":"Asia-Pacific","country":"Australia","city":"Sydney","status":"non-target","financeRank":"Top 5 Australia","network":"moderate","gpa":"3.5+","clubs":"USyd Finance Society, USyd Investment Club","topFirms":"Goldman Sachs, Macquarie, CBA","clubAlumniGo":"GS AU, Macquarie, CBA, boutiques","notableAlumni":"—","qs":"18","tuition":"A$47,000","tips":"Sydney finance hub; Macquarie feeder"},
  {"university":"Australian National University","region":"Asia-Pacific","country":"Australia","city":"Canberra","status":"non-target","financeRank":"Top 3 Australia","network":"moderate","gpa":"3.6+","clubs":"ANU Finance Society","topFirms":"Macquarie Group, ANZ, KPMG","clubAlumniGo":"Macquarie, ANZ, KPMG, boutiques","notableAlumni":"—","qs":"30","tuition":"A$46,000","tips":"Australia's policy/government finance hub"},
  {"university":"Indian Institute of Management Ahmedabad","region":"Asia-Pacific","country":"India","city":"Ahmedabad","status":"semi","financeRank":"Top 1 India (MBA)","network":"strong","gpa":"N/A","clubs":"IIMA Finance Club, IIMA Investment Group","topFirms":"Goldman Sachs, McKinsey, Kotak","clubAlumniGo":"GS, McKinsey, Kotak, Indian PE","notableAlumni":"Raghuram Rajan (IIM-B not A)","qs":"—","tuition":"₹2,300,000 (MBA)","tips":"India's #1 MBA; top domestic IB/PE feeder"},
  {"university":"Indian Institute of Technology Bombay","region":"Asia-Pacific","country":"India","city":"Mumbai","status":"semi","financeRank":"Top 3 India (Tech+Finance)","network":"strong","gpa":"3.8+","clubs":"IIT Bombay Finance Club, Finance Quant Group","topFirms":"Goldman Sachs, McKinsey, DE Shaw","clubAlumniGo":"GS (quant), McKinsey, DE Shaw, Citadel","notableAlumni":"—","qs":"149","tuition":"₹250,000/yr","tips":"India's MIT; quant finance crossover strong"},
  {"university":"American University of Beirut","region":"Middle East/Africa","country":"Lebanon","city":"Beirut","status":"non-target","financeRank":"Top 3 MENA","network":"moderate","gpa":"3.4+","clubs":"AUB Finance Club, AUB Investment Society","topFirms":"Citi, HSBC, Audi Bank","clubAlumniGo":"Citi, HSBC, regional banks, boutiques MENA","notableAlumni":"—","qs":"—","tuition":"$25,000","tips":"Top MENA school; regional banking feeder"},
  {"university":"American University in Cairo","region":"Middle East/Africa","country":"Egypt","city":"Cairo","status":"non-target","financeRank":"Top 5 MENA","network":"moderate","gpa":"3.3+","clubs":"AUC Finance Club","topFirms":"EFG Hermes, Citi, HSBC","clubAlumniGo":"EFG Hermes, Citi, regional banks","notableAlumni":"—","qs":"—","tuition":"$20,000","tips":"Egypt hub; EFG Hermes feeder"},
  {"university":"University of Cape Town (GSB)","region":"Middle East/Africa","country":"South Africa","city":"Cape Town","status":"non-target","financeRank":"Top 3 Africa","network":"moderate","gpa":"3.5+","clubs":"UCT Finance Society, GSB Investment Club","topFirms":"Goldman Sachs, Standard Bank, Rand Merchant","clubAlumniGo":"GS SA, Standard Bank, RMB, boutiques","notableAlumni":"Elon Musk (Queen's then Wharton)","qs":"—","tuition":"R80,000","tips":"Africa's top finance school; SA hub"},
  {"university":"University of the Witwatersrand","region":"Middle East/Africa","country":"South Africa","city":"Johannesburg","status":"non-target","financeRank":"Top 5 Africa","network":"moderate","gpa":"3.4+","clubs":"Wits Finance Club","topFirms":"Standard Bank, Rand Merchant Bank, Deloitte","clubAlumniGo":"Standard Bank, RMB, Deloitte","notableAlumni":"Cyril Ramaphosa (law not Wits commerce)","qs":"—","tuition":"R85,000","tips":"Jo'burg finance hub; Standard Bank feeder"},
  {"university":"Fundação Getulio Vargas (FGV)","region":"Latin America","country":"Brazil","city":"São Paulo","status":"non-target","financeRank":"Top 3 LatAm","network":"moderate","gpa":"3.5+","clubs":"FGV Finance Club","topFirms":"Goldman Sachs, BTG Pactual, Itaú BBA","clubAlumniGo":"GS, BTG Pactual, Itaú BBA, local PE","notableAlumni":"—","qs":"—","tuition":"R$45,000","tips":"Brazil's top finance school; BTG feeder"},
  {"university":"Universidad de los Andes (Colombia)","region":"Latin America","country":"Colombia","city":"Bogotá","status":"non-target","financeRank":"Top 3 LatAm","network":"moderate","gpa":"3.4+","clubs":"Uniandes Finance Club","topFirms":"JP Morgan, Citi, Davivienda","clubAlumniGo":"JPM, Citi, Davivienda, regional boutiques","notableAlumni":"—","qs":"—","tuition":"$25,000","tips":"Colombia's top school; Bogotá finance hub"},
  {"university":"ITAM (Mexico)","region":"Latin America","country":"Mexico","city":"Mexico City","status":"non-target","financeRank":"Top 3 Mexico","network":"moderate","gpa":"3.5+","clubs":"ITAM Finance Society","topFirms":"Goldman Sachs, Citi Banamex, HSBC","clubAlumniGo":"GS, Citi Banamex, HSBC, regional PE","notableAlumni":"—","qs":"—","tuition":"$12,000","tips":"Mexico's top economics school; Citi Banamex feeder"},
];

// ─── FILTER OPTIONS ───────────────────────────────────────────────────────────

const REGIONS  = ['All', 'North America', 'Europe', 'Asia-Pacific', 'Middle East/Africa', 'Latin America'];
const COUNTRIES = ['All', 'USA', 'UK', 'Canada', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Denmark', 'Switzerland', 'Singapore', 'Hong Kong', 'China', 'South Korea', 'Japan', 'Australia', 'India', 'Lebanon', 'Egypt', 'South Africa', 'Brazil', 'Colombia', 'Mexico'];
const STATUSES = ['All', 'Target', 'Semi-Target', 'Non-Target'];

// ─── TERM CARD ────────────────────────────────────────────────────────────────

function TermCard({ term }) {
  const [open, setOpen] = useState(false);
  const label  = CATS.find(c => c.id === term.cat)?.label ?? term.cat;
  const accent = CAT_ACCENT[term.cat] ?? { bg: 'var(--bg-muted)', text: 'var(--text-secondary)' };

  return (
    <div
      onClick={() => setOpen(o => !o)}
      className="cursor-pointer rounded-xl border transition-all duration-150 p-4"
      style={{
        background: open ? 'var(--bg-subtle)' : 'var(--bg-base)',
        borderColor: open ? 'var(--border-default)' : 'var(--border-soft)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{term.name}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: accent.bg, color: accent.text }}>
            {label}
          </span>
          <ChevronDown size={13} style={{ color: 'var(--text-disabled)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-soft)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{term.def}</p>
              {term.formula && (
                <div className="mt-2.5 font-mono text-xs px-3 py-2 rounded-lg border" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-soft)', color: 'var(--accent)' }}>
                  {term.formula}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── VOCAB TAB ────────────────────────────────────────────────────────────────

function VocabTab() {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const filtered = TERMS.filter(t => {
    const catOk = activeCat === 'all' || t.cat === activeCat;
    const q = query.toLowerCase();
    return catOk && (!q || t.name.toLowerCase().includes(q) || t.def.toLowerCase().includes(q));
  });

  return (
    <div>
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-disabled)' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any finance term…"
          className="w-full text-sm pl-9 pr-4 py-2.5 rounded-lg border focus:outline-none transition-all"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e  => (e.target.style.borderColor = 'var(--border-default)')}
        />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {CATS.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all"
            style={{
              background: activeCat === c.id ? 'var(--accent)' : 'var(--bg-subtle)',
              borderColor: activeCat === c.id ? 'var(--accent)' : 'var(--border-soft)',
              color: activeCat === c.id ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
        {filtered.length} term{filtered.length !== 1 ? 's' : ''} · tap to expand
      </p>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--text-tertiary)' }}>No terms found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map(t => <TermCard key={t.name} term={t} />)}
        </div>
      )}
    </div>
  );
}

// ─── UNIVERSITY CARD ──────────────────────────────────────────────────────────

function UniCard({ uni }) {
  const [open, setOpen] = useState(false);

  const statusStyle = {
    target:       { bg: '#f0fdf4', text: '#15803d', label: 'Target',      dot: '#22c55e' },
    semi:         { bg: '#fffbeb', text: '#b45309', label: 'Semi-Target', dot: '#f59e0b' },
    'non-target': { bg: '#f8fafc', text: '#64748b', label: 'Non-Target', dot: '#94a3b8' },
  }[uni.status];

  const networkColor = { elite: '#eab308', strong: '#22c55e', moderate: '#94a3b8' }[uni.network];
  const clubs = uni.clubs ? uni.clubs.split(',').map(c => c.trim()).filter(Boolean) : [];

  return (
    <div
      className="rounded-xl border transition-all"
      style={{ background: 'var(--bg-base)', borderColor: open ? 'var(--border-default)' : 'var(--border-soft)' }}
    >
      {/* Header row — always visible */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        {/* Status dot */}
        <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: statusStyle.dot }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{uni.university}</p>
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                <MapPin size={10} />
                {uni.city ? `${uni.city} · ` : ''}{uni.country}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                {statusStyle.label}
              </span>
              <ChevronDown size={13} style={{ color: 'var(--text-disabled)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              <span style={{ color: networkColor, fontWeight: 600 }}>{uni.network}</span> network
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>GPA {uni.gpa}</span>
            {uni.qs && uni.qs !== '—' && (
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>QS #{uni.qs}</span>
            )}
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{uni.tuition}/yr</span>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
              <div className="grid grid-cols-1 gap-3 mt-3">
                {/* Top firms */}
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>Top Recruiting Firms</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{uni.topFirms}</p>
                </div>

                {/* Where alumni go */}
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>Where Club Alumni Go</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{uni.clubAlumniGo}</p>
                </div>

                {/* Finance clubs */}
                {clubs.length > 0 && (
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>Finance Clubs</p>
                    <div className="flex flex-wrap gap-1.5">
                      {clubs.map(club => (
                        <span key={club} className="text-[10px] px-2 py-0.5 rounded-md border" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)', color: 'var(--text-secondary)' }}>
                          {club}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {uni.tips && (
                  <div className="rounded-lg px-3 py-2" style={{ background: 'var(--bg-subtle)', borderLeft: '3px solid var(--accent)' }}>
                    <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>💡 {uni.tips}</p>
                  </div>
                )}

                {/* Notable alumni */}
                {uni.notableAlumni && uni.notableAlumni !== '—' && uni.notableAlumni !== 'None prominent' && uni.notableAlumni !== 'None prominent globally' && uni.notableAlumni !== 'None listed' && (
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    <span style={{ fontWeight: 600 }}>Notable alumni:</span> {uni.notableAlumni}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── UNIVERSITIES TAB ─────────────────────────────────────────────────────────

function UniversitiesTab() {
  const [query, setQuery]             = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeCountry, setActiveCountry] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');

  const statusMap = { Target: 'target', 'Semi-Target': 'semi', 'Non-Target': 'non-target' };

  const unis = UNIS.filter(u => {
    const regOk    = activeRegion === 'All' || u.region === activeRegion;
    const countryOk = activeCountry === 'All' || u.country === activeCountry;
    const statOk   = activeStatus === 'All' || u.status === statusMap[activeStatus];
    const q = query.toLowerCase();
    return regOk && countryOk && statOk && (!q || u.university.toLowerCase().includes(q) || u.country.toLowerCase().includes(q) || u.city.toLowerCase().includes(q));
  });

  // Count by status for legend
  const counts = {
    target: UNIS.filter(u => u.status === 'target').length,
    semi:   UNIS.filter(u => u.status === 'semi').length,
    non:    UNIS.filter(u => u.status === 'non-target').length,
  };

  const FilterPills = ({ items, active, onSelect }) => (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all"
          style={{
            background: active === item ? 'var(--accent)' : 'var(--bg-subtle)',
            borderColor: active === item ? 'var(--accent)' : 'var(--border-soft)',
            color: active === item ? '#fff' : 'var(--text-secondary)',
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
        {[
          { dot: '#22c55e', label: 'Target', count: counts.target, desc: 'BB/EB on-campus recruiting' },
          { dot: '#f59e0b', label: 'Semi-Target', count: counts.semi, desc: 'Networking-heavy approach' },
          { dot: '#94a3b8', label: 'Non-Target', count: counts.non, desc: '100% hustle required' },
        ].map(({ dot, label, count, desc }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
            <div>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
              <span className="text-[10px] ml-1" style={{ color: 'var(--text-tertiary)' }}>({count})</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-disabled)' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search university, city, or country…"
          className="w-full text-sm pl-9 pr-4 py-2.5 rounded-lg border focus:outline-none transition-all"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e  => (e.target.style.borderColor = 'var(--border-default)')}
        />
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <FilterPills items={REGIONS}  active={activeRegion} onSelect={r => { setActiveRegion(r); setActiveCountry('All'); }} />
        <FilterPills items={STATUSES} active={activeStatus} onSelect={setActiveStatus} />
      </div>

      <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
        {unis.length} universit{unis.length === 1 ? 'y' : 'ies'} · tap to expand
      </p>

      {unis.length === 0 ? (
        <div className="text-center py-20 text-sm" style={{ color: 'var(--text-tertiary)' }}>No universities found.</div>
      ) : (
        <div className="flex flex-col gap-2 pb-20">
          {unis.map(u => <UniCard key={u.university} uni={u} />)}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Resources() {
  const [activeTab, setActiveTab] = useState('vocab');

  const TABS = [
    { key: 'vocab',        label: 'Vocabulary'   },
    { key: 'universities', label: 'Universities' },
  ];

  return (
    <div className="min-h-full max-w-4xl mx-auto py-6 px-4" style={{ color: 'var(--text-primary)' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-xl font-semibold mb-1" style={{ letterSpacing: '-0.025em' }}>Resources</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Finance vocabulary and {UNIS.length} universities worldwide ranked by IB recruiting potential.
        </p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-0.5 p-0.5 rounded-lg mb-6 w-fit" style={{ background: 'var(--bg-muted)' }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: activeTab === key ? 'var(--bg-base)' : 'transparent',
              color: activeTab === key ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: activeTab === key ? 'var(--shadow-xs)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'vocab' ? <VocabTab /> : <UniversitiesTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
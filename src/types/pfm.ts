export type ExpenseCategory =
  | '주거/통신'
  | '식비/외식'
  | '교통/차량'
  | '쇼핑/생활'
  | '문화/여가'
  | '의료/건강'
  | '금융/보험'
  | '교육/자기계발'
  | '경조사/기타';

export interface ExpenseItem {
  id: string;
  name: string;
  category: ExpenseCategory;
  budgetAmount: number; // 예산 금액
  actualAmount: number; // 실제 지출 금액
  isUnplanned: boolean; // 예산 외 기타비용 여부
  note?: string;
}

export interface MonthlyFinancialData {
  year: number;
  month: number;
  income: number; // 총 수입
  budget: number; // 총 예산
  expenses: ExpenseItem[];
  userGoal?: string; // 추가 재무 목표 (예: 주택자금, 비상금 마련 등)
}

export interface FinancialSummary {
  totalIncome: number;
  totalBudget: number;
  totalExpense: number;
  plannedExpense: number;
  unplannedExpense: number;
  surplus: number; // 최종 잔액 (여유자금 = 총 수입 - 총 지출)
  budgetBurnRate: number; // 예산 대비 지출율 %
  surplusRate: number; // 수입 대비 잉여자금 비율 %
  isDeficit: boolean;
}

export interface RankedExpenseItem {
  rank: number;
  item: ExpenseItem;
  amount: number;
  sharePercent: number; // 전체 지출 대비 비중 %
  textBarChart: string; // 텍스트 기반 바 차트 (예: ████░░░░░░)
  relativeRatio: number; // 0 to 1
  overrunAmount: number; // 예산 초과액
  isOverrun: boolean;
}

export interface SavingRecommendation {
  id: string;
  itemName: string;
  category: ExpenseCategory;
  currentSpent: number;
  budgetAmount: number;
  overrunReason: string;
  actionableTip: string;
  potentialMonthlySaving: number;
}

export interface InvestmentProposal {
  surplusAmount: number;
  stabilitySharePercent: number;
  stabilityAmount: number;
  stabilityProducts: string;
  stabilityDetails: string;
  growthSharePercent: number;
  growthAmount: number;
  growthProducts: string;
  growthDetails: string;
  strategicNote: string;
}

export interface FullPFMReport {
  summary: FinancialSummary;
  rankedExpenses: RankedExpenseItem[];
  savingRecommendations: SavingRecommendation[];
  investmentProposal: InvestmentProposal;
  formattedMarkdown: string; // Exactly matching the prompt format
  aiConsultantNote?: string;
}

export interface FinancialPersonaPreset {
  id: string;
  name: string;
  tagline: string;
  data: MonthlyFinancialData;
}

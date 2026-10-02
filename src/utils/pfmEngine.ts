import {
  MonthlyFinancialData,
  FinancialSummary,
  RankedExpenseItem,
  SavingRecommendation,
  InvestmentProposal,
  FullPFMReport,
  ExpenseItem,
} from '../types/pfm';

// Format numbers in Korean currency notation
export function formatKRW(val: number): string {
  return Math.round(val).toLocaleString('ko-KR');
}

// Generate Unicode text bar chart (default 12 blocks)
export function generateTextBar(ratio: number, totalBlocks: number = 12): string {
  if (ratio <= 0) {
    return '░'.repeat(totalBlocks);
  }
  const filledCount = Math.min(totalBlocks, Math.max(1, Math.round(ratio * totalBlocks)));
  const emptyCount = Math.max(0, totalBlocks - filledCount);
  return '█'.repeat(filledCount) + '░'.repeat(emptyCount);
}

// Calculate Summary
export function calculateFinancialSummary(data: MonthlyFinancialData): FinancialSummary {
  const totalIncome = data.income || 0;
  const totalBudget = data.budget || 0;

  const totalExpense = data.expenses.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0);
  const unplannedExpense = data.expenses
    .filter((item) => item.isUnplanned)
    .reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0);
  const plannedExpense = totalExpense - unplannedExpense;

  const surplus = totalIncome - totalExpense;
  const budgetBurnRate = totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0;
  const surplusRate = totalIncome > 0 ? Math.round((surplus / totalIncome) * 100) : 0;

  return {
    totalIncome,
    totalBudget,
    totalExpense,
    plannedExpense,
    unplannedExpense,
    surplus,
    budgetBurnRate,
    surplusRate,
    isDeficit: surplus < 0,
  };
}

// Rank expenses descending and generate text bars
export function calculateRankedExpenses(
  expenses: ExpenseItem[],
  totalExpense: number
): RankedExpenseItem[] {
  if (!expenses || expenses.length === 0) return [];

  // Sort descending by actualAmount
  const sorted = [...expenses].sort((a, b) => (b.actualAmount || 0) - (a.actualAmount || 0));
  const maxAmount = sorted[0]?.actualAmount || 1;

  return sorted.map((item, index) => {
    const amount = Number(item.actualAmount) || 0;
    const sharePercent = totalExpense > 0 ? Number(((amount / totalExpense) * 100).toFixed(1)) : 0;
    const relativeRatio = maxAmount > 0 ? amount / maxAmount : 0;
    const textBar = generateTextBar(relativeRatio, 12);
    const overrunAmount = Math.max(0, amount - (item.budgetAmount || 0));
    const isOverrun = item.budgetAmount > 0 && amount > item.budgetAmount;

    return {
      rank: index + 1,
      item,
      amount,
      sharePercent,
      textBarChart: textBar,
      relativeRatio,
      overrunAmount,
      isOverrun,
    };
  });
}

// Category-based actionable tips repository
const CATEGORY_TIPS: Record<string, { reason: string; tip: string; potentialRatio: number }> = {
  '식비/외식': {
    reason: '배달음식 및 잦은 외식으로 인한 변동비 지출 쏠림 현상',
    tip: '주 3회 밀프렙/도시락 루틴 도입, 배달 앱 결제 주 1회 한도 지정, 대용량 식자재 소분 보관으로 월 식비 20% 절감',
    potentialRatio: 0.2,
  },
  '교통/차량': {
    reason: '심야 택시 빈번 이용 및 유류비·주차비 등 이동비용 누수',
    tip: '대중교통 K-패스(20~53% 환급) 및 기후동행카드 적극 활용, 심야 이동 시 지하철·심야버스 사전 동선 계획',
    potentialRatio: 0.25,
  },
  '쇼핑/생활': {
    reason: '충동구매 및 생필품 대량 비계획 쇼핑',
    tip: '장바구니 72시간 숙려제(구매 보류 규칙) 적용, 중고거래 마켓 활용 및 정기구독 생활용품 재고 전수조사',
    potentialRatio: 0.3,
  },
  '주거/통신': {
    reason: '고가 요금제 유지 및 미사용 인터넷·유료 방송 부가서비스',
    tip: '통신사 약정 만료 확인 후 1~2만 원대 알뜰폰(MVNO) 요금제 전환, 주택청약 및 월세 세액공제(최대 17%) 신청',
    potentialRatio: 0.15,
  },
  '문화/여가': {
    reason: '중복 구독 서비스(OTT, 음원 등) 방치 및 취미활동 비계획 결제',
    tip: '이용 빈도 낮은 OTT/구독 서비스 즉시 해지 또는 파티 공유제 활용, 문화가 있는 날(매월 마지막 수요일) 등 공공 혜택 이용',
    potentialRatio: 0.35,
  },
  '경조사/기타': {
    reason: '예산 외 돌발 지출 및 갑작스러운 경조사·모임 비용',
    tip: '매월 별도 비상금 통장에서 경조사 예산을 미리 10만 원씩 유보해 두고 가계부 본예산 침범 방지',
    potentialRatio: 0.2,
  },
  '금융/보험': {
    reason: '보장 중복 보험료 납입 및 불필요한 금융 수수료',
    tip: '내보험다보여 서비스를 통한 중복 특약 정리(보험 다이어트) 및 주거래 은행 이체 수수료 면제 점검',
    potentialRatio: 0.15,
  },
  '교육/자기계발': {
    reason: '완강하지 못한 온라인 강의 및 미사용 헬스장 회원권',
    tip: '국민내일배움카드 국비지원 과정 우선 탐색, 1강 완강 후 다음 강의 결제하는 순차 결제 원칙 수립',
    potentialRatio: 0.25,
  },
};

// Calculate Saving Recommendations (2~3 picks)
export function calculateSavingRecommendations(
  rankedExpenses: RankedExpenseItem[]
): SavingRecommendation[] {
  if (rankedExpenses.length === 0) return [];

  // Priority 1: Items that exceed budget significantly
  const overBudgetItems = rankedExpenses
    .filter((r) => r.isOverrun || r.item.isUnplanned)
    .sort((a, b) => b.overrunAmount - a.overrunAmount || b.amount - a.amount);

  // Priority 2: High discretionary spend items (식비, 쇼핑, 문화, 교통 등)
  const discretionaryItems = rankedExpenses.filter(
    (r) =>
      ['식비/외식', '쇼핑/생활', '문화/여가', '교통/차량'].includes(r.item.category) &&
      !overBudgetItems.some((o) => o.item.id === r.item.id)
  );

  // Pick top candidates
  const candidates: RankedExpenseItem[] = [];
  overBudgetItems.forEach((item) => {
    if (candidates.length < 3) candidates.push(item);
  });
  discretionaryItems.forEach((item) => {
    if (candidates.length < 3) candidates.push(item);
  });
  if (candidates.length < 2) {
    rankedExpenses.forEach((item) => {
      if (candidates.length < 2 && !candidates.some((c) => c.item.id === item.item.id)) {
        candidates.push(item);
      }
    });
  }

  // Slice to 2 or 3 items
  const finalPicks = candidates.slice(0, 3);

  return finalPicks.map((pick, idx) => {
    const cat = pick.item.category;
    const catInfo = CATEGORY_TIPS[cat] || {
      reason: '월간 지출 총액 중 상당한 비중을 차지하여 효율화 필요',
      tip: '지출 전 사전 승인 규칙 및 체크카드 한도 관리를 통해 소비 절제',
      potentialRatio: 0.2,
    };

    let overrunReason = '';
    if (pick.item.isUnplanned) {
      overrunReason = `예산 외 돌발 지출로 ${formatKRW(pick.amount)}원 전액이 추가 발생하여 가계 잔액을 압박함`;
    } else if (pick.isOverrun) {
      overrunReason = `설정 예산(${formatKRW(pick.item.budgetAmount)}원) 대비 +${formatKRW(pick.overrunAmount)}원 초과 지출 (${catInfo.reason})`;
    } else {
      overrunReason = `전체 지출의 ${pick.sharePercent}% 차지 (${catInfo.reason})`;
    }

    const potentialSaving = Math.round(pick.amount * catInfo.potentialRatio);

    return {
      id: `saving-${idx + 1}`,
      itemName: pick.item.name,
      category: pick.item.category,
      currentSpent: pick.amount,
      budgetAmount: pick.item.budgetAmount,
      overrunReason,
      actionableTip: catInfo.tip,
      potentialMonthlySaving: potentialSaving,
    };
  });
}

// Calculate Investment Proposals based on Surplus (총 수입 - 총 지출)
export function calculateInvestmentProposal(
  surplus: number,
  income: number
): InvestmentProposal {
  if (surplus <= 0) {
    return {
      surplusAmount: surplus,
      stabilitySharePercent: 100,
      stabilityAmount: 0,
      stabilityProducts: '비상금 파킹통장 및 긴급 마이너스 지출 방어 계좌',
      stabilityDetails:
        '현재 여유자금이 부족하거나 적자 상태입니다. 추가 투자 집행을 즉각 보류하고, 다음 달 고정비 리모델링과 변동비 다이어트로 최소 30만~50만 원의 종잣돈 비상금을 최우선 확보해야 합니다.',
      growthSharePercent: 0,
      growthAmount: 0,
      growthProducts: '투자 집행 보류 (현금흐름 정상화 우선)',
      growthDetails:
        '적자 또는 제로 잉여 상태에서의 무리한 투자는 시장 변동 시 손절 위험을 키웁니다. 부채 상환 및 지출 통제를 통해 흑자 전환을 선행하십시오.',
      strategicNote: '현금흐름 방어 및 적자 탈출이 최우선 과제입니다.',
    };
  }

  // Positive surplus allocation strategy
  let stabilityShare = 40;
  let growthShare = 60;

  // If surplus is relatively small, allocate higher stability (emergency fund first)
  if (surplus < 500000) {
    stabilityShare = 60;
    growthShare = 40;
  } else if (surplus < 1500000) {
    stabilityShare = 50;
    growthShare = 50;
  } else {
    // If surplus is substantial, prioritize long-term growth
    stabilityShare = 40;
    growthShare = 60;
  }

  const stabilityAmt = Math.round(surplus * (stabilityShare / 100));
  const growthAmt = surplus - stabilityAmt;

  return {
    surplusAmount: surplus,
    stabilitySharePercent: stabilityShare,
    stabilityAmount: stabilityAmt,
    stabilityProducts: 'CMA / MMF / 파킹통장 (연 3.0%~3.5% 수시입출금형)',
    stabilityDetails:
      '최소 3~6개월 치 고정생활비(비상예비자금)가 모일 때까지 안정형 파킹통장 및 증권사 발행어음형 CMA에 자동이체 예치하여 유동성과 일복리 이자를 동시에 확보하세요.',
    growthSharePercent: growthShare,
    growthAmount: growthAmt,
    growthProducts: '중장기 글로벌 지수 ETF (S&P500, 나스닥100, 배당성장 ETF) & 연금저축/ISA 계좌',
    growthDetails:
      '절세 계좌(ISA/연금저축)를 활용해 매월 지정된 날짜에 우량 글로벌 지수 ETF를 적립식 분할 매수하여 시장 변동성을 헤지하고 10년 이상 장기 복리 성장 효과를 극대화하세요.',
    strategicNote: `월 ${formatKRW(surplus)}원의 여유자금은 1년 누적 시 약 ${formatKRW(surplus * 12)}원의 강력한 목돈이 됩니다.`,
  };
}

// Generate the EXACT formatted markdown matching the user prompt specification
export function generateExactMarkdownReport(report: FullPFMReport, month: number): string {
  const { summary, rankedExpenses, savingRecommendations, investmentProposal } = report;

  // Ranked lines: 1. **[항목명]**: OOO 원 (OO%) | [바 차트]
  const rankLines = rankedExpenses
    .map(
      (item) =>
        `${item.rank}. **${item.item.name}**: ${formatKRW(item.amount)} 원 (${item.sharePercent}%) | ${item.textBarChart}`
    )
    .join('\n');

  // Saving items: - **[추천 항목 1]**: (현재 지출액 및 과다 사유) -> (절약 실행 방안)
  const savingLines = savingRecommendations
    .map(
      (s) =>
        `- **[${s.itemName}]**: (현재 지출액 ${formatKRW(s.currentSpent)}원, ${s.overrunReason}) -> (${s.actionableTip})`
    )
    .join('\n');

  // Investment proposal
  const inv = investmentProposal;
  let investmentContent = '';
  if (inv.surplusAmount <= 0) {
    investmentContent = `- **안정형 비중 (100% / 0 원):** ${inv.stabilityProducts} (${inv.stabilityDetails})
- **성장형 비중 (0% / 0 원):** ${inv.growthProducts} (${inv.growthDetails})`;
  } else {
    investmentContent = `- **안정형 비중 (${inv.stabilitySharePercent}% / ${formatKRW(inv.stabilityAmount)} 원):** ${inv.stabilityProducts} (${inv.stabilityDetails})
- **성장형 비중 (${inv.growthSharePercent}% / ${formatKRW(inv.growthAmount)} 원):** ${inv.growthProducts} (${inv.growthDetails})`;
  }

  return `---
## 📊 [${month}월 가계부 종합 결산 Report]

### 1. 한 달 재무 요약
- **총 수입:** ${formatKRW(summary.totalIncome)} 원
- **총 예산:** ${formatKRW(summary.totalBudget)} 원
- **총 지출:** ${formatKRW(summary.totalExpense)} 원 (예산 내 지출: ${formatKRW(summary.plannedExpense)} 원 / 예산 외 기타비용: ${formatKRW(summary.unplannedExpense)} 원)
- **최종 잔액 (여유자금):** ${formatKRW(summary.surplus)} 원
- **예산 대비 지출율:** ${summary.budgetBurnRate}%

### 2. 금액별 지출 순위 & 그래프 (내림차순)
${rankLines}

### 3. 💡 절약 추천 항목
${savingLines}

### 4. 📈 여유자금 자산운용/투자 추천 (남은 자금: ${formatKRW(summary.surplus)} 원 기준)
${investmentContent}
---`;
}

// Master calculation function
export function buildFullPFMReport(data: MonthlyFinancialData): FullPFMReport {
  const summary = calculateFinancialSummary(data);
  const rankedExpenses = calculateRankedExpenses(data.expenses, summary.totalExpense);
  const savingRecommendations = calculateSavingRecommendations(rankedExpenses);
  const investmentProposal = calculateInvestmentProposal(summary.surplus, summary.totalIncome);

  const reportStub: FullPFMReport = {
    summary,
    rankedExpenses,
    savingRecommendations,
    investmentProposal,
    formattedMarkdown: '',
  };

  reportStub.formattedMarkdown = generateExactMarkdownReport(reportStub, data.month);

  return reportStub;
}

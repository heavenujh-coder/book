import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // CORS and methods
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { month, income, budget, expenses, userContext } = req.body || {};

    if (!income || !budget || !Array.isArray(expenses)) {
      return res.status(400).json({ error: '필수 재무 데이터(수입, 예산, 지출 내역)가 누락되었습니다.' });
    }

    const totalExpense = expenses.reduce((sum: number, item: any) => sum + (Number(item.actualAmount) || 0), 0);
    const unplannedExpense = expenses
      .filter((item: any) => item.isUnplanned)
      .reduce((sum: number, item: any) => sum + (Number(item.actualAmount) || 0), 0);
    const plannedExpense = totalExpense - unplannedExpense;
    const surplus = income - totalExpense;
    const budgetRate = budget > 0 ? Math.round((totalExpense / budget) * 100) : 0;
    const sortedExpenses = [...expenses].sort((a: any, b: any) => (b.actualAmount || 0) - (a.actualAmount || 0));

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const promptText = `
당신은 정밀한 데이터 분석 능력과 명확한 자산관리 솔루션을 제공하는 전문 개인재무관리(PFM) AI 컨설턴트입니다.
아래 사용자의 ${month}월 수입, 예산, 실제 지출 데이터를 기반으로 다음 필수 4가지 분석과 지정된 [출력 형식] 그대로 월간 결산 보고서를 작성하세요.

[사용자 재무 원본 데이터]
- 기준 월: ${month}월
- 총 수입: ${income.toLocaleString('ko-KR')} 원
- 설정 예산: ${budget.toLocaleString('ko-KR')} 원
- 실제 지출 항목 내역 (총 ${expenses.length}개):
${expenses.map((e: any, i: number) => `  ${i + 1}. [${e.category || '기타'}] ${e.name}: 예산 ${Number(e.budgetAmount || 0).toLocaleString('ko-KR')}원 -> 실제 ${Number(e.actualAmount || 0).toLocaleString('ko-KR')}원 ${e.isUnplanned ? '(예산 외 기타비용)' : ''} ${e.note ? `(메모: ${e.note})` : ''}`).join('\n')}
- 총 지출 합계: ${totalExpense.toLocaleString('ko-KR')} 원 (예산 내: ${plannedExpense.toLocaleString('ko-KR')} 원 / 예산 외: ${unplannedExpense.toLocaleString('ko-KR')} 원)
- 최종 잔액 (여유자금): ${surplus.toLocaleString('ko-KR')} 원
- 예산 대비 지출율: ${budgetRate}%
${userContext ? `- 사용자 추가 상황/목표: ${userContext}` : ''}

[분석 및 작성 가이드라인]
1. 수입 및 예산 분석: 제공된 수치를 정확하게 대입하세요.
2. 금액별 지출 순위 & 그래프 (내림차순):
   - 지출 금액이 큰 순서대로 정렬하여 1위부터 기재
   - 각 항목의 금액과 전체 지출 대비 비중(%) 명시
   - 텍스트 기반 바 차트를 10~15칸의 블록(예: ████░░░░░░)으로 직관적으로 표현
3. 💡 절약 추천 항목:
   - 고정비와 변동비 중 예산 대비 과다 지출되었거나 절감 여지가 큰 항목 2~3개를 구체적으로 지목
   - 한국의 실제 생활 물가와 금융 환경(알뜰폰, 지역화폐, 식비 밀키트/소분, OTT 공유, 통신/보험 리모델링 등)에 맞춘 실행 가능한 실천 팁 제안
4. 📈 여유자금 자산운용/투자 추천 (남은 자금: ${surplus.toLocaleString('ko-KR')} 원 기준):
   - ${surplus <= 0 ? '적자 또는 여유자금 0원인 경우 비상금 확보 및 고금리 부채 상환, 지출 방어 대책' : '최종 여유자금을 안정형과 성장형으로 배분'}
   - 단기 안정형(CMA, MMF, 파킹통장 등 비상예비자금) 비중(%)과 구체적 원화 금액 및 활용법
   - 중장기 성장형(미국 S&P500/나스닥 ETF, 배당성장주, 적립식 펀드, ISA/연금저축 등) 비중(%)과 구체적 원화 금액 및 활용법

[출력 형식 준수]
반드시 아래 템플릿 양식을 엄격히 지켜 마크다운으로 출력하세요:

---
## 📊 [${month}월 가계부 종합 결산 Report]

### 1. 한 달 재무 요약
- **총 수입:** [금액] 원
- **총 예산:** [금액] 원
- **총 지출:** [금액] 원 (예산 내 지출: [금액] 원 / 예산 외 기타비용: [금액] 원)
- **최종 잔액 (여유자금):** [금액] 원
- **예산 대비 지출율:** [지출율]%

### 2. 금액별 지출 순위 & 그래프 (내림차순)
1. **[항목명]**: [금액] 원 ([비중]%) | [바 차트]
2. **[항목명]**: [금액] 원 ([비중]%) | [바 차트]
...

### 3. 💡 절약 추천 항목
- **[추천 항목 1]**: (현재 지출액 및 과다 사유) -> (절약 실행 방안)
- **[추천 항목 2]**: (현재 지출액 및 과다 사유) -> (절약 실행 방안)

### 4. 📈 여유자금 자산운용/투자 추천 (남은 자금: [금액] 원 기준)
- **안정형 비중 ([비중]% / [금액] 원):** (추천 금융상품 및 활용법)
- **성장형 비중 ([비중]% / [금액] 원):** (추천 투자자산 및 활용법)
---

추가로 맨 마지막에 [전문 PFM 컨설턴트 총평] 섹션을 3문장 이내로 덧붙여 격려와 핵심 실행 포인트를 전해주세요.
`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            temperature: 0.4,
          },
        });

        const generatedMarkdown = response.text || '';
        return res.status(200).json({
          success: true,
          source: 'gemini',
          report: generatedMarkdown,
        });
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed on Vercel, falling back to deterministic engine:', geminiErr?.message);
      }
    }

    // Deterministic fallback
    const fallbackReport = generateDeterministicReport(
      month,
      income,
      budget,
      expenses,
      totalExpense,
      plannedExpense,
      unplannedExpense,
      surplus,
      budgetRate,
      sortedExpenses
    );

    return res.status(200).json({
      success: true,
      source: 'local_engine',
      report: fallbackReport,
    });
  } catch (err: any) {
    console.error('API Error:', err);
    return res.status(500).json({ error: '결산 보고서 생성 중 오류가 발생했습니다: ' + err.message });
  }
}

function generateDeterministicReport(
  month: number | string,
  income: number,
  budget: number,
  _expenses: any[],
  totalExpense: number,
  plannedExpense: number,
  unplannedExpense: number,
  surplus: number,
  budgetRate: number,
  sortedExpenses: any[]
): string {
  const barLength = 12;
  const rankLines = sortedExpenses.slice(0, 10).map((item, idx) => {
    const amount = Number(item.actualAmount) || 0;
    const share = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0.0';
    const filledCount = totalExpense > 0 ? Math.round((amount / totalExpense) * barLength) : 0;
    const bar = '█'.repeat(Math.min(filledCount, barLength)) + '░'.repeat(Math.max(0, barLength - filledCount));
    return `${idx + 1}. **${item.name}**: ${amount.toLocaleString('ko-KR')} 원 (${share}%) | ${bar}`;
  }).join('\n');

  const overruns = sortedExpenses.filter(e => (e.actualAmount > e.budgetAmount && e.budgetAmount > 0) || e.isUnplanned);
  const savingPicks = (overruns.length >= 2 ? overruns : sortedExpenses).slice(0, 2);

  const tipsMap: Record<string, string> = {
    '식비/외식': '주 3회 도시락/밀키트 밀프렙 루틴화 및 배달앱 주문 횟수를 주 1회로 제한하여 월 15~20만 원 절감 권장',
    '교통/차량': '기후동행카드(수도권 무제한) 또는 K-패스(20~53% 환급) 카드로 즉시 전환하고 심야 택시 탑승 억제',
    '쇼핑/생활': '위시리스트 72시간 쿨링다운(지연 구매) 법칙 적용 및 중고거래 플랫폼 활용',
    '주거/통신': '대출 금리 인하 요구권 행사 및 알뜰폰(MVNO) LTE 무제한 요금제로 교체 추천',
    '문화/여가': '이용 빈도 낮은 OTT/구독 서비스 즉시 해지 또는 파티 공유제 활용',
  };

  const saving1 = savingPicks[0] || { name: '식비/외식', category: '식비/외식', actualAmount: 350000, budgetAmount: 250000 };
  const saving2 = savingPicks[1] || { name: '교통/차량', category: '교통/차량', actualAmount: 180000, budgetAmount: 120000 };

  const tip1 = tipsMap[saving1.category] || '지출 내역 영수증 점검 및 일 단위 소비 한도 지정';
  const tip2 = tipsMap[saving2.category] || '고정비 자동이체 다이어트 및 불필요한 월간 구독 해지';

  const stabilityShare = surplus > 0 ? (surplus > 1500000 ? 40 : 50) : 0;
  const growthShare = surplus > 0 ? 100 - stabilityShare : 0;
  const stabilityAmt = surplus > 0 ? Math.round(surplus * (stabilityShare / 100)) : 0;
  const growthAmt = surplus > 0 ? surplus - stabilityAmt : 0;

  return `---
## 📊 [${month}월 가계부 종합 결산 Report]

### 1. 한 달 재무 요약
- **총 수입:** ${income.toLocaleString('ko-KR')} 원
- **총 예산:** ${budget.toLocaleString('ko-KR')} 원
- **총 지출:** ${totalExpense.toLocaleString('ko-KR')} 원 (예산 내 지출: ${plannedExpense.toLocaleString('ko-KR')} 원 / 예산 외 기타비용: ${unplannedExpense.toLocaleString('ko-KR')} 원)
- **최종 잔액 (여유자금):** ${surplus.toLocaleString('ko-KR')} 원
- **예산 대비 지출율:** ${budgetRate}%

### 2. 금액별 지출 순위 & 그래프 (내림차순)
${rankLines}

### 3. 💡 절약 추천 항목
- **[${saving1.name}]**: (현재 지출액 ${Number(saving1.actualAmount).toLocaleString('ko-KR')}원, ${saving1.budgetAmount ? `예산 대비 +${(saving1.actualAmount - saving1.budgetAmount).toLocaleString('ko-KR')}원 초과` : '예산 외 추가 발생'}) -> (${tip1})
- **[${saving2.name}]**: (현재 지출액 ${Number(saving2.actualAmount).toLocaleString('ko-KR')}원, ${saving2.budgetAmount ? `예산 대비 +${(saving2.actualAmount - saving2.budgetAmount).toLocaleString('ko-KR')}원 초과` : '비중 과다'}) -> (${tip2})

### 4. 📈 여유자금 자산운용/투자 추천 (남은 자금: ${surplus.toLocaleString('ko-KR')} 원 기준)
- **안정형 비중 (${stabilityShare}% / ${stabilityAmt.toLocaleString('ko-KR')} 원):** 비상금 파킹통장(연 3.0~3.5% 수시입출금) 및 발행어음 CMA에 예치하여 최소 3~6개월 치 생활비 예비자산으로 적립
- **성장형 비중 (${growthShare}% / ${growthAmt.toLocaleString('ko-KR')} 원):** 연금저축/ISA 계좌를 통한 미국 S&P500 지수 ETF 및 고배당 성장 ETF 분할 매수로 세액공제와 복리 자산증식 동시 달성
---

### 💬 전문 PFM 컨설턴트 총평
이번 ${month}월 결산 결과, 총 지출율은 예산 대비 ${budgetRate}%로 ${budgetRate <= 100 ? '안정적인 예산 통제력을 보여주셨습니다.' : '예산 초과가 발생하여 긴급 지출 다이어트가 권장됩니다.'} ${surplus > 0 ? `확보된 ${surplus.toLocaleString('ko-KR')}원의 여유자금은 지출 통장을 떠나 별도의 투자 계좌로 강제 저축하여 자산 축적 속도를 높이세요.` : '다음 달에는 비상 지출 항목을 최소화하고 고정비 리모델링에 집중하시기 바랍니다.'}`;
}

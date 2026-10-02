import React from 'react';
import {
  TrendingUp,
  AlertCircle,
  Lightbulb,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { FullPFMReport } from '../types/pfm';
import { formatKRW } from '../utils/pfmEngine';

interface ReportExecutiveViewProps {
  report: FullPFMReport;
  month: number;
  year: number;
}

export const ReportExecutiveView: React.FC<ReportExecutiveViewProps> = ({
  report,
  month,
  year,
}) => {
  const { summary, rankedExpenses, savingRecommendations, investmentProposal } = report;

  // Status badge for budget burn rate
  const isOverBudget = summary.budgetBurnRate > 100;
  const isHealthyBudget = summary.budgetBurnRate <= 85;

  return (
    <div className="space-y-6">
      {/* Report Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Financial Management Report</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              📊 {month}월 가계부 종합 결산 Report
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              데이터 분석 기반 월간 결산 진단서 및 자산 배분 전략
            </p>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
            <span className="text-xs text-slate-400">예산 대비 지출율</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  isOverBudget
                    ? 'text-rose-400'
                    : isHealthyBudget
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {summary.budgetBurnRate}%
              </span>
              <span className="text-xs text-slate-400">
                {isOverBudget ? '(예산 초과)' : '(안정 통제)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: 한 달 재무 요약 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span>한 달 재무 요약</span>
          </h3>
          <span className="text-xs text-slate-500">
            기준월: {year}년 {month}월
          </span>
        </div>

        {/* 4 Core Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. 총 수입 */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-xs font-medium text-slate-500 mb-1">총 수입</div>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
              {formatKRW(summary.totalIncome)} <span className="text-xs font-normal text-slate-500">원</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">월 가계 유입 현금 총액</div>
          </div>

          {/* 2. 총 예산 */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-xs font-medium text-slate-500 mb-1">총 예산</div>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
              {formatKRW(summary.totalBudget)} <span className="text-xs font-normal text-slate-500">원</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">사전 설정 월간 지출 목표</div>
          </div>

          {/* 3. 총 지출 */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-xs font-medium text-slate-500 mb-1">총 지출</div>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
              {formatKRW(summary.totalExpense)} <span className="text-xs font-normal text-slate-500">원</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              예산 내: {formatKRW(summary.plannedExpense)}원 / 예산 외: {formatKRW(summary.unplannedExpense)}원
            </div>
          </div>

          {/* 4. 최종 잔액 (여유자금) */}
          <div
            className={`p-4 rounded-xl border ${
              summary.isDeficit
                ? 'bg-rose-50/60 border-rose-200'
                : 'bg-emerald-50/60 border-emerald-200'
            }`}
          >
            <div
              className={`text-xs font-bold mb-1 ${
                summary.isDeficit ? 'text-rose-800' : 'text-emerald-800'
              }`}
            >
              최종 잔액 (여유자금)
            </div>
            <div
              className={`text-lg font-bold font-mono tabular-nums ${
                summary.isDeficit ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              {formatKRW(summary.surplus)} <span className="text-xs font-normal">원</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {summary.isDeficit
                ? '수입 대비 초과 지출 (적자 주의)'
                : `수입 대비 저축/투자 여력: ${summary.surplusRate}%`}
            </div>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">예산 집행률 현황</span>
            <span className="font-mono tabular-nums font-bold text-slate-900">
              {formatKRW(summary.totalExpense)}원 / {formatKRW(summary.totalBudget)}원 ({summary.budgetBurnRate}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${
                isOverBudget ? 'bg-rose-500' : 'bg-slate-900'
              }`}
              style={{ width: `${Math.min(100, summary.budgetBurnRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: 금액별 지출 순위 & 그래프 (내림차순) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>금액별 지출 순위 & 그래프 (내림차순)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              지출 규모가 큰 항목부터 정렬하여 비중(%)과 텍스트 바 차트를 함께 표시합니다.
            </p>
          </div>
        </div>

        {/* Ranked Items Table */}
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {rankedExpenses.map((r) => (
            <div
              key={r.item.id}
              className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Rank & Name */}
              <div className="flex items-center gap-3 min-w-0 sm:w-1/3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    r.rank === 1
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : r.rank === 2
                      ? 'bg-slate-200 text-slate-700'
                      : r.rank === 3
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {r.rank}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {r.item.name}
                    </span>
                    {r.item.isUnplanned ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        예산 외
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-normal">
                        {r.item.category}
                      </span>
                    )}
                  </div>
                  {r.item.budgetAmount > 0 && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      예산: {formatKRW(r.item.budgetAmount)}원
                    </div>
                  )}
                </div>
              </div>

              {/* Amount & Share */}
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-2/3">
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs font-bold font-mono tabular-nums text-slate-900">
                    {formatKRW(r.amount)} 원
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 font-mono">
                    {r.sharePercent}%
                  </div>
                </div>

                {/* Text Bar Chart & Visual Bar */}
                <div className="w-44 sm:w-56 shrink-0 space-y-1">
                  {/* The requested Unicode block text bar */}
                  <div className="font-mono text-xs tracking-tight text-slate-800 select-all">
                    {r.textBarChart}
                  </div>
                  {/* Subtle modern visual fill */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(4, r.relativeRatio * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: 💡 절약 추천 항목 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                💡
              </span>
              <span>절약 추천 항목</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              예산 초과 또는 과다 지출된 항목을 선별하여 즉시 실행 가능한 솔루션을 제공합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingRecommendations.map((s, idx) => (
            <div
              key={s.id}
              className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30 space-y-2.5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/60">
                    추천 {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-slate-900">{s.itemName}</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-900">
                  {formatKRW(s.currentSpent)}원 지출
                </span>
              </div>

              {/* Overrun Reason */}
              <div className="text-xs text-slate-700 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-amber-200/50">
                <span className="font-bold text-slate-900">지출 분석:</span>{' '}
                {s.overrunReason}
              </div>

              {/* Actionable tip */}
              <div className="text-xs text-slate-800 leading-relaxed flex items-start gap-2 pt-1">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900">절약 실행 방안:</span>{' '}
                  <span>{s.actionableTip}</span>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-emerald-700 text-right pt-1">
                예상 월 절감 효과: 약 {formatKRW(s.potentialMonthlySaving)}원
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: 📈 여유자금 자산운용/투자 추천 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                📈
              </span>
              <span>
                여유자금 자산운용/투자 추천 (남은 자금:{' '}
                <span className="font-mono tabular-nums text-emerald-700">
                  {formatKRW(investmentProposal.surplusAmount)} 원
                </span>{' '}
                기준)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              총 수입에서 총 지출을 차감한 실질 잉여자금을 안정형과 성장형으로 배분합니다.
            </p>
          </div>
        </div>

        {/* 2-Pillar Allocation Strategy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. 안정형 비중 */}
          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">단기 안정형 비중</span>
              </div>
              <span className="text-xs font-bold font-mono text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-300/50">
                {investmentProposal.stabilitySharePercent}% ({formatKRW(investmentProposal.stabilityAmount)} 원)
              </span>
            </div>

            <div className="text-xs font-bold text-slate-900">
              추천 금융상품:{' '}
              <span className="text-blue-800 font-semibold">
                {investmentProposal.stabilityProducts}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3 rounded-lg border border-blue-200/50">
              {investmentProposal.stabilityDetails}
            </p>
          </div>

          {/* 2. 성장형 비중 */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">중장기 성장형 비중</span>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300/50">
                {investmentProposal.growthSharePercent}% ({formatKRW(investmentProposal.growthAmount)} 원)
              </span>
            </div>

            <div className="text-xs font-bold text-slate-900">
              추천 투자자산:{' '}
              <span className="text-emerald-800 font-semibold">
                {investmentProposal.growthProducts}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3 rounded-lg border border-emerald-200/50">
              {investmentProposal.growthDetails}
            </p>
          </div>
        </div>

        {/* Strategic Note */}
        {investmentProposal.strategicNote && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{investmentProposal.strategicNote}</span>
          </div>
        )}
      </div>
    </div>
  );
};

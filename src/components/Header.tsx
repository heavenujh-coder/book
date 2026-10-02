import React from 'react';
import {
  TrendingUp,
  Sparkles,
  Copy,
  Printer,
  FileText,
  UserCheck,
  Calendar,
  Check,
} from 'lucide-react';
import { FINANCIAL_PRESETS } from '../utils/presets';
import { FinancialPersonaPreset } from '../types/pfm';

interface HeaderProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number) => void;
  selectedPresetId: string;
  onSelectPreset: (preset: FinancialPersonaPreset) => void;
  activeTab: 'executive' | 'markdown' | 'ai';
  onTabChange: (tab: 'executive' | 'markdown' | 'ai') => void;
  onCopyMarkdown: () => void;
  copied: boolean;
  onPrint: () => void;
  isAiLoading: boolean;
  onRunAiConsult: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  currentYear,
  onMonthChange,
  selectedPresetId,
  onSelectPreset,
  activeTab,
  onTabChange,
  onCopyMarkdown,
  copied,
  onPrint,
  isAiLoading,
  onRunAiConsult,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand & controls bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  PFM AI Consultant
                </h1>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  개인재무관리 월간 결산
                </span>
              </div>
              <p className="text-xs text-slate-500">
                정밀 수입·지출 분석 · 지출 순위 바 차트 · 절약 피드백 & 여유자금 투자 포트폴리오
              </p>
            </div>
          </div>

          {/* Month selector & Presets & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={currentMonth}
                onChange={(e) => onMonthChange(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-800 pr-2 py-1 outline-none cursor-pointer"
              >
                {[...Array(12)].map((_, i) => {
                  const m = i + 1;
                  return (
                    <option key={m} value={m}>
                      {currentYear}년 {m}월 결산
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Persona Preset Quick Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <UserCheck className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={selectedPresetId}
                onChange={(e) => {
                  const preset = FINANCIAL_PRESETS.find((p) => p.id === e.target.value);
                  if (preset) onSelectPreset(preset);
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 pr-2 py-1 outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="custom">직접 입력 (사용자 설정)</option>
                {FINANCIAL_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Actions */}
            <button
              onClick={onCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
              title="지정된 [출력 형식] 그대로 마크다운 복사"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">복사 완료</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>보고서 복사</span>
                </>
              )}
            </button>

            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
              title="리포트 인쇄 또는 PDF 저장"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">인쇄</span>
            </button>

            <button
              onClick={onRunAiConsult}
              disabled={isAiLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
            >
              <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>{isAiLoading ? 'AI 분석 중...' : 'AI 정밀 진단'}</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-2 pb-1">
          <button
            onClick={() => onTabChange('executive')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'executive'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            📊 종합 결산 비주얼 리포트
          </button>
          <button
            onClick={() => onTabChange('markdown')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'markdown'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>표준 마크다운 전문 (출력 양식)</span>
          </button>
          <button
            onClick={() => onTabChange('ai')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'ai'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>AI 컨설턴트 심층 진단</span>
          </button>
        </div>
      </div>
    </header>
  );
};

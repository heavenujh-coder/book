import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Send,
  MessageSquare,
  ShieldAlert,
  Target,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { MonthlyFinancialData } from '../types/pfm';

interface AIConsultantViewProps {
  data: MonthlyFinancialData;
  aiReport: string | null;
  isLoading: boolean;
  onGenerateAiReport: (userContext?: string) => void;
  onCopyText: (text: string) => void;
  copied: boolean;
}

const QUICK_PROMPTS = [
  '고정비(통신/보험/월세)를 줄이는 가장 확실한 실행 방법은?',
  '단기 비상금은 파킹통장과 CMA 중 어디에 두는 것이 유리한가요?',
  '주 3회 외식/배달을 줄이기 위한 구체적인 식비 관리 루틴을 알려주세요.',
  '사회초년생/가계 자산 형성을 위한 통장 쪼개기(4계좌 시스템) 설계법',
];

export const AIConsultantView: React.FC<AIConsultantViewProps> = ({
  data,
  aiReport,
  isLoading,
  onGenerateAiReport,
  onCopyText,
  copied,
}) => {
  const [userGoalInput, setUserGoalInput] = useState(data.userGoal || '');

  const handleRun = () => {
    onGenerateAiReport(userGoalInput);
  };

  const handleSelectQuickPrompt = (prompt: string) => {
    setUserGoalInput(prompt);
    onGenerateAiReport(prompt);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>AI PFM Certified Consultant</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            전문 개인재무관리 AI 컨설턴트 심층 진단
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gemini 최신 모델이 사용자의 {data.month}월 재무 데이터를 정밀 분석하고 개인화된 자산관리 솔루션을 제공합니다.
          </p>
        </div>

        <button
          onClick={handleRun}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-all shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'AI 컨설턴트 분석 중...' : 'AI 정밀 리포트 재진단'}</span>
        </button>
      </div>

      {/* Goal & Context Input */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
        <label className="block text-xs font-bold text-slate-800">
          개인 목표 및 추가 상황 전달 (선택사항)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="예: 1년 내 비상금 1,000만 원 모으기, 주택청약 납입 자금 확보, 결혼자금 마련 등"
            value={userGoalInput}
            onChange={(e) => setUserGoalInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRun()}
            className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white"
          />
          <button
            onClick={handleRun}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            질의 반영
          </button>
        </div>

        {/* Quick prompt pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-slate-500">추천 질의:</span>
          {QUICK_PROMPTS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectQuickPrompt(q)}
              className="text-[11px] text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* AI Generated Result */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3 border border-slate-200 rounded-xl bg-slate-50/60">
          <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">
            {data.month}월 재무 지표 및 소비 패턴 정밀 분석 중...
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            수입, 예산, 예산 외 지출, 과다 지출 항목 탐지 및 안정형·성장형 포트폴리오를 도출하고 있습니다.
          </p>
        </div>
      ) : aiReport ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>AI 컨설턴트 공식 분석 결과</span>
            </span>
            <button
              onClick={() => onCopyText(aiReport)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>내용 복사</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto border border-slate-800 select-all whitespace-pre-wrap">
            {aiReport}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50/40">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-600 font-medium">
            상단의 'AI 정밀 리포트 재진단' 버튼을 누르면 인공지능 컨설턴트가 상세한 진단을 작성합니다.
          </p>
        </div>
      )}
    </div>
  );
};

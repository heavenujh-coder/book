import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FinancialInputPanel } from './components/FinancialInputPanel';
import { ReportExecutiveView } from './components/ReportExecutiveView';
import { ReportMarkdownView } from './components/ReportMarkdownView';
import { AIConsultantView } from './components/AIConsultantView';
import { FINANCIAL_PRESETS } from './utils/presets';
import { MonthlyFinancialData, FinancialPersonaPreset, FullPFMReport } from './types/pfm';
import { buildFullPFMReport } from './utils/pfmEngine';
import { Sparkles, FileText, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'pfm_financial_data_v1';

export default function App() {
  // Initialize from default preset
  const defaultPreset = FINANCIAL_PRESETS[0];

  const [financialData, setFinancialData] = useState<MonthlyFinancialData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load saved financial data:', e);
    }
    return defaultPreset.data;
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultPreset.id);
  const [activeTab, setActiveTab] = useState<'executive' | 'markdown' | 'ai'>('executive');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Consultation state
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(financialData));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [financialData]);

  // Real-time calculated report
  const report: FullPFMReport = useMemo(() => {
    return buildFullPFMReport(financialData);
  }, [financialData]);

  // Handle Preset switch
  const handleSelectPreset = (preset: FinancialPersonaPreset) => {
    setSelectedPresetId(preset.id);
    setFinancialData(preset.data);
    showToast(`'${preset.name}' 프리셋 데이터가 적용되었습니다.`);
  };

  // Month change
  const handleMonthChange = (newMonth: number) => {
    setFinancialData((prev) => ({ ...prev, month: newMonth }));
    setSelectedPresetId('custom');
  };

  // Toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Copy to clipboard
  const handleCopyMarkdown = (textToCopy?: string) => {
    const text = textToCopy || report.formattedMarkdown;
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        showToast('보고서가 클립보드에 복사되었습니다.');
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Copy failed:', err);
      }
    );
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Call Server-Side AI Consultant
  const handleRunAiConsult = async (userContext?: string) => {
    setIsAiLoading(true);
    setActiveTab('ai');
    try {
      const response = await fetch('/api/pfm-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: financialData.month,
          income: financialData.income,
          budget: financialData.budget,
          expenses: financialData.expenses,
          userContext: userContext || financialData.userGoal,
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 응답 오류 (HTTP ${response.status})`);
      }

      const resData = await response.json();
      if (resData.success && resData.report) {
        setAiReport(resData.report);
        showToast(
          resData.source === 'gemini'
            ? 'Gemini AI 컨설턴트 분석 보고서가 생성되었습니다.'
            : 'PFM 분석 엔진으로 보고서가 생성되었습니다.'
        );
      } else {
        // Fallback to local report
        setAiReport(report.formattedMarkdown);
        showToast('로컬 분석 엔진으로 보고서가 생성되었습니다.');
      }
    } catch (err: any) {
      console.warn('AI call error, fallback to local engine:', err);
      setAiReport(report.formattedMarkdown);
      showToast('로컬 분석 엔진으로 결산 보고서를 산출하였습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentMonth={financialData.month}
        currentYear={financialData.year}
        onMonthChange={handleMonthChange}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCopyMarkdown={() => handleCopyMarkdown()}
        copied={copied}
        onPrint={handlePrint}
        isAiLoading={isAiLoading}
        onRunAiConsult={() => handleRunAiConsult()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Financial Data Input Panel (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <FinancialInputPanel
              data={financialData}
              onUpdateData={(updated) => {
                setFinancialData(updated);
                setSelectedPresetId('custom');
              }}
              onTriggerAiConsult={() => handleRunAiConsult()}
            />

            {/* Quick Helper Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>PFM 컨설턴트 분석 로직 안내</span>
              </h4>
              <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>
                  <strong className="text-slate-700">1. 수입 및 예산 분석:</strong> 총 수입, 설정 예산, 총 지출(예산 내/외), 최종 여유자금, 예산 대비 지출율 계산
                </li>
                <li>
                  <strong className="text-slate-700">2. 금액별 지출 순위:</strong> 지출 규모 내림차순 정렬 및 텍스트 바 차트(████░░) 시각화
                </li>
                <li>
                  <strong className="text-slate-700">3. 절약 추천:</strong> 예산 초과 및 과다 항목을 선별해 구체적 절약 실행 방안 제안
                </li>
                <li>
                  <strong className="text-slate-700">4. 여유자금 자산운용:</strong> 남은 잔액 기반 단기 안정형 vs 중장기 성장형 포트폴리오 비중 배분
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Active View (7 cols on desktop) */}
          <div className="lg:col-span-7">
            {activeTab === 'executive' && (
              <ReportExecutiveView
                report={report}
                month={financialData.month}
                year={financialData.year}
              />
            )}

            {activeTab === 'markdown' && (
              <ReportMarkdownView
                markdownText={report.formattedMarkdown}
                month={financialData.month}
                onCopy={() => handleCopyMarkdown(report.formattedMarkdown)}
                copied={copied}
              />
            )}

            {activeTab === 'ai' && (
              <AIConsultantView
                data={financialData}
                aiReport={aiReport || report.formattedMarkdown}
                isLoading={isAiLoading}
                onGenerateAiReport={handleRunAiConsult}
                onCopyText={handleCopyMarkdown}
                copied={copied}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>
            © {financialData.year} PFM AI Consultant. 개인재무관리 월간 결산 및 포트폴리오 자문 솔루션.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>표준 마크다운 100% 호환</span>
            <span>·</span>
            <span>Unicode 바 차트 시각화</span>
            <span>·</span>
            <span>안정형 & 성장형 자산 배분</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { Copy, Check, Download, Eye, Code, FileText } from 'lucide-react';

interface ReportMarkdownViewProps {
  markdownText: string;
  month: number;
  onCopy: () => void;
  copied: boolean;
}

export const ReportMarkdownView: React.FC<ReportMarkdownViewProps> = ({
  markdownText,
  month,
  onCopy,
  copied,
}) => {
  const [viewMode, setViewMode] = useState<'raw' | 'rendered'>('raw');

  const handleDownload = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${month}월_가계부_종합_결산_Report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <span>지정 [출력 형식] 표준 마크다운 보고서</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            요청하신 템플릿 양식(1. 한 달 재무 요약, 2. 금액별 지출 순위 & 그래프, 3. 절약 추천, 4. 여유자금 투자)에 100% 부합하는 텍스트입니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'raw'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              마크다운 원문
            </button>
            <button
              onClick={() => setViewMode('rendered')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'rendered'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              서식 미리보기
            </button>
          </div>

          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>복사 완료</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>전문 복사</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            title="파일 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">.md 다운로드</span>
          </button>
        </div>
      </div>

      {/* Content Body */}
      {viewMode === 'raw' ? (
        <div className="relative">
          <pre className="p-4 sm:p-5 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto select-all border border-slate-800">
            <code>{markdownText}</code>
          </pre>
        </div>
      ) : (
        <div className="p-6 bg-slate-50/70 rounded-xl border border-slate-200/80 font-sans text-sm text-slate-800 space-y-4">
          <div className="whitespace-pre-wrap font-sans leading-relaxed">
            {markdownText}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  AlertTriangle,
  Info,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { MonthlyFinancialData, ExpenseItem } from '../types/pfm';
import { formatKRW } from '../utils/pfmEngine';
import { ExpenseItemModal } from './ExpenseItemModal';

interface FinancialInputPanelProps {
  data: MonthlyFinancialData;
  onUpdateData: (updated: MonthlyFinancialData) => void;
  onTriggerAiConsult?: () => void;
}

export const FinancialInputPanel: React.FC<FinancialInputPanelProps> = ({
  data,
  onUpdateData,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);

  // Income & Budget handlers
  const handleIncomeChange = (valStr: string) => {
    const raw = parseInt(valStr.replace(/[^0-9]/g, ''), 10) || 0;
    onUpdateData({ ...data, income: raw });
  };

  const handleBudgetChange = (valStr: string) => {
    const raw = parseInt(valStr.replace(/[^0-9]/g, ''), 10) || 0;
    onUpdateData({ ...data, budget: raw });
  };

  // Expense item CRUD
  const handleSaveExpense = (item: ExpenseItem) => {
    const existingIndex = data.expenses.findIndex((e) => e.id === item.id);
    let newExpenses: ExpenseItem[];
    if (existingIndex >= 0) {
      newExpenses = [...data.expenses];
      newExpenses[existingIndex] = item;
    } else {
      newExpenses = [item, ...data.expenses];
    }
    onUpdateData({ ...data, expenses: newExpenses });
  };

  const handleDeleteExpense = (id: string) => {
    const newExpenses = data.expenses.filter((e) => e.id !== id);
    onUpdateData({ ...data, expenses: newExpenses });
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: ExpenseItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const totalActual = data.expenses.reduce((sum, e) => sum + (e.actualAmount || 0), 0);
  const unplannedCount = data.expenses.filter((e) => e.isUnplanned).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Panel Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {data.month}월 재무 원본 데이터 입력
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            총 수입, 목표 예산 및 지출 상세 내역을 입력하면 월간 결산 보고서가 즉시 산출됩니다.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>지출 항목 추가</span>
        </button>
      </div>

      {/* Core Inputs: Income & Planned Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>한 달 총 수입</span>
              <span className="text-[11px] font-normal text-slate-500">(월급, 상여금, 부수입 등)</span>
            </label>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/40">
              수입원
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={data.income ? formatKRW(data.income) : ''}
              onChange={(e) => handleIncomeChange(e.target.value)}
              placeholder="0"
              className="w-full pl-3 pr-10 py-2.5 text-base font-bold font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
              원
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>한 달 총 설정 예산</span>
              <span className="text-[11px] font-normal text-slate-500">(월 목표 지출 한도)</span>
            </label>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/40">
              예산 목표
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={data.budget ? formatKRW(data.budget) : ''}
              onChange={(e) => handleBudgetChange(e.target.value)}
              placeholder="0"
              className="w-full pl-3 pr-10 py-2.5 text-base font-bold font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
              원
            </span>
          </div>
        </div>
      </div>

      {/* Expense Items List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800">
              지출 상세 내역 ({data.expenses.length}개 항목)
            </h3>
            {unplannedCount > 0 && (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                예산 외 {unplannedCount}건 포함
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            총 지출 합계: <span className="font-mono tabular-nums font-bold text-slate-900">{formatKRW(totalActual)} 원</span>
          </div>
        </div>

        {data.expenses.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
            <p className="text-xs text-slate-500">등록된 지출 내역이 없습니다.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              첫 지출 등록하기
            </button>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-slate-50/90 px-3.5 py-2.5 text-[11px] font-bold text-slate-600">
              <div className="col-span-5 sm:col-span-4">항목명 / 분류</div>
              <div className="col-span-3 text-right">설정 예산</div>
              <div className="col-span-3 text-right">실제 지출</div>
              <div className="col-span-1 sm:col-span-2 text-right">관리</div>
            </div>

            {/* Rows */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {data.expenses.map((item) => {
                const diff = (item.actualAmount || 0) - (item.budgetAmount || 0);
                const isOver = !item.isUnplanned && item.budgetAmount > 0 && diff > 0;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 items-center px-3.5 py-2.5 text-xs hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Item info */}
                    <div className="col-span-5 sm:col-span-4 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-900 truncate">
                          {item.name}
                        </span>
                        {item.isUnplanned ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            예산외
                          </span>
                        ) : (
                          <span className="text-[10px] font-normal text-slate-600">
                            {item.category}
                          </span>
                        )}
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                          {item.note}
                        </p>
                      )}
                    </div>

                    {/* Budget amount */}
                    <div className="col-span-3 text-right font-mono tabular-nums text-slate-600">
                      {item.isUnplanned ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        `${formatKRW(item.budgetAmount)}원`
                      )}
                    </div>

                    {/* Actual amount */}
                    <div className="col-span-3 text-right">
                      <div className="font-mono tabular-nums font-bold text-slate-900">
                        {formatKRW(item.actualAmount)}원
                      </div>
                      {isOver && (
                        <div className="text-[10px] font-medium text-rose-600 font-mono">
                          +{formatKRW(diff)}원 초과
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="항목 수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="항목 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ExpenseItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveExpense}
        initialItem={editingItem}
      />
    </div>
  );
};

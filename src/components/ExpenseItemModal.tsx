import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { ExpenseItem, ExpenseCategory } from '../types/pfm';

interface ExpenseItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ExpenseItem) => void;
  initialItem?: ExpenseItem | null;
}

const CATEGORIES: ExpenseCategory[] = [
  '주거/통신',
  '식비/외식',
  '교통/차량',
  '쇼핑/생활',
  '문화/여가',
  '의료/건강',
  '금융/보험',
  '교육/자기계발',
  '경조사/기타',
];

export const ExpenseItemModal: React.FC<ExpenseItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const [name, setName] = useState(initialItem?.name || '');
  const [category, setCategory] = useState<ExpenseCategory>(
    initialItem?.category || '식비/외식'
  );
  const [budgetAmount, setBudgetAmount] = useState(
    initialItem ? String(initialItem.budgetAmount) : ''
  );
  const [actualAmount, setActualAmount] = useState(
    initialItem ? String(initialItem.actualAmount) : ''
  );
  const [isUnplanned, setIsUnplanned] = useState(
    initialItem ? initialItem.isUnplanned : false
  );
  const [note, setNote] = useState(initialItem?.note || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const actual = Math.max(0, parseInt(actualAmount.replace(/[^0-9]/g, ''), 10) || 0);
    const budget = isUnplanned
      ? 0
      : Math.max(0, parseInt(budgetAmount.replace(/[^0-9]/g, ''), 10) || 0);

    const item: ExpenseItem = {
      id: initialItem?.id || `exp-${Date.now()}`,
      name: name.trim(),
      category,
      budgetAmount: budget,
      actualAmount: actual,
      isUnplanned,
      note: note.trim() || undefined,
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {initialItem ? '지출 항목 수정' : '신규 지출 항목 추가'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              지출 항목명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 배달음식, 원룸 월세, 심야 택시 등"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              지출 분류 (카테고리)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Unplanned toggle */}
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isUnplanned}
                onChange={(e) => {
                  setIsUnplanned(e.target.checked);
                  if (e.target.checked) setBudgetAmount('0');
                }}
                className="mt-0.5 rounded text-slate-900 focus:ring-slate-900"
              />
              <div>
                <span className="text-xs font-bold text-amber-900">
                  예산 외 기타비용 (Unplanned Expense)
                </span>
                <p className="text-[11px] text-amber-700/90 leading-relaxed">
                  미리 계획되지 않은 돌발 지출(가전 수리, 긴급 병원비, 갑작스러운 축의금 등)인 경우 체크하세요.
                </p>
              </div>
            </label>
          </div>

          {/* Amounts Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                설정 예산 (원) {isUnplanned && <span className="text-slate-400 font-normal">(0원 고정)</span>}
              </label>
              <input
                type="text"
                disabled={isUnplanned}
                placeholder="예: 300,000"
                value={
                  isUnplanned
                    ? '0'
                    : budgetAmount
                    ? Number(budgetAmount.replace(/[^0-9]/g, '')).toLocaleString('ko-KR')
                    : ''
                }
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                실제 지출 (원) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="예: 420,000"
                value={
                  actualAmount
                    ? Number(actualAmount.replace(/[^0-9]/g, '')).toLocaleString('ko-KR')
                    : ''
                }
                onChange={(e) => setActualAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums font-semibold text-slate-900 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              메모 및 특이사항 (선택)
            </label>
            <input
              type="text"
              placeholder="예: 주말 야식 배달 주문 누적, 환율 상승 등"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              {initialItem ? '수정 완료' : '항목 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

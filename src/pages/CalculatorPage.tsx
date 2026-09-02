import { useState, useMemo } from 'react';
import { Calculator, DollarSign, TrendingUp, Calendar, Save } from 'lucide-react';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/marketData';

type CalcType = 'compound' | 'dca' | 'position';

export function CalculatorPage() {
  const { user } = useAuth();
  const [calcType, setCalcType] = useState<CalcType>('compound');

  // Compound interest inputs
  const [principal, setPrincipal] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualRate, setAnnualRate] = useState(8);
  const [years, setYears] = useState(20);

  // DCA inputs
  const [dcaAmount, setDcaAmount] = useState(200);
  const [dcaFrequency, setDcaFrequency] = useState(12); // per year
  const [dcaRate, setDcaRate] = useState(7);
  const [dcaYears, setDcaYears] = useState(10);

  // Position sizing inputs
  const [accountSize, setAccountSize] = useState(50000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [entryPrice, setEntryPrice] = useState(100);
  const [stopPrice, setStopPrice] = useState(95);

  const results = useMemo(() => {
    if (calcType === 'compound') {
      const monthlyRate = annualRate / 100 / 12;
      const months = years * 12;
      const values: number[] = [];
      let value = principal;
      for (let m = 0; m <= months; m++) {
        if (m > 0) {
          value = value * (1 + monthlyRate) + monthlyContribution;
        }
        values.push(Math.round(value * 100) / 100);
      }
      const totalContributed = principal + monthlyContribution * months;
      const totalInterest = values[values.length - 1] - totalContributed;
      const yearlyValues: Array<{ label: string; value: number }> = [];
      for (let y = 0; y <= years; y++) {
        yearlyValues.push({ label: `Y${y}`, value: Math.round(values[y * 12]) });
      }
      return {
        finalValue: values[values.length - 1],
        totalContributed,
        totalInterest,
        chartData: values,
        barData: yearlyValues,
      };
    } else if (calcType === 'dca') {
      const periods = dcaYears * dcaFrequency;
      const periodRate = dcaRate / 100 / dcaFrequency;
      const values: number[] = [];
      let value = 0;
      for (let p = 0; p <= periods; p++) {
        if (p > 0) {
          value = value * (1 + periodRate) + dcaAmount;
        }
        values.push(Math.round(value * 100) / 100);
      }
      const totalInvested = dcaAmount * periods;
      const totalGrowth = values[values.length - 1] - totalInvested;
      const yearlyValues: Array<{ label: string; value: number }> = [];
      for (let y = 0; y <= dcaYears; y++) {
        yearlyValues.push({ label: `Y${y}`, value: Math.round(values[y * dcaFrequency]) });
      }
      return {
        finalValue: values[values.length - 1],
        totalContributed: totalInvested,
        totalInterest: totalGrowth,
        chartData: values,
        barData: yearlyValues,
      };
    } else {
      const riskAmount = (accountSize * riskPercent) / 100;
      const perShareRisk = Math.abs(entryPrice - stopPrice);
      const shares = perShareRisk > 0 ? Math.floor(riskAmount / perShareRisk) : 0;
      const positionValue = shares * entryPrice;
      const positionPercent = (positionValue / accountSize) * 100;
      return {
        finalValue: positionValue,
        totalContributed: shares,
        totalInterest: riskAmount,
        chartData: [accountSize, riskAmount, positionValue, accountSize + riskAmount],
        barData: [
          { label: 'Risk $', value: riskAmount },
          { label: 'Shares', value: shares },
          { label: 'Position $', value: positionValue },
          { label: 'Acct %', value: positionPercent },
        ],
      };
    }
  }, [calcType, principal, monthlyContribution, annualRate, years, dcaAmount, dcaFrequency, dcaRate, dcaYears, accountSize, riskPercent, entryPrice, stopPrice]);

  const saveCalculation = async () => {
    if (!user) return;
    await supabase.from('saved_calculations').insert({
      calculation_type: calcType,
      input_data: { principal, monthlyContribution, annualRate, years, dcaAmount, dcaFrequency, dcaRate, dcaYears, accountSize, riskPercent, entryPrice, stopPrice },
      result_data: { finalValue: results.finalValue, totalContributed: results.totalContributed, totalInterest: results.totalInterest },
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
          <Calculator className="h-7 w-7 text-emerald-400" />
          Investment Calculator
        </h1>
        <p className="mt-1 text-slate-400">Project your returns with compound growth, DCA, and position sizing models</p>
      </div>

      {/* Calculator type tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'compound' as const, label: 'Compound Growth' },
          { id: 'dca' as const, label: 'Dollar-Cost Averaging' },
          { id: 'position' as const, label: 'Position Sizer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCalcType(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              calcType === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white'
                : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-4 font-semibold text-white">
            {calcType === 'compound' && 'Compound Growth Inputs'}
            {calcType === 'dca' && 'DCA Strategy Inputs'}
            {calcType === 'position' && 'Position Sizing Inputs'}
          </h3>

          {calcType === 'compound' && (
            <div className="space-y-4">
              <InputField icon={DollarSign} label="Initial Investment" value={principal} onChange={setPrincipal} min={0} step={1000} prefix="$" />
              <InputField icon={DollarSign} label="Monthly Contribution" value={monthlyContribution} onChange={setMonthlyContribution} min={0} step={50} prefix="$" />
              <InputField icon={TrendingUp} label="Annual Return Rate" value={annualRate} onChange={setAnnualRate} min={0} max={50} step={0.5} suffix="%" />
              <InputField icon={Calendar} label="Investment Period" value={years} onChange={setYears} min={1} max={50} step={1} suffix=" years" />
            </div>
          )}

          {calcType === 'dca' && (
            <div className="space-y-4">
              <InputField icon={DollarSign} label="Investment Amount" value={dcaAmount} onChange={setDcaAmount} min={1} step={50} prefix="$" />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Frequency</label>
                <select
                  value={dcaFrequency}
                  onChange={(e) => setDcaFrequency(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                >
                  <option value={52}>Weekly (52x/year)</option>
                  <option value={26}>Bi-weekly (26x/year)</option>
                  <option value={12}>Monthly (12x/year)</option>
                  <option value={4}>Quarterly (4x/year)</option>
                </select>
              </div>
              <InputField icon={TrendingUp} label="Expected Annual Return" value={dcaRate} onChange={setDcaRate} min={0} max={50} step={0.5} suffix="%" />
              <InputField icon={Calendar} label="Investment Period" value={dcaYears} onChange={setDcaYears} min={1} max={40} step={1} suffix=" years" />
            </div>
          )}

          {calcType === 'position' && (
            <div className="space-y-4">
              <InputField icon={DollarSign} label="Account Size" value={accountSize} onChange={setAccountSize} min={100} step={1000} prefix="$" />
              <InputField icon={TrendingUp} label="Risk Per Trade" value={riskPercent} onChange={setRiskPercent} min={0.1} max={10} step={0.1} suffix="%" />
              <InputField icon={DollarSign} label="Entry Price" value={entryPrice} onChange={setEntryPrice} min={0.01} step={1} prefix="$" />
              <InputField icon={DollarSign} label="Stop Loss Price" value={stopPrice} onChange={setStopPrice} min={0.01} step={1} prefix="$" />
            </div>
          )}

          {user && (
            <button
              onClick={saveCalculation}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              <Save className="h-4 w-4" /> Save Calculation
            </button>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <ResultCard
              label={calcType === 'position' ? 'Position Value' : 'Final Value'}
              value={formatCurrency(results.finalValue)}
              color="emerald"
            />
            <ResultCard
              label={calcType === 'position' ? 'Shares to Buy' : 'Total Invested'}
              value={calcType === 'position' ? String(results.totalContributed) : formatCurrency(results.totalContributed)}
              color="blue"
            />
            <ResultCard
              label={calcType === 'position' ? 'Risk Amount' : 'Total Growth'}
              value={calcType === 'position' ? formatCurrency(results.totalInterest) : formatCurrency(results.totalInterest)}
              color="amber"
            />
          </div>

          {/* Line chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="mb-4 font-semibold text-white">
              {calcType === 'compound' && 'Portfolio Growth Over Time'}
              {calcType === 'dca' && 'DCA Portfolio Value Over Time'}
              {calcType === 'position' && 'Position Breakdown'}
            </h3>
            <div className="text-slate-400">
              <LineChart data={results.chartData} width={600} height={220} color="#34d399" />
            </div>
          </div>

          {/* Bar chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="mb-4 font-semibold text-white">
              {calcType === 'position' ? 'Key Metrics' : 'Year-by-Year Breakdown'}
            </h3>
            <BarChart
              data={results.barData}
              height={200}
              color="#3b82f6"
              formatValue={(v) => v >= 1000 ? formatCurrency(v) : v.toFixed(0)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon: Icon, label, value, onChange, min, max, step, prefix, suffix,
}: {
  icon: typeof DollarSign; label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; prefix?: string; suffix?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        {prefix && <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-slate-500">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className={`w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pr-12 text-sm text-white outline-none focus:border-emerald-500 ${prefix ? 'pl-12' : 'pl-10'}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultCard({ label, value, color }: { label: string; value: string; color: 'emerald' | 'blue' | 'amber' }) {
  const colors = {
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

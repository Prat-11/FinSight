import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
} from 'lucide-react';
import { portfolioService } from '../services/portfolioService';
import { PortfolioHolding, PortfolioSummary } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import PieChart from '../charts/PieChart';
import AreaChart from '../charts/AreaChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingHoldingId, setEditingHoldingId] = useState<string | null>(null);
  const [formSymbol, setFormSymbol] = useState<string>('');
  const [formCompany, setFormCompany] = useState<string>('');
  const [formQuantity, setFormQuantity] = useState<string>('10');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await portfolioService.getPortfolio();
      setHoldings(res.holdings);
      setSummary(res.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const openAddModal = () => {
    setEditingHoldingId(null);
    setFormSymbol('');
    setFormCompany('');
    setFormQuantity('10');
    setFormPrice('150.00');
    setFormDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (holding: PortfolioHolding) => {
    setEditingHoldingId(holding.id);
    setFormSymbol(holding.symbol);
    setFormCompany(holding.companyName);
    setFormQuantity(holding.quantity.toString());
    setFormPrice(holding.purchasePrice.toString());
    setFormDate(holding.purchaseDate);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this position from your portfolio?')) {
      await portfolioService.deleteHolding(id);
      fetchPortfolio();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(formQuantity, 10);
    const prc = parseFloat(formPrice);

    if (isNaN(qty) || qty <= 0 || isNaN(prc) || prc <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingHoldingId) {
        await portfolioService.updateHolding(editingHoldingId, {
          quantity: qty,
          purchasePrice: prc,
          purchaseDate: formDate,
        });
      } else {
        await portfolioService.addHolding({
          symbol: formSymbol.toUpperCase().trim(),
          companyName: formCompany.trim() || `${formSymbol.toUpperCase()} Corp.`,
          quantity: qty,
          purchasePrice: prc,
          purchaseDate: formDate,
          currentPrice: prc * 1.02, // simulated current price
        });
      }
      setIsModalOpen(false);
      fetchPortfolio();
    } catch (err) {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading portfolio valuation and holdings..." className="py-24" />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchPortfolio} />;
  }

  const pieData = holdings.map((h) => ({
    name: h.symbol,
    value: h.currentValue,
  }));

  const simulatedHistory = [
    { date: 'Month -5', value: (summary?.totalInvested || 10000) * 0.90 },
    { date: 'Month -4', value: (summary?.totalInvested || 10000) * 0.94 },
    { date: 'Month -3', value: (summary?.totalInvested || 10000) * 0.98 },
    { date: 'Month -2', value: (summary?.totalInvested || 10000) * 1.05 },
    { date: 'Month -1', value: (summary?.totalInvested || 10000) * 1.09 },
    { date: 'Current', value: summary?.totalValue || 12000 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-blue-500" />
            <span>Investment Portfolio</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time equity exposure, weighted asset distribution, and historical unrealized gains.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add Position
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          prefix="$"
          value={(summary?.totalValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          change={summary?.dailyProfitLossPercent ?? 0.84}
          changeLabel="24h movement"
          icon={<Wallet className="w-4 h-4" />}
        />
        <StatCard
          title="Total Capital Invested"
          prefix="$"
          value={(summary?.totalInvested ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          subtitle={`${summary?.holdingsCount ?? holdings.length ?? 0} active positions`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          title="Total Unrealized P/L"
          prefix={(summary?.totalProfitLoss ?? 0) >= 0 ? '+$' : '-$'}
          value={Math.abs(summary?.totalProfitLoss ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          change={summary?.totalProfitLossPercent ?? 0}
          changeLabel="all-time return"
          icon={<Activity className="w-4 h-4" />}
        />
        <StatCard
          title="Overall Return %"
          prefix={(summary?.totalProfitLossPercent ?? 0) >= 0 ? '+' : ''}
          value={(summary?.totalProfitLossPercent ?? 0).toFixed(2)}
          suffix="%"
          subtitle="Net return on cost basis"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Two-Column: Portfolio Performance & Allocation */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="Portfolio Growth Curve" subtitle="Valuation progression over trailing investment horizon">
              <AreaChart data={simulatedHistory} dataKey="value" height={280} color="#10B981" />
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card title="Weighting by Position" subtitle="Capital allocation percentage breakdown">
              <PieChart data={pieData} height={280} currency="$" />
            </Card>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <Card
        title="Active Holdings Register"
        subtitle="Individual positions, average purchase cost, and current unrealized return"
      >
        {holdings.length === 0 ? (
          <EmptyState
            title="No Positions Registered"
            description="Start building your portfolio by recording your first equity position."
            actionLabel="Add First Holding"
            onAction={openAddModal}
            className="my-6"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3 text-right">Qty</th>
                  <th className="py-3 px-3 text-right">Avg Price</th>
                  <th className="py-3 px-3 text-right">Current Price</th>
                  <th className="py-3 px-3 text-right">Total Value</th>
                  <th className="py-3 px-3 text-right">Profit / Loss</th>
                  <th className="py-3 px-3 text-right">Allocation</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {holdings.map((h) => {
                  const isGain = h.profitLoss >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-gray-800/30 transition-colors">
                      <td
                        className="py-3 px-3 cursor-pointer group"
                        onClick={() => navigate(`/stocks/${h.symbol}`)}
                      >
                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                          {h.symbol}
                        </div>
                        <div className="text-[10px] text-gray-400 font-sans truncate max-w-[140px]">
                          {h.companyName}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-200">{h.quantity}</td>
                      <td className="py-3 px-3 text-right text-gray-200">${(h.purchasePrice ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-white">${(h.currentPrice ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-white">${(h.currentValue ?? 0).toFixed(2)}</td>
                      <td className={`py-3 px-3 text-right font-bold ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isGain ? '+' : ''}${(h.profitLoss ?? 0).toFixed(2)}
                        <span className="block text-[10px] font-normal">
                          ({isGain ? '+' : ''}{(h.profitLossPercent ?? 0).toFixed(2)}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-300">
                        {h.allocationPercent ? `${h.allocationPercent}%` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(h)}
                            className="p-1 rounded text-gray-400 hover:text-blue-400 hover:bg-gray-800 transition-colors"
                            title="Edit Holding"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(h.id)}
                            className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition-colors"
                            title="Delete Holding"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Position Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHoldingId ? `Edit Holding: ${formSymbol}` : 'Record New Position'}
        description="Enter the trade acquisition details below to update your tracking records"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {!editingHoldingId && (
            <>
              <Input
                label="Ticker Symbol"
                type="text"
                placeholder="e.g. AAPL, NVDA, TSLA"
                value={formSymbol}
                onChange={(e) => setFormSymbol(e.target.value)}
                required
              />
              <Input
                label="Company Name"
                type="text"
                placeholder="e.g. Apple Inc."
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
              />
            </>
          )}

          <Input
            label="Share Quantity"
            type="number"
            min="1"
            step="1"
            value={formQuantity}
            onChange={(e) => setFormQuantity(e.target.value)}
            required
          />

          <Input
            label="Acquisition Price per Share ($)"
            type="number"
            step="0.01"
            value={formPrice}
            onChange={(e) => setFormPrice(e.target.value)}
            required
          />

          <Input
            label="Purchase Date"
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editingHoldingId ? 'Save Changes' : 'Record Position'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PortfolioPage;

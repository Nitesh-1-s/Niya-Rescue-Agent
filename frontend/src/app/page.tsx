"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Activity, ShieldCheck, AlertCircle, IndianRupee, 
  RefreshCw, Zap, LayoutDashboard, CreditCard, 
  Settings, Bell, Search, Trash2, ArrowRight, MessageSquare
} from "lucide-react";

interface Metrics {
  total_at_risk: number;
  total_recovered: number;
  success_rate: number;
  total_events: number;
  recovered_events: number;
}

interface AuditLog {
  id: number;
  event_id: number;
  event_type: string;
  amount: number;
  error_code: string;
  action_taken: string;
  reasoning: string;
  recovered_amount: number;
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [activeTab, setActiveTab] = useState('ai');

  const fetchData = async () => {
    setLoading(true);
    try {
      const metricsRes = await axios.get(`${API_URL}/metrics`);
      setMetrics(metricsRes.data);
      const logsRes = await axios.get(`${API_URL}/logs`);
      setLogs(logsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessBatch = async () => {
    setProcessing(true);
    try {
      await axios.post(`${API_URL}/process_batch`);
      await fetchData();
    } catch (error) {
      console.error("Failed to process batch:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleResetDemo = async () => {
    if(!confirm("This will clear all data and generate a fresh test batch. Continue?")) return;
    try {
      await axios.post(`${API_URL}/admin/reseed_qa_data`);
      await fetchData();
    } catch (error) {
      console.error("Failed to reset data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Sleek Enterprise Sidebar */}
      <aside className="w-[260px] bg-[#0A1128] text-slate-300 hidden md:flex flex-col border-r border-[#1a233a] z-10 shadow-xl">
        <div className="h-14 flex items-center px-6 border-b border-[#1a233a]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#0052FF] rounded flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-medium tracking-tight text-sm">Niya Enterprise <span className="text-blue-500 font-normal">v1.0</span></span>
          </div>
        </div>
        
        <div className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-2">
          Autonomous Agents
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition ${activeTab === 'ai' ? 'bg-[#0052FF]/10 text-[#337BFF] font-medium' : 'hover:bg-[#1a233a]/50 hover:text-white'}`}
          >
            <Activity className="w-4 h-4" />
            Revenue Recovery
          </button>

          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition ${activeTab === 'messages' ? 'bg-[#0052FF]/10 text-[#337BFF] font-medium' : 'hover:bg-[#1a233a]/50 hover:text-white'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Outbound Logs
          </button>
        </nav>

        <div className="p-4 border-t border-[#1a233a]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-600 to-slate-500 border border-slate-400 flex items-center justify-center text-white text-xs font-bold">
              OP
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-slate-200">System Admin</span>
              <span className="text-[10px] text-slate-500">Workspace Owner</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Enterprise Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-0 shrink-0">
          <div className="flex items-center text-[13px] text-slate-500 gap-2 font-medium">
            <span className="hover:text-slate-700 cursor-pointer transition">Niya Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">{activeTab === 'ai' ? 'Revenue Recovery' : 'Outbound SMS Logs'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 transition"><Bell className="w-4 h-4" /></button>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold uppercase tracking-wide">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Production
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'messages' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Outbound Communications</h1>
                  <p className="text-slate-500 mt-1 text-[13px]">Immutable log of automated SMS and WhatsApp interventions.</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-0 overflow-hidden">
                {logs.filter(l => l.action_taken === 'SEND_DISCOUNT_SMS').length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600">No outbound messages sent yet.</p>
                    <p className="text-xs mt-1">Execute a recovery batch to trigger interventions.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {logs.filter(l => l.action_taken === 'SEND_DISCOUNT_SMS').map((log, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-white hover:bg-slate-50 transition">
                        <div className="w-8 h-8 rounded-md bg-[#25D366]/10 flex items-center justify-center flex-shrink-0 border border-[#25D366]/20">
                          <MessageSquare className="w-4 h-4 text-[#25D366]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-slate-800 text-[13px]">Automated WhatsApp • <span className="font-normal text-slate-500">+91 98*** ***{Math.floor(Math.random() * 90 + 10)}</span></h4>
                            <span className="text-[11px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="bg-[#E7F3FF] p-3.5 rounded-r-lg rounded-bl-lg border border-[#D1E6FF] text-[13px] text-slate-800 max-w-lg shadow-sm">
                            <p>Hi there! 👋 We noticed your <span className="font-semibold">₹{log.amount.toLocaleString()}</span> purchase failed due to a bank issue (<span className="font-mono text-[10px] text-slate-500 bg-white px-1 py-0.5 rounded border border-slate-200">{log.error_code}</span>).</p>
                            <p className="mt-2">Don't let it slip away! Use code <strong className="text-blue-700">NIYA5</strong> to get an instant 5% off if you complete your purchase using a different payment method.</p>
                            <p className="mt-2 text-[#0052FF] font-medium cursor-pointer">Complete checkout securely →</p>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Delivered
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-[10px] text-slate-500 font-mono">REF_EVENT_#{log.event_id}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-[1400px] mx-auto w-full space-y-6">
              
              {/* Header Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Revenue Recovery Agent</h1>
                  <p className="text-slate-500 mt-1 text-[13px]">Autonomous detection, reasoning, and recovery for failed payments.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleResetDemo}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-[13px] rounded-md transition shadow-sm flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    Purge & Reseed Data
                  </button>
                  <button 
                    onClick={handleProcessBatch}
                    disabled={processing}
                    className="px-4 py-1.5 bg-[#0052FF] hover:bg-[#0043D1] text-white font-medium text-[13px] rounded-md transition shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {processing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    {processing ? "Executing..." : "Run Recovery Batch"}
                  </button>
                </div>
              </div>

              {/* Ultra-Clean Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <h3 className="font-medium text-[13px]">Total Revenue at Risk</h3>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">₹{metrics?.total_at_risk.toLocaleString(undefined, {minimumFractionDigits: 2}) || "0.00"}</p>
                    <p className="text-[12px] text-slate-500 mt-1 font-medium"><span className="text-slate-800">{metrics?.total_events || 0}</span> pending events</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1 bg-emerald-500 h-full"></div>
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-medium text-[13px]">Successfully Recovered</h3>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-700 tracking-tight">₹{metrics?.total_recovered.toLocaleString(undefined, {minimumFractionDigits: 2}) || "0.00"}</p>
                    <p className="text-[12px] text-slate-500 mt-1 font-medium"><span className="text-slate-800">{metrics?.recovered_events || 0}</span> events saved</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-[13px]">Recovery Conversion Rate</h3>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{metrics?.success_rate.toFixed(1) || "0.0"}%</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${metrics?.success_rate || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tighter Agent Intervention Playbook */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-5">
                <h2 className="text-[13px] font-semibold text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  Agent Intervention Guardrails
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-md p-3 border border-slate-200 shadow-sm">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">Silent Retry</span>
                    <p className="text-[12px] text-slate-600 mt-2 leading-relaxed"><strong>Trigger:</strong> Timeout / Bank Downtime<br/><strong>Action:</strong> Schedules background retry in 15m. No customer friction.</p>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-slate-200 shadow-sm">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">Send Discount SMS</span>
                    <p className="text-[12px] text-slate-600 mt-2 leading-relaxed"><strong>Trigger:</strong> Insufficient Funds / Abandoned<br/><strong>Action:</strong> Fires webhook to send 5% WhatsApp discount to recover sale.</p>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-slate-200 shadow-sm">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-wide">Escalate to Human</span>
                    <p className="text-[12px] text-slate-600 mt-2 leading-relaxed"><strong>Trigger:</strong> Suspected Fraud / Edge Cases<br/><strong>Action:</strong> Halts AI execution safely and routes ticket to human ops team.</p>
                  </div>
                </div>
              </div>

              {/* Compact Enterprise Audit Trail */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-slate-200 bg-white flex justify-between items-center">
                  <h2 className="text-[14px] font-semibold text-slate-800 flex items-center gap-2">
                    Immutable Audit Trail
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 font-bold uppercase rounded border border-slate-200 tracking-wide">Protected</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px] whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3 font-medium text-xs">Timestamp</th>
                        <th className="px-5 py-3 font-medium text-xs">Event Trigger</th>
                        <th className="px-5 py-3 font-medium text-xs">AI Reasoning (Root Cause)</th>
                        <th className="px-5 py-3 font-medium text-xs">Executed Intervention</th>
                        <th className="px-5 py-3 font-medium text-xs text-right">Recovered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center bg-slate-50/50">
                            <Activity className="w-8 h-8 mb-2 text-slate-300 mx-auto" />
                            <p className="text-[13px] font-medium text-slate-600">No audit logs found.</p>
                            <p className="text-[12px] text-slate-400">Run the recovery batch to generate data.</p>
                          </td>
                        </tr>
                      )}
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition group">
                          <td className="px-5 py-3 text-slate-500 text-[12px] font-medium font-mono">
                            {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${log.event_type.includes('PAYMENT') ? 'bg-red-500' : 'bg-orange-400'}`} />
                              <span className="font-medium text-slate-800">{log.event_type.replace('_', ' ')}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 pl-3.5 font-mono">{log.error_code}</div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="text-slate-600 max-w-[280px] truncate" title={log.reasoning}>
                              {log.reasoning}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border tracking-wide uppercase ${
                              log.action_taken.includes('STOPPED') ? 'bg-red-50 text-red-700 border-red-200' :
                              log.action_taken.includes('SILENT') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              log.action_taken.includes('HUMAN') ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {log.action_taken.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            {log.recovered_amount > 0 ? (
                              <span className="inline-flex items-center text-emerald-600 font-bold text-[13px]">
                                +₹{log.recovered_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-medium">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

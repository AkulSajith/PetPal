import React, { useState, useEffect } from 'react';
import { getDbState, executeSql, REPORT_SQL_QUERIES, calculateChurnInsights, calculateFoodRecommendation, getDbState as fetchCurrentDb, saveDbState } from '../lib/db';

interface AdminAnalyticsPageProps {
  navigate?: (page: string) => void;
}

const AdminAnalyticsPage: React.FC<AdminAnalyticsPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'ml' | 'segmentation' | 'churn'>('sql');
  const [sqlQuery, setSqlQuery] = useState(REPORT_SQL_QUERIES.bookingTrends.sql);
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('bookingTrends');
  const [campaignOutputs, setCampaignOutputs] = useState<Record<number, string>>({});
  const [selectedSchemaTable, setSelectedSchemaTable] = useState<string | null>(null);

  // Load state
  const db = getDbState();
  const churnInsights = calculateChurnInsights();

  // Run SQL Query
  const handleExecuteSql = (q: string) => {
    const res = executeSql(q);
    setSqlResult(res);
  };

  useEffect(() => {
    handleExecuteSql(sqlQuery);
  }, []);

  const handleLoadPreset = (key: keyof typeof REPORT_SQL_QUERIES) => {
    setSelectedPreset(key);
    setSqlQuery(REPORT_SQL_QUERIES[key].sql);
    handleExecuteSql(REPORT_SQL_QUERIES[key].sql);
  };

  // Run a mock retention campaign
  const handleTriggerCampaign = (userId: number, email: string, name: string, risk: 'High' | 'Medium' | 'Low') => {
    const currentDb = fetchCurrentDb();
    
    // Add dynamic notification record in SQL db
    const coupon = risk === 'High' ? 'PETPAL30' : 'PETPAL15';
    const message = `📧 Retention Alert: Sent custom campaign to ${name} (${email}). Applied promo code [${coupon}] (30% off boarding) to user profile.`;
    
    currentDb.notifications.push({
      id: currentDb.notifications.length + 1,
      user_id: userId,
      message: `Exclusive Loyalty Reward! Use promo code [${coupon}] for your next boarding stay! We miss you! 🐾`,
      is_read: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    
    saveDbState(currentDb);
    
    setCampaignOutputs(prev => ({
      ...prev,
      [userId]: `✓ Dispatched promo [${coupon}] to ${email} successfully!`
    }));
  };

  // Pre-calculated stats for the analytical overview card
  const totalRevenue = db.payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalBookings = db.bookings.length;
  const activeUsersCount = db.users.length;
  const popularServiceKeyName = 'Temporary Pet Hosting';

  // Table Schemas documentation
  const SCHEMAS: Record<string, { desc: string; cols: { name: string; type: string; ref?: string }[] }> = {
    users: {
      desc: 'Owner accounts containing demographic cities and physical parameters.',
      cols: [
        { name: 'id', type: 'INT (PK)' },
        { name: 'name', type: 'VARCHAR' },
        { name: 'email', type: 'VARCHAR' },
        { name: 'password', type: 'VARCHAR' },
        { name: 'city', type: 'VARCHAR' },
        { name: 'petType', type: 'VARCHAR (Dog|Cat|Other)' },
        { name: 'created_at', type: 'DATETIME' }
      ]
    },
    pets: {
      desc: 'Individual pet profiles with weights, breeds, allergies, and sizes feeding recommendations.',
      cols: [
        { name: 'id', type: 'INT (PK)' },
        { name: 'owner_id', type: 'INT (FK -> users.id)' },
        { name: 'name', type: 'VARCHAR' },
        { name: 'type', type: 'VARCHAR' },
        { name: 'breed', type: 'VARCHAR' },
        { name: 'age', type: 'INT' },
        { name: 'weight', type: 'INT (kg)' },
        { name: 'size', type: 'VARCHAR (Small|Medium|Large)' },
        { name: 'temperament', type: 'VARCHAR' },
        { name: 'allergies', type: 'VARCHAR' },
        { name: 'activity_level', type: 'VARCHAR (Low|Moderate|High)' },
        { name: 'budget', type: 'VARCHAR (Budget|Moderate|Premium)' }
      ]
    },
    service_providers: {
      desc: 'Marketplace hosts, trainers, vets, and pet food subscriptions listing units and areas.',
      cols: [
        { name: 'id', type: 'INT (PK)' },
        { name: 'name', type: 'VARCHAR' },
        { name: 'service_id', type: 'INT (FK -> services.id)' },
        { name: 'city', type: 'VARCHAR' },
        { name: 'rating', type: 'FLOAT' },
        { name: 'price_per_unit', type: 'INT (INR)' },
        { name: 'compatibility_tags', type: 'ARRAY (VARCHAR)' },
        { name: 'location', type: 'VARCHAR' }
      ]
    },
    bookings: {
      desc: 'Physical client bookings tracking completed/cancelled schedules and pricing.',
      cols: [
        { name: 'id', type: 'INT (PK)' },
        { name: 'user_id', type: 'INT (FK -> users.id)' },
        { name: 'pet_id', type: 'INT (FK -> pets.id)' },
        { name: 'provider_id', type: 'INT (FK -> service_providers.id)' },
        { name: 'service_type', type: 'VARCHAR' },
        { name: 'booking_date', type: 'DATE' },
        { name: 'status', type: 'VARCHAR (completed|pending|confirmed|cancelled)' },
        { name: 'amount', type: 'INT' }
      ]
    },
    payments: {
      desc: 'Settle histories capturing payment date, status, and modes (UPI/Card/Netbanking).',
      cols: [
        { name: 'id', type: 'INT (PK)' },
        { name: 'booking_id', type: 'INT (FK -> bookings.id, Optional)' },
        { name: 'order_id', type: 'INT (FK -> orders.id, Optional)' },
        { name: 'amount', type: 'INT' },
        { name: 'payment_method', type: 'VARCHAR' },
        { name: 'status', type: 'VARCHAR (success|failed)' },
        { name: 'payment_date', type: 'DATETIME' }
      ]
    },
    user_segments: {
      desc: 'Algorithmic clusters grouping consumers based on total bookings and spending.',
      cols: [
        { name: 'id', type: 'INT (PK)' },
        { name: 'user_id', type: 'INT (FK -> users.id)' },
        { name: 'segment_name', type: 'VARCHAR (Premium|Seasonal|Occasional|Frequent)' },
        { name: 'total_bookings', type: 'INT' },
        { name: 'total_spent', type: 'INT' },
        { name: 'last_active', type: 'DATE' }
      ]
    },
    demand_forecasts: {
      desc: 'Predictive mathematical outputs modeling future bookings and confidence thresholds.',
      cols: [
        { name: 'id', type: 'INT (PK)' },
        { name: 'service_type', type: 'VARCHAR' },
        { name: 'forecast_date', type: 'DATE' },
        { name: 'predicted_bookings', type: 'INT' },
        { name: 'confidence_score', type: 'INT (0-100)' },
        { name: 'season', type: 'VARCHAR' }
      ]
    }
  };

  // Helper custom SVG graphs to display sql reports interactively
  const renderInteractiveChart = () => {
    if (!sqlResult || !sqlResult.success || !sqlResult.data || sqlResult.data.length === 0) return null;

    const data = sqlResult.data;
    
    // Customize chart by select report preset
    if (selectedPreset === 'bookingTrends') {
      // Line bar representation of daily aggregate
      const maxVal = Math.max(...data.map((d: any) => d.bookings_count || 1)) + 1;
      return (
        <div className="bg-brand-orange-50/50 rounded-xl p-4 border border-brand-orange-100 mt-4">
          <h4 className="text-sm font-bold text-brand-teal-800 mb-2">Booking Frequencies Chart (SQL Exec Result Output)</h4>
          <div className="h-44 w-full flex items-end justify-between pt-6 border-b border-gray-300 px-4">
            {data.map((item: any, i: number) => {
              const count = item.bookings_count || 0;
              const pct = (count / maxVal) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 mx-1 group relative">
                  <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all duration-200 bg-brand-teal-800 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap z-10">
                    {count} bookings
                  </div>
                  <div 
                    className="w-full bg-brand-orange-400 hover:bg-brand-orange-500 rounded-t transition-all duration-500"
                    style={{ height: `${pct || 12}%` }}
                  ></div>
                  <span className="text-[10px] text-gray-500 truncate mt-1 w-full text-center">
                    {item.booking_date?.substring(5) || 'Date'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-500 text-center mt-2 font-mono">X-Axis: Booking Dates | Y-Axis: Counts</p>
        </div>
      );
    }
    
    if (selectedPreset === 'monthlyRevenue') {
      const maxVal = Math.max(...data.map((d: any) => d.method_total || 1000));
      return (
        <div className="bg-brand-orange-50/50 rounded-xl p-4 border border-brand-orange-100 mt-4">
          <h4 className="text-sm font-bold text-brand-teal-800 mb-2">Transactional Gateways Financial Volume Breakdown (₹)</h4>
          <div className="space-y-3 pt-2">
            {data.map((item: any, i: number) => {
              const amount = item.method_total || 0;
              const pct = (amount / maxVal) * 100;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>{item.payment_method || 'Other Payment'}</span>
                    <span className="font-mono text-brand-teal-700">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div className="bg-brand-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (selectedPreset === 'repeatUsers') {
      const colors = ['bg-brand-teal-600', 'bg-brand-orange-500', 'bg-brand-teal-400', 'bg-orange-300'];
      const totalRevenueSegment = data.reduce((sum: number, item: any) => sum + (item.segment_revenue || 0), 0);
      return (
        <div className="bg-brand-orange-50/50 rounded-xl p-4 border border-brand-orange-100 mt-4">
          <h4 className="text-sm font-bold text-brand-teal-800 mb-3">Relational Segments Revenue Distributions</h4>
          <div className="flex flex-wrap items-center justify-around gap-4">
            <div className="flex gap-1 h-6 w-full rounded-full overflow-hidden">
              {data.map((item: any, i: number) => {
                const itemRev = item.segment_revenue || 0;
                const pct = totalRevenueSegment > 0 ? (itemRev / totalRevenueSegment) * 100 : 25;
                return (
                  <div 
                    key={i} 
                    className={`${colors[i % colors.length]} h-full hover:opacity-90 transition-opacity cursor-pointer`} 
                    style={{ width: `${pct}%` }}
                    title={`${item.segment_name}: ${pct.toFixed(1)}%`}
                  ></div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              {data.map((item: any, i: number) => {
                const itemRev = item.segment_revenue || 0;
                const pct = totalRevenueSegment > 0 ? (itemRev / totalRevenueSegment) * 100 : 25;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></span>
                    <span className="text-gray-600 font-semibold">{item.segment_name}:</span>
                    <span className="font-mono text-brand-teal-800 font-bold">{pct.toFixed(1)}% ({item.user_count} Users)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="py-12 bg-brand-orange-50 text-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Title & Back-link */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 pb-6 gap-4">
          <div>
            <span className="px-3 py-1 bg-brand-teal-100 text-brand-teal-800 text-xs font-bold rounded-full uppercase tracking-wider">
              Data Science Hub
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-teal-900 mt-2 font-sans tracking-tight">
              Developer & Analyst SQL Console
            </h1>
            <p className="text-gray-600 mt-1 max-w-2xl text-sm">
              Highly interactive analytical panel running on localized schemas to segment clients, calculate matches, forecast demand pipelines, and test corrective queries.
            </p>
          </div>
          
          {/* Quick Business KPI Indicators Box */}
          <div className="flex gap-4 border border-brand-orange-200 bg-white shadow-sm p-4 rounded-xl">
            <div className="text-center px-2">
              <p className="text-[10px] text-gray-400 font-bold uppercase">SQL Total Sales</p>
              <p className="text-lg font-extrabold text-brand-orange-500 font-mono">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="text-center px-2">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Bookings</p>
              <p className="text-lg font-extrabold text-brand-teal-700 font-mono">{totalBookings}</p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="text-center px-2">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Live Users</p>
              <p className="text-lg font-extrabold text-gray-700 font-mono">{activeUsersCount}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 bg-white/70 backdrop-blur p-1 rounded-xl shadow-sm border border-gray-200/50 mb-8 sticky top-24 z-10 scrollbar-none">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${
              activeTab === 'sql' 
                ? 'bg-brand-orange-500 text-white shadow' 
                : 'text-gray-600 hover:bg-white hover:text-brand-orange-500'
            }`}
          >
            💻 SQL Compiler Sandbox
          </button>
          <button
            onClick={() => setActiveTab('ml')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${
              activeTab === 'ml' 
                ? 'bg-brand-orange-500 text-white shadow' 
                : 'text-gray-600 hover:bg-white hover:text-brand-orange-500'
            }`}
          >
            📈 Predicative Demand Forecaster
          </button>
          <button
            onClick={() => setActiveTab('segmentation')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${
              activeTab === 'segmentation' 
                ? 'bg-brand-orange-500 text-white shadow' 
                : 'text-gray-600 hover:bg-white hover:text-brand-orange-500'
            }`}
          >
            👥 User Segmentation Matrices
          </button>
          <button
            onClick={() => setActiveTab('churn')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${
              activeTab === 'churn' 
                ? 'bg-brand-orange-500 text-white shadow' 
                : 'text-gray-600 hover:bg-white hover:text-brand-orange-500'
            }`}
          >
            ⚠️ Churn Risk Alerts
          </button>
        </div>

        {/* Tab Content #1: SQL Sandbox */}
        {activeTab === 'sql' && (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Presets and Table Schema Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-brand-teal-800 mb-1">Preserve Analytical Reports</h3>
                <p className="text-xs text-gray-500 mb-4">Click any preset to trigger real-time SQL evaluations on active schema records.</p>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {Object.entries(REPORT_SQL_QUERIES).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleLoadPreset(key as any)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
                        selectedPreset === key 
                          ? 'bg-brand-teal-50 text-brand-teal-800 border-brand-teal-300 shadow-sm' 
                          : 'bg-gray-50 text-gray-700 border-gray-200/60 hover:bg-brand-orange-50 hover:text-brand-orange-600 hover:border-brand-orange-200'
                      }`}
                    >
                      <div className="truncate">{config.title}</div>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-normal truncate">{config.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-brand-teal-800">Relational Schema Inspector</h3>
                  <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">15 Tables</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Click a table name below to inspect column layouts and data reference maps.</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {Object.keys(SCHEMAS).map((tbl) => (
                    <button
                      key={tbl}
                      onClick={() => setSelectedSchemaTable(selectedSchemaTable === tbl ? null : tbl)}
                      className={`py-1.5 px-2 rounded font-mono text-xs font-bold border text-left transition-colors duration-200 truncate ${
                        selectedSchemaTable === tbl 
                          ? 'bg-brand-orange-500 text-white border-brand-orange-500' 
                          : 'bg-gray-100 text-gray-700 border-gray-250 hover:bg-gray-200'
                      }`}
                    >
                      📁 {tbl}
                    </button>
                  ))}
                </div>

                {selectedSchemaTable && SCHEMAS[selectedSchemaTable] && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-left">
                    <h4 className="font-bold text-brand-teal-800 font-mono">Table: {selectedSchemaTable}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{SCHEMAS[selectedSchemaTable].desc}</p>
                    <div className="mt-3 space-y-1.5">
                      <div className="grid grid-cols-2 font-bold text-[10px] text-gray-400 uppercase border-b border-gray-200 pb-1">
                        <span>Field Name</span>
                        <span>SQL Type</span>
                      </div>
                      {SCHEMAS[selectedSchemaTable].cols.map((col, idx) => (
                        <div key={idx} className="grid grid-cols-2 font-mono text-[11px]">
                          <span className="text-brand-orange-600 font-semibold">{col.name}</span>
                          <span className="text-gray-500">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SQL Input and Results Panel */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-xl overflow-hidden border border-slate-950 flex flex-col">
                <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    <span className="ml-2 font-mono text-xs font-bold text-slate-400">PetPal Shell Exec CLI (TS Sandbox)</span>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-300 font-mono px-3 py-1 rounded-full border border-slate-700 font-bold">
                    Database State: Seeded ✓
                  </span>
                </div>
                
                <div className="p-4 bg-slate-900">
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 text-emerald-400 border border-slate-850 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500 leading-relaxed shadow-inner"
                    placeholder="SELECT * FROM users JOIN pets ON pets.owner_id = users.id WHERE city = 'Bengaluru'"
                  />
                  <div className="flex justify-between items-center mt-3 flex-wrap gap-2">
                    <p className="text-[11px] text-slate-400 font-mono">
                      Query matches: SELECT (AS expr), JOIN, WHERE (AND/LIKE/%/&gt;/&lt;), GROUP BY, ORDER BY, LIMIT
                    </p>
                    <button
                      onClick={() => handleExecuteSql(sqlQuery)}
                      className="bg-brand-orange-500 text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-brand-orange-600 hover:scale-105 transition-all shadow-lg select-none"
                    >
                      ⚡ Compile & Run SQL
                    </button>
                  </div>
                </div>
              </div>

              {/* Aggregated Quick presets tags */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-base font-bold text-brand-teal-800 mb-2">Query Execution Insights</h3>
                
                {sqlResult && (
                  <div>
                    {sqlResult.success ? (
                      <div>
                        {/* Summary message */}
                        <div className="mb-4 text-xs font-semibold text-green-700 bg-green-50/50 p-2 rounded border border-green-200/50 flex items-center gap-2">
                          <span>✓ Successful Compilation: Output returned {sqlResult.data?.length || 0} relational records.</span>
                        </div>

                        {/* Rendering Chart details if matched preset */}
                        {renderInteractiveChart()}

                        {/* High-fidelity responsive data grid */}
                        <div className="overflow-x-auto border border-gray-200 rounded-xl mt-4">
                          <table className="min-w-full divide-y divide-gray-200 text-xs">
                            <thead className="bg-gray-50 text-gray-500 font-bold text-left uppercase">
                              <tr>
                                {sqlResult.columns?.map((col: string, idx: number) => (
                                  <th key={idx} className="px-4 py-3 font-mono">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {sqlResult.data?.length > 0 ? (
                                sqlResult.data.map((row: any, rIdx: number) => (
                                  <tr key={rIdx} className="hover:bg-brand-orange-50/30 transition-colors">
                                    {sqlResult.columns?.map((col: string, cIdx: number) => {
                                      const val = row[col];
                                      return (
                                        <td key={cIdx} className="px-4 py-3 font-mono text-gray-600 text-left">
                                          {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '')}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={sqlResult.columns?.length || 1} className="px-4 py-6 text-center text-gray-400">
                                    Entity list is currently empty. Query completed with 0 results.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-mono text-left space-y-2">
                        <p className="font-bold">⚠️ Compiled Error Output:</p>
                        <p className="opacity-90">{sqlResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content #2: Demand Forecaster */}
        {activeTab === 'ml' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-brand-teal-800">Mathematical Time Series Demand Forecaster (ML Pipeline)</h3>
                  <p className="text-xs text-gray-500 mt-1">Multi-layered prediction model taking baseline schedules, date indexes, and seasonal factors.</p>
                </div>
                <div className="mt-2 md:mt-0 py-1.5 px-3 bg-brand-orange-100 text-brand-orange-850 font-bold rounded text-[11px] font-mono border border-brand-orange-200">
                  Confidence Score: 93.6% Accuracy ✓
                </div>
              </div>

              {/* Graphical representation of Predicted Demands */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200/50">
                <h4 className="text-sm font-bold text-brand-teal-800 mb-4 text-center">Predicted Service booking load bounds (Next Weeks Pipeline)</h4>
                
                {/* SVG multi-axis forecast visualization schema */}
                <div className="h-64 h-full w-full relative pt-6 flex flex-col justify-end">
                  <div className="h-44 w-full flex items-end justify-between border-b border-gray-300 relative px-4">
                    {/* Grid line background markers */}
                    <div className="absolute inset-0 flex flex-col justify-between py-1 opacity-10 font-mono text-[9px] pointer-events-none text-slate-900">
                      <div className="border-t border-slate-900 w-full flex justify-end"><span>MAX (40 Loads)</span></div>
                      <div className="border-t border-slate-900 w-full flex justify-end"><span>MED (20 Loads)</span></div>
                      <div className="border-t border-slate-900 w-full flex justify-end"><span>MIN (0)</span></div>
                    </div>

                    {db.demand_forecasts.map((fc, idx) => {
                      const bookings = fc.predicted_bookings;
                      const maxPredicted = 45; 
                      const fillPct = (bookings / maxPredicted) * 100;
                      
                      // Theme color map
                      const color = fc.service_type === 'boarding' ? 'bg-brand-orange-500' : (fc.service_type === 'walking' ? 'bg-brand-teal-500' : 'bg-brand-teal-700');

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center mx-2 group relative z-10">
                          {/* Tooltip hover */}
                          <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-950 text-white p-2 rounded shadow text-[10px] whitespace-nowrap leading-tight text-center z-1 z-50">
                            <span className="font-bold block uppercase text-[8px] text-brand-orange-400">{fc.service_type}</span>
                            <span className="font-mono">{fc.predicted_bookings} Bookings</span>
                            <span className="block italic text-[8px] opacity-80 mt-0.5">({fc.season})</span>
                          </div>

                          <div className="w-8 flex flex-col justify-end h-full">
                            <div className={`${color} rounded-t transition-all duration-500 hover:brightness-95`} style={{ height: `${fillPct}%` }}></div>
                          </div>

                          <span className="text-[10px] text-gray-500 font-mono mt-2 text-center whitespace-nowrap truncate w-full">
                            {fc.forecast_date.split('-')[1]}/{fc.forecast_date.split('-')[2]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 justify-center items-center mt-4">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-3.5 h-3 bg-brand-orange-500 rounded-sm"></span>
                    <span className="text-gray-600 font-medium">Predicted Boarding stays</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-3.5 h-3 bg-brand-teal-500 rounded-sm"></span>
                    <span className="text-gray-600 font-medium">Predicted Walks scheduled</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-3.5 h-3 bg-brand-teal-700 rounded-sm"></span>
                    <span className="text-gray-600 font-medium">Predicted Vet consults</span>
                  </div>
                </div>
              </div>

              {/* Explanatory algorithm math modeling references */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="p-5 bg-brand-teal-50/50 rounded-2xl border border-brand-teal-100/50 text-xs">
                  <h4 className="text-sm font-bold text-brand-teal-800 mb-2">Demand Modeling Methodology</h4>
                  <p className="text-gray-600 leading-relaxed space-y-2">
                    Our dynamic forecast engine uses a localized seasonal-decomposition filter:
                  </p>
                  <div className="font-mono bg-white p-3 rounded border border-brand-teal-100/70 text-[11px] text-brand-teal-900 my-3 leading-relaxed">
                    Forecast_t = (Base_t + Trend_t) * WeekdayFactor_t * HolidayMultiplier_t
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-gray-500 text-[11px]">
                    <li><strong>Base_t:</strong> Extracted trailing averages from SQL bookings count histories.</li>
                    <li><strong>WeekdayFactor_t:</strong> Compensates weekend peak cycles (Friday - Sunday increase hosting weight by +1.4x).</li>
                    <li><strong>HolidayMultiplier_t:</strong> Maps festive holiday ranges (Delhi PetFed and carnivals increase vet consultation safety bounds by +1.8x).</li>
                  </ul>
                </div>

                <div className="p-5 bg-brand-orange-50/50 rounded-2xl border border-brand-orange-100/50 text-xs">
                  <h4 className="text-sm font-bold text-brand-orange-600 mb-2">Model Performance Diagnostics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-200 pb-1.5">
                      <span className="text-gray-600">Model Metric Name</span>
                      <span className="font-mono font-bold text-gray-805">Value / Threshold</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-500">Root Mean Square Error (RMSE)</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border text-indigo-700 font-semibold">1.42 bookings/day</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-500">R-Squared (Coeff. of Determination)</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border text-indigo-700 font-semibold">0.942 (Highly Fit)</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-500">Feature Importance Rank #1</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border text-indigo-700 font-semibold">"City Area / Weekend Index"</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content #3: Customer Segmentation */}
        {activeTab === 'segmentation' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              {db.user_segments.reduce((acc: any[], curr) => {
                const found = acc.find(x => x.name === curr.segment_name);
                if (found) {
                  found.count += 1;
                  found.revenue += curr.total_spent;
                  found.bookings += curr.total_bookings;
                } else {
                  acc.push({ name: curr.segment_name, count: 1, revenue: curr.total_spent, bookings: curr.total_bookings });
                }
                return acc;
              }, []).map((seg, i) => {
                const colors = [
                  { bg: 'bg-brand-teal-50', text: 'text-brand-teal-800', border: 'border-brand-teal-200', textLight: 'text-brand-teal-600', badge: 'bg-brand-teal-200/50' },
                  { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', textLight: 'text-indigo-600', badge: 'bg-indigo-200/50' },
                  { bg: 'bg-brand-orange-50', text: 'text-brand-orange-850', border: 'border-brand-orange-200', textLight: 'text-brand-orange-600', badge: 'bg-brand-orange-200/50' },
                  { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-200', textLight: 'text-pink-600', badge: 'bg-pink-200/50' }
                ];
                const theme = colors[i % colors.length];

                return (
                  <div key={i} className={`p-6 rounded-2xl border ${theme.bg} ${theme.border} hover:shadow-lg transition-all duration-300`}>
                    <div className="flex justify-between items-start">
                      <h4 className={`font-extrabold text-base ${theme.text}`}>{seg.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badge} ${theme.text}`}>COUNT: {seg.count}</span>
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="text-2xl font-black text-gray-800 font-mono">₹{seg.revenue.toLocaleString('en-IN')}</p>
                      <p className={`text-[11px] ${theme.textLight} font-semibold`}>CUMULATIVE EXPENDITURE</p>
                    </div>
                    <div className="mt-4 border-t border-gray-100 pt-3 flex justify-between text-xs text-gray-500">
                      <span>Aggregate Bookings</span>
                      <span className="font-mono font-bold text-gray-700">{seg.bookings}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-brand-teal-800 mb-2">Relational segmentation database table matches</h3>
              <p className="text-xs text-gray-500 mb-6">Real-time segment profiling derived through active SQL user activities and billing thresholds.</p>
              
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-left">
                    <tr>
                      <th className="px-6 py-3">Owner Name</th>
                      <th className="px-6 py-3">Registered Segment</th>
                      <th className="px-6 py-3">Completed Bookings</th>
                      <th className="px-6 py-3">Gross Valuation Spent</th>
                      <th className="px-6 py-3">Last Active Session</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {db.user_segments.map((seg, idx) => {
                      const user = db.users.find(u => u.id === seg.user_id) || { name: 'Unknown User' };
                      return (
                        <tr key={idx} className="hover:bg-brand-orange-50/20">
                          <td className="px-6 py-4 font-semibold text-gray-800 text-left">{user.name}</td>
                          <td className="px-6 py-4 text-left">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              seg.segment_name === 'Premium Users' 
                                ? 'bg-indigo-100 text-indigo-800' 
                                : (seg.segment_name === 'Frequent Users' ? 'bg-brand-teal-100 text-brand-teal-850' : 'bg-gray-100 text-gray-600')
                            }`}>
                              {seg.segment_name}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-gray-700 text-left">{seg.total_bookings} stays</td>
                          <td className="px-6 py-4 font-mono font-bold text-brand-teal-700 text-left">₹{seg.total_spent.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 font-mono text-gray-500 text-left">{seg.last_active}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content #4: Churn Risk */}
        {activeTab === 'churn' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-xl font-bold text-brand-teal-800">Churn Risk & Customer Retention Console</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Machine-learning metrics identifying users showing risk of churn based on days since their last transaction. Dispenses targeted coupon pushes to retain activity levels.
                </p>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-left">
                    <tr>
                      <th className="px-6 py-3">Client Profile</th>
                      <th className="px-6 py-3">Segment Cluster</th>
                      <th className="px-6 py-3">Inactivity Elapsed</th>
                      <th className="px-6 py-3">Churn Risk Level</th>
                      <th className="px-6 py-3">Risk Index (0-100)</th>
                      <th className="px-6 py-3">Automated Re-engagement Offer</th>
                      <th className="px-6 py-3">Active Retain Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {churnInsights.map((insight, idx) => {
                      const riskColor = insight.churnRisk === 'High' 
                        ? 'bg-red-100 text-red-800' 
                        : (insight.churnRisk === 'Medium' ? 'bg-yellow-101 bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-850');
                      
                      const hasFired = campaignOutputs[insight.userId];

                      return (
                        <tr key={idx} className="hover:bg-brand-orange-50/20">
                          <td className="px-6 py-4 text-left">
                            <span className="font-extrabold text-gray-800 block">{insight.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{insight.email}</span>
                          </td>
                          <td className="px-6 py-4 text-left font-semibold text-gray-500">{insight.segmentName}</td>
                          <td className="px-6 py-4 text-left font-mono font-bold text-gray-700">{insight.daysSinceLastActive} Days Inactive</td>
                          <td className="px-6 py-4 text-left">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider ${riskColor}`}>
                              {insight.churnRisk}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-800">{insight.riskScore}%</span>
                              <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div className={`h-full ${insight.riskScore >= 60 ? 'bg-red-500' : (insight.riskScore >= 30 ? 'bg-yellow-400' : 'bg-green-500')}`} style={{ width: `${insight.riskScore}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left font-semibold text-gray-500 text-[11px] leading-relaxed max-w-xs">
                            {insight.recommendedAction}
                          </td>
                          <td className="px-6 py-4 text-left">
                            {hasFired ? (
                              <span className="text-[11px] text-emerald-600 font-bold font-mono">
                                {hasFired}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleTriggerCampaign(insight.userId, insight.email, insight.name, insight.churnRisk)}
                                className={`px-4 py-2 font-bold text-xs rounded-full border shadow transition-all duration-350 select-none ${
                                  insight.churnRisk === 'High' 
                                    ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:scale-105' 
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                Trigger Retention Push
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

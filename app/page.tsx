"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("All");

  // NEW: State for validation error messages
  const [error, setError] = useState<string | null>(null);

  // NEW: This state tracks if a request is currently in progress
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    const res = await fetch(`/api/expenses?category=${filter}`);
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // NEW: Clear any previous error before starting
    setError(null);

    // NEW: Basic Validation - check for negative/zero amounts
    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    // 1. If we are already loading, STOP here.
    if (loading) return;

    // 2. Start the lock
    setLoading(true);
    
    const requestId = crypto.randomUUID(); 

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: parseFloat(amount), 
          category, 
          description, 
          date,
          requestId 
        }),
      });

      // NEW: Check if the backend sent a 400 error
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save expense");
      }

      setAmount("");
      setDescription("");
      setDate(""); // Clearing date to keep the UI fresh
      await fetchExpenses(); 
      
    } catch (err: any) {
      // NEW: Capture the error to show in the UI
      setError(err.message);
      console.error("Save failed:", err);
    } finally {
      // 3. Unlock the UI after response is received
      setLoading(false);
    }
  };

  const total = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // FIXED: Added explicit type (number) to the accumulator to stop the 'unknown' error
  const categorySummary = expenses.reduce((acc: Record<string, number>, curr) => {
    const cat = curr.category;
    const amt = curr.amount || 0;
    acc[cat] = (acc[cat] || 0) + amt;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="p-8 max-w-2xl mx-auto flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">Add Expense</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 border p-4 rounded shadow-sm">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm mb-2">
              ⚠️ {error}
            </div>
          )}

          <input 
            type="number" 
            placeholder="Amount" 
            required 
            min="0.01" 
            step="0.01"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            className="border p-2 rounded" 
          />
          
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded">
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Bills">Bills</option>
            <option value="Other">Other</option>
          </select>
          
          <input type="text" placeholder="Description" required value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 rounded" />
          
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded" />
          
          <button 
            type="submit" 
            disabled={loading}
            className={`${loading ? 'bg-gray-400 opacity-70 cursor-not-allowed' : 'bg-blue-600'} text-white p-2 rounded font-bold transition-all`}
          >
            {loading ? "Wait until current request is served..." : "Save Expense"}
          </button>
        </form>
      </section>

      <section>
        {/* Summary View Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {Object.entries(categorySummary).map(([cat, amt]) => (
                <div key={cat} className="bg-gray-50 border rounded p-2 text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">{cat}</p>
                    <p className="font-bold text-blue-600">₹{Number(amt).toFixed(2)}</p>
                </div>
            ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">History</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filter:</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-1 rounded text-sm bg-white">
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between mb-4 items-center">
            <p className="text-sm text-gray-500 italic">Showing {expenses.length} items</p>
            <p className="text-lg font-bold text-blue-600">Total: ₹{total.toFixed(2)}</p>
        </div>

        <div className="border rounded divide-y">
          {expenses.length === 0 && <p className="p-4 text-gray-500 text-center">No expenses found.</p>}
          {expenses.map((exp) => (
            <div key={exp.id} className="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-semibold">{exp.description}</p>
                <p className="text-sm text-gray-500">{exp.date} • {exp.category}</p>
              </div>
              <p className="font-bold text-lg">₹{Number(exp.amount).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
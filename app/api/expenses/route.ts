import { NextResponse } from 'next/server';

// This is our in-memory "database"
let expenses: any[] = [];

// NEW: This set keeps track of request IDs we have already processed
const processedRequests = new Set<string>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryFilter = searchParams.get('category');

  let filtered = [...expenses];

  if (categoryFilter && categoryFilter !== 'All') {
    filtered = filtered.filter(exp => exp.category === categoryFilter);
  }

  // Sort by Date (Newest First)
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(filtered);
}


export async function POST(request: Request) {

  const body = await request.json();
  const { amount, category, description, date, requestId } = body;

  // 1. Idempotency Check: Requirement #1 ("behave correctly even if the client retries")
  // If we've seen this requestId before, don't create a second expense.
  if (requestId && processedRequests.has(requestId)) {
    return NextResponse.json({ message: "Duplicate request ignored" }, { status: 200 });
  }

  // 2. Basic Validation: Requirement "Nice to Have" (prevents zero/negative amounts)
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
  }

  // 3. Create the New Expense
  const newExpense = {
    id: Math.random().toString(36).substring(2, 9),
    amount: parseFloat(amount), 
    category,
    description,
    date,
    created_at: new Date().toISOString(), // Adding the missing field from data model
  };

  expenses.push(newExpense);

  // 4. Mark this requestId as processed
  if (requestId) {
    processedRequests.add(requestId);
  }

  return NextResponse.json(newExpense, { status: 201 });
}
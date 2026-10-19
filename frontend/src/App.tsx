import './App.css'
import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Transaction {
  id: number
  description: string
  category: string
  date: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
}

const money = (amount: number) =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)

function App()
{
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [category, setCategory] = useState('FOOD')
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [sortBy, setSortBy] = useState('newest')
  const [activePage, setActivePage] = useState<'overview' | 'reports'>('overview')

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await fetch('/api/transactions')

        if (!response.ok) {
          throw new Error('Failed to load transactions')
        }

        const data: Transaction[] = await response.json()
        setTransactions(data)
      } catch {
        setError('Could not connect to the backend.')
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  async function handleAddTransaction(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    try {
      const isEditing = editingId !== null

      const url = isEditing
          ? `/api/transactions/${editingId}`
          : '/api/transactions'

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          amount: Number(amount),
          type,
          category,
          date,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save transaction')
      }

      const savedTransaction: Transaction = await response.json()

      if (isEditing) {
        setTransactions(previous =>
            previous.map(transaction =>
                transaction.id === editingId ? savedTransaction : transaction
            )
        )
      } else {
        setTransactions(previous => [...previous, savedTransaction])
      }

      setShowAddForm(false)
      setEditingId(null)
      setDescription('')
      setAmount('')
      setType('EXPENSE')
      setCategory('FOOD')
      setFormError('')
    } catch {
      setFormError('Could not save transaction. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTransaction(id: number) {
    const confirmed = window.confirm(
        'Are you sure you want to delete this transaction?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      setTransactions(previous =>
          previous.filter(transaction => transaction.id !== id)
      )
    } catch {
      alert('Could not delete the transaction. Please try again.')
    }
  }

  function handleEditClick(transaction: Transaction) {
    setEditingId(transaction.id)

    setDescription(transaction.description)
    setAmount(String(transaction.amount))
    setType(transaction.type)
    setCategory(transaction.category)
    setDate(transaction.date)

    setFormError('')
    setShowAddForm(true)
  }
  const filteredTransactions = transactions
      .filter(transaction => {
        const matchesSearch = transaction.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())

        const matchesType =
            typeFilter === 'ALL' || transaction.type === typeFilter

        return matchesSearch && matchesType
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return b.date.localeCompare(a.date)

          case 'oldest':
            return a.date.localeCompare(b.date)

          case 'highest':
            return b.amount - a.amount

          case 'lowest':
            return a.amount - b.amount

          default:
            return 0
        }
      })

  const monthlyData = Object.values(
      transactions.reduce<Record<string, {
        month: string
        income: number
        expenses: number
      }>>((acc, transaction) => {
        const month = transaction.date.slice(0, 7)

        if (!acc[month]) {
          acc[month] = {
            month,
            income: 0,
            expenses: 0,
          }
        }

        if (transaction.type === 'INCOME') {
          acc[month].income += transaction.amount
        } else {
          acc[month].expenses += transaction.amount
        }

        return acc
      }, {})
  ).sort((a, b) => a.month.localeCompare(b.month))

  return (
      <div className="app">
        <aside className="sidebar">
          <div className="brand">◈ <span>Finance Tracker</span></div>

          <div className="nav-label">WORKSPACE</div>
          <nav>
            <button
                className={`nav-item ${activePage === 'overview' ? 'active' : ''}`}
                onClick={() => setActivePage('overview')}
            >
              ▦ <span>Overview</span>
            </button>

            <button
                className={`nav-item ${activePage === 'reports' ? 'active' : ''}`}
                onClick={() => setActivePage('reports')}
            >
              ▥ <span>Reports</span>
            </button>
          </nav>

          <div className="sidebar-bottom">Finance Tracker v1.0</div>
        </aside>

        <main className="main">
          <header className="header">
            <div>
              <p className="eyebrow">FINANCIAL DASHBOARD</p>
              <h1>{activePage === 'overview' ? 'Overview' : 'Reports'}</h1>
              <p className="subtitle">Keep track of your money in one place.</p>
            </div>
            <div className="avatar">FT</div>
          </header>

          {activePage === 'overview' ? (
              <>

          <section className="stats">
            <div className="stat-card balance">
              <p>Total balance</p>
              <h2>{money(balance)}</h2>
              <span>Income minus expenses</span>
            </div>

            <div className="stat-card">
              <p>Total income</p>
              <h2 className="income">{money(totalIncome)}</h2>
              <span>↗ Money received</span>
            </div>

            <div className="stat-card">
              <p>Total expenses</p>
              <h2 className="expense">{money(totalExpenses)}</h2>
              <span>↘ Money spent</span>
            </div>
          </section>

          <section className="table-card">
            <div className="table-header">
              <div>
                <h2>Recent transactions</h2>
                <p>Manage your financial activity</p>
              </div>
              <button
                  className="add-button"
                  onClick={() => {
                    setEditingId(null)
                    setDescription('')
                    setAmount('')
                    setType('EXPENSE')
                    setCategory('FOOD')
                    setDate(new Date().toLocaleDateString('en-CA'))
                    setFormError('')
                    setShowAddForm(true)
                  }}
              >
                + Add transaction
              </button>
            </div>

            {loading && (
                <p className="status-message">Loading transactions...</p>
            )}

            {error && (
                <p className="status-message expense">{error}</p>
            )}

            <div className="table-tools">
              <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
              />

              <select
                  value={typeFilter}
                  onChange={e =>
                      setTypeFilter(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE')
                  }
              >
                <option value="ALL">All transactions</option>
                <option value="INCOME">Income only</option>
                <option value="EXPENSE">Expenses only</option>
              </select>
              <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
              </select>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="description">{transaction.description}</td>
                      <td><span className="category">{transaction.category}</span></td>
                      <td>{transaction.date}</td>
                      <td className={transaction.type === 'INCOME' ? 'income' : 'expense'}>
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {money(transaction.amount)}
                      </td>
                      <td>
                        <button
                            className="action-button"
                            onClick={() => handleEditClick(transaction)}
                        >
                          Edit
                        </button>
                        <button
                            className="action-button delete"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </section>

              </>
          ) : (
              <section className="table-card">
                <div className="table-header">
                  <div>
                    <h2>Financial reports</h2>
                    <p>Understand your income, expenses, and spending habits.</p>
                  </div>
                </div>

                <div className="reports-chart">
                  <h3>Monthly income vs expenses</h3>
                  <p>Compare how much you earn and spend each month.</p>

                  {monthlyData.length === 0 ? (
                      <p>No transactions available yet.</p>
                  ) : (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                            data={monthlyData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#2b3648"
                              vertical={false}
                          />

                          <XAxis dataKey="month" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />

                          <Tooltip
                              cursor={{ fill: 'rgba(86, 214, 160, 0.06)' }}
                              formatter={(value) => money(Number(value ?? 0))}
                              contentStyle={{
                                backgroundColor: '#171f2d',
                                border: '1px solid #354258',
                                borderRadius: '8px',
                                color: '#ffffff',
                              }}
                              labelStyle={{
                                color: '#ffffff',
                              }}
                              itemStyle={{
                                color: '#ffffff',
                              }}
                          />

                          <Legend />

                          <Bar
                              dataKey="income"
                              name="Income"
                              fill="#56d6a0"
                              radius={[6, 6, 0, 0]}
                          />

                          <Bar
                              dataKey="expenses"
                              name="Expenses"
                              fill="#f58c91"
                              radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                  )}
                </div>
              </section>
          )}

          {showAddForm && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h2>{editingId !== null ? 'Edit transaction' : 'Add transaction'}</h2>
                    <button
                        className="close-button"
                        onClick={() => setShowAddForm(false)}
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleAddTransaction}>
                    <label>Description</label>
                    <input
                        type="text"
                        placeholder="e.g. Grocery shopping"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    />

                    <label>Amount (€)</label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                    />

                    <label>Type</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value as 'INCOME' | 'EXPENSE')}
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>

                    <label>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="FOOD">Food</option>
                      <option value="RENT">Rent</option>
                      <option value="TRANSPORT">Transport</option>
                      <option value="ENTERTAINMENT">Entertainment</option>
                      <option value="HEALTH">Health</option>
                      <option value="SHOPPING">Shopping</option>
                      <option value="SALARY">Salary</option>
                      <option value="GIFT">Gift</option>
                      <option value="START">Start</option>
                      <option value="GAME">Game</option>
                      <option value="OTHER">Other</option>
                    </select>

                    <label>Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                    />

                    {formError && <p className="expense">{formError}</p>}

                    <div className="modal-actions">
                      <button
                          type="button"
                          className="cancel-button"
                          onClick={() => setShowAddForm(false)}
                          disabled={saving}
                      >
                        Cancel
                      </button>

                      <button
                          type="submit"
                          className="add-button"
                          disabled={saving}
                      >
                        {saving
                            ? 'Saving...'
                            : editingId !== null
                                ? 'Save changes'
                                : 'Save transaction'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
          )}
        </main>
      </div>
  )
}

export default App
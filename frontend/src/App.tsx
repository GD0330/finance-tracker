import './App.css'
import { useEffect, useState } from 'react'

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
  return (
      <div className="app">
        <aside className="sidebar">
          <div className="brand">◈ <span>Finance Tracker</span></div>

          <div className="nav-label">WORKSPACE</div>
          <nav>
            <div className="nav-item active">▦ <span>Overview</span></div>
            <div className="nav-item">⇄ <span>Transactions</span></div>
            <div className="nav-item">▥ <span>Reports</span></div>
          </nav>

          <div className="sidebar-bottom">Finance Tracker v1.0</div>
        </aside>

        <main className="main">
          <header className="header">
            <div>
              <p className="eyebrow">FINANCIAL DASHBOARD</p>
              <h1>Overview</h1>
              <p className="subtitle">Keep track of your money in one place.</p>
            </div>
            <div className="avatar">FT</div>
          </header>

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
                  onClick={() => setShowAddForm(true)}
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
                {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="description">{transaction.description}</td>
                      <td><span className="category">{transaction.category}</span></td>
                      <td>{transaction.date}</td>
                      <td className={transaction.type === 'INCOME' ? 'income' : 'expense'}>
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {money(transaction.amount)}
                      </td>
                      <td>
                        <button className="action-button">Edit</button>
                        <button className="action-button delete">Delete</button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </section>
          {showAddForm && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h2>Add transaction</h2>
                    <button
                        className="close-button"
                        onClick={() => setShowAddForm(false)}
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={(e) => e.preventDefault()}>
                    <label>Description</label>
                    <input type="text" placeholder="e.g. Grocery shopping" />

                    <label>Amount (€)</label>
                    <input type="number" min="0.01" step="0.01" placeholder="0.00" />

                    <label>Type</label>
                    <select>
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>

                    <label>Category</label>
                    <select>
                      <option value="FOOD">Food</option>
                      <option value="HOUSING">Housing</option>
                      <option value="TRANSPORT">Transport</option>
                      <option value="ENTERTAINMENT">Entertainment</option>
                      <option value="HEALTH">Health</option>
                      <option value="SHOPPING">Shopping</option>
                      <option value="SALARY">Salary</option>
                      <option value="GIFT">Gift</option>
                      <option value="OTHER">Other</option>
                    </select>

                    <label>Date</label>
                    <input type="date" />

                    <div className="modal-actions">
                      <button
                          type="button"
                          className="cancel-button"
                          onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="add-button">
                        Save transaction
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
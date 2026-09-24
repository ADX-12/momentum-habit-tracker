'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Goal } from '@/types';

const CATEGORIES = [
  'Health & Fitness', 'Learning', 'Finance', 'Career', 'Personal', 'Relationships', 'Mindfulness', 'Creativity'
];

export default function NewGoalPage() {
  const { addGoal } = useAppStore();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', category_id: '',
    start_date: new Date().toISOString().split('T')[0],
    target_date: '',
    current_value: 0, target_value: 100, unit: '',
    priority: 'medium' as Goal['priority'],
    status: 'active' as Goal['status'],
    notes: '',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.target_date || !form.target_value) {
      toast.error('Please fill in required fields');
      return;
    }
    addGoal(form);
    toast.success('Goal created! 🎯');
    router.push('/goals');
  };

  return (
    <div className="fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/goals" className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Create New Goal</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Define what you want to achieve</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormField label="Goal Title *" hint="What do you want to achieve?">
          <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Save ₹1,00,000" required />
        </FormField>

        <FormField label="Description">
          <textarea className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Why is this goal important to you?" rows={3} style={{ resize: 'vertical' }} />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Category">
            <select className="input" value={form.category_id} onChange={e => set('category_id', e.target.value)} style={{ cursor: 'pointer' }}>
              <option value="">No category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Priority *">
            <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)} style={{ cursor: 'pointer' }}>
              {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Start Date *">
            <input type="date" className="input" value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
          </FormField>
          <FormField label="Target Date *">
            <input type="date" className="input" value={form.target_date} onChange={e => set('target_date', e.target.value)} required />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <FormField label="Current Value">
            <input type="number" className="input" value={form.current_value} onChange={e => set('current_value', Number(e.target.value))} placeholder="0" />
          </FormField>
          <FormField label="Target Value *">
            <input type="number" className="input" value={form.target_value} onChange={e => set('target_value', Number(e.target.value))} placeholder="100" required />
          </FormField>
          <FormField label="Unit">
            <input className="input" value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="₹, kg, books, %" />
          </FormField>
        </div>

        <FormField label="Notes">
          <textarea className="input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes..." rows={2} style={{ resize: 'vertical' }} />
        </FormField>

        {/* Preview */}
        {form.title && form.target_date && (
          <div style={{
            background: 'var(--accent-glow)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 10, padding: 16, fontSize: 13,
          }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-light)', marginBottom: 8 }}>Preview</div>
            <div style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{form.title}</strong>
              {form.unit && ` — Target: ${form.target_value} ${form.unit}`}
              {form.target_date && ` by ${new Date(form.target_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <Link href="/goals" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</Link>
          <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Create Goal 🎯</button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
        {label}
        {hint && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

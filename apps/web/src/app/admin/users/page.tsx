'use client';

import React, { useEffect, useState } from 'react';
import { getUsers, updateUser } from '../../../lib/admin.api';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';

interface User {
  id: string;
  email: string;
  role: 'user' | 'company' | 'admin';
  activationStatus: 'pending' | 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

const roleLabels: Record<User['role'], string> = {
  user: 'User',
  company: 'Company',
  admin: 'Admin',
};

const statusLabels: Record<User['activationStatus'], string> = {
  pending: 'Pending',
  active: 'Active',
  suspended: 'Suspended',
};

export default function AdminUsersPage(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then((response) => setUsers(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  function handleUpdate(id: string, role: User['role'] | '', activationStatus: User['activationStatus']) {
    setSavingId(id);
    setError(null);
    const payload: { role?: Exclude<User['role'], 'admin'>; activationStatus: User['activationStatus'] } = {
      activationStatus,
    };
    if (role && role !== 'admin') {
      payload.role = role;
    }
    updateUser(id, payload)
      .then((response) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === response.data.id
              ? { ...u, role: response.data.role, activationStatus: response.data.activationStatus, updatedAt: response.data.updatedAt }
              : u,
          ),
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to update user'))
      .finally(() => setSavingId(null));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent mb-3">Access</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">Users</h1>
      </header>

      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <p className="text-text-secondary font-body">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="text-text-secondary font-body">No users found.</p>
      ) : (
        <div className="panel overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-bg-secondary border-b border-border">
              <tr className="font-mono text-xs uppercase tracking-wider text-text-secondary">
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <UserRow key={user.id} user={user} saving={savingId === user.id} onUpdate={handleUpdate} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  saving,
  onUpdate,
}: {
  user: User;
  saving: boolean;
  onUpdate: (id: string, role: User['role'] | '', activationStatus: User['activationStatus']) => void;
}): JSX.Element {
  const [role, setRole] = useState<User['role'] | ''>(user.role === 'admin' ? '' : user.role);
  const [status, setStatus] = useState<User['activationStatus']>(user.activationStatus);

  const isAdmin = user.role === 'admin';
  const changed = !isAdmin && (role !== user.role || status !== user.activationStatus);

  return (
    <tr>
      <td className="px-6 py-4 font-body text-text-primary">
        {user.email}
        {isAdmin && <span className="ml-2 font-mono text-xs text-accent">(admin)</span>}
      </td>
      <td className="px-6 py-4">
        {isAdmin ? (
          <span className="text-text-secondary font-body">{roleLabels[user.role]}</span>
        ) : (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as User['role'])}
            disabled={saving}
            className="input-field max-w-[10rem]"
          >
            <option value="user">{roleLabels.user}</option>
            <option value="company">{roleLabels.company}</option>
          </select>
        )}
      </td>
      <td className="px-6 py-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as User['activationStatus'])}
          disabled={saving || isAdmin}
          className="input-field max-w-[10rem]"
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4 text-text-secondary font-mono text-xs">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <button
          type="button"
          onClick={() => onUpdate(user.id, role, status)}
          disabled={saving || !changed || isAdmin}
          className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </td>
    </tr>
  );
}

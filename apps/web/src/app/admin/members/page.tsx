'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Member {
  id: string
  display_name: string
  email: string
  role: 'member' | 'moderator' | 'org_admin'
  status: 'active' | 'suspended' | 'pending'
  joined_at: string
  last_active: string
  help_given: number
  help_received: number
}

// Mock members data
const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    display_name: 'Maria Garcia',
    email: 'maria.g@example.com',
    role: 'org_admin',
    status: 'active',
    joined_at: '2024-01-15',
    last_active: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    help_given: 12,
    help_received: 5,
  },
  {
    id: '2',
    display_name: 'Ben Thompson',
    email: 'ben.t@example.com',
    role: 'moderator',
    status: 'active',
    joined_at: '2024-02-20',
    last_active: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    help_given: 8,
    help_received: 3,
  },
  {
    id: '3',
    display_name: 'Sarah Lee',
    email: 'sarah.l@example.com',
    role: 'member',
    status: 'active',
    joined_at: '2024-03-10',
    last_active: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    help_given: 5,
    help_received: 7,
  },
  {
    id: '4',
    display_name: 'David Kim',
    email: 'david.k@example.com',
    role: 'member',
    status: 'active',
    joined_at: '2024-04-05',
    last_active: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    help_given: 3,
    help_received: 2,
  },
  {
    id: '5',
    display_name: 'Pending User',
    email: 'pending@example.com',
    role: 'member',
    status: 'pending',
    joined_at: '2024-12-20',
    last_active: new Date().toISOString(),
    help_given: 0,
    help_received: 0,
  },
  {
    id: '6',
    display_name: 'Suspended User',
    email: 'suspended@example.com',
    role: 'member',
    status: 'suspended',
    joined_at: '2024-06-01',
    last_active: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    help_given: 1,
    help_received: 0,
  },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

function getRoleBadge(role: Member['role']) {
  switch (role) {
    case 'org_admin':
      return { label: 'Admin', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' }
    case 'moderator':
      return { label: 'Moderator', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }
    default:
      return { label: 'Member', color: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400' }
  }
}

function getStatusBadge(status: Member['status']) {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
    case 'suspended':
      return { label: 'Suspended', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    case 'pending':
      return { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.display_name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleChangeRole = (memberId: string, newRole: Member['role']) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    )
    setSelectedMember(null)
  }

  const handleChangeStatus = (memberId: string, newStatus: Member['status']) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, status: newStatus } : m))
    )
    setSelectedMember(null)
  }

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    pending: members.filter((m) => m.status === 'pending').length,
    suspended: members.filter((m) => m.status === 'suspended').length,
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Members</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Manage community members and their roles
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-2 text-stone-500 mb-1">
            <span className="material-symbols-outlined text-[18px]">group</span>
            <span className="text-sm">Total</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="text-sm">Active</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <span className="material-symbols-outlined text-[18px]">pending</span>
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <span className="material-symbols-outlined text-[18px]">block</span>
            <span className="text-sm">Suspended</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{stats.suspended}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Roles</option>
          <option value="org_admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="member">Member</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Member
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Joined
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Last Active
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Exchange
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {filteredMembers.map((member) => {
                const roleBadge = getRoleBadge(member.role)
                const statusBadge = getStatusBadge(member.status)

                return (
                  <tr key={member.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                          <span className="text-stone-500 font-semibold">
                            {member.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-stone-800 dark:text-stone-100">
                            {member.display_name}
                          </p>
                          <p className="text-sm text-stone-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400">
                      {formatDate(member.joined_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400">
                      {formatTimeAgo(member.last_active)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600" title="Given">
                          ↑ {member.help_given}
                        </span>
                        <span className="text-blue-600" title="Received">
                          ↓ {member.help_received}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                          title="Manage member"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-stone-300 text-[48px] mb-4">
              person_off
            </span>
            <p className="text-stone-500">No members found matching your filters</p>
          </div>
        )}
      </div>

      {/* Member Action Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                Manage Member
              </h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-12 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                  <span className="text-stone-500 font-semibold text-lg">
                    {selectedMember.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-100">
                    {selectedMember.display_name}
                  </p>
                  <p className="text-sm text-stone-500">{selectedMember.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-2 block">
                    Change Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['member', 'moderator', 'org_admin'] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => handleChangeRole(selectedMember.id, role)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedMember.role === role
                            ? 'bg-primary text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                        }`}
                      >
                        {role === 'org_admin' ? 'Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-2 block">
                    Change Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['active', 'pending', 'suspended'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleChangeStatus(selectedMember.id, status)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedMember.status === status
                            ? status === 'suspended'
                              ? 'bg-red-500 text-white'
                              : status === 'pending'
                              ? 'bg-amber-500 text-white'
                              : 'bg-green-500 text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                  <Link
                    href={`/messages?user=${selectedMember.id}`}
                    className="flex items-center gap-2 w-full px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    Send Message
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

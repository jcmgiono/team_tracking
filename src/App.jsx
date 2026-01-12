import { useState, useEffect } from 'react';

const statusConfig = {
  'Not Started': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400', border: 'border-gray-300' },
  'In Progress': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-300' },
  'Blocked': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-300' },
  'Done': { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-300' }
};
const statuses = Object.keys(statusConfig);
const priorities = ['Low', 'Medium', 'High'];

export default function TeamTracker() {
  const [view, setView] = useState('team');
  const [teamView, setTeamView] = useState('cards');
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('teamtracker-members');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Alex Chen', task: 'API integration', status: 'In Progress', priority: 'High', dueDate: '2025-01-15', notes: 'Waiting on backend team' },
      { id: 2, name: 'Sam Rivera', task: 'Design system updates', status: 'In Progress', priority: 'Medium', dueDate: '2025-01-18', notes: '' }
    ];
  });
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('teamtracker-events');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Sprint Planning', date: '2025-01-13', color: 'bg-violet-500' },
      { id: 2, title: 'Design Review', date: '2025-01-16', color: 'bg-blue-500' }
    ];
  });
  const [teamNotes, setTeamNotes] = useState(() => localStorage.getItem('teamtracker-notes') || '');

  useEffect(() => { localStorage.setItem('teamtracker-members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('teamtracker-events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('teamtracker-notes', teamNotes); }, [teamNotes]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({ title: '', date: '', color: 'bg-violet-500' });
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', task: '', status: 'Not Started', priority: 'Medium', dueDate: '', notes: '' });
  const [editingMember, setEditingMember] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  const addMember = () => {
    if (!newMember.name.trim()) return;
    setMembers([...members, { ...newMember, id: Date.now() }]);
    setNewMember({ name: '', task: '', status: 'Not Started', priority: 'Medium', dueDate: '', notes: '' });
    setShowAddMember(false);
  };

  const updateMember = (id, field, value) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMember = (id) => setMembers(members.filter(m => m.id !== id));

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setNewEvent({ title: '', date: '', color: 'bg-violet-500' });
    setShowEventForm(false);
  };

  const removeEvent = (id) => setEvents(events.filter(e => e.id !== id));

  const filteredMembers = members
    .filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.task.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
      const matchesPriority = filterPriority === 'All' || m.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') return statuses.indexOf(a.status) - statuses.indexOf(b.status);
      if (sortBy === 'priority') return priorities.indexOf(b.priority) - priorities.indexOf(a.priority);
      if (sortBy === 'dueDate') return (a.dueDate || 'z').localeCompare(b.dueDate || 'z');
      return 0;
    });

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { events: events.filter(e => e.date === dateStr), tasks: members.filter(m => m.dueDate === dateStr) };
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="h-28 bg-gray-50"></div>);
    for (let day = 1; day <= days; day++) {
      const { events: dayEvents, tasks } = getEventsForDate(day);
      cells.push(
        <div key={day} className={`h-28 border-t border-gray-200 p-2 ${isToday(day) ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 transition`}>
          <div className={`text-sm font-semibold mb-1.5 ${isToday(day) ? 'text-blue-600' : 'text-gray-700'}`}>
            {isToday(day) ? <span className="bg-blue-600 text-white w-7 h-7 rounded-full inline-flex items-center justify-center">{day}</span> : day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayEvents.slice(0, 2).map(e => <div key={e.id} className={`${e.color} text-white text-xs px-2 py-1 rounded font-medium truncate`}>{e.title}</div>)}
            {tasks.slice(0, 2 - dayEvents.length).map(t => <div key={t.id} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-medium truncate">📌 {t.name}</div>)}
            {(dayEvents.length + tasks.length) > 2 && <div className="text-xs text-gray-500 font-medium">+{dayEvents.length + tasks.length - 2} more</div>}
          </div>
        </div>
      );
    }
    return cells;
  };

  const colorOptions = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-red-500', 'bg-amber-500'];

  const PriorityBadge = ({ priority }) => (
    <span className={`text-xs font-semibold ${priority === 'High' ? 'text-red-600' : priority === 'Medium' ? 'text-amber-600' : 'text-gray-400'}`}>
      {priority === 'High' ? '🔥' : priority === 'Medium' ? '⚡' : '○'} {priority}
    </span>
  );

  const StatusBadge = ({ status }) => (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[status].bg} ${statusConfig[status].text}`}>
      {status}
    </span>
  );

  const Avatar = ({ name, size = 'md' }) => {
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-14 h-14 text-lg' };
    return (
      <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0`}>
        {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>
    );
  };

  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
      {filteredMembers.map(member => (
        <div key={member.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${statusConfig[member.status].border} hover:shadow-md transition`}>
          <div className="flex items-start gap-4">
            <Avatar name={member.name} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <input type="text" value={member.name} onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                  className="text-lg font-bold text-gray-800 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none" />
                <button onClick={() => removeMember(member.id)} className="bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition p-2 rounded-lg border border-gray-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Working on</label>
                <input type="text" placeholder="What are they working on?" value={member.task} onChange={(e) => updateMember(member.id, 'task', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-gray-200" />
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Status</label>
                  <select value={member.status} onChange={(e) => updateMember(member.id, 'status', e.target.value)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusConfig[member.status].bg} ${statusConfig[member.status].text} border ${statusConfig[member.status].border}`}>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Priority</label>
                  <select value={member.priority} onChange={(e) => updateMember(member.id, 'priority', e.target.value)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 bg-white ${member.priority === 'High' ? 'text-red-600' : member.priority === 'Medium' ? 'text-amber-600' : 'text-gray-500'}`}>
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Due Date</label>
                  <input type="date" value={member.dueDate} onChange={(e) => updateMember(member.id, 'dueDate', e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Notes</label>
                <input type="text" placeholder="Add notes..." value={member.notes} onChange={(e) => updateMember(member.id, 'notes', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-gray-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-5 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Member</th>
            <th className="text-left px-5 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Task</th>
            <th className="text-left px-5 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
            <th className="text-left px-5 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Priority</th>
            <th className="text-left px-5 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Due Date</th>
            <th className="text-left px-5 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Notes</th>
            <th className="px-5 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredMembers.map(member => (
            <tr key={member.id} className="hover:bg-gray-50 transition">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} size="sm" />
                  <input type="text" value={member.name} onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                    className="font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none" />
                </div>
              </td>
              <td className="px-5 py-4">
                <input type="text" value={member.task} onChange={(e) => updateMember(member.id, 'task', e.target.value)} placeholder="Add task..."
                  className="w-full text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none" />
              </td>
              <td className="px-5 py-4">
                <select value={member.status} onChange={(e) => updateMember(member.id, 'status', e.target.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer focus:outline-none ${statusConfig[member.status].bg} ${statusConfig[member.status].text}`}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-5 py-4">
                <select value={member.priority} onChange={(e) => updateMember(member.id, 'priority', e.target.value)}
                  className={`bg-transparent cursor-pointer focus:outline-none text-sm font-semibold ${member.priority === 'High' ? 'text-red-600' : member.priority === 'Medium' ? 'text-amber-600' : 'text-gray-400'}`}>
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </td>
              <td className="px-5 py-4">
                <input type="date" value={member.dueDate} onChange={(e) => updateMember(member.id, 'dueDate', e.target.value)}
                  className="text-gray-600 bg-transparent focus:outline-none cursor-pointer" />
              </td>
              <td className="px-5 py-4">
                <input type="text" value={member.notes} onChange={(e) => updateMember(member.id, 'notes', e.target.value)} placeholder="Notes..."
                  className="w-full text-gray-500 text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none" />
              </td>
              <td className="px-5 py-4">
                <button onClick={() => removeMember(member.id)} className="bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition p-1 rounded border border-gray-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredMembers.length === 0 && <div className="p-12 text-center text-gray-400">No team members found</div>}
    </div>
  );

  const BoardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {statuses.map(status => (
        <div key={status} className="bg-gray-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusConfig[status].dot}`}></div>
              <h3 className="font-bold text-gray-700">{status}</h3>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusConfig[status].bg} ${statusConfig[status].text}`}>
              {filteredMembers.filter(m => m.status === status).length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredMembers.filter(m => m.status === status).map(member => (
              <div key={member.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer" onClick={() => setEditingMember(member)}>
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{member.name}</div>
                    <div className="text-sm text-gray-500 truncate">{member.task || 'No task assigned'}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <PriorityBadge priority={member.priority} />
                  {member.dueDate && <span className="text-xs text-gray-400">{member.dueDate.split('-').slice(1).join('/')}</span>}
                </div>
                {member.notes && <div className="mt-2 text-xs text-gray-400 truncate border-t border-gray-100 pt-2">{member.notes}</div>}
              </div>
            ))}
            {filteredMembers.filter(m => m.status === status).length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">No members</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const CompactView = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
      {filteredMembers.map(member => (
        <div key={member.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition">
          <Avatar name={member.name} size="sm" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-gray-800">{member.name}</span>
            <span className="text-gray-400 mx-2">—</span>
            <span className="text-gray-600">{member.task || 'No task'}</span>
          </div>
          <PriorityBadge priority={member.priority} />
          <StatusBadge status={member.status} />
          {member.dueDate && <span className="text-sm text-gray-400">{member.dueDate}</span>}
          <button onClick={() => setEditingMember(member)} className="bg-white text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1 rounded border border-gray-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={() => removeMember(member.id)} className="bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded border border-gray-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      {filteredMembers.length === 0 && <div className="p-12 text-center text-gray-400">No team members found</div>}
    </div>
  );

  const teamViews = [
    { id: 'cards', icon: '▦', label: 'Cards' },
    { id: 'table', icon: '☰', label: 'Table' },
    { id: 'board', icon: '▣', label: 'Board' },
    { id: 'compact', icon: '≡', label: 'Compact' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Team Tracker</h1>
              <p className="text-gray-500">Keep track of your team's work</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-xl p-1.5">
                {[{v: 'team', icon: '👥', label: 'Team'}, {v: 'calendar', icon: '📅', label: 'Calendar'}].map(({v, icon, label}) => (
                  <button key={v} onClick={() => setView(v)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${view === v ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'}`}>
                    {icon} {label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAddMember(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-sm">
                + Add Member
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {view === 'team' ? (
          <div className="space-y-5">
            {/* Filters */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-64">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Search</span>
                  <input type="text" placeholder="Search by name or task..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {['All', ...statuses].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</span>
                  <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {['All', ...priorities].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sort</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {['name', 'status', 'priority', 'dueDate'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex rounded-lg p-1 ml-auto border border-gray-200 bg-white">
                  {teamViews.map(tv => (
                    <button key={tv.id} onClick={() => setTeamView(tv.id)} title={tv.label}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition ${teamView === tv.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                      {tv.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statuses.map(status => (
                <button key={status} onClick={() => setFilterStatus(filterStatus === status ? 'All' : status)}
                  className={`p-4 rounded-xl border-2 transition ${filterStatus === status ? statusConfig[status].border + ' ' + statusConfig[status].bg : 'border-transparent bg-white'} hover:shadow-md`}>
                  <div className={`text-3xl font-bold ${statusConfig[status].text}`}>{members.filter(m => m.status === status).length}</div>
                  <div className="text-sm text-gray-600 font-medium">{status}</div>
                </button>
              ))}
            </div>

            {teamView === 'cards' && <CardView />}
            {teamView === 'table' && <TableView />}
            {teamView === 'board' && <BoardView />}
            {teamView === 'compact' && <CompactView />}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📝 Team Notes</h2>
              <textarea placeholder="Meeting notes, decisions, blockers, announcements..." value={teamNotes} onChange={(e) => setTeamNotes(e.target.value)} rows={4}
                className="w-full px-4 py-4 bg-gray-50 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none border border-gray-200 focus:bg-white" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
              <button onClick={prevMonth} className="p-3 hover:bg-white rounded-xl transition shadow-sm bg-white border border-gray-200">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-xl font-bold text-gray-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button onClick={nextMonth} className="p-3 hover:bg-white rounded-xl transition shadow-sm bg-white border border-gray-200">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-7">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-3 text-center text-sm font-bold text-gray-600 bg-gray-50 border-b border-gray-200">{d}</div>
              ))}
              {renderCalendar()}
            </div>
            <div className="p-5 border-t border-gray-200 bg-gray-50">
              {showEventForm ? (
                <div className="flex gap-3 items-end flex-wrap bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex-1 min-w-48">
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Event Title</label>
                    <input type="text" placeholder="Event name" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Date</label>
                    <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Color</label>
                    <div className="flex gap-2 py-1.5">
                      {colorOptions.map(c => (
                        <button key={c} onClick={() => setNewEvent({...newEvent, color: c})}
                          className={`w-8 h-8 rounded-lg ${c} ${newEvent.color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <button onClick={addEvent} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Add</button>
                  <button onClick={() => setShowEventForm(false)} className="px-4 py-2.5 text-gray-500 font-medium hover:text-gray-700">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowEventForm(true)} className="text-blue-600 font-semibold hover:text-blue-700">+ Add Event</button>
              )}
            </div>
            
            {/* Event List */}
            {events.length > 0 && (
              <div className="p-5 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">All Events</h3>
                <div className="flex flex-wrap gap-2">
                  {events.sort((a, b) => a.date.localeCompare(b.date)).map(e => (
                    <div key={e.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 group">
                      <div className={`w-3 h-3 rounded-full ${e.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{e.title}</span>
                      <span className="text-xs text-gray-400">{e.date}</span>
                      <button onClick={() => removeEvent(e.id)} className="bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded border border-gray-200 ml-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {(showAddMember || editingMember) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowAddMember(false); setEditingMember(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-800 mb-5">{editingMember ? 'Edit Member' : 'Add Team Member'}</h2>
            <div className="space-y-4">
              {[
                { label: 'Name *', field: 'name', type: 'text', placeholder: 'Full name' },
                { label: 'Task', field: 'task', type: 'text', placeholder: 'What will they work on?' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">{label}</label>
                  <input type={type} placeholder={placeholder}
                    value={editingMember ? editingMember[field] : newMember[field]}
                    onChange={(e) => editingMember ? setEditingMember({...editingMember, [field]: e.target.value}) : setNewMember({...newMember, [field]: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Status</label>
                  <select value={editingMember ? editingMember.status : newMember.status}
                    onChange={(e) => editingMember ? setEditingMember({...editingMember, status: e.target.value}) : setNewMember({...newMember, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Priority</label>
                  <select value={editingMember ? editingMember.priority : newMember.priority}
                    onChange={(e) => editingMember ? setEditingMember({...editingMember, priority: e.target.value}) : setNewMember({...newMember, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Due Date</label>
                <input type="date" value={editingMember ? editingMember.dueDate : newMember.dueDate}
                  onChange={(e) => editingMember ? setEditingMember({...editingMember, dueDate: e.target.value}) : setNewMember({...newMember, dueDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Notes</label>
                <input type="text" placeholder="Additional notes"
                  value={editingMember ? editingMember.notes : newMember.notes}
                  onChange={(e) => editingMember ? setEditingMember({...editingMember, notes: e.target.value}) : setNewMember({...newMember, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowAddMember(false); setEditingMember(null); }} className="px-5 py-2.5 text-gray-600 font-semibold hover:text-gray-800">Cancel</button>
              <button onClick={() => {
                if (editingMember) {
                  setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
                  setEditingMember(null);
                } else {
                  addMember();
                }
              }} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                {editingMember ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
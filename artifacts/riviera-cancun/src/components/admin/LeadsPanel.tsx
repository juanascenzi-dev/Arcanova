import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListLeads, getListLeadsQueryKey, type Lead } from '@workspace/api-client-react';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { MessageSquare, User, Calendar, X } from 'lucide-react';

export function LeadsPanel() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leads = [], isLoading } = useListLeads({
    headers: {
      'x-admin-token': (import.meta.env.VITE_ADMIN_PIN as string) || 'austral2025',
    },
  });

  const filtered = leads.filter(lead => {
    if (statusFilter && lead.status !== statusFilter) return false;
    return true;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '💬';
      case 'email': return '✉️';
      case 'facebook': return 'f';
      default: return '📧';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'discarded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'Nuevo',
      contacted: 'Contactado',
      closed: 'Cerrado',
      discarded: 'Descartado',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-brand-navy/50">Cargando leads...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-brand-navy mb-6">Leads y contactos</h2>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            statusFilter === null
              ? 'bg-brand-gold text-brand-navy'
              : 'bg-white border border-brand-navy/15 text-brand-navy/60 hover:border-brand-navy'
          }`}
        >
          Todos ({leads.length})
        </button>

        {['new', 'contacted', 'closed', 'discarded'].map(status => {
          const count = leads.filter(l => l.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status === statusFilter ? null : status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === status
                  ? `${getStatusColor(status)}`
                  : 'bg-white border border-brand-navy/15 text-brand-navy/60 hover:border-brand-navy'
              }`}
            >
              {getStatusLabel(status)} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-brand-navy/5">
          <MessageSquare className="w-12 h-12 text-brand-navy/20 mx-auto mb-4" />
          <p className="text-brand-navy/60">No hay leads con estos filtros</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <button
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className="w-full text-left p-4 bg-white rounded-xl border border-brand-navy/5 hover:border-brand-gold hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getChannelIcon(lead.channel)}</span>
                    <div>
                      <p className="font-bold text-brand-navy text-sm">{lead.experienceTitle}</p>
                      <p className="text-xs text-brand-navy/50">
                        {formatDistanceToNow(new Date(lead.createdAt), {
                          locale: lead.lang === 'es' ? es : enUS,
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  {lead.messageSnapshot && (
                    <p className="text-xs text-brand-navy/60 line-clamp-1 mb-2">{lead.messageSnapshot}</p>
                  )}
                  <div className="flex gap-2 flex-wrap text-xs">
                    {lead.people && (
                      <span className="flex items-center gap-1 text-brand-navy/50">
                        <User className="w-3 h-3" /> {lead.people} persona{lead.people !== 1 ? 's' : ''}
                      </span>
                    )}
                    {lead.tentativeDate && (
                      <span className="flex items-center gap-1 text-brand-navy/50">
                        <Calendar className="w-3 h-3" /> {new Date(lead.tentativeDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-brand-navy/50">🌐 {lead.lang.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lead detail modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}

function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [newStatus, setNewStatus] = useState(lead.status);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const pin = (import.meta.env.VITE_ADMIN_PIN as string) || 'austral2025';

  async function handleStatusChange() {
    if (newStatus === lead.status) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': pin,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
        onClose();
      }
    } catch (err) {
      console.error('Failed to update lead:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-brand-navy/10 sticky top-0 bg-white flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-navy">Detalle del lead</h3>
          <button onClick={onClose} className="text-brand-navy/40 hover:text-brand-navy">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Experience */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50 mb-2">Experiencia</p>
            <p className="text-lg font-bold text-brand-navy">{lead.experienceTitle}</p>
            <p className="text-xs text-brand-navy/50 mt-1">ID: {lead.experienceId}</p>
          </div>

          {/* Contact details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50 mb-2">Canal</p>
              <p className="text-sm font-bold text-brand-navy">{lead.channel.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50 mb-2">Idioma</p>
              <p className="text-sm font-bold text-brand-navy">{lead.lang === 'en' ? 'English' : 'Español'}</p>
            </div>
          </div>

          {/* Details */}
          {lead.people && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50 mb-2">Personas</p>
              <p className="text-sm font-bold text-brand-navy">{lead.people}</p>
            </div>
          )}

          {lead.tentativeDate && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50 mb-2">Fecha tentativa</p>
              <p className="text-sm font-bold text-brand-navy">{new Date(lead.tentativeDate).toLocaleDateString()}</p>
            </div>
          )}

          {lead.messageSnapshot && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/50 mb-2">Mensaje</p>
              <p className="text-sm text-brand-navy/80">{lead.messageSnapshot}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-brand-light p-4 rounded-xl space-y-2 text-xs">
            <p>
              <span className="text-brand-navy/50">Recibido: </span>
              <span className="font-bold text-brand-navy">{new Date(lead.createdAt).toLocaleString()}</span>
            </p>
            <p>
              <span className="text-brand-navy/50">Actualizado: </span>
              <span className="font-bold text-brand-navy">{new Date(lead.updatedAt).toLocaleString()}</span>
            </p>
          </div>

          {/* Status change */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-navy/50 block mb-2">
              Cambiar estado
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-brand-navy/15 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            >
              <option value="new">Nuevo</option>
              <option value="contacted">Contactado</option>
              <option value="closed">Cerrado</option>
              <option value="discarded">Descartado</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-bold border border-brand-navy/15 rounded-lg hover:border-brand-navy/30 transition-colors"
            >
              Cerrar
            </button>
            {newStatus !== lead.status && (
              <button
                onClick={handleStatusChange}
                disabled={saving}
                className="flex-1 px-4 py-2 text-sm font-bold bg-brand-gold text-brand-navy rounded-lg hover:bg-brand-navy hover:text-white transition-colors disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

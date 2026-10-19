import React from 'react';
import { X, MapPin, Phone, Mail, Globe, User, Building2, ArrowUpRight } from 'lucide-react';

export default function MemberModal({ member, onClose }) {
  if (!member) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B192C]/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E0D5] rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D5] flex items-center justify-between bg-[#FBF9F5]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#083476]">
            {member.category || 'Mitgliedsbetrieb'} · {member.city || 'Weser-Aue'}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-[#E5E0D5] bg-white hover:bg-[#F3EFE6] text-[#0B192C]"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-[#E5E0D5]">
            <div className="w-28 h-24 rounded-xl border border-[#E5E0D5] bg-[#FBF9F5] p-3 flex items-center justify-center shrink-0">
              {member.logo ? (
                <img
                  src={member.logo}
                  alt={member.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Building2 className="w-8 h-8 text-[#083476]/40" strokeWidth={1.5} />
              )}
            </div>

            <div>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#0B192C] leading-tight">
                {member.name}
              </h2>
              {Array.isArray(member.tags) && member.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {member.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-0.5 rounded bg-[#F3EFE6] text-[#0B192C]/75 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {member.description && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0B192C]/50 mb-2">
                Über das Unternehmen & Leistungen
              </h3>
              <p className="text-sm sm:text-base text-[#0B192C]/80 leading-relaxed whitespace-pre-line bg-[#FBF9F5] p-4 rounded-xl border border-[#E5E0D5]">
                {member.description}
              </p>
            </div>
          )}

          {/* Kontaktdaten */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {member.contactPerson && (
              <div className="p-4 rounded-xl border border-[#E5E0D5] bg-white flex items-start gap-3">
                <User className="w-4 h-4 text-[#083476] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <div className="text-xs text-[#0B192C]/50">Ansprechpartner</div>
                  <div className="font-semibold text-[#0B192C]">{member.contactPerson}</div>
                </div>
              </div>
            )}

            {member.address && (
              <div className="p-4 rounded-xl border border-[#E5E0D5] bg-white flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#083476] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <div className="text-xs text-[#0B192C]/50">Anschrift</div>
                  <div className="font-medium text-[#0B192C] whitespace-pre-line">
                    {member.address}
                  </div>
                </div>
              </div>
            )}

            {member.phone && (
              <div className="p-4 rounded-xl border border-[#E5E0D5] bg-white flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#083476] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <div className="text-xs text-[#0B192C]/50">Telefon</div>
                  <a
                    href={`tel:${member.phone.replace(/[^0-9+]/g, '')}`}
                    className="font-semibold text-[#083476] hover:underline"
                  >
                    {member.phone}
                  </a>
                </div>
              </div>
            )}

            {member.email && (
              <div className="p-4 rounded-xl border border-[#E5E0D5] bg-white flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#083476] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="min-w-0">
                  <div className="text-xs text-[#0B192C]/50">E-Mail</div>
                  <a
                    href={`mailto:${member.email}`}
                    className="font-semibold text-[#083476] hover:underline break-all"
                  >
                    {member.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          {member.website && (
            <div className="pt-2">
              <a
                href={
                  member.website.startsWith('http')
                    ? member.website
                    : `https://${member.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 rounded-xl bg-[#083476] hover:bg-[#0B192C] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Globe className="w-4 h-4" strokeWidth={1.5} />
                <span>Website besuchen ({member.website.replace(/^https?:\/\//, '')})</span>
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

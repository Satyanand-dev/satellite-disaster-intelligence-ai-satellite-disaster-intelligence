/** Navigation config — shared by Sidebar and Breadcrumb. */

const s = { className: 'h-4.5 w-4.5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const Icons = {
  dashboard: (
    <svg {...s}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  upload: (
    <svg {...s}>
      <path d="M12 16V4m0 0L7 9m5-5 5 5" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  ),
  activity: (
    <svg {...s}>
      <path d="M3 12h4l3 8 4-16 3 8h4" />
    </svg>
  ),
  radar: (
    <svg {...s}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12 19 5" />
    </svg>
  ),
  waves: (
    <svg {...s}>
      <path d="M2 6c1.5 0 1.5 1.5 3 1.5S6.5 6 8 6s1.5 1.5 3 1.5S12.5 6 14 6s1.5 1.5 3 1.5S18.5 6 20 6" />
      <path d="M2 12c1.5 0 1.5 1.5 3 1.5S6.5 12 8 12s1.5 1.5 3 1.5S12.5 12 14 12s1.5 1.5 3 1.5S18.5 12 20 12" />
      <path d="M2 18c1.5 0 1.5 1.5 3 1.5S6.5 18 8 18s1.5 1.5 3 1.5S12.5 18 14 18s1.5 1.5 3 1.5S18.5 18 20 18" />
    </svg>
  ),
  compare: (
    <svg {...s}>
      <path d="M12 3v18" />
      <path d="M8 7H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3" />
      <path d="M16 7h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3" />
    </svg>
  ),
  building: (
    <svg {...s}>
      <rect x="4" y="3" width="10" height="18" rx="1" />
      <path d="M14 8h5a1 1 0 0 1 1 1v11" />
      <path d="M7 7h1M7 11h1M7 15h1M11 7h1M11 11h1M11 15h1" />
    </svg>
  ),
  risk: (
    <svg {...s}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17v.01" />
    </svg>
  ),
  report: (
    <svg {...s}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  ),
  logout: (
    <svg {...s}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  ),
  bell: (
    <svg {...s}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  layers: (
    <svg {...s}>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
    </svg>
  ),
}

/**
 * to: string (static) | function(eventId) (needs an active event)
 */
export const NAV_ITEMS = [
  {
    section: 'Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
      { id: 'upload', label: 'Satellite Upload', to: '/upload', icon: 'upload' },
      { id: 'processing', label: 'Processing', to: (id) => `/processing/${id}`, requiresEvent: true, icon: 'activity' },
    ],
  },
  {
    section: 'Analysis',
    items: [
      { id: 'analysis', label: 'Disaster Analysis', to: (id) => `/analysis/${id}`, requiresEvent: true, icon: 'radar' },
      { id: 'indices', label: 'NDVI / NDWI', to: (id) => `/indices/${id}`, requiresEvent: true, icon: 'waves' },
      { id: 'change', label: 'Change Detection', to: (id) => `/change/${id}`, requiresEvent: true, icon: 'compare' },
      { id: 'infrastructure', label: 'Infrastructure', to: (id) => `/infrastructure/${id}`, requiresEvent: true, icon: 'building' },
    ],
  },
  {
    section: 'Decision Support',
    items: [
      { id: 'risk', label: 'Risk Map', to: (id) => `/risk/${id}`, requiresEvent: true, icon: 'risk' },
      { id: 'report', label: 'AI Situation Report', to: (id) => `/report/${id}`, requiresEvent: true, icon: 'report' },
    ],
  },
]

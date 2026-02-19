type IconProps = { size?: number }

const icon = (path: React.ReactNode, size = 18, strokeWidth = 1.5) =>
  function Icon({ size: s = size }: IconProps) {
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {path}
      </svg>
    )
  }

export const HomeIcon = icon(
  <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
)

export const SparkIcon = icon(
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
)

export const NotebookIcon = icon(
  <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></>,
)

export const PlusIcon = icon(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>, 16, 2)

export const SearchIcon = icon(<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>, 15, 2)

export const ChatIcon = icon(
  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  20,
)

export const ChevronRightIcon = icon(<polyline points="9 18 15 12 9 6" />, 14, 2)

export const ChevronDownIcon = icon(<polyline points="6 9 12 15 18 9" />, 14, 2)

export const XIcon = icon(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>, 16, 2)

export const InboxIcon = icon(
  <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" /></>,
)

export const PanelRightIcon = icon(
  <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="15" y1="3" x2="15" y2="21" /></>,
  16,
)

export const SendIcon = icon(
  <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
  16,
  2,
)

export const UploadIcon = icon(
  <><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" /></>,
  16,
  2,
)

export const GridIcon = icon(
  <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  16,
)

export const ListIcon = icon(
  <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
  16,
)

export const MindmapIcon = icon(
  <><circle cx="12" cy="12" r="3" /><circle cx="4" cy="6" r="2" /><circle cx="20" cy="6" r="2" /><circle cx="4" cy="18" r="2" /><circle cx="20" cy="18" r="2" /><line x1="9.5" y1="10" x2="5.5" y2="7.5" /><line x1="14.5" y1="10" x2="18.5" y2="7.5" /><line x1="9.5" y1="14" x2="5.5" y2="16.5" /><line x1="14.5" y1="14" x2="18.5" y2="16.5" /></>,
  16,
)

export const ClockIcon = icon(
  <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  13,
  2,
)

export const BranchIcon = icon(
  <><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 01-9 9" /></>,
  14,
  2,
)

export const EnhanceIcon = icon(
  <path d="M12 2L9.5 8.5 2 12l7.5 3.5L12 22l2.5-6.5L22 12l-7.5-3.5z" />,
  16,
)

export const HistoryIcon = icon(
  <><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /></>,
  14,
  2,
)

export const SaveIcon = icon(
  <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
  14,
  2,
)

export const ArrowLeftIcon = icon(
  <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
  16,
  2,
)

export const LinkIcon = icon(
  <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></>,
  13,
  2,
)

export const FolderIcon = icon(
  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />,
  14,
)

export const BoldIcon = icon(
  <><path d="M6 4h8a4 4 0 010 8H6z" /><path d="M6 12h9a4 4 0 010 8H6z" /></>,
  16,
  2,
)

export const ItalicIcon = icon(
  <><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></>,
  16,
  2,
)

export const Heading1Icon = icon(
  <><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></>,
  16,
  2,
)

export const ListBulletIcon = icon(
  <><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><line x1="4" y1="6" x2="4.01" y2="6" /><line x1="4" y1="12" x2="4.01" y2="12" /><line x1="4" y1="18" x2="4.01" y2="18" /></>,
  16,
  2,
)

export const CodeIcon = icon(
  <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  16,
  2,
)

export const TrashIcon = icon(
  <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" /></>,
  16,
  2,
)

export const EditIcon = icon(
  <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
  16,
  2,
)

export const CheckIcon = icon(
  <polyline points="20 6 9 17 4 12" />,
  16,
  2,
)

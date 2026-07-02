export type MatchStatus = "pending" | "live" | "finished";

type MatchStatusBadgeProps = {
  status: MatchStatus;
  corrected?: boolean;
};

const STATUS_LABEL: Record<MatchStatus, string> = {
  pending: "Belum Mulai",
  live: "Live",
  finished: "Selesai",
};

const STATUS_TEXT_CLASS: Record<MatchStatus, string> = {
  pending: "text-status-pending",
  live: "text-status-live",
  finished: "text-status-finished",
};

export function MatchStatusBadge({ status, corrected = false }: MatchStatusBadgeProps) {
  const isLive = status === "live";

  return (
    <span
      data-testid="match-status-badge"
      data-status={status}
      className={
        isLive
          ? "inline-flex items-center gap-1 rounded-sm bg-status-live-bg px-2 py-1 text-xs font-semibold text-status-live"
          : `inline-flex items-center gap-1 text-xs ${STATUS_TEXT_CLASS[status]}`
      }
    >
      {STATUS_LABEL[status]}
      {status === "finished" && corrected ? (
        <span className="text-status-corrected">(Dikoreksi)</span>
      ) : null}
    </span>
  );
}

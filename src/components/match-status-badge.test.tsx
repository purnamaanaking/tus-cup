import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MatchStatusBadge } from "./match-status-badge";

describe("MatchStatusBadge", () => {
  it("renders the prominent live treatment for status live", () => {
    render(<MatchStatusBadge status="live" />);
    const badge = screen.getByTestId("match-status-badge");
    expect(badge).toHaveAttribute("data-status", "live");
    expect(badge.className).toContain("bg-status-live-bg");
    expect(badge.className).toContain("text-status-live");
  });

  it("renders a plain label for status pending", () => {
    render(<MatchStatusBadge status="pending" />);
    const badge = screen.getByTestId("match-status-badge");
    expect(badge).toHaveAttribute("data-status", "pending");
    expect(badge.className).not.toContain("bg-status-live-bg");
  });

  it("renders a plain label for status finished", () => {
    render(<MatchStatusBadge status="finished" />);
    const badge = screen.getByTestId("match-status-badge");
    expect(badge).toHaveAttribute("data-status", "finished");
    expect(badge.className).not.toContain("bg-status-live-bg");
  });

  it("pending and finished badges are visually distinct from the live treatment", () => {
    const { unmount } = render(<MatchStatusBadge status="live" />);
    const liveClasses = screen.getByTestId("match-status-badge").className;
    unmount();

    render(<MatchStatusBadge status="pending" />);
    const pendingClasses = screen.getByTestId("match-status-badge").className;

    expect(pendingClasses).not.toBe(liveClasses);
  });

  it("does not render a corrected label for a finished match when corrected flag is omitted", () => {
    render(<MatchStatusBadge status="finished" />);
    expect(screen.queryByText(/dikoreksi/i)).not.toBeInTheDocument();
  });

  it("does not render a corrected label for a finished match when corrected is explicitly false", () => {
    render(<MatchStatusBadge status="finished" corrected={false} />);
    expect(screen.queryByText(/dikoreksi/i)).not.toBeInTheDocument();
  });

  it("renders a corrected label only when corrected is explicitly true", () => {
    render(<MatchStatusBadge status="finished" corrected />);
    expect(screen.getByText(/dikoreksi/i)).toBeInTheDocument();
  });
});

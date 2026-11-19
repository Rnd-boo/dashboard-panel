/** Format recorded_at to HH:mm */
export function formatTime(recorded_at: string) {
  return new Date(recorded_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

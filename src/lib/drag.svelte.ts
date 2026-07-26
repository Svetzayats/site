interface DragState {
  code: string;
  sourceScale: string | null;
  x: number;
  y: number;
  hoveredScale: string | null;
}

export const dragState: { current: DragState | null } = $state({
  current: null,
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function trackAt(x: number, y: number): HTMLElement | null {
  const el = document.elementFromPoint(x, y);
  return el?.closest<HTMLElement>("[data-guess-track]") ?? null;
}

export function startDrag(
  code: string,
  sourceScale: string | null,
  e: PointerEvent,
  commit: (scale: string, code: string, position: number) => void,
  uncommit: (scale: string, code: string) => void,
) {
  e.preventDefault();

  dragState.current = {
    code,
    sourceScale,
    x: e.clientX,
    y: e.clientY,
    hoveredScale: null,
  };

  function onMove(ev: PointerEvent) {
    if (!dragState.current) return;
    const track = trackAt(ev.clientX, ev.clientY);
    dragState.current = {
      ...dragState.current,
      x: ev.clientX,
      y: ev.clientY,
      hoveredScale: track?.dataset.scaleTitle ?? null,
    };
  }

  function onUp(ev: PointerEvent) {
    const track = trackAt(ev.clientX, ev.clientY);
    const scaleTitle = track?.dataset.scaleTitle;

    if (track && scaleTitle) {
      const rect = track.getBoundingClientRect();
      const position = clamp(
        ((ev.clientX - rect.left) / rect.width) * 100,
        0,
        100,
      );
      if (sourceScale && sourceScale !== scaleTitle) {
        uncommit(sourceScale, code);
      }
      commit(scaleTitle, code, position);
    }

    dragState.current = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

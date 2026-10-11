/** Fixed grain + one soft brand wash at the top: breaks the flat canvas without heavy layers. */
export function LandingAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="ui-grain absolute inset-0" />
      <div
        className="absolute -top-40 left-1/2 h-[40rem] w-[56rem] -translate-x-1/2 rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in srgb, var(--landing-cta) 16%, transparent), transparent)',
        }}
      />
    </div>
  );
}

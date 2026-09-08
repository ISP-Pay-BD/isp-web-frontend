'use client';

/** Fixed grain + soft brand wash — breaks flat digital canvas without heavy shaders. */
export function LandingAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="ui-grain absolute inset-0" />
      <div
        className="absolute -top-32 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--landing-cta) 18%, transparent) 0%, transparent 68%)',
        }}
      />
      <div
        className="absolute top-[40%] -right-40 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, #2E8BFF 14%, transparent) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-[-10%] h-[22rem] w-[36rem] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, #1a0b38 80%, transparent) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

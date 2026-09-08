/**
 * Meaningful stock photography for marketing landing.
 * Unsplash CDN — ISP / network / ops / payments context (not random seeds).
 */

const u = (id: string, w: number, h?: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=80`;

export const landingMedia = {
  heroAtmosphere: u('photo-1451187580459-43490279c0fa', 1920), // earth network / global connectivity
  heroInlineRack: u('photo-1558494949-ef010cbdcc31', 320, 160), // server rack
  features: [
    u('photo-1544197150-b99a580bb7a2', 1200), // fiber / ethernet cables
    u('photo-1558494949-ef010cbdcc31', 1200), // data center rack
    u('photo-1477959858617-67f85cf4f1df', 1200), // city skyline night
    u('photo-1556742049-0cfed4f6a45d', 1200), // mobile payment
    u('photo-1551434678-e076c223a6922', 1200), // ops team at screens
  ],
  desire: [
    u('photo-1550751827-4bd374c3f58b', 1400), // NOC / security monitors
    u('photo-1563013544-824ae1b704d3', 1400), // digital wallet / pay
    u('photo-1524661135-423995f22d0b', 1400), // map / territory
    u('photo-1512941937669-90a1b58e7e9c', 1400), // phone / self-care app
  ],
  howItWorks: [
    u('photo-1551703599-6b3e8379cd2a', 900), // network hardware
    u('photo-1460925895917-afdab827c52f', 900), // spreadsheet / import desk
    u('photo-1556742049-0cfed4f6a45d', 900), // payments
    u('photo-1551434678-e076c223a6922', 900), // live ops
  ],
  reconcile: [
    u('photo-1512941937669-90a1b58e7e9c', 900), // SMS on phone
    u('photo-1551288049-bebda4e38f71', 900), // analytics match
    u('photo-1544197150-b99a580bb7a2', 900), // reconnect / cable
  ],
  portraits: [
    u('photo-1507003211169-0a1dd7228f2d', 200, 200),
    u('photo-1472099645785-5658abf4ff4e', 200, 200),
    u('photo-1438761681033-6461ffad8d80', 200, 200),
    u('photo-1500648767791-00dcc994a43e', 200, 200),
    u('photo-1519345182560-3f2917c472ef', 200, 200),
    u('photo-1506794778202-cad84cf45f1d', 200, 200),
    u('photo-1544005313-94ddf0286df2', 200, 200),
    u('photo-1534528741775-53994a69daeb', 200, 200),
  ],
} as const;

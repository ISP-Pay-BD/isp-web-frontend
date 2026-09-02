export interface VoiceMessage {
  id: string;
  name: string;
  providerId: string;
  durationSeconds: number;
  addedOn: string;
  audioSampleUrl?: string;
  transcript: string;
}

export interface VoiceBroadcast {
  id: string;
  voiceMsgId: string;
  voiceMsgName: string;
  areaName: string;
  recipientsCount: number;
  status: 'completed' | 'broadcasting' | 'queued' | 'failed';
  initiatedAt: string;
  notes?: string;
}

export const voiceGatewaysData: string[] = [
  'mimsms_voice',
  'btcl_voice_trunk',
  'metronet_ivr',
  'robi_voice_broadcast',
];

export const voiceMessagesData: VoiceMessage[] = [
  {
    id: 'vm_01',
    name: 'Monthly Bill Reminder - Audio',
    providerId: 'PROV-VM-901',
    durationSeconds: 28,
    addedOn: '2026-08-10',
    transcript: 'Dear customer, your ISP internet bill is due. Please clear your dues before 10th to enjoy seamless connectivity.',
  },
  {
    id: 'vm_02',
    name: 'Emergency Outage Announcement',
    providerId: 'PROV-VM-902',
    durationSeconds: 35,
    addedOn: '2026-08-22',
    transcript: 'Dear subscriber, upstream fiber maintenance is currently underway. Our engineering team expects full recovery within two hours.',
  },
  {
    id: 'vm_03',
    name: 'Service Disconnection Warning',
    providerId: 'PROV-VM-903',
    durationSeconds: 20,
    addedOn: '2026-09-01',
    transcript: 'Important notice from your ISP: Your line is scheduled for suspension tomorrow due to unpaid invoices. Please pay via bKash immediately.',
  },
];

export const voiceBroadcastsData: VoiceBroadcast[] = [
  {
    id: 'vb_001',
    voiceMsgId: 'vm_01',
    voiceMsgName: 'Monthly Bill Reminder - Audio',
    areaName: 'All Areas',
    recipientsCount: 320,
    status: 'completed',
    initiatedAt: '2026-09-01T11:00:00',
    notes: 'September 1st automated voice blast',
  },
  {
    id: 'vb_002',
    voiceMsgId: 'vm_02',
    voiceMsgName: 'Emergency Outage Announcement',
    areaName: 'Sector 3 (Uttara)',
    recipientsCount: 45,
    status: 'completed',
    initiatedAt: '2026-08-28T14:30:00',
    notes: 'Feeder loop cut near North Tower',
  },
];

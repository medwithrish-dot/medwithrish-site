export const groupStations = [
  { id: "motivation", title: "Why medicine?" },
  { id: "work-experience", title: "Work experience" },
  { id: "ethics-access", title: "Disability and access to medicine" },
  { id: "ethics-edi", title: "Equality, diversity and inclusion" },
  { id: "hot-topic", title: "Ozempic and weight-management medicines" },
] as const;

export type StudyGroup = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  memberCount: number;
};

export type GroupMember = {
  userId: string;
  name: string;
  joinedAt: string;
  groupScore: null;
  whyMedicineScore: number | null;
};

export type GroupRoom = {
  id: string;
  stationId: string;
  title: string;
  questions: string[];
  status: "lobby" | "active" | "completed";
  durationSeconds: number;
  createdAt: string;
  startedAt: string | null;
  endsAt: string | null;
};

export type GroupAnswer = {
  userId: string;
  name: string;
  text: string;
  updatedAt: string;
};

export type GroupMessage = {
  id: string;
  userId: string;
  name: string;
  text: string;
  createdAt: string;
};

export type GroupList = { userId: string; groups: StudyGroup[]; serverTime: string };

export type GroupDetail = {
  userId: string;
  group: StudyGroup;
  members: GroupMember[];
  rooms: GroupRoom[];
  room: GroupRoom | null;
  answers: GroupAnswer[];
  messages: GroupMessage[];
  serverTime: string;
};

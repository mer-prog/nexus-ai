export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  createdAt: string;
}

export interface TeamResponse {
  members: TeamMember[];
  currentUserId: string;
  currentUserRole: string;
}

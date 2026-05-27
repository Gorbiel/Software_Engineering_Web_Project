export type TeamMember = {
  name: string;
  role: string;
};

export type Team = {
  name: string;
  members: TeamMember[];
};

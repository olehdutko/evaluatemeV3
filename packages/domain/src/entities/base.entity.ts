export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

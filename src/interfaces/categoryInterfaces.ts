import { IImage } from "./default";

export interface ICategory {
  name: string;
  type: "JOB" | "BUSINESS";
  image: IImage;
  status: "Active" | "Inactive";
  visibility: "Show" | "Hide";
  isDeleted: boolean;
  deletedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

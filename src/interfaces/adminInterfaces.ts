export interface IAdmin {
    name: string;
    email: string;
    phone: string;
    role: "SuperAdmin" | "Admin" |  "Developer";
    password?: string;
    autoGeneratedPasswd: boolean;
    resetPasswordAccess: boolean;
    address?: string;
    pincode?: string;
    status: string;
    lastSync: string | Date;
    lastUsed: string | Date;
    isDeleted: boolean;
    deletedAt?: string | Date;
    createdAt: string | Date;
    updatedAt: string | Date;
} 




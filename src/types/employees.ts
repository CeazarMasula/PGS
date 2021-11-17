import { Document } from 'mongoose';
import { ID } from './node';

export enum AccountRole{
    MEMBER = 'MEMBER',
    HR = 'HR',
    ADMIN = 'ADMIN'
}

export enum Status{
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}


export default interface Employees extends Document {
    id: ID;
    firstName: string;
    lastName: string;
    role: AccountRole;
    department: ID;
    status: Status;
    address: string;
    baseSalary: number;
    email: string;
    account: string;
    bank: string
}

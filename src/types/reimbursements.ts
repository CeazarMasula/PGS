import { Document } from 'mongoose';
import { ID } from './node';

export default interface Reimbursements extends Document {
    id: ID;
    name: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}

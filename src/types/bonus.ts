import { Document } from 'mongoose';
import { ID } from './node';

export default interface Bonus extends Document {
    id: ID;
    name: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}

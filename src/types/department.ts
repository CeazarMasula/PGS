import { Document } from 'mongoose';
import { ID } from './node';

export default interface Departments extends Document {
    id: ID;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

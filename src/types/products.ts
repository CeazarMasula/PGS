import { Document } from 'mongoose';

export default interface Products extends Document {
    id:Buffer;
    name: string;
    description: string;
    ownerId: Buffer;
    cursor: Buffer;
    createdAt:Date;
    updatedAt:Date;
}

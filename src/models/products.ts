import Mongoose, { Schema } from 'mongoose';
import IProducts from '../types/products';

const ProductSchema: Schema = new Schema(
    {
        id: { type: Buffer, required: true, unique: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        ownerId: { type: Buffer, required: true },
        cursor:{type: Buffer, required: true }
    },
    {
        timestamps: true
    }
);

export default Mongoose.model<IProducts>('Products', ProductSchema);

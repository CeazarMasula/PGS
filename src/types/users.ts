import { Document } from 'mongoose';

export default interface User extends Document{
    id:Buffer;
    firstname: string;
    lastname: string;
    password: string;
    emailAddress:string
}

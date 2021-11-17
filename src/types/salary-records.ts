import { Document } from 'mongoose';
import { ID } from './node';

export default interface SalaryRecords extends Document {
    id: ID;
    employee: ID;
    payrollDate: Date;
    payPeriodStartDate: Date,
    payPeriodEndDate: Date,
    netPay: number;
    grossPay: number;
    deductions?: ID[] | null;
    reimbursements?: ID[] | null;
    bonuses?: ID[] | null;
    depositDate: Date
}

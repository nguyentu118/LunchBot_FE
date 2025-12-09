import * as Yup from 'yup';

export const approvalValidationSchema = Yup.object({
    approved: Yup.boolean().required(),
    reason: Yup.string()
        .required('Vui lòng nhập lý do')
        .min(10, 'Lý do phải có ít nhất 10 ký tự')
        .max(500, 'Lý do không được vượt quá 500 ký tự')
});
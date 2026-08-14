import { z } from 'zod';

export const adoptionSchema = z.object({
	name: z.string().min(2, 'Name is too short'),
	email: z.string().email('Invalid email address'),
	phone: z.string().min(7, 'Invalid phone number'),
	animal: z.string().min(1, 'Animal name is required'),
	message: z.string().min(10, 'Please tell us a bit more about yourself')
});

export type AdoptionForm = z.infer<typeof adoptionSchema>;

import { z } from "zod";

export const stepOneSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    phone: z.string().min(10, { message: "Please enter a valid phone number." }),
    tourliveEmail: z.string().email({ message: "Invalid email address." }),
    contactEmail: z.string().email({ message: "Invalid email address." }),
    activityType: z.string().min(1, { message: "Please select an activity type." }),
    nickname: z.string().min(2, { message: "Nickname must be at least 2 characters." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const stepTwoSchema = z.object({
    travelCountry: z.string().min(2, { message: "Please enter a country." }),
    travelCity: z.string().min(2, { message: "Please enter a city." }),
    hashtag1: z.string().min(2, { message: "Required" }),
    hashtag2: z.string().min(2, { message: "Required" }),
    hashtag3: z.string().min(2, { message: "Required" }),
    bannerImage: z.any() // File handling logic will go here
        .refine((files) => files?.length == 1, "Image is required.")
});

export const formSchema = stepOneSchema.merge(stepTwoSchema);

export type FormValues = z.infer<typeof formSchema>;

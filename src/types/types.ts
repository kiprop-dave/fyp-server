import { z } from "zod";

// Create a schema for the reading
const ReadingSchema = z.object({
  timestamp: z.date(),
  reading: z.object({
    sensorOne: z.object({
      temperature: z.number(),
      humidity: z.number(),
    }),
    sensorTwo: z.object({
      temperature: z.number(),
      humidity: z.number(),
    }),
  }),
});

const AdminSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

type Reading = z.infer<typeof ReadingSchema>;
type Admin = z.infer<typeof AdminSchema>;

export { Reading, Admin, ReadingSchema, AdminSchema };

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

const loginSchema = AdminSchema.pick({ email: true, password: true });

const status = z.union([z.literal("ideal"), z.literal("warning"), z.literal("critical")]);

const unit = z.union([z.literal("AVIAN"), z.literal("REPTILE")]);

const problem = z.union([z.literal("temperature"), z.literal("humidity")]);

const readingStatus = z.object({
  state: status,
  message: z.union([z.string(), z.literal(null)]),
});

const range = z.object({
  idealMin: z.number(),
  idealMax: z.number(),
  warningMin: z.number(),
  warningMax: z.number(),
});

const enclosureStatus = z.object({
  enclosure: unit,
  condition: problem,
  state: status,
  value: z.number(),
});

const smsResponse = z.object({
  error: z.boolean(),
  sent: z.union([z.literal("YES"), z.literal("NO")]),
});

type Reading = z.infer<typeof ReadingSchema>;
type Admin = z.infer<typeof AdminSchema>;
type Status = z.infer<typeof status>;
type Unit = z.infer<typeof unit>;
type Problem = z.infer<typeof problem>;
type ReadingStatus = z.infer<typeof readingStatus>;
type BadReadingStatus = Exclude<Status, "ideal">;
type Range = z.infer<typeof range>;
type SmsResponse = z.infer<typeof smsResponse>;
type EnclosureStatus = z.infer<typeof enclosureStatus>;

export {
  Reading,
  Admin,
  ReadingSchema,
  AdminSchema,
  loginSchema,
  Status,
  Unit,
  Problem,
  ReadingStatus,
  BadReadingStatus,
  Range,
  SmsResponse,
  EnclosureStatus,
};

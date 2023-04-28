import { z } from "zod";

const decision = z.union([
  z.literal("ideal"),
  z.literal("warning"),
  z.literal("critical"),
  z.literal(""),
]);

const unit = z.union([z.literal("avian"), z.literal("reptilian"), z.literal("")]);

const problem = z.union([z.literal("temperature"), z.literal("humidity"), z.literal("")]);

const enclosureProblem = z.tuple([unit, problem]);

// Create a schema for the reading
export const MqttReadingSchema = z.object({
  timestamp: z.date(),
  status: z.object({
    decision: decision,
    enclosure: enclosureProblem,
  }),
  avian: z.object({
    temperature: z.number(),
    humidity: z.number(),
  }),
  reptilian: z.object({
    temperature: z.number(),
    humidity: z.number(),
  }),
});

export const mqttMesageSchema = z.object({
  status: z.object({
    decision: decision,
    enclosure: enclosureProblem,
  }),
  avian: z.object({
    temperature: z.number(),
    humidity: z.number(),
  }),
  reptilian: z.object({
    temperature: z.number(),
    humidity: z.number(),
  }),
});

export const dbReadingSchema = z.object({
  timestamp: z.date(),
  reading: z.object({
    avian: z.object({
      temperature: z.number(),
      humidity: z.number(),
    }),
    reptilian: z.object({
      temperature: z.number(),
      humidity: z.number(),
    }),
  }),
});

export const AdminSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const loginSchema = AdminSchema.pick({ email: true, password: true });

const smsResponse = z.object({
  error: z.boolean(),
  sent: z.union([z.literal("YES"), z.literal("NO")]),
});

export type MqttReading = z.infer<typeof MqttReadingSchema>;
export type Reading = z.infer<typeof dbReadingSchema>;
export type Admin = z.infer<typeof AdminSchema>;
export type Unit = z.infer<typeof unit>;
export type Problem = z.infer<typeof problem>;
export type SmsResponse = z.infer<typeof smsResponse>;
export type Decision = z.infer<typeof decision>;

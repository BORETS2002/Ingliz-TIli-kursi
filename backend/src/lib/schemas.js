const { z } = require("zod");

const registrationCreateSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().min(7).max(24),
  course: z.string().min(1).max(120),
  note: z.string().max(500).optional().default(""),
});

const registrationStatusSchema = z.object({
  status: z.enum(["new", "check", "time", "not"]),
});

const adminLoginSchema = z.object({
  username: z.string().min(1).max(80),
  password: z.string().min(1).max(200),
});

const contentPatchSchema = z.object({
  entries: z.record(z.string().min(1).max(100), z.string().max(20_000)),
});

module.exports = {
  registrationCreateSchema,
  registrationStatusSchema,
  adminLoginSchema,
  contentPatchSchema,
};


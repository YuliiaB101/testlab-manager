import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6)
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export const meSchema = z.object({
    userId: z.number().int().positive()
});

export const machinesQuerySchema = z.object({
    search: z.string().default("")
});

export const reservationSchema = z.object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    sessionName: z.string().min(2).max(80),
    setupOptions: z.object({
        osVersion: z.string().optional(),
        tools: z.array(z.string()).optional(),
        flags: z.array(z.string()).optional()
    }).optional(),
    testPlan: z.string().optional()
});

export const notificationSchema = z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    status: z.enum(["info", "warning", "error", "success"]).optional()
});

export const testRunSchema = z.object({
    machineId: z.number().int().positive(),
    testIds: z.array(z.number().int()).default([]),
    estimatedDuration: z.number().int().positive().optional()
});

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive()
});

export const lockMachineQuerySchema = z.object({
    force: z.enum(["true", "false"]).optional().default("false")
});

export const reservationsQuerySchema = z.object({
  machineId: z.coerce.number().int().positive().optional(),
  status: z.enum(["pending", "active", "completed", "cancelled"]).optional()
});

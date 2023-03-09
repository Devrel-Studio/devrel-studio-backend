import Prisma from "@prisma/client";

// PrismaClient is not available when testing
const { PrismaClient } = Prisma || {};
const prisma = PrismaClient ? new PrismaClient() : {};

export const User = prisma.user;
export const Measurement = prisma.measurement;
export const Organisation = prisma.organisation;
export const Project = prisma.project;
export const Source = prisma.source;
export const Event = prisma.event;

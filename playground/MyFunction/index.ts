import { initTRPC } from '@trpc/server';
import { z } from "zod";
import { createHttpTriggerFunction } from '../../src';

const t = initTRPC.create();
const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
    greet: publicProcedure
        .input(z.object({ name: z.string() }))
        .query(({ input, ctx }) => {
            return `Greetings, ${input.name}.`;
        }),
});

export type AppRouter = typeof appRouter;

export default createHttpTriggerFunction({
    router: appRouter
});

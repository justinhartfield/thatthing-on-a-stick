import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const toolkitRouter = router({
  /**
   * Get toolkit markdown for download
   */
  getToolkit: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getBrandProjectById(input.projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      if (project.userId !== ctx.user.id) {
        throw new Error('Unauthorized');
      }
      
      if (!project.toolkitPdfUrl) {
        throw new Error('Toolkit not yet generated');
      }
      
      return {
        markdown: project.toolkitPdfUrl,
        projectName: project.name,
      };
    }),
});

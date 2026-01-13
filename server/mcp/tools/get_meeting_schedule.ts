import { z } from 'zod'

export default defineMcpTool({
  annotations: {
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
    readOnlyHint: true
  },
  cache: '4w',
  description: 'Get the meeting schedule for a specific week and year.',
  handler: async ({ langcode, week, year }) => {
    const result = await meetingService.getMeetingSchedule(
      langcode,
      week && year ? { week, year } : undefined
    )

    return mcpService.toolResult(JSON.stringify(result, null, 2))
  },
  inputSchema: {
    langcode: z
      .enum(jwLangCodes)
      .meta({
        description:
          'The language code for the schedule. Example: E for English, O for Dutch, S for Spanish. See JW Languages for the full list.',
        examples: ['E', 'O', 'S']
      })
      .optional(),
    week: weekSchema,
    year: yearSchema
  }
})

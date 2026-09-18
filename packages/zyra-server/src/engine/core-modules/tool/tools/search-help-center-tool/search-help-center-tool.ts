import { Injectable } from '@nestjs/common';

import { isAxiosError } from 'axios';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { SearchHelpCenterInputZodSchema } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool.schema';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

@Injectable()
export class SearchHelpCenterTool implements Tool {
  description =
    'Search Zyra documentation and help center to find information about features, setup, usage, and troubleshooting.';
  inputSchema = SearchHelpCenterInputZodSchema;

  constructor(
    private readonly zyraConfigService: ZyraConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async execute(
    parameters: ToolInput,
    _context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { query } = parameters;

    try {
      const MINTLIFY_API_KEY = this.zyraConfigService.get('MINTLIFY_API_KEY');
      const MINTLIFY_SUBDOMAIN =
        this.zyraConfigService.get('MINTLIFY_SUBDOMAIN');

      // Mintlify's search API requires a key, and there is no public fallback
      // proxy of our own in front of it (zyra-help-search.com was never
      // registered — this fork's rebrand renamed the upstream Twenty domain
      // in text only). Fail clearly instead of calling a domain that could
      // later be squatted.
      if (!MINTLIFY_API_KEY || !MINTLIFY_SUBDOMAIN) {
        return {
          success: false,
          message: `Help center search is not configured for "${query}"`,
          error:
            'MINTLIFY_API_KEY and MINTLIFY_SUBDOMAIN must be set to enable help center search.',
        };
      }

      const httpClient = this.secureHttpClientService.getHttpClient();

      const response = await httpClient.post(
        `https://api-dsc.mintlify.com/v1/search/${MINTLIFY_SUBDOMAIN}`,
        { query, pageSize: 10 },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${MINTLIFY_API_KEY}`,
          },
        },
      );

      const results = response.data;

      if (results.length === 0) {
        return {
          success: true,
          message: `No help center articles found for "${query}"`,
          result: [],
        };
      }

      return {
        success: true,
        message: `Found ${results.length} relevant help center article${results.length === 1 ? '' : 's'} for "${query}"`,
        result: results,
      };
    } catch (error) {
      const errorDetail = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Help center search failed';

      return {
        success: false,
        message: `Failed to search help center for "${query}"`,
        error: errorDetail,
      };
    }
  }
}
